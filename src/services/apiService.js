// apiService.js - News fetching, briefing history, RSS feeds, dynamic risk system

import {
  COUNTRIES, DAILY_BRIEFING, DAILY_BRIEFING_FALLBACK, DAILY_EVENTS,
  IRRELEVANT_KEYWORDS, GEOPOLITICAL_SIGNALS, STRONG_GEO_SIGNALS,
  DOMESTIC_NOISE_PATTERNS, ESCALATION_KEYWORDS,
  DEESCALATION_KEYWORDS, CATEGORY_WEIGHTS
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

const RSS_FEEDS = {
  daily: [
    // --- Western sources (~60%) ---
    { url: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en', source: 'Google News World' },
    { url: 'https://news.google.com/rss/search?q=world+news+today&hl=en-US&gl=US&ceid=US:en', source: 'Google News' },
    { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC World' },
    { url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml', source: 'Wall Street Journal' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'New York Times' },
    { url: 'https://news.google.com/rss/search?q=site:reuters.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Reuters' },
    { url: 'https://news.google.com/rss/search?q=site:apnews.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'AP News' },
    { url: 'https://www.politico.com/rss/politico-world-news.xml', source: 'Politico' },
    { url: 'https://www.economist.com/international/rss.xml', source: 'The Economist' },
    { url: 'https://foreignpolicy.com/feed/', source: 'Foreign Policy' },
    { url: 'https://feeds.bloomberg.com/politics/news.rss', source: 'Bloomberg' },
    { url: 'https://moxie.foxnews.com/google-publisher/world.xml', source: 'Fox News' },
    { url: 'https://www.theguardian.com/world/rss', source: 'The Guardian' },
    { url: 'https://www.dailymail.co.uk/news/worldnews/index.rss', source: 'Daily Mail' },
    { url: 'https://nypost.com/feed/', source: 'New York Post' },
    { url: 'https://thehill.com/feed/', source: 'The Hill' },
    { url: 'https://www.washingtontimes.com/rss/headlines/news/world/', source: 'Washington Times' },
    { url: 'https://news.google.com/rss/search?q=site:telegraph.co.uk+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'The Telegraph' },
    { url: 'https://www.ft.com/rss/home', source: 'Financial Times' },
    { url: 'https://www.cbc.ca/webfeed/rss/rss-world', source: 'CBC News' },
    { url: 'https://www.abc.net.au/news/feed/2942460/rss.xml', source: 'ABC Australia' },
    { url: 'https://www.irishtimes.com/cmlink/news-1.1319192', source: 'Irish Times' },
    // --- Non-Western sources (~40%) ---
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
    { url: 'https://www3.nhk.or.jp/rss/news/cat0.xml', source: 'NHK World' },
    { url: 'https://en.yna.co.kr/RSS/news.xml', source: 'Yonhap' },
    { url: 'http://www.news.cn/english/rss/worldrss.xml', source: 'Xinhua' },
    { url: 'https://www.rt.com/rss/news/', source: 'RT' },
    { url: 'https://www.france24.com/en/rss', source: 'France 24' },
    { url: 'https://rss.dw.com/rdf/rss-en-world', source: 'Deutsche Welle' },
    { url: 'https://www.aa.com.tr/en/rss/default?cat=world', source: 'Anadolu Agency' },
    { url: 'https://news.google.com/rss/search?q=site:english.kyodonews.net+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Kyodo News' },
    { url: 'https://en.mehrnews.com/rss', source: 'Mehr News' },
    { url: 'https://www.cgtn.com/subscribe/rss/section/world.xml', source: 'CGTN' },
    { url: 'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms', source: 'Times of India' },
    { url: 'https://tass.com/rss/v2.xml', source: 'TASS' },
    { url: 'https://www.scmp.com/rss/91/feed', source: 'South China Morning Post' },
    { url: 'https://www.thehindu.com/news/international/feeder/default.rss', source: 'The Hindu' },
    { url: 'https://www.timesofisrael.com/feed/', source: 'Times of Israel' },
    { url: 'https://www.africanews.com/feed/', source: 'Africa News' },
    { url: 'https://news.google.com/rss/search?q=site:asia.nikkei.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Nikkei Asia' },
    { url: 'https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=6311', source: 'CNA' },
    { url: 'https://www.straitstimes.com/news/world/rss.xml', source: 'Straits Times' },
    { url: 'https://news.google.com/rss/search?q=site:haaretz.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Haaretz' },
    { url: 'https://news.google.com/rss/search?q=site:thejakartapost.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Jakarta Post' },
    { url: 'https://www.bangkokpost.com/rss/data/topstories.xml', source: 'Bangkok Post' },
    { url: 'https://news.google.com/rss/search?q=site:nation.africa+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Nation Kenya' },
    // --- New sources (expanded coverage) ---
    { url: 'https://www.independent.co.uk/news/world/rss', source: 'The Independent' },
    { url: 'https://www.theglobeandmail.com/arc/outboundfeeds/rss/category/world/', source: 'Globe and Mail' },
    { url: 'https://www.smh.com.au/rss/world.xml', source: 'Sydney Morning Herald' },
    { url: 'https://www.dawn.com/feeds/home', source: 'Dawn' },
    { url: 'https://www.thedailystar.net/top-news/rss.xml', source: 'Daily Star Bangladesh' },
    { url: 'https://rss.tempo.co/en', source: 'Tempo' },
    { url: 'https://www.premiumtimesng.com/feed', source: 'Premium Times' },
    { url: 'https://mg.co.za/feed/', source: 'Mail & Guardian' },
    { url: 'https://www.middleeasteye.net/rss', source: 'Middle East Eye' },
    { url: 'https://news.google.com/rss/search?q=site:thenationalnews.com&hl=en', source: 'Google News' },
    { url: 'https://feeds.folha.uol.com.br/mundo/rss091.xml', source: 'Folha' },
    { url: 'https://buenosairesherald.com/feed/', source: 'Buenos Aires Herald' },
    { url: 'https://www.taipeitimes.com/xml/index.rss', source: 'Taipei Times' },
    { url: 'https://news.google.com/rss/search?q=site:koreaherald.com+when:7d&hl=en', source: 'Google News' },
    { url: 'https://e.vnexpress.net/rss/news.rss', source: 'VnExpress' },
    { url: 'https://www.rappler.com/feed/', source: 'Rappler' },
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
const NEWS_LS_TTL = 30 * 60 * 1000; // 30 minutes

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

  const articlesByCountry = {};
  for (const countryName in COUNTRIES) {
    const relevant = articles.filter(article =>
      isRelevantToCountry(article.headline || article.title || '', article.description || '', countryName)
    );
    if (relevant.length > 0) {
      articlesByCountry[countryName] = relevant;
    }
  }

  const changedCountries = [];
  for (const countryName in articlesByCountry) {
    const oldRisk = COUNTRIES[countryName].risk;

    updateCountryRiskAccumulator(countryName, articlesByCountry[countryName]);
    const newRisk = calculateDynamicRisk(countryName);

    COUNTRIES[countryName].risk = newRisk;

    if (oldRisk !== newRisk) {
      changedCountries.push({ name: countryName, from: oldRisk, to: newRisk });
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

// ============================================================
// Country Relevance Detection (195-country demonyms)
// ============================================================

export const COUNTRY_DEMONYMS = {
    'Afghanistan': ['afghan', 'kabul', 'taliban'],
    'Albania': ['albanian', 'tirana'],
    'Algeria': ['algerian', 'algiers'],
    'Andorra': ['andorran'],
    'Angola': ['angolan', 'luanda'],
    'Antigua and Barbuda': ['antiguan', 'barbudan'],
    'Argentina': ['argentine', 'argentinian', 'buenos aires'],
    'Armenia': ['armenian', 'yerevan'],
    'Australia': ['australian', 'canberra', 'sydney', 'melbourne'],
    'Austria': ['austrian', 'vienna'],
    'Azerbaijan': ['azerbaijani', 'baku'],
    'Bahamas': ['bahamian', 'nassau'],
    'Bahrain': ['bahraini', 'manama'],
    'Bangladesh': ['bangladeshi', 'dhaka'],
    'Barbados': ['barbadian', 'bridgetown'],
    'Belarus': ['belarusian', 'minsk', 'lukashenko'],
    'Belgium': ['belgian', 'brussels'],
    'Benin': ['beninese', 'porto-novo', 'cotonou'],
    'Bhutan': ['bhutanese', 'thimphu'],
    'Bolivia': ['bolivian', 'la paz'],
    'Bosnia and Herzegovina': ['bosnian', 'sarajevo'],
    'Botswana': ['motswana', 'botswanan', 'gaborone'],
    'Brazil': ['brazilian', 'brasilia', 'rio', 'sao paulo', 'lula'],
    'Brunei': ['bruneian', 'bandar seri begawan'],
    'Bulgaria': ['bulgarian', 'sofia'],
    'Burkina Faso': ['burkinabe', 'ouagadougou'],
    'Burundi': ['burundian', 'bujumbura', 'gitega'],
    'Cambodia': ['cambodian', 'phnom penh'],
    'Cameroon': ['cameroonian', 'yaounde'],
    'Canada': ['canadian', 'ottawa', 'toronto', 'trudeau'],
    'Cape Verde': ['cape verdean', 'praia'],
    'Central African Republic': ['central african', 'bangui'],
    'Chad': ['chadian', "n'djamena"],
    'Chile': ['chilean', 'santiago'],
    'China': ['chinese', 'beijing', 'xi jinping', 'ccp', 'prc'],
    'Colombia': ['colombian', 'bogota'],
    'Comoros': ['comorian', 'moroni'],
    'Democratic Republic of Congo': ['congolese', 'kinshasa', 'drc'],
    'Republic of Congo': ['congo-brazzaville', 'brazzaville'],
    'Costa Rica': ['costa rican', 'san jose'],
    'Croatia': ['croatian', 'zagreb'],
    'Cuba': ['cuban', 'havana'],
    'Cyprus': ['cypriot', 'nicosia'],
    'Czech Republic': ['czech', 'prague'],
    'Denmark': ['danish', 'copenhagen'],
    'Greenland': ['greenlandic', 'nuuk', 'inuit'],
    'Djibouti': ['djiboutian'],
    'Dominica': ['dominican'],
    'Dominican Republic': ['dominican republic', 'santo domingo'],
    'Ecuador': ['ecuadorian', 'quito'],
    'Egypt': ['egyptian', 'cairo', 'sisi'],
    'El Salvador': ['salvadoran', 'san salvador', 'bukele'],
    'Equatorial Guinea': ['equatoguinean', 'malabo'],
    'Eritrea': ['eritrean', 'asmara'],
    'Estonia': ['estonian', 'tallinn'],
    'Eswatini': ['swazi', 'mbabane'],
    'Ethiopia': ['ethiopian', 'addis ababa'],
    'Fiji': ['fijian', 'suva'],
    'Finland': ['finnish', 'helsinki'],
    'France': ['french', 'paris', 'macron', 'élysée'],
    'Gabon': ['gabonese', 'libreville'],
    'Gambia': ['gambian', 'banjul'],
    'Georgia': ['georgian', 'tbilisi'],
    'Germany': ['german', 'berlin', 'scholz', 'bundestag'],
    'Ghana': ['ghanaian', 'accra'],
    'Greece': ['greek', 'athens'],
    'Grenada': ['grenadian'],
    'Guatemala': ['guatemalan'],
    'Guinea': ['guinean', 'conakry'],
    'Guinea-Bissau': ['bissau-guinean', 'bissau'],
    'Guyana': ['guyanese', 'georgetown'],
    'Haiti': ['haitian', 'port-au-prince'],
    'Honduras': ['honduran', 'tegucigalpa'],
    'Hungary': ['hungarian', 'budapest', 'orban'],
    'Iceland': ['icelandic', 'reykjavik'],
    'India': ['indian', 'delhi', 'mumbai', 'modi', 'bjp'],
    'Indonesia': ['indonesian', 'jakarta', 'jokowi'],
    'Iran': ['iranian', 'tehran', 'ayatollah', 'khamenei'],
    'Iraq': ['iraqi', 'baghdad', 'kurdish'],
    'Ireland': ['irish', 'dublin'],
    'Israel': ['israeli', 'tel aviv', 'jerusalem', 'netanyahu', 'idf'],
    'Italy': ['italian', 'rome', 'meloni'],
    'Ivory Coast': ['ivorian', 'abidjan', 'yamoussoukro'],
    'Jamaica': ['jamaican', 'kingston'],
    'Japan': ['japanese', 'tokyo', 'kishida'],
    'Jordan': ['jordanian', 'amman'],
    'Kazakhstan': ['kazakh', 'astana', 'almaty'],
    'Kenya': ['kenyan', 'nairobi'],
    'Kiribati': ['i-kiribati', 'tarawa'],
    'Kosovo': ['kosovar', 'pristina'],
    'Kuwait': ['kuwaiti', 'kuwait city'],
    'Kyrgyzstan': ['kyrgyz', 'bishkek'],
    'Laos': ['laotian', 'vientiane'],
    'Latvia': ['latvian', 'riga'],
    'Lebanon': ['lebanese', 'beirut', 'hezbollah'],
    'Lesotho': ['basotho', 'maseru'],
    'Liberia': ['liberian', 'monrovia'],
    'Libya': ['libyan', 'tripoli'],
    'Liechtenstein': ['liechtensteiner', 'vaduz'],
    'Lithuania': ['lithuanian', 'vilnius'],
    'Luxembourg': ['luxembourgish', 'luxembourger'],
    'Madagascar': ['malagasy', 'antananarivo'],
    'Malawi': ['malawian', 'lilongwe'],
    'Malaysia': ['malaysian', 'kuala lumpur'],
    'Maldives': ['maldivian', 'male'],
    'Mali': ['malian', 'bamako'],
    'Malta': ['maltese', 'valletta'],
    'Marshall Islands': ['marshallese', 'majuro'],
    'Mauritania': ['mauritanian', 'nouakchott'],
    'Mauritius': ['mauritian', 'port louis'],
    'Mexico': ['mexican', 'mexico city'],
    'Micronesia': ['micronesian', 'palikir'],
    'Moldova': ['moldovan', 'chisinau'],
    'Monaco': ['monegasque', 'monte carlo'],
    'Mongolia': ['mongolian', 'ulaanbaatar'],
    'Montenegro': ['montenegrin', 'podgorica'],
    'Morocco': ['moroccan', 'rabat', 'casablanca'],
    'Mozambique': ['mozambican', 'maputo'],
    'Myanmar': ['burmese', 'myanmar', 'yangon', 'junta'],
    'Namibia': ['namibian', 'windhoek'],
    'Nauru': ['nauruan'],
    'Nepal': ['nepali', 'nepalese', 'kathmandu'],
    'Netherlands': ['dutch', 'amsterdam', 'the hague'],
    'New Zealand': ['new zealand', 'kiwi', 'wellington'],
    'Nicaragua': ['nicaraguan', 'managua', 'ortega'],
    'Niger': ['nigerien', 'niamey'],
    'Nigeria': ['nigerian', 'lagos', 'abuja'],
    'North Korea': ['north korean', 'pyongyang', 'kim jong', 'dprk'],
    'North Macedonia': ['macedonian', 'skopje'],
    'Norway': ['norwegian', 'oslo'],
    'Oman': ['omani', 'muscat'],
    'Pakistan': ['pakistani', 'islamabad', 'karachi'],
    'Palau': ['palauan', 'ngerulmud'],
    'Palestine': ['gaza', 'palestinian', 'west bank', 'ramallah', 'hamas', 'fatah', 'pa ', 'palestinian authority'],
    'Panama': ['panamanian', 'panama city'],
    'Papua New Guinea': ['papua new guinean', 'port moresby'],
    'Paraguay': ['paraguayan', 'asuncion'],
    'Peru': ['peruvian', 'lima'],
    'Philippines': ['filipino', 'philippine', 'manila', 'marcos'],
    'Poland': ['polish', 'warsaw'],
    'Portugal': ['portuguese', 'lisbon'],
    'Qatar': ['qatari', 'doha'],
    'Romania': ['romanian', 'bucharest'],
    'Russia': ['russian', 'moscow', 'kremlin', 'putin'],
    'Rwanda': ['rwandan', 'kigali'],
    'Saint Kitts and Nevis': ['kittitian', 'nevisian', 'basseterre'],
    'Saint Lucia': ['saint lucian', 'castries'],
    'Saint Vincent and the Grenadines': ['vincentian'],
    'Samoa': ['samoan', 'apia'],
    'San Marino': ['sammarinese'],
    'Sao Tome and Principe': ['santomean'],
    'Saudi Arabia': ['saudi', 'riyadh', 'mbs'],
    'Senegal': ['senegalese', 'dakar'],
    'Serbia': ['serbian', 'belgrade'],
    'Seychelles': ['seychellois', 'victoria'],
    'Sierra Leone': ['sierra leonean', 'freetown'],
    'Singapore': ['singaporean'],
    'Slovakia': ['slovak', 'bratislava'],
    'Slovenia': ['slovenian', 'ljubljana'],
    'Solomon Islands': ['solomon islander', 'honiara'],
    'Somalia': ['somali', 'mogadishu'],
    'South Africa': ['south african', 'johannesburg', 'pretoria', 'cape town'],
    'South Korea': ['south korean', 'seoul', 'korean'],
    'South Sudan': ['south sudanese', 'juba'],
    'Spain': ['spanish', 'madrid', 'barcelona'],
    'Sri Lanka': ['sri lankan', 'colombo'],
    'Sudan': ['sudanese', 'khartoum'],
    'Suriname': ['surinamese', 'paramaribo'],
    'Sweden': ['swedish', 'stockholm'],
    'Switzerland': ['swiss', 'bern', 'zurich', 'geneva'],
    'Syria': ['syrian', 'damascus', 'assad'],
    'Taiwan': ['taiwanese', 'taipei'],
    'Tajikistan': ['tajik', 'dushanbe'],
    'Tanzania': ['tanzanian', 'dodoma', 'dar es salaam'],
    'Thailand': ['thai', 'bangkok'],
    'Timor-Leste': ['timorese', 'east timor', 'dili'],
    'Togo': ['togolese', 'lome'],
    'Tonga': ['tongan', "nuku'alofa"],
    'Trinidad and Tobago': ['trinidadian', 'tobagonian', 'port of spain'],
    'Tunisia': ['tunisian', 'tunis'],
    'Turkey': ['turkish', 'ankara', 'istanbul', 'erdogan'],
    'Turkmenistan': ['turkmen', 'ashgabat'],
    'Tuvalu': ['tuvaluan', 'funafuti'],
    'Uganda': ['ugandan', 'kampala'],
    'Ukraine': ['ukrainian', 'kyiv', 'zelensky'],
    'United Arab Emirates': ['emirati', 'uae', 'dubai', 'abu dhabi'],
    'United Kingdom': ['british', 'uk', 'britain', 'london', 'parliament', 'westminster'],
    'United States': ['u.s.', 'american', 'washington', 'biden', 'trump', 'congress', 'white house', 'pentagon'],
    'Uruguay': ['uruguayan', 'montevideo'],
    'Uzbekistan': ['uzbek', 'tashkent'],
    'Vanuatu': ['ni-vanuatu', 'port vila'],
    'Venezuela': ['venezuelan', 'caracas', 'rodriguez', 'maduro'],
    'Vietnam': ['vietnamese', 'hanoi', 'ho chi minh'],
    'Yemen': ['yemeni', 'sanaa', 'houthi'],
    'Zambia': ['zambian', 'lusaka'],
    'Zimbabwe': ['zimbabwean', 'harare']
};

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

export async function fetchRSS(feedUrl, sourceName) {
  // Try rss2json first
  try {
    const proxyUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feedUrl);
    const response = await fetch(proxyUrl);
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'ok' && data.items && data.items.length > 0) {
        return parseRSSItems(data, sourceName);
      }
    }
  } catch (error) {
    console.warn(`rss2json failed for ${sourceName}:`, error.message);
  }

  // Fallback: Cloudflare Worker RSS proxy (handles feeds rss2json can't parse)
  try {
    const workerUrl = `${RSS_PROXY_BASE}/rss?url=${encodeURIComponent(feedUrl)}`;
    const response = await fetch(workerUrl);
    if (!response.ok) return [];
    const data = await response.json();
    if (data.status !== 'ok' || !data.items || data.items.length === 0) return [];
    return parseRSSItems(data, sourceName);
  } catch (error) {
    console.warn(`Worker proxy also failed for ${sourceName}:`, error.message);
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
// Format articles for display
// ============================================================

function formatArticlesForDisplay(articles, countryName) {
  const relevant = articles.filter(a => isRelevantToCountry(a.title, a.description, countryName));
  const toUse = relevant.length > 0 ? relevant : articles;
  return toUse.slice(0, 15).map(article => ({
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
// Fetch Live News (callback-based for React)
// ============================================================

export async function fetchLiveNews({ onStatusUpdate, onComplete } = {}) {

  if (onStatusUpdate) onStatusUpdate('fetching');

  try {
    // Fetch from multiple RSS feeds in parallel
    const feedPromises = RSS_FEEDS.daily.map(feed => fetchRSS(feed.url, feed.source));
    const feedResults = await Promise.all(feedPromises);

    const allArticles = feedResults.flat();

    // Log per-source article counts for debugging
    const sourceCounts = {};
    for (let i = 0; i < RSS_FEEDS.daily.length; i++) {
      const name = RSS_FEEDS.daily[i].source;
      const count = feedResults[i] ? feedResults[i].length : 0;
      sourceCounts[name] = count;
    }
    const working = Object.entries(sourceCounts).filter(([, c]) => c > 0);
    const failed = Object.entries(sourceCounts).filter(([, c]) => c === 0);
    console.log(`[Hegemon] RSS feeds: ${working.length} working, ${failed.length} failed, ${allArticles.length} total articles`);
    if (failed.length > 0) console.log('[Hegemon] Failed feeds:', failed.map(([n]) => n).join(', '));

    if (allArticles.length > 0) {
      allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

      // Staleness filter — reject articles older than 48 hours
      const now = Date.now();
      const STALENESS_MS = 48 * 60 * 60 * 1000;
      const freshArticles = allArticles.filter(article => {
        if (!article.pubDate) return true; // keep if no date
        const age = now - new Date(article.pubDate).getTime();
        return age < STALENESS_MS;
      });

      // Filter: irrelevant keywords, sports, domestic noise, non-English, require geo score >= 1
      const relevantArticles = freshArticles.filter(article => {
        const title = article.title || '';
        const text = (title + ' ' + (article.description || '')).toLowerCase();
        if (IRRELEVANT_KEYWORDS.some(kw => text.includes(kw))) return false;
        const category = detectCategory(title, article.description);
        if (category === 'SPORTS') return false;
        const fullText = title + ' ' + (article.description || '');
        if (DOMESTIC_NOISE_PATTERNS.some(p => p.test(fullText))) return false;
        // Filter non-English articles: reject titles with high non-ASCII ratio
        const nonAscii = (title.match(/[^\x00-\x7F]/g) || []).length;
        if (title.length > 10 && nonAscii / title.length > 0.15) return false;
        // Block common non-English patterns
        if (/\b(de|del|los|las|por|para|avec|dans|und|der|die|dari|dan|yang|pada)\b/i.test(title) &&
            !/\b(de facto|del rio|de gaulle)\b/i.test(title)) {
          // Count how many non-English words appear
          const nonEnCount = (title.match(/\b(de|del|los|las|por|para|avec|dans|und|der|die|dari|dan|yang|pada|dari|untuk|dengan|atau|ini|itu|comme|sont|nous|leur)\b/gi) || []).length;
          if (nonEnCount >= 2) return false;
        }
        return scoreGeopoliticalRelevance(fullText) >= 1;
      });

      // Source-aware dedup: only remove TRUE duplicates (syndicated wire copy).
      // Keep articles from different sources about the same event — clustering will group them.
      const seenEntries = []; // {normalized, source}
      const uniqueArticles = relevantArticles.filter(article => {
        const source = formatSourceName(article.source_id);
        const normalized = (article.title || '').toLowerCase()
          .replace(/[^a-z0-9 ]/g, '')
          .replace(/\b(the|a|an|in|on|at|to|for|of|and|is|are|was|were|has|have|had|with|from|by)\b/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        // Exact normalized match from ANY source = syndicated dupe
        if (seenEntries.some(s => s.normalized === normalized)) return false;
        // Overlap check: strict for different sources (95%), looser for same source (70%)
        for (const existing of seenEntries) {
          if (normalized.length > 20 && existing.normalized.length > 20) {
            const wordsA = new Set(normalized.split(' '));
            const wordsB = new Set(existing.normalized.split(' '));
            let overlap = 0;
            for (const w of wordsA) { if (wordsB.has(w)) overlap++; }
            const maxLen = Math.max(wordsA.size, wordsB.size);
            const threshold = existing.source === source ? 0.7 : 0.95;
            if (maxLen > 0 && overlap / maxLen >= threshold) return false;
          }
        }
        seenEntries.push({ normalized, source });
        return true;
      });

      console.log(`[Hegemon] Pipeline: ${allArticles.length} raw → ${freshArticles.length} fresh → ${relevantArticles.length} relevant → ${uniqueArticles.length} unique`);

      // Build new briefing - mutate shared array (200 cap for robust clustering)
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

      // Balance western/non-western source ratio (~67% western, interleaved)
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

      // Cluster articles into events
      const events = clusterArticles(DAILY_BRIEFING);
      DAILY_EVENTS.length = 0;
      DAILY_EVENTS.push(...events);

      saveBriefingSnapshot();
      seedPastBriefingIfEmpty();
      saveNewsToLocalStorage();

      // Dynamic risk analysis
      updateDynamicRisks(DAILY_BRIEFING);

      // Fire off async AI summary requests (non-blocking)
      fetchEventSummaries();

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

          // Cluster articles into events
          const fbEvents = clusterArticles(DAILY_BRIEFING);
          DAILY_EVENTS.length = 0;
          DAILY_EVENTS.push(...fbEvents);

          saveBriefingSnapshot();
          seedPastBriefingIfEmpty();
          saveNewsToLocalStorage();
          updateDynamicRisks(DAILY_BRIEFING);

          fetchEventSummaries();

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

const SUMMARY_CACHE_KEY = 'hegemon_summary_cache';

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
      try { localStorage.setItem(SUMMARY_CACHE_KEY, JSON.stringify(cache)); } catch {}
    }
    return cache;
  } catch { return {}; }
}

function saveSummaryCache(cache) {
  try { localStorage.setItem(SUMMARY_CACHE_KEY, JSON.stringify(cache)); }
  catch (e) { console.warn('Summary cache save failed:', e.message); }
}

export async function fetchEventSummaries() {
  if (!DAILY_EVENTS || DAILY_EVENTS.length === 0) return;

  const cache = loadSummaryCache();
  const uncached = [];

  // Apply cached summaries immediately
  for (const event of DAILY_EVENTS) {
    const key = eventSummaryKey(event);
    if (key && cache[key]) {
      event.summary = cache[key].summary;
      if (cache[key].headline) event.headline = cache[key].headline;
      event.summaryLoading = false;
    } else {
      uncached.push(event);
      event.summaryLoading = true;
    }
  }

  const cachedCount = DAILY_EVENTS.length - uncached.length;
  if (cachedCount > 0) {
    console.log(`[Hegemon] Summaries: ${cachedCount} cached, ${uncached.length} need fetching`);
  }

  // Notify immediately so cached summaries display
  notifyEventsUpdated();

  // If everything is cached, we're done
  if (uncached.length === 0) return;

  // Batch events — send max 15 at a time to avoid overwhelming the worker/Claude
  const BATCH_SIZE = 15;
  for (let batchStart = 0; batchStart < uncached.length; batchStart += BATCH_SIZE) {
    const batch = uncached.slice(batchStart, batchStart + BATCH_SIZE);

    try {
      console.log(`[Hegemon] Fetching summaries for batch ${Math.floor(batchStart / BATCH_SIZE) + 1} (${batch.length} events)`);
      const response = await fetch(`${RSS_PROXY_BASE}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      if (!response.ok) {
        const errText = await response.text().catch(() => 'no body');
        console.error(`[Hegemon] Summary API error (${response.status}):`, errText);
        for (const event of batch) {
          event.summaryLoading = false;
          event.summaryError = true;
        }
        notifyEventsUpdated();
        continue;
      }

      const data = await response.json();
      const summaries = data.summaries || [];

      // Apply summaries and AI-generated headlines, save to cache
      for (let i = 0; i < batch.length; i++) {
        batch[i].summaryLoading = false;
        if (summaries[i] && summaries[i].summary) {
          batch[i].summary = summaries[i].summary;
          if (summaries[i].headline) {
            batch[i].headline = summaries[i].headline;
          }
          const key = eventSummaryKey(batch[i]);
          if (key) {
            cache[key] = {
              headline: batch[i].headline,
              summary: summaries[i].summary,
              savedAt: Date.now()
            };
          }
        } else {
          batch[i].summaryError = true;
        }
      }

      saveSummaryCache(cache);
      notifyEventsUpdated();

    } catch (err) {
      console.error('[Hegemon] Summary fetch error:', err.message || err);
      for (const event of batch) {
        event.summaryLoading = false;
        event.summaryError = true;
      }
      notifyEventsUpdated();
    }
  }
}
