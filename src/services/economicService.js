// economicService.js — Client-side fetch + localStorage cache for economic data

import { COUNTRY_CODES } from '../data/countryCodes';

const WORKER_BASE = 'https://hegemon-rss-proxy.hegemonglobal.workers.dev';

function cacheSet(key, data, ttlMs) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now(), ttl: ttlMs }));
  } catch { /* ignore */ }
}

function cacheGet(key) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    const c = JSON.parse(item);
    if (Date.now() - c.ts > c.ttl) {
      localStorage.removeItem(key);
      return null;
    }
    return c.data;
  } catch {
    return null;
  }
}

// Fetch all economic data (cached 30min)
export async function fetchEconomicData() {
  const cached = cacheGet('hegemon_econ_data');
  if (cached) return cached;

  try {
    const resp = await fetch(`${WORKER_BASE}/api/economic-data`);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const data = await resp.json();
    if (data && data.countries) {
      cacheSet('hegemon_econ_data', data, 1800000); // 30 min
    }
    return data;
  } catch (err) {
    console.warn('Economic data fetch failed:', err.message);
    return { countries: {} };
  }
}

// Fetch AI economic brief for a specific country (cached 24h)
export async function fetchEconomicBrief(alpha3Code) {
  const cacheKey = `hegemon_econ_brief_${alpha3Code}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  try {
    const resp = await fetch(`${WORKER_BASE}/api/economic-brief?country=${encodeURIComponent(alpha3Code)}`);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const data = await resp.json();
    if (data && data.snapshot) {
      cacheSet(cacheKey, data, 86400000); // 24h
    }
    return data;
  } catch (err) {
    console.warn('Economic brief fetch failed:', err.message);
    return { snapshot: '', risks: '', outlook: '' };
  }
}

// Pre-fetch briefs for top countries in background (fire-and-forget)
const PREFETCH_COUNTRIES = ['USA', 'CHN', 'IND', 'GBR', 'DEU', 'FRA', 'JPN', 'BRA', 'RUS', 'TUR', 'SAU', 'KOR', 'AUS', 'CAN', 'MEX', 'IDN', 'THA', 'ZAF', 'POL', 'VNM'];
let prefetchDone = false;
export function prefetchTopBriefs() {
  if (prefetchDone) return;
  prefetchDone = true;
  // Stagger requests to avoid hammering the worker
  PREFETCH_COUNTRIES.forEach((code, i) => {
    setTimeout(() => fetchEconomicBrief(code), i * 500);
  });
}

// Fetch economic news from server-side endpoint (cached 30min)
export async function fetchEconomicNews() {
  const cached = cacheGet('hegemon_econ_news');
  if (cached) return cached;

  try {
    const resp = await fetch(`${WORKER_BASE}/api/economic-news`);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const data = await resp.json();
    const articles = data.articles || [];
    if (articles.length > 0) {
      cacheSet('hegemon_econ_news', articles, 1800000); // 30 min
    }
    return articles;
  } catch (err) {
    console.warn('Economic news fetch failed:', err.message);
    return [];
  }
}

// Lookup helper: get economic data for a country by display name
export function getEconomicDataForCountry(econData, displayName) {
  if (!econData || !econData.countries) return null;
  const codes = COUNTRY_CODES[displayName];
  if (!codes) return null;
  return econData.countries[codes.alpha3] || null;
}
