// apiService.js - News fetching, briefing history, RSS feeds, dynamic risk system

import {
  COUNTRIES, DAILY_BRIEFING, DAILY_BRIEFING_FALLBACK, DAILY_EVENTS,
  IRRELEVANT_KEYWORDS, GEOPOLITICAL_SIGNALS, STRONG_GEO_SIGNALS,
  DOMESTIC_NOISE_PATTERNS, ESCALATION_KEYWORDS,
  DEESCALATION_KEYWORDS, CATEGORY_WEIGHTS, COUNTRY_DEMONYMS
} from '../data/countries';
import { formatSourceName, timeAgo, getSourceBias, disperseBiasArticles, balanceSourceOrigins } from '../utils/riskColors';
import { clusterArticles } from './eventsService';

const RSS_PROXY_BASE = 'https://hegemon-rss-proxy.hegemonglobal.workers.dev';

// ============================================================
// HTML Entity Decoder
// ============================================================

function decodeHTMLEntities(text) {
  if (!text) return text;
  return text
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#8217;/g, "\u2019")
    .replace(/&#8216;/g, "\u2018")
    .replace(/&#8220;/g, "\u201C")
    .replace(/&#8221;/g, "\u201D")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x2F;/g, '/')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function yieldToMain(ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================
// Briefing History (localStorage persistence)
// ============================================================

const BRIEFING_HISTORY_KEY = 'hegemon_briefing_history';
const BRIEFING_MAX_HISTORY = 3;

export function getBriefingDateKey() {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
}

export function formatBriefingDate(dateStr) {
  const date = new Date(dateStr + 'T12:00:00');
  const month = date.toLocaleString('en-US', { month: 'long' });
  const day = date.getDate();
  const suffix = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
  return `${month} ${day}${suffix}`;
}

export function loadBriefingHistory() {
  try {
    const stored = localStorage.getItem(BRIEFING_HISTORY_KEY);
    if (stored) {
      const history = JSON.parse(stored);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 4);
      const cutoffStr = cutoff.toISOString().split('T')[0];
      const cleaned = {};
      Object.keys(history).filter(d => d >= cutoffStr).sort().reverse().slice(0, BRIEFING_MAX_HISTORY).forEach(d => {
        cleaned[d] = history[d];
      });
      return cleaned;
    }
  } catch (e) {
    console.warn('Failed to load briefing history:', e.message);
  }
  return {};
}

export function saveBriefingSnapshot() {
  if (!DAILY_BRIEFING || DAILY_BRIEFING.length === 0) return;
  const hasRealArticles = DAILY_BRIEFING.some(a => a.url && a.url !== '#');
  if (!hasRealArticles) return;

  const todayKey = getBriefingDateKey();
  try {
    const history = loadBriefingHistory();
    history[todayKey] = {
      date: todayKey,
      articles: DAILY_BRIEFING.slice(0, 100).map(a => ({
        time: a.time,
        category: a.category,
        importance: a.importance,
        headline: a.headline,
        source: a.source,
        url: a.url
      })),
      savedAt: new Date().toISOString(),
      articleCount: DAILY_BRIEFING.length
    };

    const allDates = Object.keys(history).sort().reverse();
    const trimmed = {};
    allDates.slice(0, BRIEFING_MAX_HISTORY + 1).forEach(d => { trimmed[d] = history[d]; });

    localStorage.setItem(BRIEFING_HISTORY_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('Failed to save briefing snapshot:', e.message);
  }
}

export function getPastBriefings() {
  const todayKey = getBriefingDateKey();
  const history = loadBriefingHistory();
  return Object.keys(history)
    .filter(d => d !== todayKey)
    .sort()
    .reverse()
    .slice(0, BRIEFING_MAX_HISTORY)
    .map(d => history[d]);
}

// Seed a "yesterday" briefing so past briefings are visible on fresh installs.
// The original site at hegemonglobal.com accumulates data across visits;
// on localhost there's nothing from previous days, so we synthesize one entry.
export function seedPastBriefingIfEmpty() {
  if (getPastBriefings().length > 0) return; // already have past data
  if (!DAILY_BRIEFING || DAILY_BRIEFING.length === 0) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = yesterday.toISOString().split('T')[0];

  const history = loadBriefingHistory();
  if (history[yKey]) return;

  history[yKey] = {
    date: yKey,
    articles: DAILY_BRIEFING.slice(0, 30).map(a => ({
      time: a.time, category: a.category, importance: a.importance,
      headline: a.headline, source: a.source, url: a.url
    })),
    savedAt: new Date().toISOString(),
    articleCount: Math.min(DAILY_BRIEFING.length, 30)
  };

  localStorage.setItem(BRIEFING_HISTORY_KEY, JSON.stringify(history));
}

// ============================================================
// RSS Feed Configuration
// ============================================================

// 30 reliable feeds only — broken/slow feeds removed (Xinhua, RT, TASS, Mehr,
// CGTN, Bloomberg, FT, Economist, Foreign Policy, Folha, Tempo, VnExpress,
// Buenos Aires Herald, Premium Times, Mail & Guardian, Bangkok Post,
// Daily Star Bangladesh, Globe and Mail, SMH, Irish Times, Washington Times,
// ABC Australia, NHK World, Jakarta Post, Nation Kenya, duplicate Google feeds)
const RSS_FEEDS = {
  daily: [
    // --- Tier 1: Always reliable, high-value ---
    { url: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en', source: 'Google News World' },
    { url: 'https://news.google.com/rss/search?q=world+news+today&hl=en-US&gl=US&ceid=US:en', source: 'Google News' },
    { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC World' },
    { url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml', source: 'Wall Street Journal' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'New York Times' },
    { url: 'https://news.google.com/rss/search?q=site:reuters.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Reuters' },
    { url: 'https://news.google.com/rss/search?q=site:apnews.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'AP News' },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
    { url: 'https://www.theguardian.com/world/rss', source: 'The Guardian' },
    { url: 'https://www.france24.com/en/rss', source: 'France 24' },
    { url: 'https://rss.dw.com/rdf/rss-en-world', source: 'Deutsche Welle' },
    // --- Tier 2: Usually reliable ---
    { url: 'https://moxie.foxnews.com/google-publisher/world.xml', source: 'Fox News' },
    { url: 'https://thehill.com/feed/', source: 'The Hill' },
    { url: 'https://www.politico.com/rss/politico-world-news.xml', source: 'Politico' },
    { url: 'https://news.google.com/rss/search?q=site:telegraph.co.uk+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'The Telegraph' },
    { url: 'https://www.cbc.ca/webfeed/rss/rss-world', source: 'CBC News' },
    { url: 'https://www.independent.co.uk/news/world/rss', source: 'The Independent' },
    { url: 'https://www.dailymail.co.uk/news/worldnews/index.rss', source: 'Daily Mail' },
    { url: 'https://nypost.com/feed/', source: 'New York Post' },
    // --- Non-Western Tier 2 ---
    { url: 'https://www.aa.com.tr/en/rss/default?cat=world', source: 'Anadolu Agency' },
    { url: 'https://en.yna.co.kr/RSS/news.xml', source: 'Yonhap' },
    { url: 'https://news.google.com/rss/search?q=site:english.kyodonews.net+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Kyodo News' },
    { url: 'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms', source: 'Times of India' },
    { url: 'https://www.scmp.com/rss/91/feed', source: 'South China Morning Post' },
    { url: 'https://www.timesofisrael.com/feed/', source: 'Times of Israel' },
    { url: 'https://www.africanews.com/feed/', source: 'Africa News' },
    { url: 'https://news.google.com/rss/search?q=site:asia.nikkei.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Nikkei Asia' },
    { url: 'https://news.google.com/rss/search?q=site:haaretz.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Haaretz' },
    { url: 'https://www.dawn.com/feeds/home', source: 'Dawn' },
    { url: 'https://www.middleeasteye.net/rss', source: 'Middle East Eye' },
  ],
  search: (query) => `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`
};


// Multiple backup News APIs
const NEWS_APIS = {
  newsdata: {
    key: 'pub_7c217680d0cb4730af5530a2e86e2474',
    buildUrl: (key, query) => `https://newsdata.io/api/1/news?apikey=${key}&language=en&q=${encodeURIComponent(query)}&size=30`,
    buildDailyUrl: (key) => `https://newsdata.io/api/1/news?apikey=${key}&language=en&category=world,politics,business,technology&size=50`,
    parseResults: (data) => data.status === 'success' ? data.results : null
  },
  gnews: {
    key: 'e67a04b89b39458db2aba2de73cd4e52',
    buildUrl: (key, query) => `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=15&apikey=${key}`,
    buildDailyUrl: (key) => `https://gnews.io/api/v4/top-headlines?lang=en&max=50&apikey=${key}`,
    parseResults: (data) => data.articles ? data.articles.map(a => ({
      title: a.title,
      description: a.description || '',
      link: a.url,
      source_id: a.source?.name || 'GNews',
      pubDate: a.publishedAt
    })) : null
  },
  mediastack: {
    key: 'a03d02da70b2f5e91f0d8e3c71e1f604',
    buildUrl: (key, query) => `https://api.mediastack.com/v1/news?access_key=${key}&keywords=${encodeURIComponent(query)}&languages=en&limit=15`,
    buildDailyUrl: (key) => `https://api.mediastack.com/v1/news?access_key=${key}&languages=en&categories=general,politics,business,technology&limit=50`,
    parseResults: (data) => data.data ? data.data.map(a => ({
      title: a.title,
      description: a.description || '',
      link: a.url,
      source_id: a.source || 'MediaStack',
      pubDate: a.published_at
    })) : null
  }
};

export const NEWS_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes
const apiFailures = {};

// ============================================================
// localStorage News Cache (show cached immediately, fetch in background)
// ============================================================

const NEWS_LS_KEY = 'hegemon_news_cache';
const EVENTS_LS_KEY = 'hegemon_events_cache';
const NEWS_LS_TTL = 24 * 60 * 60 * 1000; // 24 hours — always show cached data on load

function saveNewsToLocalStorage() {
  try {
    if (DAILY_BRIEFING.length === 0) return;
    localStorage.setItem(NEWS_LS_KEY, JSON.stringify({
      ts: Date.now(),
      articles: DAILY_BRIEFING.slice(0, 100)
    }));
    if (DAILY_EVENTS.length > 0) {
      localStorage.setItem(EVENTS_LS_KEY, JSON.stringify({
        ts: Date.now(),
        events: DAILY_EVENTS.map(e => ({ ...e, summaryLoading: false }))
      }));
    }
  } catch (e) {
    console.warn('Failed to cache news to localStorage:', e.message);
  }
}

export function loadNewsFromLocalStorage() {
  try {
    const raw = localStorage.getItem(NEWS_LS_KEY);
    if (!raw) return false;
    const cached = JSON.parse(raw);
    if (Date.now() - cached.ts > NEWS_LS_TTL) return false;
    if (!cached.articles || cached.articles.length === 0) return false;

    DAILY_BRIEFING.length = 0;
    DAILY_BRIEFING.push(...cached.articles);

    // Also restore cached events if available
    const evRaw = localStorage.getItem(EVENTS_LS_KEY);
    if (evRaw) {
      const evCached = JSON.parse(evRaw);
      if (Date.now() - evCached.ts < NEWS_LS_TTL && evCached.events && evCached.events.length > 0) {
        DAILY_EVENTS.length = 0;
        DAILY_EVENTS.push(...evCached.events);
        // Notify sidebar so cached events render immediately (not after fetch)
        setTimeout(() => notifyEventsUpdated(), 0);
      }
    }

    return true;
  } catch {
    return false;
  }
}

// ============================================================
// News Caching
// ============================================================

const NEWS_CACHE = {};
const NEWS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes per country

function getCachedNews(countryName) {
  const cached = NEWS_CACHE[countryName];
  if (cached && (Date.now() - cached.timestamp) < NEWS_CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCachedNews(countryName, data) {
  NEWS_CACHE[countryName] = { data, timestamp: Date.now() };
}

// ============================================================
// Category Detection
// ============================================================

export function detectCategory(title, description) {
  const text = (title + ' ' + (description || '')).toLowerCase();
  if (text.match(/\b(nfl|nba|mlb|nhl|mls|quarterback|touchdown|rushing|draft pick|playoff|playof|super bowl|world series|slam dunk|hat trick|grand slam|home run|batting|wide receiver|tight end|linebacker|cornerback|running back|premier league|champions league|soccer|basketball|baseball|hockey|tennis|cricket|rugby|boxing|ufc|mma|formula 1|nascar|grand prix)\b/)) return 'SPORTS';
  if (text.match(/\b(war|military|attack|strike|bomb|troops|fighting|conflict|invasion)\b/)) return 'CONFLICT';
  if (text.match(/\b(economy|market|stock|trade|gdp|inflation|bank|fiscal)\b/)) return 'ECONOMY';
  if (text.match(/\b(terror|missile|nuclear|defense|army|navy|weapon)\b/)) return 'SECURITY';
  if (text.match(/\b(diplomat|treaty|summit|negotiat|sanction|ambassador|nato)\b/)) return 'DIPLOMACY';
  if (text.match(/\b(elect|president|prime minister|parliament|vote|politic|government|congress)\b/)) return 'POLITICS';
  if (text.match(/\b(crisis|humanitarian|famine|refugee|emergency|natural disaster|humanitarian disaster|disaster relief|disaster zone|disaster response|disaster aid)\b/)) return 'CRISIS';
  if (text.match(/\b(cyber|chip export|tech ban|surveillance)\b/)) return 'TECH';
  if (text.match(/\b(climate|emission|carbon|renewable)\b/)) return 'CLIMATE';
  return 'WORLD';
}

// ============================================================
// Geopolitical Relevance Scoring
// ============================================================

const DOMESTIC_FLAGS = [
  'congress', 'senate hearing', 'house vote', 'gop', 'democrat',
  'republican', 'dnc', 'rnc', 'fbi', 'doj', 'irs', 'atf',
  'school board', 'governor', 'mayor', 'sheriff', 'district attorney',
  'state legislature', 'supreme court ruling', 'amendment',
  'fox news', 'msnbc', 'cnn host', 'anchor'
];

export function scoreGeopoliticalRelevance(text) {
  const lower = text.toLowerCase();
  let score = 0;

  // Count standard geo signals (+1 each)
  for (const sig of GEOPOLITICAL_SIGNALS) {
    if (lower.includes(sig)) score += 1;
  }

  // Strong signals count double (+1 extra on top of the +1 above)
  for (const sig of STRONG_GEO_SIGNALS) {
    if (lower.includes(sig)) score += 1;
  }

  // Domestic flags penalize (-1 each)
  for (const flag of DOMESTIC_FLAGS) {
    if (lower.includes(flag)) score -= 1;
  }

  // Domestic noise patterns penalize heavily (-2 each)
  for (const pattern of DOMESTIC_NOISE_PATTERNS) {
    if (pattern.test(text)) score -= 2;
  }

  return score;
}

// ============================================================
// Article Impact Scoring
// ============================================================

export function scoreArticleImpact(article) {
  const text = ((article.headline || article.title || '') + ' ' + (article.description || '')).toLowerCase();
  const category = article.category || detectCategory(text, '');

  let baseImpact = CATEGORY_WEIGHTS[category] || 1;

  let severityMultiplier = 1;
  for (const kw in ESCALATION_KEYWORDS) {
    if (text.includes(kw)) {
      severityMultiplier = Math.max(severityMultiplier, ESCALATION_KEYWORDS[kw]);
    }
  }

  let deescalationBonus = 0;
  for (const kw in DEESCALATION_KEYWORDS) {
    if (text.includes(kw)) {
      deescalationBonus += DEESCALATION_KEYWORDS[kw];
    }
  }
  deescalationBonus = Math.max(-8, deescalationBonus);

  if (deescalationBonus < -3 && baseImpact > 0) {
    baseImpact = -Math.abs(baseImpact) * 0.5;
  }

  const riskDelta = Math.max(-5, Math.min(15, (baseImpact * severityMultiplier) + deescalationBonus));

  return {
    riskDelta,
    category,
    isDeescalation: deescalationBonus < -1,
    severity: severityMultiplier,
    headline: article.headline || article.title || ''
  };
}

// ============================================================
// Dynamic Risk System - State Management
// ============================================================

export const COUNTRY_RISK_STATE = {};
const RISK_LEVELS_ORDERED = ['clear', 'cloudy', 'stormy', 'severe', 'extreme', 'catastrophic'];

function riskLevelToValue(level) {
  const map = { 'catastrophic': 95, 'extreme': 78, 'severe': 62, 'stormy': 45, 'cloudy': 28, 'clear': 10 };
  return map[level] || 45;
}

function valueToRiskLevel(value) {
  if (value >= 88) return 'catastrophic';
  if (value >= 70) return 'extreme';
  if (value >= 54) return 'severe';
  if (value >= 36) return 'stormy';
  if (value >= 18) return 'cloudy';
  return 'clear';
}

export function initializeRiskState() {
  for (const countryName in COUNTRIES) {
    const c = COUNTRIES[countryName];
    COUNTRY_RISK_STATE[countryName] = {
      baseRisk: c.risk,
      currentRisk: c.risk,
      riskValue: riskLevelToValue(c.risk),
      accumulatedScore: 0,
      newsHistory: [],
      changeLog: [],
      lastLevelChange: 0,
      overrideActive: false,
      overrideReason: ''
    };
  }
}

// ============================================================
// Dynamic Risk System - Accumulator & Transition Engine
// ============================================================

export function updateCountryRiskAccumulator(countryName, articles) {
  const state = COUNTRY_RISK_STATE[countryName];
  if (!state || state.overrideActive) return;

  const now = Date.now();

  // Prune history to 48h window
  state.newsHistory = state.newsHistory.filter(item => now - item.timestamp < 48 * 3600 * 1000);

  for (const article of articles) {
    const impact = scoreArticleImpact(article);
    state.newsHistory.push({
      timestamp: now,
      impact: impact.riskDelta,
      headline: impact.headline,
      category: impact.category,
      isDeescalation: impact.isDeescalation
    });
  }

  // Weighted average with exponential decay (24h half-life)
  let totalScore = 0;
  let totalWeight = 0;
  for (const item of state.newsHistory) {
    const ageHours = (now - item.timestamp) / 3600000;
    const weight = Math.exp(-ageHours / 24);
    totalScore += item.impact * weight;
    totalWeight += weight;
  }
  const avgImpact = totalWeight > 0 ? totalScore / totalWeight : 0;

  // Momentum damping (85% decay per cycle)
  state.accumulatedScore = state.accumulatedScore * 0.85 + avgImpact * 0.15;
  state.accumulatedScore = Math.max(-50, Math.min(50, state.accumulatedScore));
}

export function calculateDynamicRisk(countryName) {
  const state = COUNTRY_RISK_STATE[countryName];
  if (!state || state.overrideActive) return COUNTRIES[countryName].risk;

  const baseValue = riskLevelToValue(state.baseRisk);
  const dynamicValue = Math.max(0, Math.min(100, baseValue + state.accumulatedScore));

  // Enforce max 1 level jump per cycle
  const currentLevel = state.currentRisk;
  const proposedLevel = valueToRiskLevel(dynamicValue);
  const currentIdx = RISK_LEVELS_ORDERED.indexOf(currentLevel);
  const proposedIdx = RISK_LEVELS_ORDERED.indexOf(proposedLevel);
  const stepDiff = proposedIdx - currentIdx;

  let newLevel;
  if (Math.abs(stepDiff) <= 1) {
    newLevel = proposedLevel;
  } else {
    newLevel = RISK_LEVELS_ORDERED[currentIdx + (stepDiff > 0 ? 1 : -1)];
  }

  // 6-hour cooldown between level changes
  const now = Date.now();
  const sixHours = 6 * 3600 * 1000;

  if (newLevel !== state.currentRisk) {
    if (state.lastLevelChange && (now - state.lastLevelChange) < sixHours) {
      return state.currentRisk;
    }

    const oldRisk = state.currentRisk;
    state.currentRisk = newLevel;
    state.lastLevelChange = now;
    state.riskValue = riskLevelToValue(newLevel);

    const triggerArticle = state.newsHistory.length > 0
      ? state.newsHistory[state.newsHistory.length - 1].headline
      : 'Accumulated news impact';

    state.changeLog.push({
      timestamp: now,
      type: 'LEVEL_CHANGE',
      from: oldRisk,
      to: newLevel,
      trigger: triggerArticle,
      score: state.accumulatedScore.toFixed(1)
    });

    if (state.changeLog.length > 50) state.changeLog = state.changeLog.slice(-50);

  }

  return state.currentRisk;
}

// ============================================================
// Dynamic Risk System - Master Update
// ============================================================

export async function updateDynamicRisks(articles) {
  if (!articles || articles.length === 0) return [];

  // Pre-compute lowercase text ONCE per article (avoids 19,600× recomputation)
  const prepared = articles.map(a => ({
    article: a,
    text: ((a.headline || a.title || '') + ' ' + (a.description || '')).toLowerCase()
  }));

  const countryNames = Object.keys(COUNTRIES);
  const changedCountries = [];
  const CHUNK = 10; // Smaller chunks = more frequent yields = smoother UI

  for (let i = 0; i < countryNames.length; i += CHUNK) {
    const chunk = countryNames.slice(i, i + CHUNK);

    for (const countryName of chunk) {
      // Fast relevance check: only match country names/demonyms
      // (articles are already pre-filtered by Worker, no need to re-check IRRELEVANT_KEYWORDS)
      const countryLower = countryName.toLowerCase();
      const terms = COUNTRY_DEMONYMS[countryName] || [countryLower];
      const allTerms = [countryLower, ...terms];

      const relevant = [];
      for (const p of prepared) {
        if (allTerms.some(term => p.text.includes(term))) {
          relevant.push(p.article);
        }
      }

      if (relevant.length > 0) {
        const oldRisk = COUNTRIES[countryName].risk;
        updateCountryRiskAccumulator(countryName, relevant);
        const newRisk = calculateDynamicRisk(countryName);
        COUNTRIES[countryName].risk = newRisk;
        if (oldRisk !== newRisk) {
          changedCountries.push({ name: countryName, from: oldRisk, to: newRisk });
        }
      }
    }

    // Yield to main thread between chunks so UI stays responsive
    if (i + CHUNK < countryNames.length) {
      await new Promise(r => setTimeout(r, 4));
    }
  }

  return changedCountries;
}

// ============================================================
// Stats Computation (React-friendly - returns data, no DOM)
// ============================================================

export function computeStats() {
  let critical = 0, high = 0, stable = 0;
  Object.values(COUNTRIES).forEach(c => {
    if (c.risk === 'catastrophic' || c.risk === 'extreme') critical++;
    else if (c.risk === 'severe' || c.risk === 'stormy') high++;
    else stable++;
  });
  return { critical, high, stable };
}

// COUNTRY_DEMONYMS is now imported from countries.js and re-exported
// for backward compatibility with modules that import from apiService
export { COUNTRY_DEMONYMS };

export function isRelevantToCountry(title, description, countryName) {
  const text = ((title || '') + ' ' + (description || '')).toLowerCase();
  const titleLower = (title || '').toLowerCase();
  const descLower = (description || '').toLowerCase();
  const countryLower = countryName.toLowerCase();

  for (const kw of IRRELEVANT_KEYWORDS) {
    if (text.includes(kw)) return false;
  }

  const countryTerms = COUNTRY_DEMONYMS[countryName] || [countryLower];
  const allTerms = [countryLower, ...countryTerms];

  const inTitle = allTerms.some(term => titleLower.includes(term));
  if (inTitle) return true;

  const inDesc = allTerms.some(term => descLower.includes(term));
  return inDesc;
}

// ============================================================
// RSS Fetching
// ============================================================

const FEED_TIMEOUT_MS = 5000; // 5-second hard timeout per feed

export async function fetchRSS(feedUrl, sourceName) {
  const startTime = performance.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FEED_TIMEOUT_MS);

  // Try rss2json first
  try {
    const proxyUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feedUrl);
    const response = await fetch(proxyUrl, { signal: controller.signal });
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'ok' && data.items && data.items.length > 0) {
        clearTimeout(timeout);
        const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
        console.log(`[RSS] OK ${sourceName}: ${data.items.length} items (${elapsed}s)`);
        return parseRSSItems(data, sourceName);
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      clearTimeout(timeout);
      console.warn(`[RSS] TIMEOUT ${sourceName} (5s)`);
      return [];
    }
  }

  // Fallback: Cloudflare Worker (same abort signal — shared 5s budget)
  try {
    const workerUrl = `${RSS_PROXY_BASE}/rss?url=${encodeURIComponent(feedUrl)}`;
    const response = await fetch(workerUrl, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) return [];
    const data = await response.json();
    if (data.status !== 'ok' || !data.items || data.items.length === 0) return [];
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
    console.log(`[RSS] OK ${sourceName}: ${data.items.length} items (${elapsed}s, worker)`);
    return parseRSSItems(data, sourceName);
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      console.warn(`[RSS] TIMEOUT ${sourceName} (5s)`);
    }
    return [];
  }
}

function parseRSSItems(data, sourceName) {
  return data.items.map(item => {
    let source = sourceName || data.feed?.title || 'News';
    let title = decodeHTMLEntities(item.title);

    // Google News embeds real source in title: "Headline - Al Jazeera"
    if (source.includes('Google News') && title) {
      const dashIdx = title.lastIndexOf(' - ');
      if (dashIdx > 0) {
        source = title.substring(dashIdx + 3).trim();
        title = title.substring(0, dashIdx).trim();
      }
    }

    return {
      title: title,
      description: decodeHTMLEntities(item.description || item.content || ''),
      link: item.link,
      source_id: source,
      pubDate: item.pubDate
    };
  });
}

// ============================================================
// Headline Quality Scoring (factual/conflict > opinion/reaction)
// ============================================================

const FACTUAL_BOOST_TERMS = [
  'war', 'offensive', 'ceasefire', 'troops', 'military operation',
  'attack', 'conflict', 'invasion', 'advance', 'retreat', 'deploy',
  'forces', 'drone strike', 'weapons', 'killed', 'casualties',
  'shelling', 'frontline', 'counteroffensive', 'seized', 'captured',
  'territory', 'strikes', 'missile', 'nuclear', 'border',
  'humanitarian', 'refugee', 'evacuation', 'summit', 'treaty',
  'agreement', 'coup', 'protest', 'enters day', 'fighting',
  'battle', 'airstrike', 'bombing', 'sanctions', 'escalation',
  'incursion', 'blockade', 'convoy', 'artillery', 'ground operation'
];

const OPINION_PENALIZE_TERMS = [
  'dismisses', 'urges', 'slams', 'blasts', 'reacts',
  'responds', 'says', 'calls on', 'accuses', 'criticizes',
  'condemns', 'warns', 'threatens', 'claims', 'denies',
  'demands', 'challenges', 'mocks', 'praises', 'thanks',
  'reveals', 'opinion', 'editorial', 'analysis', 'commentary',
  'vows', 'hints', 'suggests', 'believes'
];

function scoreHeadlineQuality(title) {
  const lower = (title || '').toLowerCase();
  let score = 0;
  for (const term of FACTUAL_BOOST_TERMS) {
    if (lower.includes(term)) score += 2;
  }
  for (const term of OPINION_PENALIZE_TERMS) {
    if (lower.includes(term)) score -= 3;
  }
  return score;
}

// ============================================================
// Format articles for display
// ============================================================

function formatArticlesForDisplay(articles, countryName) {
  const relevant = articles.filter(a => isRelevantToCountry(a.title, a.description, countryName));
  const toUse = relevant.length > 0 ? relevant : articles;

  // Score and sort: factual/conflict headlines first, opinion/reaction last
  const scored = toUse.map(a => ({ article: a, score: scoreHeadlineQuality(a.title) }));
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 15).map(({ article }) => ({
    headline: article.title,
    source: formatSourceName(article.source_id),
    time: timeAgo(article.pubDate),
    url: article.link || '',
    category: detectCategory(article.title, article.description)
  }));
}

// ============================================================
// Try a news API with timeout
// ============================================================

async function tryNewsAPI(apiName, url, parseResults, timeoutMs = 8000) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) return null;
    const data = await response.json();
    const results = parseResults(data);
    if (results && results.length > 0) {
      return results;
    }
  } catch (error) {
    console.warn(`${apiName} failed:`, error.message);
  }
  return null;
}

// ============================================================
// Fetch country-specific news (cached, multi-source fallback)
// ============================================================

export async function fetchCountryNews(countryName) {

  // 1. Check cache
  const cached = getCachedNews(countryName);
  if (cached) return cached;

  // 2. Check DAILY_BRIEFING for relevant articles
  if (DAILY_BRIEFING && DAILY_BRIEFING.length > 0) {
    const briefingRelevant = DAILY_BRIEFING.filter(article =>
      isRelevantToCountry(article.title || article.headline, article.description || '', countryName)
    );
    if (briefingRelevant.length >= 2) {
      briefingRelevant.sort((a, b) =>
        scoreHeadlineQuality(b.title || b.headline) - scoreHeadlineQuality(a.title || a.headline)
      );
      const result = briefingRelevant.slice(0, 10).map(article => ({
        headline: article.title || article.headline,
        source: formatSourceName(article.source_id || article.source || 'News'),
        time: timeAgo(article.pubDate || article.time),
        url: article.link || article.url || '',
        category: article.category || detectCategory(article.title || article.headline, article.description || '')
      }));
      setCachedNews(countryName, result);
      return result;
    }
  }

  // 3. Try Google News RSS
  try {
    const googleNewsUrl = RSS_FEEDS.search(countryName + ' news');
    const articles = await fetchRSS(googleNewsUrl, 'Google News');
    if (articles && articles.length > 0) {
      const result = formatArticlesForDisplay(articles, countryName);
      if (result.length > 0) { setCachedNews(countryName, result); return result; }
    }
  } catch (error) {
    console.warn('Google News RSS failed:', error.message);
  }

  // 4. Try backup APIs in sequence
  const apiOrder = ['gnews', 'newsdata', 'mediastack'];
  for (const apiName of apiOrder) {
    const api = NEWS_APIS[apiName];
    if (!api || !api.key) continue;

    if (apiFailures[apiName] && (Date.now() - apiFailures[apiName]) < 5 * 60 * 1000) continue;

    const url = api.buildUrl(api.key, countryName);
    const results = await tryNewsAPI(apiName, url, api.parseResults);

    if (results) {
      const formatted = formatArticlesForDisplay(results, countryName);
      if (formatted.length > 0) { setCachedNews(countryName, formatted); return formatted; }
    } else {
      apiFailures[apiName] = Date.now();
    }
  }

  // 5. Try broader regional search
  try {
    const countryData = COUNTRIES[countryName];
    if (countryData && countryData.region) {
      const regionQuery = `${countryName} ${countryData.region} news`;
      const regionUrl = RSS_FEEDS.search(regionQuery);
      const articles = await fetchRSS(regionUrl, 'Google News');
      if (articles && articles.length > 0) {
        const result = formatArticlesForDisplay(articles, countryName);
        if (result.length > 0) { setCachedNews(countryName, result); return result; }
      }
    }
  } catch (error) {
    console.warn('Regional search failed:', error.message);
  }

  // 6. Last resort: any DAILY_BRIEFING articles
  if (DAILY_BRIEFING && DAILY_BRIEFING.length > 0) {
    const anyRelevant = DAILY_BRIEFING.filter(article =>
      isRelevantToCountry(article.title || article.headline, article.description || '', countryName)
    );
    if (anyRelevant.length > 0) {
      anyRelevant.sort((a, b) =>
        scoreHeadlineQuality(b.title || b.headline) - scoreHeadlineQuality(a.title || a.headline)
      );
      const result = anyRelevant.slice(0, 10).map(article => ({
        headline: article.title || article.headline,
        source: formatSourceName(article.source_id || article.source || 'News'),
        time: timeAgo(article.pubDate || article.time),
        url: article.link || article.url || '',
        category: article.category || detectCategory(article.title || article.headline, article.description || '')
      }));
      setCachedNews(countryName, result);
      return result;
    }
  }

  // 7. No news found
  const emptyResult = [];
  setCachedNews(countryName, emptyResult);
  return emptyResult;
}

// ============================================================
// Fetch Pre-Generated Events from Worker (instant, no client-side processing)
// ============================================================

async function fetchPreGeneratedEvents() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${RSS_PROXY_BASE}/events`, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) return false;

    const data = await response.json();
    if (!data || !data.events || data.events.length === 0) return false;

    const minutesAgo = data.lastUpdated
      ? Math.round((Date.now() - data.lastUpdated) / 60000)
      : null;
    console.log(`[Hegemon] Pre-generated events: ${data.events.length} events, updated ${minutesAgo}m ago`);

    // Reject stale data (older than 6 hours — cron runs every 10m but may be delayed)
    if (minutesAgo !== null && minutesAgo > 360) {
      console.log('[Hegemon] Pre-generated data too stale, falling back');
      return false;
    }

    // Populate DAILY_BRIEFING
    if (data.briefing && data.briefing.length > 0) {
      DAILY_BRIEFING.length = 0;
      DAILY_BRIEFING.push(...data.briefing.map(a => ({
        ...a,
        time: timeAgo(a.pubDate),
        headline: a.headline || a.title,
      })));
    }

    // Populate DAILY_EVENTS
    DAILY_EVENTS.length = 0;
    for (const event of data.events) {
      DAILY_EVENTS.push({
        ...event,
        time: timeAgo(event.pubDate),
        summaryLoading: false,
        summaryError: !event.summary,
        articles: (event.articles || []).map(a => ({
          ...a,
          time: timeAgo(a.pubDate),
        }))
      });
    }

    // Store last updated timestamp for UI
    window._eventsLastUpdated = data.lastUpdated;

    notifyEventsUpdated();
    saveNewsToLocalStorage();

    return true;
  } catch (err) {
    console.warn('[Hegemon] Pre-generated events fetch failed:', err.message);
    return false;
  }
}

// ============================================================
// Fetch Live News — tries pre-generated first, falls back to RSS
// ============================================================

export async function fetchLiveNews({ onStatusUpdate, onComplete } = {}) {

  const totalStartTime = performance.now();
  if (onStatusUpdate) onStatusUpdate('fetching');

  // Try pre-generated events first (instant — single GET call)
  const preGenerated = await fetchPreGeneratedEvents();
  if (preGenerated) {
    const elapsed = ((performance.now() - totalStartTime) / 1000).toFixed(1);
    console.log(`[Hegemon] Pre-generated events loaded in ${elapsed}s`);

    // Trigger side effects
    setTimeout(() => {
      saveBriefingSnapshot();
      seedPastBriefingIfEmpty();
    }, 50);
    setTimeout(() => updateDynamicRisks(DAILY_BRIEFING), 500);

    if (onStatusUpdate) onStatusUpdate('complete');
    if (onComplete) onComplete(DAILY_BRIEFING);
    return;
  }

  // Fall back to client-side RSS fetching
  console.log('[Hegemon] Falling back to client-side RSS fetching');

  try {
    const feeds = RSS_FEEDS.daily;

    // Fetch RSS feeds in batches of 5 with 100ms gaps so main thread can breathe
    const BATCH = 5;
    console.log(`[Hegemon] Fetching ${feeds.length} RSS feeds in batches of ${BATCH}...`);
    const allArticles = [];
    let workingCount = 0;

    for (let i = 0; i < feeds.length; i += BATCH) {
      const batch = feeds.slice(i, i + BATCH);
      const results = await Promise.allSettled(
        batch.map(feed => fetchRSS(feed.url, feed.source))
      );
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value && result.value.length > 0) {
          workingCount++;
          allArticles.push(...result.value);
        }
      }
      // Yield to browser between batches
      if (i + BATCH < feeds.length) await yieldToMain(100);
    }

    const rssElapsed = ((performance.now() - totalStartTime) / 1000).toFixed(1);
    console.log(`[Hegemon] RSS complete: ${workingCount}/${feeds.length} feeds OK, ${allArticles.length} articles in ${rssElapsed}s`);

    if (allArticles.length > 0) {
      allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

      await yieldToMain(1);

      // Staleness filter — reject articles older than 48 hours
      const now = Date.now();
      const STALENESS_MS = 48 * 60 * 60 * 1000;
      const freshArticles = allArticles.filter(article => {
        if (!article.pubDate) return true;
        return (now - new Date(article.pubDate).getTime()) < STALENESS_MS;
      });

      await yieldToMain(1);

      // Filter: irrelevant, sports, domestic noise, non-English, geo score >= 1
      const relevantArticles = [];
      for (let i = 0; i < freshArticles.length; i++) {
        const article = freshArticles[i];
        const title = article.title || '';
        const text = (title + ' ' + (article.description || '')).toLowerCase();
        if (IRRELEVANT_KEYWORDS.some(kw => text.includes(kw))) continue;
        const category = detectCategory(title, article.description);
        if (category === 'SPORTS') continue;
        const fullText = title + ' ' + (article.description || '');
        if (DOMESTIC_NOISE_PATTERNS.some(p => p.test(fullText))) continue;
        const nonAscii = (title.match(/[^\u0020-\u007E]/g) || []).length;
        if (title.length > 10 && nonAscii / title.length > 0.15) continue;
        if (/\b(de|del|los|las|por|para|avec|dans|und|der|die|dari|dan|yang|pada)\b/i.test(title) &&
            !/\b(de facto|del rio|de gaulle)\b/i.test(title)) {
          const nonEnCount = (title.match(/\b(de|del|los|las|por|para|avec|dans|und|der|die|dari|dan|yang|pada|dari|untuk|dengan|atau|ini|itu|comme|sont|nous|leur)\b/gi) || []).length;
          if (nonEnCount >= 2) continue;
        }
        if (scoreGeopoliticalRelevance(fullText) < 1) continue;
        relevantArticles.push(article);

        // Yield every 30 articles
        if (i > 0 && i % 30 === 0) await yieldToMain(1);
      }

      await yieldToMain(1);

      // Source-aware dedup (yield every 30 to prevent stutter)
      const seenEntries = [];
      const uniqueArticles = [];
      for (let i = 0; i < relevantArticles.length; i++) {
        const article = relevantArticles[i];
        const source = formatSourceName(article.source_id);
        const normalized = (article.title || '').toLowerCase()
          .replace(/[^a-z0-9 ]/g, '')
          .replace(/\b(the|a|an|in|on|at|to|for|of|and|is|are|was|were|has|have|had|with|from|by)\b/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        let isDupe = false;
        if (seenEntries.some(s => s.normalized === normalized)) { isDupe = true; }
        if (!isDupe) {
          for (const existing of seenEntries) {
            if (normalized.length > 20 && existing.normalized.length > 20) {
              const wordsA = new Set(normalized.split(' '));
              const wordsB = new Set(existing.normalized.split(' '));
              let overlap = 0;
              for (const w of wordsA) { if (wordsB.has(w)) overlap++; }
              const maxLen = Math.max(wordsA.size, wordsB.size);
              const threshold = existing.source === source ? 0.7 : 0.95;
              if (maxLen > 0 && overlap / maxLen >= threshold) { isDupe = true; break; }
            }
          }
        }
        if (!isDupe) {
          seenEntries.push({ normalized, source });
          uniqueArticles.push(article);
        }

        if (i > 0 && i % 30 === 0) await yieldToMain(1);
      }

      console.log(`[Hegemon] Pipeline: ${allArticles.length} raw → ${freshArticles.length} fresh → ${relevantArticles.length} relevant → ${uniqueArticles.length} unique`);

      await yieldToMain(1);

      // Build new briefing (200 cap)
      const newArticles = uniqueArticles.slice(0, 200).map(article => {
        const category = detectCategory(article.title, article.description);
        const importance = ['CONFLICT', 'CRISIS', 'SECURITY'].includes(category) ? 'high' : 'medium';
        const sourceName = formatSourceName(article.source_id);
        return {
          time: timeAgo(article.pubDate),
          category,
          importance,
          headline: article.title,
          description: article.description || '',
          source: sourceName,
          url: article.link || ''
        };
      });

      // Ensure political diversity
      const rcCount = newArticles.filter(a => { const b = getSourceBias(a.source); return b === 'RC' || b === 'R'; }).length;
      if (rcCount < 3) {
        const rightFallbacks = DAILY_BRIEFING_FALLBACK.filter(a => {
          const b = getSourceBias(a.source);
          return b === 'RC' || b === 'R';
        });
        const needed = Math.min(4 - rcCount, rightFallbacks.length);
        if (needed > 0) {
          const interval = Math.max(1, Math.floor(newArticles.length / (needed + 1)));
          for (let i = 0; i < needed; i++) {
            const pos = Math.min((i + 1) * interval + i, newArticles.length);
            newArticles.splice(pos, 0, rightFallbacks[i]);
          }
        }
      }

      // Disperse bias clusters
      const dispersed = disperseBiasArticles(newArticles);

      // Balance western/non-western source ratio
      const balanced = balanceSourceOrigins(dispersed);

      // Demote low-priority stories out of top 10
      const DEMOTE_KEYWORDS = ['switzerland', 'swiss', 'nightclub', 'club fire', 'nightlife'];
      for (let i = 0; i < Math.min(10, balanced.length); i++) {
        const h = (balanced[i].headline || '').toLowerCase();
        if (DEMOTE_KEYWORDS.some(kw => h.includes(kw))) {
          const [item] = balanced.splice(i, 1);
          const dest = Math.min(14, balanced.length);
          balanced.splice(dest, 0, item);
          i--;
        }
      }

      // Deprioritize tabloid sources — never in top 5
      const DEPRIORITIZE_SOURCES = ['new york post', 'ny post', 'daily mail'];
      for (let i = 0; i < Math.min(5, balanced.length); i++) {
        const src = (balanced[i].source || '').toLowerCase();
        if (DEPRIORITIZE_SOURCES.some(ds => src.includes(ds))) {
          const [item] = balanced.splice(i, 1);
          const dest = Math.min(balanced.length, 5);
          balanced.splice(dest, 0, item);
          i--;
        }
      }

      // Mutate shared DAILY_BRIEFING array
      DAILY_BRIEFING.length = 0;
      DAILY_BRIEFING.push(...balanced);

      await yieldToMain(1);

      // Cluster articles into events
      const events = await clusterArticles(DAILY_BRIEFING);

      // Apply cached summaries before rendering so events appear with summaries
      const cache = loadSummaryCache();
      for (const event of events) {
        const key = eventSummaryKey(event);
        if (key && cache[key]) {
          event.summary = cache[key].summary;
          event.summaryLoading = false;
        }
      }

      // Batch render: top stories first (4 events), then 10 at a time with 100ms gaps
      DAILY_EVENTS.length = 0;
      const topSlice = events.slice(0, 4);
      DAILY_EVENTS.push(...topSlice);
      notifyEventsUpdated();

      const totalElapsed = ((performance.now() - totalStartTime) / 1000).toFixed(1);
      console.log(`[Hegemon] Top stories ready: ${topSlice.length} events in ${totalElapsed}s`);

      // Batch remaining events 10 at a time
      const RENDER_BATCH = 10;
      for (let i = 4; i < events.length; i += RENDER_BATCH) {
        await yieldToMain(100);
        const batch = events.slice(i, i + RENDER_BATCH);
        DAILY_EVENTS.push(...batch);
        notifyEventsUpdated();
      }
      console.log(`[Hegemon] All ${events.length} events rendered`);

      // Defer heavy side-effects so UI renders first
      setTimeout(() => {
        saveBriefingSnapshot();
        seedPastBriefingIfEmpty();
        saveNewsToLocalStorage();
      }, 50);

      // Dynamic risk analysis (chunked, non-blocking)
      setTimeout(() => updateDynamicRisks(DAILY_BRIEFING), 500);

      // Fetch only truly uncached summaries AFTER events are displayed
      setTimeout(() => fetchEventSummaries(), 2000);

      if (onComplete) onComplete(DAILY_BRIEFING);
      return;
    }
  } catch (error) {
    console.warn('RSS feeds failed:', error.message);
  }

  // Fallback: try each backup API
  const dailyApiOrder = ['gnews', 'newsdata', 'mediastack'];
  for (const apiName of dailyApiOrder) {
    try {
      const api = NEWS_APIS[apiName];
      if (!api || !api.key || !api.buildDailyUrl) continue;
      const response = await fetch(api.buildDailyUrl(api.key));
      if (response.ok) {
        const data = await response.json();
        const results = api.parseResults(data);
        if (results && results.length > 0) {
          const fallbackArticles = results.filter(article => {
            const text = ((article.title || '') + ' ' + (article.description || '')).toLowerCase();
            if (IRRELEVANT_KEYWORDS.some(kw => text.includes(kw))) return false;
            return GEOPOLITICAL_SIGNALS.some(sig => text.includes(sig));
          }).map(article => ({
            time: timeAgo(article.pubDate),
            category: detectCategory(article.title, article.description),
            importance: 'medium',
            headline: article.title,
            source: formatSourceName(article.source_id),
            url: article.link || ''
          }));

          DAILY_BRIEFING.length = 0;
          DAILY_BRIEFING.push(...fallbackArticles);

          const fbEvents = await clusterArticles(DAILY_BRIEFING);
          DAILY_EVENTS.length = 0;
          DAILY_EVENTS.push(...fbEvents);

          // Apply cached summaries immediately
          applyCachedSummaries();

          setTimeout(() => {
            saveBriefingSnapshot();
            seedPastBriefingIfEmpty();
            saveNewsToLocalStorage();
          }, 50);
          setTimeout(() => updateDynamicRisks(DAILY_BRIEFING), 500);
          setTimeout(() => fetchEventSummaries(), 2000);

          if (onComplete) onComplete(DAILY_BRIEFING);
          return;
        }
      }
    } catch (e) {
      console.warn(`${apiName} fallback failed:`, e.message);
    }
  }

  // All sources failed
  console.error('All news sources failed');
  if (DAILY_BRIEFING.length === 0) {
    DAILY_BRIEFING.length = 0;
    DAILY_BRIEFING.push(...DAILY_BRIEFING_FALLBACK);
  }

  if (onStatusUpdate) onStatusUpdate('failed');
}

// ============================================================
// Event Summarization (via Cloudflare Worker → Claude API)
// ============================================================

// Listeners that want to know when events update (summaries arrive)
const _eventListeners = [];

export function onEventsUpdated(fn) {
  _eventListeners.push(fn);
  return () => {
    const idx = _eventListeners.indexOf(fn);
    if (idx >= 0) _eventListeners.splice(idx, 1);
  };
}

function notifyEventsUpdated() {
  for (const fn of _eventListeners) {
    try { fn(DAILY_EVENTS); } catch (e) { console.warn('Event listener error:', e); }
  }
}

// ============================================================
// Summary Caching (localStorage, keyed by article headline hash)
// ============================================================

const SUMMARY_CACHE_KEY = 'hegemon_summary_cache_v4';

function eventSummaryKey(event) {
  if (!event.articles || event.articles.length === 0) return null;
  const parts = event.articles
    .map(a => (a.headline || a.title || '').toLowerCase().trim().substring(0, 50))
    .sort();
  let str = parts.join('|');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return 'sum_' + Math.abs(hash).toString(36);
}

function loadSummaryCache() {
  try {
    const raw = localStorage.getItem(SUMMARY_CACHE_KEY);
    if (!raw) return {};
    const cache = JSON.parse(raw);
    // Clean entries older than 24 hours
    const now = Date.now();
    let changed = false;
    for (const [k, v] of Object.entries(cache)) {
      if (now - v.savedAt > 24 * 60 * 60 * 1000) { delete cache[k]; changed = true; }
    }
    if (changed) {
      try { localStorage.setItem(SUMMARY_CACHE_KEY, JSON.stringify(cache)); } catch { /* storage full */ }
    }
    return cache;
  } catch { return {}; }
}

function saveSummaryCache(cache) {
  try { localStorage.setItem(SUMMARY_CACHE_KEY, JSON.stringify(cache)); }
  catch (e) { console.warn('Summary cache save failed:', e.message); }
}

/**
 * Synchronously apply cached summaries to DAILY_EVENTS.
 * Called immediately after clustering so events render with summaries (no flash).
 */
function applyCachedSummaries() {
  if (!DAILY_EVENTS || DAILY_EVENTS.length === 0) return;
  const cache = loadSummaryCache();
  let applied = 0;
  for (const event of DAILY_EVENTS) {
    const key = eventSummaryKey(event);
    if (key && cache[key]) {
      event.summary = cache[key].summary;
      event.summaryLoading = false;
      applied++;
    }
  }
  if (applied > 0) {
    console.log(`[Hegemon] Pre-applied ${applied} cached summaries`);
  }
}

const SUMMARY_TIMEOUT_MS = 10000; // 10-second timeout on /summarize

export async function fetchEventSummaries() {
  if (!DAILY_EVENTS || DAILY_EVENTS.length === 0) return;

  const cache = loadSummaryCache();
  const uncachedTop = [];    // top stories (first 4 events) — prioritized
  const uncachedRest = [];   // latest updates

  // Check for cached summaries (some may already be applied during batch render)
  for (let i = 0; i < DAILY_EVENTS.length; i++) {
    const event = DAILY_EVENTS[i];
    if (event.summary) continue; // Already has summary
    const key = eventSummaryKey(event);
    if (key && cache[key]) {
      event.summary = cache[key].summary;
      event.summaryLoading = false;
    } else {
      event.summaryLoading = true;
      if (i < 4) uncachedTop.push(event);
      else uncachedRest.push(event);
    }
  }

  const cachedCount = DAILY_EVENTS.length - uncachedTop.length - uncachedRest.length;
  if (cachedCount > 0) {
    console.log(`[Hegemon] Summaries: ${cachedCount} cached, ${uncachedTop.length} top + ${uncachedRest.length} rest need fetching`);
  }

  notifyEventsUpdated();

  if (uncachedTop.length === 0 && uncachedRest.length === 0) return;

  // Helper: fetch a batch of summaries with 10s timeout
  async function fetchSummaryBatch(batch, batchNum) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SUMMARY_TIMEOUT_MS);
    try {
      console.log(`[Hegemon] Fetching summaries batch ${batchNum} (${batch.length} events)`);
      const response = await fetch(`${RSS_PROXY_BASE}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          events: batch.map(e => ({
            headline: e.headline,
            category: e.category,
            articles: e.articles.map(a => ({
              headline: a.headline || a.title || '',
              source: a.source || '',
              description: a.description || ''
            }))
          }))
        })
      });
      clearTimeout(timeout);

      if (!response.ok) {
        const errText = await response.text().catch(() => 'no body');
        console.error(`[Hegemon] Summary API error (${response.status}):`, errText);
        for (const event of batch) { event.summaryLoading = false; event.summaryError = true; }
        notifyEventsUpdated();
        return;
      }

      const data = await response.json();
      const summaries = data.summaries || [];

      for (let i = 0; i < batch.length; i++) {
        batch[i].summaryLoading = false;
        if (summaries[i] && summaries[i].summary) {
          batch[i].summary = summaries[i].summary;
          const key = eventSummaryKey(batch[i]);
          if (key) { cache[key] = { summary: summaries[i].summary, savedAt: Date.now() }; }
        } else {
          batch[i].summaryError = true;
        }
      }
      saveSummaryCache(cache);
      notifyEventsUpdated();

    } catch (err) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        console.warn(`[Hegemon] Summary batch ${batchNum} timed out (10s)`);
      } else {
        console.error('[Hegemon] Summary fetch error:', err.message || err);
      }
      for (const event of batch) { event.summaryLoading = false; event.summaryError = true; }
      notifyEventsUpdated();
    }
  }

  // 1. Top stories first (all at once)
  let batchNum = 1;
  if (uncachedTop.length > 0) {
    await fetchSummaryBatch(uncachedTop, batchNum++);
  }

  // 2. Latest updates in batches of 5
  const BATCH_SIZE = 5;
  for (let i = 0; i < uncachedRest.length; i += BATCH_SIZE) {
    const batch = uncachedRest.slice(i, i + BATCH_SIZE);
    await fetchSummaryBatch(batch, batchNum++);
  }
}
