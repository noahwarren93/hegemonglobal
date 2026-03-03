// Sidebar.jsx - Main sidebar with 6 tabs

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { COUNTRIES, RECENT_ELECTIONS, ELECTIONS, FORECASTS, HORIZON_EVENTS, DAILY_BRIEFING, DAILY_EVENTS, lastNewsUpdate } from '../../data/countries';
import { RISK_COLORS, timeAgo } from '../../utils/riskColors';
import { renderNewsletter } from '../../services/newsService';
import { onEventsUpdated } from '../../services/apiService';
import { scoreHeadlineNeutrality } from '../../services/eventsService';
import { adjustFontSize, resetFontSize } from '../Globe/GlobeView';
import StocksTab from '../Stocks/StocksTab';
import EventModal from '../Modals/EventModal';
import CountryFlag from '../CountryFlag';


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
  const [eventsVersion, setEventsVersion] = useState(0); // force re-render when summaries arrive
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
    const IRAN_WAR_KEYWORDS = ['iran', 'iranian', 'tehran', 'khamenei', 'irgc', 'strait of hormuz', 'epic fury', 'roaring lion', 'hezbollah', 'houthi', 'ras tanura', 'pezeshkian', 'beirut'];
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
      // Primary country match (from _primaryCountry field)
      let match = sorted.find(e => !usedIds.has(e.id) &&
        req.countries.includes(e._primaryCountry));

      // Fallback: headline keyword match with score threshold
      // Only match on HEADLINE text (not all article text) to avoid false positives
      // e.g. "Belgian tanker seizes Russian ship" should NOT match Ukraine/Russia topic
      if (!match) {
        let bestCandidate = null;
        let bestScore = -Infinity;
        for (const e of sorted) {
          if (usedIds.has(e.id)) continue;
          const hl = (e.headline || '').toLowerCase();
          if (!req.keywords.some(kw => hl.includes(kw))) continue;
          // Require at least one boost keyword in headline or article text
          const fullText = getEventText(e);
          const hasBoost = req.boost.some(bw => fullText.includes(bw));
          if (!hasBoost) continue;
          const score = scoreHeadline(e.headline, req, null);
          if (score > bestScore) { bestScore = score; bestCandidate = e; }
        }
        if (bestCandidate) match = bestCandidate;
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

  // Base timeline — hardcoded foundational events. Auto-merged with live RSS below.
  const WAR_TIMELINE_BASE = [
    // March 2 \u2014 Day 3 of war
    { time: '2026-03-02T12:00:00Z', text: 'France unveils updated nuclear doctrine \u2014 offers Gulf states defense umbrella against Iranian ballistic missiles' },
    { time: '2026-03-02T11:00:00Z', text: 'EU holds emergency session on Mediterranean missile incidents \u2014 debates invoking mutual defense clause' },
    { time: '2026-03-02T10:00:00Z', text: 'Oil prices surge past $140/barrel on Strait of Hormuz fears \u2014 Brent crude hits highest level since 2008' },
    { time: '2026-03-02T09:00:00Z', text: 'US deploys additional carrier strike group and B-2 bombers to Persian Gulf' },
    { time: '2026-03-02T08:00:00Z', text: 'IRGC threatens further strikes on Gulf oil infrastructure \u2014 "all energy facilities in range"' },
    { time: '2026-03-02T07:30:00Z', text: 'Dubai International Airport diverts all inbound flights amid regional escalation' },
    { time: '2026-03-02T07:00:00Z', text: 'Israeli strikes reported across Beirut and southern Lebanon targeting Hezbollah command nodes' },
    { time: '2026-03-02T06:00:00Z', text: 'Hezbollah launches massive rocket barrage into northern Israel \u2014 hundreds of projectiles cross border' },
    { time: '2026-03-02T05:15:00Z', text: 'Saudi defense ministry says air defenses repelled Iranian drones targeting Ras Tanura' },
    { time: '2026-03-02T04:30:00Z', text: 'Iran strikes Ras Tanura oil refinery in Saudi Arabia \u2014 first direct hit on Saudi oil infrastructure, 550,000 bpd facility' },
    // March 1 \u2014 Day 2 of war
    { time: '2026-03-01T10:00:00Z', text: 'Iranian death toll surpasses 400 \u2014 hospitals in Tehran and Isfahan overwhelmed, morgues at capacity' },
    { time: '2026-03-01T08:00:00Z', text: '8 Israeli soldiers confirmed killed in IRGC retaliatory missile strikes on military installations in Negev' },
    { time: '2026-03-01T06:00:00Z', text: 'Heavy explosions rock Riyadh \u2014 second Iranian missile wave targets Saudi capital, fires reported near oil facilities' },
    { time: '2026-03-01T04:00:00Z', text: 'Strait of Hormuz partially blocked \u2014 IRGC fast-attack boats harass commercial shipping, oil hits $142/barrel' },
    { time: '2026-03-01T02:00:00Z', text: 'IRGC launches fresh missile salvos \u2014 ongoing operations across multiple fronts' },
    { time: '2026-02-28T20:00:00Z', text: 'Pezeshkian surfaces in broadcast: calls US-Israeli strikes "war against Muslims," urges Islamic world to act' },
    { time: '2026-02-28T18:00:00Z', text: 'Iranian missiles reach Mediterranean \u2014 strikes reported near Cyprus, EU calls emergency session' },
    { time: '2026-02-28T16:00:00Z', text: 'New Iranian missile salvos hit Riyadh \u2014 Saudi air defenses intercept majority but fires reported' },
    { time: '2026-02-28T14:00:00Z', text: 'IDF confirms Israeli casualties from Iranian retaliatory strikes \u2014 Iron Dome overwhelmed in south' },
    { time: '2026-02-28T12:15:00Z', text: 'IRGC threatens "most intense offensive operation" targeting Israel and US bases' },
    { time: '2026-02-28T11:15:00Z', text: 'Iran launches retaliatory strikes on Saudi Arabia, UAE, Qatar, Bahrain, Kuwait' },
    { time: '2026-02-28T10:15:00Z', text: 'Khamenei confirmed killed in Israeli strike on Tehran compound \u2014 40+ senior officials also killed' },
    { time: '2026-02-28T10:00:00Z', text: 'Jordan intercepts 49 Iranian drones and ballistic missiles' },
    { time: '2026-02-28T09:15:00Z', text: 'Iran retaliates with hundreds of missiles and drones' },
    { time: '2026-02-28T08:15:00Z', text: 'Strikes hit 24 of 31 Iranian provinces \u2014 200+ killed' },
    { time: '2026-02-28T08:00:00Z', text: 'Israel declares state of emergency, sirens across the country' },
    { time: '2026-02-28T06:15:00Z', text: 'Operation "Epic Fury" (US) and "Roaring Lion" (Israel) launched at 9:45 AM Iran time' },
    { time: '2026-02-28T00:00:00Z', text: 'Trump announces strikes aimed at regime change in 8-minute video' },
  ];

  // Auto-merge live Iran war articles from RSS feeds into the timeline
  const IRAN_WAR_KW = ['iran', 'iranian', 'tehran', 'khamenei', 'irgc', 'hormuz', 'epic fury', 'roaring lion', 'pezeshkian', 'hezbollah', 'ras tanura', 'beirut', 'houthi'];
  const TIMELINE_EXCLUDE = ['gaza ceasefire', 'ceasefire gains', 'aid workers', 'humanitarian corridor'];
  const WAR_TIMELINE = useMemo(() => {
    const merged = [...WAR_TIMELINE_BASE];
    const baseTexts = WAR_TIMELINE_BASE.map(b => b.text.toLowerCase());

    for (const event of DAILY_EVENTS) {
      if (event.breaking) continue;
      const hl = (event.headline || '').toLowerCase();
      if (!IRAN_WAR_KW.some(kw => hl.includes(kw))) continue;

      // Exclude peripheral stories that match keywords but aren't core war developments
      if (TIMELINE_EXCLUDE.some(ex => hl.includes(ex))) continue;

      // Deduplicate — skip if 3+ significant words overlap with any base entry
      const words = hl.split(/\s+/).filter(w => w.length > 3);
      const isDupe = baseTexts.some(bt => words.filter(w => bt.includes(w)).length >= 3);
      if (isDupe) continue;

      merged.push({
        time: event.pubDate || new Date().toISOString(),
        text: event.headline,
        live: true,
      });
    }

    return merged.sort((a, b) => new Date(b.time) - new Date(a.time));
  }, [eventsVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  const WAR_INTEL = {
    what: 'The United States and Israel launched coordinated military strikes on Iran on February 28, 2026, in operations codenamed "Epic Fury" (US) and "Roaring Lion" (Israel). Strikes hit 24 of 31 Iranian provinces targeting nuclear enrichment sites, IRGC command centers, air defenses, and leadership compounds. Supreme Leader Ayatollah Ali Khamenei was confirmed killed along with 40+ senior officials. The Iranian death toll has surpassed 400. On Day 3 (March 2), Iran struck the Ras Tanura oil refinery in Saudi Arabia \u2014 the first direct hit on Saudi oil infrastructure. Hezbollah launched a massive rocket barrage into northern Israel, triggering Israeli strikes across Beirut and southern Lebanon. Dubai International Airport diverted all flights. The IRGC threatened to target all Gulf energy facilities. The US deployed additional carrier assets and B-2 bombers. Oil surged past $140/barrel. The EU held an emergency session on Mediterranean missile incidents, and France unveiled an updated nuclear doctrine offering Gulf states a defense umbrella.',
    why: 'This is the most significant military confrontation in the Middle East since the 2003 Iraq invasion. Khamenei\'s assassination removes Iran\'s supreme authority after 35 years, creating a succession crisis during active war. The IRGC is now the de facto power center with every incentive to escalate. The Strait of Hormuz carries 20-30% of global oil transit and faces imminent closure risk. Iranian proxies \u2014 Hezbollah, Houthis, Iraqi Shia militias \u2014 are all activated and engaged. The Ras Tanura strike demonstrates Iran\'s willingness to target critical Gulf energy infrastructure. Oil has surged past $140/barrel. Global markets are in freefall. Six Gulf states are under direct Iranian fire.',
    outlook: 'Full regional war is the baseline scenario with no off-ramp in sight. The IRGC will escalate, not negotiate. Active fronts: sustained Iranian missile salvos against Gulf oil infrastructure, Hezbollah rocket barrages on Israel from Lebanon, Houthi closure of Red Sea shipping, attempted Strait of Hormuz blockade, and Iraqi militia attacks on US positions. France\'s nuclear doctrine offer signals NATO may be drawn in. Iran\'s nuclear program is set back but the political incentive to rebuild is now absolute. Russia and China may exploit US overstretch. The risk of wider global conflict is at its highest point since the Cuban Missile Crisis.',
  };

  const openBreakingModal = () => {
    const syntheticEvent = {
      id: 'breaking-iran-war',
      headline: 'US and Israel at War with Iran',
      category: 'CONFLICT',
      breaking: true,
      time: timeAgo('2026-02-28T06:15:00Z'),
      warIntel: WAR_INTEL,
      warTimeline: WAR_TIMELINE,
      articles: [],
    };
    setSelectedEvent(syntheticEvent);
  };

  const renderBreakingCard = () => {
    const preview = 'Iran strikes Ras Tanura refinery. Hezbollah rocket barrage on Israel. Beirut under Israeli strikes. Dubai airport diverts flights. Oil past $140. France offers Gulf nuclear umbrella. Full regional war \u2014 Day 3.';

    return (
      <div
        key="breaking-war-card"
        className="card"
        onClick={openBreakingModal}
        style={{ cursor: 'pointer', borderLeft: '3px solid #dc2626' }}
      >
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              fontSize: '8px', fontWeight: 800, color: '#fff', background: '#dc2626',
              padding: '2px 6px', borderRadius: '3px', letterSpacing: '1px'
            }}>BREAKING</span>
            <span className="card-cat CONFLICT">CONFLICT</span>
          </div>
          <span className="card-time">{timeAgo('2026-02-28T06:15:00Z')}</span>
        </div>
        <div className="card-headline" style={{ fontWeight: 700, color: '#fca5a5' }}>
          US and Israel at War with Iran
        </div>
        <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '3px', lineHeight: 1.5 }}>
          {preview}
        </div>
      </div>
    );
  };

  const renderEventsTab = () => {
    const nonBreaking = DAILY_EVENTS.filter(e => !e.breaking);
    const topEvents = DAILY_EVENTS.length > 0 ? getStableTopStories(nonBreaking) : [];
    const topIds = new Set(topEvents.map(e => e.id));
    const remaining = nonBreaking.filter(e => !topIds.has(e.id));
    const restEvents = remaining.slice(0, visibleCount);

    return (
      <>
        {/* Breaking News — ALWAYS pinned, never removed by auto-refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'linear-gradient(90deg, rgba(220,38,38,0.25) 0%, rgba(127,29,29,0.15) 50%, transparent 100%)', borderLeft: '3px solid #dc2626', marginBottom: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#dc2626', letterSpacing: '1.5px' }}>BREAKING NEWS</span>
        </div>
        {renderBreakingCard()}

        {/* Loading state — show after breaking card */}
        {DAILY_EVENTS.length === 0 && (
          <div style={{ color: '#6b7280', fontSize: '11px', textAlign: 'center', padding: '20px' }}>
            {DAILY_BRIEFING.length === 0 ? 'Loading events...' : 'Clustering articles into events...'}
          </div>
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
                <span className="election-flag"><CountryFlag flag={e.flag} /></span>
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
              <span className="election-flag"><CountryFlag flag={e.flag} /></span>
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

        {/* Content */}
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
