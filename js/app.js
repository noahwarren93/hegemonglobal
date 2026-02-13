// app.js - Main initialization (loads LAST — all dependencies available)

function updateDate() {
  var el = document.getElementById('currentDate');
  if (el) el.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
updateDate();
setInterval(updateDate, 60000);

// Calculate stats
var critical = 0, high = 0, stable = 0;
Object.values(COUNTRIES).forEach(function(c) {
  if (c.risk === 'catastrophic' || c.risk === 'extreme') critical++;
  else if (c.risk === 'severe' || c.risk === 'stormy') high++;
  else stable++;
});
var elCrit = document.getElementById('statCritical');
var elHigh = document.getElementById('statHigh');
var elStab = document.getElementById('statStable');
var elTotal = document.getElementById('statTotal');
if (elCrit) elCrit.textContent = critical;
if (elHigh) elHigh.textContent = high;
if (elStab) elStab.textContent = stable;
if (elTotal) elTotal.textContent = Object.keys(COUNTRIES).length;

// Stat popup functions
function showStatPopup(type) {
  var popup = document.getElementById('statPopup');
  var titleEl = document.getElementById('statPopupTitle');
  var contentEl = document.getElementById('statPopupContent');
  if (!popup || !contentEl) return;

  var countries = [];
  if (type === 'critical') {
    if (titleEl) { titleEl.textContent = 'Critical Countries'; titleEl.style.color = '#ef4444'; }
    countries = Object.entries(COUNTRIES).filter(function(e) { return e[1].risk === 'catastrophic' || e[1].risk === 'extreme'; });
  } else if (type === 'high') {
    if (titleEl) { titleEl.textContent = 'High Risk Countries'; titleEl.style.color = '#f97316'; }
    countries = Object.entries(COUNTRIES).filter(function(e) { return e[1].risk === 'severe' || e[1].risk === 'stormy'; });
  } else if (type === 'stable') {
    if (titleEl) { titleEl.textContent = 'Stable Countries'; titleEl.style.color = '#22c55e'; }
    countries = Object.entries(COUNTRIES).filter(function(e) { return e[1].risk === 'cloudy' || e[1].risk === 'clear'; });
  } else {
    if (titleEl) { titleEl.textContent = 'All Countries'; titleEl.style.color = '#06b6d4'; }
    countries = Object.entries(COUNTRIES);
  }

  countries.sort(function(a, b) { return a[0].localeCompare(b[0]); });
  contentEl.innerHTML = countries.map(function(e) {
    var name = e[0], c = e[1];
    return '<div class="stat-popup-item" onclick="openModal(\'' + name + '\')">' +
      '<span>' + c.flag + ' ' + name + '</span>' +
      '<span class="wl-risk risk-' + c.risk + '" style="font-size:8px;padding:2px 5px;border-radius:3px;font-weight:600;text-transform:uppercase;">' + c.risk + '</span>' +
    '</div>';
  }).join('');

  popup.classList.add('active');
}

function closeStatPopup() {
  var popup = document.getElementById('statPopup');
  if (popup) popup.classList.remove('active');
}

// Click-outside handler: close stat popup when clicking outside it
document.addEventListener('click', function(e) {
  // Close stat popup when clicking outside
  var statPopup = document.getElementById('statPopup');
  if (statPopup && statPopup.classList.contains('active')) {
    // Check if click is outside the stat popup AND outside stat cards
    var isInsidePopup = statPopup.contains(e.target);
    var isStatCard = e.target.closest && e.target.closest('.stat-card');
    if (!isInsidePopup && !isStatCard) {
      closeStatPopup();
    }
  }
});

// Render watchlist
var watchlistEl = document.getElementById('watchlist');
if (watchlistEl) {
  var watchlistCountries = Object.entries(COUNTRIES)
    .filter(function(e) { return e[1].risk === 'catastrophic' || e[1].risk === 'extreme'; })
    .sort(function(a, b) {
      var tierDiff = ({ catastrophic: 0, extreme: 1 }[a[1].risk] - { catastrophic: 0, extreme: 1 }[b[1].risk]);
      return tierDiff !== 0 ? tierDiff : a[0].localeCompare(b[0]);
    });
  watchlistEl.innerHTML = '<div class="watchlist-title">CRITICAL WATCHLIST</div>' +
    watchlistCountries.map(function(e) {
      var name = e[0], c = e[1];
      return '<div class="watchlist-item" onclick="openModal(\'' + name + '\')"><span class="wl-country">' + c.flag + ' ' + name + '</span><span class="wl-risk risk-' + c.risk + '">' + c.risk.toUpperCase() + '</span></div>';
    }).join('');
}

// Initialize dynamic risk state system (defined in api.js)
if (typeof initializeRiskState === 'function') initializeRiskState();

// Seed briefing history if empty
(function seedBriefingHistory() {
  try {
    if (typeof loadBriefingHistory !== 'function') return;
    var history = loadBriefingHistory();
    var todayKey = getBriefingDateKey();
    var pastKeys = Object.keys(history).filter(function(d) { return d !== todayKey; });
    if (pastKeys.length === 0) {
      var yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      var yesterdayKey = yesterday.toISOString().split('T')[0];
      history[yesterdayKey] = {
        date: yesterdayKey,
        articles: DAILY_BRIEFING_FALLBACK.map(function(a) {
          return { time: a.time, category: a.category, importance: a.importance,
            headline: a.headline, source: a.source, url: a.url };
        }),
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
if (typeof fetchLiveNews === 'function') {
  fetchLiveNews();
  setInterval(fetchLiveNews, typeof NEWS_REFRESH_INTERVAL !== 'undefined' ? NEWS_REFRESH_INTERVAL : 600000);
}

// THREE.JS GLOBE WITH TEXTURE
if (typeof initGlobe === 'function') initGlobe();
if (typeof renderSidebar === 'function') renderSidebar();
