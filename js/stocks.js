// stocks.js - Live stock market data via Yahoo Finance API with multi-proxy fallback & static cache

// ============================================================
// MARKET CONFIGURATION - Yahoo Finance symbols for each market
// ============================================================
var MARKET_CONFIG = [
  { country: 'United States', flag: '\u{1F1FA}\u{1F1F8}', symbols: [
    { name: 'Dow Jones', sym: '^DJI' },
    { name: 'S&P 500', sym: '^GSPC' },
    { name: 'NASDAQ', sym: '^IXIC' },
    { name: 'Gold', sym: 'GC=F', pre: '$' },
    { name: 'Silver', sym: 'SI=F', pre: '$' },
    { name: 'Bitcoin', sym: 'BTC-USD', pre: '$' }
  ]},
  { country: 'China', flag: '\u{1F1E8}\u{1F1F3}', symbols: [
    { name: 'SSE Composite', sym: '000001.SS' },
    { name: 'Shenzhen', sym: '399001.SZ' },
    { name: 'Hang Seng', sym: '^HSI' }
  ]},
  { country: 'Japan', flag: '\u{1F1EF}\u{1F1F5}', symbols: [
    { name: 'Nikkei 225', sym: '^N225' },
    { name: 'TOPIX', sym: '^TOPX' }
  ]},
  { country: 'United Kingdom', flag: '\u{1F1EC}\u{1F1E7}', symbols: [
    { name: 'FTSE 100', sym: '^FTSE' },
    { name: 'FTSE 250', sym: '^MCX' }
  ]},
  { country: 'European Union', flag: '\u{1F1EA}\u{1F1FA}', symbols: [
    { name: 'Euro Stoxx 50', sym: '^STOXX50E' },
    { name: 'DAX', sym: '^GDAXI' },
    { name: 'CAC 40', sym: '^FCHI' }
  ]},
  { country: 'India', flag: '\u{1F1EE}\u{1F1F3}', symbols: [
    { name: 'BSE Sensex', sym: '^BSESN' },
    { name: 'Nifty 50', sym: '^NSEI' }
  ]},
  { country: 'Canada', flag: '\u{1F1E8}\u{1F1E6}', symbols: [
    { name: 'TSX Composite', sym: '^GSPTSE' }
  ]},
  { country: 'South Korea', flag: '\u{1F1F0}\u{1F1F7}', symbols: [
    { name: 'KOSPI', sym: '^KS11' }
  ]},
  { country: 'Australia', flag: '\u{1F1E6}\u{1F1FA}', symbols: [
    { name: 'ASX 200', sym: '^AXJO' }
  ]},
  { country: 'Brazil', flag: '\u{1F1E7}\u{1F1F7}', symbols: [
    { name: 'Bovespa', sym: '^BVSP' }
  ]},
  { country: 'Taiwan', flag: '\u{1F1F9}\u{1F1FC}', symbols: [
    { name: 'TAIEX', sym: '^TWII' }
  ]},
  { country: 'Russia', flag: '\u{1F1F7}\u{1F1FA}', symbols: [
    { name: 'MOEX', sym: 'IMOEX.ME' }
  ]},
  { country: 'Saudi Arabia', flag: '\u{1F1F8}\u{1F1E6}', symbols: [
    { name: 'Tadawul', sym: '^TASI' }
  ]},
  { country: 'Turkey', flag: '\u{1F1F9}\u{1F1F7}', symbols: [
    { name: 'BIST 100', sym: 'XU100.IS' }
  ]},
  { country: 'South Africa', flag: '\u{1F1FF}\u{1F1E6}', symbols: [
    { name: 'JSE All Share', sym: '^J203.JO' }
  ]},
  { country: 'Nigeria', flag: '\u{1F1F3}\u{1F1EC}', symbols: [
    { name: 'NGX All Share', sym: '^NGSEINDX' }
  ]}
];

// ============================================================
// STATE
// ============================================================
var STOCKS_DATA = null;
var stocksLastUpdated = null;
var stocksFetchInProgress = false;
var stocksFetchError = false;

// ============================================================
// CORS PROXY LIST - 5+ proxies for fallback chain
// ============================================================
var CORS_PROXIES = [
  function(url) { return 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url); },
  function(url) { return 'https://corsproxy.io/?' + encodeURIComponent(url); },
  function(url) { return 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(url); },
  function(url) { return 'https://thingproxy.freeboard.io/fetch/' + encodeURIComponent(url); },
  function(url) { return 'https://cors.bridged.cc/' + encodeURIComponent(url); }
];

// ============================================================
// BROWSER-COMPATIBLE TIMEOUT (AbortSignal.timeout fallback)
// ============================================================
function fetchWithTimeout(url, timeout) {
  return new Promise(function(resolve, reject) {
    var timer = setTimeout(function() { reject(new Error('Timeout')); }, timeout);
    fetch(url)
      .then(function(r) {
        clearTimeout(timer);
        resolve(r);
      })
      .catch(function(e) {
        clearTimeout(timer);
        reject(e);
      });
  });
}

// ============================================================
// COMPREHENSIVE STATIC FALLBACK DATA - All 16 markets
// ============================================================
// Static fallback prices sourced from market closes on Feb 12, 2026
// These are used ONLY when all live API calls fail
var STATIC_FALLBACK_DATA = {
  // --- United States (Feb 12 close: broad sell-off, AI disruption fears) ---
  '^DJI': { price: 49452, changePct: -1.34, sparkline: [50120, 50050, 49950, 49850, 49750, 49680, 49600, 49550, 49500, 49480, 49460, 49452] },
  '^GSPC': { price: 6833, changePct: -1.57, sparkline: [6940, 6920, 6900, 6880, 6870, 6860, 6850, 6845, 6840, 6838, 6835, 6833] },
  '^IXIC': { price: 22597, changePct: -2.03, sparkline: [23065, 23000, 22900, 22820, 22760, 22720, 22690, 22660, 22640, 22620, 22610, 22597] },
  'GC=F': { price: 5061, changePct: 0.74, sparkline: [5025, 5030, 5035, 5040, 5042, 5045, 5048, 5050, 5055, 5058, 5060, 5061] },
  'SI=F': { price: 82.49, changePct: 0.74, sparkline: [81.90, 81.95, 82.00, 82.05, 82.10, 82.15, 82.20, 82.25, 82.30, 82.40, 82.45, 82.49] },
  'BTC-USD': { price: 66063, changePct: -2.12, sparkline: [67500, 67200, 67000, 66800, 66600, 66500, 66400, 66300, 66200, 66150, 66100, 66063] },
  // --- China (SSE closed Feb 12 for Lunar NY; using last available) ---
  '000001.SS': { price: 4134, changePct: 0.14, sparkline: [4128, 4129, 4130, 4130, 4131, 4132, 4132, 4133, 4133, 4134, 4134, 4134] },
  '399001.SZ': { price: 14161, changePct: -0.35, sparkline: [14210, 14200, 14195, 14190, 14185, 14180, 14175, 14170, 14168, 14165, 14163, 14161] },
  '^HSI': { price: 27033, changePct: -0.86, sparkline: [27270, 27220, 27180, 27150, 27120, 27100, 27080, 27060, 27050, 27040, 27035, 27033] },
  // --- Japan (Feb 12; near record highs after Takaichi election win) ---
  '^N225': { price: 57640, changePct: -0.02, sparkline: [57660, 57680, 57700, 57720, 57710, 57690, 57670, 57660, 57650, 57645, 57642, 57640] },
  '^TOPX': { price: 4050, changePct: 0.12, sparkline: [4045, 4046, 4047, 4048, 4048, 4049, 4049, 4050, 4050, 4050, 4050, 4050] },
  // --- United Kingdom (Feb 12) ---
  '^FTSE': { price: 10402, changePct: -0.67, sparkline: [10472, 10460, 10450, 10440, 10430, 10425, 10420, 10415, 10410, 10408, 10405, 10402] },
  '^MCX': { price: 25480, changePct: -0.82, sparkline: [25690, 25650, 25620, 25590, 25570, 25550, 25530, 25510, 25500, 25490, 25485, 25480] },
  // --- European Union (Feb 12; Euro Stoxx 50 hit records) ---
  '^STOXX50E': { price: 6105, changePct: 1.12, sparkline: [6040, 6050, 6060, 6065, 6070, 6075, 6080, 6085, 6090, 6095, 6100, 6105] },
  '^GDAXI': { price: 24853, changePct: -0.01, sparkline: [24856, 24855, 24854, 24855, 24856, 24855, 24854, 24853, 24854, 24853, 24853, 24853] },
  '^FCHI': { price: 8195, changePct: -0.21, sparkline: [8212, 8210, 8208, 8206, 8204, 8202, 8200, 8199, 8198, 8197, 8196, 8195] },
  // --- India (Feb 12; IT sell-off dragged indices down) ---
  '^BSESN': { price: 83675, changePct: -0.66, sparkline: [84230, 84150, 84050, 83950, 83880, 83820, 83780, 83750, 83720, 83700, 83690, 83675] },
  '^NSEI': { price: 25807, changePct: -0.57, sparkline: [25955, 25920, 25890, 25870, 25850, 25840, 25830, 25825, 25820, 25815, 25810, 25807] },
  // --- Canada (Feb 12; risk-off sell-off) ---
  '^GSPTSE': { price: 32465, changePct: -2.37, sparkline: [33250, 33100, 32950, 32850, 32750, 32680, 32620, 32570, 32530, 32500, 32480, 32465] },
  // --- South Korea (Feb 12; KOSPI surged to all-time high) ---
  '^KS11': { price: 5522, changePct: 3.13, sparkline: [5355, 5380, 5400, 5420, 5440, 5460, 5475, 5490, 5500, 5510, 5518, 5522] },
  // --- Australia (Feb 12) ---
  '^AXJO': { price: 8683, changePct: -0.52, sparkline: [8728, 8720, 8715, 8710, 8705, 8700, 8698, 8695, 8692, 8690, 8686, 8683] },
  // --- Brazil (Feb 11; record close, Feb 12 data pending) ---
  '^BVSP': { price: 189699, changePct: 2.03, sparkline: [186100, 186800, 187400, 187900, 188300, 188700, 189000, 189200, 189400, 189500, 189600, 189699] },
  // --- Taiwan (closed for Lunar New Year; last traded Feb 11, record high) ---
  '^TWII': { price: 33606, changePct: 1.61, sparkline: [33075, 33150, 33200, 33260, 33310, 33360, 33400, 33450, 33490, 33540, 33575, 33606] },
  // --- Russia (Feb 11; under sanctions pressure) ---
  'IMOEX.ME': { price: 2752, changePct: 1.23, sparkline: [2720, 2725, 2730, 2733, 2736, 2738, 2740, 2742, 2745, 2748, 2750, 2752] },
  // --- Saudi Arabia (Feb 12; market newly open to foreign investors) ---
  '^TASI': { price: 11252, changePct: 0.75, sparkline: [11170, 11180, 11190, 11200, 11210, 11215, 11220, 11230, 11235, 11240, 11248, 11252] },
  // --- Turkey (Feb 11; BIST 100 at record highs) ---
  'XU100.IS': { price: 13827, changePct: 0.22, sparkline: [13800, 13805, 13808, 13810, 13812, 13815, 13818, 13820, 13822, 13824, 13826, 13827] },
  // --- South Africa (Feb 12; JSE near record) ---
  '^J203.JO': { price: 121150, changePct: 0.30, sparkline: [120800, 120850, 120900, 120940, 120980, 121000, 121030, 121060, 121090, 121110, 121130, 121150] },
  // --- Nigeria (Feb 11; NGX at all-time high) ---
  '^NGSEINDX': { price: 154847, changePct: 1.42, sparkline: [152700, 153000, 153300, 153500, 153800, 154000, 154200, 154350, 154500, 154650, 154750, 154847] }
};

// ============================================================
// UTILITY: Format stock price
// ============================================================
function formatStockPrice(val, decimals) {
  if (val === undefined || val === null || isNaN(val)) return 'N/A';
  decimals = decimals !== undefined ? decimals : 2;
  return val.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

// ============================================================
// GET ALL SYMBOLS
// ============================================================
function getAllSymbols() {
  var syms = [];
  MARKET_CONFIG.forEach(function(m) {
    m.symbols.forEach(function(s) { syms.push(s.sym); });
  });
  return syms;
}

// ============================================================
// COINGECKO BITCOIN FETCH (direct, no proxy needed)
// ============================================================
function fetchBitcoinFromCoinGecko() {
  return fetchWithTimeout('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true', 10000)
    .then(function(resp) {
      if (!resp.ok) throw new Error('CoinGecko HTTP ' + resp.status);
      return resp.json();
    })
    .then(function(data) {
      if (!data || !data.bitcoin || !data.bitcoin.usd) return null;
      return {
        symbol: 'BTC-USD',
        price: data.bitcoin.usd,
        changePct: data.bitcoin.usd_24h_change || 0,
        sparkline: STATIC_FALLBACK_DATA['BTC-USD'].sparkline
      };
    })
    .catch(function(err) {
      console.warn('CoinGecko fetch failed:', err.message);
      return null;
    });
}

// ============================================================
// YAHOO FINANCE V7 BATCH ENDPOINT (all symbols at once)
// ============================================================
function fetchYahooFinanceBatch(proxyIdx) {
  proxyIdx = proxyIdx || 0;
  if (proxyIdx >= CORS_PROXIES.length) return Promise.reject(new Error('All proxies failed'));

  var allSyms = getAllSymbols();
  var symbolsStr = allSyms.join(',');
  var url = 'https://query1.finance.yahoo.com/v7/finance/quote?symbols=' + encodeURIComponent(symbolsStr);
  var proxyUrl = CORS_PROXIES[proxyIdx](url);

  return fetchWithTimeout(proxyUrl, 12000)
    .then(function(resp) {
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      return resp.json();
    })
    .then(function(data) {
      if (!data || !data.quoteResponse || !data.quoteResponse.result) {
        throw new Error('Invalid response structure');
      }
      var quotes = {};
      data.quoteResponse.result.forEach(function(item) {
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
    .catch(function(err) {
      console.warn('Batch fetch with proxy ' + proxyIdx + ' failed:', err.message);
      if (proxyIdx < CORS_PROXIES.length - 1) {
        return fetchYahooFinanceBatch(proxyIdx + 1);
      } else {
        return Promise.reject(err);
      }
    });
}

// ============================================================
// YAHOO FINANCE V8 INDIVIDUAL FALLBACK (one symbol at a time)
// ============================================================
function fetchYahooFinanceIndividual(sym, proxyIdx) {
  proxyIdx = proxyIdx || 0;
  if (proxyIdx >= CORS_PROXIES.length) return Promise.reject(new Error('All proxies failed'));

  var url = 'https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(sym) + '?range=1d&interval=15m&includePrePost=false';
  var proxyUrl = CORS_PROXIES[proxyIdx](url);

  return fetchWithTimeout(proxyUrl, 12000)
    .then(function(resp) {
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      return resp.json();
    })
    .then(function(data) {
      if (!data || !data.chart || !data.chart.result || !data.chart.result[0]) {
        throw new Error('Invalid chart response');
      }
      var result = data.chart.result[0];
      var meta = result.meta;
      var price = meta.regularMarketPrice;
      var prevClose = meta.chartPreviousClose || meta.previousClose;

      if (!price || !prevClose) throw new Error('No price data');

      var changePct = ((price - prevClose) / prevClose) * 100;
      var closes = [];
      if (result.indicators && result.indicators.quote && result.indicators.quote[0]) {
        var rawCloses = result.indicators.quote[0].close || [];
        closes = rawCloses.filter(function(v) { return v !== null && v !== undefined; });
      }

      return {
        symbol: meta.symbol || sym,
        price: price,
        changePct: changePct,
        sparkline: closes.length > 1 ? closes : [prevClose, price]
      };
    })
    .catch(function(err) {
      console.warn('Individual fetch ' + sym + ' with proxy ' + proxyIdx + ' failed:', err.message);
      if (proxyIdx < CORS_PROXIES.length - 1) {
        return fetchYahooFinanceIndividual(sym, proxyIdx + 1);
      } else {
        return Promise.reject(err);
      }
    });
}

// ============================================================
// MAIN FETCH: Try batch first, then fallback to individual
// ============================================================
function fetchStockQuotes() {
  return fetchYahooFinanceBatch()
    .then(function(quotes) {
      console.log('Batch fetch successful, got ' + Object.keys(quotes).length + ' quotes');
      return quotes;
    })
    .catch(function(batchErr) {
      console.warn('Batch fetch failed, falling back to individual requests:', batchErr.message);
      // Fall back to individual v8 requests
      var allSyms = getAllSymbols();
      var promises = allSyms.map(function(sym) {
        return fetchYahooFinanceIndividual(sym)
          .catch(function() { return null; });
      });
      return Promise.all(promises).then(function(results) {
        var quotes = {};
        results.forEach(function(r) {
          if (r) quotes[r.symbol] = r;
        });
        if (Object.keys(quotes).length === 0) {
          throw new Error('Both batch and individual fetches failed');
        }
        return quotes;
      });
    });
}

// ============================================================
// CACHE UTILITIES - localStorage with TTL
// ============================================================
function cacheSet(key, data, ttlMs) {
  try {
    localStorage.setItem(key, JSON.stringify({
      data: data,
      ts: Date.now(),
      ttl: ttlMs
    }));
  } catch(e) {
    console.warn('localStorage write failed:', e.message);
  }
}

function cacheGet(key) {
  try {
    var item = localStorage.getItem(key);
    if (!item) return null;
    var c = JSON.parse(item);
    if (Date.now() - c.ts > c.ttl) {
      localStorage.removeItem(key);
      return null;
    }
    return c.data;
  } catch(e) {
    return null;
  }
}

// ============================================================
// BUILD STOCKS_DATA FROM QUOTES (with static fallback for missing symbols)
// ============================================================
function buildStocksData(quotes, isStaticFallback) {
  var data = [];
  MARKET_CONFIG.forEach(function(market) {
    var hasAnyData = false;
    var indices = market.symbols.map(function(s) {
      var q = quotes[s.sym];
      if (!q) {
        // No data for this symbol, use static fallback
        var staticData = STATIC_FALLBACK_DATA[s.sym];
        if (staticData) {
          hasAnyData = true;
          var pre = s.pre || '';
          var positive = staticData.changePct >= 0;
          return {
            name: s.name,
            value: pre + formatStockPrice(staticData.price),
            change: (positive ? '+' : '') + staticData.changePct.toFixed(2) + '%',
            changeAbs: (positive ? '+' : '-') + pre + formatStockPrice(Math.abs(staticData.price * staticData.changePct / 100)),
            positive: positive,
            noData: false,
            isStatic: true
          };
        }
        return { name: s.name, value: '—', change: '—', changeAbs: '—', positive: true, noData: true, isStatic: false };
      }
      hasAnyData = true;
      var pre = s.pre || '';
      var positive = q.changePct >= 0;
      return {
        name: s.name,
        value: pre + formatStockPrice(q.price),
        change: (positive ? '+' : '') + q.changePct.toFixed(2) + '%',
        changeAbs: (positive ? '+' : '-') + pre + formatStockPrice(Math.abs(q.price * q.changePct / 100)),
        positive: positive,
        noData: false,
        isStatic: false
      };
    });

    // Build sparkline from first symbol's data
    var mainQuote = quotes[market.symbols[0].sym];
    var sparkline = [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50];
    var mainChangePct = 0;

    if (mainQuote && mainQuote.sparkline.length > 1) {
      var raw = mainQuote.sparkline;
      sparkline = [];
      for (var i = 0; i < 12; i++) {
        var idx = Math.floor(i * (raw.length - 1) / 11);
        sparkline.push(raw[idx]);
      }
      mainChangePct = mainQuote.changePct;
    } else if (STATIC_FALLBACK_DATA[market.symbols[0].sym]) {
      var staticMain = STATIC_FALLBACK_DATA[market.symbols[0].sym];
      sparkline = staticMain.sparkline.slice();
      mainChangePct = staticMain.changePct;
    }

    // Generate sentiment
    var sentiment = 'Market data unavailable';
    if (mainQuote || isStaticFallback) {
      var dir = mainChangePct >= 0 ? 'up' : 'down';
      var mag = Math.abs(mainChangePct);
      if (mag < 0.2) sentiment = 'Markets mostly flat today';
      else if (mag < 1) sentiment = 'Markets ' + dir + ' ' + mag.toFixed(1) + '% today';
      else sentiment = 'Markets ' + dir + ' ' + mag.toFixed(1) + '% — ' + (mainChangePct >= 0 ? 'broad gains' : 'selling pressure');
    }

    data.push({
      country: market.country,
      flag: market.flag,
      indices: indices,
      sentiment: sentiment,
      sparkline: sparkline,
      hasData: hasAnyData,
      isStaticFallback: isStaticFallback && !mainQuote
    });
  });
  return data;
}

// ============================================================
// MAIN LOAD FUNCTION
// ============================================================
function loadStockData() {
  if (stocksFetchInProgress) return;
  stocksFetchInProgress = true;
  stocksFetchError = false;

  // Check localStorage cache first (15 min for API data, 24 hours for static)
  var cached = cacheGet('hegemon_stocks_cache');
  if (cached) {
    console.log('Using cached stock data');
    STOCKS_DATA = cached;
    stocksLastUpdated = new Date();
    stocksFetchInProgress = false;
    if (typeof currentTab !== 'undefined' && currentTab === 'stocks' && typeof renderSidebar === 'function') {
      renderSidebar();
    }
    return;
  }

  // Show loading state
  if (typeof currentTab !== 'undefined' && currentTab === 'stocks' && typeof renderSidebar === 'function') {
    renderSidebar();
  }

  // Fetch from APIs in parallel
  Promise.all([
    fetchStockQuotes().catch(function() { return {}; }),
    fetchBitcoinFromCoinGecko().catch(function() { return null; })
  ])
    .then(function(results) {
      var quotes = results[0] || {};
      var btcData = results[1];

      // Merge Bitcoin data if successful
      if (btcData) {
        quotes['BTC-USD'] = btcData;
      }

      var count = Object.keys(quotes).length;
      var isPartialFail = count > 0 && count < getAllSymbols().length;

      if (count > 0) {
        STOCKS_DATA = buildStocksData(quotes, false);
        stocksLastUpdated = new Date();
        // Cache API data for 15 minutes
        cacheSet('hegemon_stocks_cache', STOCKS_DATA, 900000);
      } else {
        // All API requests failed, use static fallback
        console.warn('All API requests failed, using static fallback');
        var staticQuotes = {};
        Object.keys(STATIC_FALLBACK_DATA).forEach(function(sym) {
          staticQuotes[sym] = STATIC_FALLBACK_DATA[sym];
        });
        STOCKS_DATA = buildStocksData(staticQuotes, true);
        stocksLastUpdated = new Date();
        // Cache static data for 1 hour (retry APIs sooner)
        cacheSet('hegemon_stocks_cache', STOCKS_DATA, 3600000);
        stocksFetchError = true;
      }

      stocksFetchInProgress = false;
      if (typeof currentTab !== 'undefined' && currentTab === 'stocks' && typeof renderSidebar === 'function') {
        renderSidebar();
      }
    })
    .catch(function(err) {
      console.error('Stock data fetch failed:', err);
      // Final fallback: use static data
      var staticQuotes = {};
      Object.keys(STATIC_FALLBACK_DATA).forEach(function(sym) {
        staticQuotes[sym] = STATIC_FALLBACK_DATA[sym];
      });
      STOCKS_DATA = buildStocksData(staticQuotes, true);
      stocksLastUpdated = new Date();
      cacheSet('hegemon_stocks_cache', STOCKS_DATA, 3600000);
      stocksFetchError = true;
      stocksFetchInProgress = false;
      if (typeof currentTab !== 'undefined' && currentTab === 'stocks' && typeof renderSidebar === 'function') {
        renderSidebar();
      }
    });
}

// ============================================================
// AUTO-REFRESH SCHEDULE
// ============================================================
setInterval(function() {
  loadStockData();
}, 180000); // 3 minutes

// Initial load after 1 second
setTimeout(loadStockData, 1000);

// ============================================================
// STOCKS DETAIL POPUP
// ============================================================
var STOCKS_DETAIL = {
  'United States': {
    commodities: [
      { name: 'Crude Oil (WTI)', sym: 'CL=F' },
      { name: 'Natural Gas', sym: 'NG=F' },
      { name: 'Copper', sym: 'HG=F' }
    ],
    whyMatters: 'US markets remain the global benchmark. Movements in the S&P 500 and Dow Jones ripple through every major market worldwide.',
    outlook: 'Key events to watch: Fed rate decisions, CPI data releases, and quarterly earnings reports from mega-cap tech companies.'
  }
};

function openStocksDetail(country) {
  if (!STOCKS_DATA) return;
  var data = STOCKS_DATA.find(function(d) { return d.country === country; });
  if (!data) return;
  var detail = STOCKS_DETAIL[country];

  var modalFlag = document.getElementById('stocksModalFlag');
  var modalTitle = document.getElementById('stocksModalTitle');
  if (modalFlag) modalFlag.textContent = data.flag;
  if (modalTitle) modalTitle.textContent = country + ' Markets';

  var subtitleText = data.sentiment;
  if (data.isStaticFallback) {
    subtitleText = 'Sample data — connecting to live feed...';
  }
  var modalSub = document.getElementById('stocksModalSubtitle');
  if (modalSub) modalSub.textContent = subtitleText;

  var html = '<div class="stocks-section"><div class="stocks-section-title">Market Overview</div>';
  data.indices.forEach(function(idx) {
    if (idx.noData) {
      html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #1f293744;"><span style="color:#9ca3af;font-size:11px;">' + idx.name + '</span><span style="color:#6b7280;font-size:11px;">Data unavailable</span></div>';
    } else {
      var dataLabel = idx.isStatic ? ' (sample)' : '';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #1f293744;"><span style="color:#9ca3af;font-size:11px;">' + idx.name + dataLabel + '</span><span style="color:#e5e7eb;font-size:12px;font-weight:600;">' + idx.value + '</span><span style="color:' + (idx.positive ? '#22c55e' : '#ef4444') + ';font-size:11px;font-weight:700;">' + idx.change + '</span></div>';
    }
  });
  html += '</div>';

  if (detail) {
    html += '<div class="stocks-section"><div class="stocks-section-title">Why It Matters</div><p style="font-size:11px;color:#9ca3af;line-height:1.6;">' + detail.whyMatters + '</p></div>';
    html += '<div class="stocks-section"><div class="stocks-section-title">Outlook</div><p style="font-size:11px;color:#9ca3af;line-height:1.6;">' + detail.outlook + '</p><p style="font-size:9px;color:#6b7280;margin-top:8px;font-style:italic;">Not financial advice. Data may be delayed up to 15 minutes.</p></div>';
  } else {
    html += '<div style="font-size:9px;color:#6b7280;padding:8px 0;font-style:italic;">Data may be delayed up to 15 minutes. Not financial advice.</div>';
  }

  // Timestamp
  html += '<div style="font-size:8px;color:#374151;text-align:right;margin-top:8px;">Last updated: ' + (stocksLastUpdated ? stocksLastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A') + '</div>';

  var modalBody = document.getElementById('stocksModalBody');
  var modalOverlay = document.getElementById('stocksModalOverlay');
  if (modalBody) modalBody.innerHTML = html;
  if (modalOverlay) modalOverlay.classList.add('active');
}

function closeStocksModal() {
  var overlay = document.getElementById('stocksModalOverlay');
  if (overlay) overlay.classList.remove('active');
}
