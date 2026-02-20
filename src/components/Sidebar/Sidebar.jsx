// Sidebar.jsx - Main sidebar with 6 tabs

import { useState, useEffect, useCallback, useRef } from 'react';
import { COUNTRIES, RECENT_ELECTIONS, ELECTIONS, FORECASTS, HORIZON_EVENTS, DAILY_BRIEFING, DAILY_EVENTS, lastNewsUpdate } from '../../data/countries';
import { RISK_COLORS, renderBiasTag, getStateMediaLabel, enforceSourceDiversity, ensureNonWesternInTopStories } from '../../utils/riskColors';
import { renderNewsletter } from '../../services/newsService';
import { onEventsUpdated } from '../../services/apiService';
import { adjustFontSize, resetFontSize } from '../Globe/GlobeView';
import StocksTab from '../Stocks/StocksTab';
import EventModal from '../Modals/EventModal';

const TABS = [
  { id: 'events', label: 'Events' },
  { id: 'newsletter', label: 'Brief' },
  { id: 'elections', label: 'Elections' },
  { id: 'forecast', label: 'Forecast' },
  { id: 'horizon', label: 'Horizon' },
  { id: 'stocks', label: 'Stocks' }
];

const ITEMS_PER_PAGE = 15;

const CAT_COLORS = { summit: '#06b6d4', election: '#a78bfa', treaty: '#f59e0b', military: '#ef4444', economic: '#22c55e', sanctions: '#f97316' };

export default function Sidebar({ onCountryClick, onOpenStocksModal, stocksData, stocksLastUpdated }) {
  const [activeTab, setActiveTab] = useState('events');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [newsTimestamp, setNewsTimestamp] = useState('');
  const [pastOpen, setPastOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [, setEventsVersion] = useState(0); // force re-render when summaries arrive
  const contentRef = useRef(null);

  // Expose toggleBriefDropdown globally — copied verbatim from original news.js.
  // Inline onclick handlers in dangerouslySetInnerHTML need this on window.
  useEffect(() => {
    window.toggleBriefDropdown = function(id) {
      const el = document.getElementById(id);
      const arrow = document.getElementById(id + '-arrow');
      if (el) {
        const isOpen = el.style.maxHeight && el.style.maxHeight !== '0px';
        el.style.maxHeight = isOpen ? '0px' : el.scrollHeight + 'px';
        el.style.opacity = isOpen ? '0' : '1';
        if (arrow) arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
      }
    };
    return () => { delete window.toggleBriefDropdown; };
  }, []);

  // Subscribe to events updates (when AI summaries arrive)
  useEffect(() => {
    const unsub = onEventsUpdated(() => {
      setEventsVersion(v => v + 1);
    });
    return unsub;
  }, []);

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
    setPastOpen(false);
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

  const catBorderColor = (cat) => {
    if (cat === 'CONFLICT') return '#ef4444';
    if (cat === 'CRISIS') return '#f97316';
    if (cat === 'SECURITY') return '#eab308';
    if (cat === 'ECONOMY') return '#22c55e';
    if (cat === 'DIPLOMACY') return '#8b5cf6';
    if (cat === 'POLITICS') return '#3b82f6';
    return '#374151';
  };

  const getCardPreview = (event) => {
    if (event.summaryLoading) return null;
    if (!event.summary) return null;

    const text = event.summary;
    // Split into sentences — but avoid breaking on abbreviations like "U.S." or "Dr."
    // Match sentence-ending punctuation followed by a space and uppercase letter
    const sentences = [];
    let buf = '';
    for (let i = 0; i < text.length; i++) {
      buf += text[i];
      if ((text[i] === '.' || text[i] === '!' || text[i] === '?') && i + 2 < text.length && text[i + 1] === ' ') {
        // Check if next char is uppercase (real sentence break) and current "word" is >2 chars
        const wordBefore = buf.trimEnd().split(/\s/).pop() || '';
        if (text[i + 2] >= 'A' && text[i + 2] <= 'Z' && wordBefore.length > 3) {
          sentences.push(buf.trim());
          buf = '';
        }
      }
    }
    if (buf.trim()) sentences.push(buf.trim());

    if (sentences.length === 0) return text.length > 160 ? text.substring(0, 157) + '...' : text;

    let preview = sentences[0];
    // If first sentence is very short, include the second
    if (preview.length < 50 && sentences.length > 1) {
      preview += ' ' + sentences[1];
    }
    // Truncate if still too long
    if (preview.length > 160) {
      preview = preview.substring(0, 157).replace(/\s+\S*$/, '') + '...';
    }
    return preview;
  };

  const renderEventCard = (event, isTopStory) => {
    // Clean up headline for display
    let displayHeadline = event.headline;
    const dashIdx = displayHeadline.lastIndexOf(' - ');
    if (dashIdx > 0 && dashIdx > displayHeadline.length - 40) {
      displayHeadline = displayHeadline.substring(0, dashIdx).trim();
    }

    const preview = getCardPreview(event);

    return (
      <div
        key={event.id}
        className="card"
        onClick={() => setSelectedEvent(event)}
        style={{
          cursor: 'pointer',
          ...(isTopStory ? { borderLeft: `2px solid ${catBorderColor(event.category)}` } : {})
        }}
      >
        {/* Header row: category + sources badge + time */}
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className={`card-cat ${event.category}`}>{event.category}</span>
            {event.sourceCount > 1 && (
              <span style={{
                fontSize: '7px', fontWeight: 700, color: '#06b6d4',
                background: 'rgba(6,182,212,0.15)', padding: '2px 5px',
                borderRadius: '3px', letterSpacing: '0.3px'
              }}>
                {event.sourceCount} sources
              </span>
            )}
          </div>
          <span className="card-time">{event.time}</span>
        </div>

        {/* Preview text: first sentence of summary OR headline */}
        <div className="card-headline" style={isTopStory ? { fontWeight: 600 } : undefined}>
          {preview || displayHeadline}
        </div>

        {/* Loading indicator */}
        {event.summaryLoading && (
          <div style={{ fontSize: '8px', color: '#6b7280', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ display: 'inline-block', width: '7px', height: '7px', border: '1.5px solid #374151', borderTopColor: '#06b6d4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            Summarizing...
          </div>
        )}
      </div>
    );
  };

  const renderEventsTab = () => {
    if (DAILY_EVENTS.length === 0) {
      if (DAILY_BRIEFING.length === 0) {
        return <div style={{ color: '#6b7280', fontSize: '11px', textAlign: 'center', padding: '20px' }}>Loading events...</div>;
      }
      return <div style={{ color: '#6b7280', fontSize: '11px', textAlign: 'center', padding: '20px' }}>Clustering articles into events...</div>;
    }

    // DAILY_EVENTS is already sorted by score from eventsService (CONFLICT/SECURITY first, more sources, recency)
    // Top Stories: first 5, but deprioritize single-source non-CONFLICT/SECURITY events
    const topCandidates = DAILY_EVENTS.filter(e =>
      e.sourceCount > 1 || e.importance === 'high' || ['CONFLICT', 'SECURITY', 'CRISIS'].includes(e.category)
    );
    const topEvents = topCandidates.slice(0, 5);
    const topIds = new Set(topEvents.map(e => e.id));
    // Latest Updates: everything NOT in Top Stories, paginated
    const remaining = DAILY_EVENTS.filter(e => !topIds.has(e.id));
    const restEvents = remaining.slice(0, visibleCount);

    return (
      <>
        {/* Top Stories */}
        {topEvents.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'linear-gradient(90deg, rgba(239,68,68,0.15) 0%, transparent 100%)', borderLeft: '3px solid #ef4444', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444', letterSpacing: '1px' }}>TOP STORIES</span>
              {DAILY_EVENTS.some(e => e.summaryLoading) && (
                <span style={{ fontSize: '8px', color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', border: '1.5px solid #1f2937', borderTopColor: '#06b6d4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  AI summaries loading
                </span>
              )}
            </div>
            {topEvents.map(event => renderEventCard(event, true))}
          </>
        )}

        {/* Latest Updates */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(59,130,246,0.1)', borderLeft: '3px solid #3b82f6', margin: '14px 0 10px 0' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#3b82f6', letterSpacing: '1px' }}>LATEST UPDATES</span>
          <span style={{ fontSize: '9px', color: '#6b7280' }}>({DAILY_EVENTS.length} events from {DAILY_BRIEFING.length} articles)</span>
        </div>
        {restEvents.map(event => renderEventCard(event, false))}

        {visibleCount < remaining.length && (
          <button onClick={loadMore} style={{
            width: '100%', padding: '12px', marginTop: '10px', background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)', border: '1px solid #374151',
            borderRadius: '8px', color: '#9ca3af', cursor: 'pointer', fontSize: '11px', fontWeight: 600
          }}>
            LOAD MORE ({remaining.length - visibleCount} remaining)
          </button>
        )}
      </>
    );
  };

  const renderBriefTab = () => {
    const html = renderNewsletter();
    // Past briefings use inline onclick="toggleBriefDropdown('id')" matching original.
    // Expose the toggle function globally so innerHTML onclick handlers can call it.
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  const renderElectionsTab = () => (
    <>
      {RECENT_ELECTIONS && RECENT_ELECTIONS.length > 0 && (
        <div>
          <div style={{ fontSize: '9px', color: '#22c55e', fontWeight: 600, letterSpacing: '1px', marginBottom: '12px' }}>RECENT RESULTS</div>
          {RECENT_ELECTIONS.map((e, i) => (
            <div key={i} className="election-card" style={{ borderLeft: '3px solid #22c55e' }} onClick={() => handleCountryClick(e.country)}>
              <div className="election-header">
                <span className="election-flag">{e.flag}</span>
                <span className="election-country">{e.country}</span>
                <span className="election-date" style={{ color: '#22c55e' }}>{e.date}</span>
              </div>
              <div className="election-type">{e.type}</div>
              {e.winner && <div style={{ fontSize: '10px', color: '#22c55e', fontWeight: 600, margin: '4px 0' }}>{e.winner}</div>}
              {e.summary && <div className="election-stakes">{e.summary}</div>}
            </div>
          ))}
        </div>
      )}
      <div>
        <div style={{ fontSize: '9px', color: '#f97316', fontWeight: 600, letterSpacing: '1px', margin: '20px 0 12px' }}>UPCOMING ELECTIONS</div>
        {ELECTIONS.map((e, i) => (
          <div key={i} className="election-card" style={{ borderLeft: '3px solid #f97316' }} onClick={() => handleCountryClick(e.country)}>
            <div className="election-header">
              <span className="election-flag">{e.flag}</span>
              <span className="election-country">{e.country}</span>
              <span className="election-date">{e.date}</span>
            </div>
            <div className="election-type">{e.type}</div>
            {e.stakes && <div className="election-stakes">{e.stakes}</div>}
          </div>
        ))}
      </div>
    </>
  );

  const renderForecastTab = () => {
    const riskFg = { catastrophic: '#fca5a5', extreme: '#fcd34d', severe: '#fde047', stormy: '#c4b5fd', cloudy: '#93c5fd', clear: '#86efac' };
    const riskBg = { catastrophic: '#7f1d1d', extreme: '#78350f', severe: '#713f12', stormy: '#5b21b6', cloudy: '#1e3a5f', clear: '#14532d' };
    return (
      <>
        <div className="section-title">GEOPOLITICAL FORECASTS</div>
        {FORECASTS.map((f, i) => (
          <div key={i} className="forecast-card">
            <div className="forecast-header">
              <span className="forecast-region">{f.region}</span>
              <span className="forecast-risk" style={{
                background: riskBg[f.risk] || '#374151',
                color: riskFg[f.risk] || '#9ca3af'
              }}>
                {f.risk.toUpperCase()}
              </span>
            </div>
            <div className="forecast-current">{f.current}</div>
            <div className="forecast-prediction">
              <div className="forecast-prediction-title">FORECAST</div>
              <div className="forecast-prediction-text">{f.forecast}</div>
            </div>
            {f.indicators && (
              <div className="forecast-indicators">
                {f.indicators.map((ind, j) => (
                  <span key={j} className={`forecast-indicator ${ind.dir === 'up' ? 'up' : ind.dir === 'down' ? 'down' : 'stable'}`}>
                    {ind.dir === 'up' ? '\u2191' : ind.dir === 'down' ? '\u2193' : '\u2192'} {ind.text}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </>
    );
  };

  const renderHorizonTab = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const upcoming = HORIZON_EVENTS.filter(e => e.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date));
    const past = HORIZON_EVENTS.filter(e => e.date < todayStr).sort((a, b) => b.date.localeCompare(a.date));

    const renderEvent = (e, isPast) => {
      const d = new Date(e.date + 'T12:00:00');
      const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const day = d.getDate();
      const color = CAT_COLORS[e.category] || '#6b7280';

      const diffMs = new Date(e.date + 'T00:00:00') - new Date(todayStr + 'T00:00:00');
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      let countdown = null;
      if (diffDays === 0) countdown = <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '8px' }}>TODAY</span>;
      else if (diffDays === 1) countdown = <span style={{ color: '#f59e0b', fontSize: '8px' }}>TOMORROW</span>;
      else if (diffDays > 1 && diffDays <= 7) countdown = <span style={{ color: '#f59e0b', fontSize: '8px' }}>{diffDays} Days</span>;
      else if (diffDays > 7 && diffDays <= 30) { const w = Math.ceil(diffDays / 7); countdown = <span style={{ color: '#6b7280', fontSize: '8px' }}>{w} Week{w === 1 ? '' : 's'}</span>; }
      else if (diffDays > 30) { const mo = Math.ceil(diffDays / 30); countdown = <span style={{ color: '#4b5563', fontSize: '8px' }}>{mo} Month{mo === 1 ? '' : 's'}</span>; }
      else if (isPast) { const abs = Math.abs(diffDays); countdown = <span style={{ color: '#374151', fontSize: '8px' }}>{abs} Day{abs === 1 ? '' : 's'} Ago</span>; }

      return (
        <div key={e.date + e.name} style={{ display: 'flex', gap: '10px', padding: '10px 8px', borderBottom: '1px solid #111827', opacity: isPast ? 0.5 : 1 }}>
          <div style={{ minWidth: '42px', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color, letterSpacing: '0.5px' }}>{month}</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#e5e7eb', lineHeight: 1.1 }}>{day}</div>
            {countdown && <div style={{ marginTop: '2px' }}>{countdown}</div>}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: '#e5e7eb', lineHeight: 1.3, marginBottom: '3px' }}>{e.name}</div>
            <div style={{ fontSize: '9px', color: '#9ca3af', marginBottom: '3px' }}>{e.location}</div>
            <div style={{ fontSize: '9px', color: '#6b7280', lineHeight: 1.5 }}>{e.description}</div>
          </div>
        </div>
      );
    };

    // Group upcoming by month
    const groupedUpcoming = [];
    let currentMonth = '';
    upcoming.forEach(e => {
      const d = new Date(e.date + 'T12:00:00');
      const monthYear = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      if (monthYear !== currentMonth) {
        currentMonth = monthYear;
        groupedUpcoming.push({ type: 'header', label: monthYear.toUpperCase() });
      }
      groupedUpcoming.push({ type: 'event', event: e });
    });

    return (
      <>
        {/* Header */}
        <div style={{ padding: '8px 12px', background: 'linear-gradient(90deg,rgba(6,182,212,0.12) 0%,transparent 100%)', borderLeft: '3px solid #06b6d4', marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#06b6d4', letterSpacing: '1px' }}>GEOPOLITICAL HORIZON</div>
          <div style={{ fontSize: '9px', color: '#6b7280', marginTop: '2px' }}>{upcoming.length} upcoming events tracked</div>
        </div>

        {/* Category legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '0 8px 10px', borderBottom: '1px solid #1f2937', marginBottom: '4px' }}>
          {Object.entries(CAT_COLORS).map(([cat, color]) => (
            <span key={cat} style={{ fontSize: '8px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, display: 'inline-block' }} />
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </span>
          ))}
        </div>

        {/* Upcoming events grouped by month */}
        {groupedUpcoming.map((item, i) => {
          if (item.type === 'header') {
            return (
              <div key={item.label} style={{ fontSize: '9px', fontWeight: 700, color: '#9ca3af', letterSpacing: '1px', padding: '10px 8px 4px', borderTop: i > 0 ? '1px solid #1f2937' : 'none', marginTop: i > 0 ? '4px' : 0 }}>
                {item.label}
              </div>
            );
          }
          return renderEvent(item.event, false);
        })}

        {/* Past events collapsible */}
        {past.length > 0 && (
          <div style={{ marginTop: '12px', borderTop: '1px solid #1f2937', paddingTop: '10px' }}>
            <div
              onClick={() => setPastOpen(!pastOpen)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', cursor: 'pointer', background: '#0d0d14', borderRadius: '6px' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#131320'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#0d0d14'; }}
            >
              <span style={{ fontSize: '9px', fontWeight: 600, color: '#6b7280', letterSpacing: '0.5px' }}>PAST EVENTS ({past.length})</span>
              <span style={{ color: '#6b7280', fontSize: '10px', transition: 'transform 0.3s', transform: pastOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>&#9660;</span>
            </div>
            {pastOpen && (
              <div>
                {past.map(e => renderEvent(e, true))}
              </div>
            )}
          </div>
        )}
      </>
    );
  };

  const renderStocksTab = () => {
    return <StocksTab onOpenStocksModal={onOpenStocksModal} stocksData={stocksData} stocksLastUpdated={stocksLastUpdated} />;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'events': return renderEventsTab();
      case 'newsletter': return renderBriefTab();
      case 'elections': return renderElectionsTab();
      case 'forecast': return renderForecastTab();
      case 'horizon': return renderHorizonTab();
      case 'stocks': return renderStocksTab();
      default: return null;
    }
  };

  return (
    <>
      <div className="sidebar">
        {/* Tabs */}
        <div className="tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status + Font Controls Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 12px', background: '#0a0a0f', borderBottom: '1px solid #1f2937' }}>
          <div style={{ fontSize: '10px', color: '#6b7280' }}>
            {newsTimestamp ? (
              <><span style={{ color: '#22c55e' }}>&#9679;</span> {newsTimestamp}</>
            ) : (
              'Loading live news...'
            )}
          </div>
          <div id="fontControls" style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
            <button
              onClick={() => adjustFontSize(-1)}
              style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid #374151', background: '#111827', color: '#9ca3af', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              title="Decrease text size"
            >A-</button>
            <button
              onClick={resetFontSize}
              style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid #374151', background: '#111827', color: '#6b7280', fontSize: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              title="Reset text size"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12a9 9 0 1 1 3 6.7"/><polyline points="3 22 3 16 9 16"/></svg>
            </button>
            <button
              onClick={() => adjustFontSize(1)}
              style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid #374151', background: '#111827', color: '#9ca3af', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              title="Increase text size"
            >A+</button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="sidebar-content" ref={contentRef}>
          {renderTabContent()}
        </div>
      </div>

      {/* Event Detail Modal */}
      <EventModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </>
  );
}
