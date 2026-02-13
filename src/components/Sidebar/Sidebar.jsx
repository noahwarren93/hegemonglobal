// Sidebar.jsx - Main sidebar with 6 tabs

import { useState, useEffect, useCallback, useRef } from 'react';
import { COUNTRIES, RECENT_ELECTIONS, ELECTIONS, FORECASTS, HORIZON_EVENTS, DAILY_BRIEFING, lastNewsUpdate } from '../../data/countries';
import { RISK_COLORS, renderBiasTag, getSourceBias } from '../../utils/riskColors';
import { MARKET_CONFIG, STATIC_FALLBACK_DATA, STOCKS_DETAIL } from '../../data/stocksData';
import { renderNewsletter } from '../../services/newsService';
import { adjustFontSize, resetFontSize } from '../Globe/GlobeView';

const TABS = [
  { id: 'daily', label: 'Articles' },
  { id: 'newsletter', label: 'Brief' },
  { id: 'elections', label: 'Elections' },
  { id: 'forecast', label: 'Forecast' },
  { id: 'horizon', label: 'Horizon' },
  { id: 'stocks', label: 'Stocks' }
];

const ITEMS_PER_PAGE = 15;

export default function Sidebar({ onCountryClick, onOpenModal }) {
  const [activeTab, setActiveTab] = useState('daily');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [searchQuery, setSearchQuery] = useState('');
  const [newsTimestamp, setNewsTimestamp] = useState('');
  const contentRef = useRef(null);

  // Update news timestamp
  useEffect(() => {
    const update = () => {
      if (lastNewsUpdate) {
        setNewsTimestamp(`Live \u00b7 Updated ${lastNewsUpdate.toLocaleTimeString()} \u00b7 ${DAILY_BRIEFING.length} articles`);
      }
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  // Reset visible count on tab change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
    setSearchQuery('');
  }, [activeTab]);

  const loadMore = useCallback(() => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  }, []);

  const handleCountryClick = useCallback((countryName) => {
    if (onCountryClick) onCountryClick(countryName);
  }, [onCountryClick]);

  // ============================================================
  // Tab Content Renderers
  // ============================================================

  const renderArticlesTab = () => {
    const articles = DAILY_BRIEFING.slice(0, visibleCount);
    if (articles.length === 0) {
      return <div className="sidebar-empty">Loading news articles...</div>;
    }

    return (
      <>
        {articles.map((article, i) => (
          <div key={i} className={`news-card ${article.importance === 'high' ? 'high-importance' : ''}`}>
            <div className="card-header">
              <span className={`card-cat ${article.category}`}>{article.category}</span>
              <span className="card-time">{article.time}</span>
            </div>
            <div className="card-headline">
              {article.url && article.url !== '#' ? (
                <a href={article.url} target="_blank" rel="noopener noreferrer">{article.headline}</a>
              ) : (
                article.headline
              )}
            </div>
            <div className="card-source">
              {article.source}
              <span dangerouslySetInnerHTML={{ __html: renderBiasTag(article.source) }} />
            </div>
          </div>
        ))}
        {visibleCount < DAILY_BRIEFING.length && (
          <button className="load-more-btn" onClick={loadMore}>
            Load More ({DAILY_BRIEFING.length - visibleCount} remaining)
          </button>
        )}
      </>
    );
  };

  const renderBriefTab = () => {
    const html = renderNewsletter();
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  const renderElectionsTab = () => {
    return (
      <>
        {RECENT_ELECTIONS && RECENT_ELECTIONS.length > 0 && (
          <div className="election-section">
            <div className="section-label">RECENT RESULTS</div>
            {RECENT_ELECTIONS.map((e, i) => (
              <div key={i} className="election-card" onClick={() => handleCountryClick(e.country)}>
                <div className="election-header">
                  <span className="election-flag">{e.flag}</span>
                  <span className="election-country">{e.country}</span>
                  <span className="election-date">{e.date}</span>
                </div>
                <div className="election-type">{e.type}</div>
                {e.winner && <div className="election-winner">Winner: {e.winner}</div>}
                {e.notes && <div className="election-notes">{e.notes}</div>}
              </div>
            ))}
          </div>
        )}
        <div className="election-section">
          <div className="section-label">UPCOMING ELECTIONS</div>
          {ELECTIONS.map((e, i) => (
            <div key={i} className="election-card" onClick={() => handleCountryClick(e.country)}>
              <div className="election-header">
                <span className="election-flag">{e.flag}</span>
                <span className="election-country">{e.country}</span>
                <span className="election-date">{e.date}</span>
              </div>
              <div className="election-type">{e.type}</div>
              {e.notes && <div className="election-notes">{e.notes}</div>}
            </div>
          ))}
        </div>
      </>
    );
  };

  const renderForecastTab = () => {
    return (
      <>
        <div className="section-label">GEOPOLITICAL FORECASTS</div>
        {FORECASTS.map((f, i) => (
          <div key={i} className="forecast-card">
            <div className="forecast-header">
              <span className={`forecast-prob prob-${f.probability >= 70 ? 'high' : f.probability >= 40 ? 'med' : 'low'}`}>
                {f.probability}%
              </span>
              <span className="forecast-title">{f.title}</span>
            </div>
            <div className="forecast-desc">{f.description}</div>
            <div className="forecast-meta">
              <span className="forecast-timeframe">{f.timeframe}</span>
              {f.region && <span className="forecast-region">{f.region}</span>}
            </div>
          </div>
        ))}
      </>
    );
  };

  const renderHorizonTab = () => {
    return (
      <>
        <div className="section-label">HORIZON SCANNING</div>
        {HORIZON_EVENTS.map((h, i) => (
          <div key={i} className="horizon-card">
            <div className="horizon-header">
              <span className={`horizon-impact impact-${h.impact}`}>{h.impact.toUpperCase()}</span>
              <span className="horizon-title">{h.title}</span>
            </div>
            <div className="horizon-desc">{h.description}</div>
            <div className="horizon-meta">
              <span className="horizon-timeframe">{h.timeframe}</span>
              {h.category && <span className="horizon-category">{h.category}</span>}
            </div>
          </div>
        ))}
      </>
    );
  };

  const renderStocksTab = () => {
    return (
      <>
        <div className="section-label">GLOBAL MARKETS</div>
        {MARKET_CONFIG.map((market, i) => (
          <div key={i} className="market-section">
            <div className="market-country">
              <span className="market-flag">{market.flag}</span>
              {market.country}
            </div>
            {market.symbols.map((sym, j) => {
              const data = STATIC_FALLBACK_DATA[sym.sym];
              if (!data) return null;
              const isPositive = data.changePct >= 0;
              return (
                <div key={j} className="stock-row">
                  <div className="stock-name">{sym.name}</div>
                  <div className="stock-price">
                    {sym.pre || ''}{typeof data.price === 'number' ? data.price.toLocaleString() : data.price}
                  </div>
                  <div className={`stock-change ${isPositive ? 'positive' : 'negative'}`}>
                    {isPositive ? '+' : ''}{data.changePct.toFixed(2)}%
                  </div>
                  {data.sparkline && (
                    <div className="sparkline">
                      {data.sparkline.map((val, k) => {
                        const max = Math.max(...data.sparkline);
                        const min = Math.min(...data.sparkline);
                        const range = max - min || 1;
                        const height = ((val - min) / range) * 16 + 2;
                        return (
                          <div
                            key={k}
                            className={`spark-bar ${isPositive ? 'positive' : 'negative'}`}
                            style={{ height: `${height}px` }}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'daily': return renderArticlesTab();
      case 'newsletter': return renderBriefTab();
      case 'elections': return renderElectionsTab();
      case 'forecast': return renderForecastTab();
      case 'horizon': return renderHorizonTab();
      case 'stocks': return renderStocksTab();
      default: return null;
    }
  };

  return (
    <div id="sidebar" className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-title">
          <span className="sidebar-logo">HEGEMON</span>
          <span className="sidebar-subtitle">Global Risk Monitor</span>
        </div>
        <div className="sidebar-controls">
          <button className="font-btn" onClick={() => adjustFontSize(1)} title="Increase font size">A+</button>
          <button className="font-btn" onClick={() => adjustFontSize(-1)} title="Decrease font size">A-</button>
          <button className="font-btn" onClick={resetFontSize} title="Reset font size">Aa</button>
          <button className="tos-btn" onClick={() => onOpenModal && onOpenModal('tos')} title="Terms of Service">TOS</button>
        </div>
      </div>

      {/* News timestamp */}
      {newsTimestamp && (
        <div className="news-timestamp">
          <span style={{ color: '#22c55e' }}>&#9679;</span> {newsTimestamp}
        </div>
      )}

      {/* Tabs */}
      <div className="sidebar-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="sidebar-content" ref={contentRef}>
        {renderTabContent()}
      </div>
    </div>
  );
}
