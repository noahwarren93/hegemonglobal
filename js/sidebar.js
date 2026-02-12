// sidebar.js - Sidebar tabs, content rendering

let currentTab = 'daily';
// Track how many news items to show
let newsDisplayCount = 20;

function renderSidebar() {
  const content = document.getElementById('sidebarContent');

  if (currentTab === 'daily') {
    // Separate high-importance and regular news (exclude low-priority stable-country stories from top)
    const _demote = ['switzerland', 'swiss', 'nightclub', 'club fire', 'nightlife'];
    const topStories = DAILY_BRIEFING.filter(item => {
      if (_demote.some(kw => (item.headline || '').toLowerCase().includes(kw))) return false;
      return item.importance === 'high' || ['CONFLICT', 'CRISIS', 'SECURITY'].includes(item.category);
    }).slice(0, 5);
    const allNews = DAILY_BRIEFING.slice(0, newsDisplayCount);

    let html = '';

    // Top Stories section
    if (topStories.length > 0) {
      html += `<div class="section-header" style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:linear-gradient(90deg,rgba(239,68,68,0.15) 0%,transparent 100%);border-left:3px solid #ef4444;margin-bottom:10px;"><span style="font-size:11px;font-weight:700;color:#ef4444;letter-spacing:1px;">TOP STORIES</span></div>`;
      html += topStories.map(item => `
        <div class="card" style="border-left:2px solid ${item.category === 'CONFLICT' ? '#ef4444' : item.category === 'CRISIS' ? '#f97316' : '#eab308'};">
          <div class="card-header"><span class="card-cat ${item.category}">${item.category}</span><span class="card-time">${item.time}</span></div>
          <div class="card-headline" style="font-weight:600;">${item.headline}</div>
          <div class="card-source">${item.url && item.url !== '#' ? `<a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.source} ↗</a>` : `<span style="color:#9ca3af">${item.source}</span>`}</div>
          <div style="margin-top:4px;">${renderBiasTag(item.source)}</div>
        </div>
      `).join('');
    }

    // All News section
    html += `<div class="section-header" style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:rgba(59,130,246,0.1);border-left:3px solid #3b82f6;margin:14px 0 10px 0;"><span style="font-size:11px;font-weight:700;color:#3b82f6;letter-spacing:1px;">LATEST UPDATES</span><span style="font-size:9px;color:#6b7280;">(${DAILY_BRIEFING.length} articles)</span></div>`;
    html += allNews.map(item => `
      <div class="card">
        <div class="card-header"><span class="card-cat ${item.category}">${item.category}</span><span class="card-time">${item.time}</span></div>
        <div class="card-headline">${item.headline}</div>
        <div class="card-source">${item.url && item.url !== '#' ? `<a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.source} ↗</a>` : `<span style="color:#9ca3af">${item.source}</span>`}</div>
        <div style="margin-top:4px;">${renderBiasTag(item.source)}</div>
      </div>
    `).join('');

    // Load More button
    if (newsDisplayCount < DAILY_BRIEFING.length) {
      html += `<button onclick="loadMoreNews()" style="width:100%;padding:12px;margin-top:10px;background:linear-gradient(135deg,#1f2937 0%,#111827 100%);border:1px solid #374151;border-radius:8px;color:#9ca3af;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.2s;">LOAD MORE (${DAILY_BRIEFING.length - newsDisplayCount} remaining)</button>`;
    }

    content.innerHTML = html;
  } else if (currentTab === 'forecast') {
    content.innerHTML = FORECASTS.map(f => `
      <div class="forecast-card">
        <div class="forecast-header"><span class="forecast-region">${f.region}</span><span class="forecast-risk risk-${f.risk}">${f.risk.toUpperCase()}</span></div>
        <div class="forecast-current">${f.current}</div>
        <div class="forecast-prediction"><div class="forecast-prediction-title">FORECAST</div><div class="forecast-prediction-text">${f.forecast}</div></div>
        <div class="forecast-indicators">${f.indicators.map(i => `<span class="forecast-indicator ${i.dir}">${i.dir === 'up' ? '↑' : i.dir === 'down' ? '↓' : '→'} ${i.text}</span>`).join('')}</div>
      </div>
    `).join('');
  } else if (currentTab === 'elections') {
    content.innerHTML = `<div style="font-size:9px;color:#22c55e;font-weight:600;letter-spacing:1px;margin-bottom:12px">RECENT RESULTS</div>` +
      RECENT_ELECTIONS.map(e => `
        <div class="election-card" onclick="openModal('${e.country}')" style="border-left:3px solid #22c55e">
          <div class="election-header"><span class="election-flag">${e.flag}</span><span class="election-country">${e.country}</span><span class="election-date" style="color:#22c55e">${e.date}</span></div>
          <div class="election-type">${e.type}</div>
          <div style="font-size:10px;color:#22c55e;font-weight:600;margin:4px 0">${e.winner}</div>
          <div class="election-stakes">${e.summary}</div>
        </div>
      `).join('') +
      `<div style="font-size:9px;color:#f97316;font-weight:600;letter-spacing:1px;margin:20px 0 12px">UPCOMING ELECTIONS</div>` +
      ELECTIONS.map(e => `
        <div class="election-card" onclick="openModal('${e.country}')" style="border-left:3px solid #f97316">
          <div class="election-header"><span class="election-flag">${e.flag}</span><span class="election-country">${e.country}</span><span class="election-date">${e.date}</span></div>
          <div class="election-type">${e.type}</div>
          <div class="election-stakes">${e.stakes}</div>
        </div>
      `).join('');
  } else if (currentTab === 'horizon') {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const upcoming = HORIZON_EVENTS.filter(e => e.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date));
    const past = HORIZON_EVENTS.filter(e => e.date < todayStr).sort((a, b) => b.date.localeCompare(a.date));

    const catColors = { summit: '#06b6d4', election: '#a78bfa', treaty: '#f59e0b', military: '#ef4444', economic: '#22c55e', sanctions: '#f97316' };

    function renderHorizonEvent(e, isPast) {
      const d = new Date(e.date + 'T12:00:00');
      const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const day = d.getDate();
      const color = catColors[e.category] || '#6b7280';
      const opacity = isPast ? 'opacity:0.5;' : '';

      // Days until/since
      const diffMs = new Date(e.date + 'T00:00:00') - new Date(todayStr + 'T00:00:00');
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      let countdown = '';
      if (diffDays === 0) countdown = '<span style="color:#22c55e;font-weight:700;font-size:8px;">TODAY</span>';
      else if (diffDays === 1) countdown = '<span style="color:#f59e0b;font-size:8px;">TOMORROW</span>';
      else if (diffDays > 1 && diffDays <= 7) countdown = `<span style="color:#f59e0b;font-size:8px;">${diffDays} Day${diffDays === 1 ? '' : 's'}</span>`;
      else if (diffDays > 7 && diffDays <= 30) { const w = Math.ceil(diffDays / 7); countdown = `<span style="color:#6b7280;font-size:8px;">${w} Week${w === 1 ? '' : 's'}</span>`; }
      else if (diffDays > 30) { const mo = Math.ceil(diffDays / 30); countdown = `<span style="color:#4b5563;font-size:8px;">${mo} Month${mo === 1 ? '' : 's'}</span>`; }
      else if (isPast) { const abs = Math.abs(diffDays); countdown = `<span style="color:#374151;font-size:8px;">${abs} Day${abs === 1 ? '' : 's'} Ago</span>`; }

      return `
        <div style="display:flex;gap:10px;padding:10px 8px;border-bottom:1px solid #111827;${opacity}">
          <div style="min-width:42px;text-align:center;">
            <div style="font-size:9px;font-weight:700;color:${color};letter-spacing:0.5px;">${month}</div>
            <div style="font-size:18px;font-weight:700;color:#e5e7eb;line-height:1.1;">${day}</div>
            <div style="margin-top:2px;">${countdown}</div>
          </div>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px;">
              <span style="font-size:10px;font-weight:600;color:#e5e7eb;line-height:1.3;">${e.name}</span>
            </div>
            <div style="font-size:9px;color:#9ca3af;margin-bottom:3px;">${e.location}</div>
            <div style="font-size:9px;color:#6b7280;line-height:1.5;">${e.description}</div>
          </div>
        </div>`;
    }

    let horizonHtml = '';

    // Header
    horizonHtml += `<div style="padding:8px 12px;background:linear-gradient(90deg,rgba(6,182,212,0.12) 0%,transparent 100%);border-left:3px solid #06b6d4;margin-bottom:12px;">
      <div style="font-size:11px;font-weight:700;color:#06b6d4;letter-spacing:1px;">GEOPOLITICAL HORIZON</div>
      <div style="font-size:9px;color:#6b7280;margin-top:2px;">${upcoming.length} upcoming events tracked</div>
    </div>`;

    // Category legend
    horizonHtml += `<div style="display:flex;flex-wrap:wrap;gap:6px;padding:0 8px 10px;border-bottom:1px solid #1f2937;margin-bottom:4px;">`;
    Object.entries(catColors).forEach(([cat, color]) => {
      horizonHtml += `<span style="font-size:8px;color:#6b7280;display:flex;align-items:center;gap:2px;"><span style="width:6px;height:6px;border-radius:50%;background:${color};display:inline-block;"></span>${cat.charAt(0).toUpperCase() + cat.slice(1)}</span>`;
    });
    horizonHtml += `</div>`;

    // Upcoming events
    if (upcoming.length > 0) {
      // Group by month
      let currentMonth = '';
      upcoming.forEach(e => {
        const d = new Date(e.date + 'T12:00:00');
        const monthYear = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        if (monthYear !== currentMonth) {
          currentMonth = monthYear;
          horizonHtml += `<div style="font-size:9px;font-weight:700;color:#9ca3af;letter-spacing:1px;padding:10px 8px 4px;border-top:1px solid #1f2937;margin-top:4px;">${monthYear.toUpperCase()}</div>`;
        }
        horizonHtml += renderHorizonEvent(e, false);
      });
    }

    // Past events (collapsed)
    if (past.length > 0) {
      horizonHtml += `
        <div style="margin-top:12px;border-top:1px solid #1f2937;padding-top:10px;">
          <div onclick="toggleBriefDropdown('horizon-past')" style="display:flex;align-items:center;justify-content:space-between;padding:8px;cursor:pointer;background:#0d0d14;border-radius:6px;" onmouseover="this.style.background='#131320'" onmouseout="this.style.background='#0d0d14'">
            <span style="font-size:9px;font-weight:600;color:#6b7280;letter-spacing:0.5px;">PAST EVENTS (${past.length})</span>
            <span id="horizon-past-arrow" style="color:#6b7280;font-size:10px;transition:transform 0.3s;">▼</span>
          </div>
          <div id="horizon-past" style="max-height:0px;opacity:0;overflow:hidden;transition:max-height 0.4s ease, opacity 0.3s ease;">
            ${past.map(e => renderHorizonEvent(e, true)).join('')}
          </div>
        </div>`;
    }

    content.innerHTML = horizonHtml;
  } else if (currentTab === 'search') {
    content.innerHTML = `<div style="margin-bottom:12px"><input type="text" id="searchInput" placeholder="Search countries..." style="width:100%;padding:10px 12px;background:#0d0d12;border:1px solid #1f2937;border-radius:8px;color:#fff;font-size:12px;outline:none" oninput="searchCountries(this.value)"></div><div id="searchResults"><div style="color:#6b7280;font-size:11px;text-align:center;padding:20px">Type to search ${Object.keys(COUNTRIES).length} countries...</div></div>`;
  } else if (currentTab === 'stocks') {
    let stocksHtml = '<div style="padding:8px 12px;background:linear-gradient(90deg,rgba(34,197,94,0.12) 0%,transparent 100%);border-left:3px solid #22c55e;margin-bottom:12px;"><div style="font-size:11px;font-weight:700;color:#22c55e;letter-spacing:1px;">GLOBAL MARKETS</div><div style="font-size:9px;color:#6b7280;margin-top:2px;">Ranked by economic importance</div></div>';
    if (typeof STOCKS_DATA !== 'undefined') {
      STOCKS_DATA.forEach(function(stock) {
        stocksHtml += '<div class="stocks-country" onclick="openStocksDetail(\'' + stock.country + '\')">' +
          '<div class="stocks-country-header">' +
            '<span class="stocks-country-flag">' + stock.flag + '</span>' +
            '<span class="stocks-country-name">' + stock.country + '</span>' +
            '<span class="stocks-sentiment">' + stock.sentiment + '</span>' +
          '</div>' +
          '<div class="stocks-indices">' +
            stock.indices.map(function(idx) {
              return '<div class="stock-index-row">' +
                '<span class="stock-index-name">' + idx.name + '</span>' +
                '<span class="stock-index-value">' + idx.value + '</span>' +
                '<span class="stock-index-change ' + (idx.positive ? 'positive' : 'negative') + '">' + idx.change + '</span>' +
              '</div>';
            }).join('') +
          '</div>' +
          '<div class="stocks-sparkline">' +
            stock.sparkline.map(function(v, i, arr) {
              var max = Math.max.apply(null, arr);
              var min = Math.min.apply(null, arr);
              var range = max - min || 1;
              var h = ((v - min) / range) * 16 + 4;
              var isUp = i > 0 ? v >= arr[i-1] : true;
              return '<div class="stocks-sparkline-bar" style="height:' + h + 'px;background:' + (isUp ? '#22c55e' : '#ef4444') + ';"></div>';
            }).join('') +
          '</div>' +
        '</div>';
      });
    } else {
      stocksHtml += '<div style="color:#6b7280;font-size:11px;text-align:center;padding:20px;">Loading market data...</div>';
    }
    content.innerHTML = stocksHtml;
  } else if (currentTab === 'newsletter') {
    content.innerHTML = renderNewsletter();
  }
}

function loadMoreNews() {
  newsDisplayCount += 15;
  renderSidebar();
}

function searchCountries(query) {
  const results = document.getElementById('searchResults');
  if (!query) { results.innerHTML = '<div style="color:#6b7280;font-size:11px;text-align:center;padding:20px">Type to search...</div>'; return; }
  const matches = Object.entries(COUNTRIES).filter(([name, c]) => name.toLowerCase().includes(query.toLowerCase()) || c.region.toLowerCase().includes(query.toLowerCase()) || (c.title && c.title.toLowerCase().includes(query.toLowerCase())));
  results.innerHTML = matches.length ? matches.map(([name, c]) => `<div class="card" onclick="openModal('${name}')" style="margin-bottom:4px"><div class="event-header" style="margin:0"><div class="event-dot" style="background:${RISK_COLORS[c.risk].hex}"></div><span class="event-country">${c.flag} ${name}</span><span class="event-risk risk-${c.risk}">${c.risk.toUpperCase()}</span></div></div>`).join('') : '<div style="color:#6b7280;font-size:11px;text-align:center;padding:20px">No countries found</div>';
}

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentTab = tab.dataset.tab;
    renderSidebar();
  });
});

// Terms of Service / Privacy Policy

let currentTosTab = 'terms';
function openTOS() {
  document.getElementById('tosOverlay').classList.add('active');
  switchTosTab('terms');
  if (fontSizeLevel !== 0) applyFontScale();
}
function closeTOS() {
  document.getElementById('tosOverlay').classList.remove('active');
}
function switchTosTab(tab) {
  currentTosTab = tab;
  document.getElementById('tosBody').innerHTML = TOS_CONTENT[tab];
  document.querySelectorAll('.tos-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tos-tab').forEach(t => { if ((tab === 'terms' && t.textContent.includes('Terms')) || (tab === 'privacy' && t.textContent.includes('Privacy'))) t.classList.add('active'); });
}

function openModal(name) {
  const c = COUNTRIES[name];
  if (!c) return;

  // Hide the tooltip when opening modal
  const tooltipEl = document.getElementById('tooltip');
  if (tooltipEl) tooltipEl.style.display = 'none';

  document.getElementById('modalFlag').textContent = c.flag;
  document.getElementById('modalTitle').textContent = name;
  const riskEl = document.getElementById('modalRisk');
  riskEl.textContent = c.risk.toUpperCase();
  riskEl.className = `modal-risk risk-${c.risk}`;
  document.getElementById('modalSubtitle').textContent = c.title || c.region;

  let html = `<div class="facts-grid"><div class="fact"><div class="fact-label">Region</div><div class="fact-value">${c.region}</div></div><div class="fact"><div class="fact-label">Population</div><div class="fact-value">${c.pop}</div></div><div class="fact"><div class="fact-label">GDP</div><div class="fact-value">${c.gdp}</div></div><div class="fact"><div class="fact-label">Leader</div><div class="fact-value">${c.leader}</div></div></div>`;

  // Add risk trend chart with indicators
  html += `<div class="section-title">Risk Trend & Indicators</div>${renderTrendChart(name, c.risk)}`;

  if (c.analysis) {
    html += `<div class="section-title">Situation Analysis</div>
      <div class="analysis-block"><div class="analysis-header"><div class="analysis-num n1">1</div><div class="analysis-title">What Happened</div></div><p class="analysis-text">${c.analysis.what}</p></div>
      <div class="analysis-block"><div class="analysis-header"><div class="analysis-num n2">2</div><div class="analysis-title">Why It Matters</div></div><p class="analysis-text">${c.analysis.why}</p></div>
      <div class="analysis-block"><div class="analysis-header"><div class="analysis-num n3">3</div><div class="analysis-title">What Might Happen</div></div><p class="analysis-text">${c.analysis.next}</p></div>`;
  }

  // Show cached news first
  if (c.news && c.news.length) {
    html += `<div class="section-title">Recent Coverage</div>`;
    c.news.forEach(n => { html += `<div class="news-item"><div class="news-meta"><span class="news-source">${n.source}</span><span class="news-time">${n.time}</span></div>${renderBiasTag(n.source)}<div class="news-headline">${n.headline}</div>${n.url && n.url !== '#' ? `<a class="news-link" href="${n.url}" target="_blank" rel="noopener noreferrer">Read more ↗</a>` : ''}</div>`; });
  }

  // Add placeholder for live country news
  html += `<div class="country-news-section"><div class="country-news-title">LIVE NEWS FOR ${name.toUpperCase()}</div><div id="countryNewsContent" class="country-news-loading">Loading latest news...</div></div>`;

  // Sanctions section (collapsible, below news)
  html += buildSanctionsSection(name);

  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('modalOverlay').classList.add('active');
  if (fontSizeLevel !== 0) applyFontScale(); // Apply current font scale to modal

  // Fetch live country-specific news
  fetchCountryNews(name).then(result => {
    const newsContainer = document.getElementById('countryNewsContent');
    if (newsContainer) {
      if (result && Array.isArray(result) && result.length > 0) {
        newsContainer.innerHTML = result.map(n => `
          <div class="news-item">
            <div class="news-meta">
              <span class="card-cat ${n.category}" style="font-size:7px;padding:1px 4px;">${n.category}</span>
              <span class="news-source">${n.source}</span>
              <span class="news-time">${n.time}</span>
            </div>
            ${renderBiasTag(n.source)}
            <div class="news-headline">${n.headline}</div>
            ${n.url && n.url !== '#' ? `<a class="news-link" href="${n.url}" target="_blank" rel="noopener noreferrer">Read more ↗</a>` : ''}
          </div>
        `).join('');
      } else if (result && result.error) {
        newsContainer.innerHTML = `<div style="color:#f59e0b;font-size:11px;">${result.error}</div>`;
      } else {
        newsContainer.innerHTML = '<div style="color:#6b7280;font-size:11px;">No major international news coverage for this country at this time. This typically indicates a period of relative stability.</div>';
      }
    }
  });
}

function closeModal() { document.getElementById('modalOverlay').classList.remove('active'); }
document.getElementById('modalOverlay').addEventListener('click', e => { if (e.target.id === 'modalOverlay') closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeStatPopup(); if (typeof closeStocksModal === 'function') closeStocksModal(); if (typeof compareModeActive !== 'undefined' && compareModeActive) toggleCompareMode(); } });

// Stat popup functions

function getSanctionsForCountry(countryName) {
  return SANCTIONS_DATA[countryName] || { severity: 'none', on: [], by: [] };
}

// Build the collapsible sanctions HTML for a country modal
function buildSanctionsSection(countryName) {
  const data = getSanctionsForCountry(countryName);
  const hasOn = data.on && data.on.length > 0;
  const hasBy = data.by && data.by.length > 0;
  const hasSanctions = hasOn || hasBy;

  const sectionId = 'sanctions-' + countryName.replace(/\s+/g, '-');

  let html = `<div class="sanctions-section">`;
  html += `<div class="sanctions-toggle" onclick="toggleSanctions('${sectionId}')">
    <div class="sanctions-toggle-left">
      <span class="sanctions-toggle-title">Sanctions</span>
    </div>
    <span class="sanctions-chevron" id="${sectionId}-chevron">&#9660;</span>
  </div>`;

  html += `<div class="sanctions-body" id="${sectionId}"><div class="sanctions-inner">`;

  if (hasOn) {
    html += `<div class="sanctions-group-title">Sanctions on ${countryName}</div>`;
    for (const s of data.on) {
      html += `<div class="sanction-item">
        <div class="sanction-header"><span class="sanction-by">${s.by}</span><span class="sanction-year">${s.year}</span></div>
        <div class="sanction-reason">${s.reason}</div>
      </div>`;
    }
  }

  if (hasBy) {
    html += `<div class="sanctions-group-title">Sanctions by ${countryName}</div>`;
    for (const s of data.by) {
      html += `<div class="sanction-item">
        <div class="sanction-header"><span class="sanction-by">${s.target}</span><span class="sanction-year">${s.year}</span></div>
        <div class="sanction-reason">${s.reason}</div>
      </div>`;
    }
  }

  if (!hasSanctions) {
    html += `<div class="sanctions-none">No active sanctions data for this country.</div>`;
  }

  html += `</div></div></div>`;
  return html;
}

function toggleSanctions(sectionId) {
  const body = document.getElementById(sectionId);
  const chevron = document.getElementById(sectionId + '-chevron');
  if (body) {
    body.classList.toggle('open');
    if (chevron) chevron.classList.toggle('open');
  }
}

// Format source name nicely