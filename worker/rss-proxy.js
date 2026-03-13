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
const CACHE_TTL = 60 * 60 * 1000; // 1 hour — balance freshness with API cost

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
  // ===== WIRE SERVICES =====
  { url: 'https://news.google.com/rss/search?q=site:reuters.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Reuters' },
  { url: 'https://news.google.com/rss/search?q=site:apnews.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'AP News' },
  { url: 'https://news.google.com/rss/search?q=site:afp.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'AFP' },
  { url: 'https://news.google.com/rss/search?q=site:upi.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'UPI' },

  // ===== GOOGLE NEWS AGGREGATOR =====
  { url: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en', source: 'Google News World' },
  { url: 'https://news.google.com/rss/search?q=world+news+today&hl=en-US&gl=US&ceid=US:en', source: 'Google News' },

  // ===== US MAINSTREAM =====
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC World' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'New York Times' },
  { url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml', source: 'Wall Street Journal' },
  { url: 'https://news.google.com/rss/search?q=site:washingtonpost.com+world+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Washington Post' },
  { url: 'http://rss.cnn.com/rss/edition_world.rss', source: 'CNN' },
  { url: 'https://feeds.npr.org/1004/rss.xml', source: 'NPR' },
  { url: 'https://www.pbs.org/newshour/feeds/rss/world', source: 'PBS NewsHour' },
  { url: 'https://abcnews.go.com/abcnews/internationalheadlines', source: 'ABC News' },
  { url: 'https://www.cbsnews.com/latest/rss/world', source: 'CBS News' },
  { url: 'https://feeds.nbcnews.com/nbcnews/public/world', source: 'NBC News' },
  { url: 'https://news.google.com/rss/search?q=site:bloomberg.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Bloomberg' },
  { url: 'https://www.cnbc.com/id/100727362/device/rss/rss.html', source: 'CNBC' },
  { url: 'http://rssfeeds.usatoday.com/UsatodaycomWorld-TopStories', source: 'USA Today' },
  { url: 'https://time.com/feed/', source: 'Time' },
  { url: 'https://www.newsweek.com/rss', source: 'Newsweek' },
  { url: 'https://news.google.com/rss/search?q=site:theatlantic.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'The Atlantic' },
  { url: 'https://news.google.com/rss/search?q=site:axios.com+world+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Axios' },
  { url: 'https://www.politico.com/rss/politico-world-news.xml', source: 'Politico' },
  { url: 'https://thehill.com/feed/', source: 'The Hill' },
  { url: 'https://news.google.com/rss/search?q=site:vox.com+world+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Vox' },
  { url: 'https://news.google.com/rss/search?q=site:vice.com+news+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Vice News' },

  // ===== US CONSERVATIVE =====
  { url: 'https://moxie.foxnews.com/google-publisher/world.xml', source: 'Fox News' },
  { url: 'https://nypost.com/feed/', source: 'New York Post' },
  { url: 'https://www.washingtontimes.com/rss/headlines/news/world/', source: 'Washington Times' },
  { url: 'https://www.washingtonexaminer.com/section/world/feed', source: 'Washington Examiner' },
  { url: 'https://news.google.com/rss/search?q=site:dailywire.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Daily Wire' },
  { url: 'https://www.nationalreview.com/feed/', source: 'National Review' },
  { url: 'https://news.google.com/rss/search?q=site:thefederalist.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'The Federalist' },
  { url: 'https://feeds.feedburner.com/breitbart', source: 'Breitbart' },
  { url: 'https://dailycaller.com/feed/', source: 'Daily Caller' },
  { url: 'https://www.newsmax.com/rss/Headline/1/', source: 'Newsmax' },

  // ===== US LIBERAL =====
  { url: 'https://www.msnbc.com/feeds/latest', source: 'MSNBC' },
  { url: 'https://www.huffpost.com/section/world-news/feed', source: 'HuffPost' },
  { url: 'https://www.thenation.com/feed/', source: 'The Nation' },
  { url: 'https://www.salon.com/feed/', source: 'Salon' },
  { url: 'https://www.motherjones.com/feed/', source: 'Mother Jones' },
  { url: 'https://news.google.com/rss/search?q=site:theintercept.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'The Intercept' },
  { url: 'https://www.democracynow.org/democracynow.rss', source: 'Democracy Now' },

  // ===== UK =====
  { url: 'https://www.theguardian.com/world/rss', source: 'The Guardian' },
  { url: 'https://news.google.com/rss/search?q=site:telegraph.co.uk+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'The Telegraph' },
  { url: 'https://www.independent.co.uk/news/world/rss', source: 'The Independent' },
  { url: 'https://news.sky.com/feeds/rss/world.xml', source: 'Sky News' },
  { url: 'https://www.dailymail.co.uk/news/worldnews/index.rss', source: 'Daily Mail' },
  { url: 'https://news.google.com/rss/search?q=site:thetimes.co.uk+world+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'The Times UK' },
  { url: 'https://news.google.com/rss/search?q=site:ft.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Financial Times' },
  { url: 'https://www.mirror.co.uk/news/world-news/rss.xml', source: 'The Mirror' },
  { url: 'https://news.google.com/rss/search?q=site:standard.co.uk+world+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Evening Standard' },
  { url: 'https://news.google.com/rss/search?q=site:inews.co.uk+world+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'i News' },

  // ===== CANADA =====
  { url: 'https://www.cbc.ca/webfeed/rss/rss-world', source: 'CBC News' },
  { url: 'https://news.google.com/rss/search?q=site:theglobeandmail.com+world+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Globe and Mail' },

  // ===== EUROPEAN ENGLISH =====
  { url: 'https://rss.dw.com/rdf/rss-en-world', source: 'Deutsche Welle' },
  { url: 'https://www.france24.com/en/rss', source: 'France 24' },
  { url: 'https://www.euronews.com/rss?level=theme&name=news', source: 'EuroNews' },
  { url: 'https://www.irishtimes.com/cmlink/news-1.1319192', source: 'Irish Times' },
  { url: 'https://news.google.com/rss/search?q=site:thelocal.se+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'The Local Sweden' },
  { url: 'https://news.google.com/rss/search?q=site:thelocal.de+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'The Local Germany' },
  { url: 'https://news.google.com/rss/search?q=site:thelocal.fr+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'The Local France' },
  { url: 'https://news.google.com/rss/search?q=site:thelocal.it+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'The Local Italy' },
  { url: 'https://news.google.com/rss/search?q=site:thelocal.es+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'The Local Spain' },
  { url: 'https://www.scotsman.com/news/world/rss', source: 'The Scotsman' },
  { url: 'https://www.rte.ie/feeds/rss/?index=/news/world/', source: 'RTE Ireland' },
  { url: 'https://www.swissinfo.ch/eng/rss/world', source: 'Swiss Info' },
  { url: 'https://news.google.com/rss/search?q=site:politico.eu+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Politico EU' },
  { url: 'https://euobserver.com/rss.xml', source: 'EU Observer' },
  { url: 'https://news.google.com/rss/search?q=site:connexionfrance.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'The Connexion France' },

  // ===== EUROPEAN WIRE AGENCIES =====
  { url: 'https://news.google.com/rss/search?q=site:efe.com+english+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'EFE' },
  { url: 'https://news.google.com/rss/search?q=site:ansa.it+english+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'ANSA' },

  // ===== RUSSIA / EASTERN EUROPE =====
  { url: 'https://news.google.com/rss/search?q=site:tass.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'TASS' },
  { url: 'https://news.google.com/rss/search?q=site:rt.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'RT' },
  { url: 'https://www.themoscowtimes.com/rss/news', source: 'Moscow Times' },
  { url: 'https://kyivindependent.com/feed/', source: 'Kyiv Independent' },
  { url: 'https://www.ukrinform.net/rss/block-news-all', source: 'Ukrinform' },
  { url: 'https://news.google.com/rss/search?q=site:kyivpost.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Kyiv Post' },
  { url: 'https://news.google.com/rss/search?q=site:baltictimes.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Baltic Times' },
  { url: 'https://news.google.com/rss/search?q=site:praguemonitor.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Prague Monitor' },
  { url: 'https://balkaninsight.com/feed/', source: 'Balkan Insight' },
  { url: 'https://news.google.com/rss/search?q=site:romania-insider.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Romania Insider' },
  { url: 'https://news.google.com/rss/search?q=site:bbj.hu+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Budapest Business Journal' },
  { url: 'https://news.google.com/rss/search?q=site:sofiaglobe.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Sofia Globe' },

  // ===== MIDDLE EAST =====
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
  { url: 'https://www.alarabiya.net/tools/rss', source: 'Al Arabiya' },
  { url: 'https://www.middleeasteye.net/rss', source: 'Middle East Eye' },
  { url: 'https://www.middleeastmonitor.com/feed/', source: 'Middle East Monitor' },
  { url: 'https://www.timesofisrael.com/feed/', source: 'Times of Israel' },
  { url: 'https://news.google.com/rss/search?q=site:haaretz.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Haaretz' },
  { url: 'https://www.jpost.com/rss/rssfeedsfrontpage.aspx', source: 'Jerusalem Post' },
  { url: 'https://news.google.com/rss/search?q=site:i24news.tv+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'i24 News' },
  { url: 'https://news.google.com/rss/search?q=site:tehrantimes.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Tehran Times' },
  { url: 'https://news.google.com/rss/search?q=site:presstv.ir+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Press TV' },
  { url: 'https://www.arabnews.com/cat/1/rss.xml', source: 'Arab News' },
  { url: 'https://gulfnews.com/rss', source: 'Gulf News' },
  { url: 'https://news.google.com/rss/search?q=site:khaleejtimes.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Khaleej Times' },
  { url: 'https://www.dailysabah.com/rssFeed/todays_headlines', source: 'Daily Sabah' },
  { url: 'https://news.google.com/rss/search?q=site:trtworld.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'TRT World' },
  { url: 'https://www.aa.com.tr/en/rss/default?cat=world', source: 'Anadolu Agency' },
  { url: 'https://www.thenationalnews.com/rss', source: 'The National UAE' },
  { url: 'https://news.google.com/rss/search?q=site:al-monitor.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Al-Monitor' },
  { url: 'https://news.google.com/rss/search?q=site:rudaw.net+english+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Rudaw' },

  // ===== SOUTH ASIA =====
  { url: 'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms', source: 'Times of India' },
  { url: 'https://feeds.feedburner.com/ndtvnews-world-news', source: 'NDTV' },
  { url: 'https://www.thehindu.com/news/international/feeder/default.rss', source: 'The Hindu' },
  { url: 'https://www.hindustantimes.com/feeds/rss/world-news/rssfeed.xml', source: 'Hindustan Times' },
  { url: 'https://indianexpress.com/section/world/feed/', source: 'Indian Express' },
  { url: 'https://news.google.com/rss/search?q=site:theprint.in+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'The Print' },
  { url: 'https://news.google.com/rss/search?q=site:scroll.in+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Scroll India' },
  { url: 'https://news.google.com/rss/search?q=site:livemint.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Live Mint' },
  { url: 'https://news.google.com/rss/search?q=site:wionews.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'WION' },
  { url: 'https://www.dawn.com/feeds/home', source: 'Dawn' },
  { url: 'https://news.google.com/rss/search?q=site:tribune.com.pk+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Express Tribune' },
  { url: 'https://news.google.com/rss/search?q=site:geo.tv+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Geo News' },
  { url: 'https://www.thedailystar.net/frontpage/rss.xml', source: 'Daily Star Bangladesh' },
  { url: 'https://news.google.com/rss/search?q=site:dhakatribune.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Dhaka Tribune' },
  { url: 'https://news.google.com/rss/search?q=site:colombogazette.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Colombo Gazette' },
  { url: 'https://news.google.com/rss/search?q=site:dailymirror.lk+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Daily Mirror Sri Lanka' },
  { url: 'https://news.google.com/rss/search?q=site:kathmandupost.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Kathmandu Post' },
  { url: 'https://news.google.com/rss/search?q=site:recordnepal.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'The Record Nepal' },

  // ===== EAST ASIA =====
  { url: 'https://www.scmp.com/rss/91/feed', source: 'South China Morning Post' },
  { url: 'https://news.google.com/rss/search?q=site:cgtn.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'CGTN' },
  { url: 'https://news.google.com/rss/search?q=site:xinhuanet.com+english+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Xinhua' },
  { url: 'https://news.google.com/rss/search?q=site:globaltimes.cn+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Global Times' },
  { url: 'https://news.google.com/rss/search?q=site:chinadaily.com.cn+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'China Daily' },
  { url: 'https://www3.nhk.or.jp/nhkworld/en/news/rss.xml', source: 'NHK World' },
  { url: 'https://news.google.com/rss/search?q=site:japantimes.co.jp+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Japan Times' },
  { url: 'https://news.google.com/rss/search?q=site:asia.nikkei.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Nikkei Asia' },
  { url: 'https://news.google.com/rss/search?q=site:mainichi.jp+english+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Mainichi' },
  { url: 'https://news.google.com/rss/search?q=site:asahi.com+ajw+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Asahi Shimbun' },
  { url: 'https://www.koreaherald.com/common/rss_xml.php?ct=102', source: 'Korea Herald' },
  { url: 'https://news.google.com/rss/search?q=site:koreatimes.co.kr+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Korea Times' },
  { url: 'https://en.yna.co.kr/RSS/news.xml', source: 'Yonhap' },
  { url: 'https://news.google.com/rss/search?q=site:english.kyodonews.net+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Kyodo News' },
  { url: 'https://www.straitstimes.com/news/world/rss.xml', source: 'Straits Times' },
  { url: 'https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=6311', source: 'Channel News Asia' },
  { url: 'https://news.google.com/rss/search?q=site:taipeitimes.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Taipei Times' },
  { url: 'https://news.google.com/rss/search?q=site:taiwannews.com.tw+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Taiwan News' },
  { url: 'https://news.google.com/rss/search?q=site:bangkokpost.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Bangkok Post' },
  { url: 'https://news.google.com/rss/search?q=site:nationthailand.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'The Nation Thailand' },
  { url: 'https://news.google.com/rss/search?q=site:vnexpress.net+english+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'VNExpress' },
  { url: 'https://news.google.com/rss/search?q=site:phnompenhpost.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Phnom Penh Post' },
  { url: 'https://news.google.com/rss/search?q=site:myanmar-now.org+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Myanmar Now' },
  { url: 'https://www.rappler.com/feed/', source: 'Rappler' },
  { url: 'https://news.google.com/rss/search?q=site:mb.com.ph+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Manila Bulletin' },
  { url: 'https://news.google.com/rss/search?q=site:thejakartapost.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Jakarta Post' },

  // ===== CENTRAL ASIA =====
  { url: 'https://eurasianet.org/feed', source: 'Eurasianet' },
  { url: 'https://news.google.com/rss/search?q=site:thediplomat.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'The Diplomat' },
  { url: 'https://news.google.com/rss/search?q=site:akipress.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Akipress' },
  { url: 'https://news.google.com/rss/search?q=site:cabar.asia+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Cabar Asia' },

  // ===== AFRICA =====
  { url: 'https://www.africanews.com/feed/', source: 'Africa News' },
  { url: 'https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf', source: 'All Africa' },
  { url: 'https://nation.africa/rss.xml', source: 'Daily Nation Kenya' },
  { url: 'https://news.google.com/rss/search?q=site:theeastafrican.co.ke+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'The East African' },
  { url: 'https://news.google.com/rss/search?q=site:thecitizen.co.tz+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'The Citizen Tanzania' },
  { url: 'https://feeds.24.com/articles/news24/TopStories/rss', source: 'News24 South Africa' },
  { url: 'https://www.dailymaverick.co.za/dmrss/', source: 'Daily Maverick' },
  { url: 'https://news.google.com/rss/search?q=site:mg.co.za+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Mail & Guardian' },
  { url: 'https://news.google.com/rss/search?q=site:premiumtimesng.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Premium Times Nigeria' },
  { url: 'https://punchng.com/feed/', source: 'Punch Nigeria' },
  { url: 'https://guardian.ng/feed/', source: 'The Guardian Nigeria' },
  { url: 'https://news.google.com/rss/search?q=site:vanguardngr.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Vanguard Nigeria' },
  { url: 'https://news.google.com/rss/search?q=site:ghanaweb.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Ghana Web' },
  { url: 'https://news.google.com/rss/search?q=site:monitor.co.ug+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Daily Monitor Uganda' },
  { url: 'https://news.google.com/rss/search?q=site:newtimes.co.rw+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'New Times Rwanda' },
  { url: 'https://news.google.com/rss/search?q=site:ethiopia-insight.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Ethiopia Insight' },
  { url: 'https://news.google.com/rss/search?q=site:sudantribune.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Sudan Tribune' },
  { url: 'https://news.google.com/rss/search?q=site:libyanexpress.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Libyan Express' },
  { url: 'https://news.google.com/rss/search?q=site:moroccoworldnews.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Morocco World News' },
  { url: 'https://news.google.com/rss/search?q=site:northafricapost.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'The North Africa Post' },

  // ===== LATIN AMERICA =====
  { url: 'https://news.google.com/rss/search?q=site:batimes.com.ar+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Buenos Aires Herald' },
  { url: 'https://en.mercopress.com/rss', source: 'MercoPress' },
  { url: 'https://news.google.com/rss/search?q=site:brasilwire.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Brazil Wire' },
  { url: 'https://news.google.com/rss/search?q=site:folha.uol.com.br+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Folha' },
  { url: 'https://mexiconewsdaily.com/feed/', source: 'Mexico News Daily' },
  { url: 'https://news.google.com/rss/search?q=site:eluniversal.com.mx+english+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'El Universal' },
  { url: 'https://news.google.com/rss/search?q=site:colombiareports.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Colombia Reports' },
  { url: 'https://news.google.com/rss/search?q=site:ticotimes.net+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Tico Times' },
  { url: 'https://news.google.com/rss/search?q=site:jamaicaobserver.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Jamaica Observer' },
  { url: 'https://news.google.com/rss/search?q=site:guardian.co.tt+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Trinidad Guardian' },
  { url: 'https://news.google.com/rss/search?q=site:perureports.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Peru Reports' },
  { url: 'https://news.google.com/rss/search?q=site:venezuelanalysis.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Venezuela Analysis' },

  // ===== OCEANIA =====
  { url: 'https://www.abc.net.au/news/feed/2942460/rss.xml', source: 'ABC Australia' },
  { url: 'https://www.sbs.com.au/news/feed', source: 'SBS Australia' },
  { url: 'https://news.google.com/rss/search?q=site:smh.com.au+world+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Sydney Morning Herald' },
  { url: 'https://news.google.com/rss/search?q=site:theaustralian.com.au+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'The Australian' },
  { url: 'https://www.rnz.co.nz/rss/world.xml', source: 'RNZ New Zealand' },
  { url: 'https://www.nzherald.co.nz/arc/outboundfeeds/rss/section/nz/?outputType=xml', source: 'NZ Herald' },
  { url: 'https://news.google.com/rss/search?q=site:fijitimes.com.fj+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Fiji Times' },

  // ===== DEFENSE / SECURITY =====
  { url: 'https://news.google.com/rss/search?q=site:defenseone.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Defense One' },
  { url: 'https://news.google.com/rss/search?q=site:defensenews.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Defense News' },
  { url: 'https://news.google.com/rss/search?q=site:breakingdefense.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Breaking Defense' },
  { url: 'https://news.google.com/rss/search?q=site:warontherocks.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'War on the Rocks' },
  { url: 'https://news.google.com/rss/search?q=site:thedrive.com+the-war-zone+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'The War Zone' },
  { url: 'https://news.google.com/rss/search?q=site:janes.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Janes' },
  { url: 'https://news.google.com/rss/search?q=site:militarytimes.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Military Times' },
  { url: 'https://news.google.com/rss/search?q=site:stripes.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Stars and Stripes' },
  { url: 'https://news.google.com/rss/search?q=site:bellingcat.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Bellingcat' },

  // ===== BUSINESS / ECONOMICS =====
  { url: 'https://news.google.com/rss/search?q=site:economist.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'The Economist' },
  { url: 'https://www.forbes.com/world/feed/', source: 'Forbes' },
  { url: 'https://news.google.com/rss/search?q=site:businessinsider.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Business Insider' },
  { url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', source: 'MarketWatch' },
  { url: 'https://news.google.com/rss/search?q=site:barrons.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Barrons' },
  { url: 'https://news.google.com/rss/search?q=site:caixinglobal.com+when:1d&hl=en-US&gl=US&ceid=US:en', source: 'Caixin Global' },
  { url: 'https://economictimes.indiatimes.com/rssfeedstopstories.cms', source: 'Economic Times India' },
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
  'pets', 'abandoned pets', 'abandoned animals', 'lego', 'pokemon',
  'gamblers', 'betting on', 'candace owens', 'satellite fall',
  'superbugs', 'antimicrobial', 'youth unemployment',
  'iftar', 'sehri', 'ramadan timings', 'interactive bricks',
  'chatgpt-maker', 'sues chatgpt', 'marine insurers', 'insurance pricing',
  'retail rents', 'devotes life to', 'daily devotional',
  'best places to live', 'best cities', 'travel deals', 'vacation deals',
  'spring break', 'summer vacation',
  'golden corral', 'irreversible injuries', 'dress shoes', 'gifting $',
  'stephen a. smith', 'stephen a smith', 'literally anybody else',
  'intersystems appoints', 'inappropriate relationship',
  'oil sands', 'warmest winter', 'frigid east', 'hard to fathom',
  'free speech crisis', 'quiet part out loud',
  'cancer haunts', 'neighbors of canada',
  'trooper shot', 'state police trooper', 'prank goes wrong',
  'toilet paper prank', 'campus scandal',
  'killed by dogs', 'attack by dogs', 'attack by three dogs', 'dog attack',
  'killed saving', 'young mother killed',
  'advertising force of nature', 'force of nature',
  'save fuel', 'ways to save', 'ways to cut', 'ways to reduce',
  'ai fakes', 'ai disinformation', 'disinformation spread',
  'how profits took', 'took over american',
  'fails to meet trump', 'flying to mar-a-lago',
  'turning point usa', 'college president resigns', 'racist text chat',
  'free-market witness', 'jimmy lai',
  'ripped for posing', 'grinning photo', 'posing for photo',
  'liberal comic', 'we welcome everyone',
  'cries islamophobia', 'zohran mamdani', 'mamdani',
  'nearly destroyed fema', 'will her exit save',
  'pathetic energy fragility', 'petrol warnings',
  'covid response among', 'scars remain',
  'nigel farage', 'farage fails',
  'kristi noem', 'stephen a.', 'stephen a ',
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
  'hypersonic', 'submarine', 'aircraft carrier', 'chip export', 'tech ban',
  'diplomatic', 'diplomat', 'ambassador', 'embassy', 'consulate', 'envoy',
  'foreign minister', 'defense minister', 'prime minister', 'president',
  'tariffs', 'trade deal', 'trade agreement', 'economic warfare',
  'election results', 'election fraud', 'voter', 'ballot',
  'un vote', 'un resolution', 'security council', 'general assembly',
  'arms deal', 'weapons sale', 'military contract',
  'border dispute', 'border clash', 'border crossing', 'demilitarized',
  'refugee', 'asylum', 'migrant crisis', 'displacement',
  'oil price', 'oil embargo', 'energy deal', 'gas deal', 'pipeline',
  'cyber attack', 'cyberattack', 'hacking', 'state-sponsored',
  'coup attempt', 'overthrow', 'martial law', 'state of emergency',
  'protest', 'protests', 'demonstration', 'uprising', 'unrest',
  'assassination', 'assassinated', 'attempted assassination',
  'hostage', 'prisoner exchange', 'political prisoner', 'detained',
  'peace talks', 'peace deal', 'peace agreement', 'negotiation',
  'military exercise', 'military drill', 'war games',
  'reconnaissance', 'surveillance', 'intelligence',
  'naval exercise', 'fleet', 'destroyer', 'frigate', 'warship',
  'fighter jet', 'bomber', 'radar', 'defense system', 'air defense',
  'UN peacekeeping', 'humanitarian aid', 'aid delivery', 'relief effort',
  'deport', 'deportation', 'extradition', 'indictment',
  'election', 'referendum', 'constitutional', 'parliament',
  'minister', 'ministry', 'cabinet', 'government',
  'rebel', 'opposition', 'dissident', 'crackdown',
  'terror', 'terrorism', 'terrorist', 'extremist', 'radicalization',
  'explosion', 'bombing', 'attack', 'ambush', 'offensive',
  'conflict', 'fighting', 'combat', 'clashes', 'skirmish',
  'dead', 'killed', 'casualties', 'wounded', 'death toll'
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

const OPINION_PATTERNS = [
  /here'?s why that'?s/i,
  /might have the answer to/i,
  /\bhow i\b/i,
  /\bwhy i\b/i,
  /devotes life to/i,
  /did \w+ discontinue/i,
  /reportedly dropped.*(?:viewership|ratings|audience)/i,
  /\bop-?ed\b/i,
  /\bopinion\s*:/i,
  /\bcolumn\s*:/i,
  /\bcommentary\s*:/i,
  /\bletter to the editor\b/i,
  /\bbook review\b/i,
  /things you (?:need to|should) know/i,
  /what you need to know about/i,
  /\bexplainer\s*:/i,
  // Podcast/YouTube episode formats
  /\bep\.?\s*\d+/i,
  /\|\s*\d{1,2}\.\d{1,2}\.\d{2,4}\s*$/,
  // Photo captions
  /^photo\s*:/i,
  /^photos\s*:/i,
  /^video\s*:/i,
  /^watch\s*:/i,
  /^listen\s*:/i,
  // Fact-check/debunk articles
  /\bfalsely linked\b/i,
  /\bdoes not show\b/i,
  /\bmisrepresented\b/i,
  /\bfalse claim\b/i,
  /\bfact.?check\b/i,
  /\bold video of\b/i,
  /\bold photo of\b/i,
  /\bfootage from \d{4}\b/i,
  /\bai video of\b/i,
  // Corporate appointments (not heads of state)
  /\bappoints\b.*\b(?:CEO|CTO|CFO|COO|CMO|VP|director|leader|chief|officer|manager)\b/i,
  /\bnamed\s+(?:CEO|CTO|CFO|COO|CMO|VP|director|chief)\b/i,
  // Saying the quiet part / opinion phrasing
  /\bsaying the quiet part\b/i,
  /\bthink tank helped\b/i,
  // Listicles
  /^\d+\s+(?:ways?|things?|reasons?|tips?|steps?)\s+to\b/i,
  /^\d+\s+best\b/i,
  // Meta/index pages — just date headers
  /^headlines?\s+for\s+/i,
  /^today'?s\s+headlines/i,
  /^(?:morning|evening|daily)\s+(?:brief|digest|roundup|wrap)/i,
  // Obituaries of non-political figures (dame, sir + non-geo context)
  /^dame\s+\w+.*(?:force of nature|advertising|pioneer|legend|icon)/i,
  // Strong editorial opinion language in titles
  /\bthis government'?s blundering\b/i,
  /\bpathetic\b.*\b(?:energy|fragility|response|failure)\b/i,
  /\bcries\s+(?:islamophobia|racism|sexism|antisemitism)\b/i,
  /\bripped for\b/i,
  /\bwill (?:her|his|their) exit save\b/i,
  // Culture war commentary about specific media personalities
  /\bliberal comic\b/i,
  /\bconservative comic\b/i,
  // Podcast/show with pipe + date at end
  /\|\s*\d{1,2}[.\-/]\d{1,2}[.\-/]\d{2,4}/,
  /\|\s*(?:ep|episode)\b/i,
  // "How X took over Y" opinion format
  /\bhow\s+\w+\s+took\s+over\b/i,
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
// ============================================================
// Conflict Timeline Keywords (mirrored from Sidebar.jsx)
// ============================================================

const TIMELINE_IRAN_KW = ['iran', 'iranian', 'tehran', 'khamenei', 'mojtaba', 'irgc', 'hormuz', 'epic fury', 'roaring lion', 'pezeshkian', 'hezbollah', 'ras tanura', 'ras laffan', 'beirut', 'houthi', 'iris dena', 'nakhchivan'];
const TIMELINE_UKRAINE_KW = ['ukraine', 'ukrainian', 'kyiv', 'zelensky', 'zelenskyy', 'donbas', 'donetsk', 'luhansk', 'zaporizhzhia', 'kherson', 'crimea', 'russia', 'russian', 'moscow', 'kremlin', 'putin', 'kursk', 'syrskyi', 'bakhmut', 'kharkiv', 'odesa', 'odessa'];
const TIMELINE_SUDAN_KW = ['sudan', 'sudanese', 'darfur', 'khartoum', 'el-fasher', 'rsf', 'rapid support', 'burhan', 'hemedti', 'port sudan'];
const TIMELINE_PAKAFG_KW = ['pakistan', 'pakistani', 'afghanistan', 'afghan', 'taliban', 'kabul', 'kandahar', 'durand', 'ghazab', 'paktia', 'paktika', 'nangarhar', 'bagram', 'nur khan', 'islamabad'];
const TIMELINE_ACTION_KW = ['strike', 'struck', 'attack', 'missile', 'bomb', 'troops', 'casualt', 'offensive', 'airstrike', 'military', 'defense', 'defence', 'killed', 'destroy', 'combat', 'invasion', 'ceasefire', 'frontline', 'artillery', 'drone', 'naval', 'weapon', 'nuclear', 'shoot', 'shot down', 'shell', 'rocket', 'intercept', 'siege', 'blockade', 'retreat', 'captur', 'deploy', 'incursion', 'escalat', 'retaliat', 'surrender', 'wounded', 'death toll', 'warship', 'torpedo', 'displaced', 'evacuat', 'famine', 'atrocit', 'genocide', 'war crime', 'sanction', 'clash', 'raid', 'launch', 'target', 'blast', 'explosi', 'ground forces'];

const TIMELINE_CONFLICTS = {
  iran: {
    name: 'US-Israel War on Iran',
    keywords: TIMELINE_IRAN_KW,
    statsPrompt: `For stats, extract CUMULATIVE casualty figures from headlines AND descriptions. Scan every headline for death toll numbers. Examples: "7th U.S. military death" means us_killed="7". "death toll surpasses 1,332" means iranian_killed="1,332+". "bringing Israeli deaths to 11+" means israeli_killed="11+". NEVER return null if a number is mentioned anywhere in the articles — even in a headline.
Return stats with EXACTLY these keys (use the highest number found, or null ONLY if truly not mentioned):
{
  "iranian_killed": "highest cumulative Iranian death toll mentioned",
  "us_killed": "highest cumulative US military deaths mentioned",
  "israeli_killed": "highest cumulative Israeli deaths mentioned",
  "iranian_displaced": "displaced Iranians if mentioned",
  "targets_struck": "total targets struck if mentioned",
  "strait_of_hormuz_status": "open/closed/restricted"
}`
  },
  ukraine: {
    name: 'Russia-Ukraine War',
    keywords: TIMELINE_UKRAINE_KW,
    statsPrompt: `For stats, extract the LATEST CUMULATIVE figures. Always use the HIGHEST total number mentioned.
Return stats with EXACTLY these keys (use null if not mentioned):
{
  "total_casualties": "combined casualties both sides",
  "russian_killed": "cumulative Russian military deaths",
  "ukrainian_killed": "cumulative Ukrainian military deaths",
  "displaced": "total displaced persons",
  "territory_occupied_pct": "percentage of Ukraine occupied by Russia"
}`
  },
  sudan: {
    name: 'Sudan Civil War',
    keywords: TIMELINE_SUDAN_KW,
    statsPrompt: `For stats, extract the LATEST CUMULATIVE figures. Always use the HIGHEST total number mentioned.
Return stats with EXACTLY these keys (use null if not mentioned):
{
  "total_killed": "cumulative total deaths (e.g. '150,000+')",
  "civilian_killed": "cumulative civilian deaths",
  "displaced": "total displaced persons (e.g. '13.6 million')",
  "rsf_territory": "territory held by RSF if mentioned"
}`
  },
  pakafg: {
    name: 'Pakistan-Afghanistan War',
    keywords: TIMELINE_PAKAFG_KW,
    statsPrompt: `For stats, extract the LATEST CUMULATIVE figures. Always use the HIGHEST total number mentioned.
Return stats with EXACTLY these keys (use null if not mentioned):
{
  "afghan_civilian_killed": "cumulative Afghan civilian deaths (e.g. '110+')",
  "taliban_killed": "cumulative Taliban deaths (e.g. '527+')",
  "displaced": "total displaced persons (e.g. '115,000')",
  "pakistani_killed": "cumulative Pakistani military deaths"
}`
  },
};

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
  // Business reaction noise
  'surcharge', 'shipping cost', 'shipping rate', 'insurance premium',
  'freight rate', 'firms shocked', 'economic fallout', 'supply chain',
  'market tumbl', 'market rally', 'investor', 'trading session',
  'futures contract', 'price per barrel', 'business impact',
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
  'struck', 'destroyed', 'casualties', 'killed', 'bombardment', 'shelling',
  'retaliat', 'intercept', 'shot down', 'oil field', 'refinery',
  'ras tanura', 'strait of hormuz', 'damage report', 'death toll',
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
// Event Scoring & Tiered Summarization
// ============================================================

const CONFLICT_KEYWORDS = new Set([
  'strike', 'struck', 'killed', 'missile', 'war', 'invasion', 'ceasefire',
  'airstrike', 'bombing', 'troops', 'casualties', 'offensive', 'shelling',
  'bombardment', 'destroyed', 'retaliat', 'intercept', 'shot down',
  'genocide', 'ethnic cleansing', 'siege', 'blockade', 'ground offensive',
  'nuclear', 'warhead', 'enrichment', 'arsenal', 'weapons',
  'naval operation', 'carrier group', 'war crime'
]);

const DIPLOMATIC_KEYWORDS = new Set([
  'sanctions', 'summit', 'treaty', 'diplomatic', 'ceasefire', 'peace talks',
  'ambassador', 'envoy', 'nato', 'un resolution', 'condemn',
  'territorial', 'coup', 'escalat', 'hostage', 'humanitarian crisis',
  'mobiliz', 'deployment', 'evacuati', 'occupation'
]);

const ECONOMIC_KEYWORDS = new Set([
  'tariffs', 'tariff', 'oil prices', 'trade war', 'trade deal',
  'debt crisis', 'energy crisis', 'embargo', 'economic warfare',
  'gas pipeline', 'rare earth'
]);

// Strong keywords that qualify a single-source article as an event
const STRONG_EVENT_KEYWORDS = new Set([
  'conflict', 'war', 'military', 'strike', 'sanctions', 'nuclear',
  'coup', 'election', 'diplomat', 'treaty', 'missile', 'invasion',
  'ceasefire', 'genocide', 'assassination', 'bombing', 'airstrike',
  'troops', 'offensive', 'blockade', 'siege', 'hostage'
]);

const BUSINESS_NOISE_KEYWORDS = [
  'surcharge', 'shipping cost', 'shipping rate', 'insurance premium',
  'stock market react', 'shares fell', 'shares rose', 'stock price',
  'earnings impact', 'supply chain', 'freight rate', 'oil price impact',
  'market tumbl', 'market rally', 'investor', 'wall street', 'dow jones',
  'nasdaq', 's&p 500', 'trading session', 'market volatil', 'hedge fund',
  'commodity pric', 'futures contract', 'barrel of oil', 'price per barrel',
  'firms shocked', 'business impact', 'economic fallout', 'trade deficit'
];

// Score an event for tiered summarization priority
// Source count: 5+ = 3pts, 2-4 = 2pts, 1 = 1pt
// Keyword weight: conflict = +3, diplomatic = +2, economic = +1
// Recency: <2h = +2, <6h = +1
function scoreTierPriority(event) {
  let score = 0;
  const srcCount = event.sourceCount || 1;
  if (srcCount >= 5) score += 3;
  else if (srcCount >= 2) score += 2;
  else score += 1;

  const text = ((event.headline || '') + ' ' +
    (event.articles || []).map(a => (a.headline || '')).join(' ')).toLowerCase();

  let hasConflict = false, hasDiplomatic = false, hasEconomic = false;
  for (const kw of CONFLICT_KEYWORDS) {
    if (text.includes(kw)) { hasConflict = true; break; }
  }
  for (const kw of DIPLOMATIC_KEYWORDS) {
    if (text.includes(kw)) { hasDiplomatic = true; break; }
  }
  for (const kw of ECONOMIC_KEYWORDS) {
    if (text.includes(kw)) { hasEconomic = true; break; }
  }
  if (hasConflict) score += 3;
  if (hasDiplomatic) score += 2;
  if (hasEconomic) score += 1;

  // Recency — check newest article
  const now = Date.now();
  const TWO_HOURS = 2 * 60 * 60 * 1000;
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  const pubDates = (event.articles || []).map(a => a.pubDate ? new Date(a.pubDate).getTime() : 0).filter(t => t > 0);
  const newest = pubDates.length > 0 ? Math.max(...pubDates) : 0;
  if (newest > 0) {
    const age = now - newest;
    if (age < TWO_HOURS) score += 2;
    else if (age < SIX_HOURS) score += 1;
  }

  return score;
}

// Determine tier from priority score: 5+ = T1, 3-4 = T2, <3 = T3
function getEventTier(event) {
  const score = scoreTierPriority(event);
  if (score >= 5) return 1;
  if (score >= 3) return 2;
  return 3;
}

function scoreEvent(event) {
  const tier = getEventTier(event);
  const tierScore = (4 - tier) * 15;
  const sourceScore = Math.min(event.sourceCount, 20) * 3;
  const importanceScore = event.importance === 'high' ? 10 : 0;

  const text = ((event.headline || '') + ' ' +
    (event.articles || []).map(a => (a.headline || '')).join(' ')).toLowerCase();
  let noisePenalty = 0;
  for (const kw of BUSINESS_NOISE_KEYWORDS) {
    if (text.includes(kw)) { noisePenalty = -30; break; }
  }

  return tierScore + sourceScore + importanceScore + noisePenalty;
}

// ============================================================
// Clustering Engine (ported from eventsService.js)
// ============================================================

const HARD_CAP = 8;

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

  // Step 3a: Non-stoplist countries — always sub-cluster for distinct events
  for (const [, indices] of countryGroups.entries()) {
    if (indices.length === 1) {
      allClusters.push(indices);
    } else {
      const subs = subClusterByTopic(annotated, indices);
      for (const sub of subs) allClusters.push(sub);
    }
  }

  // Step 3b: Stoplist countries
  for (const [, indices] of stoplistGroups.entries()) {
    const subs = subClusterByTopic(annotated, indices);
    for (const sub of subs) allClusters.push(sub);
  }

  // Step 3c: No-country articles — higher similarity threshold for tighter clusters
  if (noCountry.length > 0) {
    const subs = subClusterBySimilarity(annotated, noCountry, 0.5);
    for (const sub of subs) allClusters.push(sub);
  }

  // Step 4: Build event objects
  const rawEvents = allClusters.map(indices => buildEvent(annotated, indices));

  // Step 5: Skip mergeByCountry — allow multiple distinct events per country
  const events = rawEvents;

  // Filter: require 2+ sources OR strong keyword match for ANY event
  const qualityFiltered = events.filter(e => {
    if (e.sourceCount >= 2) return true;
    // Single-source: must have a strong keyword to survive
    const text = ((e.headline || '') + ' ' +
      (e.articles || []).map(a => (a.headline || '')).join(' ')).toLowerCase();
    for (const kw of STRONG_EVENT_KEYWORDS) {
      if (text.includes(kw)) return true;
    }
    return false;
  });

  // Event-level headline dedup — drop events with near-identical headlines
  const seenHeadlines = [];
  const filtered = [];
  for (const evt of qualityFiltered) {
    const norm = (evt.headline || '').toLowerCase()
      .replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
    if (norm.length < 10) { filtered.push(evt); continue; }
    const words = new Set(norm.split(' '));
    let isDupeHeadline = false;
    for (const seen of seenHeadlines) {
      let overlap = 0;
      for (const w of words) { if (seen.has(w)) overlap++; }
      const maxLen = Math.max(words.size, seen.size);
      if (maxLen > 0 && overlap / maxLen >= 0.6) { isDupeHeadline = true; break; }
    }
    if (!isDupeHeadline) {
      seenHeadlines.push(words);
      filtered.push(evt);
    }
  }

  // Sort by relevance score first
  filtered.sort((a, b) => b._score - a._score);

  // Interleave categories — no more than 3 of the same category in a row
  const interleaved = [];
  const remaining = [...filtered];
  while (remaining.length > 0) {
    // Count consecutive same-category at end of interleaved
    let consecutiveCount = 0;
    let lastCat = null;
    if (interleaved.length > 0) {
      lastCat = interleaved[interleaved.length - 1].category;
      for (let k = interleaved.length - 1; k >= 0; k--) {
        if (interleaved[k].category === lastCat) consecutiveCount++;
        else break;
      }
    }

    if (consecutiveCount >= 3) {
      // Find the next event with a different category
      const diffIdx = remaining.findIndex(e => e.category !== lastCat);
      if (diffIdx > 0) {
        interleaved.push(remaining[diffIdx]);
        remaining.splice(diffIdx, 1);
      } else {
        // All remaining are same category, just push
        interleaved.push(remaining.shift());
      }
    } else {
      interleaved.push(remaining.shift());
    }
  }

  for (const e of interleaved) delete e._score;

  console.log(`[Cron] Clustering: ${articles.length} articles -> ${events.length} raw events -> ${interleaved.length} after quality filter`);
  return interleaved;
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
      // Require shared topic AND headline word overlap for tighter clustering
      const topicMatch = sharedTopics(art._topics, cluster.topics) >= 1;
      const headlineMatch = wordOverlap(art._headlineWords, cluster.seedWords) >= 0.25;
      if (topicMatch && headlineMatch) {
        cluster.members.push(idx);
        for (const t of art._topics) cluster.topics.add(t);
        for (const w of art._headlineWords) cluster.seedWords.add(w);
        placed = true;
        break;
      }
    }
    if (!placed) {
      clusters.push({ topics: new Set(art._topics), seedWords: new Set(art._headlineWords), members: [idx] });
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
      cf: { cacheTtl: 60 }
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
  } catch {
    clearTimeout(timeout);
    return [];
  }
}

async function fetchAllFeeds() {
  // Cloudflare Workers have a subrequest limit (~50 free, ~1000 paid).
  // Reserve subrequests for Claude API + KV writes (~15 needed).
  const MAX_FEEDS_PER_RUN = 35;

  // First 25 feeds are wire services + major outlets — always fetch
  const priorityFeeds = RSS_FEEDS.slice(0, 25);
  const rotatingFeeds = RSS_FEEDS.slice(25);

  // Rotate through remaining feeds using time-based window
  const rotationIndex = Math.floor(Date.now() / (30 * 60 * 1000)) % Math.ceil(rotatingFeeds.length / 10);
  const rotatingBatch = rotatingFeeds.slice(rotationIndex * 10, rotationIndex * 10 + 10);

  const feedsToFetch = [...priorityFeeds, ...rotatingBatch].slice(0, MAX_FEEDS_PER_RUN);
  console.log(`[Cron] Fetching ${feedsToFetch.length}/${RSS_FEEDS.length} RSS feeds (rotation ${rotationIndex})...`);

  const results = await Promise.allSettled(
    feedsToFetch.map(feed => fetchSingleFeed(feed.url, feed.source))
  );

  const allArticles = [];
  let okCount = 0;
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value && result.value.length > 0) {
      okCount++;
      allArticles.push(...result.value);
    }
  }

  console.log(`[Cron] RSS: ${okCount}/${feedsToFetch.length} feeds OK, ${allArticles.length} articles`);
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

    // Skip broken/empty entries
    if (title.trim().length < 10) continue;
    const titleLower = title.toLowerCase().trim();
    if (titleLower === 'politics and government' || titleLower === 'world' ||
        titleLower === 'news' || titleLower === 'breaking news') continue;

    const text = (title + ' ' + (article.description || '')).toLowerCase();

    if (IRRELEVANT_KEYWORDS.some(kw => text.includes(kw))) continue;

    // Opinion/feature filter
    if (OPINION_PATTERNS.some(p => p.test(title))) continue;

    const category = detectCategory(title, article.description);
    if (category === 'SPORTS') continue;

    const fullText = title + ' ' + (article.description || '');
    if (DOMESTIC_NOISE_PATTERNS.some(p => p.test(fullText))) continue;

    // WORLD category must have at least one geopolitical signal
    if (category === 'WORLD') {
      const lowerFull = fullText.toLowerCase();
      const hasGeoSignal = GEOPOLITICAL_SIGNALS.some(sig => lowerFull.includes(sig));
      if (!hasGeoSignal) continue;
    }

    // Non-English filter
    const nonAscii = (title.match(/[^\x20-\x7F]/g) || []).length;
    if (title.length > 10 && nonAscii / title.length > 0.15) continue;
    if (/\b(de|del|los|las|por|para|avec|dans|und|der|die|dari|dan|yang|pada)\b/i.test(title) &&
        !/\b(de facto|del rio|de gaulle)\b/i.test(title)) {
      const nonEnCount = (title.match(/\b(de|del|los|las|por|para|avec|dans|und|der|die|dari|dan|yang|pada|dari|untuk|dengan|atau|ini|itu|comme|sont|nous|leur)\b/gi) || []).length;
      if (nonEnCount >= 2) continue;
    }

    if (scoreGeopoliticalRelevance(fullText) < 2) continue;

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
          const threshold = existing.source === source ? 0.6 : 0.8;
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

  // Cap at 300 articles
  return unique.slice(0, 300);
}

// ============================================================
// AI Summary Generation (with KV caching per event)
// ============================================================

// Tiered refresh intervals (milliseconds)
const TIER_REFRESH_MS = {
  1: 0,                    // T1: every cron run (30 min) — always refresh
  2: 2 * 60 * 60 * 1000,  // T2: every 2 hours
  3: 3 * 60 * 60 * 1000,  // T3: every 3 hours
};

async function generateSummaries(events, env) {
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[Cron] No ANTHROPIC_API_KEY, skipping summaries');
    return;
  }

  const now = Date.now();

  // Load summary schedule tracker from KV — tracks last summary time per event hash
  let scheduleTracker = {};
  try {
    const raw = await env.HEGEMON_CACHE.get('summary_schedule');
    if (raw) scheduleTracker = JSON.parse(raw);
  } catch { /* start fresh */ }

  // Determine which events need summaries this run
  const needsSummary = [];
  const cachedFromKV = [];

  for (const event of events) {
    const key = hashEventTitles(event);
    const tier = getEventTier(event);
    const refreshInterval = TIER_REFRESH_MS[tier] || TIER_REFRESH_MS[3];
    const lastSummarized = scheduleTracker[key]?.ts || 0;
    const timeSinceLastSummary = now - lastSummarized;

    // Try to load cached summary from KV
    let hasCachedSummary = false;
    try {
      const cached = await env.HEGEMON_CACHE.get('summary_' + key);
      if (cached) {
        const data = JSON.parse(cached);
        if (data.summary && Date.now() - data.ts < 24 * 60 * 60 * 1000) {
          event.summary = data.summary;
          if (data.headline) event.headline = data.headline;
          hasCachedSummary = true;
        }
      }
    } catch { /* miss */ }

    if (!hasCachedSummary) {
      // NEW EVENT — no summary at all. ABSOLUTE PRIORITY.
      needsSummary.push({ event, tier, priority: 0 }); // priority 0 = highest
    } else if (tier === 1 || timeSinceLastSummary >= refreshInterval) {
      // Existing event due for refresh based on tier schedule
      needsSummary.push({ event, tier, priority: tier });
    } else {
      cachedFromKV.push(event);
    }
  }

  // Sort: new events (priority 0) first, then T1, T2, T3
  needsSummary.sort((a, b) => a.priority - b.priority || a.tier - b.tier);

  const newCount = needsSummary.filter(n => n.priority === 0).length;
  const refreshCount = needsSummary.length - newCount;
  console.log(`[Cron] Summaries: ${cachedFromKV.length} cached, ${newCount} new (priority), ${refreshCount} due for refresh`);

  if (needsSummary.length === 0) return;

  // Extract just the events in priority order
  const ordered = needsSummary.map(n => n.event);

  // Batch into groups of 10 for Claude API calls
  const BATCH_SIZE = 10;
  for (let i = 0; i < ordered.length; i += BATCH_SIZE) {
    const batch = ordered.slice(i, i + BATCH_SIZE);

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
          max_tokens: 6000,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        console.error(`[Cron] Claude API error: ${response.status} - ${errBody.substring(0, 200)}`);
        continue;
      }

      const aiData = await response.json();
      const aiText = aiData.content?.[0]?.text || '';

      let summaries;
      try {
        const jsonMatch = aiText.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          console.error(`[Cron] No JSON array found in Claude response (length=${aiText.length}), first 200 chars: ${aiText.substring(0, 200)}`);
        }
        summaries = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      } catch (parseErr) {
        console.error(`[Cron] Failed to parse Claude response: ${parseErr.message}, response length=${aiText.length}, first 300 chars: ${aiText.substring(0, 300)}`);
        summaries = [];
      }

      // Apply summaries and cache in KV
      for (let j = 0; j < batch.length; j++) {
        if (summaries[j]) {
          if (summaries[j].headline) {
            batch[j].headline = summaries[j].headline;
          }
          batch[j].summary = summaries[j].summary || null;

          const key = hashEventTitles(batch[j]);
          try {
            await env.HEGEMON_CACHE.put('summary_' + key, JSON.stringify({
              summary: summaries[j].summary,
              headline: summaries[j].headline,
              ts: Date.now()
            }), { expirationTtl: 86400 });
          } catch { /* best effort */ }

          // Update schedule tracker
          scheduleTracker[key] = { ts: Date.now(), tier: getEventTier(batch[j]) };
        }
      }

      console.log(`[Cron] Generated summaries for batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} events)`);

    } catch (err) {
      console.error('[Cron] Summary generation error:', err.message);
    }
  }

  // Prune old entries from schedule tracker (older than 24h)
  const pruned = {};
  for (const [k, v] of Object.entries(scheduleTracker)) {
    if (now - v.ts < 24 * 60 * 60 * 1000) pruned[k] = v;
  }

  // Save schedule tracker to KV
  try {
    await env.HEGEMON_CACHE.put('summary_schedule', JSON.stringify(pruned), { expirationTtl: 86400 });
  } catch { /* best effort */ }

  const totalWithSummary = events.filter(e => e.summary).length;
  console.log(`[Cron] Summary generation complete: ${totalWithSummary}/${events.length} events have summaries`);
}

// ============================================================
// Daily Country Analysis Update (runs at midnight UTC)
// ============================================================

async function updateCountryAnalyses(env) {
  console.log('[Daily] Starting country analysis update...');
  const startTime = Date.now();

  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[Daily] No ANTHROPIC_API_KEY');
    return;
  }

  // Load latest briefing articles from KV
  const eventsRaw = await env.HEGEMON_CACHE.get('latest_events');
  if (!eventsRaw) {
    console.log('[Daily] No events data, skipping');
    return;
  }

  const eventsData = JSON.parse(eventsRaw);
  const briefing = eventsData.briefing || [];

  // Group articles by country
  const countryArticles = {};
  for (const article of briefing) {
    const headline = article.headline || '';
    const country = extractPrimaryCountry(headline);
    if (!country) continue;
    const realCountry = country.startsWith('_stop_') ? country.replace('_stop_', '') : country;
    if (!countryArticles[realCountry]) countryArticles[realCountry] = [];
    countryArticles[realCountry].push(article);
  }

  // Get countries with articles, sorted by article count (most active first)
  const activeCountries = Object.entries(countryArticles)
    .filter(([, articles]) => articles.length >= 1)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 50);

  console.log(`[Daily] Found ${activeCountries.length} countries with recent articles`);
  if (activeCountries.length === 0) return;

  const today = new Date().toISOString().split('T')[0];
  const analyses = {};

  // Batch countries into groups of 10 for Claude calls
  const BATCH_SIZE = 10;
  for (let i = 0; i < activeCountries.length; i += BATCH_SIZE) {
    const batch = activeCountries.slice(i, i + BATCH_SIZE);

    const countryDescriptions = batch.map(([country, articles]) => {
      const articleList = articles.slice(0, 5).map(a =>
        `  - "${a.headline}" (${a.source}) ${a.pubDate || ''}`
      ).join('\n');
      return `COUNTRY: ${country}\nRecent articles:\n${articleList}`;
    }).join('\n\n');

    const prompt = `You are a geopolitical analyst for Hegemon, a global risk monitoring platform. Today is ${today}.

For each country below, write a concise situation analysis based on the recent articles provided. Each analysis has exactly 3 sections:

1. what: 2-3 sentences. Key developments in the last 24-48 hours. Cite specific events, names, numbers.
2. why: 1-2 sentences. Strategic significance, regional implications, what's at stake.
3. next: 1-2 sentences. Near-term outlook, escalation or de-escalation paths, next steps to watch.

RULES:
- Be specific and factual. Use the article details provided.
- Never say "limited information" or "details are emerging".
- Keep total analysis under 100 words per country.
- Write in present tense for ongoing situations.

${countryDescriptions}

Return a JSON object with country names as keys:
{
  "country_name": {
    "what": "What happened text...",
    "why": "Why it matters text...",
    "next": "What might happen text..."
  }
}

Return ONLY the JSON, no other text.`;

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
          max_tokens: 6000,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        console.error(`[Daily] Claude API error: ${response.status}`);
        continue;
      }

      const aiData = await response.json();
      const aiText = aiData.content?.[0]?.text || '';

      try {
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          Object.assign(analyses, parsed);
        }
      } catch (parseErr) {
        console.error(`[Daily] Parse error: ${parseErr.message}`);
      }

      console.log(`[Daily] Generated analyses for batch ${Math.floor(i / BATCH_SIZE) + 1}`);
    } catch (err) {
      console.error(`[Daily] Claude call failed: ${err.message}`);
    }
  }

  // Store in KV
  if (Object.keys(analyses).length > 0) {
    await env.HEGEMON_CACHE.put('country_analyses', JSON.stringify({
      analyses,
      lastUpdated: Date.now()
    }), { expirationTtl: 172800 }); // 48h TTL

    console.log(`[Daily] Stored ${Object.keys(analyses).length} country analyses in KV (${((Date.now() - startTime) / 1000).toFixed(1)}s)`);
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
    // GET /trigger-cron — manually trigger the cron handler
    // ============================================================
    if (url.pathname === '/trigger-cron' && request.method === 'GET') {
      try {
        await this.scheduled({}, env);
        const raw = await env.HEGEMON_CACHE.get('latest_events');
        const data = raw ? JSON.parse(raw) : {};
        const eventCount = (data.events || []).length;
        const summaryCount = (data.events || []).filter(e => e.summary).length;
        return new Response(
          JSON.stringify({ status: 'ok', eventCount, summaryCount, lastUpdated: data.lastUpdated }),
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
    // GET /timeline-update — AI-powered conflict timeline entries
    // ============================================================
    if (url.pathname === '/timeline-update' && request.method === 'GET') {
      try {
        // Check KV cache first
        const cacheKey = 'timeline_ai_cache';
        const cached = await env.HEGEMON_CACHE.get(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.lastUpdated && Date.now() - parsed.lastUpdated < 10800000) {
            return new Response(JSON.stringify({ ...parsed, cached: true }), {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'max-age=300' }
            });
          }
        }

        // Read briefing articles from KV
        const eventsRaw = await env.HEGEMON_CACHE.get('latest_events');
        if (!eventsRaw) {
          return new Response(
            JSON.stringify({ error: 'No events data available' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const eventsData = JSON.parse(eventsRaw);
        const briefing = eventsData.briefing || [];

        const apiKey = env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          return new Response(
            JSON.stringify({ error: 'API key not configured' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Filter briefing articles per conflict and call Claude
        const result = { iran: null, ukraine: null, sudan: null, pakafg: null, lastUpdated: Date.now(), cached: false };

        // Parse previous cache to reuse unchanged conflict data
        const prevCache = cached ? JSON.parse(cached) : null;
        const prevHashes = prevCache?._articleHashes || {};
        const newHashes = {};

        for (const [key, conflict] of Object.entries(TIMELINE_CONFLICTS)) {
          const matching = briefing.filter(article => {
            const hl = (article.headline || article.title || '').toLowerCase();
            if (!hl) return false;
            const hasCountry = conflict.keywords.some(kw => hl.includes(kw));
            const hasAction = TIMELINE_ACTION_KW.some(kw => hl.includes(kw));
            return hasCountry && hasAction;
          });

          // Hash current articles for this conflict to detect changes
          const articleFingerprint = matching.map(a => (a.headline || a.title || '').toLowerCase().trim()).sort().join('|');
          newHashes[key] = articleFingerprint;

          if (matching.length === 0) {
            result[key] = { timeline_entries: [], stats: {} };
            continue;
          }

          // Skip Claude call if articles haven't changed since last cache
          if (prevCache && prevHashes[key] === articleFingerprint && prevCache[key]?.timeline_entries?.length > 0) {
            result[key] = prevCache[key];
            console.log(`[Timeline] Skipping ${key} — no new articles since last update`);
            continue;
          }

          // Build article text for Claude
          const articleText = matching.slice(0, 20).map((a, i) => {
            const hl = a.headline || a.title || '';
            const desc = a.description || '';
            const time = a.pubDate || a.time || '';
            return `${i + 1}. [${time}] ${hl}${desc ? ' — ' + desc.substring(0, 200) : ''}`;
          }).join('\n');

          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15000);

            const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
              },
              signal: controller.signal,
              body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,
                messages: [{
                  role: 'user',
                  content: `You are a military intelligence analyst. Given these recent news articles about the ${conflict.name}, extract:

1. TIMELINE ENTRIES: A list of concrete events — each a single sentence describing a strike, casualty report, diplomatic move, or military operation. No opinion pieces, photo galleries, or commentary. Include the approximate timestamp from the article.

2. CUMULATIVE STATS: Extract the LATEST CUMULATIVE casualty figures mentioned in these articles. Look for RUNNING TOTAL death tolls, NOT per-incident numbers. For example, if an article says "death toll surpasses 1,332" that means the cumulative killed figure is "1,332+". If an article says "7th US soldier killed" that means us_killed is "7". Always return the HIGHEST cumulative number you find for each category.

${conflict.statsPrompt}

Articles:
${articleText}

Return ONLY valid JSON in this format:
{
  "timeline_entries": [{"text": "...", "timestamp": "ISO date string"}],
  "stats": {fill in the exact keys specified above}
}`
                }]
              })
            });
            clearTimeout(timeout);

            if (claudeResponse.ok) {
              const claudeData = await claudeResponse.json();
              const text = (claudeData.content || []).map(b => b.text || '').join('');
              // Extract JSON from response (may be wrapped in markdown code blocks)
              const jsonMatch = text.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                result[key] = {
                  timeline_entries: (parsed.timeline_entries || []).filter(e => e.text && e.timestamp),
                  stats: parsed.stats || {}
                };
              } else {
                result[key] = { timeline_entries: [], stats: {} };
              }
            } else {
              console.error(`Claude API error for ${key}:`, claudeResponse.status);
              result[key] = { timeline_entries: [], stats: {} };
            }
          } catch (err) {
            console.error(`Timeline Claude call failed for ${key}:`, err.message);
            result[key] = { timeline_entries: [], stats: {} };
          }
        }

        // Store article hashes for skip-empty-conflicts on next call
        result._articleHashes = newHashes;

        // Cache in KV with 3h TTL
        await env.HEGEMON_CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: 10800 });

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (err) {
        console.error('Timeline update error:', err);
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
            max_tokens: 4096,
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
          cf: { cacheTtl: 60 }
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
              sparkline: closes.length > 0 ? closes : [chartPrevClose || price, price],
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

    // ============================================================
    // GET /analyses — serve daily country analyses from KV
    // ============================================================
    if (url.pathname === '/analyses' && request.method === 'GET') {
      try {
        const data = await env.HEGEMON_CACHE.get('country_analyses');
        if (!data) {
          return new Response(
            JSON.stringify({ analyses: {}, lastUpdated: null }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        return new Response(data, {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(
          JSON.stringify({ error: 'Analyses fetch error' }),
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
  // Cron Handler — runs every 30 minutes
  // Fetches RSS feeds, clusters articles, generates AI summaries,
  // stores everything in KV for instant client access via GET /events
  // ============================================================
  async scheduled(event, env) {
    // Daily cron: update country analyses
    if (event.cron === '0 0 * * *') {
      try {
        await updateCountryAnalyses(env);
      } catch (err) {
        console.error('[Daily] Fatal error:', err.message, err.stack);
      }
      return;
    }

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
