// stocksData.js - Market configuration and static data

export const MARKET_CONFIG = [
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

// Static fallback prices sourced from market closes on Feb 12, 2026
// These are used ONLY when all live API calls fail
export const STATIC_FALLBACK_DATA = {
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

export const STOCKS_DETAIL = {
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