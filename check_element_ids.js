const fs = require('fs');

// Read HTML and JS files
const html = fs.readFileSync('index.html', 'utf8');
const jsFiles = [
  'js/utils.js',
  'js/data.js',
  'js/news.js',
  'js/api.js',
  'js/globe.js',
  'js/sidebar.js',
  'js/stocks.js',
  'js/trade-routes.js',
  'js/compare.js',
  'js/app.js'
];

const allJsContent = jsFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n');

// Extract all IDs from HTML
const htmlIds = {};
const idMatches = html.match(/\bid="([^"]+)"/g) || [];
idMatches.forEach(match => {
  const id = match.match(/"([^"]+)"/)[1];
  htmlIds[id] = true;
});

// IDs that should be referenced in JS via getElementById
const elementIdsToCheck = [
  'compareHint',
  'comparePanel',
  'compareCountries',
  'compareContent',
  'compareDataArea',
  'compareSearchInput',
  'compareSearchResults',
  'compareModeBtn',
  'compareInstruction',
  'tradeRoutesBtn',
  'radarChart',
  'featureBtnsDesktop',
  'watchlist',
  'breakingBanner',
  'breakingText',
  'currentDate',
  'globeSearchInput',
  'globeSearchResults',
  'searchOverlay',
  'tradeInfoPanel',
  'tradeInfoTitle',
  'tradeInfoBody',
  'tradeTooltip'
];

console.log('ELEMENT ID VERIFICATION:');
console.log('=======================\n');

let allPass = true;

elementIdsToCheck.forEach(id => {
  const inHTML = htmlIds[id] !== undefined;
  const inJS = allJsContent.includes(`getElementById('${id}')`) || 
               allJsContent.includes(`getElementById("${id}")`);
  
  if (!inHTML) {
    console.log(`✗ ID "${id}": NOT in HTML`);
    allPass = false;
  } else if (!inJS) {
    console.log(`⚠ ID "${id}": in HTML but not referenced in JS`);
  } else {
    console.log(`✓ ID "${id}": exists and referenced`);
  }
});

console.log(`\nELEMENT ID CHECK: ${allPass ? '✓ PASS' : '✗ FAIL'}`);
