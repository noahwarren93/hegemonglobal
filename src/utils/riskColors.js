// utils.js - Constants, colors, helper functions

import * as THREE from 'three';

export const RISK_COLORS = {
  catastrophic: { hex: '#dc2626', glow: 0xff3333 },
  extreme: { hex: '#f97316', glow: 0xff6600 },
  severe: { hex: '#eab308', glow: 0xffcc00 },
  stormy: { hex: '#8b5cf6', glow: 0x8855ff },
  cloudy: { hex: '#3b82f6', glow: 0x3388ff },
  clear: { hex: '#22c55e', glow: 0x22cc55 }
};

// Source credibility classification (replaces political bias L/R system)
export const SOURCE_CREDIBILITY = {
  // Wire services — most trusted, original reporting
  'Reuters': 'wire', 'AP': 'wire', 'AP News': 'wire', 'Associated Press': 'wire',
  'AFP': 'wire', 'UPI': 'wire', 'PTI': 'wire', 'ANI': 'wire', 'IANS': 'wire',
  'DPA': 'wire', 'EFE': 'wire', 'ANSA': 'wire', 'Yonhap': 'wire', 'Kyodo': 'wire',
  'Kyodo News': 'wire', 'NHK': 'wire', 'NHK World': 'wire', 'CNA': 'wire',
  'Bernama': 'wire',

  // State media — government controlled
  'CGTN': 'state', 'Xinhua': 'state', 'China Daily': 'state', 'Global Times': 'state',
  'TASS': 'state', 'RT': 'state', 'RIA Novosti': 'state', 'Pravda': 'state',
  'Tehran Times': 'state', 'Press TV': 'state', 'Mehr News': 'state',
  'Vietnam News': 'state',

  // State-affiliated — government influence but some editorial independence
  'Al Jazeera': 'state-affiliated', 'TRT World': 'state-affiliated',
  'Anadolu Agency': 'state-affiliated', 'Al Arabiya': 'state-affiliated',
  'Daily Sabah': 'state-affiliated', 'France 24': 'state-affiliated', 'France24': 'state-affiliated',
  'DW': 'state-affiliated', 'DW News': 'state-affiliated', 'Deutsche Welle': 'state-affiliated',
  'BBC': 'state-affiliated', 'BBC World': 'state-affiliated', 'BBC News': 'state-affiliated',
  'ABC Australia': 'state-affiliated', 'CBC': 'state-affiliated', 'CBC News': 'state-affiliated',
  'The National': 'state-affiliated', 'The National UAE': 'state-affiliated',
  'Arab News': 'state-affiliated', 'Gulf News': 'state-affiliated',

  // Tabloid — sensational, lower reliability
  'Daily Mail': 'tabloid', 'Daily Mail UK': 'tabloid', 'New York Post': 'tabloid',
  'The Sun': 'tabloid', 'Daily Express': 'tabloid', 'Metro UK': 'tabloid',
  'Evening Standard': 'tabloid', 'HuffPost': 'tabloid', 'BuzzFeed': 'tabloid',
  'BuzzFeed News': 'tabloid', 'Raw Story': 'tabloid',

  // Specialist — niche expertise, narrow focus
  'Defense One': 'specialist', 'Defense News': 'specialist', 'Breaking Defense': 'specialist',
  'Foreign Affairs': 'specialist', 'Foreign Policy': 'specialist', 'Semafor': 'specialist',
  'MarketWatch': 'specialist', 'Barrons': 'specialist', 'Seeking Alpha': 'specialist',
  'The Economist': 'specialist', 'CNBC': 'specialist', 'Money Control': 'specialist',

  // Independent — standard editorial outlets
  'New York Times': 'independent', 'The New York Times': 'independent', 'NY Times': 'independent',
  'Washington Post': 'independent', 'The Washington Post': 'independent',
  'Wall Street Journal': 'independent', 'The Wall Street Journal': 'independent', 'WSJ': 'independent',
  'CNN': 'independent', 'NPR': 'independent', 'NBC News': 'independent',
  'CBS News': 'independent', 'ABC News': 'independent', 'Fox News': 'independent',
  'The Guardian': 'independent', 'Guardian': 'independent', 'The Independent': 'independent',
  'The Telegraph': 'independent', 'Sky News': 'independent',
  'Time': 'independent', 'TIME': 'independent', 'Politico': 'independent',
  'Bloomberg': 'independent', 'FT': 'independent', 'Financial Times': 'independent',
  'USA Today': 'independent', 'Los Angeles Times': 'independent', 'LA Times': 'independent',
  'Daily Beast': 'independent', 'Mediaite': 'independent',
  'Business Insider': 'independent', 'Insider': 'independent',
  'The New Yorker': 'independent', 'The Atlantic': 'independent',
  'NDTV': 'independent', 'India Today': 'independent', 'Hindustan Times': 'independent',
  'The Print': 'independent', 'Scroll': 'independent', 'Firstpost': 'independent',
  'Kyiv Independent': 'independent', 'Kyiv Post': 'independent',
  'Le Monde': 'independent', 'Der Spiegel': 'independent', 'El País': 'independent',
  'Middle East Eye': 'independent', 'Middle East Monitor': 'independent',
  'Folha': 'independent', 'Sydney Morning Herald': 'independent',
  'Politico EU': 'independent', 'Irish Times': 'independent',
  'Deccan Herald': 'independent', 'Indian Express': 'independent',
  'Asahi Shimbun': 'independent', 'Live Mint': 'independent',
  'The Conversation': 'independent', 'Times of Israel': 'independent',
  'Chicago Tribune': 'independent', 'Miami Herald': 'independent',
  'Axios': 'independent', 'Haaretz': 'independent',
  'The Hill': 'independent', 'PBS': 'independent',
  'Nikkei': 'independent', 'Nikkei Asia': 'independent',
  'UN News': 'independent', 'The Hindu': 'independent',
  'Korea Times': 'independent', 'Korea Herald': 'independent',
  'SCMP': 'independent', 'South China Morning Post': 'independent',
  'Euronews': 'independent', 'Dawn': 'independent', 'Express Tribune': 'independent',
  'Geo News': 'independent', 'Pakistan Today': 'independent', 'The News': 'independent',
  'Straits Times': 'independent', 'Japan Times': 'independent', 'Bangkok Post': 'independent',
  'VnExpress': 'independent', 'NZ Herald': 'independent', 'RNZ': 'independent', 'RTÉ': 'independent',
  'Africa News': 'independent', 'Africanews': 'independent',
  'Jakarta Post': 'independent', 'The Jakarta Post': 'independent',
  'Nation Kenya': 'independent', 'Clarín': 'independent',
  'Premium Times': 'independent', 'News24': 'independent', 'Times Live': 'independent',
  'Mail & Guardian': 'independent', 'East African': 'independent',
  'Standard Media': 'independent', 'Daily Nation': 'independent',
  'PhilStar': 'independent', 'Inquirer': 'independent', 'Manila Times': 'independent',
  'The Star Malaysia': 'independent', 'Stuff NZ': 'independent', 'Nine News': 'independent',
  'Dutch News': 'independent', 'The Local': 'independent',
  'WION': 'independent', 'Economic Times': 'independent',
  'Fortune': 'independent', 'Forbes': 'independent', 'Newsweek': 'independent',
  'Google News': 'independent',
  'Washington Times': 'independent', 'The Dispatch': 'independent',
  'RealClearPolitics': 'independent', 'The Australian': 'independent',
  'Jerusalem Post': 'independent', 'O Globo': 'independent', 'La Nación': 'independent',
  'Times of India': 'independent', 'ARY News': 'independent', 'Washington Examiner': 'independent',
  'Globe and Mail': 'independent', 'Daily Star Bangladesh': 'independent', 'Daily Star': 'independent',
  'Tempo': 'independent', 'Buenos Aires Herald': 'independent', 'Taipei Times': 'independent',
  'Rappler': 'independent',
  'The Intercept': 'independent', 'Democracy Now': 'independent', 'Jacobin': 'independent',
  'Mother Jones': 'independent', 'MSNBC': 'independent', 'Vox': 'independent', 'Slate': 'independent',
  'The Nation': 'independent', 'The Wire': 'independent',
  'Daily Wire': 'independent', 'Breitbart': 'independent', 'The Blaze': 'independent',
  'Newsmax': 'independent', 'Daily Caller': 'independent', 'National Review': 'independent',
  'The Federalist': 'independent', 'New York Sun': 'independent',
};

export const CREDIBILITY_COLORS = {
  'wire': '#22c55e',
  'state': '#ef4444',
  'state-affiliated': '#f97316',
  'independent': '#3b82f6',
  'tabloid': '#eab308',
  'specialist': '#8b5cf6'
};

const CREDIBILITY_LABELS = {
  'wire': 'Wire Service',
  'state': 'State Media',
  'state-affiliated': 'State-Affiliated',
  'independent': 'Independent',
  'tabloid': 'Tabloid',
  'specialist': 'Specialist'
};

// Sources to completely block from ingestion
export const SOURCE_BLOCKLIST = new Set([
  'beincrypto', 'wallpaper', 'dezeen', 'archdaily',
  'coindesk', 'cointelegraph', 'cryptonews', 'decrypt',
  'vogue', 'elle', 'cosmopolitan', 'glamour',
  'tmz', 'people', 'us weekly', 'entertainment tonight',
  'espn', 'bleacher report', 'sports illustrated',
  'food network', 'bon appetit', 'eater',
]);

export function getSourceCredibility(source) {
  if (!source) return null;
  // Check blocklist
  if (SOURCE_BLOCKLIST.has(source.toLowerCase())) return 'blocked';
  // Try exact match first
  if (SOURCE_CREDIBILITY[source]) return SOURCE_CREDIBILITY[source];
  // Partial match - prefer longest matching key, skip short keys to avoid false positives
  const srcLower = source.toLowerCase();
  let bestKey = null, bestLen = 0;
  Object.keys(SOURCE_CREDIBILITY).forEach(k => {
    if (k.length < 4) return;
    const kLower = k.toLowerCase();
    if (srcLower.includes(kLower) || kLower.includes(srcLower)) {
      if (k.length > bestLen) { bestLen = k.length; bestKey = k; }
    }
  });
  return bestKey ? SOURCE_CREDIBILITY[bestKey] : 'independent';
}

export function renderCredibilityTag(source) {
  const cred = getSourceCredibility(source);
  if (!cred || cred === 'blocked') return '';
  const color = CREDIBILITY_COLORS[cred] || '#6b7280';
  const label = CREDIBILITY_LABELS[cred] || cred;
  return `<span style="display:inline-flex;align-items:center;margin-left:6px;vertical-align:middle;">`
    + `<span style="font-size:7px;color:${color};font-weight:600;white-space:nowrap;background:${color}1a;padding:1px 5px;border-radius:3px;border:1px solid ${color}33;">${label}</span>`
    + `</span>`;
}

// Legacy aliases for backward compatibility
export const SOURCE_BIAS = SOURCE_CREDIBILITY;
export function getSourceBias(source) { return getSourceCredibility(source); }
export function renderBiasTag(source) { return renderCredibilityTag(source); }
export function disperseBiasArticles(articles) { return articles; }
export function getStateMediaLabel(source) {
  const cred = getSourceCredibility(source);
  if (cred === 'state') {
    // Return country label for state media
    const stateLabels = {
      'CGTN': 'China · State Media', 'Xinhua': 'China · State Media',
      'China Daily': 'China · State Media', 'Global Times': 'China · State Media',
      'TASS': 'Russia · State Media', 'RT': 'Russia · State Media',
      'RIA Novosti': 'Russia · State Media', 'Pravda': 'Russia · State Media',
      'Tehran Times': 'Iran · State Media', 'Press TV': 'Iran · State Media',
      'Mehr News': 'Iran · State Media', 'Vietnam News': 'Vietnam · State Media',
    };
    if (!source) return null;
    if (stateLabels[source]) return stateLabels[source];
    for (const key of Object.keys(stateLabels)) {
      if (key.length >= 4 && source.toLowerCase().includes(key.toLowerCase())) {
        return stateLabels[key];
      }
    }
    return 'State Media';
  }
  if (cred === 'state-affiliated') {
    const affLabels = {
      'Al Jazeera': 'Qatar · State-Affiliated', 'Al Arabiya': 'Saudi Arabia · State-Affiliated',
      'TRT World': 'Turkey · State-Affiliated', 'Anadolu Agency': 'Turkey · State-Affiliated',
      'Daily Sabah': 'Turkey · State-Affiliated',
      'France 24': 'France · State-Affiliated', 'France24': 'France · State-Affiliated',
      'DW': 'Germany · State-Affiliated', 'DW News': 'Germany · State-Affiliated', 'Deutsche Welle': 'Germany · State-Affiliated',
      'BBC': 'UK · State-Affiliated', 'BBC World': 'UK · State-Affiliated', 'BBC News': 'UK · State-Affiliated',
      'ABC Australia': 'Australia · State-Affiliated', 'CBC': 'Canada · State-Affiliated', 'CBC News': 'Canada · State-Affiliated',
      'The National': 'UAE · State-Affiliated', 'The National UAE': 'UAE · State-Affiliated',
      'Arab News': 'Saudi Arabia · State-Affiliated', 'Gulf News': 'UAE · State-Affiliated',
    };
    if (!source) return null;
    if (affLabels[source]) return affLabels[source];
    for (const key of Object.keys(affLabels)) {
      if (key.length >= 4 && source.toLowerCase().includes(key.toLowerCase())) {
        return affLabels[key];
      }
    }
    return 'State-Affiliated';
  }
  return null;
}

// Extract the effective display source from an article (handles Google News embedding)
function getEffectiveSource(article) {
  let source = article.source || '';
  const headline = article.headline || article.title || '';
  if (source.includes('Google News') && headline) {
    const dashIdx = headline.lastIndexOf(' - ');
    if (dashIdx > 0) source = headline.substring(dashIdx + 3).trim();
  }
  return source;
}

// Non-western source classification for feed balancing
const NON_WESTERN_SOURCES = new Set([
  'cgtn', 'xinhua', 'china daily', 'global times', 'south china morning post', 'scmp',
  'tass', 'rt', 'ria novosti', 'pravda',
  'times of india', 'ndtv', 'hindustan times', 'indian express', 'the hindu', 'the print',
  'the wire', 'scroll', 'firstpost', 'india today', 'live mint', 'economic times', 'wion',
  'al jazeera', 'al arabiya', 'arab news', 'gulf news', 'daily sabah', 'trt world',
  'anadolu agency', 'tehran times', 'press tv', 'middle east monitor', 'middle east eye',
  'mehr news',
  'dawn', 'geo news', 'ary news', 'express tribune',
  'nhk world', 'nhk', 'kyodo news', 'kyodo',
  'nikkei asia', 'japan times', 'korea herald', 'korea times', 'asahi shimbun', 'yonhap',
  'straits times', 'cna', 'bangkok post', 'bernama', 'vnexpress',
  'france 24', 'france24', 'deutsche welle', 'dw', 'dw news',
  'o globo', 'folha', 'clarín', 'la nación',
  'the hindu', 'times of israel', 'africa news', 'africanews',
  'haaretz', 'jakarta post', 'the jakarta post', 'nation kenya', 'daily nation',
  'daily star bangladesh', 'daily star', 'the daily star',
  'tempo', 'the national', 'the national uae',
  'buenos aires herald', 'taipei times', 'vietnam news',
  'rappler', 'premium times', 'mail & guardian', 'mail and guardian'
]);

function isNonWesternSource(source) {
  if (!source) return false;
  return NON_WESTERN_SOURCES.has(source.toLowerCase());
}

// Balance western/non-western sources: ~67% western, ~33% non-western, interleaved
export function balanceSourceOrigins(articles) {
  if (articles.length < 4) return articles;

  const western = [];
  const nonWestern = [];

  for (const article of articles) {
    const source = getEffectiveSource(article);
    if (isNonWesternSource(source)) {
      nonWestern.push(article);
    } else {
      western.push(article);
    }
  }

  // If either pool is empty or tiny, no balancing needed
  if (nonWestern.length === 0 || western.length === 0) return articles;

  // Interleave: 2 western, 1 non-western, repeat
  const result = [];
  let wi = 0, nwi = 0;

  while (wi < western.length || nwi < nonWestern.length) {
    // 2 western
    if (wi < western.length) result.push(western[wi++]);
    if (wi < western.length) result.push(western[wi++]);
    // 1 non-western
    if (nwi < nonWestern.length) result.push(nonWestern[nwi++]);
  }

  return result;
}

// Ensure at least 1 non-western source in top stories
// Picks the most geopolitically significant non-western article and places it at position 3
export function ensureNonWesternInTopStories(topStories, allArticles) {
  if (topStories.length === 0) return topStories;

  // Check if any top story is already non-western
  const hasNonWestern = topStories.some(a => isNonWesternSource(getEffectiveSource(a)));
  if (hasNonWestern) return topStories;

  // Rank categories by geopolitical significance
  const categoryRank = { CONFLICT: 6, CRISIS: 5, SECURITY: 4, DIPLOMACY: 3, POLITICS: 2, ECONOMY: 1 };

  // Find non-western candidates not already in top stories
  const topHeadlines = new Set(topStories.map(a => (a.headline || '').toLowerCase().slice(0, 50)));
  const candidates = allArticles.filter(a => {
    if (topHeadlines.has((a.headline || '').toLowerCase().slice(0, 50))) return false;
    return isNonWesternSource(getEffectiveSource(a));
  });

  if (candidates.length === 0) return topStories;

  // Pick the most geopolitically significant candidate
  candidates.sort((a, b) => (categoryRank[b.category] || 0) - (categoryRank[a.category] || 0));

  const result = [...topStories];
  const insertPos = Math.min(3, result.length);
  result.splice(insertPos, 0, candidates[0]);
  if (result.length > 5) result.length = 5;

  return result;
}

// Enforce source diversity: no single source more than maxPerSource times
export function enforceSourceDiversity(articles, maxPerSource = 2) {
  const counts = {};
  return articles.filter(article => {
    const source = getEffectiveSource(article);
    const key = source.toLowerCase();
    counts[key] = (counts[key] || 0) + 1;
    return counts[key] <= maxPerSource;
  });
}

export function formatSourceName(sourceId) {
  if (!sourceId) return 'News';
  const id = sourceId.toLowerCase();

  // Comprehensive source mapping
  const sourceMap = {
    // Major International
    'bbc': 'BBC News', 'reuters': 'Reuters', 'aljazeera': 'Al Jazeera', 'theguardian': 'The Guardian',
    'apnews': 'AP News', 'afp': 'AFP', 'dw': 'Deutsche Welle', 'france24': 'France 24',
    // US News
    'cnn': 'CNN', 'nytimes': 'NY Times', 'washingtonpost': 'Washington Post', 'wsj': 'Wall Street Journal',
    'usatoday': 'USA Today', 'latimes': 'LA Times', 'chicagotribune': 'Chicago Tribune',
    'abc': 'ABC News', 'nbc': 'NBC News', 'cbs': 'CBS News', 'fox': 'Fox News', 'foxnews': 'Fox News',
    'nypost': 'New York Post', 'newyorkpost': 'New York Post', 'newsmax': 'Newsmax',
    'npr': 'NPR', 'pbs': 'PBS', 'politico': 'Politico', 'thehill': 'The Hill', 'axios': 'Axios',
    'huffpost': 'HuffPost', 'buzzfeed': 'BuzzFeed', 'vox': 'Vox', 'slate': 'Slate',
    'yardbarker': 'Yardbarker', 'espn': 'ESPN', 'cbssports': 'CBS Sports', 'si': 'Sports Illustrated',
    // Business/Finance
    'bloomberg': 'Bloomberg', 'ft': 'Financial Times', 'economist': 'The Economist',
    'cnbc': 'CNBC', 'marketwatch': 'MarketWatch', 'forbes': 'Forbes', 'fortune': 'Fortune',
    'businessinsider': 'Business Insider', 'insider': 'Insider', 'barrons': 'Barrons',
    'benzinga': 'Benzinga', 'investorplace': 'InvestorPlace', 'seekingalpha': 'Seeking Alpha',
    'thestreet': 'TheStreet', 'investopedia': 'Investopedia', 'kiplinger': 'Kiplinger',
    'biztoc': 'BizToc', 'bizjournals': 'Biz Journals', 'ibtimes': 'IB Times',
    // UK News
    'sky': 'Sky News', 'telegraph': 'The Telegraph', 'independent': 'The Independent',
    'mirror': 'The Mirror', 'express': 'Daily Express', 'metro': 'Metro UK', 'thesun': 'The Sun',
    'dailymail': 'Daily Mail', 'dailymailuk': 'Daily Mail UK', 'eveningstandard': 'Evening Standard',
    'londonlovesbusiness': 'London Loves Business', 'cityam': 'City A.M.',
    // Middle East
    'dailysabah': 'Daily Sabah', 'jpost': 'Jerusalem Post', 'timesofisrael': 'Times of Israel',
    'haaretz': 'Haaretz', 'middleeastmonitor': 'Middle East Monitor', 'middleeasteye': 'Middle East Eye',
    'arabnews': 'Arab News', 'gulfnews': 'Gulf News', 'zawya': 'Zawya', 'alarabiya': 'Al Arabiya',
    'trtworld': 'TRT World', 'aa': 'Anadolu Agency', 'tehrantimes': 'Tehran Times',
    'menafn': 'MENAFN', 'albawaba': 'Al Bawaba', 'middleeaststar': 'Middle East Star',
    // Asia - Pakistan
    'tribune_pk': 'Express Tribune', 'expresstribune': 'Express Tribune', 'dawn': 'Dawn',
    'geo': 'Geo News', 'arynews': 'ARY News', 'thenews': 'The News', 'pakistantoday': 'Pakistan Today',
    // Asia - India
    'thehindu': 'The Hindu', 'hindustantimes': 'Hindustan Times', 'ndtv': 'NDTV',
    'indiatoday': 'India Today', 'mathrubhumi': 'Mathrubhumi', 'timesofindia': 'Times of India',
    'toi': 'Times of India', 'indianexpress': 'Indian Express', 'deccanherald': 'Deccan Herald',
    'theprint': 'The Print', 'thewire': 'The Wire', 'scroll': 'Scroll', 'firstpost': 'Firstpost',
    'livemint': 'Live Mint', 'moneycontrol': 'Money Control', 'economictimes': 'Economic Times',
    // Asia - Others
    'scmp': 'South China Morning Post', 'straitstimes': 'Straits Times', 'channelnewsasia': 'CNA',
    'nikkei': 'Nikkei Asia', 'japantimes': 'Japan Times', 'koreaherald': 'Korea Herald',
    'koreatimes': 'Korea Times', 'asahi': 'Asahi Shimbun', 'bangkokpost': 'Bangkok Post',
    'xinhua': 'Xinhua', 'globaltimes': 'Global Times', 'chinadaily': 'China Daily', 'cgtn': 'CGTN',
    'nhk': 'NHK World', 'nhkworld': 'NHK World', 'kyodo': 'Kyodo News', 'kyodonews': 'Kyodo News',
    'mehrnews': 'Mehr News', 'jakartapost': 'Jakarta Post', 'thejakartapost': 'Jakarta Post',
    'africanews': 'Africa News', 'nationkenya': 'Nation Kenya',
    'philstar': 'PhilStar', 'inquirer': 'Inquirer', 'manilatimes': 'Manila Times',
    'thestar': 'The Star Malaysia', 'bernama': 'Bernama', 'vnexpress': 'VnExpress',
    'rappler': 'Rappler', 'taipeitimes': 'Taipei Times', 'vietnamnews': 'Vietnam News',
    'thenational': 'The National', 'thenationalnews': 'The National',
    'tempo': 'Tempo', 'dailystar': 'Daily Star Bangladesh', 'thedailystar': 'Daily Star Bangladesh',
    'globeandmail': 'Globe and Mail', 'theglobeandmail': 'Globe and Mail',
    'buenosairesherald': 'Buenos Aires Herald',
    // Russia/Eastern Europe
    'rt': 'RT', 'tass': 'TASS', 'ria': 'RIA Novosti', 'pravda': 'Pravda',
    'kyivindependent': 'Kyiv Independent', 'kyivpost': 'Kyiv Post', 'unian': 'UNIAN',
    // Europe
    'efe': 'EFE', 'ansa': 'ANSA', 'dpa': 'DPA', 'lemonde': 'Le Monde', 'spiegel': 'Der Spiegel',
    'elpais': 'El País', 'rte': 'RTÉ', 'irishtimes': 'Irish Times', 'dutchnews': 'Dutch News',
    'thelocal': 'The Local', 'euronews': 'Euronews', 'politicoeu': 'Politico EU',
    'rmoutlook': 'RM Outlook', 'rmf24': 'RMF24', 'onet': 'Onet',
    // Africa
    'legit': 'Legit News', 'punch': 'Punch Nigeria', 'vanguard': 'Vanguard Nigeria',
    'dailynigerian': 'Daily Nigerian', 'premiumtimes': 'Premium Times', 'nation': 'The Nation',
    'iol': 'IOL', 'news24': 'News24', 'timeslive': 'Times Live', 'mg': 'Mail & Guardian',
    'theeastafrican': 'East African', 'standardmedia': 'Standard Media', 'nation_ke': 'Daily Nation',
    // Latin America
    'globo': 'O Globo', 'folha': 'Folha', 'clarin': 'Clarín', 'lanacion': 'La Nación',
    'eluniversal': 'El Universal', 'milenio': 'Milenio', 'reforma': 'Reforma',
    // Canada
    'cbc': 'CBC News', 'cbcnews': 'CBC News',
    // Australia/Oceania
    'abc_au': 'ABC Australia', 'smh': 'Sydney Morning Herald', 'theaustralian': 'The Australian',
    'nzherald': 'NZ Herald', 'stuff': 'Stuff NZ', 'rnz': 'RNZ', '9news': 'Nine News',
    // Tech News
    'techcrunch': 'TechCrunch', 'theverge': 'The Verge', 'wired': 'Wired', 'arstechnica': 'Ars Technica',
    'engadget': 'Engadget', 'cnet': 'CNET', 'zdnet': 'ZDNet', 'tomshardware': 'Toms Hardware',
    'gizmodo': 'Gizmodo', 'mashable': 'Mashable', 'venturebeat': 'VentureBeat',
    // Wire Services & Others
    'upi': 'UPI', 'pti': 'PTI', 'ani': 'ANI', 'ians': 'IANS',
    'report_az': 'Report Azerbaijan', 'spsrasd_info': 'Sahara Press', 'wionews': 'WION',
    // Aggregators & Others
    'newsweek': 'Newsweek', 'time': 'TIME', 'theatlantic': 'The Atlantic', 'newyorker': 'The New Yorker',
    'foreignpolicy': 'Foreign Policy', 'foreignaffairs': 'Foreign Affairs', 'theconversation': 'The Conversation',
    'defenseone': 'Defense One', 'defensenews': 'Defense News', 'breakingdefense': 'Breaking Defense',
    'oilprice': 'OilPrice', 'hellenicshippingnews': 'Hellenic Shipping', 'lloydslist': 'Lloyds List',
    'semafor': 'Semafor', 'puck': 'Puck', 'theintercept': 'The Intercept', 'motherjones': 'Mother Jones',
    'nationalreview': 'National Review', 'dailywire': 'Daily Wire', 'breitbart': 'Breitbart',
    'rawstory': 'Raw Story', 'mediaite': 'Mediaite', 'thedailybeast': 'Daily Beast'
  };

  if (sourceMap[id]) return sourceMap[id];

  // Smart formatting for unknown sources
  return sourceId
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map(word => {
      if (word.length <= 3 && word === word.toUpperCase()) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ')
    .trim();
}

// Calculate time ago with cleaner display

export function timeAgo(dateString) {
  if (!dateString) return 'Recent';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString; // Already relative string — pass through

  const now = new Date();
  const diffMs = now - date;

  if (diffMs < 0) return 'Just now'; // Future dates
  if (diffMs < 60000) return 'Just now';

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return diffMins + 'm ago';
  if (diffHours < 24) return diffHours + 'h ago';
  if (diffDays < 30) return diffDays === 1 ? '1 day ago' : diffDays + ' days ago';
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return diffMonths === 1 ? '1 month ago' : diffMonths + ' months ago';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export const COUNTRY_TRENDS = {
  // Active conflicts - consistently high
  'Ukraine': [90, 92, 88, 90, 95, 92, 90, 88, 90, 92, 90, 92], // Ongoing war, fluctuates with offensives
  'Russia': [85, 88, 85, 88, 90, 88, 85, 88, 90, 88, 90, 92], // Tied to Ukraine war
  'Palestine': [95, 98, 95, 92, 90, 88, 85, 88, 92, 95, 92, 90], // Gaza war + West Bank tensions
  'Israel': [80, 85, 82, 78, 75, 72, 70, 72, 75, 78, 75, 78], // Regional tensions persist
  'Sudan': [75, 80, 85, 90, 92, 95, 95, 95, 92, 92, 95, 95], // Civil war escalated Apr 2023
  'Myanmar': [70, 72, 75, 78, 80, 82, 85, 85, 88, 88, 85, 85], // Resistance gaining ground
  'Yemen': [80, 78, 80, 82, 85, 88, 85, 82, 80, 78, 80, 82], // Houthi Red Sea attacks
  'Haiti': [75, 78, 80, 85, 88, 90, 92, 92, 90, 88, 90, 92], // Gang violence worsening
  'Afghanistan': [85, 85, 82, 80, 82, 85, 85, 88, 85, 85, 88, 88], // Taliban control, humanitarian crisis
  'DRC': [78, 80, 82, 85, 88, 85, 82, 85, 88, 90, 88, 88], // M23 conflict ongoing
  'Somalia': [80, 78, 80, 82, 80, 78, 80, 82, 85, 82, 80, 82], // Al-Shabaab persistent

  // Major geopolitical hotspots
  'China': [55, 58, 55, 52, 55, 58, 60, 58, 55, 58, 60, 58], // Taiwan tensions, economic issues
  'Taiwan': [50, 55, 52, 50, 55, 58, 55, 52, 55, 58, 60, 58], // Cross-strait tensions
  'Iran': [65, 68, 70, 72, 75, 78, 75, 72, 70, 72, 75, 78], // Nuclear program, regional proxy wars
  'North Korea': [60, 62, 65, 68, 65, 62, 65, 68, 70, 68, 65, 68], // Missile tests continue
  'Venezuela': [55, 58, 60, 62, 65, 68, 70, 72, 75, 78, 85, 88], // Spiked after Maduro capture
  'Syria': [70, 68, 70, 72, 70, 68, 65, 62, 60, 58, 55, 52], // Assad fell, transitioning
  'Lebanon': [60, 62, 65, 68, 70, 75, 78, 75, 72, 68, 65, 62], // Post-war rebuilding

  // Political transitions
  'South Korea': [35, 38, 45, 55, 65, 70, 68, 65, 60, 55, 50, 48], // Political crisis peaked
  'Germany': [30, 32, 35, 40, 45, 50, 48, 45, 42, 38, 35, 32], // Coalition collapsed, new govt
  'France': [40, 42, 45, 48, 50, 52, 55, 52, 50, 48, 45, 48], // Political instability
  'Japan': [25, 28, 30, 35, 40, 45, 50, 48, 45, 42, 38, 35], // Snap election, new PM

  // Stable countries - low consistent values
  'United States': [35, 38, 35, 32, 35, 38, 40, 38, 35, 38, 40, 42], // Domestic tensions, foreign policy
  'United Kingdom': [25, 28, 25, 22, 25, 28, 30, 28, 25, 28, 25, 28], // Generally stable
  'Canada': [15, 18, 15, 12, 15, 18, 20, 18, 15, 18, 15, 18], // Stable democracy
  'Australia': [15, 18, 15, 18, 20, 18, 15, 18, 20, 18, 15, 18], // Stable
};

// Key risk indicators for countries
export const COUNTRY_INDICATORS = {
  'Ukraine': [{ text: 'Conflict', dir: 'up' }, { text: 'Aid Flow', dir: 'stable' }, { text: 'Diplomacy', dir: 'down' }],
  'Russia': [{ text: 'Sanctions', dir: 'up' }, { text: 'Economy', dir: 'down' }, { text: 'Military', dir: 'stable' }],
  'Palestine': [{ text: 'Humanitarian', dir: 'up' }, { text: 'Territorial Dispute', dir: 'up' }, { text: 'Ceasefire', dir: 'stable' }],
  'Israel': [{ text: 'Security', dir: 'up' }, { text: 'Politics', dir: 'down' }, { text: 'Regional', dir: 'up' }],
  'Sudan': [{ text: 'Violence', dir: 'up' }, { text: 'Famine', dir: 'up' }, { text: 'Displacement', dir: 'up' }],
  'Myanmar': [{ text: 'Resistance', dir: 'up' }, { text: 'Junta Control', dir: 'down' }, { text: 'Refugees', dir: 'up' }],
  'Yemen': [{ text: 'Houthi Activity', dir: 'up' }, { text: 'Shipping', dir: 'down' }, { text: 'Peace Talks', dir: 'stable' }],
  'Haiti': [{ text: 'Gang Violence', dir: 'up' }, { text: 'Government', dir: 'down' }, { text: 'Migration', dir: 'up' }],
  'China': [{ text: 'Taiwan Tension', dir: 'up' }, { text: 'Economy', dir: 'down' }, { text: 'US Relations', dir: 'down' }],
  'Taiwan': [{ text: 'China Threat', dir: 'up' }, { text: 'US Support', dir: 'up' }, { text: 'Defense', dir: 'up' }],
  'Iran': [{ text: 'Nuclear', dir: 'up' }, { text: 'Sanctions', dir: 'stable' }, { text: 'Proxies', dir: 'up' }],
  'North Korea': [{ text: 'Missiles', dir: 'up' }, { text: 'Isolation', dir: 'stable' }, { text: 'Provocations', dir: 'up' }],
  'Venezuela': [{ text: 'Transition', dir: 'up' }, { text: 'Stability', dir: 'down' }, { text: 'US Pressure', dir: 'up' }],
  'Syria': [{ text: 'Rebuilding', dir: 'up' }, { text: 'Stability', dir: 'up' }, { text: 'Refugees Return', dir: 'stable' }],
  'South Korea': [{ text: 'Politics', dir: 'down' }, { text: 'Economy', dir: 'stable' }, { text: 'North Threat', dir: 'stable' }],
  'United States': [{ text: 'Polarization', dir: 'up' }, { text: 'Economy', dir: 'stable' }, { text: 'Global Role', dir: 'stable' }],
};

// Get trend data - use real data if available, otherwise generate based on risk level
export function getTrendData(countryName, risk) {
  if (COUNTRY_TRENDS[countryName]) {
    return COUNTRY_TRENDS[countryName];
  }
  // Fallback: generate consistent data based on risk level
  const baseValues = { catastrophic: 85, extreme: 70, severe: 55, stormy: 40, cloudy: 25, clear: 10 };
  const base = baseValues[risk] || 50;
  const trends = [];
  for (let i = 0; i < 12; i++) {
    // Use country name as seed for consistent pseudo-random variation
    const seed = (countryName.charCodeAt(i % countryName.length) + i) % 20 - 10;
    trends.push(Math.max(5, Math.min(100, base + seed)));
  }
  return trends;
}

// Render risk trend chart with indicators
export function renderTrendChart(countryName, risk) {
  const data = getTrendData(countryName, risk);
  const max = Math.max(...data);
  const indicators = COUNTRY_INDICATORS[countryName] || [];
  const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];

  return `
    <div style="display:flex;gap:16px;align-items:flex-start;">
      <div style="flex:1;">
        <div class="trend-chart">
          ${data.map((val, i) => {
            const height = (val / max) * 25 + 5;
            const trend = i > 0 ? (val > data[i-1] ? 'up' : val < data[i-1] ? 'down' : 'stable') : 'stable';
            return `<div class="trend-bar trend-${trend}" style="height:${height}px" title="${months[i]} 2025: ${val}"></div>`;
          }).join('')}
        </div>
        <div class="trend-label">Mar 2025 → Feb 2026</div>
      </div>
      ${indicators.length > 0 ? `
        <div style="min-width:100px;">
          <div style="font-size:8px;color:#6b7280;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">Key Indicators</div>
          ${indicators.map(ind => `
            <div style="font-size:9px;color:#d1d5db;margin-bottom:4px;display:flex;align-items:center;gap:4px;">
              <span style="color:${ind.dir === 'up' ? '#ef4444' : ind.dir === 'down' ? '#22c55e' : '#6b7280'}">${ind.dir === 'up' ? '↑' : ind.dir === 'down' ? '↓' : '→'}</span>
              ${ind.text}
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

// Conflict zones data (lat, lng, radius, intensity)

export const CONFLICT_ZONES = [
  { lat: 48.5, lng: 35.0, radius: 0.15, name: 'Ukraine-Russia', intensity: 1.0 },
  { lat: 30.5, lng: 35.2, radius: 0.10, name: 'Palestine', intensity: 1.0 },
  { lat: 15.5, lng: 32.5, radius: 0.12, name: 'Sudan', intensity: 0.9 },
  { lat: 21.0, lng: 96.0, radius: 0.10, name: 'Myanmar', intensity: 0.8 },
  { lat: 15.5, lng: 47.5, radius: 0.10, name: 'Yemen', intensity: 0.8 },
  { lat: 2.0, lng: 45.0, radius: 0.08, name: 'Somalia', intensity: 0.7 },
  { lat: -2.0, lng: 28.0, radius: 0.12, name: 'DRC East', intensity: 0.8 },
  { lat: 33.5, lng: 36.5, radius: 0.06, name: 'Syria', intensity: 0.7 },
  { lat: 18.5, lng: -72.3, radius: 0.04, name: 'Haiti', intensity: 0.7 },
  { lat: 17.0, lng: -3.0, radius: 0.10, name: 'Sahel', intensity: 0.8 }
];

// Cached conflict zone meshes for animation (avoids iterating all globe children every frame)
const _conflictZoneMeshes = [];

// Add conflict zones to globe
export function addConflictZones(globe, latLngToVector3) {
  _conflictZoneMeshes.length = 0;

  CONFLICT_ZONES.forEach(zone => {
    // Create pulsing conflict zone circle
    const geometry = new THREE.RingGeometry(zone.radius * 0.5, zone.radius, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff3333,
      transparent: true,
      opacity: 0.3 * zone.intensity,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(geometry, material);

    const pos = latLngToVector3(zone.lat, zone.lng, 1.01);
    ring.position.copy(pos);
    ring.lookAt(new THREE.Vector3(0, 0, 0));
    ring.userData = { isConflictZone: true, intensity: zone.intensity, baseOpacity: 0.3 * zone.intensity };

    globe.add(ring);
    _conflictZoneMeshes.push(ring);

    // Add outer glow ring
    const glowGeom = new THREE.RingGeometry(zone.radius, zone.radius * 1.3, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xff6666,
      transparent: true,
      opacity: 0.15 * zone.intensity,
      side: THREE.DoubleSide
    });
    const glow = new THREE.Mesh(glowGeom, glowMat);
    glow.position.copy(pos);
    glow.lookAt(new THREE.Vector3(0, 0, 0));
    glow.userData = { isConflictZone: true, isGlow: true };
    globe.add(glow);
  });
}

// Animate conflict zones (pulsing effect) - uses cached mesh references
export function animateConflictZones() {
  if (_conflictZoneMeshes.length === 0) return;
  const time = Date.now() * 0.002;

  for (let i = 0; i < _conflictZoneMeshes.length; i++) {
    const mesh = _conflictZoneMeshes[i];
    const pulse = 0.5 + 0.5 * Math.sin(time * mesh.userData.intensity);
    mesh.material.opacity = mesh.userData.baseOpacity * (0.5 + 0.5 * pulse);
  }
}
