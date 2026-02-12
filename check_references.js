const fs = require('fs');

// Read HTML
const html = fs.readFileSync('index.html', 'utf8');

// Extract onclick handlers and other function calls
const functionCalls = [
  'toggleTradeRoutes',
  'toggleCompareMode',
  'openTOS',
  'openSearchOverlay',
  'toggleRotation',
  'closeBanner',
  'searchCompareCountry',
  'removeCountryFromCompare',
  'closeStocksModal',
  'closeModal',
  'closeTOS',
  'switchTosTab',
  'adjustFontSize',
  'resetFontSize',
  'showStatPopup',
  'closeStatPopup',
  'searchCountriesGlobe',
  'closeSearchOverlay',
  'closeTradeInfoPanel'
];

console.log('CROSS-FILE REFERENCE CHECK:');
console.log('===========================\n');

const expectedLocations = {
  'toggleTradeRoutes': 'js/trade-routes.js',
  'toggleCompareMode': 'js/compare.js',
  'openTOS': 'js/utils.js or js/app.js',
  'openSearchOverlay': 'js/globe.js or js/app.js',
  'toggleRotation': 'js/globe.js',
  'closeBanner': 'js/utils.js or js/app.js',
  'searchCompareCountry': 'js/compare.js',
  'removeCountryFromCompare': 'js/compare.js',
  'closeStocksModal': 'js/stocks.js',
  'closeModal': 'js/app.js',
  'closeTOS': 'js/utils.js or js/app.js',
  'switchTosTab': 'js/utils.js or js/app.js',
  'adjustFontSize': 'js/sidebar.js',
  'resetFontSize': 'js/sidebar.js',
  'showStatPopup': 'js/globe.js or js/app.js',
  'closeStatPopup': 'js/globe.js or js/app.js',
  'searchCountriesGlobe': 'js/globe.js or js/app.js',
  'closeSearchOverlay': 'js/globe.js',
  'closeTradeInfoPanel': 'js/trade-routes.js'
};

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

const fileContents = {};
jsFiles.forEach(file => {
  fileContents[file] = fs.readFileSync(file, 'utf8');
});

let allFound = true;

functionCalls.forEach(func => {
  let found = false;
  let foundIn = [];
  
  // Check if function is referenced in HTML
  if (!html.includes(func)) {
    console.log(`⚠ Function not referenced in HTML: ${func}`);
    return;
  }
  
  // Check which files contain the function definition
  jsFiles.forEach(file => {
    const regex = new RegExp(`\\b${func}\\s*[=:]|function\\s+${func}\\s*\\(|const\\s+${func}\\s*=|let\\s+${func}\\s*=|window\\.${func}`);
    if (regex.test(fileContents[file])) {
      foundIn.push(file);
      found = true;
    }
  });
  
  if (found) {
    console.log(`✓ ${func}: defined in ${foundIn.join(', ')}`);
  } else {
    console.log(`✗ ${func}: NOT FOUND in any JS file`);
    console.log(`  Expected: ${expectedLocations[func]}`);
    allFound = false;
  }
});

console.log(`\nCROSS-REFERENCE CHECK: ${allFound ? '✓ PASS' : '✗ FAIL'}`);
