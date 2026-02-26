// HomePage.jsx - Main dashboard page combining all components

import { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { COUNTRIES } from '../data/countries';
import { RISK_COLORS } from '../utils/riskColors';
import { fetchLiveNews, initializeRiskState, computeStats, NEWS_REFRESH_INTERVAL, COUNTRY_DEMONYMS, loadNewsFromLocalStorage } from '../services/apiService';
import { loadStockData } from '../services/stocksService';

import GlobeView from '../components/Globe/GlobeView';
import Sidebar from '../components/Sidebar/Sidebar';
import TradeInfoPanel from '../components/TradeRoutes/TradeInfoPanel';
import { useTradeRoutes } from '../components/TradeRoutes/TradeRoutes';

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
            <span>{c.flag} {name}</span>
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
          <span>{c.flag} {name}</span>
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

function Watchlist({ onCountryClick, tradeRoutesActive, onToggleTradeRoutes, compareMode, onToggleCompare, compareCountries, collapsed, onToggle }) {
  const watchlistCountries = useMemo(() => {
    return Object.entries(COUNTRIES)
      .filter(([, c]) => c.risk === 'catastrophic' || c.risk === 'extreme')
      .sort((a, b) => {
        const tierDiff = ({ catastrophic: 0, extreme: 1 }[a[1].risk] || 0) - ({ catastrophic: 0, extreme: 1 }[b[1].risk] || 0);
        return tierDiff !== 0 ? tierDiff : a[0].localeCompare(b[0]);
      });
  }, []);

  if (collapsed) {
    return (
      <button className="watchlist-pill" onClick={onToggle}>
        <span style={{ fontSize: '13px' }}>&#9888;&#65039;</span>
        {watchlistCountries.length} Critical
      </button>
    );
  }

  return (
    <div className="watchlist" style={{ maxHeight: 'none', overflow: 'visible' }}>
      <div className="watchlist-title">CRITICAL WATCHLIST</div>
      <div style={{ maxHeight: 220, overflowY: 'auto' }}>
        {watchlistCountries.map(([name, c]) => (
          <div key={name} className="watchlist-item" onClick={() => onCountryClick(name)}>
            <span className="wl-country">{c.flag} {name}</span>
            <span className={`wl-risk risk-${c.risk}`} style={{ color: '#fff' }}>{c.risk.toUpperCase()}</span>
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid #1f293766', paddingTop: 8, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button className={`globe-feature-btn${tradeRoutesActive ? ' active' : ''}`} onClick={onToggleTradeRoutes}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          Trade Routes
        </button>
        <button className={`globe-feature-btn${compareMode ? ' active' : ''}`} onClick={onToggleCompare}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          Compare Mode
        </button>
        {compareMode && compareCountries.length === 0 && (
          <div className="compare-hint" style={{ marginTop: 4 }}>Click countries on the globe to compare</div>
        )}
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
  const [autoRotate, setAutoRotate] = useState(true);

  // --- Watchlist collapse (responsive) ---
  const [watchlistCollapsed, setWatchlistCollapsed] = useState(() => {
    return window.matchMedia('(max-width: 1200px)').matches;
  });

  // --- Date display ---
  const [currentDate, setCurrentDate] = useState('');

  // --- Trade routes hook ---
  const { showTradeRoutes, hideTradeRoutes, handleTradeClick, highlightedCountryRef } = useTradeRoutes();

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

  // Responsive: collapse watchlist at 1200px
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 1200px)');
    const handler = (e) => setWatchlistCollapsed(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

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

  // ============================================================
  // Handlers
  // ============================================================

  // Country click from globe or sidebar
  const handleCountryClick = useCallback((countryName) => {
    if (!countryName || !COUNTRIES[countryName]) return;

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
  }, [compareMode, tradeRoutesActive, handleTradeClick]);

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
      // Deactivate compare mode
      setCompareMode(false);
      setCompareCountries([]);
      showTradeRoutes();
    } else {
      hideTradeRoutes();
      setTradeInfoCountry(null);
      setTradeInfoOpen(false);
    }
  }, [tradeRoutesActive, showTradeRoutes, hideTradeRoutes]);

  // Toggle compare mode
  const handleToggleCompare = useCallback(() => {
    setCompareMode(prev => {
      if (prev) {
        // Turning off
        setCompareCountries([]);
        return false;
      }
      // Turning on — deactivate trade routes
      if (tradeRoutesActive) {
        setTradeRoutesActive(false);
        window.tradeRoutesActive = false;
        hideTradeRoutes();
        setTradeInfoCountry(null);
        setTradeInfoOpen(false);
      }
      return true;
    });
  }, [tradeRoutesActive, hideTradeRoutes]);

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
  }, [searchOpen, statPopupOpen, stocksModalOpen, modalOpen, tosOpen, tradeInfoOpen]);

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
            collapsed={watchlistCollapsed}
            onToggle={() => setWatchlistCollapsed(prev => !prev)}
          />

          {/* Risk Legend */}
          <RiskLegend />

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
