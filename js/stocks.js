// stocks.js - Live stock market data via Yahoo Finance API

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
// CORS PROXY LIST - try multiple in case one is down
// ============================================================
var CORS_PROXIES = [
  function(url) { return 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url); },
  function(url) { return 'https://corsproxy.io/?' + encodeURIComponent(url); }
];

// ============================================================
// FETCH STOCK QUOTES FROM YAHOO FINANCE
// ============================================================
function getAllSymbols() {
  var syms = [];
  MARKET_CONFIG.forEach(function(m) {
    m.symbols.forEach(function(s) { syms.push(s.sym); });
  });
  return syms;
}

function fetchWithProxy(url, proxyIdx) {
  proxyIdx = proxyIdx || 0;
  if (proxyIdx >= CORS_PROXIES.length) return Promise.reject(new Error('All proxies failed'));
  var proxyUrl = CORS_PROXIES[proxyIdx](url);
  return fetch(proxyUrl, { signal: AbortSignal.timeout ? AbortSignal.timeout(12000) : undefined })
    .then(function(resp) {
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      return resp.json();
    })
    .catch(function(err) {
      console.warn('Proxy ' + proxyIdx + ' failed:', err.message);
      return fetchWithProxy(url, proxyIdx + 1);
    });
}

function fetchStockQuotes() {
  var allSyms = getAllSymbols();
  // Yahoo Finance v8 chart endpoint — fetch each individually for reliability
  // Use v8 chart because v7 quote often requires crumbs/cookies
  var promises = allSyms.map(function(sym) {
    var url = 'https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(sym) + '?range=1d&interval=15m&includePrePost=false';
    return fetchWithProxy(url)
      .then(function(data) {
        if (!data || !data.chart || !data.chart.result || !data.chart.result[0]) return null;
        var result = data.chart.result[0];
        var meta = result.meta;
        var price = meta.regularMarketPrice;
        var prevClose = meta.chartPreviousClose || meta.previousClose;
        if (!price || !prevClose) return null;
        var change = price - prevClose;
        var changePct = (change / prevClose) * 100;
        // Extract intraday closes for sparkline
        var closes = [];
        if (result.indicators && result.indicators.quote && result.indicators.quote[0]) {
          var rawCloses = result.indicators.quote[0].close || [];
          closes = rawCloses.filter(function(v) { return v !== null && v !== undefined; });
        }
        return {
          symbol: meta.symbol || sym,
          price: price,
          change: change,
          changePct: changePct,
          prevClose: prevClose,
          sparkline: closes.length > 0 ? closes : [prevClose, price]
        };
      })
      .catch(function(err) {
        console.warn('Failed to fetch ' + sym + ':', err.message);
        return null;
      });
  });
  return Promise.all(promises).then(function(results) {
    var quotes = {};
    results.forEach(function(r) { if (r) quotes[r.symbol] = r; });
    return quotes;
  });
}

// ============================================================
// FORMAT & BUILD STOCKS_DATA FROM API RESPONSE
// ============================================================
function formatStockPrice(val, decimals) {
  if (val === undefined || val === null || isNaN(val)) return 'N/A';
  decimals = decimals !== undefined ? decimals : 2;
  return val.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function buildStocksData(quotes) {
  var data = [];
  MARKET_CONFIG.forEach(function(market) {
    var hasAnyData = false;
    var indices = market.symbols.map(function(s) {
      var q = quotes[s.sym];
      if (!q) return { name: s.name, value: '—', change: '—', changeAbs: '—', positive: true, noData: true };
      hasAnyData = true;
      var pre = s.pre || '';
      var positive = q.change >= 0;
      return {
        name: s.name,
        value: pre + formatStockPrice(q.price),
        change: (positive ? '+' : '') + q.changePct.toFixed(2) + '%',
        changeAbs: (positive ? '+' : '-') + pre + formatStockPrice(Math.abs(q.change)),
        positive: positive,
        noData: false
      };
    });

    // Build sparkline from first symbol's intraday data
    var mainQuote = quotes[market.symbols[0].sym];
    var sparkline = [50,50,50,50,50,50,50,50,50,50,50,50];
    if (mainQuote && mainQuote.sparkline.length > 1) {
      var raw = mainQuote.sparkline;
      // Downsample to 12 points for display
      sparkline = [];
      for (var i = 0; i < 12; i++) {
        var idx = Math.floor(i * (raw.length - 1) / 11);
        sparkline.push(raw[idx]);
      }
    }

    // Generate sentiment from actual data
    var sentiment = 'Market data unavailable';
    if (mainQuote) {
      var dir = mainQuote.changePct >= 0 ? 'up' : 'down';
      var mag = Math.abs(mainQuote.changePct);
      if (mag < 0.2) sentiment = 'Markets mostly flat today';
      else if (mag < 1) sentiment = 'Markets ' + dir + ' ' + mag.toFixed(1) + '% today';
      else sentiment = 'Markets ' + dir + ' ' + mag.toFixed(1) + '% — ' + (mainQuote.changePct >= 0 ? 'broad gains' : 'selling pressure');
    }

    data.push({
      country: market.country,
      flag: market.flag,
      indices: indices,
      sentiment: sentiment,
      sparkline: sparkline,
      hasData: hasAnyData
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

  // Check sessionStorage cache (5 min)
  try {
    var cached = sessionStorage.getItem('hegemon_stocks_cache');
    if (cached) {
      var c = JSON.parse(cached);
      if (Date.now() - c.ts < 300000) {
        STOCKS_DATA = c.data;
        stocksLastUpdated = new Date(c.ts);
        stocksFetchInProgress = false;
        if (typeof currentTab !== 'undefined' && currentTab === 'stocks' && typeof renderSidebar === 'function') renderSidebar();
        return;
      }
    }
  } catch(e) {}

  // Show loading state immediately
  if (typeof currentTab !== 'undefined' && currentTab === 'stocks' && typeof renderSidebar === 'function') renderSidebar();

  fetchStockQuotes().then(function(quotes) {
    var count = Object.keys(quotes).length;
    if (count > 0) {
      STOCKS_DATA = buildStocksData(quotes);
      stocksLastUpdated = new Date();
      // Cache in sessionStorage
      try {
        sessionStorage.setItem('hegemon_stocks_cache', JSON.stringify({ data: STOCKS_DATA, ts: Date.now() }));
      } catch(e) {}
    } else {
      stocksFetchError = true;
    }
    stocksFetchInProgress = false;
    if (typeof currentTab !== 'undefined' && currentTab === 'stocks' && typeof renderSidebar === 'function') renderSidebar();
  }).catch(function(err) {
    console.error('Stock data fetch failed:', err);
    stocksFetchError = true;
    stocksFetchInProgress = false;
    if (typeof currentTab !== 'undefined' && currentTab === 'stocks' && typeof renderSidebar === 'function') renderSidebar();
  });
}

// Auto-refresh every 5 minutes
setInterval(function() {
  loadStockData();
}, 300000);

// Initial load
setTimeout(loadStockData, 1000);

// ============================================================
// STOCKS DETAIL POPUP (editorial content + live data)
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
  document.getElementById('stocksModalSubtitle').textContent = data.sentiment;

  var html = '<div class="stocks-section"><div class="stocks-section-title">Market Overview</div>';
  data.indices.forEach(function(idx) {
    if (idx.noData) {
      html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #1f293744;"><span style="color:#9ca3af;font-size:11px;">' + idx.name + '</span><span style="color:#6b7280;font-size:11px;">Data unavailable</span></div>';
    } else {
      html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #1f293744;"><span style="color:#9ca3af;font-size:11px;">' + idx.name + '</span><span style="color:#e5e7eb;font-size:12px;font-weight:600;">' + idx.value + '</span><span style="color:' + (idx.positive ? '#22c55e' : '#ef4444') + ';font-size:11px;font-weight:700;">' + idx.change + '</span></div>';
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
