// api.js - API calls, news fetching, risk dynamics

const BRIEFING_HISTORY_KEY = 'hegemon_briefing_history';
const BRIEFING_MAX_HISTORY = 3;

function getBriefingDateKey() {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
}

function formatBriefingDate(dateStr) {
  const date = new Date(dateStr + 'T12:00:00');
  const month = date.toLocaleString('en-US', { month: 'long' });
  const day = date.getDate();
  const suffix = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
  return `${month} ${day}${suffix}`;
}

function loadBriefingHistory() {
  try {
    const stored = localStorage.getItem(BRIEFING_HISTORY_KEY);
    if (stored) {
      const history = JSON.parse(stored);
      // Clean out entries older than 4 days
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 4);
      const cutoffStr = cutoff.toISOString().split('T')[0];
      const cleaned = {};
      Object.keys(history).filter(d => d >= cutoffStr).sort().reverse().slice(0, BRIEFING_MAX_HISTORY).forEach(d => {
        cleaned[d] = history[d];
      });
      return cleaned;
    }
  } catch (e) {
    console.warn('Failed to load briefing history:', e.message);
  }
  return {};
}

function saveBriefingSnapshot() {
  if (!DAILY_BRIEFING || DAILY_BRIEFING.length === 0) return;
  // Only save non-fallback data (check if we have real articles with real URLs)
  const hasRealArticles = DAILY_BRIEFING.some(a => a.url && a.url !== '#');
  if (!hasRealArticles) return;

  const todayKey = getBriefingDateKey();
  try {
    const history = loadBriefingHistory();

    // Save today's snapshot (overwrite if exists - keeps latest version)
    history[todayKey] = {
      date: todayKey,
      articles: DAILY_BRIEFING.slice(0, 50).map(a => ({
        time: a.time,
        category: a.category,
        importance: a.importance,
        headline: a.headline,
        source: a.source,
        url: a.url
      })),
      savedAt: new Date().toISOString(),
      articleCount: DAILY_BRIEFING.length
    };

    // Keep only the most recent entries (today + 3 past days)
    const allDates = Object.keys(history).sort().reverse();
    const trimmed = {};
    allDates.slice(0, BRIEFING_MAX_HISTORY + 1).forEach(d => { trimmed[d] = history[d]; });

    localStorage.setItem(BRIEFING_HISTORY_KEY, JSON.stringify(trimmed));
    console.log(`Briefing snapshot saved for ${todayKey} (${DAILY_BRIEFING.length} articles)`);
  } catch (e) {
    console.warn('Failed to save briefing snapshot:', e.message);
  }
}

function getPastBriefings() {
  const todayKey = getBriefingDateKey();
  const history = loadBriefingHistory();
  // Return past briefings (exclude today), sorted newest first
  return Object.keys(history)
    .filter(d => d !== todayKey)
    .sort()
    .reverse()
    .slice(0, BRIEFING_MAX_HISTORY)
    .map(d => history[d]);
}

function togglePastBriefing(id) {
  const el = document.getElementById(id);
  const arrow = document.getElementById(id + '-arrow');
  if (el) {
    const isOpen = el.style.maxHeight && el.style.maxHeight !== '0px';
    el.style.maxHeight = isOpen ? '0px' : el.scrollHeight + 'px';
    el.style.opacity = isOpen ? '0' : '1';
    if (arrow) arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
  }
}

function renderPastBriefingsHTML() {
  const pastBriefings = getPastBriefings();
  if (pastBriefings.length === 0) return '';

  let html = `<div style="margin-top:20px;border-top:1px solid #1f2937;padding-top:14px;">
    <div style="font-size:9px;color:#6b7280;font-weight:600;letter-spacing:1px;margin-bottom:10px;padding:0 4px;">PREVIOUS BRIEFINGS</div>`;

  pastBriefings.forEach((briefing, index) => {
    const id = 'past-briefing-' + index;
    const dateLabel = formatBriefingDate(briefing.date);
    const articleCount = briefing.articles ? briefing.articles.length : 0;

    html += `
      <div style="margin-bottom:8px;border:1px solid #1f2937;border-radius:8px;overflow:hidden;background:#0d0d14;">
        <div onclick="togglePastBriefing('${id}')" style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;cursor:pointer;transition:background 0.2s;background:#0d0d14;" onmouseover="this.style.background='#131320'" onmouseout="this.style.background='#0d0d14'">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:11px;font-weight:600;color:#9ca3af;">${dateLabel}'s Brief</span>
            <span style="font-size:8px;color:#6b7280;background:#1f2937;padding:2px 6px;border-radius:4px;">${articleCount} articles</span>
          </div>
          <span id="${id}-arrow" style="color:#6b7280;font-size:10px;transition:transform 0.3s ease;">▼</span>
        </div>
        <div id="${id}" style="max-height:0px;opacity:0;overflow-y:auto;transition:max-height 0.4s ease, opacity 0.3s ease;max-height:0;">`;

    if (briefing.articles && briefing.articles.length > 0) {
      // Show top stories first
      const topStories = briefing.articles.filter(a => a.importance === 'high' || ['CONFLICT', 'CRISIS', 'SECURITY'].includes(a.category)).slice(0, 3);
      const otherArticles = briefing.articles.filter(a => !topStories.includes(a)).slice(0, 12);

      if (topStories.length > 0) {
        html += `<div style="padding:4px 10px 2px;font-size:8px;color:#ef4444;font-weight:600;letter-spacing:0.5px;">TOP STORIES</div>`;
        html += topStories.map(a => `
          <div style="padding:6px 10px;border-bottom:1px solid #111827;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
              <span class="card-cat ${a.category}" style="font-size:6px;padding:1px 4px;">${a.category}</span>
              <span style="font-size:8px;color:#6b7280;">${a.source}</span>
            </div>
            <div style="font-size:10px;color:#d1d5db;line-height:1.4;">${a.headline}</div>
            ${a.url && a.url !== '#' ? `<a href="${a.url}" target="_blank" rel="noopener noreferrer" style="font-size:8px;color:#06b6d4;text-decoration:none;">Read more ↗</a>` : ''}
          </div>
        `).join('');
      }

      if (otherArticles.length > 0) {
        html += `<div style="padding:6px 10px 2px;font-size:8px;color:#3b82f6;font-weight:600;letter-spacing:0.5px;">ALL UPDATES</div>`;
        html += otherArticles.map(a => `
          <div style="padding:5px 10px;border-bottom:1px solid #111827;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
              <span class="card-cat ${a.category}" style="font-size:6px;padding:1px 4px;">${a.category}</span>
              <span style="font-size:8px;color:#6b7280;">${a.source}</span>
            </div>
            <div style="font-size:9px;color:#9ca3af;line-height:1.4;">${a.headline}</div>
          </div>
        `).join('');
      }
    } else {
      html += `<div style="padding:12px;font-size:10px;color:#6b7280;text-align:center;">No articles available for this briefing.</div>`;
    }

    html += `</div></div>`;
  });

  html += `</div>`;
  return html;
}

// RSS Feed sources - FREE and UNLIMITED!

const RSS_FEEDS = {
  // Diverse world news RSS feeds - interleaved so no bias clusters together
  daily: [
    { url: 'https://feeds.reuters.com/Reuters/worldNews', source: 'Reuters' },             // Center
    { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC World' },           // Left-Center
    { url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml', source: 'Wall Street Journal' }, // Right-Center
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'New York Times' }, // Left-Center
    { url: 'https://www.dailymail.co.uk/news/worldnews/index.rss', source: 'Daily Mail' }, // Right-Center
    { url: 'https://thehill.com/feed/', source: 'The Hill' },                               // Center
    { url: 'https://feeds.foxnews.com/foxnews/world', source: 'Fox News' },                // Right
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },            // Left-Center
    { url: 'https://nypost.com/tag/world-news/feed/', source: 'New York Post' },              // Right-Center
    { url: 'https://www.theguardian.com/world/rss', source: 'The Guardian' },               // Left
    { url: 'https://www.washingtontimes.com/rss/headlines/news/world/', source: 'Washington Times' } // Right-Center
  ],
  // Country-specific search will use Google News RSS
  search: (query) => `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`
};

// RSS to JSON proxy (free tier: 10,000 req/day)
const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json?rss_url=';

// Multiple backup News APIs for robust fallback
const NEWS_APIS = {
  newsdata: {
    key: 'pub_7c217680d0cb4730af5530a2e86e2474',
    buildUrl: (key, query) => `https://newsdata.io/api/1/news?apikey=${key}&language=en&q=${encodeURIComponent(query)}&size=30`,
    buildDailyUrl: (key) => `https://newsdata.io/api/1/news?apikey=${key}&language=en&category=world,politics,business,technology&size=50`,
    parseResults: (data) => data.status === 'success' ? data.results : null
  },
  gnews: {
    key: 'e67a04b89b39458db2aba2de73cd4e52',
    buildUrl: (key, query) => `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=15&apikey=${key}`,
    buildDailyUrl: (key) => `https://gnews.io/api/v4/top-headlines?lang=en&max=50&apikey=${key}`,
    parseResults: (data) => data.articles ? data.articles.map(a => ({
      title: a.title,
      description: a.description || '',
      link: a.url,
      source_id: a.source?.name || 'GNews',
      pubDate: a.publishedAt
    })) : null
  },
  mediastack: {
    key: 'a03d02da70b2f5e91f0d8e3c71e1f604',
    buildUrl: (key, query) => `https://api.mediastack.com/v1/news?access_key=${key}&keywords=${encodeURIComponent(query)}&languages=en&limit=15`,
    buildDailyUrl: (key) => `https://api.mediastack.com/v1/news?access_key=${key}&languages=en&categories=general,politics,business,technology&limit=50`,
    parseResults: (data) => data.data ? data.data.map(a => ({
      title: a.title,
      description: a.description || '',
      link: a.url,
      source_id: a.source || 'MediaStack',
      pubDate: a.published_at
    })) : null
  }
};

const NEWS_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes
let apiFailures = {}; // Track recent failures

// ============================================================
// NEWS CACHING - Avoid redundant API calls
// ============================================================
const NEWS_CACHE = {};
const NEWS_CACHE_TTL = 5 * 60 * 1000; // 5 minute cache per country

function getCachedNews(countryName) {
  const cached = NEWS_CACHE[countryName];
  if (cached && (Date.now() - cached.timestamp) < NEWS_CACHE_TTL) {
    console.log(`Using cached news for ${countryName} (${Math.round((Date.now() - cached.timestamp) / 1000)}s old)`);
    return cached.data;
  }
  return null;
}

function setCachedNews(countryName, data) {
  NEWS_CACHE[countryName] = { data, timestamp: Date.now() };
}

// Category detection based on keywords
function detectCategory(title, description) {
  const text = (title + ' ' + (description || '')).toLowerCase();
  if (text.match(/war|military|attack|strike|bomb|troops|fighting|conflict|invasion/)) return 'CONFLICT';
  if (text.match(/economy|market|stock|trade|gdp|inflation|bank|fed|rate|fiscal/)) return 'ECONOMY';
  if (text.match(/security|terror|missile|nuclear|defense|army|navy|weapon/)) return 'SECURITY';
  if (text.match(/diplomat|treaty|summit|negotiat|sanction|ambassador|un |nato/)) return 'DIPLOMACY';
  if (text.match(/elect|president|prime minister|parliament|vote|politic|government|congress/)) return 'POLITICS';
  if (text.match(/crisis|humanitarian|famine|refugee|disaster|emergency/)) return 'CRISIS';
  if (text.match(/tech|ai|chip|cyber|digital|software|data/)) return 'TECH';
  if (text.match(/climate|environment|emission|carbon|green|energy/)) return 'CLIMATE';
  return 'WORLD';
}

// ============================================================
// DYNAMIC RISK SYSTEM - Article Impact Scoring
// ============================================================


function scoreArticleImpact(article) {
  const text = ((article.headline || article.title || '') + ' ' + (article.description || '')).toLowerCase();
  const category = article.category || detectCategory(text, '');

  let baseImpact = CATEGORY_WEIGHTS[category] || 1;

  // Find highest severity multiplier from escalation keywords
  let severityMultiplier = 1;
  for (const kw in ESCALATION_KEYWORDS) {
    if (text.includes(kw)) {
      severityMultiplier = Math.max(severityMultiplier, ESCALATION_KEYWORDS[kw]);
    }
  }

  // Sum de-escalation bonuses (can stack, but capped)
  let deescalationBonus = 0;
  for (const kw in DEESCALATION_KEYWORDS) {
    if (text.includes(kw)) {
      deescalationBonus += DEESCALATION_KEYWORDS[kw];
    }
  }
  deescalationBonus = Math.max(-8, deescalationBonus); // Cap stacking

  // If article is fundamentally positive (diplomacy + peace keywords), flip base impact
  if (deescalationBonus < -3 && baseImpact > 0) {
    baseImpact = -Math.abs(baseImpact) * 0.5;
  }

  const riskDelta = Math.max(-5, Math.min(15, (baseImpact * severityMultiplier) + deescalationBonus));

  return {
    riskDelta,
    category,
    isDeescalation: deescalationBonus < -1,
    severity: severityMultiplier,
    headline: article.headline || article.title || ''
  };
}

// ============================================================
// DYNAMIC RISK SYSTEM - State Management
// ============================================================

const COUNTRY_RISK_STATE = {};
const RISK_LEVELS_ORDERED = ['clear', 'cloudy', 'stormy', 'severe', 'extreme', 'catastrophic'];

function riskLevelToValue(level) {
  const map = { 'catastrophic': 95, 'extreme': 78, 'severe': 62, 'stormy': 45, 'cloudy': 28, 'clear': 10 };
  return map[level] || 45;
}

function valueToRiskLevel(value) {
  if (value >= 88) return 'catastrophic';
  if (value >= 70) return 'extreme';
  if (value >= 54) return 'severe';
  if (value >= 36) return 'stormy';
  if (value >= 18) return 'cloudy';
  return 'clear';
}

function initializeRiskState() {
  for (const countryName in COUNTRIES) {
    const c = COUNTRIES[countryName];
    COUNTRY_RISK_STATE[countryName] = {
      baseRisk: c.risk,
      currentRisk: c.risk,
      riskValue: riskLevelToValue(c.risk),
      accumulatedScore: 0,
      newsHistory: [],
      changeLog: [],
      lastLevelChange: 0,
      overrideActive: false,
      overrideReason: ''
    };
  }
  console.log(`[RISK] Initialized dynamic risk state for ${Object.keys(COUNTRIES).length} countries`);
}

// ============================================================
// DYNAMIC RISK SYSTEM - Accumulator & Transition Engine
// ============================================================

function updateCountryRiskAccumulator(countryName, articles) {
  const state = COUNTRY_RISK_STATE[countryName];
  if (!state || state.overrideActive) return;

  const now = Date.now();

  // Prune history to 48h window
  state.newsHistory = state.newsHistory.filter(item => now - item.timestamp < 48 * 3600 * 1000);

  // Score each new article and add to history
  for (const article of articles) {
    const impact = scoreArticleImpact(article);
    state.newsHistory.push({
      timestamp: now,
      impact: impact.riskDelta,
      headline: impact.headline,
      category: impact.category,
      isDeescalation: impact.isDeescalation
    });
  }

  // Calculate weighted average (exponential decay, 24h half-life)
  let totalScore = 0;
  let totalWeight = 0;
  for (const item of state.newsHistory) {
    const ageHours = (now - item.timestamp) / 3600000;
    const weight = Math.exp(-ageHours / 24);
    totalScore += item.impact * weight;
    totalWeight += weight;
  }
  const avgImpact = totalWeight > 0 ? totalScore / totalWeight : 0;

  // Update accumulator with momentum damping (85% decay per cycle)
  state.accumulatedScore = state.accumulatedScore * 0.85 + avgImpact * 0.15;
  state.accumulatedScore = Math.max(-50, Math.min(50, state.accumulatedScore));
}

function calculateDynamicRisk(countryName) {
  const state = COUNTRY_RISK_STATE[countryName];
  if (!state || state.overrideActive) return COUNTRIES[countryName].risk;

  const baseValue = riskLevelToValue(state.baseRisk);
  const dynamicValue = Math.max(0, Math.min(100, baseValue + state.accumulatedScore));

  // Enforce max 1 level jump per cycle
  const currentLevel = state.currentRisk;
  const proposedLevel = valueToRiskLevel(dynamicValue);
  const currentIdx = RISK_LEVELS_ORDERED.indexOf(currentLevel);
  const proposedIdx = RISK_LEVELS_ORDERED.indexOf(proposedLevel);
  const stepDiff = proposedIdx - currentIdx;

  let newLevel;
  if (Math.abs(stepDiff) <= 1) {
    newLevel = proposedLevel;
  } else {
    // Constrain to 1 step
    newLevel = RISK_LEVELS_ORDERED[currentIdx + (stepDiff > 0 ? 1 : -1)];
  }

  // Enforce 6-hour cooldown between level changes
  const now = Date.now();
  const sixHours = 6 * 3600 * 1000;

  if (newLevel !== state.currentRisk) {
    if (state.lastLevelChange && (now - state.lastLevelChange) < sixHours) {
      // Still in cooldown — don't change level
      return state.currentRisk;
    }

    // Allow the change
    const oldRisk = state.currentRisk;
    state.currentRisk = newLevel;
    state.lastLevelChange = now;
    state.riskValue = riskLevelToValue(newLevel);

    // Log the transition
    const triggerArticle = state.newsHistory.length > 0
      ? state.newsHistory[state.newsHistory.length - 1].headline
      : 'Accumulated news impact';

    state.changeLog.push({
      timestamp: now,
      type: 'LEVEL_CHANGE',
      from: oldRisk,
      to: newLevel,
      trigger: triggerArticle,
      score: state.accumulatedScore.toFixed(1)
    });

    // Keep log manageable
    if (state.changeLog.length > 50) state.changeLog = state.changeLog.slice(-50);

    console.log(`[RISK] ${countryName}: ${oldRisk} → ${newLevel} (score: ${state.accumulatedScore.toFixed(1)})`);
  }

  return state.currentRisk;
}

// ============================================================
// DYNAMIC RISK SYSTEM - Master Update Function
// ============================================================

async function updateDynamicRisks(articles) {
  if (!articles || articles.length === 0) return [];

  // Group articles by country using existing relevance matching
  const articlesByCountry = {};
  for (const countryName in COUNTRIES) {
    const relevant = articles.filter(article =>
      isRelevantToCountry(article.headline || article.title || '', article.description || '', countryName)
    );
    if (relevant.length > 0) {
      articlesByCountry[countryName] = relevant;
    }
  }

  // Update each country's risk accumulator and calculate new level
  const changedCountries = [];
  for (const countryName in articlesByCountry) {
    const oldRisk = COUNTRIES[countryName].risk;

    updateCountryRiskAccumulator(countryName, articlesByCountry[countryName]);
    const newRisk = calculateDynamicRisk(countryName);

    // Apply the new risk to the COUNTRIES object
    COUNTRIES[countryName].risk = newRisk;

    if (oldRisk !== newRisk) {
      changedCountries.push({ name: countryName, from: oldRisk, to: newRisk });
    }
  }

  // Batch UI refresh
  if (changedCountries.length > 0) {
    refreshRiskUI(changedCountries);
    console.log(`[RISK] ${changedCountries.length} countries changed risk level`);
  }

  const articleCount = Object.values(articlesByCountry).reduce((sum, arr) => sum + arr.length, 0);
  console.log(`[RISK] Analyzed ${articleCount} articles across ${Object.keys(articlesByCountry).length} countries`);

  return changedCountries;
}

// ============================================================
// DYNAMIC RISK SYSTEM - UI Refresh
// ============================================================

function refreshRiskUI(changedCountries) {
  // 1. Update stats
  refreshStats();

  // 2. Refresh sidebar (watchlist + current tab)
  renderSidebar();

  // 3. Show toast notification for changes
  if (changedCountries.length > 0) {
    const first = changedCountries[0];
    const upCount = changedCountries.filter(c => RISK_LEVELS_ORDERED.indexOf(c.to) > RISK_LEVELS_ORDERED.indexOf(c.from)).length;
    const downCount = changedCountries.length - upCount;
    let msg = '';
    if (changedCountries.length === 1) {
      const dir = RISK_LEVELS_ORDERED.indexOf(first.to) > RISK_LEVELS_ORDERED.indexOf(first.from) ? '&#9650;' : '&#9660;';
      msg = `${dir} ${first.name}: ${first.from} &rarr; ${first.to}`;
    } else {
      const parts = [];
      if (upCount > 0) parts.push(`${upCount} escalated`);
      if (downCount > 0) parts.push(`${downCount} de-escalated`);
      msg = `${changedCountries.length} risk changes: ${parts.join(', ')}`;
    }
    showRiskToast(msg);
  }
}

function refreshStats() {
  let critical = 0, high = 0, stable = 0;
  Object.values(COUNTRIES).forEach(c => {
    if (c.risk === 'catastrophic' || c.risk === 'extreme') critical++;
    else if (c.risk === 'severe' || c.risk === 'stormy') high++;
    else stable++;
  });

  const statCritical = document.getElementById('statCritical');
  const statHigh = document.getElementById('statHigh');
  const statStable = document.getElementById('statStable');
  if (statCritical) statCritical.textContent = critical;
  if (statHigh) statHigh.textContent = high;
  if (statStable) statStable.textContent = stable;
}

function showRiskToast(message) {
  let toast = document.getElementById('riskToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'riskToast';
    toast.className = 'risk-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = message;
  toast.classList.add('active');
  setTimeout(() => toast.classList.remove('active'), 5000);
}

// ============================================================
// SANCTIONS DATA & RENDERING
// ============================================================
// Structure: each country key maps to { severity, on: [...], by: [...] }
// severity: 'heavy' | 'moderate' | 'limited' | 'none'
// on: sanctions imposed ON this country   → { by, reason, year }
// by: sanctions imposed BY this country   → { target, reason, year }
// Easy to update manually; designed for future API hookup (OFAC, EU, UN)


function isRelevantToCountry(title, description, countryName) {
  const text = ((title || '') + ' ' + (description || '')).toLowerCase();
  const titleLower = (title || '').toLowerCase();
  const descLower = (description || '').toLowerCase();
  const countryLower = countryName.toLowerCase();

  // Check for irrelevant keywords - reject these
  for (const kw of IRRELEVANT_KEYWORDS) {
    if (text.includes(kw)) return false;
  }

  // Comprehensive demonyms for ALL 195 countries
  const demonyms = {
    'Afghanistan': ['afghan', 'kabul', 'taliban'],
    'Albania': ['albanian', 'tirana'],
    'Algeria': ['algerian', 'algiers'],
    'Andorra': ['andorran'],
    'Angola': ['angolan', 'luanda'],
    'Antigua and Barbuda': ['antiguan', 'barbudan'],
    'Argentina': ['argentine', 'argentinian', 'buenos aires'],
    'Armenia': ['armenian', 'yerevan'],
    'Australia': ['australian', 'canberra', 'sydney', 'melbourne'],
    'Austria': ['austrian', 'vienna'],
    'Azerbaijan': ['azerbaijani', 'baku'],
    'Bahamas': ['bahamian', 'nassau'],
    'Bahrain': ['bahraini', 'manama'],
    'Bangladesh': ['bangladeshi', 'dhaka'],
    'Barbados': ['barbadian', 'bridgetown'],
    'Belarus': ['belarusian', 'minsk', 'lukashenko'],
    'Belgium': ['belgian', 'brussels'],
    'Benin': ['beninese', 'porto-novo', 'cotonou'],
    'Bhutan': ['bhutanese', 'thimphu'],
    'Bolivia': ['bolivian', 'la paz'],
    'Bosnia and Herzegovina': ['bosnian', 'sarajevo'],
    'Botswana': ['motswana', 'botswanan', 'gaborone'],
    'Brazil': ['brazilian', 'brasilia', 'rio', 'sao paulo', 'lula'],
    'Brunei': ['bruneian', 'bandar seri begawan'],
    'Bulgaria': ['bulgarian', 'sofia'],
    'Burkina Faso': ['burkinabe', 'ouagadougou'],
    'Burundi': ['burundian', 'bujumbura', 'gitega'],
    'Cambodia': ['cambodian', 'phnom penh'],
    'Cameroon': ['cameroonian', 'yaounde'],
    'Canada': ['canadian', 'ottawa', 'toronto', 'trudeau'],
    'Cape Verde': ['cape verdean', 'praia'],
    'Central African Republic': ['central african', 'bangui'],
    'Chad': ['chadian', "n'djamena"],
    'Chile': ['chilean', 'santiago'],
    'China': ['chinese', 'beijing', 'xi jinping', 'ccp', 'prc'],
    'Colombia': ['colombian', 'bogota'],
    'Comoros': ['comorian', 'moroni'],
    'Democratic Republic of Congo': ['congolese', 'kinshasa', 'drc'],
    'Republic of Congo': ['congo-brazzaville', 'brazzaville'],
    'Costa Rica': ['costa rican', 'san jose'],
    'Croatia': ['croatian', 'zagreb'],
    'Cuba': ['cuban', 'havana'],
    'Cyprus': ['cypriot', 'nicosia'],
    'Czech Republic': ['czech', 'prague'],
    'Denmark': ['danish', 'copenhagen'],
    'Greenland': ['greenlandic', 'nuuk', 'inuit'],
    'Djibouti': ['djiboutian'],
    'Dominica': ['dominican'],
    'Dominican Republic': ['dominican republic', 'santo domingo'],
    'Ecuador': ['ecuadorian', 'quito'],
    'Egypt': ['egyptian', 'cairo', 'sisi'],
    'El Salvador': ['salvadoran', 'san salvador', 'bukele'],
    'Equatorial Guinea': ['equatoguinean', 'malabo'],
    'Eritrea': ['eritrean', 'asmara'],
    'Estonia': ['estonian', 'tallinn'],
    'Eswatini': ['swazi', 'mbabane'],
    'Ethiopia': ['ethiopian', 'addis ababa'],
    'Fiji': ['fijian', 'suva'],
    'Finland': ['finnish', 'helsinki'],
    'France': ['french', 'paris', 'macron', 'élysée'],
    'Gabon': ['gabonese', 'libreville'],
    'Gambia': ['gambian', 'banjul'],
    'Georgia': ['georgian', 'tbilisi'],
    'Germany': ['german', 'berlin', 'scholz', 'bundestag'],
    'Ghana': ['ghanaian', 'accra'],
    'Greece': ['greek', 'athens'],
    'Grenada': ['grenadian'],
    'Guatemala': ['guatemalan'],
    'Guinea': ['guinean', 'conakry'],
    'Guinea-Bissau': ['bissau-guinean', 'bissau'],
    'Guyana': ['guyanese', 'georgetown'],
    'Haiti': ['haitian', 'port-au-prince'],
    'Honduras': ['honduran', 'tegucigalpa'],
    'Hungary': ['hungarian', 'budapest', 'orban'],
    'Iceland': ['icelandic', 'reykjavik'],
    'India': ['indian', 'delhi', 'mumbai', 'modi', 'bjp'],
    'Indonesia': ['indonesian', 'jakarta', 'jokowi'],
    'Iran': ['iranian', 'tehran', 'ayatollah', 'khamenei'],
    'Iraq': ['iraqi', 'baghdad', 'kurdish'],
    'Ireland': ['irish', 'dublin'],
    'Israel': ['israeli', 'tel aviv', 'jerusalem', 'netanyahu', 'gaza', 'idf'],
    'Italy': ['italian', 'rome', 'meloni'],
    'Ivory Coast': ['ivorian', 'abidjan', 'yamoussoukro'],
    'Jamaica': ['jamaican', 'kingston'],
    'Japan': ['japanese', 'tokyo', 'kishida'],
    'Jordan': ['jordanian', 'amman'],
    'Kazakhstan': ['kazakh', 'astana', 'almaty'],
    'Kenya': ['kenyan', 'nairobi'],
    'Kiribati': ['i-kiribati', 'tarawa'],
    'Kosovo': ['kosovar', 'pristina'],
    'Kuwait': ['kuwaiti', 'kuwait city'],
    'Kyrgyzstan': ['kyrgyz', 'bishkek'],
    'Laos': ['laotian', 'vientiane'],
    'Latvia': ['latvian', 'riga'],
    'Lebanon': ['lebanese', 'beirut', 'hezbollah'],
    'Lesotho': ['basotho', 'maseru'],
    'Liberia': ['liberian', 'monrovia'],
    'Libya': ['libyan', 'tripoli'],
    'Liechtenstein': ['liechtensteiner', 'vaduz'],
    'Lithuania': ['lithuanian', 'vilnius'],
    'Luxembourg': ['luxembourgish', 'luxembourger'],
    'Madagascar': ['malagasy', 'antananarivo'],
    'Malawi': ['malawian', 'lilongwe'],
    'Malaysia': ['malaysian', 'kuala lumpur'],
    'Maldives': ['maldivian', 'male'],
    'Mali': ['malian', 'bamako'],
    'Malta': ['maltese', 'valletta'],
    'Marshall Islands': ['marshallese', 'majuro'],
    'Mauritania': ['mauritanian', 'nouakchott'],
    'Mauritius': ['mauritian', 'port louis'],
    'Mexico': ['mexican', 'mexico city'],
    'Micronesia': ['micronesian', 'palikir'],
    'Moldova': ['moldovan', 'chisinau'],
    'Monaco': ['monegasque', 'monte carlo'],
    'Mongolia': ['mongolian', 'ulaanbaatar'],
    'Montenegro': ['montenegrin', 'podgorica'],
    'Morocco': ['moroccan', 'rabat', 'casablanca'],
    'Mozambique': ['mozambican', 'maputo'],
    'Myanmar': ['burmese', 'myanmar', 'yangon', 'junta'],
    'Namibia': ['namibian', 'windhoek'],
    'Nauru': ['nauruan'],
    'Nepal': ['nepali', 'nepalese', 'kathmandu'],
    'Netherlands': ['dutch', 'amsterdam', 'the hague'],
    'New Zealand': ['new zealand', 'kiwi', 'wellington'],
    'Nicaragua': ['nicaraguan', 'managua', 'ortega'],
    'Niger': ['nigerien', 'niamey'],
    'Nigeria': ['nigerian', 'lagos', 'abuja'],
    'North Korea': ['north korean', 'pyongyang', 'kim jong', 'dprk'],
    'North Macedonia': ['macedonian', 'skopje'],
    'Norway': ['norwegian', 'oslo'],
    'Oman': ['omani', 'muscat'],
    'Pakistan': ['pakistani', 'islamabad', 'karachi'],
    'Palau': ['palauan', 'ngerulmud'],
    'Palestine': ['palestinian', 'hamas', 'west bank', 'ramallah'],
    'Panama': ['panamanian', 'panama city'],
    'Papua New Guinea': ['papua new guinean', 'port moresby'],
    'Paraguay': ['paraguayan', 'asuncion'],
    'Peru': ['peruvian', 'lima'],
    'Philippines': ['filipino', 'philippine', 'manila', 'marcos'],
    'Poland': ['polish', 'warsaw'],
    'Portugal': ['portuguese', 'lisbon'],
    'Qatar': ['qatari', 'doha'],
    'Romania': ['romanian', 'bucharest'],
    'Russia': ['russian', 'moscow', 'kremlin', 'putin'],
    'Rwanda': ['rwandan', 'kigali'],
    'Saint Kitts and Nevis': ['kittitian', 'nevisian', 'basseterre'],
    'Saint Lucia': ['saint lucian', 'castries'],
    'Saint Vincent and the Grenadines': ['vincentian'],
    'Samoa': ['samoan', 'apia'],
    'San Marino': ['sammarinese'],
    'Sao Tome and Principe': ['santomean'],
    'Saudi Arabia': ['saudi', 'riyadh', 'mbs'],
    'Senegal': ['senegalese', 'dakar'],
    'Serbia': ['serbian', 'belgrade'],
    'Seychelles': ['seychellois', 'victoria'],
    'Sierra Leone': ['sierra leonean', 'freetown'],
    'Singapore': ['singaporean'],
    'Slovakia': ['slovak', 'bratislava'],
    'Slovenia': ['slovenian', 'ljubljana'],
    'Solomon Islands': ['solomon islander', 'honiara'],
    'Somalia': ['somali', 'mogadishu'],
    'South Africa': ['south african', 'johannesburg', 'pretoria', 'cape town'],
    'South Korea': ['south korean', 'seoul', 'korean'],
    'South Sudan': ['south sudanese', 'juba'],
    'Spain': ['spanish', 'madrid', 'barcelona'],
    'Sri Lanka': ['sri lankan', 'colombo'],
    'Sudan': ['sudanese', 'khartoum'],
    'Suriname': ['surinamese', 'paramaribo'],
    'Sweden': ['swedish', 'stockholm'],
    'Switzerland': ['swiss', 'bern', 'zurich', 'geneva'],
    'Syria': ['syrian', 'damascus', 'assad'],
    'Taiwan': ['taiwanese', 'taipei'],
    'Tajikistan': ['tajik', 'dushanbe'],
    'Tanzania': ['tanzanian', 'dodoma', 'dar es salaam'],
    'Thailand': ['thai', 'bangkok'],
    'Timor-Leste': ['timorese', 'east timor', 'dili'],
    'Togo': ['togolese', 'lome'],
    'Tonga': ['tongan', "nuku'alofa"],
    'Trinidad and Tobago': ['trinidadian', 'tobagonian', 'port of spain'],
    'Tunisia': ['tunisian', 'tunis'],
    'Turkey': ['turkish', 'ankara', 'istanbul', 'erdogan'],
    'Turkmenistan': ['turkmen', 'ashgabat'],
    'Tuvalu': ['tuvaluan', 'funafuti'],
    'Uganda': ['ugandan', 'kampala'],
    'Ukraine': ['ukrainian', 'kyiv', 'zelensky'],
    'United Arab Emirates': ['emirati', 'uae', 'dubai', 'abu dhabi'],
    'United Kingdom': ['british', 'uk', 'britain', 'london', 'parliament', 'westminster'],
    'United States': ['u.s.', 'american', 'washington', 'biden', 'trump', 'congress', 'white house', 'pentagon'],
    'Uruguay': ['uruguayan', 'montevideo'],
    'Uzbekistan': ['uzbek', 'tashkent'],
    'Vanuatu': ['ni-vanuatu', 'port vila'],
    'Venezuela': ['venezuelan', 'caracas', 'rodriguez', 'maduro'],
    'Vietnam': ['vietnamese', 'hanoi', 'ho chi minh'],
    'Yemen': ['yemeni', 'sanaa', 'houthi'],
    'Zambia': ['zambian', 'lusaka'],
    'Zimbabwe': ['zimbabwean', 'harare']
  };

  // Check if country name or demonym appears in title OR description
  const countryTerms = demonyms[countryName] || [countryLower];
  const allTerms = [countryLower, ...countryTerms];

  // Check title first (strongest signal)
  const inTitle = allTerms.some(term => titleLower.includes(term));
  if (inTitle) return true;

  // Also check description (weaker but still valid)
  const inDesc = allTerms.some(term => descLower.includes(term));
  return inDesc;
}

// Helper: format article array for display
function formatArticlesForDisplay(articles, countryName) {
  const relevant = articles.filter(a => isRelevantToCountry(a.title, a.description, countryName));
  const toUse = relevant.length > 0 ? relevant : articles;
  return toUse.slice(0, 15).map(article => ({
    headline: article.title,
    source: formatSourceName(article.source_id),
    time: timeAgo(article.pubDate),
    url: article.link || '',
    category: detectCategory(article.title, article.description)
  }));
}

// Helper: try a news API with timeout
async function tryNewsAPI(apiName, url, parseResults, timeoutMs = 8000) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) return null;
    const data = await response.json();
    const results = parseResults(data);
    if (results && results.length > 0) {
      console.log(`${apiName} returned ${results.length} results`);
      return results;
    }
  } catch (error) {
    console.warn(`${apiName} failed:`, error.message);
  }
  return null;
}

// Fetch country-specific news with smart caching and multi-source fallback
async function fetchCountryNews(countryName) {
  console.log(`Fetching news for ${countryName}...`);

  // 1. CHECK CACHE FIRST - avoid redundant API calls
  const cached = getCachedNews(countryName);
  if (cached) return cached;

  // 2. CHECK DAILY_BRIEFING - already-fetched global news may have relevant articles
  if (DAILY_BRIEFING && DAILY_BRIEFING.length > 0) {
    const briefingRelevant = DAILY_BRIEFING.filter(article =>
      isRelevantToCountry(article.title || article.headline, article.description || '', countryName)
    );
    if (briefingRelevant.length >= 2) {
      console.log(`Found ${briefingRelevant.length} relevant articles in DAILY_BRIEFING for ${countryName}`);
      const result = briefingRelevant.slice(0, 10).map(article => ({
        headline: article.title || article.headline,
        source: formatSourceName(article.source_id || article.source || 'News'),
        time: timeAgo(article.pubDate || article.time),
        url: article.link || article.url || '',
        category: article.category || detectCategory(article.title || article.headline, article.description || '')
      }));
      setCachedNews(countryName, result);
      return result;
    }
  }

  // 3. Try Google News RSS (free, unlimited)
  try {
    const googleNewsUrl = RSS_FEEDS.search(countryName + ' news');
    const articles = await fetchRSS(googleNewsUrl, 'Google News');
    if (articles && articles.length > 0) {
      console.log(`Google News RSS returned ${articles.length} results for ${countryName}`);
      const result = formatArticlesForDisplay(articles, countryName);
      if (result.length > 0) { setCachedNews(countryName, result); return result; }
    }
  } catch (error) {
    console.warn('Google News RSS failed:', error.message);
  }

  // 4. Try backup APIs in sequence (with timeout protection)
  const apiOrder = ['gnews', 'newsdata', 'mediastack'];
  for (const apiName of apiOrder) {
    const api = NEWS_APIS[apiName];
    if (!api || !api.key) continue;

    // Skip APIs that recently failed (backoff for 5 minutes)
    if (apiFailures[apiName] && (Date.now() - apiFailures[apiName]) < 5 * 60 * 1000) continue;

    const url = api.buildUrl(api.key, countryName);
    const results = await tryNewsAPI(apiName, url, api.parseResults);

    if (results) {
      const formatted = formatArticlesForDisplay(results, countryName);
      if (formatted.length > 0) { setCachedNews(countryName, formatted); return formatted; }
    } else {
      apiFailures[apiName] = Date.now(); // Mark this API as temporarily failed
    }
  }

  // 5. Try broader regional search via Google News
  try {
    const countryData = COUNTRIES[countryName];
    if (countryData && countryData.region) {
      const regionQuery = `${countryName} ${countryData.region} news`;
      const regionUrl = RSS_FEEDS.search(regionQuery);
      const articles = await fetchRSS(regionUrl, 'Google News');
      if (articles && articles.length > 0) {
        const result = formatArticlesForDisplay(articles, countryName);
        if (result.length > 0) { setCachedNews(countryName, result); return result; }
      }
    }
  } catch (error) {
    console.warn('Regional search failed:', error.message);
  }

  // 6. Last resort: pull any DAILY_BRIEFING articles (even just 1)
  if (DAILY_BRIEFING && DAILY_BRIEFING.length > 0) {
    const anyRelevant = DAILY_BRIEFING.filter(article =>
      isRelevantToCountry(article.title || article.headline, article.description || '', countryName)
    );
    if (anyRelevant.length > 0) {
      const result = anyRelevant.slice(0, 10).map(article => ({
        headline: article.title || article.headline,
        source: formatSourceName(article.source_id || article.source || 'News'),
        time: timeAgo(article.pubDate || article.time),
        url: article.link || article.url || '',
        category: article.category || detectCategory(article.title || article.headline, article.description || '')
      }));
      setCachedNews(countryName, result);
      return result;
    }
  }

  // 7. No news found from any source - cache the empty result too to avoid hammering APIs
  console.log(`No news found for ${countryName} from any source`);
  const emptyResult = [];
  setCachedNews(countryName, emptyResult);
  return emptyResult;
}

// Historical risk trends (Mar 2025 - Feb 2026) based on real events
// Values: 0-100 scale (100 = catastrophic)