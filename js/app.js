// app.js - Main initialization

function updateDate() {
  document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
updateDate();
// Check every minute and update if date changed
setInterval(updateDate, 60000);

// Calculate stats
let critical = 0, high = 0, stable = 0;
Object.values(COUNTRIES).forEach(c => {
  if (c.risk === 'catastrophic' || c.risk === 'extreme') critical++;
  else if (c.risk === 'severe' || c.risk === 'stormy') high++;
  else stable++;
});
document.getElementById('statCritical').textContent = critical;
document.getElementById('statHigh').textContent = high;
document.getElementById('statStable').textContent = stable;
document.getElementById('statTotal').textContent = Object.keys(COUNTRIES).length;

// Render watchlist
const watchlistEl = document.getElementById('watchlist');
const watchlistCountries = Object.entries(COUNTRIES)
  .filter(([_, c]) => c.risk === 'catastrophic' || c.risk === 'extreme')
  .sort((a, b) => {
    const tierDiff = ({ catastrophic: 0, extreme: 1 }[a[1].risk] - { catastrophic: 0, extreme: 1 }[b[1].risk]);
    return tierDiff !== 0 ? tierDiff : a[0].localeCompare(b[0]);
  });
watchlistEl.innerHTML = `<div class="watchlist-title">CRITICAL WATCHLIST</div>` +
  watchlistCountries.map(([name, c]) => `<div class="watchlist-item" onclick="openModal('${name}')"><span class="wl-country">${c.flag} ${name}</span><span class="wl-risk risk-${c.risk}">${c.risk.toUpperCase()}</span></div>`).join('');

// THREE.JS GLOBE WITH TEXTURE

initGlobe();
renderSidebar();