// Sidebar.jsx - Main sidebar with 6 tabs

import { useState, useEffect, useCallback, useRef } from 'react';
import { COUNTRIES, RECENT_ELECTIONS, ELECTIONS, FORECASTS, HORIZON_EVENTS, DAILY_BRIEFING, DAILY_EVENTS, lastNewsUpdate } from '../../data/countries';
import { RISK_COLORS } from '../../utils/riskColors';
import { renderNewsletter } from '../../services/newsService';
import { onEventsUpdated } from '../../services/apiService';
import { scoreHeadlineNeutrality } from '../../services/eventsService';
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

export default function Sidebar({ onCountryClick, onOpenStocksModal, stocksData, stocksLastUpdated, stocksUpdating }) {
  const [activeTab, setActiveTab] = useState('events');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [newsTimestamp, setNewsTimestamp] = useState('');
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
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [activeTab]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
    // Extract just the "What happened" section for a brief teaser
    const whatMatch = text.match(/\*\*What happened:\*\*\s*(.*?)(?:\s*\*\*Why it matters:|$)/s);
    let preview;
    if (whatMatch) {
      preview = whatMatch[1].trim();
    } else {
      // Fallback: first sentence
      const sentenceMatch = text.match(/^[^.!?]*[.!?]/);
      preview = sentenceMatch ? sentenceMatch[0].trim() : text;
    }

    // Keep preview short — this is a teaser, not the full summary
    if (preview.length > 120) {
      preview = preview.substring(0, 117).replace(/\s+\S*$/, '') + '...';
    }
    return preview;
  };

  const renderEventCard = (event, isTopStory) => {
    // Clean up headline for display — keep it SHORT
    let displayHeadline = event.headline || event.title || '';
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

        {/* HEADLINE — always the short punchy headline, never the summary */}
        <div className="card-headline" style={isTopStory ? { fontWeight: 600 } : undefined}>
          {displayHeadline}
        </div>

        {/* Brief preview from summary below headline */}
        {preview && (
          <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '3px', lineHeight: 1.5 }}>
            {preview}
          </div>
        )}

        {/* Loading indicator */}
        {event.summaryLoading && (
          <div style={{ fontSize: '8px', color: '#06b6d4', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ display: 'inline-block', width: '7px', height: '7px', border: '1.5px solid #374151', borderTopColor: '#06b6d4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            Updating...
          </div>
        )}
      </div>
    );
  };

  // Top Stories: up to 4, fixed order — Iran war covered by BREAKING banner
  const getStableTopStories = useCallback((events) => {
    // Filter out Iran/Gulf war events — those belong in the breaking banner
    const IRAN_WAR_KEYWORDS = ['iran', 'iranian', 'tehran', 'khamenei', 'irgc', 'strait of hormuz', 'epic fury', 'roaring lion', 'hezbollah', 'houthi'];
    const isIranWar = (e) => {
      const text = ((e.headline || '') + ' ' + (e.articles || []).map(a => (a.headline || '')).join(' ')).toLowerCase();
      return IRAN_WAR_KEYWORDS.some(kw => text.includes(kw));
    };
    const filtered = events.filter(e => !isIranWar(e));

    const PRIORITY = [
      {
        countries: ['ukraine', 'russia'],
        keywords: ['ukraine', 'ukrainian', 'kyiv', 'donbas', 'crimea', 'zelensky', 'russia', 'russian', 'moscow'],
        boost: ['war', 'peace talks', 'frontline', 'offensive', 'ceasefire', 'troops', 'missile'],
        penalize: ['recruitment', 'kenya'],
        fallback: null,
      },
      {
        countries: ['pakistan', 'afghanistan'],
        keywords: ['pakistan', 'pakistani', 'afghanistan', 'afghan', 'taliban', 'islamabad', 'kabul'],
        boost: ['taliban', 'killed', 'strike', 'offensive', 'military', 'border', 'operation'],
        penalize: ['cricket', 'flood'],
        fallback: null,
      },
      {
        countries: ['sudan'],
        keywords: ['sudan', 'sudanese', 'darfur', 'khartoum', 'el-fasher'],
        boost: ['genocide', 'un ', 'atrocities', 'famine', 'crisis', 'humanitarian', 'war crime'],
        penalize: ['drone'],
        fallback: null,
      },
    ];

    const getEventText = (evt) => {
      return ((evt.headline || '') + ' ' +
        (evt.articles || []).map(a => (a.headline || '')).join(' ')).toLowerCase();
    };

    // Score a headline for topic relevance + neutrality
    const scoreHeadline = (headline, req, source) => {
      const h = (headline || '').toLowerCase();
      let score = 0;
      for (const kw of req.boost) { if (h.includes(kw)) score += 3; }
      for (const kw of req.penalize) { if (h.includes(kw)) score -= 5; }
      // Penalize editorialized/snarky headlines
      score += scoreHeadlineNeutrality(headline, source);
      return score;
    };

    // Pick the best headline from an event's articles using topic scoring
    const pickBestHeadline = (event, req) => {
      if (!event.articles || event.articles.length === 0) return event.headline;

      let best = null;
      let bestScore = -Infinity;

      for (const a of event.articles) {
        const hl = a.headline || a.title || '';
        if (!hl) continue;
        const s = scoreHeadline(hl, req, a.source);
        if (s > bestScore) { bestScore = s; best = hl; }
      }

      // Also score the current event headline
      const evtScore = scoreHeadline(event.headline, req, null);
      if (evtScore >= bestScore) { best = event.headline; bestScore = evtScore; }

      // If best headline still has negative score, use fallback
      if (bestScore < 0 && req.fallback) return req.fallback;

      return best || event.headline;
    };

    // Sort by source count descending
    const sorted = [...filtered].sort((a, b) => b.sourceCount - a.sourceCount);
    const top = [];
    const usedIds = new Set();

    for (const req of PRIORITY) {
      // Primary country match
      let match = sorted.find(e => !usedIds.has(e.id) &&
        req.countries.includes(e._primaryCountry));

      // Fallback: keyword search
      if (!match) {
        match = sorted.find(e => !usedIds.has(e.id) &&
          req.keywords.some(kw => getEventText(e).includes(kw)));
      }

      if (match) {
        // Re-pick headline using topic-aware scoring
        match.headline = pickBestHeadline(match, req);
        top.push(match);
        usedIds.add(match.id);
      } else if (req.fallback) {
        // No event found at all — create a placeholder (rare edge case)
        // Skip — we only show events that actually exist
      }
    }

    return top.slice(0, 4);
  }, []);

  const [breakingExpanded, setBreakingExpanded] = useState(false);

  const WAR_TIMELINE = [
    { time: 'Latest', text: 'IRGC threatens "most intense offensive operation" targeting Israel and US bases' },
    { time: '1h ago', text: 'Iran launches retaliatory strikes on Saudi Arabia, UAE, Qatar, Bahrain, Kuwait' },
    { time: '2h ago', text: 'Khamenei confirmed killed in Israeli strike on Tehran compound \u2014 40+ senior officials also killed' },
    { time: '2h ago', text: 'Jordan intercepts 49 Iranian drones and ballistic missiles' },
    { time: '3h ago', text: 'Iran retaliates with hundreds of missiles and drones' },
    { time: '4h ago', text: 'Strikes hit 24 of 31 Iranian provinces \u2014 200+ killed' },
    { time: '4h ago', text: 'Israel declares state of emergency, sirens across the country' },
    { time: '5h ago', text: 'Operation "Epic Fury" (US) and "Roaring Lion" (Israel) launched at 9:45 AM Iran time' },
    { time: '6h ago', text: 'Trump announces strikes aimed at regime change in 8-minute video' },
  ];

  const WAR_INTEL = {
    what: 'The United States and Israel launched coordinated military strikes on Iran on February 28, 2026, in operations codenamed "Epic Fury" (US) and "Roaring Lion" (Israel). Strikes hit 24 of 31 Iranian provinces targeting nuclear enrichment sites, IRGC command centers, air defenses, and leadership compounds. Supreme Leader Ayatollah Ali Khamenei was confirmed killed along with 40+ senior officials. Over 200 people have been killed. President Pezeshkian\'s status is unconfirmed. The IRGC has assumed emergency command and launched retaliatory missile and drone strikes across the Gulf, hitting targets near US bases in Saudi Arabia, UAE, Qatar, Bahrain, Kuwait, and Iraq. Jordan intercepted 49 Iranian drones and missiles.',
    why: 'This is the most significant military confrontation in the Middle East since the 2003 Iraq invasion. Khamenei\'s assassination removes Iran\'s supreme authority after 35 years, creating a succession crisis during active war. The IRGC is now the de facto power center with every incentive to escalate. The Strait of Hormuz carries 20-30% of global oil transit and faces imminent closure risk. Iranian proxies \u2014 Hezbollah, Houthis, Iraqi Shia militias \u2014 are activating simultaneously. Oil has surged past $130/barrel. Global markets are in freefall. Six Gulf states are under direct Iranian fire.',
    outlook: 'Full regional war is the baseline scenario with no off-ramp in sight. The IRGC will escalate, not negotiate. Expect: sustained Iranian missile salvos against Gulf states, Hezbollah rocket barrages on Israel from Lebanon, Houthi closure of Red Sea shipping, attempted Strait of Hormuz blockade, and Iraqi militia ground attacks on US positions. Iran\'s nuclear program is set back but the political incentive to rebuild is now absolute. Russia and China may exploit US overstretch. The risk of wider global conflict is at its highest point since the Cuban Missile Crisis.',
  };

  const renderBreakingBanner = () => {
    const previewTimeline = breakingExpanded ? WAR_TIMELINE : WAR_TIMELINE.slice(0, 3);

    return (
      <div
        key="breaking-war-banner"
        onClick={() => setBreakingExpanded(prev => !prev)}
        style={{
          cursor: 'pointer',
          borderLeft: '3px solid #dc2626',
          background: 'linear-gradient(135deg, rgba(127,29,29,0.25) 0%, rgba(17,24,39,0.95) 100%)',
          padding: '12px',
          marginBottom: '10px',
          borderRadius: '6px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              fontSize: '8px', fontWeight: 800, color: '#fff', background: '#dc2626',
              padding: '2px 6px', borderRadius: '3px', letterSpacing: '1px'
            }}>BREAKING</span>
            <span style={{ fontSize: '8px', fontWeight: 700, color: '#06b6d4', background: 'rgba(6,182,212,0.15)', padding: '2px 5px', borderRadius: '3px' }}>LIVE UPDATES</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '9px', color: '#6b7280' }}>Feb 28, 2026</span>
            <span style={{ fontSize: '10px', color: '#6b7280', transform: breakingExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>{'\u25BC'}</span>
          </div>
        </div>

        {/* Main Headline */}
        <div style={{ fontSize: '15px', fontWeight: 800, color: '#fca5a5', lineHeight: 1.3, marginBottom: breakingExpanded ? '14px' : '10px', letterSpacing: '0.3px' }}>
          US and Israel at War with Iran
        </div>

        {/* Expanded: Intelligence Summary first */}
        {breakingExpanded && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#6b7280', letterSpacing: '1px', marginBottom: '10px', textTransform: 'uppercase' }}>Intelligence Summary</div>

            <div style={{ marginBottom: '10px' }}>
              <span style={{ fontWeight: 700, color: '#06b6d4', fontSize: '10px', letterSpacing: '0.3px' }}>WHAT HAPPENED: </span>
              <span style={{ fontSize: '10px', color: '#d1d5db', lineHeight: 1.6 }}>{WAR_INTEL.what}</span>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <span style={{ fontWeight: 700, color: '#06b6d4', fontSize: '10px', letterSpacing: '0.3px' }}>WHY IT MATTERS: </span>
              <span style={{ fontSize: '10px', color: '#d1d5db', lineHeight: 1.6 }}>{WAR_INTEL.why}</span>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <span style={{ fontWeight: 700, color: '#06b6d4', fontSize: '10px', letterSpacing: '0.3px' }}>OUTLOOK: </span>
              <span style={{ fontSize: '10px', color: '#d1d5db', lineHeight: 1.6 }}>{WAR_INTEL.outlook}</span>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div style={{ borderTop: breakingExpanded ? '1px solid #1f293766' : 'none', paddingTop: breakingExpanded ? '10px' : 0 }}>
          {breakingExpanded && (
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#6b7280', letterSpacing: '1px', marginBottom: '10px', textTransform: 'uppercase' }}>Live Timeline</div>
          )}
          <div style={{ borderLeft: '2px solid #dc262666', paddingLeft: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {previewTimeline.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '8px', color: i === 0 ? '#dc2626' : '#6b7280', fontWeight: 700, minWidth: '38px', flexShrink: 0, paddingTop: '1px' }}>{item.time}</span>
                <span style={{ fontSize: '10px', color: i === 0 ? '#fca5a5' : '#d1d5db', lineHeight: 1.4 }}>{item.text}</span>
              </div>
            ))}
          </div>
          {!breakingExpanded && (
            <div style={{ fontSize: '9px', color: '#6b7280', marginTop: '8px', textAlign: 'center' }}>Tap to expand full briefing</div>
          )}
        </div>
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

    // Breaking events pinned at top
    const breakingEvents = DAILY_EVENTS.filter(e => e.breaking);
    const nonBreaking = DAILY_EVENTS.filter(e => !e.breaking);

    // Stable Top Stories: persisted for 2 hours, require 2+ sources
    const topEvents = getStableTopStories(nonBreaking);
    const topIds = new Set(topEvents.map(e => e.id));
    // Latest Updates: everything NOT in Top Stories or Breaking, paginated
    const remaining = nonBreaking.filter(e => !topIds.has(e.id));
    const restEvents = remaining.slice(0, visibleCount);

    return (
      <>
        {/* Breaking News Banner */}
        {breakingEvents.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'linear-gradient(90deg, rgba(220,38,38,0.25) 0%, rgba(127,29,29,0.15) 50%, transparent 100%)', borderLeft: '3px solid #dc2626', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#dc2626', letterSpacing: '1.5px' }}>BREAKING NEWS</span>
            </div>
            {renderBreakingBanner()}
          </>
        )}

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

    const renderEvent = (e) => {
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

      return (
        <div key={e.date + e.name} style={{ display: 'flex', gap: '10px', padding: '10px 8px', borderBottom: '1px solid #111827' }}>
          <div style={{ minWidth: '42px', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color, letterSpacing: '0.5px' }}>{month}</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#e5e7eb', lineHeight: 1.1 }}>{day}</div>
            {countdown && <div style={{ marginTop: '2px' }}>{countdown}</div>}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: '#e5e7eb', lineHeight: 1.3, marginBottom: '3px' }}>{e.name}</div>
            <div style={{ fontSize: '9px', color: '#9ca3af', marginBottom: '3px' }}>{e.location}</div>
            {e.description && <div style={{ fontSize: '9px', color: '#6b7280', lineHeight: 1.5 }}>{e.description}</div>}
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
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#06b6d4', letterSpacing: '1px' }}>LOOKING AHEAD</div>
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
          return renderEvent(item.event);
        })}
      </>
    );
  };

  const renderStocksTab = () => {
    return <StocksTab onOpenStocksModal={onOpenStocksModal} stocksData={stocksData} stocksLastUpdated={stocksLastUpdated} stocksUpdating={stocksUpdating} />;
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
