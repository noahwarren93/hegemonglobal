// stocksService.js - Yahoo Finance via Cloudflare Worker, CoinGecko Bitcoin, caching

import { MARKET_CONFIG, STATIC_FALLBACK_DATA, MARKET_HOURS } from '../data/stocksData';

const WORKER_BASE = 'https://hegemon-rss-proxy.hegemonglobal.workers.dev';

// CORS proxies as last-resort fallback
const CORS_PROXIES = [
  (url) => 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url),
  (url) => 'https://corsproxy.io/?' + encodeURIComponent(url),
];

// ============================================================
// Fetch with Timeout
// ============================================================

function fetchWithTimeout(url, timeout) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout')), timeout);
    fetch(url)
      .then(r => { clearTimeout(timer); resolve(r); })
      .catch(e => { clearTimeout(timer); reject(e); });
  });
}

// ============================================================
// Format Stock Price
// ============================================================

export function formatStockPrice(val, decimals = 2) {
  if (val === undefined || val === null || isNaN(val)) return 'N/A';
  return val.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

// ============================================================
// Get All Symbols
// ============================================================

function getAllSymbols() {
  const syms = [];
  MARKET_CONFIG.forEach(m => {
    m.symbols.forEach(s => syms.push(s.sym));
  });
  return syms;
}

// ============================================================
// Market Status (open/closed based on trading hours)
// ============================================================

export function getMarketStatus(country) {
  const hours = MARKET_HOURS[country];
  if (!hours) return { isOpen: false, label: 'Closed' };

  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: hours.tz,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  const parts = formatter.formatToParts(now);
  const weekday = parts.find(p => p.type === 'weekday')?.value;
  const h = parseInt(parts.find(p => p.type === 'hour')?.value, 10);
  const m = parseInt(parts.find(p => p.type === 'minute')?.value, 10);

  if (weekday === 'Sat' || weekday === 'Sun') return { isOpen: false, label: 'Weekend' };

  const current = h * 60 + m;
  const [oH, oM] = hours.open.split(':').map(Number);
  const [cH, cM] = hours.close.split(':').map(Number);

  if (current >= oH * 60 + oM && current < cH * 60 + cM) {
    return { isOpen: true, label: 'Open' };
  }
  return { isOpen: false, label: 'Closed' };
}

// ============================================================
// CoinGecko Bitcoin Fetch (direct, no proxy)
// ============================================================

function fetchBitcoinFromCoinGecko() {
  return fetchWithTimeout('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true', 10000)
    .then(resp => {
      if (!resp.ok) throw new Error('CoinGecko HTTP ' + resp.status);
      return resp.json();
    })
    .then(data => {
      if (!data || !data.bitcoin || !data.bitcoin.usd) return null;
      return {
        symbol: 'BTC-USD',
        price: data.bitcoin.usd,
        changePct: data.bitcoin.usd_24h_change || 0,
        sparkline: STATIC_FALLBACK_DATA['BTC-USD']?.sparkline || [data.bitcoin.usd, data.bitcoin.usd]
      };
    })
    .catch(err => {
      console.warn('CoinGecko fetch failed:', err.message);
      return null;
    });
}

// ============================================================
// Fetch via Cloudflare Worker (primary — avoids CORS)
// ============================================================

async function fetchViaWorker() {
  const allSyms = getAllSymbols();
  const resp = await fetchWithTimeout(
    `${WORKER_BASE}/stock?symbols=${encodeURIComponent(allSyms.join(','))}`,
    15000
  );
  if (!resp.ok) throw new Error('Worker HTTP ' + resp.status);
  const data = await resp.json();
  if (!data.quotes) throw new Error('No quotes in response');

  const quotes = {};
  Object.entries(data.quotes).forEach(([sym, q]) => {
    quotes[sym] = {
      symbol: q.symbol || sym,
      price: q.price,
      changePct: q.changePct,
      sparkline: q.sparkline || [q.prevClose || q.price, q.price]
    };
  });
  return quotes;
}

// ============================================================
// CORS Proxy Fallback (individual v8 chart requests)
// ============================================================

function fetchViaCorsProxies() {
  const allSyms = getAllSymbols();
  return Promise.all(allSyms.map(sym => {
    const chartUrl = 'https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(sym) + '?range=5d&interval=1d&includePrePost=false';

    function tryProxy(idx) {
      if (idx >= CORS_PROXIES.length) return Promise.resolve(null);
      const proxyUrl = CORS_PROXIES[idx](chartUrl);
      return fetchWithTimeout(proxyUrl, 12000)
        .then(resp => { if (!resp.ok) throw new Error('HTTP ' + resp.status); return resp.json(); })
        .then(data => {
          const r = data?.chart?.result?.[0];
          if (!r) return null;
          const meta = r.meta;
          const price = meta.regularMarketPrice;
          const prevClose = meta.chartPreviousClose || meta.previousClose;
          if (!price) return null;
          let closes = [];
          if (r.indicators?.quote?.[0]?.close) {
            closes = r.indicators.quote[0].close.filter(v => v != null);
          }
          return {
            symbol: meta.symbol || sym,
            price,
            changePct: prevClose ? ((price - prevClose) / prevClose) * 100 : 0,
            sparkline: closes.length > 1 ? closes : [prevClose || price, price]
          };
        })
        .catch(() => tryProxy(idx + 1));
    }

    return tryProxy(0);
  })).then(results => {
    const quotes = {};
    results.forEach(r => { if (r) quotes[r.symbol] = r; });
    if (Object.keys(quotes).length === 0) throw new Error('No quotes from CORS proxies');
    return quotes;
  });
}

// ============================================================
// Search Ticker via Worker
// ============================================================

export async function searchTicker(ticker) {
  const sym = ticker.toUpperCase();
  try {
    const resp = await fetchWithTimeout(
      `${WORKER_BASE}/stock?symbols=${encodeURIComponent(sym)}`,
      10000
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    const q = data.quotes?.[sym];
    if (!q || !q.price) return null;

    const positive = q.changePct >= 0;
    let sparkline = [q.prevClose || q.price, q.price];
    if (q.sparkline && q.sparkline.length > 1) {
      const raw = q.sparkline;
      sparkline = [];
      for (let i = 0; i < 12; i++) {
        const idx = Math.floor(i * (raw.length - 1) / 11);
        sparkline.push(raw[idx]);
      }
    }

    return {
      symbol: q.symbol || sym,
      name: q.shortName || q.longName || '',
      price: formatStockPrice(q.price),
      change: (positive ? '+' : '') + q.changePct.toFixed(2) + '%',
      positive,
      sparkline
    };
  } catch {
    return null;
  }
}

// ============================================================
// Main Fetch: Worker first, CORS proxy fallback
// ============================================================

export function fetchStockQuotes() {
  return fetchViaWorker()
    .catch(err => {
      console.warn('Worker fetch failed:', err.message, '- trying CORS proxies');
      return fetchViaCorsProxies();
    });
}

// ============================================================
// Cache Utilities (localStorage with TTL)
// ============================================================

function cacheSet(key, data, ttlMs) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now(), ttl: ttlMs }));
  } catch (e) {
    console.warn('localStorage write failed:', e.message);
  }
}

function cacheGet(key) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    const c = JSON.parse(item);
    if (Date.now() - c.ts > c.ttl) {
      localStorage.removeItem(key);
      return null;
    }
    return c;
  } catch {
    return null;
  }
}

// ============================================================
// Build STOCKS_DATA from quotes
// ============================================================

function buildStocksData(quotes, isStaticFallback) {
  const data = [];
  MARKET_CONFIG.forEach(market => {
    let hasAnyData = false;
    const indices = market.symbols.map(s => {
      const q = quotes[s.sym];
      if (!q) {
        const staticData = STATIC_FALLBACK_DATA[s.sym];
        if (staticData) {
          hasAnyData = true;
          const pre = s.pre || '';
          const positive = staticData.changePct >= 0;
          return {
            name: s.name,
            value: pre + formatStockPrice(staticData.price),
            change: (positive ? '+' : '') + staticData.changePct.toFixed(2) + '%',
            changeAbs: (positive ? '+' : '-') + pre + formatStockPrice(Math.abs(staticData.price * staticData.changePct / 100)),
            positive,
            noData: false
          };
        }
        return { name: s.name, value: '\u2014', change: '\u2014', changeAbs: '\u2014', positive: true, noData: true };
      }
      hasAnyData = true;
      const pre = s.pre || '';
      const positive = q.changePct >= 0;
      return {
        name: s.name,
        value: pre + formatStockPrice(q.price),
        change: (positive ? '+' : '') + q.changePct.toFixed(2) + '%',
        changeAbs: (positive ? '+' : '-') + pre + formatStockPrice(Math.abs(q.price * q.changePct / 100)),
        positive,
        noData: false
      };
    });

    // Sparkline from first symbol
    const mainQuote = quotes[market.symbols[0].sym];
    let sparkline = [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50];
    let mainChangePct = 0;

    if (mainQuote && mainQuote.sparkline && mainQuote.sparkline.length > 1) {
      const raw = mainQuote.sparkline;
      sparkline = [];
      for (let i = 0; i < 12; i++) {
        const idx = Math.floor(i * (raw.length - 1) / 11);
        sparkline.push(raw[idx]);
      }
      mainChangePct = mainQuote.changePct;
    } else if (STATIC_FALLBACK_DATA[market.symbols[0].sym]) {
      const staticMain = STATIC_FALLBACK_DATA[market.symbols[0].sym];
      sparkline = staticMain.sparkline.slice();
      mainChangePct = staticMain.changePct;
    }

    // Sentiment
    let sentiment = 'Market data unavailable';
    if (mainQuote || isStaticFallback) {
      const dir = mainChangePct >= 0 ? 'up' : 'down';
      const mag = Math.abs(mainChangePct);
      if (mag < 0.2) sentiment = 'Markets mostly flat today';
      else if (mag < 1) sentiment = 'Markets ' + dir + ' ' + mag.toFixed(1) + '% today';
      else sentiment = 'Markets ' + dir + ' ' + mag.toFixed(1) + '% \u2014 ' + (mainChangePct >= 0 ? 'broad gains' : 'selling pressure');
    }

    data.push({
      country: market.country,
      flag: market.flag,
      indices,
      sentiment,
      sparkline,
      hasData: hasAnyData,
      isStaticFallback: isStaticFallback && !mainQuote
    });
  });
  return data;
}

// ============================================================
// Main Load Function
// ============================================================

let fetchInProgress = false;

export async function loadStockData(onUpdate) {
  // Show cached data immediately
  const cached = cacheGet('hegemon_stocks_cache');
  if (cached) {
    onUpdate({ data: cached.data, lastUpdated: new Date(cached.ts), error: false, isUpdating: true });
  }

  // Prevent concurrent fetches
  if (fetchInProgress) return;
  fetchInProgress = true;

  try {
    const [quotes, btcData] = await Promise.all([
      fetchStockQuotes().catch(() => ({})),
      fetchBitcoinFromCoinGecko().catch(() => null)
    ]);

    if (btcData) quotes['BTC-USD'] = btcData;

    const count = Object.keys(quotes).length;

    if (count > 0) {
      const stocksData = buildStocksData(quotes, false);
      cacheSet('hegemon_stocks_cache', stocksData, 900000); // 15 min
      fetchInProgress = false;
      if (onUpdate) onUpdate({ data: stocksData, lastUpdated: new Date(), error: false, isUpdating: false });
    } else {
      console.warn('All API requests failed, using static fallback');
      const staticQuotes = {};
      Object.keys(STATIC_FALLBACK_DATA).forEach(sym => { staticQuotes[sym] = STATIC_FALLBACK_DATA[sym]; });
      const stocksData = buildStocksData(staticQuotes, true);
      cacheSet('hegemon_stocks_cache', stocksData, 3600000); // 1 hour
      fetchInProgress = false;
      if (onUpdate) onUpdate({ data: stocksData, lastUpdated: new Date(), error: true, isUpdating: false });
    }
  } catch (err) {
    console.error('Stock data fetch failed:', err);
    const staticQuotes = {};
    Object.keys(STATIC_FALLBACK_DATA).forEach(sym => { staticQuotes[sym] = STATIC_FALLBACK_DATA[sym]; });
    const stocksData = buildStocksData(staticQuotes, true);
    cacheSet('hegemon_stocks_cache', stocksData, 3600000);
    fetchInProgress = false;
    if (onUpdate) onUpdate({ data: stocksData, lastUpdated: new Date(), error: true, isUpdating: false });
  }
}
