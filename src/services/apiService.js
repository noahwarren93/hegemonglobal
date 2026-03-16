// apiService.js - News fetching, briefing history, RSS feeds, dynamic risk system

import {
  COUNTRIES, DAILY_BRIEFING, DAILY_BRIEFING_FALLBACK, DAILY_EVENTS,
  IRRELEVANT_KEYWORDS, GEOPOLITICAL_SIGNALS, STRONG_GEO_SIGNALS,
  DOMESTIC_NOISE_PATTERNS, ESCALATION_KEYWORDS,
  DEESCALATION_KEYWORDS, CATEGORY_WEIGHTS, COUNTRY_DEMONYMS
} from '../data/countries';
import { formatSourceName, timeAgo, SOURCE_BLOCKLIST, balanceSourceOrigins } from '../utils/riskColors';
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

// 200+ RSS feeds — comprehensive global English-language news coverage
// Client-side fallback only (Worker cron is primary). Fetched in batches of 5.
const RSS_FEEDS = {
  daily: [
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

export const NEWS_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes — matches Worker cron
let _rssFallbackAttempts = 0;
const MAX_RSS_FALLBACK_ATTEMPTS = 3; // Stop trying RSS after 3 failures
let _rssFallbackInProgress = false; // Prevent concurrent RSS fallback runs

// ============================================================
// localStorage News Cache (show cached immediately, fetch in background)
// ============================================================

const NEWS_LS_KEY = 'hegemon_news_cache';
const EVENTS_LS_KEY = 'hegemon_events_cache';
const NEWS_LS_TTL = 30 * 60 * 1000; // 30 minutes — refresh frequently during active crisis coverage

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

// Pre-computed country→articles map from DAILY_BRIEFING (populated on load)
const COUNTRY_NEWS_PRECACHE = {};
let _precacheReady = false;

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

// Geopolitical priority scoring — higher = more geopolitically relevant
const GEO_PRIORITY_RE = /\b(tariff|nato|military|sanction|trade war|trade deal|diplomat|summit|war|conflict|treaty|election|coup|protest|nuclear|missile|invasion|ceasefire|embargo|annex|occupation|insurgent|terrorism|rebel|drone strike|airstrikes|genocide|ethnic cleansing|refugee|humanitarian|famine|blockade|arms deal|defense pact|intelligence|espionage|cyber attack|assassination|martial law)\b/i;
const DOMESTIC_NOISE_RE = /\b(arrested|robbery|car crash|drunk driving|house fire|local police|missing person|obituary|real estate|weather forecast|recipe|horoscope|lottery|pet|wedding|birthday|graduation|prom)\b/i;

function scoreGeoPriority(headline) {
  const lower = (headline || '').toLowerCase();
  let score = 0;
  if (GEO_PRIORITY_RE.test(lower)) score += 10;
  if (DOMESTIC_NOISE_RE.test(lower)) score -= 5;
  score += scoreHeadlineQuality(headline);
  return score;
}

// Pre-compute country news from DAILY_BRIEFING — fast demonym matching
export function preComputeCountryNews() {
  if (!DAILY_BRIEFING || DAILY_BRIEFING.length === 0) return;
  const countryNames = Object.keys(COUNTRIES);

  // Pre-compute lowercase text once per article
  const prepared = DAILY_BRIEFING.map(a => {
    const title = a.title || a.headline || '';
    return {
      article: a,
      title,
      text: (title + ' ' + (a.description || '')).toLowerCase()
    };
  });

  for (const countryName of countryNames) {
    const countryLower = countryName.toLowerCase();
    const terms = COUNTRY_DEMONYMS[countryName] || [countryLower];
    const allTerms = [countryLower, ...terms];
    const termRegexes = allTerms.map(term =>
      new RegExp('\\b' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b')
    );

    const matches = [];
    for (const p of prepared) {
      // TV listings filter
      if (TV_LISTING_RE.test(p.title)) continue;
      if (TV_SOURCE_RE.test(p.text)) continue;
      if (termRegexes.some(rx => rx.test(p.text))) {
        const headline = p.article.title || p.article.headline;
        matches.push({
          headline,
          source: formatSourceName(p.article.source_id || p.article.source || 'News'),
          pubDate: p.article.pubDate || '',
          url: p.article.link || p.article.url || '',
          category: p.article.category || detectCategory(headline, p.article.description || ''),
          qualityScore: scoreHeadlineQuality(headline),
          geoPriority: scoreGeoPriority(headline)
        });
      }
    }
    if (matches.length > 0) {
      // Sort: geopolitical articles first, domestic noise last
      matches.sort((a, b) => b.geoPriority - a.geoPriority);
      COUNTRY_NEWS_PRECACHE[countryName] = matches;
    }
  }
  _precacheReady = true;
  console.log('[Hegemon] Country news precache ready:', Object.keys(COUNTRY_NEWS_PRECACHE).length, 'countries');
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
      // Fast relevance check: only match country names/demonyms with word boundaries
      // (articles are already pre-filtered by Worker, no need to re-check IRRELEVANT_KEYWORDS)
      const countryLower = countryName.toLowerCase();
      const terms = COUNTRY_DEMONYMS[countryName] || [countryLower];
      const allTerms = [countryLower, ...terms];
      // Pre-compile regex for all terms (avoids re-creating per article)
      const termRegexes = allTerms.map(term =>
        new RegExp('\\b' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b')
      );

      const relevant = [];
      for (const p of prepared) {
        if (termRegexes.some(rx => rx.test(p.text))) {
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

// TV listings / schedule filter — reject articles that are TV schedules
const TV_LISTING_RE = /^\d{1,2}\/\d{1,2}\/\d{2,4}\s*:/;
const TV_SOURCE_RE = /\b(tv guide|tvguide|tv insider|tv tonight|what's on tv|zap2it|tv passport|digiguide|on tv tonight)\b/i;

// Sports keywords — if article matches an ambiguous country name AND contains these, reject it
const SPORTS_KEYWORDS = /\b(coach|offensive|quarterback|touchdown|roster|ncaa|football|basketball|baseball|soccer|nfl|nba|mlb|nhl|draft pick|playoffs|season|halftime|wide receiver|linebacker|defensive|rushing|passing|rebound|batting|pitcher|goaltender|slam dunk|free throw|field goal|punt|fumble|interception|varsity|collegiate|bowl game|march madness|final four|championship game|recruit|transfer portal|nil deal|paralympics|paralympian|winter olympics|summer olympics)\b/i;

// Geopolitical context — if article has these alongside Olympic/Paralympic keywords, keep it
const GEO_CONTEXT_RE = /\b(boycott|sanctions|diplomatic|protest|geopolit|ban|doping scandal|state.?sponsor|politiciz|withdraw|cold war|propaganda)\b/i;

// Ambiguous country names that also match common person names or US states
// These require additional context words to confirm the article is about the country
// excludeWords: if ANY of these appear, article is NOT about the country
const AMBIGUOUS_COUNTRIES = {
  'Chad': {
    negativeOnly: true, // No context requirement — just exclude person-name matches
    contextWords: [],
    excludeWords: ['chad johnson', 'chad ochocinco', 'chad gable', 'chad kelly', 'chad henne', 'chad smith', 'chad michael murray', 'chad boseman', 'chad wolf', 'chad daybell', 'chad kroeger', 'chad reed', 'chad hurley', 'chad powers', 'chad le clos', 'chad daniels', 'chad green', 'chad bettis', 'chad pennington', 'chad brown', 'chad coleman', 'chad lowe', 'chad everett', 'chad stahelski', 'chad mendes', 'chad ford', 'chad curtis', 'chad ocho']
  },
  'Jordan': {
    contextWords: ['amman', 'jordanian', 'hashemite', 'king abdullah', 'west bank', 'dead sea', 'petra', 'aqaba', 'zarqa', 'irbid', 'arab league'],
    excludeWords: ['michael jordan', 'jordan peele', 'jordan love', 'jordan spieth', 'jordan poole', 'jordan clarkson', 'jordan davis', 'jordan peterson', 'jordan brand', 'air jordan']
  },
  'Georgia': {
    contextWords: ['tbilisi', 'caucasus', 'south caucasus', 'south ossetia', 'abkhazia', 'georgian dream', 'saakashvili', 'black sea', 'ivanishvili', 'nato', 'kavelashvili', 'batumi', 'zourabichvili', 'eu candidacy', 'foreign agents law', 'kutaisi', 'gori'],
    excludeWords: ['atlanta', 'peach state', 'governor kemp', 'kemp', 'warnock', 'fulton county', 'gop', 'senate race', 'georgia bulldogs', 'georgia tech', 'uga', 'sec championship', 'dawgs', 'kirby smart', 'georgia runoff', 'dekalb county', 'cobb county', 'savannah', 'augusta national', 'georgia primary', 'georgia voter', 'georgia election law', 'stacey abrams', "buc-ee", 'special election', 'oscars', 'film industry', 'dolton', 'bbb rating', '14th district', 'film tax', 'georgia film', 'piedmont', 'macon', 'albany ga', 'georgia power', 'georgia lottery']
  },
  'Mali': {
    contextWords: ['bamako', 'malian', 'sahel', 'wagner', 'jnim', 'timbuktu', 'junta', 'tuareg', 'azawad', 'minusma', 'french troops', 'gao', 'kidal', 'mopti', 'saharan'],
    excludeWords: ['mali malibu']
  },
  'Niger': {
    contextWords: ['niamey', 'nigerien', 'sahel', 'junta', 'coup', 'uranium', 'ecowas', 'bazoum', 'tchiani', 'french base', 'agadez', 'diffa', 'zinder', 'saharan'],
    excludeWords: []
  },
};

export function isRelevantToCountry(title, description, countryName) {
  const text = ((title || '') + ' ' + (description || '')).toLowerCase();
  const titleLower = (title || '').toLowerCase();
  const descLower = (description || '').toLowerCase();
  const countryLower = countryName.toLowerCase();

  // TV listings filter — reject date-prefixed TV schedules and TV guide sources
  if (TV_LISTING_RE.test(title || '')) return false;
  if (TV_SOURCE_RE.test(text)) return false;

  for (const kw of IRRELEVANT_KEYWORDS) {
    if (text.includes(kw)) return false;
  }

  const countryTerms = COUNTRY_DEMONYMS[countryName] || [countryLower];
  const allTerms = [countryLower, ...countryTerms];

  const matchesTerm = (str) => allTerms.some(term => {
    const regex = new RegExp('\\b' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
    return regex.test(str);
  });

  const inTitle = matchesTerm(titleLower);
  const inDesc = matchesTerm(descLower);
  if (!inTitle && !inDesc) return false;

  // For ambiguous country names, require context OR reject sports/exclusion content
  const ambig = AMBIGUOUS_COUNTRIES[countryName];
  if (ambig) {
    // If article contains sports keywords, reject it (unless geopolitical context)
    if (SPORTS_KEYWORDS.test(text) && !GEO_CONTEXT_RE.test(text)) return false;
    // If article contains exclusion words (US state context, person names), reject it
    if (ambig.excludeWords && ambig.excludeWords.some(ew => text.includes(ew))) return false;
    // negativeOnly mode (Chad): excludeWords filtering is enough, skip context requirement
    if (ambig.negativeOnly) return true;
    // Check if any context word appears — confirms it's actually about the country
    const hasContext = ambig.contextWords.some(cw => text.includes(cw));
    // Also accept if an unambiguous demonym (not just the country name) matched
    // "georgian" is itself ambiguous (US state vs country), so don't let it bypass context
    const AMBIG_DEMONYMS = new Set(['georgian']);
    const demonymMatched = countryTerms.some(term => {
      if (term === countryLower) return false; // skip the ambiguous name itself
      if (AMBIG_DEMONYMS.has(term)) return false; // skip ambiguous demonyms
      const regex = new RegExp('\\b' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
      return regex.test(text);
    });
    if (!hasContext && !demonymMatched) return false;
  }

  // Israel: reject if "Israel" only appears as part of a worship name (Temple Israel, Beth Israel, etc.)
  if (countryName === 'Israel') {
    const WORSHIP_RE = /\b(temple israel|beth israel|congregation israel|bnai israel|b'nai israel|house of israel|ohev israel)\b/i;
    if (WORSHIP_RE.test(text)) {
      // Only keep if genuine Israel-country keywords also appear
      const ISRAEL_COUNTRY_RE = /\b(idf|netanyahu|tel aviv|jerusalem|gaza|west bank|hezbollah|hamas|knesset|mossad|shin bet|iron dome|kibbutz|intifada|zionist|settler|golan|negev|likud|palestinian|ramallah)\b/i;
      if (!ISRAEL_COUNTRY_RE.test(text)) return false;
    }
  }

  // Paralympics/Olympics: reject if ONLY sports context (no geopolitical angle)
  if (/\b(paralympics|paralympian|winter olympics|summer olympics|olympic games)\b/i.test(text)) {
    if (!GEO_CONTEXT_RE.test(text)) return false;
  }

  // For all countries: reject if article has sports keywords and country name is the ONLY geo term
  if (!ambig && SPORTS_KEYWORDS.test(text)) {
    // Only reject if the source also looks like sports (partial check via blocklist handled elsewhere)
    const fullText = (title || '') + ' ' + (description || '');
    if (/\b(wire|espn|sports|athletic|sbnation)\b/i.test(fullText)) return false;
  }

  return true;
}

// Strict headline-only matching — for country modal to avoid source-name false positives
export function isHeadlineAboutCountry(headline, countryName) {
  if (!headline || !countryName) return false;
  // Strip trailing " - Source Name" (Google News format)
  let clean = headline;
  const dashIdx = clean.lastIndexOf(' - ');
  if (dashIdx > 0 && dashIdx > clean.length - 50) {
    clean = clean.substring(0, dashIdx);
  }
  const headlineLower = clean.toLowerCase();
  const countryLower = countryName.toLowerCase();
  const countryTerms = COUNTRY_DEMONYMS[countryName] || [countryLower];
  const allTerms = [countryLower, ...countryTerms];
  const matched = allTerms.some(term => {
    const regex = new RegExp('\\b' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
    return regex.test(headlineLower);
  });
  if (!matched) return false;

  // Apply disambiguation for ambiguous country names
  const ambig = AMBIGUOUS_COUNTRIES[countryName];
  if (ambig) {
    if (SPORTS_KEYWORDS.test(headlineLower)) return false;
    if (ambig.excludeWords && ambig.excludeWords.some(ew => headlineLower.includes(ew))) return false;
    const hasContext = ambig.contextWords.some(cw => headlineLower.includes(cw));
    const AMBIG_DEMONYMS = new Set(['georgian']);
    const demonymMatched = countryTerms.some(term => {
      if (term === countryLower) return false;
      if (AMBIG_DEMONYMS.has(term)) return false;
      const regex = new RegExp('\\b' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
      return regex.test(headlineLower);
    });
    if (!hasContext && !demonymMatched) return false;
  }

  // Israel: reject if "Israel" only appears as part of a worship name
  if (countryName === 'Israel') {
    const WORSHIP_RE = /\b(temple israel|beth israel|congregation israel|bnai israel|b'nai israel|house of israel|ohev israel)\b/i;
    if (WORSHIP_RE.test(headlineLower)) {
      const ISRAEL_COUNTRY_RE = /\b(idf|netanyahu|tel aviv|jerusalem|gaza|west bank|hezbollah|hamas|knesset|mossad|shin bet|iron dome|kibbutz|intifada|zionist|settler|golan|negev|likud|palestinian|ramallah)\b/i;
      if (!ISRAEL_COUNTRY_RE.test(headlineLower)) return false;
    }
  }
  return true;
}

// ============================================================
// RSS Fetching
// ============================================================

const FEED_TIMEOUT_MS = 5000; // 5-second hard timeout per feed

export async function fetchRSS(feedUrl, sourceName) {
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
  'incursion', 'blockade', 'convoy', 'artillery', 'ground operation',
  'bombardment', 'retaliat', 'intercept', 'shot down', 'oil field',
  'refinery', 'ras tanura', 'strait of hormuz', 'carrier group',
  'destroyed', 'struck', 'damage report', 'death toll'
];

const OPINION_PENALIZE_TERMS = [
  'dismisses', 'urges', 'slams', 'blasts', 'reacts',
  'responds', 'says', 'calls on', 'accuses', 'criticizes',
  'condemns', 'warns', 'threatens', 'claims', 'denies',
  'demands', 'challenges', 'mocks', 'praises', 'thanks',
  'reveals', 'opinion', 'editorial', 'analysis', 'commentary',
  'vows', 'hints', 'suggests', 'believes',
  // Business reaction noise — deprioritize as representative headlines
  'surcharge', 'shipping cost', 'shares fell', 'shares rose',
  'stock price', 'market react', 'insurance premium', 'freight rate',
  'firms shocked', 'economic fallout', 'supply chain'
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
  const isAmbiguous = countryName in AMBIGUOUS_COUNTRIES;
  const relevant = articles.filter(a => {
    // TV listings filter
    if (TV_LISTING_RE.test(a.title || '')) return false;
    if (TV_SOURCE_RE.test(((a.title || '') + ' ' + (a.description || '')).toLowerCase())) return false;
    return isRelevantToCountry(a.title, a.description, countryName);
  });
  // For ambiguous countries, NEVER fall back to unfiltered articles — that defeats disambiguation
  const toUse = relevant.length > 0 ? relevant : (isAmbiguous ? [] : articles);

  // Score and sort: geopolitical articles first, domestic noise last
  const scored = toUse.map(a => ({ article: a, score: scoreGeoPriority(a.title) }));
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 15).map(({ article, score }) => ({
    headline: article.title,
    source: formatSourceName(article.source_id),
    pubDate: article.pubDate || '',
    url: article.link || '',
    category: detectCategory(article.title, article.description),
    qualityScore: score,
    geoPriority: score
  }));
}

// ============================================================
// Try a news API with timeout
// ============================================================

// ============================================================
// Fetch country-specific news — calls worker /country-news endpoint
// with local DAILY_BRIEFING + Google News fallback
// ============================================================

export async function fetchCountryNews(countryName) {

  // 1. Check cache (full enriched cache from previous modal open)
  const cached = getCachedNews(countryName);
  if (cached) return cached;

  // 2. Try worker /country-news endpoint (pre-built feeds from cron)
  try {
    const resp = await fetch(`${RSS_PROXY_BASE}/country-news?country=${encodeURIComponent(countryName)}`);
    if (resp.ok) {
      const data = await resp.json();
      if (data.articles && data.articles.length > 0) {
        // Format for display consistency
        const articles = data.articles.map(a => ({
          headline: a.headline || '',
          source: formatSourceName(a.source || 'News'),
          pubDate: a.pubDate || '',
          url: a.url || '',
          category: a.category || 'WORLD',
          importance: a.importance || 'medium',
          qualityScore: scoreHeadlineQuality(a.headline || ''),
          geoPriority: scoreGeoPriority(a.headline || '')
        }));
        console.log('[Hegemon] fetchCountryNews', countryName, '- from worker:', articles.length);
        setCachedNews(countryName, articles);
        return articles;
      }
    }
  } catch (err) {
    console.warn('[Hegemon] Worker country-news failed:', err.message);
  }

  // 3. Fallback: serve precache if available
  if (_precacheReady && COUNTRY_NEWS_PRECACHE[countryName] && COUNTRY_NEWS_PRECACHE[countryName].length > 0) {
    const precached = [...COUNTRY_NEWS_PRECACHE[countryName]];
    setCachedNews(countryName, precached);
    return precached;
  }

  // 4. Fallback: search DAILY_BRIEFING locally
  const allArticles = [];
  const seenHeadlines = new Set();

  const addArticle = (article) => {
    const h = (article.headline || '').toLowerCase().substring(0, 60);
    if (seenHeadlines.has(h)) return;
    seenHeadlines.add(h);
    allArticles.push(article);
  };

  if (DAILY_BRIEFING && DAILY_BRIEFING.length > 0) {
    DAILY_BRIEFING.forEach(article => {
      if (isRelevantToCountry(article.title || article.headline, article.description || '', countryName)) {
        const headline = article.title || article.headline;
        addArticle({
          headline,
          source: formatSourceName(article.source_id || article.source || 'News'),
          pubDate: article.pubDate || '',
          url: article.link || article.url || '',
          category: article.category || detectCategory(headline, article.description || ''),
          qualityScore: scoreHeadlineQuality(headline),
          geoPriority: scoreGeoPriority(headline)
        });
      }
    });
  }

  // 5. Fallback: Google News RSS
  const AMBIGUOUS_SEARCH_QUALIFIERS = {
    'Georgia': 'Georgia Caucasus Tbilisi country',
    'Chad': 'Chad Africa N\'Djamena country',
    'Jordan': 'Jordan Middle East Amman country',
    'Mali': 'Mali Africa Bamako country',
    'Niger': 'Niger Africa Niamey country',
  };
  try {
    const searchQuery = AMBIGUOUS_SEARCH_QUALIFIERS[countryName] || (countryName + ' news');
    const googleNewsUrl = RSS_FEEDS.search(searchQuery);
    const articles = await fetchRSS(googleNewsUrl, 'Google News');
    if (articles && articles.length > 0) {
      formatArticlesForDisplay(articles, countryName).forEach(a => addArticle(a));
    }
  } catch {
    // silent
  }

  allArticles.sort((a, b) => (b.geoPriority || 0) - (a.geoPriority || 0));

  console.log('[Hegemon] fetchCountryNews', countryName, '- fallback total:', allArticles.length);
  if (allArticles.length > 0) setCachedNews(countryName, allArticles);
  return allArticles;
}

// Fetch news for non-state actor groups via Google News RSS
const THREAT_NEWS_CACHE = {};
export async function fetchThreatGroupNews(searchTerm) {
  if (!searchTerm) return [];
  const cacheKey = searchTerm.toLowerCase();
  const cached = THREAT_NEWS_CACHE[cacheKey];
  if (cached && (Date.now() - cached.timestamp) < 5 * 60 * 1000) return cached.data;
  try {
    const url = RSS_FEEDS.search(searchTerm + ' news');
    const articles = await fetchRSS(url, 'Google News');
    const results = (articles || []).slice(0, 5).map(a => ({
      headline: a.title,
      source: formatSourceName(a.source_id || a.source || 'News'),
      pubDate: a.pubDate || '',
      url: a.link || a.url || '',
    }));
    THREAT_NEWS_CACHE[cacheKey] = { data: results, timestamp: Date.now() };
    return results;
  } catch (e) {
    console.warn('Threat group news fetch failed:', e.message);
    return [];
  }
}

// Lightweight country extraction for Worker events (Worker strips _primaryCountry)
function quickPrimaryCountry(headline) {
  const h = (headline || '').toLowerCase();
  if (/\bukrain|kyiv|zelensky|donbas/.test(h)) return 'ukraine';
  if (/\bpalestine|gaza|hamas|west bank/.test(h)) return 'palestine';
  if (/\bisrael|\bidf\b|netanyahu|tel aviv/.test(h)) return 'israel';
  if (/\biran|tehran|irgc|khamenei|pezeshkian/.test(h)) return 'iran';
  if (/\brussia|moscow|kremlin|putin/.test(h)) return 'russia';
  if (/\bpakistan|islamabad/.test(h)) return 'pakistan';
  if (/\bafghan|kabul|taliban/.test(h)) return 'afghanistan';
  if (/\bsudan|khartoum|darfur|el.fasher/.test(h)) return 'sudan';
  if (/\bsyria|damascus/.test(h)) return 'syria';
  if (/\byemen|houthi|sanaa/.test(h)) return 'yemen';
  if (/\blebanon|beirut|hezbollah/.test(h)) return 'lebanon';
  if (/\biraq|baghdad/.test(h)) return 'iraq';
  if (/\bchina|beijing/.test(h)) return 'china';
  if (/\btaiwan|taipei/.test(h)) return 'taiwan';
  if (/\bnorth korea|pyongyang/.test(h)) return 'north korea';
  if (/\bmyanmar|burma/.test(h)) return 'myanmar';
  if (/\bhaiti/.test(h)) return 'haiti';
  if (/\bcongo|\bdrc\b|goma/.test(h)) return 'drc';
  if (/\bnigeria/.test(h)) return 'nigeria';
  if (/\bethiopia/.test(h)) return 'ethiopia';
  if (/\bsomalia/.test(h)) return 'somalia';
  if (/\bvenezuela/.test(h)) return 'venezuela';
  return null;
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

    // Always populate DAILY_BRIEFING from Worker (articles are fresh even if events are stale)
    if (data.briefing && data.briefing.length > 0) {
      DAILY_BRIEFING.length = 0;
      DAILY_BRIEFING.push(...data.briefing.map(a => ({
        ...a,
        time: timeAgo(a.pubDate),
        headline: a.headline || a.title,
      })));
    }

    // If pre-generated events are >60min stale, rebuild from fresh DAILY_BRIEFING
    if (minutesAgo !== null && minutesAgo > 60 && DAILY_BRIEFING.length > 0) {
      console.warn(`[Hegemon] Pre-generated events ${minutesAgo}min stale — rebuilding from ${DAILY_BRIEFING.length} fresh articles`);
      const freshEvents = await clusterArticles(DAILY_BRIEFING);

      // Normalize: add pubDate from first article (client buildEvent omits it, Worker includes it)
      const fallbackDate = new Date().toISOString();
      DAILY_EVENTS.length = 0;
      for (const event of freshEvents) {
        // Find first valid pubDate from any article
        let bestPubDate = '';
        for (const a of (event.articles || [])) {
          if (a.pubDate && !isNaN(new Date(a.pubDate).getTime())) {
            bestPubDate = a.pubDate;
            break;
          }
        }
        const pubDate = event.pubDate || bestPubDate || fallbackDate;
        DAILY_EVENTS.push({
          ...event,
          pubDate,
          time: timeAgo(pubDate),
        });
      }
    } else {
      // Use pre-generated events directly
      DAILY_EVENTS.length = 0;
      for (const event of data.events) {
        const hl = event.headline || event.title || 'Breaking News';
        DAILY_EVENTS.push({
          ...event,
          headline: hl,
          _primaryCountry: event._primaryCountry || quickPrimaryCountry(hl),
          category: event.category || 'CONFLICT',
          time: event.time || timeAgo(event.pubDate),
          summaryLoading: false,
          summaryError: !event.summary,
          articles: (event.articles || []).map(a => ({
            ...a,
            time: timeAgo(a.pubDate),
          }))
        });
      }
    }

    // Store last updated timestamp for UI
    window._eventsLastUpdated = data.lastUpdated;

    notifyEventsUpdated();
    saveNewsToLocalStorage();

    // Trigger client-side summary fetching for events missing summaries
    const missingSummaries = DAILY_EVENTS.filter(e => !e.summary).length;
    if (missingSummaries > 0) {
      setTimeout(() => fetchEventSummaries(), 1500);
    }

    return true;
  } catch (err) {
    console.warn('[Hegemon] Pre-generated events fetch failed:', err.message);
    return false;
  }
}

// ============================================================
// Fetch Country Analyses — daily AI-generated situation reports
// ============================================================

async function fetchCountryAnalyses() {
  try {
    const cached = localStorage.getItem('country_analyses_cache');
    if (cached) {
      const { data, ts } = JSON.parse(cached);
      if (Date.now() - ts < 3 * 60 * 60 * 1000) { // 3h cache
        applyAnalyses(data);
        return;
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${RSS_PROXY_BASE}/analyses`, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) return;
    const result = await response.json();
    if (!result || !result.analyses) return;

    applyAnalyses(result.analyses);
    localStorage.setItem('country_analyses_cache', JSON.stringify({
      data: result.analyses,
      ts: Date.now()
    }));
  } catch (err) {
    console.warn('[Hegemon] Country analyses fetch failed:', err.message);
  }
}

function applyAnalyses(analyses) {
  for (const [countryName, analysis] of Object.entries(analyses)) {
    // Try exact match first, then case-insensitive
    let entry = COUNTRIES[countryName];
    if (!entry) {
      const key = Object.keys(COUNTRIES).find(k => k.toLowerCase() === countryName.toLowerCase());
      if (key) entry = COUNTRIES[key];
    }
    if (entry && analysis.what) {
      entry.analysis = {
        ...entry.analysis,
        what: analysis.what,
        why: analysis.why || entry.analysis?.why || '',
        next: analysis.next || entry.analysis?.next || ''
      };
    }
  }
}

// ============================================================
// Data Corrections Overlay — weekly audit corrections from KV
// ============================================================

async function fetchDataCorrections() {
  try {
    const cached = localStorage.getItem('data_corrections_cache');
    if (cached) {
      const { data, ts } = JSON.parse(cached);
      if (Date.now() - ts < 30 * 60 * 1000) {
        applyDataCorrections(data);
        return;
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${RSS_PROXY_BASE}/data-corrections`, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) return;
    const result = await response.json();
    if (!result || !result.corrections) return;

    applyDataCorrections(result.corrections);
    localStorage.setItem('data_corrections_cache', JSON.stringify({
      data: result.corrections,
      ts: Date.now()
    }));
  } catch (err) {
    console.warn('[Hegemon] Data corrections fetch failed:', err.message);
  }
}

function applyDataCorrections(corrections) {
  for (const c of Object.values(corrections)) {
    const entry = COUNTRIES[c.country];
    if (!entry) continue;

    if (c.field === 'leader') entry.leader = c.value;
    else if (c.field === 'risk') entry.risk = c.value;
    else if (c.field === 'pop') entry.pop = c.value;
    else if (c.field === 'gdp') entry.gdp = c.value;
    else if (c.field === 'casualties.total' && entry.casualties) entry.casualties.total = c.value;
    else if (c.field === 'casualties.label' && entry.casualties) entry.casualties.label = c.value;
  }
}

async function pushCountrySnapshot() {
  try {
    const lastPush = localStorage.getItem('country_snapshot_push_ts');
    if (lastPush && Date.now() - parseInt(lastPush) < 24 * 60 * 60 * 1000) return;

    const snapshot = {};
    for (const [name, c] of Object.entries(COUNTRIES)) {
      snapshot[name] = {
        leader: c.leader || '',
        risk: c.risk || '',
        pop: c.pop || '',
        gdp: c.gdp || '',
      };
      if (c.casualties) {
        snapshot[name].casualties = c.casualties.total || '';
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    await fetch(`${RSS_PROXY_BASE}/country-snapshot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ snapshot }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    localStorage.setItem('country_snapshot_push_ts', String(Date.now()));
  } catch (err) {
    console.warn('[Hegemon] Country snapshot push failed:', err.message);
  }
}

// ============================================================
// Fetch Live News — tries pre-generated first, falls back to RSS
// ============================================================

export async function fetchLiveNews({ onStatusUpdate, onComplete } = {}) {

  if (onStatusUpdate) onStatusUpdate('fetching');

  // Try pre-generated events first (instant — single GET call)
  const preGenerated = await fetchPreGeneratedEvents();
  if (preGenerated) {
    // Trigger side effects
    setTimeout(() => {
      saveBriefingSnapshot();
      seedPastBriefingIfEmpty();
    }, 50);
    setTimeout(() => updateDynamicRisks(DAILY_BRIEFING), 500);
    setTimeout(() => fetchCountryAnalyses(), 1000);
    setTimeout(() => fetchDataCorrections(), 1500);
    setTimeout(() => preComputeCountryNews(), 1800);
    setTimeout(() => fetchTimelineUpdates(), 2000);
    setTimeout(() => pushCountrySnapshot(), 3000);

    if (onStatusUpdate) onStatusUpdate('complete');
    if (onComplete) onComplete(DAILY_BRIEFING);
    return;
  }

  // Fall back to client-side RSS fetching (with circuit breaker)
  if (_rssFallbackInProgress) {
    console.warn('[Hegemon] RSS fallback already in progress, skipping');
    if (onStatusUpdate) onStatusUpdate('complete');
    return;
  }
  if (_rssFallbackAttempts >= MAX_RSS_FALLBACK_ATTEMPTS) {
    console.warn(`[Hegemon] RSS fallback disabled after ${MAX_RSS_FALLBACK_ATTEMPTS} failed attempts`);
    if (DAILY_BRIEFING.length === 0) {
      DAILY_BRIEFING.length = 0;
      DAILY_BRIEFING.push(...DAILY_BRIEFING_FALLBACK);
    }
    if (onStatusUpdate) onStatusUpdate('complete');
    if (onComplete) onComplete(DAILY_BRIEFING);
    return;
  }

  _rssFallbackInProgress = true;
  _rssFallbackAttempts++;
  console.warn(`[Hegemon] Falling back to client-side RSS fetching (attempt ${_rssFallbackAttempts}/${MAX_RSS_FALLBACK_ATTEMPTS})`);

  try {
    const feeds = RSS_FEEDS.daily;

    // Fetch RSS feeds in batches of 5 with 100ms gaps so main thread can breathe
    const BATCH = 5;
    const allArticles = [];

    for (let i = 0; i < feeds.length; i += BATCH) {
      const batch = feeds.slice(i, i + BATCH);
      const results = await Promise.allSettled(
        batch.map(feed => fetchRSS(feed.url, feed.source))
      );
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value && result.value.length > 0) {
          allArticles.push(...result.value);
        }
      }
      // Yield to browser between batches
      if (i + BATCH < feeds.length) await yieldToMain(100);
    }

    if (allArticles.length > 0) {
      allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

      await yieldToMain(1);

      // Filter: irrelevant, sports, domestic noise, non-English, geo score >= 1
      const relevantArticles = [];
      for (let i = 0; i < allArticles.length; i++) {
        const article = allArticles[i];
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
        if (SOURCE_BLOCKLIST.has(source.toLowerCase())) continue;
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

      await yieldToMain(1);

      // Build new briefing (300 cap)
      const newArticles = uniqueArticles.slice(0, 300).map(article => {
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

      // Balance western/non-western source ratio (geographic diversity)
      const balanced = balanceSourceOrigins(newArticles);

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

      // Batch remaining events 10 at a time
      const RENDER_BATCH = 10;
      for (let i = 4; i < events.length; i += RENDER_BATCH) {
        await yieldToMain(100);
        const batch = events.slice(i, i + RENDER_BATCH);
        DAILY_EVENTS.push(...batch);
        notifyEventsUpdated();
      }
      // Defer heavy side-effects so UI renders first
      setTimeout(() => {
        saveBriefingSnapshot();
        seedPastBriefingIfEmpty();
        saveNewsToLocalStorage();
      }, 50);

      // Dynamic risk analysis (chunked, non-blocking)
      setTimeout(() => updateDynamicRisks(DAILY_BRIEFING), 500);
      setTimeout(() => preComputeCountryNews(), 1500);

      // Fetch only truly uncached summaries AFTER events are displayed
      setTimeout(() => fetchEventSummaries(), 2000);

      _rssFallbackAttempts = 0; // Reset on success
      if (onStatusUpdate) onStatusUpdate('complete');
      if (onComplete) onComplete(DAILY_BRIEFING);
      return;
    }
  } catch (error) {
    console.warn('RSS feeds failed:', error.message);
  } finally {
    _rssFallbackInProgress = false;
  }

  // Fallback: try each backup API (with timeout to prevent hanging)
  const dailyApiOrder = ['gnews', 'newsdata', 'mediastack'];
  for (const apiName of dailyApiOrder) {
    try {
      const api = NEWS_APIS[apiName];
      if (!api || !api.key || !api.buildDailyUrl) continue;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const response = await fetch(api.buildDailyUrl(api.key), { signal: controller.signal });
      clearTimeout(timeout);
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
          setTimeout(() => fetchTimelineUpdates(), 3000);

          _rssFallbackAttempts = 0; // Reset on success
          if (onStatusUpdate) onStatusUpdate('complete');
          if (onComplete) onComplete(DAILY_BRIEFING);
          return;
        }
      }
    } catch (e) {
      console.warn(`${apiName} fallback failed:`, e.message);
    }
  }

  // All sources failed — page must still work
  console.error('[Hegemon] All news sources failed — using static fallback');
  if (DAILY_BRIEFING.length === 0) {
    DAILY_BRIEFING.length = 0;
    DAILY_BRIEFING.push(...DAILY_BRIEFING_FALLBACK);
  }

  if (onStatusUpdate) onStatusUpdate('complete');
  if (onComplete) onComplete(DAILY_BRIEFING);
}

// ============================================================
// AI Timeline Updates (via Cloudflare Worker → Claude API)
// ============================================================

const TIMELINE_AI_LS_KEY = 'hegemon_timeline_ai';
const TIMELINE_AI_TTL = 3 * 60 * 60 * 1000; // 3 hours

export const AI_TIMELINE_DATA = { iran: null, ukraine: null, sudan: null, pakafg: null };
export const AI_DEATH_TOLL_FLOORS = {};

export async function fetchTimelineUpdates() {
  // Check localStorage cache
  try {
    const raw = localStorage.getItem(TIMELINE_AI_LS_KEY);
    if (raw) {
      const cached = JSON.parse(raw);
      if (cached.ts && Date.now() - cached.ts < TIMELINE_AI_TTL && cached.data) {
        Object.assign(AI_TIMELINE_DATA, cached.data);
        if (cached.floors) Object.assign(AI_DEATH_TOLL_FLOORS, cached.floors);
        console.log('[Hegemon] Timeline AI data loaded from cache');
        notifyEventsUpdated();
        return cached.data;
      }
    }
  } catch { /* ignore cache errors */ }

  // Fetch from worker
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const response = await fetch(`${RSS_PROXY_BASE}/timeline-update`, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.warn('[Hegemon] Timeline update fetch failed:', response.status);
      return null;
    }

    const data = await response.json();
    if (data.error) {
      console.warn('[Hegemon] Timeline update error:', data.error);
      return null;
    }

    // Update module-level data
    if (data.iran) AI_TIMELINE_DATA.iran = data.iran;
    if (data.ukraine) AI_TIMELINE_DATA.ukraine = data.ukraine;
    if (data.sudan) AI_TIMELINE_DATA.sudan = data.sudan;
    if (data.pakafg) AI_TIMELINE_DATA.pakafg = data.pakafg;

    // Store server-side death toll floors (auto-updating, never decrease)
    if (data._floors) Object.assign(AI_DEATH_TOLL_FLOORS, data._floors);

    // Debug: log stats so we can verify key names
    for (const [key, val] of Object.entries(AI_TIMELINE_DATA)) {
      if (val?.stats && Object.keys(val.stats).length > 0) {
        console.log(`[Hegemon] AI stats for ${key}:`, JSON.stringify(val.stats));
      }
    }

    // Cache in localStorage
    try {
      localStorage.setItem(TIMELINE_AI_LS_KEY, JSON.stringify({
        ts: Date.now(),
        data: { iran: data.iran, ukraine: data.ukraine, sudan: data.sudan, pakafg: data.pakafg },
        floors: data._floors || {}
      }));
    } catch { /* storage full */ }

    console.log('[Hegemon] Timeline AI data updated', data.cached ? '(worker cache)' : '(fresh)');
    notifyEventsUpdated();
    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('[Hegemon] Timeline update timed out (20s)');
    } else {
      console.warn('[Hegemon] Timeline update fetch error:', err.message);
    }
    return null;
  }
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
  for (const event of DAILY_EVENTS) {
    const key = eventSummaryKey(event);
    if (key && cache[key]) {
      event.summary = cache[key].summary;
      event.summaryLoading = false;
    }
  }
}

const SUMMARY_TIMEOUT_MS = 10000; // 10-second timeout on /summarize
const SUMMARY_THROTTLE_MS = 30 * 60 * 1000; // Only request summaries from API once per 30 min
let _lastSummaryApiCall = 0;
const _summaryAttempted = new Set(); // Track event hashes already sent to API this session
const MAX_SESSION_SUMMARY_CALLS = 20; // Hard cap on API calls per session
let _sessionSummaryCalls = 0;

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
    } else if (key && !_summaryAttempted.has(key)) {
      // Only request if we haven't already tried this exact event hash
      event.summaryLoading = true;
      if (i < 4) uncachedTop.push(event);
      else uncachedRest.push(event);
    } else {
      event.summaryLoading = false;
    }
  }

  notifyEventsUpdated();

  if (uncachedTop.length === 0 && uncachedRest.length === 0) return;

  // Throttle: skip API calls if we called recently (cached summaries were still applied above)
  const now = Date.now();
  if (now - _lastSummaryApiCall < SUMMARY_THROTTLE_MS) return;
  if (_sessionSummaryCalls >= MAX_SESSION_SUMMARY_CALLS) return;
  _lastSummaryApiCall = now;

  // Helper: fetch a batch of summaries with 10s timeout
  async function fetchSummaryBatch(batch, batchNum) {
    // Mark all events in this batch as attempted (prevents re-requesting on next cycle)
    for (const event of batch) {
      const key = eventSummaryKey(event);
      if (key) _summaryAttempted.add(key);
    }
    _sessionSummaryCalls++;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SUMMARY_TIMEOUT_MS);
    try {
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
