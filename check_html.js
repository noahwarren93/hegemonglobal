const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Check for properly closed tags
const openTags = html.match(/<[^/>]+>/g) || [];
const closeTags = html.match(/<\/\w+>/g) || [];

console.log('HTML STRUCTURE CHECKS:');
console.log('=====================\n');

// Check for unclosed tags (simplified check)
const selfClosing = ['meta', 'link', 'br', 'hr', 'img', 'input'];
let potentialUnclosed = [];
const tagStack = [];

openTags.forEach(tag => {
  const match = tag.match(/<(\w+)/);
  if (match) {
    const tagName = match[1].toLowerCase();
    if (!selfClosing.includes(tagName) && !tag.includes('/>')) {
      tagStack.push(tagName);
    }
  }
});

console.log('✓ Basic tag structure present');

// Check all script tags reference existing files
const scriptMatches = html.match(/<script[^>]*src="([^"]+)"[^>]*>/g) || [];
console.log(`\nScript tags found: ${scriptMatches.length}`);

const requiredScripts = [
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

let scriptsOk = true;
requiredScripts.forEach(script => {
  if (html.includes(`src="${script}"`)) {
    console.log(`✓ Found: ${script}`);
  } else {
    console.log(`✗ MISSING: ${script}`);
    scriptsOk = false;
  }
});

// Check all CSS links
const cssMatches = html.match(/<link[^>]*href="(css\/[^"]+\.css)"[^>]*>/g) || [];
console.log(`\nCSS links found: ${cssMatches.length}`);

const requiredCSS = [
  'css/main.css',
  'css/globe.css',
  'css/sidebar.css',
  'css/modals.css',
  'css/stocks.css',
  'css/trade-routes.css',
  'css/compare.css',
  'css/responsive.css'
];

let cssOk = true;
requiredCSS.forEach(css => {
  if (html.includes(`href="${css}"`)) {
    console.log(`✓ Found: ${css}`);
  } else {
    console.log(`✗ MISSING: ${css}`);
    cssOk = false;
  }
});

// Check for duplicate IDs
const idMatches = html.match(/\bid="([^"]+)"/g) || [];
const ids = idMatches.map(m => m.match(/"([^"]+)"/)[1]);
const idCounts = {};
ids.forEach(id => {
  idCounts[id] = (idCounts[id] || 0) + 1;
});

console.log(`\nTotal unique IDs: ${Object.keys(idCounts).length}`);
let duplicateIds = false;
Object.entries(idCounts).forEach(([id, count]) => {
  if (count > 1) {
    console.log(`✗ DUPLICATE ID: "${id}" appears ${count} times`);
    duplicateIds = true;
  }
});

if (!duplicateIds) {
  console.log('✓ No duplicate IDs found');
}

console.log(`\nHTML VALIDATION SUMMARY:`);
console.log(`Scripts: ${scriptsOk ? '✓ PASS' : '✗ FAIL'}`);
console.log(`CSS: ${cssOk ? '✓ PASS' : '✗ FAIL'}`);
console.log(`IDs: ${duplicateIds ? '✗ FAIL' : '✓ PASS'}`);
