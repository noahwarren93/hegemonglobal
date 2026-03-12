// HomePage.jsx - Main dashboard page combining all components

import { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { COUNTRIES } from '../data/countries';
import { RISK_COLORS } from '../utils/riskColors';
import CountryFlag from '../components/CountryFlag';
import { fetchLiveNews, initializeRiskState, computeStats, NEWS_REFRESH_INTERVAL, COUNTRY_DEMONYMS, loadNewsFromLocalStorage } from '../services/apiService';
import { loadStockData } from '../services/stocksService';

import GlobeView from '../components/Globe/GlobeView';
import Sidebar from '../components/Sidebar/Sidebar';
import TradeInfoPanel from '../components/TradeRoutes/TradeInfoPanel';
import { useTradeRoutes } from '../components/TradeRoutes/TradeRoutes';
import MilitaryInfoPanel from '../components/Military/MilitaryInfoPanel';
import MilitaryBasesPanel from '../components/Military/MilitaryBasesPanel';
import MilitaryCountryPopup from '../components/Military/MilitaryCountryPopup';
import { useMilitaryOverlay } from '../components/Military/MilitaryOverlay';
import ThreatGroupPanel from '../components/ThreatGroups/ThreatGroupPanel';
import { useThreatGroupOverlay } from '../components/ThreatGroups/ThreatGroupOverlay';
import { THREAT_TYPE_COLORS, THREAT_TYPE_LABELS } from '../data/threatGroupData';

const CountryModal = lazy(() => import('../components/Modals/CountryModal'));
const TOSModal = lazy(() => import('../components/Modals/TOSModal'));
const StocksModal = lazy(() => import('../components/Stocks/StocksModal'));
const ComparePanel = lazy(() => import('../components/Compare/ComparePanel'));

// ============================================================
// Search Overlay Component
// ============================================================

function SearchOverlay({ isOpen, onClose, onSelect }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) setQuery('');
  }, [isOpen]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const results = useMemo(() => {
    if (!query || query.length < 1) return [];
    const q = query.toLowerCase();
    return Object.entries(COUNTRIES)
      .filter(([name, c]) => {
        if (name.toLowerCase().includes(q)) return true;
        if (c.region.toLowerCase().includes(q)) return true;
        // Check demonyms/aliases (e.g. "gaza" → Palestine, "hamas" → Palestine)
        const aliases = COUNTRY_DEMONYMS[name];
        if (aliases && aliases.some(alias => alias.includes(q) || q.includes(alias))) return true;
        return false;
      })
      .slice(0, 12);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="search-overlay active">
      <div className="search-overlay-header">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search countries..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Enter' && results.length > 0) {
              onSelect(results[0][0]);
              onClose();
            }
          }}
        />
        <button onClick={onClose}>&times;</button>
      </div>
      <div className="search-overlay-results">
        {results.map(([name, c]) => (
          <div
            key={name}
            className="search-overlay-item"
            onClick={() => { onSelect(name); onClose(); }}
          >
            <span><CountryFlag flag={c.flag} /> {name}</span>
            <span style={{ fontSize: '9px', color: RISK_COLORS[c.risk]?.hex || '#888' }}>
              {c.risk.toUpperCase()}
            </span>
          </div>
        ))}
        {query && results.length === 0 && (
          <div style={{ padding: '12px', color: '#6b7280', fontSize: '11px', textAlign: 'center' }}>
            No countries found
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Stats Bar Component
// ============================================================

function StatsBar({ onStatClick }) {
  const stats = useMemo(() => computeStats(), []);
  const total = Object.keys(COUNTRIES).length;

  return (
    <div className="stats">
      <div className="stat-card" onClick={() => onStatClick && onStatClick('critical')}>
        <div className="stat-value" style={{ color: '#ef4444' }}>{stats.critical}</div>
        <div className="stat-label">Critical</div>
      </div>
      <div className="stat-card" onClick={() => onStatClick && onStatClick('high')}>
        <div className="stat-value" style={{ color: '#f97316' }}>{stats.high}</div>
        <div className="stat-label">High Risk</div>
      </div>
      <div className="stat-card" onClick={() => onStatClick && onStatClick('stable')}>
        <div className="stat-value" style={{ color: '#22c55e' }}>{stats.stable}</div>
        <div className="stat-label">Stable</div>
      </div>
      <div className="stat-card" onClick={() => onStatClick && onStatClick('total')}>
        <div className="stat-value" style={{ color: '#06b6d4' }}>{total}</div>
        <div className="stat-label">Total</div>
      </div>
    </div>
  );
}

// ============================================================
// Stat Popup Component (country list by risk level)
// ============================================================

function StatPopup({ type, isOpen, onClose, onCountryClick }) {
  const popupRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e) {
      if (popupRef.current && !popupRef.current.contains(e.target) && !e.target.closest('.stat-card')) {
        onClose();
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isOpen, onClose]);

  const { title, color, countries } = useMemo(() => {
    let title, color, filtered;
    if (type === 'critical') {
      title = 'Critical Countries';
      color = '#ef4444';
      filtered = Object.entries(COUNTRIES).filter(([, c]) => c.risk === 'catastrophic' || c.risk === 'extreme');
    } else if (type === 'high') {
      title = 'High Risk Countries';
      color = '#f97316';
      filtered = Object.entries(COUNTRIES).filter(([, c]) => c.risk === 'severe' || c.risk === 'stormy');
    } else if (type === 'stable') {
      title = 'Stable Countries';
      color = '#22c55e';
      filtered = Object.entries(COUNTRIES).filter(([, c]) => c.risk === 'cloudy' || c.risk === 'clear');
    } else {
      title = 'All Countries';
      color = '#06b6d4';
      filtered = Object.entries(COUNTRIES);
    }
    const riskOrder = { catastrophic: 0, extreme: 1, severe: 2, stormy: 3, cloudy: 4, clear: 5 };
    filtered.sort((a, b) => {
      const tierDiff = (riskOrder[a[1].risk] ?? 6) - (riskOrder[b[1].risk] ?? 6);
      if (tierDiff !== 0) return tierDiff;
      return a[0].localeCompare(b[0]);
    });
    return { title, color, countries: filtered };
  }, [type]);

  return (
    <div ref={popupRef} className={`stat-popup${isOpen ? ' active' : ''}`}>
      <div className="stat-popup-header">
        <div className="stat-popup-title" style={{ color }}>{title}</div>
        <button className="stat-popup-close" onClick={onClose}>&times;</button>
      </div>
      {countries.map(([name, c]) => (
        <div
          key={name}
          className="stat-popup-item"
          onClick={() => { onCountryClick(name); onClose(); }}
        >
          <span><CountryFlag flag={c.flag} /> {name}</span>
          <span
            className={`wl-risk risk-${c.risk}`}
            style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '3px', fontWeight: 600, textTransform: 'uppercase' }}
          >
            {c.risk}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Watchlist Component
// ============================================================

function Watchlist({ onCountryClick, tradeRoutesActive, onToggleTradeRoutes, compareMode, onToggleCompare, compareCountries, militaryMode, onToggleMilitary, threatGroupsActive, onToggleThreatGroups }) {
  const watchlistCountries = useMemo(() => {
    return Object.entries(COUNTRIES)
      .filter(([, c]) => c.risk === 'catastrophic' || c.risk === 'extreme')
      .sort((a, b) => {
        const tierDiff = ({ catastrophic: 0, extreme: 1 }[a[1].risk] || 0) - ({ catastrophic: 0, extreme: 1 }[b[1].risk] || 0);
        return tierDiff !== 0 ? tierDiff : a[0].localeCompare(b[0]);
      });
  }, []);

  return (
    <div className="watchlist" style={{ maxHeight: 'none', overflow: 'visible' }}>
      <div className="watchlist-title">CRITICAL WATCHLIST</div>
      <div style={{ maxHeight: 220, overflowY: 'auto' }}>
        {watchlistCountries.map(([name, c]) => (
          <div key={name} className="watchlist-item" onClick={() => onCountryClick(name)}>
            <span className="wl-country"><CountryFlag flag={c.flag} /> {name}</span>
            <span className={`wl-risk risk-${c.risk}`} style={{ color: '#fff' }}>{c.risk.toUpperCase()}</span>
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid #1f293766', paddingTop: 8, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button className={`globe-feature-btn${tradeRoutesActive ? ' active' : ''}`} onClick={onToggleTradeRoutes}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          Trade Routes
        </button>
        <button className={`globe-feature-btn${compareMode ? ' active' : ''}`} onClick={onToggleCompare} style={{ position: 'relative' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          Compare Mode
          {compareMode && compareCountries.length === 0 && (
            <div className="compare-hint">Click countries on the globe to compare</div>
          )}
        </button>
        <button className={`globe-feature-btn${militaryMode ? ' active' : ''}`} onClick={onToggleMilitary}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7v6c0 5.55 4.84 10.74 10 12 5.16-1.26 10-6.45 10-12V7l-10-5z"/></svg>
          Military
        </button>
        <button className={`globe-feature-btn${threatGroupsActive ? ' active' : ''}`} onClick={onToggleThreatGroups}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Non-State Actors
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Risk Legend Component
// ============================================================

function RiskLegend() {
  const levels = [
    { name: 'Catastrophic', color: '#dc2626' },
    { name: 'Extreme', color: '#f97316' },
    { name: 'Severe', color: '#eab308' },
    { name: 'Stormy', color: '#8b5cf6' },
    { name: 'Cloudy', color: '#3b82f6' },
    { name: 'Clear', color: '#22c55e' }
  ];

  return (
    <div className="legend">
      <div className="legend-title">RISK LEVELS</div>
      <div className="legend-items">
        {levels.map(level => (
          <div key={level.name} className="legend-item">
            <div className="legend-icon" style={{ background: level.color }} />
            {level.name}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Nuclear Arsenals Box (desktop, replaces legend in military mode)
// ============================================================

const NUCLEAR_ARSENALS = [
  { country: 'Russia', flag: '\u{1F1F7}\u{1F1FA}', warheads: '~5,580' },
  { country: 'United States', flag: '\u{1F1FA}\u{1F1F8}', warheads: '~5,044' },
  { country: 'China', flag: '\u{1F1E8}\u{1F1F3}', warheads: '~500' },
  { country: 'France', flag: '\u{1F1EB}\u{1F1F7}', warheads: '~290' },
  { country: 'United Kingdom', flag: '\u{1F1EC}\u{1F1E7}', warheads: '~225' },
  { country: 'India', flag: '\u{1F1EE}\u{1F1F3}', warheads: '~172' },
  { country: 'Pakistan', flag: '\u{1F1F5}\u{1F1F0}', warheads: '~170' },
  { country: 'Israel', flag: '\u{1F1EE}\u{1F1F1}', warheads: '~90*' },
  { country: 'North Korea', flag: '\u{1F1F0}\u{1F1F5}', warheads: '~50' },
];

function NuclearArsenalsBox() {
  return (
    <div className="nuclear-arsenals-box">
      <div className="nuclear-arsenals-title">{'\u2622'} NUCLEAR ARSENALS</div>
      {NUCLEAR_ARSENALS.map(n => (
        <div key={n.country} className="nuclear-arsenals-row">
          <span>{n.flag}</span>
          <span>{n.country}</span>
          <span className="nuclear-arsenals-count">{n.warheads}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// HomePage Component
// ============================================================

export default function HomePage() {
  // --- Core state ---
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [tosOpen, setTosOpen] = useState(false);

  // --- Compare mode ---
  const [compareMode, setCompareMode] = useState(false);
  const [compareCountries, setCompareCountries] = useState([]);

  // --- Trade routes ---
  const [tradeRoutesActive, setTradeRoutesActive] = useState(false);
  const [tradeInfoCountry, setTradeInfoCountry] = useState(null);
  const [tradeInfoOpen, setTradeInfoOpen] = useState(false);

  // --- Military overlay ---
  const [militaryMode, setMilitaryMode] = useState(false);
  const [militaryPanelOpen, setMilitaryPanelOpen] = useState(false);
  const [militaryInfoOpen, setMilitaryInfoOpen] = useState(false);
  const [selectedInstallation, setSelectedInstallation] = useState(null);
  const [milCountryPopupOpen, setMilCountryPopupOpen] = useState(false);
  const [milCountryPopupName, setMilCountryPopupName] = useState(null);

  // --- Threat groups overlay ---
  const [threatGroupsActive, setThreatGroupsActive] = useState(false);
  const [selectedThreatGroup, setSelectedThreatGroup] = useState(null);
  const [threatGroupPanelOpen, setThreatGroupPanelOpen] = useState(false);

  // --- Search ---
  const [searchOpen, setSearchOpen] = useState(false);

  // --- Stocks modal ---
  const [stocksModalOpen, setStocksModalOpen] = useState(false);
  const [stocksModalCountry, setStocksModalCountry] = useState(null);
  const [stocksData, setStocksData] = useState(null);
  const [stocksLastUpdated, setStocksLastUpdated] = useState(null);
  const [stocksUpdating, setStocksUpdating] = useState(false);

  // --- Stat popup ---
  const [statPopupType, setStatPopupType] = useState(null);
  const [statPopupOpen, setStatPopupOpen] = useState(false);

  // --- Loading ---
  const [, setIsLoading] = useState(true);

  // --- Splash screen ---
  const [splashVisible, setSplashVisible] = useState(true);
  const [splashFading, setSplashFading] = useState(false);

  // --- Auto-rotate ---
  const [autoRotate, setAutoRotate] = useState(false);

  // --- Date display ---
  const [currentDate, setCurrentDate] = useState('');

  // --- Trade routes hook ---
  const { showTradeRoutes, hideTradeRoutes, handleTradeClick, highlightedCountryRef } = useTradeRoutes();

  // --- Military overlay hook ---
  const { showMilitary, hideMilitary } = useMilitaryOverlay();

  // --- Threat groups overlay hook ---
  const { showThreatGroups, hideThreatGroups } = useThreatGroupOverlay();

  // ============================================================
  // Initialize on mount
  // ============================================================

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    // Initialize risk state
    initializeRiskState();

    // Update date display
    const now = new Date();
    setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));

    // Splash: dismiss early if globe is ready, hard cap at 5s no matter what
    let splashDismissed = false;
    const dismissSplash = () => {
      if (splashDismissed) return;
      splashDismissed = true;
      setSplashFading(true);
      setTimeout(() => setSplashVisible(false), 400);
    };

    // Early dismiss: globe ready + 1.5s minimum
    let globeReady = false;
    let minTimePassed = false;
    const checkEarlyDismiss = () => {
      if (globeReady && minTimePassed) dismissSplash();
    };
    const handleGlobeReady = () => { globeReady = true; checkEarlyDismiss(); };
    window.addEventListener('globeReady', handleGlobeReady);
    const minTimer = setTimeout(() => { minTimePassed = true; checkEarlyDismiss(); }, 1500);

    // Hard cap: 5 seconds, dismiss no matter what
    const hardCapTimer = setTimeout(dismissSplash, 5000);

    // Load cached news immediately (no splash dependency)
    const hasCached = loadNewsFromLocalStorage();
    if (hasCached) setIsLoading(false);

    // Load stocks (no splash dependency)
    const stockCallback = ({ data, lastUpdated, isUpdating }) => {
      setStocksData(data);
      setStocksLastUpdated(lastUpdated);
      setStocksUpdating(!!isUpdating);
    };
    loadStockData(stockCallback);

    // Fetch news immediately (pre-generated events from Worker are instant)
    fetchLiveNews({
      onStatusUpdate: (status) => {
        if (status === 'fetching' && !hasCached) setIsLoading(true);
      },
      onComplete: () => setIsLoading(false)
    });

    // Auto-refresh news
    const newsInterval = setInterval(() => {
      fetchLiveNews();
    }, NEWS_REFRESH_INTERVAL);

    const stocksInterval = setInterval(() => {
      loadStockData(stockCallback);
    }, 300000);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(hardCapTimer);
      clearInterval(newsInterval);
      clearInterval(stocksInterval);
      window.removeEventListener('globeReady', handleGlobeReady);
    };
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // ============================================================
  // Sync compare mode to globe meshes (matching original addCountryToCompare/removeCountryFromCompare)
  // ============================================================

  const COMPARE_COLORS = useMemo(() => ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7'], []);

  useEffect(() => {
    const gv = window._globeView;
    if (!gv || !gv.countryMeshes) return;
    const meshes = gv.countryMeshes;
    if (compareMode) {
      meshes.forEach(m => {
        const idx = compareCountries.indexOf(m.userData.name);
        if (idx >= 0) {
          m.material.color.set(COMPARE_COLORS[idx]);
          m.material.opacity = 1.0;
        } else {
          m.material.opacity = compareCountries.length > 0 ? 0.3 : 0.95;
          if (m.userData.data && RISK_COLORS[m.userData.data.risk]) {
            m.material.color.set(RISK_COLORS[m.userData.data.risk].glow);
          }
        }
      });
    } else {
      // Restore original colors/opacity
      meshes.forEach(m => {
        m.material.opacity = 0.95;
        if (m.userData.data && RISK_COLORS[m.userData.data.risk]) {
          m.material.color.set(RISK_COLORS[m.userData.data.risk].glow);
        }
      });
    }
  }, [compareMode, compareCountries, COMPARE_COLORS]);

  // Country dot hiding is handled directly in MilitaryOverlay.js showMilitary/hideMilitary

  // Register military click callback on window
  useEffect(() => {
    window._onMilitaryClick = (installation) => {
      setSelectedInstallation(installation);
      setMilitaryInfoOpen(true);
    };
    return () => { delete window._onMilitaryClick; };
  }, []);

  // Register military country click callback on window
  useEffect(() => {
    window._onMilitaryCountryClick = (countryName) => {
      setMilCountryPopupName(countryName);
      setMilCountryPopupOpen(true);
    };
    return () => { delete window._onMilitaryCountryClick; };
  }, []);

  // Register threat group click callback on window
  useEffect(() => {
    window._onThreatGroupClick = (group) => {
      setSelectedThreatGroup(group);
      setThreatGroupPanelOpen(true);
    };
    return () => { delete window._onThreatGroupClick; };
  }, []);

  // ============================================================
  // Handlers
  // ============================================================

  // Country click from globe or sidebar
  const handleCountryClick = useCallback((countryName) => {
    if (!countryName || !COUNTRIES[countryName]) return;

    // Military mode: block all country interactions
    if (militaryMode) return;

    // Non-state actors mode: block all country interactions
    if (threatGroupsActive) return;

    // Compare mode: toggle or add to comparison (matching original addCountryToCompare)
    if (compareMode) {
      setCompareCountries(prev => {
        // Toggle off if already selected
        if (prev.includes(countryName)) {
          return prev.filter(c => c !== countryName);
        }
        // Shift oldest if already 5
        if (prev.length >= 5) {
          return [...prev.slice(1), countryName];
        }
        return [...prev, countryName];
      });
      return;
    }

    // Trade routes mode: highlight country routes
    if (tradeRoutesActive) {
      const result = handleTradeClick(countryName, true);
      if (result) {
        if (result.highlighted) {
          setTradeInfoCountry(countryName);
          setTradeInfoOpen(true);
        } else {
          setTradeInfoCountry(null);
          setTradeInfoOpen(false);
        }
        return;
      }
    }

    // Default: open country modal
    setSelectedCountry(countryName);
    setModalOpen(true);
  }, [compareMode, tradeRoutesActive, militaryMode, threatGroupsActive, handleTradeClick]);

  // Open modal by type
  // Open stocks detail modal
  const handleOpenStocksModal = useCallback((country) => {
    setStocksModalCountry(country);
    setStocksModalOpen(true);
  }, []);

  // Toggle trade routes
  const handleToggleTradeRoutes = useCallback(() => {
    const newState = !tradeRoutesActive;
    setTradeRoutesActive(newState);
    window.tradeRoutesActive = newState;
    if (newState) {
      // Deactivate compare mode, military mode, and threat groups
      setCompareMode(false);
      setCompareCountries([]);
      if (militaryMode) {
        setMilitaryMode(false);
        hideMilitary();
        setMilitaryInfoOpen(false);
        setSelectedInstallation(null);
        setMilCountryPopupOpen(false);
        setMilCountryPopupName(null);
      }
      if (threatGroupsActive) {
        setThreatGroupsActive(false);
        hideThreatGroups();
        setThreatGroupPanelOpen(false);
        setSelectedThreatGroup(null);
      }
      showTradeRoutes();
    } else {
      hideTradeRoutes();
      setTradeInfoCountry(null);
      setTradeInfoOpen(false);
    }
  }, [tradeRoutesActive, militaryMode, threatGroupsActive, showTradeRoutes, hideTradeRoutes, hideMilitary, hideThreatGroups]);

  // Toggle compare mode
  const handleToggleCompare = useCallback(() => {
    setCompareMode(prev => {
      if (prev) {
        // Turning off
        setCompareCountries([]);
        return false;
      }
      // Turning on — deactivate trade routes, military, and threat groups
      if (tradeRoutesActive) {
        setTradeRoutesActive(false);
        window.tradeRoutesActive = false;
        hideTradeRoutes();
        setTradeInfoCountry(null);
        setTradeInfoOpen(false);
      }
      if (militaryMode) {
        setMilitaryMode(false);
        setMilitaryPanelOpen(false);
        hideMilitary();
        setMilitaryInfoOpen(false);
        setSelectedInstallation(null);
        setMilCountryPopupOpen(false);
        setMilCountryPopupName(null);
      }
      if (threatGroupsActive) {
        setThreatGroupsActive(false);
        hideThreatGroups();
        setThreatGroupPanelOpen(false);
        setSelectedThreatGroup(null);
      }
      return true;
    });
  }, [tradeRoutesActive, militaryMode, threatGroupsActive, hideTradeRoutes, hideMilitary, hideThreatGroups]);

  // Toggle military overlay
  const handleToggleMilitary = useCallback(() => {
    const newState = !militaryMode;
    setMilitaryMode(newState);
    if (newState) {
      // Deactivate trade routes, compare mode, and threat groups
      if (tradeRoutesActive) {
        setTradeRoutesActive(false);
        window.tradeRoutesActive = false;
        hideTradeRoutes();
        setTradeInfoCountry(null);
        setTradeInfoOpen(false);
      }
      if (compareMode) {
        setCompareMode(false);
        setCompareCountries([]);
      }
      if (threatGroupsActive) {
        setThreatGroupsActive(false);
        hideThreatGroups();
        setThreatGroupPanelOpen(false);
        setSelectedThreatGroup(null);
      }
      showMilitary();
      setMilitaryPanelOpen(true);
    } else {
      hideMilitary();
      setMilitaryPanelOpen(false);
      setMilitaryInfoOpen(false);
      setSelectedInstallation(null);
      setMilCountryPopupOpen(false);
      setMilCountryPopupName(null);
    }
  }, [militaryMode, tradeRoutesActive, compareMode, threatGroupsActive, showMilitary, hideMilitary, hideTradeRoutes, hideThreatGroups]);

  // Toggle threat groups overlay
  const handleToggleThreatGroups = useCallback(() => {
    const newState = !threatGroupsActive;
    setThreatGroupsActive(newState);
    if (newState) {
      // Deactivate other overlays
      if (tradeRoutesActive) {
        setTradeRoutesActive(false);
        window.tradeRoutesActive = false;
        hideTradeRoutes();
        setTradeInfoCountry(null);
        setTradeInfoOpen(false);
      }
      if (compareMode) {
        setCompareMode(false);
        setCompareCountries([]);
      }
      if (militaryMode) {
        setMilitaryMode(false);
        setMilitaryPanelOpen(false);
        hideMilitary();
        setMilitaryInfoOpen(false);
        setSelectedInstallation(null);
        setMilCountryPopupOpen(false);
        setMilCountryPopupName(null);
      }
      showThreatGroups();
    } else {
      hideThreatGroups();
      setThreatGroupPanelOpen(false);
      setSelectedThreatGroup(null);
    }
  }, [threatGroupsActive, tradeRoutesActive, compareMode, militaryMode, showThreatGroups, hideThreatGroups, hideTradeRoutes, hideMilitary]);

  // Fly globe to a lat/lng and open military info panel
  const handleMilitaryBaseSelect = useCallback((installation) => {
    // Fly the globe to the installation
    const globe = window._globeView?.globe;
    const camera = window._globeView?.camera;
    if (globe && camera) {
      const targetRotX = installation.lat * Math.PI / 180;
      const targetRotY = -(installation.lng * Math.PI / 180) - Math.PI / 2;
      const startRotX = globe.rotation.x;
      const startRotY = globe.rotation.y;
      const startZ = camera.position.z;
      const targetZ = 2.2;
      const startTime = Date.now();
      const duration = 800;
      function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
      function animate() {
        const elapsed = Date.now() - startTime;
        const t = Math.min(1, elapsed / duration);
        const e = easeOut(t);
        globe.rotation.x = startRotX + (targetRotX - startRotX) * e;
        let diffY = targetRotY - startRotY;
        while (diffY > Math.PI) diffY -= 2 * Math.PI;
        while (diffY < -Math.PI) diffY += 2 * Math.PI;
        globe.rotation.y = startRotY + diffY * e;
        camera.position.z = startZ + (targetZ - startZ) * e;
        if (t < 1) requestAnimationFrame(animate);
      }
      animate();
    }
    // Open info panel
    setSelectedInstallation(installation);
    setMilitaryInfoOpen(true);
  }, []);

  // Compare panel handlers
  const handleAddCompareCountry = useCallback((name) => {
    setCompareCountries(prev => {
      if (prev.includes(name) || prev.length >= 5) return prev;
      return [...prev, name];
    });
  }, []);

  const handleRemoveCompareCountry = useCallback((name) => {
    setCompareCountries(prev => {
      const next = prev.filter(c => c !== name);
      if (next.length === 0) setCompareMode(false);
      return next;
    });
  }, []);

  const handleCloseCompare = useCallback(() => {
    setCompareMode(false);
    setCompareCountries([]);
  }, []);

  // Toggle auto-rotate
  const handleToggleRotate = useCallback(() => {
    if (window._globeView && window._globeView.toggleRotation) {
      const newState = window._globeView.toggleRotation();
      setAutoRotate(newState);
    }
  }, []);

  // Keyboard shortcut: Escape closes everything
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        if (searchOpen) { setSearchOpen(false); return; }
        if (threatGroupPanelOpen) { setThreatGroupPanelOpen(false); setSelectedThreatGroup(null); return; }
        if (milCountryPopupOpen) { setMilCountryPopupOpen(false); setMilCountryPopupName(null); return; }
        if (militaryInfoOpen) { setMilitaryInfoOpen(false); setSelectedInstallation(null); return; }
        if (statPopupOpen) { setStatPopupOpen(false); return; }
        if (stocksModalOpen) { setStocksModalOpen(false); return; }
        if (modalOpen) { setModalOpen(false); return; }
        if (tosOpen) { setTosOpen(false); return; }
        if (tradeInfoOpen) { setTradeInfoOpen(false); return; }
      }
      // Ctrl/Cmd+K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [searchOpen, threatGroupPanelOpen, milCountryPopupOpen, militaryInfoOpen, statPopupOpen, stocksModalOpen, modalOpen, tosOpen, tradeInfoOpen]);

  // ============================================================
  // Render
  // ============================================================

  return (
    <>
      {splashVisible && (
        <div className={`splash-screen${splashFading ? ' fade-out' : ''}`}>
          <div className="splash-content">
            <div className="splash-logo">HEGEMON</div>
            <div className="splash-subtitle">GLOBAL RISK MONITOR</div>
            <div className="splash-progress">
              <div className="splash-progress-bar" />
            </div>
          </div>
        </div>
      )}
      <div className="app">
        {/* ===== Globe Area (left) ===== */}
        <div className="globe-container">
          {/* Globe */}
          <GlobeView
            onCountryClick={handleCountryClick}
            compareMode={compareMode}
          />

          {/* Header */}
          <div className="header">
            <div className="header-content">
              <div>
                <div className="logo">HEGEMON</div>
                <div className="logo-sub">GLOBAL INTELLIGENCE NETWORK</div>
              </div>
            </div>
          </div>

          {/* Header Right - LIVE + Date */}
          <div className="header-right">
            <div className="live">
              <div className="live-dot" />
              LIVE
            </div>
            <div className="date">{currentDate}</div>
          </div>

          {/* Watchlist + Feature Buttons */}
          <Watchlist
            onCountryClick={handleCountryClick}
            tradeRoutesActive={tradeRoutesActive}
            onToggleTradeRoutes={handleToggleTradeRoutes}
            compareMode={compareMode}
            onToggleCompare={handleToggleCompare}
            compareCountries={compareCountries}
            militaryMode={militaryMode}
            onToggleMilitary={handleToggleMilitary}
            threatGroupsActive={threatGroupsActive}
            onToggleThreatGroups={handleToggleThreatGroups}
          />

          {/* Risk Legend (hidden when non-state actors overlay is active) */}
          {!threatGroupsActive && <RiskLegend />}

          {/* Mobile Feature Buttons (hidden on desktop, shown ≤768px above stats bar) */}
          <div className="mobile-feature-btns">
            <button className={`globe-feature-btn${tradeRoutesActive ? ' active' : ''}`} onClick={handleToggleTradeRoutes}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              Trade Routes
            </button>
            <button className={`globe-feature-btn${compareMode ? ' active' : ''}`} onClick={handleToggleCompare} style={{ position: 'relative' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              Compare
              {compareMode && compareCountries.length === 0 && (
                <div className="compare-hint">Tap countries to compare</div>
              )}
            </button>
            <button className={`globe-feature-btn${militaryMode ? ' active' : ''}`} onClick={handleToggleMilitary}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7v6c0 5.55 4.84 10.74 10 12 5.16-1.26 10-6.45 10-12V7l-10-5z"/></svg>
              Military
            </button>
            <button className={`globe-feature-btn${threatGroupsActive ? ' active' : ''}`} onClick={handleToggleThreatGroups}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Actors
            </button>
          </div>

          {/* Globe Tools (bottom-right) */}
          <div className="globe-tools">
            <button
              className="globe-tool-btn"
              onClick={() => setTosOpen(true)}
              title="Terms of Service"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </button>
            <button
              className={`globe-tool-btn${searchOpen ? ' active' : ''}`}
              onClick={() => setSearchOpen(prev => !prev)}
              title="Search Countries (Ctrl+K)"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </button>
            <button
              className={`globe-tool-btn globe-tool-btn-labeled${autoRotate ? ' active' : ''}`}
              onClick={handleToggleRotate}
              title="Toggle Auto-Rotate"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4m0 12v4M2 12h4m12 0h4m-5.66-5.66l-2.83 2.83m-5.66 5.66l-2.83 2.83m0-11.32l2.83 2.83m5.66 5.66l2.83 2.83"/>
              </svg>
              Rotate
            </button>
          </div>

          {/* Search Overlay */}
          <SearchOverlay
            isOpen={searchOpen}
            onClose={() => setSearchOpen(false)}
            onSelect={handleCountryClick}
          />

          {/* Trade Info Panel */}
          <TradeInfoPanel
            country={tradeInfoCountry}
            isOpen={tradeInfoOpen}
            onClose={() => {
              setTradeInfoOpen(false);
              setTradeInfoCountry(null);
              // Reset trade routes to full visibility (undo highlight dimming)
              if (tradeRoutesActive) {
                highlightedCountryRef.current = null;
                showTradeRoutes();
              }
            }}
          />

          {/* Military Bases List Panel */}
          <MilitaryBasesPanel
            isOpen={militaryMode && militaryPanelOpen}
            onClose={handleToggleMilitary}
            onBaseSelect={handleMilitaryBaseSelect}
          />

          {/* Military Info Panel (individual base detail) */}
          <MilitaryInfoPanel
            installation={selectedInstallation}
            isOpen={militaryInfoOpen}
            onClose={() => { setMilitaryInfoOpen(false); setSelectedInstallation(null); }}
          />

          {/* Military Country Popup */}
          <MilitaryCountryPopup
            countryName={milCountryPopupName}
            isOpen={milCountryPopupOpen}
            onClose={() => { setMilCountryPopupOpen(false); setMilCountryPopupName(null); }}
          />

          {/* Threat Group Panel */}
          <ThreatGroupPanel
            group={selectedThreatGroup}
            isOpen={threatGroupPanelOpen}
            onClose={() => { setThreatGroupPanelOpen(false); setSelectedThreatGroup(null); }}
          />

          {/* Threat Groups Legend */}
          {threatGroupsActive && (
            <div className="threat-legend">
              <div className="threat-legend-title">NON-STATE ACTORS</div>
              {Object.entries(THREAT_TYPE_COLORS).map(([type, color]) => (
                <div key={type} className="threat-legend-item">
                  <div className="threat-legend-dot" style={{ background: color }} />
                  {THREAT_TYPE_LABELS[type]}
                </div>
              ))}
            </div>
          )}

          {/* Stat Popup */}
          <StatPopup
            type={statPopupType}
            isOpen={statPopupOpen}
            onClose={() => setStatPopupOpen(false)}
            onCountryClick={(name) => {
              setSelectedCountry(name);
              setModalOpen(true);
            }}
          />

          {/* Stats Bar */}
          <StatsBar onStatClick={(type) => {
            setStatPopupType(type);
            setStatPopupOpen(prev => prev && statPopupType === type ? false : true);
          }} />
        </div>

        {/* ===== Sidebar (right) ===== */}
        <Sidebar
          onCountryClick={handleCountryClick}
          onOpenStocksModal={handleOpenStocksModal}
          stocksData={stocksData}
          stocksLastUpdated={stocksLastUpdated}
          stocksUpdating={stocksUpdating}
          militaryMode={militaryMode}
        />
      </div>

      {/* ===== Modals (lazy loaded) ===== */}
      <Suspense fallback={null}>
        {modalOpen && (
          <CountryModal
            countryName={selectedCountry}
            isOpen={modalOpen}
            onClose={() => { setModalOpen(false); setSelectedCountry(null); }}
          />
        )}

        {tosOpen && (
          <TOSModal
            isOpen={tosOpen}
            onClose={() => setTosOpen(false)}
          />
        )}

        {stocksModalOpen && (
          <StocksModal
            country={stocksModalCountry}
            stocksData={stocksData}
            lastUpdated={stocksLastUpdated}
            isOpen={stocksModalOpen}
            onClose={() => { setStocksModalOpen(false); setStocksModalCountry(null); }}
          />
        )}

        {/* Compare Panel */}
        {compareMode && compareCountries.length > 0 && (
          <ComparePanel
            isActive={true}
            countries={compareCountries}
            onClose={handleCloseCompare}
            onAddCountry={handleAddCompareCountry}
            onRemoveCountry={handleRemoveCompareCountry}
          />
        )}
      </Suspense>
    </>
  );
}
