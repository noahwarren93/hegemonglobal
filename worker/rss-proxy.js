// Cloudflare Worker: RSS Proxy + AI Event Summaries + Pre-generated Events (KV + Cron)
// Deploy: cd worker && npx wrangler deploy
// Environment variable required: ANTHROPIC_API_KEY
// KV namespace: HEGEMON_CACHE (stores pre-generated events + summaries)

// ============================================================
// CORS
// ============================================================

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://hegemonglobal.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

function getCorsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const headers = { ...CORS_HEADERS };
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}

// ============================================================
// In-memory summary cache (for /summarize endpoint)
// ============================================================

const SUMMARY_CACHE = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function hashTitles(articles) {
  const titles = (articles || [])
    .map(a => (a.headline || a.title || '').toLowerCase().trim().substring(0, 50))
    .sort()
    .join('|');
  let h = 0;
  for (let i = 0; i < titles.length; i++) {
    h = ((h << 5) - h + titles.charCodeAt(i)) | 0;
  }
  return 'sc_' + Math.abs(h).toString(36);
}

function hashEventTitles(event) {
  return hashTitles(event.articles || []);
}

function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, entry] of SUMMARY_CACHE) {
    if (now - entry.ts > CACHE_TTL) SUMMARY_CACHE.delete(key);
  }
}

const CACHE_URL_PREFIX = 'https://hegemon-cache.internal/summary/';

async function getCacheApi(key) {
  try {
    const cache = caches.default;
    const resp = await cache.match(new Request(CACHE_URL_PREFIX + key));
    if (!resp) return null;
    const data = await resp.json();
    if (Date.now() - data.ts > CACHE_TTL) return null;
    return data;
  } catch { return null; }
}

async function setCacheApi(key, data) {
  try {
    const cache = caches.default;
    const resp = new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'max-age=3600' }
    });
    await cache.put(new Request(CACHE_URL_PREFIX + key), resp);
  } catch { /* best effort */ }
}

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
// RSS XML Parser (existing)
// ============================================================

function parseRSSXML(xml) {
  const items = [];
  const rssItemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = rssItemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    items.push({
      title: extractTag(itemXml, 'title'),
      link: extractTag(itemXml, 'link') || extractAttr(itemXml, 'link', 'href'),
      description: extractTag(itemXml, 'description'),
      content: extractTag(itemXml, 'content:encoded') || extractTag(itemXml, 'content'),
      pubDate: extractTag(itemXml, 'pubDate') || extractTag(itemXml, 'dc:date'),
      source: extractTag(itemXml, 'source')
    });
  }
  if (items.length === 0) {
    const atomEntryRegex = /<entry[\s>]([\s\S]*?)<\/entry>/gi;
    while ((match = atomEntryRegex.exec(xml)) !== null) {
      const entryXml = match[1];
      items.push({
        title: extractTag(entryXml, 'title'),
        link: extractAttr(entryXml, 'link', 'href') || extractTag(entryXml, 'link'),
        description: extractTag(entryXml, 'summary') || extractTag(entryXml, 'content'),
        content: extractTag(entryXml, 'content'),
        pubDate: extractTag(entryXml, 'published') || extractTag(entryXml, 'updated'),
        source: ''
      });
    }
  }
  return items;
}

function extractTag(xml, tagName) {
  const cdataRegex = new RegExp(`<${tagName}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tagName}>`, 'i');
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = xml.match(regex);
  if (match) return decodeXMLEntities(match[1].trim());
  return '';
}

function extractAttr(xml, tagName, attrName) {
  const regex = new RegExp(`<${tagName}[^>]*\\s${attrName}=["']([^"']+)["']`, 'i');
  const match = xml.match(regex);
  return match ? match[1] : '';
}

function decodeXMLEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

// ============================================================
// RSS Feed Configuration (same feeds the client uses)
// ============================================================

const RSS_FEEDS = [
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
  { url: 'https://moxie.foxnews.com/google-publisher/world.xml', source: 'Fox News' },
  { url: 'https://thehill.com/feed/', source: 'The Hill' },
  { url: 'https://www.politico.com/rss/politico-world-news.xml', source: 'Politico' },
  { url: 'https://news.google.com/rss/search?q=site:telegraph.co.uk+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'The Telegraph' },
  { url: 'https://www.cbc.ca/webfeed/rss/rss-world', source: 'CBC News' },
  { url: 'https://www.independent.co.uk/news/world/rss', source: 'The Independent' },
  { url: 'https://www.dailymail.co.uk/news/worldnews/index.rss', source: 'Daily Mail' },
  { url: 'https://nypost.com/feed/', source: 'New York Post' },
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
  { url: 'https://www.washingtontimes.com/rss/headlines/news/world/', source: 'Washington Times' },
];

// ============================================================
// Source Formatting
// ============================================================

function formatSourceName(sourceId) {
  if (!sourceId) return 'News';
  const id = sourceId.toLowerCase();
  const sourceMap = {
    'bbc': 'BBC News', 'reuters': 'Reuters', 'aljazeera': 'Al Jazeera', 'theguardian': 'The Guardian',
    'apnews': 'AP News', 'afp': 'AFP', 'dw': 'Deutsche Welle', 'france24': 'France 24',
    'cnn': 'CNN', 'nytimes': 'NY Times', 'washingtonpost': 'Washington Post', 'wsj': 'Wall Street Journal',
    'fox': 'Fox News', 'foxnews': 'Fox News', 'nypost': 'New York Post', 'newyorkpost': 'New York Post',
    'politico': 'Politico', 'thehill': 'The Hill', 'axios': 'Axios',
    'bloomberg': 'Bloomberg', 'ft': 'Financial Times', 'economist': 'The Economist',
    'cnbc': 'CNBC', 'forbes': 'Forbes', 'newsweek': 'Newsweek',
    'sky': 'Sky News', 'telegraph': 'The Telegraph', 'independent': 'The Independent',
    'dailymail': 'Daily Mail', 'dailymailuk': 'Daily Mail UK',
    'dailysabah': 'Daily Sabah', 'jpost': 'Jerusalem Post', 'timesofisrael': 'Times of Israel',
    'haaretz': 'Haaretz', 'middleeastmonitor': 'Middle East Monitor', 'middleeasteye': 'Middle East Eye',
    'arabnews': 'Arab News', 'gulfnews': 'Gulf News', 'alarabiya': 'Al Arabiya',
    'aa': 'Anadolu Agency', 'scmp': 'South China Morning Post',
    'dawn': 'Dawn', 'thehindu': 'The Hindu', 'ndtv': 'NDTV',
    'timesofindia': 'Times of India', 'toi': 'Times of India',
    'nhk': 'NHK World', 'kyodo': 'Kyodo News', 'kyodonews': 'Kyodo News',
    'nikkei': 'Nikkei Asia', 'xinhua': 'Xinhua', 'cgtn': 'CGTN',
    'rt': 'RT', 'tass': 'TASS', 'cbc': 'CBC News', 'cbcnews': 'CBC News',
    'africanews': 'Africa News', 'jakartapost': 'Jakarta Post',
    'foreignpolicy': 'Foreign Policy', 'foreignaffairs': 'Foreign Affairs',
  };
  if (sourceMap[id]) return sourceMap[id];
  return sourceId.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ').map(w => w.length <= 3 && w === w.toUpperCase() ? w : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ').trim();
}

// ============================================================
// Category Detection
// ============================================================

function detectCategory(title, description) {
  const text = (title + ' ' + (description || '')).toLowerCase();
  if (text.match(/\b(nfl|nba|mlb|nhl|mls|quarterback|touchdown|playoff|super bowl|world series|premier league|champions league|soccer|basketball|baseball|hockey|tennis|cricket|rugby|boxing|ufc|mma|formula 1|nascar|grand prix)\b/)) return 'SPORTS';
  if (text.match(/\b(war|military|attack|strike|bomb|troops|fighting|conflict|invasion)\b/)) return 'CONFLICT';
  if (text.match(/\b(economy|market|stock|trade|gdp|inflation|bank|fiscal)\b/)) return 'ECONOMY';
  if (text.match(/\b(terror|missile|nuclear|defense|army|navy|weapon)\b/)) return 'SECURITY';
  if (text.match(/\b(diplomat|treaty|summit|negotiat|sanction|ambassador|nato)\b/)) return 'DIPLOMACY';
  if (text.match(/\b(elect|president|prime minister|parliament|vote|politic|government|congress)\b/)) return 'POLITICS';
  if (text.match(/\b(crisis|humanitarian|famine|refugee|emergency)\b/)) return 'CRISIS';
  if (text.match(/\b(cyber|chip export|tech ban|surveillance)\b/)) return 'TECH';
  if (text.match(/\b(climate|emission|carbon|renewable)\b/)) return 'CLIMATE';
  return 'WORLD';
}

// ============================================================
// Irrelevant Keywords Filter
// ============================================================

const IRRELEVANT_KEYWORDS = [
  'sports', 'football', 'soccer', 'basketball', 'baseball', 'hockey', 'tennis', 'golf', 'cricket',
  'rugby', 'boxing', 'mma', 'ufc', 'wrestling', 'volleyball', 'swimming', 'marathon',
  'nfl', 'nba', 'mlb', 'nhl', 'mls', 'epl', 'la liga', 'serie a', 'bundesliga', 'ligue 1',
  'premier league', 'champions league', 'world series', 'playoff', 'playoffs', 'touchdown',
  'super bowl', 'world cup goal', 'hat trick', 'slam dunk', 'home run', 'grand slam',
  'figure skating', 'formula 1', 'f1 race', 'nascar', 'grand prix',
  'knicks', 'lakers', 'celtics', 'warriors', 'yankees', 'dodgers', 'cowboys', 'patriots',
  'manchester united', 'real madrid', 'barcelona fc', 'man city',
  'celebrity', 'entertainment', 'movie', 'film review', 'box office', 'blockbuster',
  'music', 'concert', 'album', 'grammy', 'oscar', 'emmy', 'golden globe',
  'netflix', 'streaming', 'hulu', 'disney+', 'hbo max', 'prime video',
  'tv show', 'reality tv', 'american idol', 'bachelor', 'bachelorette', 'survivor',
  'kardashian', 'influencer', 'tiktok star', 'instagram', 'viral video', 'went viral',
  'red carpet', 'paparazzi', 'tabloid', 'gossip', 'scandal',
  'actor dies', 'actor dead', 'actress dies', 'actress dead', 'star dies', 'star dead',
  'celebrity death', 'celebrity dies', 'sitcom', 'soap opera', 'game show',
  'recipe', 'cooking', 'fashion', 'beauty', 'lifestyle', 'horoscope', 'zodiac',
  'dating', 'relationship advice', 'wedding', 'divorce', 'weight loss', 'diet',
  'fitness', 'workout', 'yoga', 'skincare', 'makeup',
  'lottery', 'powerball', 'mega millions', 'jackpot', 'casino',
  'stock picks', 'buy now', 'penny stock', 'crypto pump',
  'fans react', 'fans are', 'fans say', 'best dressed', 'worst dressed',
  'feel-good', 'heartwarming', 'uplifting', 'adorable', 'cute video',
  'odd news', 'weird news', 'quirky', 'bizarre video', 'caught on camera',
  'puppy', 'kitten', 'rescue dog', 'rescue cat',
  'arrested for', 'charged with', 'sentenced to', 'mugshot',
  'car crash', 'traffic accident', 'house fire', 'apartment fire',
  'missing person', 'amber alert',
  'weather forecast', 'pollen count', 'snow day',
  'best deals', 'black friday', 'prime day', 'coupon', 'clearance sale',
  'product review', 'gift guide',
  'slams', 'slammed', 'claps back', 'destroyed by', 'owned by', 'stunned by',
  'goes viral', 'epic response', 'mic drop',
  'gop lawmaker', 'dem lawmaker', 'liberal tears', 'conservative meltdown',
  'twitter feud', 'social media feud', 'cancel culture',
  'hot take', 'opinion:', 'op-ed:', 'column:', 'commentary:',
  'dear abby', 'ask amy', 'advice column',
  "you won't believe", 'jaw-dropping', 'mind-blowing', 'insane video',
  'shocking photo', 'unbelievable',
  'side hustle', 'passive income', 'work from home',
  'zodiac sign', 'personality test', 'iq test',
  'florida man', 'karen', 'entitled',
  'baby name', 'gender reveal', 'wedding disaster',
  'food hack', 'life hack', 'cleaning hack',
  'royal family', 'meghan markle', 'prince harry', 'kate middleton',
  'quarterback', 'fantasy football', 'draft pick', 'free agent',
  'batting average', 'wide receiver', 'tight end', 'linebacker',
  'transfer window', 'injury report',
  'colbert', 'kimmel', 'fallon', 'hannity', 'maddow', 'carlson', 'tucker',
  'megyn kelly', 'joe rogan', 'bill maher', 'john oliver', 'late night',
  'talk show', 'late show', 'tonight show',
  'body camera', 'body cam', 'school board', 'zoning',
  'parking ticket', 'city council', 'school district',
  'murder trial', 'manslaughter', 'hit and run', 'drunk driving', 'dui', 'shoplifting',
  'woke', 'anti-woke', 'dei', 'book ban', 'critical race',
  'filibuster', 'committee hearing', 'oversight hearing', 'contempt of congress',
  'olympics', 'olympic games', 'winter olympics', 'summer olympics',
  'ufo', 'ufos', 'alien', 'aliens', 'extraterrestrial',
  'epstein files', 'prince andrew',
  'dog show', 'cat show', 'spelling bee', 'beauty pageant',
];

// ============================================================
// Geopolitical Signals
// ============================================================

const GEOPOLITICAL_SIGNALS = [
  'war', 'military operation', 'military strike', 'military force',
  'military base', 'military deployment', 'military aid', 'military buildup',
  'troops', 'missile', 'nuclear', 'invasion', 'ceasefire',
  'airstrike', 'drone strike', 'ballistic', 'warhead', 'enrichment', 'proliferation',
  'chemical weapons', 'biological weapons', 'arms deal', 'defense spending',
  'proxy war', 'airspace', 'naval', 'strait', 'blockade', 'embargo',
  'uranium', 'centrifuge', 'intercontinental', 'tactical nuclear', 'iron dome', 'cold war',
  'insurgent', 'militia', 'separatist', 'regime', 'coup', 'junta',
  'idf', 'houthi', 'hezbollah', 'wagner', 'hamas', 'taliban', 'isis',
  'sanctions', 'nato', 'united nations', 'treaty', 'diplomatic', 'summit',
  'bilateral', 'multilateral', 'alliance', 'geopolit', 'sovereignty',
  'territorial', 'annexation', 'occupation', 'liberation',
  'peacekeeping', 'deterrence', 'escalation', 'provocation',
  'espionage', 'cyber attack', 'election interference',
  'pentagon', 'kremlin', 'beijing', 'tehran', 'pyongyang',
  'european union', 'african union', 'g7', 'g20', 'iaea', 'opec',
  'world bank', 'imf', 'brics', 'asean',
  'south china sea', 'taiwan strait', 'strait of hormuz', 'gaza', 'donbas', 'crimea',
  'humanitarian crisis', 'refugee crisis', 'famine', 'genocide',
  'ethnic cleansing', 'war crime', 'displacement', 'siege',
  'trade war', 'tariff', 'debt crisis', 'oil price', 'energy crisis',
  'gas pipeline', 'supply chain', 'rare earth', 'food security',
  'civil war', 'independence', 'disinformation', 'propaganda',
  'hypersonic', 'submarine', 'aircraft carrier', 'chip export', 'tech ban'
];

const STRONG_GEO_SIGNALS = new Set([
  'nuclear', 'missile', 'genocide', 'ceasefire', 'sanctions', 'nato',
  'invasion', 'airstrike', 'drone strike', 'chemical weapons', 'biological weapons',
  'war crime', 'ethnic cleansing', 'ballistic', 'warhead', 'famine',
  'coup', 'siege', 'proxy war', 'tactical nuclear', 'uranium', 'enrichment',
  'hamas', 'hezbollah', 'houthi', 'wagner', 'taliban', 'isis', 'idf',
  'south china sea', 'taiwan strait', 'strait of hormuz', 'gaza', 'donbas', 'crimea'
]);

const DOMESTIC_FLAGS = [
  'congress', 'senate hearing', 'house vote', 'gop', 'democrat',
  'republican', 'dnc', 'rnc', 'fbi', 'doj', 'irs', 'atf',
  'school board', 'governor', 'mayor', 'sheriff', 'district attorney',
  'state legislature', 'supreme court ruling', 'amendment',
  'fox news', 'msnbc', 'cnn host', 'anchor'
];

const DOMESTIC_NOISE_PATTERNS = [
  /\b(colbert|kimmel|fallon|hannity|maddow|carlson|tucker)\b.*\b(republican|democrat|gop|dnc|congress)\b/i,
  /\b(republican|democrat|gop|dnc)\b.*\b(colbert|kimmel|fallon|hannity|maddow|carlson|tucker)\b/i,
  /\b(cbs|nbc|abc|fox news|msnbc|cnn)\b.*\b(spiked|ratings|anchor|host|segment)\b/i,
  /\b(spiked|ratings|anchor|host|segment)\b.*\b(cbs|nbc|abc|fox news|msnbc|cnn)\b/i,
  /\b(body cam|bodycam|body camera)\b.*\b(congress|dhs|police|officer)\b/i,
  /\b(congress|dhs)\b.*\b(body cam|bodycam|body camera)\b/i,
  /\b(olympic)\b.*\b(culture|woke|spectacle|controversy|boycott)\b/i,
  /\b(school board|zoning|parking|HOA)\b.*\b(vote|meeting|decision|ruling)\b/i,
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
// Country Demonyms (for primary country extraction)
// ============================================================

const COUNTRY_DEMONYMS = {
  'Afghanistan': ['afghan', 'kabul', 'taliban'],
  'Albania': ['albanian', 'tirana'],
  'Algeria': ['algerian', 'algiers'],
  'Angola': ['angolan', 'luanda'],
  'Argentina': ['argentine', 'argentinian', 'buenos aires'],
  'Armenia': ['armenian', 'yerevan'],
  'Australia': ['australian', 'canberra', 'sydney', 'melbourne'],
  'Austria': ['austrian', 'vienna'],
  'Azerbaijan': ['azerbaijani', 'baku'],
  'Bahrain': ['bahraini', 'manama'],
  'Bangladesh': ['bangladeshi', 'dhaka'],
  'Belarus': ['belarusian', 'minsk', 'lukashenko'],
  'Belgium': ['belgian', 'brussels'],
  'Bolivia': ['bolivian', 'la paz'],
  'Bosnia and Herzegovina': ['bosnian', 'sarajevo'],
  'Brazil': ['brazilian', 'brasilia', 'rio', 'sao paulo', 'lula'],
  'Bulgaria': ['bulgarian', 'sofia'],
  'Burkina Faso': ['burkinabe', 'ouagadougou'],
  'Cambodia': ['cambodian', 'phnom penh'],
  'Cameroon': ['cameroonian', 'yaounde'],
  'Canada': ['canadian', 'ottawa', 'toronto', 'trudeau'],
  'Central African Republic': ['central african', 'bangui'],
  'Chad': ['chadian', "n'djamena"],
  'Chile': ['chilean', 'santiago'],
  'China': ['chinese', 'beijing', 'xi jinping', 'ccp', 'prc'],
  'Colombia': ['colombian', 'bogota'],
  'Democratic Republic of Congo': ['congolese', 'kinshasa', 'drc'],
  'Republic of Congo': ['congo-brazzaville', 'brazzaville'],
  'Costa Rica': ['costa rican'],
  'Croatia': ['croatian', 'zagreb'],
  'Cuba': ['cuban', 'havana'],
  'Cyprus': ['cypriot', 'nicosia'],
  'Czech Republic': ['czech', 'prague'],
  'Denmark': ['danish', 'copenhagen'],
  'Greenland': ['greenlandic', 'nuuk', 'inuit'],
  'Dominican Republic': ['dominican republic', 'santo domingo'],
  'Ecuador': ['ecuadorian', 'quito'],
  'Egypt': ['egyptian', 'cairo', 'sisi'],
  'El Salvador': ['salvadoran', 'san salvador', 'bukele'],
  'Eritrea': ['eritrean', 'asmara'],
  'Estonia': ['estonian', 'tallinn'],
  'Ethiopia': ['ethiopian', 'addis ababa'],
  'Finland': ['finnish', 'helsinki'],
  'France': ['french', 'paris', 'macron'],
  'Gabon': ['gabonese', 'libreville'],
  'Georgia': ['georgian', 'tbilisi'],
  'Germany': ['german', 'berlin', 'scholz', 'bundestag'],
  'Ghana': ['ghanaian', 'accra'],
  'Greece': ['greek', 'athens'],
  'Guatemala': ['guatemalan'],
  'Guinea': ['guinean', 'conakry'],
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
  'Ivory Coast': ['ivorian', 'abidjan'],
  'Jamaica': ['jamaican', 'kingston'],
  'Japan': ['japanese', 'tokyo'],
  'Jordan': ['jordanian', 'amman'],
  'Kazakhstan': ['kazakh', 'astana', 'almaty'],
  'Kenya': ['kenyan', 'nairobi'],
  'Kosovo': ['kosovar', 'pristina'],
  'Kuwait': ['kuwaiti'],
  'Kyrgyzstan': ['kyrgyz', 'bishkek'],
  'Laos': ['laotian', 'vientiane'],
  'Latvia': ['latvian', 'riga'],
  'Lebanon': ['lebanese', 'beirut', 'hezbollah'],
  'Libya': ['libyan', 'tripoli'],
  'Lithuania': ['lithuanian', 'vilnius'],
  'Madagascar': ['malagasy', 'antananarivo'],
  'Malawi': ['malawian', 'lilongwe'],
  'Malaysia': ['malaysian', 'kuala lumpur'],
  'Mali': ['malian', 'bamako'],
  'Malta': ['maltese', 'valletta'],
  'Mauritania': ['mauritanian', 'nouakchott'],
  'Mexico': ['mexican', 'mexico city'],
  'Moldova': ['moldovan', 'chisinau'],
  'Mongolia': ['mongolian', 'ulaanbaatar'],
  'Montenegro': ['montenegrin', 'podgorica'],
  'Morocco': ['moroccan', 'rabat', 'casablanca'],
  'Mozambique': ['mozambican', 'maputo'],
  'Myanmar': ['burmese', 'myanmar', 'yangon', 'junta'],
  'Namibia': ['namibian', 'windhoek'],
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
  'Palestine': ['gaza', 'palestinian', 'west bank', 'ramallah', 'hamas', 'fatah'],
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
  'Saudi Arabia': ['saudi', 'riyadh', 'mbs'],
  'Senegal': ['senegalese', 'dakar'],
  'Serbia': ['serbian', 'belgrade'],
  'Sierra Leone': ['sierra leonean', 'freetown'],
  'Singapore': ['singaporean'],
  'Slovakia': ['slovak', 'bratislava'],
  'Slovenia': ['slovenian', 'ljubljana'],
  'Somalia': ['somali', 'mogadishu'],
  'South Africa': ['south african', 'johannesburg', 'pretoria', 'cape town'],
  'South Korea': ['south korean', 'seoul', 'korean'],
  'South Sudan': ['south sudanese', 'juba'],
  'Spain': ['spanish', 'madrid', 'barcelona'],
  'Sri Lanka': ['sri lankan', 'colombo'],
  'Sudan': ['sudanese', 'khartoum'],
  'Sweden': ['swedish', 'stockholm'],
  'Switzerland': ['swiss', 'bern', 'zurich', 'geneva'],
  'Syria': ['syrian', 'damascus', 'assad'],
  'Taiwan': ['taiwanese', 'taipei'],
  'Tanzania': ['tanzanian', 'dodoma', 'dar es salaam'],
  'Thailand': ['thai', 'bangkok'],
  'Tunisia': ['tunisian', 'tunis'],
  'Turkey': ['turkish', 'ankara', 'istanbul', 'erdogan'],
  'Turkmenistan': ['turkmen', 'ashgabat'],
  'Uganda': ['ugandan', 'kampala'],
  'Ukraine': ['ukrainian', 'kyiv', 'zelensky'],
  'United Arab Emirates': ['emirati', 'uae', 'dubai', 'abu dhabi'],
  'United Kingdom': ['british', 'uk', 'britain', 'london', 'parliament', 'westminster'],
  'United States': ['u.s.', 'american', 'washington', 'biden', 'trump', 'congress', 'white house', 'pentagon'],
  'Uruguay': ['uruguayan', 'montevideo'],
  'Uzbekistan': ['uzbek', 'tashkent'],
  'Venezuela': ['venezuelan', 'caracas', 'maduro'],
  'Vietnam': ['vietnamese', 'hanoi', 'ho chi minh'],
  'Yemen': ['yemeni', 'sanaa', 'houthi'],
  'Zambia': ['zambian', 'lusaka'],
  'Zimbabwe': ['zimbabwean', 'harare']
};

// ============================================================
// Primary Country Extraction (ported from eventsService.js)
// ============================================================

const STOPLIST_COUNTRIES = new Set([
  'united states', 'united kingdom', 'china', 'russia'
]);

const STOPLIST_ENTITIES = new Set([
  'united states', 'u.s.', 'american', 'washington', 'trump', 'biden',
  'white house', 'congress', 'pentagon', 'state department',
  'united kingdom', 'british', 'uk', 'britain', 'london',
  'china', 'chinese', 'beijing',
  'russia', 'russian', 'moscow', 'kremlin', 'putin',
  'un', 'parliament'
]);

const GEO_TO_COUNTRY = {
  'gaza': 'palestine', 'west bank': 'palestine', 'rafah': 'palestine',
  'khan younis': 'palestine', 'golan heights': 'israel', 'golan': 'israel',
  'donbas': 'ukraine', 'donetsk': 'ukraine', 'luhansk': 'ukraine',
  'crimea': 'ukraine', 'zaporizhzhia': 'ukraine', 'kherson': 'ukraine',
  'mariupol': 'ukraine', 'bakhmut': 'ukraine', 'avdiivka': 'ukraine',
  'kharkiv': 'ukraine', 'odesa': 'ukraine',
  'darfur': 'sudan', 'khartoum': 'sudan',
  'tigray': 'ethiopia', 'amhara': 'ethiopia',
  'xinjiang': 'china', 'tibet': 'china', 'hong kong': 'china',
  'kashmir': 'india',
  'aleppo': 'syria', 'idlib': 'syria', 'raqqa': 'syria',
  'mosul': 'iraq', 'kirkuk': 'iraq',
  'sinai': 'egypt',
  'kabul': 'afghanistan', 'kandahar': 'afghanistan', 'helmand': 'afghanistan',
  'pyongyang': 'north korea', 'dmz': 'north korea',
  'strait of hormuz': 'iran', 'hormuz': 'iran',
  'taiwan strait': 'taiwan',
  'kurdistan': 'iraq',
  'suez canal': 'egypt',
  'board of peace': 'palestine',
};

const TOPIC_KEYWORDS = [
  'nuclear', 'military', 'war', 'peace', 'trade', 'sanctions', 'election',
  'protest', 'economy', 'climate', 'summit', 'ceasefire', 'genocide',
  'humanitarian', 'missile', 'troops', 'invasion', 'airstrike', 'bombing',
  'reconstruction', 'occupation', 'territorial', 'coup', 'hostage',
  'refugee', 'famine', 'weapons', 'enrichment', 'blockade', 'drone',
  'assassination', 'espionage', 'cyber', 'treaty', 'alliance',
  'diplomatic', 'tariff', 'embargo', 'deployment'
];

let _countryLookup = null;
function getCountryLookup() {
  if (_countryLookup) return _countryLookup;
  _countryLookup = [];
  for (const [country, aliases] of Object.entries(COUNTRY_DEMONYMS)) {
    const countryLower = country.toLowerCase();
    _countryLookup.push({ name: countryLower, terms: [countryLower, ...aliases] });
  }
  return _countryLookup;
}

function extractPrimaryCountry(headline) {
  const lower = (headline || '').toLowerCase();
  if (!lower) return null;

  // Check geographic keywords first (more specific)
  for (const [geo, country] of Object.entries(GEO_TO_COUNTRY)) {
    if (lower.includes(geo)) {
      if (!STOPLIST_ENTITIES.has(country)) return country;
    }
  }

  // Country names/demonyms — first non-stoplist match
  const lookup = getCountryLookup();
  for (const { name, terms } of lookup) {
    if (STOPLIST_ENTITIES.has(name)) continue;
    for (const term of terms) {
      if (STOPLIST_ENTITIES.has(term)) continue;
      if (term.length <= 3) {
        const regex = new RegExp('\\b' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
        if (regex.test(lower)) return name;
      } else {
        if (lower.includes(term)) return name;
      }
    }
  }

  // Check stoplist countries last
  for (const [country] of Object.entries(COUNTRY_DEMONYMS)) {
    const cl = country.toLowerCase();
    if (!STOPLIST_COUNTRIES.has(cl)) continue;
    const aliases = COUNTRY_DEMONYMS[country];
    for (const term of [cl, ...aliases]) {
      if (lower.includes(term)) return '_stop_' + cl;
    }
  }

  return null;
}

function extractAllCountries(text) {
  const lower = text.toLowerCase();
  const countries = new Set();
  const lookup = getCountryLookup();
  for (const { name, terms } of lookup) {
    for (const term of terms) {
      if (lower.includes(term)) { countries.add(name); break; }
    }
  }
  return countries;
}

function extractTopics(text) {
  const lower = text.toLowerCase();
  const topics = new Set();
  for (const kw of TOPIC_KEYWORDS) {
    if (lower.includes(kw)) topics.add(kw);
  }
  return topics;
}

function sharedTopics(topicsA, topicsB) {
  let count = 0;
  for (const t of topicsA) {
    if (topicsB.has(t)) count++;
  }
  return count;
}

// ============================================================
// Headline Helpers
// ============================================================

function cleanHeadline(headline) {
  if (!headline) return '';
  let h = headline.trim();
  h = h.replace(/\s*[\u2014\u2013\u2015\u00AD\u2014\u2013|]\s*[A-Z][\w\s.&'\u2019,]{0,25}$/, '');
  h = h.replace(/\s+-\s+[A-Z][\w.&'\u2019]{0,15}(?:\s+[A-Z][\w.&'\u2019]+){0,3}\s*$/, '');
  h = h.replace(/\s*:\s+[A-Z][\w.&'\u2019]{0,15}(?:\s+[A-Z][\w.&'\u2019]+){0,2}\s*$/, '');
  h = h.replace(/^(BREAKING|EXCLUSIVE|DEVELOPING|JUST IN|WATCH|UPDATE|OPINION|ANALYSIS|EDITORIAL|LIVE)\s*[:\-\u2013\u2014|]\s*/i, '');
  h = h.replace(/[\s|\u2014\u2013\-:]+$/, '').trim();
  return h;
}

const CLUSTER_STOP_WORDS = new Set([
  'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'but',
  'is', 'are', 'was', 'were', 'has', 'have', 'had', 'be', 'been', 'with', 'by',
  'from', 'as', 'its', 'it', 'this', 'that', 'over', 'after', 'new', 'says',
  'said', 'could', 'may', 'will', 'not', 'no', 'more', 'than', 'about', 'up',
  'out', 'into', 'amid', 'what', 'how', 'why', 'who', 'all', 'also', 'his',
  'her', 'their', 'does', 'do', 'just', 'now', 'being', 'most', 'some',
  'trump', 'says', 'news', 'report', 'world', 'global', 'international'
]);

function getHeadlineWords(text) {
  return new Set(text.toLowerCase().split(/\W+/).filter(w => w.length > 2 && !CLUSTER_STOP_WORDS.has(w)));
}

function wordOverlap(wordsA, wordsB) {
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let shared = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) shared++;
  }
  return shared / Math.min(wordsA.size, wordsB.size);
}

// ============================================================
// Source Ranking
// ============================================================

const SOURCE_RANK = {
  'reuters': 10, 'ap': 10, 'ap news': 10, 'associated press': 10,
  'bbc': 9, 'bbc world': 9, 'bbc news': 9,
  'wall street journal': 8, 'wsj': 8,
  'new york times': 8, 'nyt': 8,
  'financial times': 8, 'ft': 8,
  'the guardian': 7, 'guardian': 7,
  'al jazeera': 7, 'bloomberg': 7,
  'washington post': 7, 'foreign policy': 7,
  'france 24': 6, 'france24': 6,
  'deutsche welle': 6, 'dw': 6,
  'south china morning post': 6, 'scmp': 6,
  'politico': 6, 'yonhap': 6, 'kyodo news': 6,
  'anadolu agency': 5, 'times of india': 5, 'the hill': 5, 'fox news': 5,
  'the telegraph': 6, 'cbc news': 6, 'haaretz': 6,
  'nikkei asia': 6, 'times of israel': 5,
  'africa news': 5, 'africanews': 5,
  'the independent': 5, 'dawn': 5, 'middle east eye': 5,
  'daily mail': 3, 'new york post': 3, 'ny post': 3
};

function getSourceRank(source) {
  if (!source) return 1;
  const lower = source.toLowerCase();
  for (const [name, rank] of Object.entries(SOURCE_RANK)) {
    if (lower.includes(name)) return rank;
  }
  return 4;
}

// ============================================================
// Headline Neutrality Scoring
// ============================================================

const EDITORIAL_PENALTY_WORDS = [
  'busy', 'pumping iron', 'slammed', 'claps back', 'destroys', 'epic',
  'shocking', "you won't believe", 'blasts', 'rips', 'torches', 'eviscerates',
  'obliterates', 'schools', 'owns', 'roasts', 'dunks on', 'melts down',
  'loses it', 'goes off', 'sounds alarm', 'drops bombshell', 'breaks silence',
  'doubled down', 'fires back', 'humiliates', 'crushes', 'wrecks', 'savage',
  'brutal', 'insane', 'unhinged', 'deranged', 'unbelievable', 'jaw-dropping',
];

const EDITORIAL_OPINION_SOURCES = new Set([
  'daily mail', 'new york post', 'ny post', 'rt', 'the hill',
  'washington times', 'fox news',
]);

// Peripheral/side-story headline patterns — penalized when picking the main headline
const PERIPHERAL_PATTERNS = [
  'embassy advis', 'nationals leave', 'nationals to leave', 'travel warning',
  'travel advisory', 'advises citizens', 'advises nationals', 'urged to leave',
  'evacuate citizens', 'issues advisory', 'warns citizens', 'warns nationals',
  'consular', 'embassy closes', 'flights suspended', 'airlines cancel',
  'tourists stranded', 'expats urged', 'stock falls', 'stock drops',
  'shares drop', 'market reacts', 'oil prices', 'gas prices',
];

// Core event headline keywords — boosted when picking the main headline
const CORE_EVENT_KEYWORDS = [
  'war', 'strike', 'strikes', 'military', 'nuclear', 'carrier', 'attack',
  'attacks', 'confrontation', 'buildup', 'offensive', 'invasion',
  'troops', 'missile', 'missiles', 'airstrikes', 'airstrike', 'bombing',
  'ceasefire', 'peace talks', 'sanctions', 'coup', 'escalat', 'blockade',
  'siege', 'hostage', 'genocide', 'ethnic cleansing', 'occupation',
  'demands', 'threatens', 'threat', 'warns', 'ultimatum', 'rejects',
  'defies', 'refuses', 'confronts', 'deploys', 'launches', 'fires',
];

function scoreHeadlineNeutrality(headline, source) {
  const lower = (headline || '').toLowerCase();
  let score = 0;
  for (const word of EDITORIAL_PENALTY_WORDS) {
    if (lower.includes(word)) score -= 10;
  }
  const sarcQuotes = headline.match(/['\u2018\u2019].{3,30}['\u2018\u2019]/g);
  if (sarcQuotes) score -= 5 * sarcQuotes.length;
  if (headline.length > 100) score -= 3;
  if (headline.length > 10 && headline.length < 70) score += 2;
  if (source && EDITORIAL_OPINION_SOURCES.has(source.toLowerCase())) score -= 3;

  // Penalize peripheral/side-story headlines (embassy advisories, market reactions, etc.)
  for (const pat of PERIPHERAL_PATTERNS) {
    if (lower.includes(pat)) { score -= 15; break; }
  }

  // Boost core event headlines (war, strike, military, etc.)
  for (const kw of CORE_EVENT_KEYWORDS) {
    if (lower.includes(kw)) { score += 5; break; }
  }

  return score;
}

// ============================================================
// Event Scoring
// ============================================================

const TIER1_KEYWORDS = [
  'military', 'nuclear', 'invasion', 'missile', 'troops', 'airstrikes',
  'airstrike', 'bombing', 'war crime', 'genocide', 'ethnic cleansing',
  'weapons', 'arsenal', 'enrichment', 'warhead', 'siege', 'blockade', 'offensive'
];
const TIER2_KEYWORDS = [
  'ceasefire', 'peace', 'peace talks', 'sanctions', 'territorial',
  'coup', 'escalat', 'buildup', 'hostage', 'humanitarian crisis',
  'reconstruction', 'occupation'
];

function getEventTier(event) {
  const text = ((event.headline || '') + ' ' +
    (event.articles || []).map(a => (a.headline || '')).join(' ')).toLowerCase();
  if (TIER1_KEYWORDS.some(kw => text.includes(kw))) return 1;
  if (TIER2_KEYWORDS.some(kw => text.includes(kw))) return 2;
  return 3;
}

function scoreEvent(event) {
  const tier = getEventTier(event);
  const tierScore = (4 - tier) * 5;
  const sourceScore = Math.min(event.sourceCount, 40) * 3;
  const importanceScore = event.importance === 'high' ? 5 : 0;
  return tierScore + sourceScore + importanceScore;
}

// ============================================================
// Clustering Engine (ported from eventsService.js)
// ============================================================

const HARD_CAP = 40;

function clusterArticles(articles) {
  if (!articles || articles.length === 0) return [];

  // Step 1: Annotate each article
  const annotated = articles.map((article, idx) => {
    const headline = article.headline || article.title || '';
    const fullText = headline + ' ' + (article.description || '');
    return {
      ...article,
      _idx: idx,
      _headline: headline,
      _headlineWords: getHeadlineWords(headline),
      _primaryCountry: extractPrimaryCountry(headline),
      _topics: extractTopics(fullText),
      _allCountries: extractAllCountries(fullText),
    };
  });

  // Step 2: Group by primary country
  const countryGroups = new Map();
  const stoplistGroups = new Map();
  const noCountry = [];

  for (let i = 0; i < annotated.length; i++) {
    const pc = annotated[i]._primaryCountry;
    if (!pc) {
      noCountry.push(i);
    } else if (pc.startsWith('_stop_')) {
      const realCountry = pc.replace('_stop_', '');
      if (!stoplistGroups.has(realCountry)) stoplistGroups.set(realCountry, []);
      stoplistGroups.get(realCountry).push(i);
    } else {
      if (!countryGroups.has(pc)) countryGroups.set(pc, []);
      countryGroups.get(pc).push(i);
    }
  }

  const allClusters = [];

  // Step 3a: Non-stoplist countries
  for (const [country, indices] of countryGroups.entries()) {
    if (indices.length <= HARD_CAP) {
      allClusters.push(indices);
    } else {
      const subs = subClusterByTopic(annotated, indices);
      for (const sub of subs) allClusters.push(sub);
    }
  }

  // Step 3b: Stoplist countries
  for (const [country, indices] of stoplistGroups.entries()) {
    const subs = subClusterByTopic(annotated, indices);
    for (const sub of subs) allClusters.push(sub);
  }

  // Step 3c: No-country articles
  if (noCountry.length > 0) {
    const subs = subClusterBySimilarity(annotated, noCountry, 0.4);
    for (const sub of subs) allClusters.push(sub);
  }

  // Step 4: Build event objects
  const rawEvents = allClusters.map(indices => buildEvent(annotated, indices));

  // Step 5: Merge events sharing same non-stoplist primary country
  const events = mergeByCountry(rawEvents);

  // Sort by relevance score
  events.sort((a, b) => b._score - a._score);
  for (const e of events) delete e._score;

  console.log(`[Cron] Clustering: ${articles.length} articles -> ${events.length} events`);
  return events;
}

function subClusterByTopic(annotated, indices) {
  const clusters = [];
  const sorted = [...indices].sort((a, b) =>
    getSourceRank(annotated[b].source) - getSourceRank(annotated[a].source)
  );
  for (const idx of sorted) {
    const art = annotated[idx];
    let placed = false;
    for (const cluster of clusters) {
      if (cluster.members.length >= HARD_CAP) continue;
      if (sharedTopics(art._topics, cluster.topics) >= 1) {
        cluster.members.push(idx);
        for (const t of art._topics) cluster.topics.add(t);
        placed = true;
        break;
      }
    }
    if (!placed) {
      clusters.push({ topics: new Set(art._topics), members: [idx] });
    }
  }
  return clusters.map(c => c.members);
}

function subClusterBySimilarity(annotated, indices, threshold) {
  const clusters = [];
  for (const idx of indices) {
    const art = annotated[idx];
    let placed = false;
    for (const cluster of clusters) {
      if (cluster.members.length >= HARD_CAP) continue;
      const sim = wordOverlap(art._headlineWords, cluster.seedWords);
      if (sim >= threshold) {
        cluster.members.push(idx);
        placed = true;
        break;
      }
    }
    if (!placed) {
      clusters.push({ seedWords: art._headlineWords, members: [idx] });
    }
  }
  return clusters.map(c => c.members);
}

function buildEvent(annotated, indices) {
  const clusterArts = indices.map(i => annotated[i]);

  // Pick best headline
  const sorted = [...clusterArts].sort((a, b) => getSourceRank(b.source) - getSourceRank(a.source));
  const topCandidates = sorted.slice(0, Math.min(5, sorted.length));
  const primary = topCandidates.reduce((best, curr) => {
    const currHL = (curr._headline || '').trim();
    const bestHL = (best._headline || '').trim();
    if (!currHL) return best;
    const currScore = getSourceRank(curr.source) + scoreHeadlineNeutrality(currHL, curr.source);
    const bestScore = getSourceRank(best.source) + scoreHeadlineNeutrality(bestHL, best.source);
    return currScore > bestScore ? curr : best;
  }, topCandidates[0]);

  const allEntities = new Set();
  for (const a of clusterArts) {
    for (const c of a._allCountries) {
      if (!STOPLIST_ENTITIES.has(c)) allEntities.add(c);
    }
  }

  // Dominant primary country
  const countryCounts = {};
  for (const a of clusterArts) {
    const pc = a._primaryCountry;
    if (pc && !pc.startsWith('_stop_')) {
      countryCounts[pc] = (countryCounts[pc] || 0) + 1;
    }
  }
  const dominantCountry = Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  const catCounts = {};
  for (const a of clusterArts) {
    const cat = a.category || 'WORLD';
    catCounts[cat] = (catCounts[cat] || 0) + 1;
  }
  const category = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0][0];

  const importance = clusterArts.some(a => a.importance === 'high') ||
    ['CONFLICT', 'CRISIS', 'SECURITY'].includes(category)
    ? 'high' : 'medium';

  const cleanArticles = clusterArts.map(a => ({
    headline: cleanHeadline(a._headline || a.headline || ''),
    source: a.source || '',
    description: a.description || '',
    url: a.url || a.link || '',
    pubDate: a.pubDate || '',
    category: a.category || 'WORLD',
    importance: a.importance || 'medium'
  }));

  const event = {
    id: `evt-${primary._idx}`,
    headline: cleanHeadline(primary._headline || ''),
    category,
    importance,
    sourceCount: clusterArts.length,
    pubDate: primary.pubDate || clusterArts[0].pubDate || '',
    articles: cleanArticles,
    entities: [...allEntities],
    _primaryCountry: dominantCountry,
    summary: null,
  };

  event._score = scoreEvent(event);
  return event;
}

function mergeByCountry(events) {
  const countryMap = new Map();
  const merged = [];
  const consumed = new Set();

  for (let i = 0; i < events.length; i++) {
    const pc = events[i]._primaryCountry;
    if (pc && !STOPLIST_COUNTRIES.has(pc)) {
      if (!countryMap.has(pc)) countryMap.set(pc, []);
      countryMap.get(pc).push(i);
    }
  }

  for (const [country, indices] of countryMap.entries()) {
    if (indices.length <= 1) continue;
    indices.sort((a, b) => events[b]._score - events[a]._score);
    const base = events[indices[0]];
    for (let k = 1; k < indices.length; k++) {
      const donor = events[indices[k]];
      base.articles.push(...donor.articles);
      for (const ent of donor.entities) {
        if (!base.entities.includes(ent)) base.entities.push(ent);
      }
      consumed.add(indices[k]);
    }
    base.sourceCount = base.articles.length;
    base._score = scoreEvent(base);
  }

  for (let i = 0; i < events.length; i++) {
    if (!consumed.has(i)) merged.push(events[i]);
  }
  return merged;
}

// ============================================================
// RSS Fetching (for cron job)
// ============================================================

const FEED_TIMEOUT_MS = 5000;

async function fetchSingleFeed(feedUrl, sourceName) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FEED_TIMEOUT_MS);
  try {
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Hegemon-RSS-Proxy/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      },
      signal: controller.signal,
      cf: { cacheTtl: 300 }
    });
    clearTimeout(timeout);
    if (!response.ok) return [];
    const xmlText = await response.text();
    const items = parseRSSXML(xmlText);

    return items.map(item => {
      let source = sourceName || 'News';
      let title = decodeHTMLEntities(item.title);

      // Google News embeds real source in title
      if (source.includes('Google News') && title) {
        const dashIdx = title.lastIndexOf(' - ');
        if (dashIdx > 0) {
          source = title.substring(dashIdx + 3).trim();
          title = title.substring(0, dashIdx).trim();
        }
      }

      return {
        title: title,
        headline: title,
        description: decodeHTMLEntities(item.description || item.content || ''),
        link: item.link,
        url: item.link,
        source: formatSourceName(source),
        pubDate: item.pubDate
      };
    });
  } catch (err) {
    clearTimeout(timeout);
    return [];
  }
}

async function fetchAllFeeds() {
  console.log(`[Cron] Fetching ${RSS_FEEDS.length} RSS feeds...`);

  // Fetch all feeds in parallel
  const results = await Promise.allSettled(
    RSS_FEEDS.map(feed => fetchSingleFeed(feed.url, feed.source))
  );

  const allArticles = [];
  let okCount = 0;
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value && result.value.length > 0) {
      okCount++;
      allArticles.push(...result.value);
    }
  }

  console.log(`[Cron] RSS: ${okCount}/${RSS_FEEDS.length} feeds OK, ${allArticles.length} articles`);
  return allArticles;
}

// ============================================================
// Article Processing Pipeline
// ============================================================

function processArticles(allArticles) {
  // Sort by date
  allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // Staleness filter (48 hours)
  const now = Date.now();
  const STALENESS_MS = 48 * 60 * 60 * 1000;
  const fresh = allArticles.filter(article => {
    if (!article.pubDate) return true;
    return (now - new Date(article.pubDate).getTime()) < STALENESS_MS;
  });

  // Filter: irrelevant, sports, domestic noise, non-English, geo score
  const relevant = [];
  for (const article of fresh) {
    const title = article.title || article.headline || '';
    const text = (title + ' ' + (article.description || '')).toLowerCase();

    if (IRRELEVANT_KEYWORDS.some(kw => text.includes(kw))) continue;

    const category = detectCategory(title, article.description);
    if (category === 'SPORTS') continue;

    const fullText = title + ' ' + (article.description || '');
    if (DOMESTIC_NOISE_PATTERNS.some(p => p.test(fullText))) continue;

    // Non-English filter
    const nonAscii = (title.match(/[^\x00-\x7F]/g) || []).length;
    if (title.length > 10 && nonAscii / title.length > 0.15) continue;
    if (/\b(de|del|los|las|por|para|avec|dans|und|der|die|dari|dan|yang|pada)\b/i.test(title) &&
        !/\b(de facto|del rio|de gaulle)\b/i.test(title)) {
      const nonEnCount = (title.match(/\b(de|del|los|las|por|para|avec|dans|und|der|die|dari|dan|yang|pada|dari|untuk|dengan|atau|ini|itu|comme|sont|nous|leur)\b/gi) || []).length;
      if (nonEnCount >= 2) continue;
    }

    if (scoreGeopoliticalRelevance(fullText) < 1) continue;

    // Add category and importance
    const importance = ['CONFLICT', 'CRISIS', 'SECURITY'].includes(category) ? 'high' : 'medium';
    relevant.push({
      ...article,
      headline: title,
      category,
      importance
    });
  }

  // Source-aware dedup
  const seenEntries = [];
  const unique = [];
  for (const article of relevant) {
    const source = article.source || '';
    const normalized = (article.title || article.headline || '').toLowerCase()
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
      unique.push(article);
    }
  }

  console.log(`[Cron] Pipeline: ${allArticles.length} raw -> ${fresh.length} fresh -> ${relevant.length} relevant -> ${unique.length} unique`);

  // Cap at 200 articles
  return unique.slice(0, 200);
}

// ============================================================
// AI Summary Generation (with KV caching per event)
// ============================================================

async function generateSummaries(events, env) {
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[Cron] No ANTHROPIC_API_KEY, skipping summaries');
    return;
  }

  // Check KV cache for each event
  const uncached = [];
  for (const event of events) {
    const key = hashEventTitles(event);
    try {
      const cached = await env.HEGEMON_CACHE.get('summary_' + key);
      if (cached) {
        const data = JSON.parse(cached);
        if (Date.now() - data.ts < 24 * 60 * 60 * 1000) { // 24h TTL
          event.summary = data.summary;
          continue;
        }
      }
    } catch { /* miss */ }
    uncached.push(event);
  }

  const cachedCount = events.length - uncached.length;
  if (cachedCount > 0) {
    console.log(`[Cron] Summaries: ${cachedCount} cached, ${uncached.length} need generation`);
  }

  if (uncached.length === 0) return;

  // Batch into groups of 10 to keep Claude prompts manageable
  const BATCH_SIZE = 10;
  for (let i = 0; i < uncached.length; i += BATCH_SIZE) {
    const batch = uncached.slice(i, i + BATCH_SIZE);

    const eventDescriptions = batch.map((event, idx) => {
      const articles = event.articles || [];
      const articleList = articles.slice(0, 10).map(a => {
        let line = `  - "${a.headline || a.title}" (${a.source || 'Unknown source'})`;
        if (a.description) {
          const desc = a.description.replace(/<[^>]+>/g, '').trim().substring(0, 200);
          if (desc.length > 20) line += `\n    Context: ${desc}`;
        }
        return line;
      }).join('\n');

      return `EVENT ${idx + 1}: "${event.headline}"
Category: ${event.category || 'WORLD'}
Sources (${articles.length}):
${articleList}`;
    }).join('\n\n');

    const prompt = `You are a headline writer and intelligence analyst for a geopolitical monitoring platform called Hegemon.

For each event below, provide TWO things:

1. HEADLINE: A short, punchy newspaper-style headline. STRICT RULES:
   - MAXIMUM 10-12 words. Count them. If over 12, cut words.
   - Write like a newspaper front page: dramatic, engaging, active verbs.
   - Never start with titles ("President Trump" -> "Trump", "Prime Minister" -> just the name).
   - Include specific details (dollar amounts, country names, key actions).

2. SUMMARY: A structured analysis with exactly three sections, each 1-2 sentences:

**What happened:** [Key facts - what occurred, who was involved, what actions were taken.]

**Why it matters:** [Geopolitical significance - strategic implications, regional stability, global order.]

**Outlook:** [Next steps - what to watch for, escalation or resolution paths.]

CRITICAL RULES:
- NEVER say "limited reporting", "insufficient information", or similar cop-outs.
- Write substantive analysis even for single-source events.
- Use "Context:" lines to extract specific facts, numbers, and details.
- Every summary MUST be substantive and informative.
- Keep each section to 1-2 sentences. Total: 3-6 sentences.

${eventDescriptions}

Respond with a JSON array, one per event, in the same order. Format:
[{"headline": "Short Punchy Headline Here", "summary": "**What happened:** ... **Why it matters:** ... **Outlook:** ..."}, ...]

Return ONLY the JSON array, no other text.`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 8192,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        console.error(`[Cron] Claude API error: ${response.status}`);
        continue;
      }

      const aiData = await response.json();
      const aiText = aiData.content?.[0]?.text || '';

      let summaries;
      try {
        const jsonMatch = aiText.match(/\[[\s\S]*\]/);
        summaries = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      } catch {
        console.error('[Cron] Failed to parse Claude response');
        summaries = [];
      }

      // Apply summaries and cache in KV
      for (let j = 0; j < batch.length; j++) {
        if (summaries[j]) {
          // Use AI-generated headline if provided
          if (summaries[j].headline) {
            batch[j].headline = summaries[j].headline;
          }
          batch[j].summary = summaries[j].summary || null;

          // Cache individually in KV
          const key = hashEventTitles(batch[j]);
          try {
            await env.HEGEMON_CACHE.put('summary_' + key, JSON.stringify({
              summary: summaries[j].summary,
              headline: summaries[j].headline,
              ts: Date.now()
            }), { expirationTtl: 86400 }); // 24h TTL
          } catch { /* best effort */ }
        }
      }

      console.log(`[Cron] Generated summaries for batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} events)`);

    } catch (err) {
      console.error('[Cron] Summary generation error:', err.message);
    }
  }
}

// ============================================================
// Worker Export: fetch + scheduled handlers
// ============================================================

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = getCorsHeaders(request);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // ============================================================
    // GET /events — serve pre-generated events from KV
    // ============================================================
    if (url.pathname === '/events' && request.method === 'GET') {
      try {
        const data = await env.HEGEMON_CACHE.get('latest_events');
        if (!data) {
          return new Response(
            JSON.stringify({ events: [], briefing: [], lastUpdated: null }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Prepend breaking events from KV if any exist
        let breakingRaw;
        try { breakingRaw = await env.HEGEMON_CACHE.get('breaking_events'); } catch { /* miss */ }
        if (breakingRaw) {
          const parsed = JSON.parse(data);
          const breaking = JSON.parse(breakingRaw);
          if (Array.isArray(breaking) && breaking.length > 0) {
            const breakingEvents = breaking.map(b => ({ ...b, breaking: true }));
            parsed.events = [...breakingEvents, ...parsed.events];
          }
          return new Response(JSON.stringify(parsed), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'max-age=30' }
          });
        }

        return new Response(data, {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'max-age=60' }
        });
      } catch (err) {
        console.error('Events endpoint error:', err);
        return new Response(
          JSON.stringify({ error: 'Failed to read events' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ============================================================
    // POST /breaking — set or clear pinned breaking events
    // Body: { events: [...] } to set, or { clear: true } to remove
    // ============================================================
    if (url.pathname === '/breaking' && request.method === 'POST') {
      try {
        const body = await request.json();
        if (body.clear) {
          await env.HEGEMON_CACHE.delete('breaking_events');
          return new Response(
            JSON.stringify({ status: 'cleared' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (body.events && Array.isArray(body.events)) {
          await env.HEGEMON_CACHE.put('breaking_events', JSON.stringify(body.events), { expirationTtl: 86400 });
          return new Response(
            JSON.stringify({ status: 'set', count: body.events.length }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        return new Response(
          JSON.stringify({ error: 'Provide { events: [...] } or { clear: true }' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ============================================================
    // GET /debug — diagnostics for pre-generated events
    // ============================================================
    if (url.pathname === '/debug' && request.method === 'GET') {
      try {
        const raw = await env.HEGEMON_CACHE.get('latest_events');
        if (!raw) {
          return new Response(
            JSON.stringify({ status: 'empty', lastUpdated: null, eventCount: 0, summaryCount: 0 }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const data = JSON.parse(raw);
        const eventCount = (data.events || []).length;
        const summaryCount = (data.events || []).filter(e => e.summary).length;
        const briefingCount = (data.briefing || []).length;
        const minutesAgo = data.lastUpdated
          ? Math.round((Date.now() - data.lastUpdated) / 60000)
          : null;
        const topHeadlines = (data.events || []).slice(0, 10).map(e => ({
          headline: e.headline,
          sources: e.sourceCount,
          country: e._primaryCountry,
          hasSummary: !!e.summary
        }));
        return new Response(
          JSON.stringify({ status: 'ok', lastUpdated: data.lastUpdated, minutesAgo, eventCount, summaryCount, briefingCount, topHeadlines }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ============================================================
    // POST /summarize — AI event summaries via Claude API (legacy)
    // ============================================================
    if (url.pathname === '/summarize' && request.method === 'POST') {
      try {
        const apiKey = env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          return new Response(
            JSON.stringify({ error: 'API key not configured' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const body = await request.json();
        const events = body.events;

        if (!events || !Array.isArray(events) || events.length === 0) {
          return new Response(
            JSON.stringify({ error: 'No events provided' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        cleanExpiredCache();

        const results = new Array(events.length).fill(null);
        const uncachedIndices = [];

        for (let i = 0; i < events.length; i++) {
          const key = hashEventTitles(events[i]);
          const memCached = SUMMARY_CACHE.get(key);
          if (memCached && (Date.now() - memCached.ts < CACHE_TTL)) {
            results[i] = memCached.data;
            continue;
          }
          const apiCached = await getCacheApi(key);
          if (apiCached) {
            results[i] = apiCached.data;
            SUMMARY_CACHE.set(key, apiCached);
            continue;
          }
          uncachedIndices.push(i);
        }

        if (uncachedIndices.length === 0) {
          return new Response(
            JSON.stringify({ summaries: results }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const uncachedEvents = uncachedIndices.map(i => events[i]);
        const eventDescriptions = uncachedEvents.map((event, i) => {
          const articles = event.articles || [];
          const articleList = articles.slice(0, 10).map(a => {
            let line = `  - "${a.headline || a.title}" (${a.source || 'Unknown source'})`;
            if (a.description) {
              const desc = a.description.replace(/<[^>]+>/g, '').trim().substring(0, 200);
              if (desc.length > 20) line += `\n    Context: ${desc}`;
            }
            return line;
          }).join('\n');

          return `EVENT ${i + 1}: "${event.headline}"
Category: ${event.category || 'WORLD'}
Sources (${articles.length}):
${articleList}`;
        }).join('\n\n');

        const prompt = `You are a headline writer and intelligence analyst for a geopolitical monitoring platform called Hegemon.

For each event below, provide TWO things:

1. HEADLINE: A short, punchy newspaper-style headline. STRICT RULES:
   - MAXIMUM 10-12 words. Count them. If over 12, cut words.
   - Write like a newspaper front page: dramatic, engaging, active verbs.
   - Never start with titles ("President Trump" -> "Trump", "Prime Minister" -> just the name).
   - Include specific details (dollar amounts, country names, key actions).

2. SUMMARY: A structured analysis with exactly three sections, each 1-2 sentences:

**What happened:** [Key facts - what occurred, who was involved, what actions were taken.]

**Why it matters:** [Geopolitical significance - strategic implications, regional stability, global order.]

**Outlook:** [Next steps - what to watch for, escalation or resolution paths.]

CRITICAL RULES:
- NEVER say "limited reporting", "insufficient information", or similar cop-outs.
- Write substantive analysis even for single-source events.
- Use "Context:" lines to extract specific facts, numbers, and details.
- Every summary MUST be substantive and informative.
- Keep each section to 1-2 sentences. Total: 3-6 sentences.

${eventDescriptions}

Respond with a JSON array, one per event, in the same order. Format:
[{"headline": "Short Punchy Headline Here", "summary": "**What happened:** ... **Why it matters:** ... **Outlook:** ..."}, ...]

Return ONLY the JSON array, no other text.`;

        const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 8192,
            messages: [{ role: 'user', content: prompt }]
          })
        });

        if (!anthropicResponse.ok) {
          const errText = await anthropicResponse.text();
          console.error('Anthropic API error:', errText);
          return new Response(
            JSON.stringify({ error: 'AI API error', details: anthropicResponse.status }),
            { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const aiData = await anthropicResponse.json();
        const aiText = aiData.content?.[0]?.text || '';

        let summaries;
        try {
          const jsonMatch = aiText.match(/\[[\s\S]*\]/);
          summaries = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
        } catch (parseErr) {
          console.error('Failed to parse AI response:', parseErr.message);
          summaries = [];
        }

        for (let i = 0; i < uncachedIndices.length; i++) {
          const origIdx = uncachedIndices[i];
          const summary = summaries[i] || null;
          results[origIdx] = summary;
          if (summary) {
            const key = hashEventTitles(events[origIdx]);
            const cacheEntry = { data: summary, ts: Date.now() };
            SUMMARY_CACHE.set(key, cacheEntry);
            setCacheApi(key, cacheEntry);
          }
        }

        return new Response(
          JSON.stringify({ summaries: results }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (err) {
        console.error('Summarize error:', err);
        return new Response(
          JSON.stringify({ error: 'Internal error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ============================================================
    // GET /rss?url= — RSS feed proxy
    // ============================================================
    if (url.pathname === '/rss' && request.method === 'GET') {
      const feedUrl = url.searchParams.get('url');
      if (!feedUrl) {
        return new Response(
          JSON.stringify({ error: 'Missing url parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      try {
        const feedResponse = await fetch(feedUrl, {
          headers: {
            'User-Agent': 'Hegemon-RSS-Proxy/1.0',
            'Accept': 'application/rss+xml, application/xml, text/xml, */*'
          },
          cf: { cacheTtl: 300 }
        });
        if (!feedResponse.ok) {
          return new Response(
            JSON.stringify({ error: 'Feed fetch failed', status: feedResponse.status }),
            { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const xmlText = await feedResponse.text();
        const items = parseRSSXML(xmlText);
        return new Response(
          JSON.stringify({ status: 'ok', feed: { url: feedUrl }, items }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (err) {
        console.error('RSS proxy error:', err);
        return new Response(
          JSON.stringify({ error: 'RSS fetch error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ============================================================
    // GET /stock?symbols= — Yahoo Finance proxy
    // ============================================================
    if (url.pathname === '/stock' && request.method === 'GET') {
      const symbols = url.searchParams.get('symbols');
      if (!symbols) {
        return new Response(
          JSON.stringify({ error: 'Missing symbols parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const rangeParam = url.searchParams.get('range') || '5d';
      const intervalParam = url.searchParams.get('interval') || '1d';
      const VALID_RANGES = new Set(['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', 'ytd', 'max']);
      const VALID_INTERVALS = new Set(['1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h', '1d', '5d', '1wk', '1mo']);
      const safeRange = VALID_RANGES.has(rangeParam) ? rangeParam : '5d';
      const safeInterval = VALID_INTERVALS.has(intervalParam) ? intervalParam : '1d';

      try {
        const symList = symbols.split(',').map(s => s.trim()).filter(Boolean);
        const results = {};
        await Promise.all(symList.map(async (sym) => {
          try {
            const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=${safeRange}&interval=${safeInterval}&includePrePost=false`;
            const resp = await fetch(yahooUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0' },
              cf: { cacheTtl: 60 }
            });
            if (!resp.ok) return;
            const data = await resp.json();
            if (!data?.chart?.result?.[0]) return;
            const r = data.chart.result[0];
            const meta = r.meta;
            const price = meta.regularMarketPrice;
            const chartPrevClose = meta.chartPreviousClose || meta.previousClose;
            const dailyPrevClose = meta.previousClose || meta.chartPreviousClose;
            if (!price) return;
            const rawCloses = r.indicators?.quote?.[0]?.close || [];
            const rawTimestamps = r.timestamp || [];
            const closes = [];
            const timestamps = [];
            for (let i = 0; i < rawCloses.length; i++) {
              if (rawCloses[i] !== null && rawCloses[i] !== undefined) {
                closes.push(rawCloses[i]);
                if (i < rawTimestamps.length) timestamps.push(rawTimestamps[i]);
              }
            }
            results[sym] = {
              symbol: meta.symbol || sym,
              price,
              prevClose: chartPrevClose || price,
              changePct: dailyPrevClose ? ((price - dailyPrevClose) / dailyPrevClose) * 100 : 0,
              shortName: meta.shortName || '',
              longName: meta.longName || '',
              exchangeName: meta.fullExchangeName || meta.exchangeName || '',
              sparkline: closes.length > 0 ? closes : [prevClose || price, price],
              timestamps: timestamps.length > 0 ? timestamps : []
            };
          } catch (e) {
            console.warn(`Failed to fetch ${sym}:`, e.message);
          }
        }));
        return new Response(
          JSON.stringify({ quotes: results }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (err) {
        console.error('Stock proxy error:', err);
        return new Response(
          JSON.stringify({ error: 'Stock fetch error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 404
    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  },

  // ============================================================
  // Cron Handler — runs every 5 minutes
  // Fetches RSS feeds, clusters articles, generates AI summaries,
  // stores everything in KV for instant client access via GET /events
  // ============================================================
  async scheduled(event, env, ctx) {
    try {
      console.log('[Cron] Starting event generation...');
      const startTime = Date.now();

      // 1. Fetch all RSS feeds
      const allArticles = await fetchAllFeeds();
      if (allArticles.length === 0) {
        console.log('[Cron] No articles fetched, skipping');
        return;
      }

      // 2. Filter and deduplicate
      const processed = processArticles(allArticles);
      if (processed.length === 0) {
        console.log('[Cron] No relevant articles after filtering, skipping');
        return;
      }

      // 3. Cluster into events
      const events = clusterArticles(processed);

      // 4. Generate AI summaries (with KV caching)
      await generateSummaries(events, env);

      // 5. Clean up internal fields
      for (const event of events) {
        delete event._primaryCountry;
      }

      // 6. Store in KV
      const payload = {
        lastUpdated: Date.now(),
        events: events,
        briefing: processed.slice(0, 100).map(a => ({
          headline: a.headline || a.title,
          description: (a.description || '').substring(0, 300),
          source: a.source || '',
          url: a.url || a.link || '',
          pubDate: a.pubDate || '',
          category: a.category || 'WORLD',
          importance: a.importance || 'medium'
        }))
      };

      await env.HEGEMON_CACHE.put('latest_events', JSON.stringify(payload));

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const withSummary = events.filter(e => e.summary).length;
      console.log(`[Cron] Done: ${events.length} events (${withSummary} with summaries), ${processed.length} briefing articles, ${elapsed}s`);

    } catch (err) {
      console.error('[Cron] Fatal error:', err.message, err.stack);
    }
  }
};
