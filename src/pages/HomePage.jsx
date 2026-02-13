// HomePage.jsx - Main dashboard page combining all components

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { COUNTRIES } from '../data/countries';
import { RISK_COLORS } from '../utils/riskColors';
import { fetchLiveNews, initializeRiskState, computeStats, NEWS_REFRESH_INTERVAL } from '../services/apiService';
import { loadStockData } from '../services/stocksService';

import GlobeView from '../components/Globe/GlobeView';
import Sidebar from '../components/Sidebar/Sidebar';
import CountryModal from '../components/Modals/CountryModal';
import TOSModal from '../components/Modals/TOSModal';
import StocksModal from '../components/Stocks/StocksModal';
import ComparePanel from '../components/Compare/ComparePanel';
import TradeInfoPanel from '../components/TradeRoutes/TradeInfoPanel';
import { useTradeRoutes } from '../components/TradeRoutes/TradeRoutes';

// ============================================================
// Search Overlay Component
// ============================================================

function SearchOverlay({ isOpen, onClose, onSelect }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) setQuery('');
  }, [isOpen]);

  const results = useMemo(() => {
    if (!query || query.length < 1) return [];
    return Object.entries(COUNTRIES)
      .filter(([name, c]) =>
        name.toLowerCase().includes(query.toLowerCase()) ||
        c.region.toLowerCase().includes(query.toLowerCase())
      )
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
        <div className="stat-value" style={{ color: '#f59e0b' }}>{stats.high}</div>
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
    filtered.sort((a, b) => a[0].localeCompare(b[0]));
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
// Breaking News Banner
// ============================================================

function BreakingBanner({ text, onClose }) {
  if (!text) return null;

  return (
    <div className="breaking-banner active">
      <span className="breaking-label">BREAKING</span>
      <span className="breaking-text">{text}</span>
      <button className="breaking-close" onClick={onClose}>&times;</button>
    </div>
  );
}

// ============================================================
// Watchlist Component
// ============================================================

function Watchlist({ onCountryClick }) {
  const watchlistCountries = useMemo(() => {
    return Object.entries(COUNTRIES)
      .filter(([, c]) => c.risk === 'catastrophic' || c.risk === 'extreme')
      .sort((a, b) => {
        const tierDiff = ({ catastrophic: 0, extreme: 1 }[a[1].risk] || 0) - ({ catastrophic: 0, extreme: 1 }[b[1].risk] || 0);
        return tierDiff !== 0 ? tierDiff : a[0].localeCompare(b[0]);
      });
  }, []);

  return (
    <div className="watchlist" style={{ position: 'relative', top: 'auto', left: 'auto' }}>
      <div className="watchlist-title">CRITICAL WATCHLIST</div>
      {watchlistCountries.map(([name, c]) => (
        <div key={name} className="watchlist-item" onClick={() => onCountryClick(name)}>
          <span className="wl-country">{c.flag} {name}</span>
          <span className={`wl-risk risk-${c.risk}`}>{c.risk.toUpperCase()}</span>
        </div>
      ))}
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

  // --- Breaking news ---
  const [breakingNews, setBreakingNews] = useState(null);

  // --- Stat popup ---
  const [statPopupType, setStatPopupType] = useState(null);
  const [statPopupOpen, setStatPopupOpen] = useState(false);

  // --- Loading ---
  const [isLoading, setIsLoading] = useState(true);

  // --- Auto-rotate ---
  const [autoRotate, setAutoRotate] = useState(true);

  // --- Date display ---
  const [currentDate, setCurrentDate] = useState('');

  // --- Trade routes hook ---
  const { showTradeRoutes, hideTradeRoutes, toggleTradeRoutes, handleTradeClick } = useTradeRoutes();

  // ============================================================
  // Initialize on mount
  // ============================================================

  useEffect(() => {
    // Initialize risk state
    initializeRiskState();

    // Update date display
    const now = new Date();
    setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));

    // Fetch live news
    fetchLiveNews({
      onStatusUpdate: (status) => {
        if (status === 'fetching') setIsLoading(true);
      },
      onComplete: () => {
        setIsLoading(false);
      },
      onBreakingNews: (headline) => {
        setBreakingNews(headline);
      }
    });

    // Auto-refresh news
    const newsInterval = setInterval(() => {
      fetchLiveNews({
        onBreakingNews: (headline) => {
          setBreakingNews(headline);
        }
      });
    }, NEWS_REFRESH_INTERVAL);

    // Load stock data for stocks modal
    loadStockData(({ data, lastUpdated }) => {
      setStocksData(data);
      setStocksLastUpdated(lastUpdated);
    });

    const stocksInterval = setInterval(() => {
      loadStockData(({ data, lastUpdated }) => {
        setStocksData(data);
        setStocksLastUpdated(lastUpdated);
      });
    }, 180000);

    return () => {
      clearInterval(newsInterval);
      clearInterval(stocksInterval);
    };
  }, []);

  // ============================================================
  // Handlers
  // ============================================================

  // Country click from globe or sidebar
  const handleCountryClick = useCallback((countryName) => {
    if (!countryName || !COUNTRIES[countryName]) return;

    // Compare mode: add to comparison
    if (compareMode) {
      setCompareCountries(prev => {
        if (prev.includes(countryName)) return prev;
        if (prev.length >= 3) return prev;
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
  const handleOpenModal = useCallback((type) => {
    if (type === 'tos') {
      setTosOpen(true);
    }
  }, []);

  // Open stocks detail modal
  const handleOpenStocksModal = useCallback((country) => {
    setStocksModalCountry(country);
    setStocksModalOpen(true);
  }, []);

  // Toggle trade routes
  const handleToggleTradeRoutes = useCallback(() => {
    const newState = !tradeRoutesActive;
    setTradeRoutesActive(newState);
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
      if (prev.includes(name) || prev.length >= 3) return prev;
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
      {/* Breaking News Banner */}
      <BreakingBanner text={breakingNews} onClose={() => setBreakingNews(null)} />

      <div className={`app${breakingNews ? ' banner-active' : ''}`}>
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

          {/* Watchlist + Feature Buttons (stacked, no overlap) */}
          <div style={{ position: 'absolute', left: 16, top: 80, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 'calc(100vh - 200px)' }}>
            <Watchlist onCountryClick={handleCountryClick} />

            {/* Feature Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button
                className={`globe-feature-btn${tradeRoutesActive ? ' active' : ''}`}
                onClick={handleToggleTradeRoutes}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
                Trade Routes
              </button>
              <button
                className={`globe-feature-btn${compareMode ? ' active' : ''}`}
                onClick={handleToggleCompare}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                </svg>
                Compare Mode
              </button>

              {/* Compare hint */}
              {compareMode && compareCountries.length === 0 && (
                <div className="compare-hint">
                  Click countries on the globe to compare
                </div>
              )}
            </div>
          </div>

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
              className={`globe-tool-btn${autoRotate ? ' active' : ''}`}
              onClick={handleToggleRotate}
              title="Toggle Auto-Rotate"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4m0 12v4M2 12h4m12 0h4m-5.66-5.66l-2.83 2.83m-5.66 5.66l-2.83 2.83m0-11.32l2.83 2.83m5.66 5.66l2.83 2.83"/>
              </svg>
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
            onClose={() => { setTradeInfoOpen(false); setTradeInfoCountry(null); }}
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
          onOpenModal={handleOpenModal}
          onOpenStocksModal={handleOpenStocksModal}
        />
      </div>

      {/* ===== Modals ===== */}
      <CountryModal
        countryName={selectedCountry}
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedCountry(null); }}
      />

      <TOSModal
        isOpen={tosOpen}
        onClose={() => setTosOpen(false)}
      />

      <StocksModal
        country={stocksModalCountry}
        stocksData={stocksData}
        lastUpdated={stocksLastUpdated}
        isOpen={stocksModalOpen}
        onClose={() => { setStocksModalOpen(false); setStocksModalCountry(null); }}
      />

      {/* Compare Panel */}
      <ComparePanel
        isActive={compareMode && compareCountries.length > 0}
        countries={compareCountries}
        onClose={handleCloseCompare}
        onAddCountry={handleAddCompareCountry}
        onRemoveCountry={handleRemoveCompareCountry}
        onCountryClick={handleCountryClick}
      />
    </>
  );
}
