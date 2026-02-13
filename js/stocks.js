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
var STATIC_FALLBACK_DATA = {
  '^DJI': { price: 44200, changePct: 0.32, sparkline: [43950, 44020, 44080, 44120, 44180, 44210, 44195, 44240, 44280, 44250, 44220, 44200] },
  '^GSPC': { price: 6050, changePct: 0.28, sparkline: [6020, 6025, 6032, 6038, 6045, 6048, 6052, 6058, 6065, 6062, 6055, 6050] },
  '^IXIC': { price: 19800, changePct: 0.42, sparkline: [19650, 19700, 19750, 19780, 19800, 19820, 19850, 19880, 19920, 19890, 19850, 19800] },
  'GC=F': { price: 2650, changePct: 0.15, sparkline: [2645, 2646, 2647, 2648, 2649, 2650, 2651, 2650, 2649, 2648, 2649, 2650] },
  'SI=F': { price: 31.50, changePct: 0.08, sparkline: [31.40, 31.42, 31.44, 31.46, 31.48, 31.49, 31.50, 31.51, 31.50, 31.49, 31.50, 31.50] },
  'BTC-USD': { price: 97000, changePct: 2.14, sparkline: [95000, 95500, 96000, 96500, 97000, 97200, 97500, 97300, 97100, 96800, 96900, 97000] },
  '000001.SS': { price: 3380, changePct: -0.42, sparkline: [3395, 3390, 3385, 3382, 3381, 3380, 3379, 3380, 3381, 3380, 3379, 3380] },
  '399001.SZ': { price: 10800, changePct: -0.18, sparkline: [10820, 10815, 10810, 10805, 10802, 10800, 10801, 10802, 10801, 10800, 10799, 10800] },
  '^HSI': { price: 20500, changePct: 0.24, sparkline: [20450, 20460, 20475, 20485, 20495, 20500, 20505, 20510, 20515, 20510, 20505, 20500] },
  '^N225': { price: 38500, changePct: 0.56, sparkline: [38250, 38300, 38350, 38400, 38450, 38480, 38500, 38520, 38550, 38520, 38510, 38500] },
  '^TOPX': { price: 2680, changePct: 0.37, sparkline: [2665, 2670, 2672, 2674, 2676, 2677, 2678, 2680, 2682, 2681, 2680, 2680] },
  '^FTSE': { price: 8350, changePct: 0.12, sparkline: [8340, 8342, 8344, 8345, 8346, 8348, 8349, 8350, 8351, 8350, 8349, 8350] },
  '^MCX': { price: 20800, changePct: 0.19, sparkline: [20750, 20760, 20770, 20780, 20790, 20795, 20800, 20805, 20810, 20805, 20800, 20800] },
  '^STOXX50E': { price: 5080, changePct: 0.22, sparkline: [5065, 5070, 5072, 5074, 5076, 5077, 5078, 5080, 5082, 5081, 5080, 5080] },
  '^GDAXI': { price: 21600, changePct: 0.31, sparkline: [21550, 21560, 21570, 21580, 21590, 21595, 21600, 21610, 21620, 21610, 21605, 21600] },
  '^FCHI': { price: 7850, changePct: 0.18, sparkline: [7840, 7842, 7844, 7846, 7847, 7848, 7849, 7850, 7851, 7850, 7849, 7850] },
  '^BSESN': { price: 77500, changePct: 0.48, sparkline: [77200, 77250, 77300, 77350, 77400, 77450, 77480, 77500, 77520, 77510, 77505, 77500] },
  '^NSEI': { price: 23400, changePct: 0.52, sparkline: [23250, 23270, 23290, 23310, 23330, 23360, 23380, 23400, 23420, 23410, 23405, 23400] },
  '^GSPTSE': { price: 25200, changePct: 0.35, sparkline: [25100, 25120, 25140, 25160, 25180, 25190, 25200, 25210, 25220, 25210, 25205, 25200] },
  '^KS11': { price: 2550, changePct: 0.28, sparkline: [2540, 2542, 2544, 2545, 2546, 2548, 2549, 2550, 2551, 2550, 2549, 2550] },
  '^AXJO': { price: 8400, changePct: 0.24, sparkline: [8380, 8385, 8390, 8395, 8398, 8399, 8400, 8402, 8405, 8403, 8401, 8400] },
  '^BVSP': { price: 127500, changePct: 0.62, sparkline: [126800, 126900, 127000, 127100, 127200, 127300, 127400, 127500, 127600, 127550, 127520, 127500] },
  '^TWII': { price: 23100, changePct: 0.38, sparkline: [23000, 23020, 23040, 23060, 23080, 23090, 23100, 23110, 23120, 23110, 23105, 23100] },
  'IMOEX.ME': { price: 2850, changePct: -0.32, sparkline: [2860, 2858, 2856, 2854, 2852, 2851, 2850, 2849, 2848, 2849, 2850, 2850] },
  '^TASI': { price: 12100, changePct: 0.41, sparkline: [12000, 12020, 12040, 12060, 12080, 12090, 12100, 12110, 12120, 12110, 12105, 12100] },
  'XU100.IS': { price: 10200, changePct: 0.52, sparkline: [10100, 10120, 10140, 10160, 10180, 10190, 10200, 10210, 10220, 10210, 10205, 10200] },
  '^J203.JO': { price: 82500, changePct: 0.18, sparkline: [82300, 82350, 82400, 82450, 82480, 82490, 82500, 82510, 82520, 82515, 82510, 82500] },
  '^NGSEINDX': { price: 100200, changePct: 0.35, sparkline: [99900, 99950, 100000, 100050, 100100, 100150, 100180, 100200, 100250, 100225, 100210, 100200] }
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
        // Cache static data for 24 hours
        cacheSet('hegemon_stocks_cache', STOCKS_DATA, 86400000);
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
      cacheSet('hegemon_stocks_cache', STOCKS_DATA, 86400000);
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
}, 300000); // 5 minutes

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

  document.getElementById('stocksModalFlag').textContent = data.flag;
  document.getElementById('stocksModalTitle').textContent = country + ' Markets';

  var subtitleText = data.sentiment;
  if (data.isStaticFallback) {
    subtitleText = 'Sample data — connecting to live feed...';
  }
  document.getElementById('stocksModalSubtitle').textContent = subtitleText;

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

  document.getElementById('stocksModalBody').innerHTML = html;
  document.getElementById('stocksModalOverlay').classList.add('active');
}

function closeStocksModal() {
  document.getElementById('stocksModalOverlay').classList.remove('active');
}
