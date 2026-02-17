// stocksService.js - Yahoo Finance API, CoinGecko Bitcoin, CORS proxies, caching

import { MARKET_CONFIG, STATIC_FALLBACK_DATA } from '../data/stocksData';

// ============================================================
// CORS Proxy Fallback Chain
// ============================================================

const CORS_PROXIES = [
  (url) => 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url),
  (url) => 'https://corsproxy.io/?' + encodeURIComponent(url),
  (url) => 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(url),
  (url) => 'https://thingproxy.freeboard.io/fetch/' + encodeURIComponent(url),
  (url) => 'https://cors.bridged.cc/' + encodeURIComponent(url)
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
        sparkline: STATIC_FALLBACK_DATA['BTC-USD'].sparkline
      };
    })
    .catch(err => {
      console.warn('CoinGecko fetch failed:', err.message);
      return null;
    });
}

// ============================================================
// Yahoo Finance V7 Batch Endpoint
// ============================================================

function fetchYahooFinanceBatch(proxyIdx = 0) {
  if (proxyIdx >= CORS_PROXIES.length) return Promise.reject(new Error('All proxies failed'));

  const allSyms = getAllSymbols();
  const symbolsStr = allSyms.join(',');
  const url = 'https://query1.finance.yahoo.com/v7/finance/quote?symbols=' + encodeURIComponent(symbolsStr);
  const proxyUrl = CORS_PROXIES[proxyIdx](url);

  return fetchWithTimeout(proxyUrl, 12000)
    .then(resp => {
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      return resp.json();
    })
    .then(data => {
      if (!data || !data.quoteResponse || !data.quoteResponse.result) {
        throw new Error('Invalid response structure');
      }
      const quotes = {};
      data.quoteResponse.result.forEach(item => {
        if (item.symbol && item.regularMarketPrice !== undefined && item.regularMarketChangePercent !== undefined) {
          quotes[item.symbol] = {
            symbol: item.symbol,
            price: item.regularMarketPrice,
            changePct: item.regularMarketChangePercent,
            sparkline: STATIC_FALLBACK_DATA[item.symbol] ? STATIC_FALLBACK_DATA[item.symbol].sparkline : [item.regularMarketPrice, item.regularMarketPrice]
          };
        }
      });
      if (Object.keys(quotes).length === 0) throw new Error('No valid quotes in response');
      return quotes;
    })
    .catch(err => {
      if (proxyIdx < CORS_PROXIES.length - 1) {
        return fetchYahooFinanceBatch(proxyIdx + 1);
      }
      return Promise.reject(err);
    });
}

// ============================================================
// Yahoo Finance V8 Individual Fallback
// ============================================================

function fetchYahooFinanceIndividual(sym, proxyIdx = 0) {
  if (proxyIdx >= CORS_PROXIES.length) return Promise.reject(new Error('All proxies failed'));

  const url = 'https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(sym) + '?range=1d&interval=15m&includePrePost=false';
  const proxyUrl = CORS_PROXIES[proxyIdx](url);

  return fetchWithTimeout(proxyUrl, 12000)
    .then(resp => {
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      return resp.json();
    })
    .then(data => {
      if (!data || !data.chart || !data.chart.result || !data.chart.result[0]) {
        throw new Error('Invalid chart response');
      }
      const result = data.chart.result[0];
      const meta = result.meta;
      const price = meta.regularMarketPrice;
      const prevClose = meta.chartPreviousClose || meta.previousClose;

      if (!price || !prevClose) throw new Error('No price data');

      const changePct = ((price - prevClose) / prevClose) * 100;
      let closes = [];
      if (result.indicators && result.indicators.quote && result.indicators.quote[0]) {
        const rawCloses = result.indicators.quote[0].close || [];
        closes = rawCloses.filter(v => v !== null && v !== undefined);
      }

      return {
        symbol: meta.symbol || sym,
        price,
        changePct,
        sparkline: closes.length > 1 ? closes : [prevClose, price]
      };
    })
    .catch(err => {
      if (proxyIdx < CORS_PROXIES.length - 1) {
        return fetchYahooFinanceIndividual(sym, proxyIdx + 1);
      }
      return Promise.reject(err);
    });
}

// ============================================================
// Main Fetch: batch first, then individual fallback
// ============================================================

export function fetchStockQuotes() {
  return fetchYahooFinanceBatch()
    .then(quotes => quotes)
    .catch(batchErr => {
      console.warn('Batch fetch failed, falling back to individual requests:', batchErr.message);
      const allSyms = getAllSymbols();
      const promises = allSyms.map(sym => fetchYahooFinanceIndividual(sym).catch(() => null));
      return Promise.all(promises).then(results => {
        const quotes = {};
        results.forEach(r => { if (r) quotes[r.symbol] = r; });
        if (Object.keys(quotes).length === 0) {
          throw new Error('Both batch and individual fetches failed');
        }
        return quotes;
      });
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
    return c.data;
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
            noData: false,
            isStatic: true
          };
        }
        return { name: s.name, value: '\u2014', change: '\u2014', changeAbs: '\u2014', positive: true, noData: true, isStatic: false };
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
        noData: false,
        isStatic: false
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
// Main Load Function (returns stocksData via callback)
// ============================================================

let fetchInProgress = false;

export async function loadStockData(onUpdate) {
  if (fetchInProgress) return;
  fetchInProgress = true;

  // Check localStorage cache first
  const cached = cacheGet('hegemon_stocks_cache');
  if (cached) {
    fetchInProgress = false;
    if (onUpdate) onUpdate({ data: cached, lastUpdated: new Date(), error: false });
    return;
  }

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
      if (onUpdate) onUpdate({ data: stocksData, lastUpdated: new Date(), error: false });
    } else {
      // All APIs failed - use static fallback
      console.warn('All API requests failed, using static fallback');
      const staticQuotes = {};
      Object.keys(STATIC_FALLBACK_DATA).forEach(sym => { staticQuotes[sym] = STATIC_FALLBACK_DATA[sym]; });
      const stocksData = buildStocksData(staticQuotes, true);
      cacheSet('hegemon_stocks_cache', stocksData, 3600000); // 1 hour
      fetchInProgress = false;
      if (onUpdate) onUpdate({ data: stocksData, lastUpdated: new Date(), error: true });
    }
  } catch (err) {
    console.error('Stock data fetch failed:', err);
    const staticQuotes = {};
    Object.keys(STATIC_FALLBACK_DATA).forEach(sym => { staticQuotes[sym] = STATIC_FALLBACK_DATA[sym]; });
    const stocksData = buildStocksData(staticQuotes, true);
    cacheSet('hegemon_stocks_cache', stocksData, 3600000);
    fetchInProgress = false;
    if (onUpdate) onUpdate({ data: stocksData, lastUpdated: new Date(), error: true });
  }
}
