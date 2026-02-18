// apiService.js - News fetching, briefing history, RSS feeds, dynamic risk system

import {
  COUNTRIES, DAILY_BRIEFING, DAILY_BRIEFING_FALLBACK,
  IRRELEVANT_KEYWORDS, GEOPOLITICAL_SIGNALS, STRONG_GEO_SIGNALS,
  DOMESTIC_NOISE_PATTERNS, ESCALATION_KEYWORDS,
  DEESCALATION_KEYWORDS, CATEGORY_WEIGHTS
} from '../data/countries';
import { formatSourceName, timeAgo, getSourceBias, disperseBiasArticles, balanceSourceOrigins } from '../utils/riskColors';

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
      articles: DAILY_BRIEFING.slice(0, 50).map(a => ({
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
    { url: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en', source: 'Google News World' },
    { url: 'https://news.google.com/rss/search?q=world+news+today&hl=en-US&gl=US&ceid=US:en', source: 'Google News' },
    { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC World' },
    { url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml', source: 'Wall Street Journal' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'New York Times' },
    { url: 'https://www.dailymail.co.uk/news/worldnews/index.rss', source: 'Daily Mail' },
    { url: 'https://www.cgtn.com/subscribe/rss/section/world.xml', source: 'CGTN' },
    { url: 'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms', source: 'Times of India' },
    { url: 'https://tass.com/rss/v2.xml', source: 'TASS' },
    { url: 'https://www.scmp.com/rss/91/feed', source: 'South China Morning Post' },
    { url: 'https://moxie.foxnews.com/google-publisher/world.xml', source: 'Fox News' },
    { url: 'https://www.theguardian.com/world/rss', source: 'The Guardian' },
    { url: 'https://nypost.com/feed/', source: 'New York Post' },
    { url: 'https://thehill.com/feed/', source: 'The Hill' },
    { url: 'https://www.washingtontimes.com/rss/headlines/news/world/', source: 'Washington Times' },
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
  if (text.match(/\b(crisis|humanitarian|famine|refugee|disaster|emergency)\b/)) return 'CRISIS';
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

export function isRelevantToCountry(title, description, countryName) {
  const text = ((title || '') + ' ' + (description || '')).toLowerCase();
  const titleLower = (title || '').toLowerCase();
  const descLower = (description || '').toLowerCase();
  const countryLower = countryName.toLowerCase();

  for (const kw of IRRELEVANT_KEYWORDS) {
    if (text.includes(kw)) return false;
  }

  const demonyms = {
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

  const countryTerms = demonyms[countryName] || [countryLower];
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
  // rss2json only — Worker proxy disabled until stable
  try {
    const proxyUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feedUrl);
    const response = await fetch(proxyUrl);
    if (!response.ok) return [];

    const data = await response.json();
    if (data.status !== 'ok' || !data.items) return [];
    return parseRSSItems(data, sourceName);
  } catch (error) {
    console.warn(`RSS fetch failed for ${sourceName}:`, error.message);
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

      // Filter: irrelevant keywords, sports, domestic noise, require geo score >= 1
      const relevantArticles = freshArticles.filter(article => {
        const text = ((article.title || '') + ' ' + (article.description || '')).toLowerCase();
        if (IRRELEVANT_KEYWORDS.some(kw => text.includes(kw))) return false;
        const category = detectCategory(article.title, article.description);
        if (category === 'SPORTS') return false;
        const fullText = (article.title || '') + ' ' + (article.description || '');
        if (DOMESTIC_NOISE_PATTERNS.some(p => p.test(fullText))) return false;
        return scoreGeopoliticalRelevance(fullText) >= 1;
      });

      // Smart deduplicate — catch near-exact dupes but keep distinct stories on same topic
      const seenNormalized = [];
      const uniqueArticles = relevantArticles.filter(article => {
        const normalized = (article.title || '').toLowerCase()
          .replace(/[^a-z0-9 ]/g, '')
          .replace(/\b(the|a|an|in|on|at|to|for|of|and|is|are|was|were|has|have|had|with|from|by)\b/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        // Exact normalized match
        if (seenNormalized.some(s => s === normalized)) return false;
        // Character overlap ratio — only flag as dupe if >= 80% similar
        for (const existing of seenNormalized) {
          if (normalized.length > 20 && existing.length > 20) {
            const wordsA = new Set(normalized.split(' '));
            const wordsB = new Set(existing.split(' '));
            let overlap = 0;
            for (const w of wordsA) { if (wordsB.has(w)) overlap++; }
            const maxLen = Math.max(wordsA.size, wordsB.size);
            if (maxLen > 0 && overlap / maxLen >= 0.8) return false;
          }
        }
        seenNormalized.push(normalized);
        return true;
      });

      // Build new briefing - mutate shared array
      const newArticles = uniqueArticles.slice(0, 50).map(article => {
        const category = detectCategory(article.title, article.description);
        const importance = ['CONFLICT', 'CRISIS', 'SECURITY'].includes(category) ? 'high' : 'medium';
        const sourceName = formatSourceName(article.source_id);
        return {
          time: timeAgo(article.pubDate),
          category,
          importance,
          headline: article.title,
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


      saveBriefingSnapshot();
      seedPastBriefingIfEmpty();

      // Dynamic risk analysis
      updateDynamicRisks(DAILY_BRIEFING);

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

          saveBriefingSnapshot();
          seedPastBriefingIfEmpty();
          updateDynamicRisks(DAILY_BRIEFING);

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
// Article Summarization (via Cloudflare Worker → Claude API)
// ============================================================

export async function summarizeArticles(articles) {
  try {
    const response = await fetch(`${RSS_PROXY_BASE}/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        articles: articles.map(a => ({
          title: a.title || a.headline || '',
          description: a.description || '',
          source: a.source || a.source_id || '',
          url: a.url || a.link || ''
        }))
      })
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.summaries || null;
  } catch {
    return null;
  }
}
