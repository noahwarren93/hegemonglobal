// stocks.js - Stocks tab data and functions

const STOCKS_DATA = [
  { country: 'United States', flag: '\u{1F1FA}\u{1F1F8}', indices: [
    { name: 'Dow Jones', value: '43,287.54', change: '+0.87%', changeAbs: '+373.12', positive: true },
    { name: 'S&P 500', value: '5,918.23', change: '+0.92%', changeAbs: '+54.07', positive: true },
    { name: 'NASDAQ', value: '18,847.61', change: '+1.14%', changeAbs: '+212.89', positive: true },
    { name: 'Gold', value: '$2,941.30', change: '+0.23%', changeAbs: '+$6.70', positive: true },
    { name: 'Silver', value: '$32.85', change: '-0.42%', changeAbs: '-$0.14', positive: false },
    { name: 'Bitcoin', value: '$96,482.17', change: '+2.34%', changeAbs: '+$2,207.55', positive: true }
  ], sentiment: 'Tech rally lifts markets; Bitcoin nears $100K', sparkline: [40,55,45,60,65,58,70,75,68,80,78,85] },
  { country: 'China', flag: '\u{1F1E8}\u{1F1F3}', indices: [
    { name: 'SSE Composite', value: '3,318.07', change: '-0.34%', changeAbs: '-11.32', positive: false },
    { name: 'Shenzhen', value: '10,128.45', change: '-0.21%', changeAbs: '-21.55', positive: false },
    { name: 'Hang Seng', value: '21,543.89', change: '+0.67%', changeAbs: '+143.21', positive: true }
  ], sentiment: 'Mixed signals as property sector remains under pressure', sparkline: [60,55,50,48,52,45,40,42,38,44,40,43] },
  { country: 'Japan', flag: '\u{1F1EF}\u{1F1F5}', indices: [
    { name: 'Nikkei 225', value: '39,149.43', change: '+1.23%', changeAbs: '+475.88', positive: true },
    { name: 'TOPIX', value: '2,756.12', change: '+0.89%', changeAbs: '+24.32', positive: true }
  ], sentiment: 'Yen weakness boosts exporters; BOJ rate path eyed', sparkline: [50,55,60,58,65,70,68,75,72,78,80,82] },
  { country: 'United Kingdom', flag: '\u{1F1EC}\u{1F1E7}', indices: [
    { name: 'FTSE 100', value: '8,765.43', change: '+0.45%', changeAbs: '+39.21', positive: true },
    { name: 'FTSE 250', value: '20,892.15', change: '+0.31%', changeAbs: '+64.55', positive: true }
  ], sentiment: 'Modest gains; BOE rate cut expectations support sentiment', sparkline: [60,62,58,65,63,68,70,67,72,71,74,73] },
  { country: 'European Union', flag: '\u{1F1EA}\u{1F1FA}', indices: [
    { name: 'Euro Stoxx 50', value: '5,287.34', change: '+0.56%', changeAbs: '+29.45', positive: true },
    { name: 'DAX', value: '22,147.89', change: '+0.73%', changeAbs: '+160.78', positive: true },
    { name: 'CAC 40', value: '8,012.55', change: '+0.41%', changeAbs: '+32.67', positive: true }
  ], sentiment: 'European defense stocks surge on NATO spending plans', sparkline: [55,58,60,62,59,65,68,64,70,72,69,74] },
  { country: 'India', flag: '\u{1F1EE}\u{1F1F3}', indices: [
    { name: 'BSE Sensex', value: '76,543.21', change: '-0.28%', changeAbs: '-215.43', positive: false },
    { name: 'Nifty 50', value: '23,187.65', change: '-0.33%', changeAbs: '-76.89', positive: false }
  ], sentiment: 'Profit-taking after record highs; FII outflows weigh', sparkline: [75,78,80,82,79,76,74,72,70,68,66,65] },
  { country: 'Canada', flag: '\u{1F1E8}\u{1F1E6}', indices: [
    { name: 'TSX Composite', value: '25,432.78', change: '+0.52%', changeAbs: '+131.45', positive: true }
  ], sentiment: 'Energy stocks lead gains on oil price recovery', sparkline: [50,52,48,55,57,54,60,58,62,65,63,67] },
  { country: 'South Korea', flag: '\u{1F1F0}\u{1F1F7}', indices: [
    { name: 'KOSPI', value: '2,612.34', change: '+0.95%', changeAbs: '+24.67', positive: true }
  ], sentiment: 'Samsung earnings beat; chip rally extends', sparkline: [45,48,50,52,55,53,58,60,57,63,65,68] },
  { country: 'Australia', flag: '\u{1F1E6}\u{1F1FA}', indices: [
    { name: 'ASX 200', value: '8,534.12', change: '+0.38%', changeAbs: '+32.21', positive: true }
  ], sentiment: 'Mining stocks steady; RBA holds rates', sparkline: [58,60,57,62,64,61,65,63,67,66,69,68] },
  { country: 'Brazil', flag: '\u{1F1E7}\u{1F1F7}', indices: [
    { name: 'Bovespa', value: '127,892.45', change: '-0.67%', changeAbs: '-863.21', positive: false }
  ], sentiment: 'Real weakens on fiscal concerns', sparkline: [70,68,65,62,60,58,55,57,53,50,52,48] },
  { country: 'Taiwan', flag: '\u{1F1F9}\u{1F1FC}', indices: [
    { name: 'TAIEX', value: '22,987.65', change: '+1.45%', changeAbs: '+328.43', positive: true }
  ], sentiment: 'TSMC surge drives index on AI chip demand', sparkline: [50,55,60,58,65,70,72,75,78,80,83,85] },
  { country: 'Russia', flag: '\u{1F1F7}\u{1F1FA}', indices: [
    { name: 'MOEX', value: '2,845.32', change: '-0.89%', changeAbs: '-25.54', positive: false }
  ], sentiment: 'Sanctions pressure; ruble volatility persists', sparkline: [55,52,50,48,45,47,43,40,42,38,40,37] },
  { country: 'Saudi Arabia', flag: '\u{1F1F8}\u{1F1E6}', indices: [
    { name: 'Tadawul', value: '12,234.56', change: '+0.34%', changeAbs: '+41.23', positive: true }
  ], sentiment: 'Oil stability supports; Vision 2030 advances', sparkline: [55,57,56,58,60,59,61,60,62,61,63,62] },
  { country: 'Turkey', flag: '\u{1F1F9}\u{1F1F7}', indices: [
    { name: 'BIST 100', value: '9,876.54', change: '+1.67%', changeAbs: '+162.34', positive: true }
  ], sentiment: 'Rate normalization attracts foreign investors', sparkline: [40,45,48,52,55,58,60,63,65,68,72,75] },
  { country: 'South Africa', flag: '\u{1F1FF}\u{1F1E6}', indices: [
    { name: 'JSE All Share', value: '76,543.21', change: '-0.12%', changeAbs: '-91.85', positive: false }
  ], sentiment: 'Rand weakness offsets commodity gains', sparkline: [55,53,52,54,51,50,52,49,51,48,50,49] },
  { country: 'Nigeria', flag: '\u{1F1F3}\u{1F1EC}', indices: [
    { name: 'NGX All Share', value: '98,765.43', change: '+0.78%', changeAbs: '+765.32', positive: true }
  ], sentiment: 'Banking rally on reform optimism', sparkline: [45,48,50,53,55,58,60,62,65,67,70,72] }
];

const STOCKS_DETAIL = {
  'United States': {
    commodities: [
      { name: 'Crude Oil (WTI)', value: '$78.43', change: '+1.2%' },
      { name: 'Natural Gas', value: '$3.12', change: '-0.8%' },
      { name: 'Copper', value: '$4.21', change: '+0.5%' }
    ],
    currency: { pair: 'DXY Index', value: '104.23', change: '-0.15%' },
    timeline: [
      { time: '9:30 AM', event: 'Markets open flat; futures pointed higher' },
      { time: '10:15 AM', event: 'Tech stocks surge after NVIDIA earnings beat' },
      { time: '11:30 AM', event: 'Fed minutes show patience on rate cuts' },
      { time: '1:00 PM', event: 'Bond yields tick higher, slight pullback' },
      { time: '3:00 PM', event: 'Power hour rally lifts S&P to session highs' }
    ],
    whyMatters: 'US markets remain the global benchmark. Today\'s tech-led rally signals continued confidence in AI-driven growth.',
    explanations: 'Strong NVIDIA earnings beat drove semiconductor stocks higher. Fed minutes confirmed a data-dependent approach to rate cuts.',
    outlook: 'Key events ahead: CPI data next Tuesday, retail earnings season, and the March FOMC meeting.'
  }
};

function openStocksDetail(country) {
  var data = STOCKS_DATA.find(function(d) { return d.country === country; });
  if (!data) return;
  var detail = STOCKS_DETAIL[country];
  document.getElementById('stocksModalFlag').textContent = data.flag;
  document.getElementById('stocksModalTitle').textContent = country + ' Markets';
  document.getElementById('stocksModalSubtitle').textContent = data.sentiment;
  var html = '<div class="stocks-section"><div class="stocks-section-title">Market Overview</div>';
  data.indices.forEach(function(idx) {
    html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #1f293744;"><span style="color:#9ca3af;font-size:11px;">' + idx.name + '</span><span style="color:#e5e7eb;font-size:12px;font-weight:600;">' + idx.value + '</span><span style="color:' + (idx.positive ? '#22c55e' : '#ef4444') + ';font-size:11px;font-weight:700;">' + idx.change + '</span></div>';
  });
  if (detail && detail.commodities) {
    html += '<div style="margin-top:8px;padding-top:8px;border-top:1px solid #1f2937;">';
    detail.commodities.forEach(function(c) {
      html += '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:10px;"><span style="color:#6b7280;">' + c.name + '</span><span style="color:#d1d5db;">' + c.value + '</span><span style="color:' + (c.change.startsWith('+') ? '#22c55e' : '#ef4444') + '">' + c.change + '</span></div>';
    });
    html += '</div>';
  }
  html += '</div>';
  if (detail && detail.timeline) {
    html += '<div class="stocks-section"><div class="stocks-section-title">Market Changes</div>';
    detail.timeline.forEach(function(t) { html += '<div style="display:flex;gap:10px;padding:6px 0;border-bottom:1px solid #1f293733;"><span style="color:#06b6d4;font-size:10px;font-weight:600;min-width:60px;">' + t.time + '</span><span style="color:#9ca3af;font-size:10px;">' + t.event + '</span></div>'; });
    html += '</div>';
  }
  if (detail) {
    html += '<div class="stocks-section"><div class="stocks-section-title">Why It Matters</div><p style="font-size:11px;color:#9ca3af;line-height:1.6;">' + detail.whyMatters + '</p></div>';
    html += '<div class="stocks-section"><div class="stocks-section-title">Explanations</div><p style="font-size:11px;color:#9ca3af;line-height:1.6;">' + detail.explanations + '</p></div>';
    html += '<div class="stocks-section"><div class="stocks-section-title">Outlook</div><p style="font-size:11px;color:#9ca3af;line-height:1.6;">' + detail.outlook + '</p><p style="font-size:9px;color:#6b7280;margin-top:8px;font-style:italic;">Not financial advice.</p></div>';
  }
  document.getElementById('stocksModalBody').innerHTML = html;
  document.getElementById('stocksModalOverlay').classList.add('active');
}
function closeStocksModal() { document.getElementById('stocksModalOverlay').classList.remove('active'); }

// ============================================================
// TRADE ROUTES
// ============================================================