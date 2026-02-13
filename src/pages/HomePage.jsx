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
// Breaking News Banner
// ============================================================

function BreakingBanner({ text, onClose }) {
  if (!text) return null;

  return (
    <div className="breaking-banner active">
      <span style={{ background: '#fff', color: '#991b1b', padding: '2px 8px', fontWeight: 800, fontSize: '10px', letterSpacing: '1px', borderRadius: '2px' }}>
        BREAKING
      </span>
      <span style={{ fontSize: '12px', fontWeight: 600, flex: 1 }}>{text}</span>
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '18px', padding: '4px 8px' }}
      >
        &times;
      </button>
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
      return true;
    });
  }, []);

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
  }, [searchOpen, stocksModalOpen, modalOpen, tosOpen, tradeInfoOpen]);

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

          {/* Feature Buttons */}
          <div style={{ position: 'absolute', left: 16, top: 80, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button
              className={`globe-feature-btn${tradeRoutesActive ? ' active' : ''}`}
              onClick={handleToggleTradeRoutes}
            >
              <span style={{ fontSize: '12px' }}>{'\u{1F310}'}</span>
              Trade Routes
            </button>
            <button
              className={`globe-feature-btn${compareMode ? ' active' : ''}`}
              onClick={handleToggleCompare}
            >
              <span style={{ fontSize: '12px' }}>{'\u{1F4CA}'}</span>
              Compare Mode
            </button>
          </div>

          {/* Compare hint */}
          {compareMode && compareCountries.length === 0 && (
            <div className="compare-hint" style={{ left: 170, top: 112 }}>
              Click countries on the globe to compare
            </div>
          )}

          {/* Globe Tools (bottom-right) */}
          <div className="globe-tools">
            <button
              className="globe-tool-btn"
              onClick={() => setTosOpen(true)}
              title="Terms of Service"
            >
              <span style={{ fontSize: '14px' }}>{'\u2696'}</span>
            </button>
            <button
              className={`globe-tool-btn${searchOpen ? ' active' : ''}`}
              onClick={() => setSearchOpen(prev => !prev)}
              title="Search Countries (Ctrl+K)"
            >
              <span style={{ fontSize: '14px' }}>{'\u{1F50D}'}</span>
            </button>
            <button
              className={`globe-tool-btn${autoRotate ? ' active' : ''}`}
              onClick={handleToggleRotate}
              title="Toggle Auto-Rotate"
            >
              <span style={{ fontSize: '14px' }}>{'\u{1F504}'}</span>
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

          {/* Stats Bar */}
          <StatsBar onStatClick={(type) => {
            // Could open a stat popup - for now just a placeholder
            console.log('Stat clicked:', type);
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
