// app.js - Main initialization (loads LAST — all dependencies available)

function updateDate() {
  document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
updateDate();
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

// Stat popup functions
function showStatPopup(type) {
  const popup = document.getElementById('statPopup');
  const title = document.getElementById('statPopupTitle');
  const content = document.getElementById('statPopupContent');
  if (!popup || !content) return;

  let countries = [];
  if (type === 'critical') {
    title.textContent = 'Critical Countries';
    title.style.color = '#ef4444';
    countries = Object.entries(COUNTRIES).filter(([_, c]) => c.risk === 'catastrophic' || c.risk === 'extreme');
  } else if (type === 'high') {
    title.textContent = 'High Risk Countries';
    title.style.color = '#f97316';
    countries = Object.entries(COUNTRIES).filter(([_, c]) => c.risk === 'severe' || c.risk === 'stormy');
  } else if (type === 'stable') {
    title.textContent = 'Stable Countries';
    title.style.color = '#22c55e';
    countries = Object.entries(COUNTRIES).filter(([_, c]) => c.risk === 'cloudy' || c.risk === 'clear');
  } else {
    title.textContent = 'All Countries';
    title.style.color = '#06b6d4';
    countries = Object.entries(COUNTRIES);
  }

  countries.sort((a, b) => a[0].localeCompare(b[0]));
  content.innerHTML = countries.map(([name, c]) =>
    `<div class="stat-popup-item" onclick="openModal('${name}')">
      <span>${c.flag} ${name}</span>
      <span class="wl-risk risk-${c.risk}" style="font-size:8px;padding:2px 5px;border-radius:3px;font-weight:600;text-transform:uppercase;">${c.risk}</span>
    </div>`
  ).join('');

  popup.classList.add('active');
}

function closeStatPopup() {
  const popup = document.getElementById('statPopup');
  if (popup) popup.classList.remove('active');
}

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

// Initialize dynamic risk state system (defined in api.js)
initializeRiskState();

// Seed briefing history if empty
(function seedBriefingHistory() {
  try {
    const history = loadBriefingHistory();
    const todayKey = getBriefingDateKey();
    const pastKeys = Object.keys(history).filter(d => d !== todayKey);
    if (pastKeys.length === 0) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = yesterday.toISOString().split('T')[0];
      history[yesterdayKey] = {
        date: yesterdayKey,
        articles: DAILY_BRIEFING_FALLBACK.map(a => ({
          time: a.time, category: a.category, importance: a.importance,
          headline: a.headline, source: a.source, url: a.url
        })),
        savedAt: new Date().toISOString(),
        articleCount: DAILY_BRIEFING_FALLBACK.length
      };
      localStorage.setItem(BRIEFING_HISTORY_KEY, JSON.stringify(history));
    }
  } catch (e) {
    console.warn('Could not seed briefing history:', e.message);
  }
})();

// Initialize live news and set up auto-refresh
fetchLiveNews();
setInterval(fetchLiveNews, NEWS_REFRESH_INTERVAL);

// THREE.JS GLOBE WITH TEXTURE
initGlobe();
renderSidebar();
