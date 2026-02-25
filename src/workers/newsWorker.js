// newsWorker.js — Web Worker for off-main-thread news processing
// Handles: RSS fetching, filtering, deduplication, bias balancing, clustering

import {
  IRRELEVANT_KEYWORDS, GEOPOLITICAL_SIGNALS, STRONG_GEO_SIGNALS,
  DOMESTIC_NOISE_PATTERNS, DAILY_BRIEFING_FALLBACK
} from '../data/countries';
import { clusterArticles } from '../services/eventsService';

const RSS_PROXY_BASE = 'https://hegemon-rss-proxy.hegemonglobal.workers.dev';

// ============================================================
// RSS Feed Configuration (duplicated from apiService — worker can't import it)
// ============================================================

const RSS_FEEDS = {
  daily: [
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
  ]
};

// ============================================================
// Inlined utility functions (from riskColors.js — can't import THREE.js in worker)
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

function formatSourceName(sourceId) {
  if (!sourceId) return 'News';
  const id = sourceId.toLowerCase();
  const sourceMap = {
    'bbc': 'BBC News', 'reuters': 'Reuters', 'aljazeera': 'Al Jazeera', 'theguardian': 'The Guardian',
    'apnews': 'AP News', 'afp': 'AFP', 'dw': 'Deutsche Welle', 'france24': 'France 24',
    'cnn': 'CNN', 'nytimes': 'NY Times', 'washingtonpost': 'Washington Post', 'wsj': 'Wall Street Journal',
    'usatoday': 'USA Today', 'latimes': 'LA Times', 'chicagotribune': 'Chicago Tribune',
    'abc': 'ABC News', 'nbc': 'NBC News', 'cbs': 'CBS News', 'fox': 'Fox News', 'foxnews': 'Fox News',
    'nypost': 'New York Post', 'newyorkpost': 'New York Post', 'newsmax': 'Newsmax',
    'npr': 'NPR', 'pbs': 'PBS', 'politico': 'Politico', 'thehill': 'The Hill', 'axios': 'Axios',
    'huffpost': 'HuffPost', 'buzzfeed': 'BuzzFeed', 'vox': 'Vox', 'slate': 'Slate',
    'bloomberg': 'Bloomberg', 'ft': 'Financial Times', 'economist': 'The Economist',
    'cnbc': 'CNBC', 'marketwatch': 'MarketWatch', 'forbes': 'Forbes', 'fortune': 'Fortune',
    'businessinsider': 'Business Insider', 'insider': 'Insider',
    'sky': 'Sky News', 'telegraph': 'The Telegraph', 'independent': 'The Independent',
    'mirror': 'The Mirror', 'express': 'Daily Express', 'metro': 'Metro UK', 'thesun': 'The Sun',
    'dailymail': 'Daily Mail', 'dailymailuk': 'Daily Mail UK',
    'dailysabah': 'Daily Sabah', 'jpost': 'Jerusalem Post', 'timesofisrael': 'Times of Israel',
    'haaretz': 'Haaretz', 'middleeastmonitor': 'Middle East Monitor', 'middleeasteye': 'Middle East Eye',
    'arabnews': 'Arab News', 'gulfnews': 'Gulf News', 'alarabiya': 'Al Arabiya',
    'trtworld': 'TRT World', 'aa': 'Anadolu Agency', 'tehrantimes': 'Tehran Times',
    'tribune_pk': 'Express Tribune', 'dawn': 'Dawn', 'geo': 'Geo News', 'arynews': 'ARY News',
    'thehindu': 'The Hindu', 'hindustantimes': 'Hindustan Times', 'ndtv': 'NDTV',
    'indiatoday': 'India Today', 'timesofindia': 'Times of India', 'toi': 'Times of India',
    'scmp': 'South China Morning Post', 'straitstimes': 'Straits Times', 'channelnewsasia': 'CNA',
    'nikkei': 'Nikkei Asia', 'japantimes': 'Japan Times', 'koreaherald': 'Korea Herald',
    'bangkokpost': 'Bangkok Post', 'xinhua': 'Xinhua', 'globaltimes': 'Global Times',
    'chinadaily': 'China Daily', 'cgtn': 'CGTN', 'nhk': 'NHK World', 'nhkworld': 'NHK World',
    'kyodo': 'Kyodo News', 'kyodonews': 'Kyodo News', 'mehrnews': 'Mehr News',
    'jakartapost': 'Jakarta Post', 'thejakartapost': 'Jakarta Post',
    'africanews': 'Africa News', 'nationkenya': 'Nation Kenya',
    'rappler': 'Rappler', 'taipeitimes': 'Taipei Times', 'vietnamnews': 'Vietnam News',
    'thenational': 'The National', 'thenationalnews': 'The National',
    'tempo': 'Tempo', 'dailystar': 'Daily Star Bangladesh', 'thedailystar': 'Daily Star Bangladesh',
    'globeandmail': 'Globe and Mail', 'theglobeandmail': 'Globe and Mail',
    'buenosairesherald': 'Buenos Aires Herald',
    'rt': 'RT', 'tass': 'TASS', 'ria': 'RIA Novosti', 'pravda': 'Pravda',
    'kyivindependent': 'Kyiv Independent', 'kyivpost': 'Kyiv Post',
    'cbc': 'CBC News', 'cbcnews': 'CBC News',
    'abc_au': 'ABC Australia', 'smh': 'Sydney Morning Herald',
    'newsweek': 'Newsweek', 'time': 'TIME', 'theatlantic': 'The Atlantic',
    'foreignpolicy': 'Foreign Policy', 'foreignaffairs': 'Foreign Affairs',
    'semafor': 'Semafor', 'yonhap': 'Yonhap',
  };
  if (sourceMap[id]) return sourceMap[id];
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

function timeAgo(dateString) {
  if (!dateString) return 'Recent';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Recent';
  const now = new Date();
  const diffMs = now - date;
  if (diffMs < 60000) return 'Just now';
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return diffMins + 'm ago';
  if (diffHours < 6) return diffHours + 'h ago';
  if (diffHours < 24) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return diffDays + ' days ago';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const SOURCE_BIAS = {
  'The Intercept': 'L', 'Democracy Now': 'L', 'Jacobin': 'L', 'Mother Jones': 'L', 'MSNBC': 'L', 'HuffPost': 'L', 'Vox': 'L', 'Slate': 'L', 'The Nation': 'L', 'Raw Story': 'L', 'The Wire': 'L', 'Middle East Monitor': 'L', 'The Guardian': 'L', 'Guardian': 'L', 'The Atlantic': 'L',
  'New York Times': 'LC', 'The New York Times': 'LC', 'NY Times': 'LC', 'Washington Post': 'LC', 'The Washington Post': 'LC', 'CNN': 'LC', 'BBC': 'LC', 'BBC World': 'LC', 'BBC News': 'LC', 'NPR': 'LC', 'NBC News': 'LC', 'CBS News': 'LC', 'ABC News': 'LC', 'Time': 'LC', 'TIME': 'LC', 'Politico': 'LC', 'Bloomberg': 'LC', 'The Independent': 'LC', 'USA Today': 'LC', 'Los Angeles Times': 'LC', 'LA Times': 'LC', 'Daily Beast': 'LC', 'Business Insider': 'LC', 'Insider': 'LC', 'CNBC': 'LC', 'ABC Australia': 'LC', 'Sydney Morning Herald': 'LC', 'Irish Times': 'LC', 'Times of Israel': 'LC', 'Al Jazeera': 'LC', 'AP': 'LC', 'AP News': 'LC', 'Associated Press': 'LC', 'Axios': 'LC', 'Haaretz': 'LC', 'CBC': 'LC', 'CBC News': 'LC', 'Google News': 'LC', 'Middle East Eye': 'LC', 'Folha': 'LC', 'Globe and Mail': 'LC', 'Rappler': 'LC',
  'Reuters': 'C', 'France 24': 'C', 'France24': 'C', 'DW News': 'C', 'DW': 'C', 'Deutsche Welle': 'C', 'The Hill': 'C', 'PBS': 'C', 'Nikkei': 'C', 'Nikkei Asia': 'C', 'FT': 'C', 'Financial Times': 'C', 'The Hindu': 'LC', 'Korea Herald': 'C', 'SCMP': 'C', 'South China Morning Post': 'C', 'Dawn': 'C', 'Straits Times': 'C', 'CNA': 'C', 'Bangkok Post': 'C', 'VnExpress': 'C', 'Africa News': 'C', 'Africanews': 'C', 'Jakarta Post': 'C', 'The Jakarta Post': 'C', 'Nation Kenya': 'C', 'Foreign Policy': 'C', 'Foreign Affairs': 'C', 'Yonhap': 'C', 'NHK World': 'C', 'NHK': 'C', 'Kyodo News': 'C', 'Kyodo': 'C', 'AFP': 'C', 'Newsweek': 'C', 'The Economist': 'C', 'Forbes': 'C', 'Semafor': 'C', 'Daily Star Bangladesh': 'C', 'Daily Star': 'C', 'Tempo': 'C', 'Buenos Aires Herald': 'C', 'Taipei Times': 'C', 'Premium Times': 'C', 'Mail & Guardian': 'C',
  'Wall Street Journal': 'RC', 'The Wall Street Journal': 'RC', 'WSJ': 'RC', 'The Telegraph': 'RC', 'Washington Times': 'RC', 'New York Post': 'RC', 'Daily Mail': 'RC', 'Daily Mail UK': 'RC', 'Anadolu Agency': 'RC', 'Times of India': 'RC', 'The National': 'RC', 'The National UAE': 'RC',
  'Fox News': 'R', 'Daily Wire': 'R', 'Breitbart': 'R', 'Newsmax': 'R', 'RT': 'R', 'TASS': 'R', 'Xinhua': 'R', 'China Daily': 'R', 'CGTN': 'R', 'Mehr News': 'R', 'Vietnam News': 'R',
};

function getSourceBias(source) {
  if (!source) return null;
  if (SOURCE_BIAS[source]) return SOURCE_BIAS[source];
  const srcLower = source.toLowerCase();
  let bestKey = null, bestLen = 0;
  Object.keys(SOURCE_BIAS).forEach(k => {
    if (k.length < 4) return;
    const kLower = k.toLowerCase();
    if (srcLower.includes(kLower) || kLower.includes(srcLower)) {
      if (k.length > bestLen) { bestLen = k.length; bestKey = k; }
    }
  });
  return bestKey ? SOURCE_BIAS[bestKey] : 'C';
}

function disperseBiasArticles(articles) {
  if (articles.length < 4) return articles;
  function biasDir(source) {
    const b = getSourceBias(source);
    if (b === 'L' || b === 'LC') return 'left';
    if (b === 'RC' || b === 'R') return 'right';
    return 'center';
  }
  for (let pass = 0; pass < 3; pass++) {
    let changed = false;
    for (let i = 2; i < articles.length; i++) {
      const d0 = biasDir(articles[i - 2].source);
      const d1 = biasDir(articles[i - 1].source);
      const d2 = biasDir(articles[i].source);
      if (d0 === d1 && d1 === d2 && d0 !== 'center') {
        for (let j = i + 1; j < Math.min(i + 8, articles.length); j++) {
          if (biasDir(articles[j].source) !== d0) {
            [articles[i], articles[j]] = [articles[j], articles[i]];
            changed = true;
            break;
          }
        }
      }
    }
    if (!changed) break;
  }
  return articles;
}

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

function getEffectiveSource(article) {
  let source = article.source || '';
  const headline = article.headline || article.title || '';
  if (source.includes('Google News') && headline) {
    const dashIdx = headline.lastIndexOf(' - ');
    if (dashIdx > 0) source = headline.substring(dashIdx + 3).trim();
  }
  return source;
}

function isNonWesternSource(source) {
  if (!source) return false;
  return NON_WESTERN_SOURCES.has(source.toLowerCase());
}

function balanceSourceOrigins(articles) {
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
  if (nonWestern.length === 0 || western.length === 0) return articles;
  const result = [];
  let wi = 0, nwi = 0;
  while (wi < western.length || nwi < nonWestern.length) {
    if (wi < western.length) result.push(western[wi++]);
    if (wi < western.length) result.push(western[wi++]);
    if (nwi < nonWestern.length) result.push(nonWestern[nwi++]);
  }
  return result;
}

// ============================================================
// Category Detection
// ============================================================

function detectCategory(title, description) {
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

function scoreGeopoliticalRelevance(text) {
  const lower = text.toLowerCase();
  let score = 0;
  for (const sig of GEOPOLITICAL_SIGNALS) {
    if (lower.includes(sig)) score += 1;
  }
  for (const sig of STRONG_GEO_SIGNALS) {
    if (lower.includes(sig)) score += 1;
  }
  for (const flag of DOMESTIC_FLAGS) {
    if (lower.includes(flag)) score -= 1;
  }
  for (const pattern of DOMESTIC_NOISE_PATTERNS) {
    if (pattern.test(text)) score -= 2;
  }
  return score;
}

// ============================================================
// RSS Fetching
// ============================================================

async function fetchRSS(feedUrl, sourceName) {
  try {
    const proxyUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feedUrl);
    const response = await fetch(proxyUrl);
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'ok' && data.items && data.items.length > 0) {
        return parseRSSItems(data, sourceName);
      }
    }
  } catch {
    // rss2json failed, try worker proxy
  }

  try {
    const workerUrl = `${RSS_PROXY_BASE}/rss?url=${encodeURIComponent(feedUrl)}`;
    const response = await fetch(workerUrl);
    if (!response.ok) return [];
    const data = await response.json();
    if (data.status !== 'ok' || !data.items || data.items.length === 0) return [];
    return parseRSSItems(data, sourceName);
  } catch {
    return [];
  }
}

function parseRSSItems(data, sourceName) {
  return data.items.map(item => {
    let source = sourceName || data.feed?.title || 'News';
    let title = decodeHTMLEntities(item.title);
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
// Incremental article processing helpers
// ============================================================

const STALENESS_MS = 48 * 60 * 60 * 1000;

function isArticleFresh(article) {
  if (!article.pubDate) return true;
  return (Date.now() - new Date(article.pubDate).getTime()) < STALENESS_MS;
}

function isArticleRelevant(article) {
  const title = article.title || '';
  const text = (title + ' ' + (article.description || '')).toLowerCase();
  if (IRRELEVANT_KEYWORDS.some(kw => text.includes(kw))) return false;
  if (detectCategory(title, article.description) === 'SPORTS') return false;
  const fullText = title + ' ' + (article.description || '');
  if (DOMESTIC_NOISE_PATTERNS.some(p => p.test(fullText))) return false;
  const nonAscii = (title.match(/[^\u0020-\u007E]/g) || []).length;
  if (title.length > 10 && nonAscii / title.length > 0.15) return false;
  if (/\b(de|del|los|las|por|para|avec|dans|und|der|die|dari|dan|yang|pada)\b/i.test(title) &&
      !/\b(de facto|del rio|de gaulle)\b/i.test(title)) {
    const nonEnCount = (title.match(/\b(de|del|los|las|por|para|avec|dans|und|der|die|dari|dan|yang|pada|dari|untuk|dengan|atau|ini|itu|comme|sont|nous|leur)\b/gi) || []).length;
    if (nonEnCount >= 2) return false;
  }
  if (scoreGeopoliticalRelevance(fullText) < 1) return false;
  return true;
}

function normalizeForDedup(title) {
  return (title || '').toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\b(the|a|an|in|on|at|to|for|of|and|is|are|was|were|has|have|had|with|from|by)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isDuplicate(normalized, source, seenEntries) {
  if (seenEntries.some(s => s.normalized === normalized)) return true;
  for (const existing of seenEntries) {
    if (normalized.length > 20 && existing.normalized.length > 20) {
      const wordsA = new Set(normalized.split(' '));
      const wordsB = new Set(existing.normalized.split(' '));
      let overlap = 0;
      for (const w of wordsA) { if (wordsB.has(w)) overlap++; }
      const maxLen = Math.max(wordsA.size, wordsB.size);
      const threshold = existing.source === source ? 0.7 : 0.95;
      if (maxLen > 0 && overlap / maxLen >= threshold) return true;
    }
  }
  return false;
}

// ============================================================
// Main processing pipeline (runs entirely in this worker)
// ============================================================

async function processNews() {
  const FETCH_BATCH = 3;
  const BATCH_DELAY = 500; // ms between fetch batches
  const feeds = RSS_FEEDS.daily;

  // Shared state for incremental processing
  const seenEntries = [];
  const uniqueArticles = [];

  // Process one batch of raw articles: filter → dedup incrementally
  function processBatchArticles(rawArticles) {
    for (const article of rawArticles) {
      if (!isArticleFresh(article)) continue;
      if (!isArticleRelevant(article)) continue;

      const source = formatSourceName(article.source_id);
      const normalized = normalizeForDedup(article.title);
      if (isDuplicate(normalized, source, seenEntries)) continue;

      seenEntries.push({ normalized, source });
      uniqueArticles.push(article);
    }
  }

  // Fetch feeds in staggered batches, process each batch as it arrives
  for (let i = 0; i < feeds.length; i += FETCH_BATCH) {
    const batch = feeds.slice(i, i + FETCH_BATCH);
    const batchResults = await Promise.all(
      batch.map(feed => fetchRSS(feed.url, feed.source))
    );

    // Process each feed's articles immediately
    for (let j = 0; j < batchResults.length; j++) {
      const articles = batchResults[j] || [];
      processBatchArticles(articles);
    }

    // Delay before next batch (skip after last)
    if (i + FETCH_BATCH < feeds.length) {
      await new Promise(r => setTimeout(r, BATCH_DELAY));
    }
  }

  if (uniqueArticles.length === 0) {
    return { briefing: DAILY_BRIEFING_FALLBACK, events: [] };
  }

  // Sort unique articles by date (already filtered & deduped)
  uniqueArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // 5. Build briefing articles (200 cap)
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

  // 6. Political diversity — ensure right-leaning sources
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

  // 7. Disperse bias clusters
  const dispersed = disperseBiasArticles(newArticles);

  // 8. Balance western/non-western sources
  const balanced = balanceSourceOrigins(dispersed);

  // 9. Demote low-priority stories out of top 10
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

  // 10. Deprioritize tabloid sources
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

  // 11. Cluster articles into events
  const events = await clusterArticles(balanced);

  return { briefing: balanced, events };
}

// ============================================================
// Worker message handler
// ============================================================

self.onmessage = async (e) => {
  if (e.data.type === 'fetchNews') {
    try {
      const result = await processNews();
      self.postMessage({ type: 'result', briefing: result.briefing, events: result.events });
    } catch (err) {
      self.postMessage({ type: 'error', message: err.message || 'Worker processing failed' });
    }
  }
};
