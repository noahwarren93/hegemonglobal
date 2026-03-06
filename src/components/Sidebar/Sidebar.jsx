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

export default function Sidebar({ onCountryClick, onOpenStocksModal, stocksData, stocksLastUpdated, stocksUpdating, militaryMode }) {
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

  // Force periodic re-render so timeAgo() timestamps stay current (no API calls)
  const [, setTimeTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTimeTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  // Reset visible count on tab change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE); // eslint-disable-line react-hooks/set-state-in-effect
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

  // ============================================================
  // Pakistan-Afghanistan War Data
  // ============================================================
  const PAK_AFG_TIMELINE_BASE = [
    // March 5 — Day 8
    { time: '2026-03-05T14:00:00Z', text: 'UNOCHA publishes first situation report \u2014 10 Afghan provinces affected, WFP suspends food distribution across 46 districts' },
    { time: '2026-03-05T10:00:00Z', text: 'Afghan government claims 110 civilians killed (incl. 65 women and children), 123 wounded since Feb 27' },
    // March 4 — Day 7
    { time: '2026-03-04T16:00:00Z', text: 'UN reports nearly 66,000 Afghans displaced \u2014 16,370 families across Paktia, Kunar, Nangarhar, Khost, Paktika, Nuristan' },
    { time: '2026-03-04T12:00:00Z', text: 'Afghanistan claims to shoot down Pakistani drone, captures 7 border posts' },
    { time: '2026-03-04T08:00:00Z', text: 'Seventh consecutive day of heavy shelling and border clashes along Durand Line' },
    // March 3 — Day 6
    { time: '2026-03-03T18:00:00Z', text: 'NYT satellite imagery confirms Pakistani strikes destroyed hangar and 2 warehouses at Bagram Airfield' },
    { time: '2026-03-03T14:00:00Z', text: 'Turkey offers to mediate \u2014 Erdo\u011fan calls for ceasefire and diplomatic engagement' },
    { time: '2026-03-03T10:00:00Z', text: 'Pakistan updates claims: 481 Taliban fighters killed, 696+ injured, 2 corps HQs and 3 brigade HQs destroyed' },
    // March 2 — Day 5
    { time: '2026-03-02T16:00:00Z', text: 'Afghan Taliban strikes deep into Pakistan \u2014 hits Nur Khan Airbase (Rawalpindi), 12th Division HQ (Quetta), Khwazai Camp' },
    { time: '2026-03-02T10:00:00Z', text: 'Afghan deputy spokesman: Pakistani strikes have killed 55 civilians across multiple provinces since Feb 27' },
    // March 1 — Day 4
    { time: '2026-03-01T14:00:00Z', text: 'PAF strikes hit 46 locations since operation began \u2014 including Bagram Airfield; 130 Taliban posts destroyed' },
    { time: '2026-03-01T10:00:00Z', text: 'Taliban deploys anti-aircraft and missile defense systems against PAF jets entering Afghan airspace' },
    { time: '2026-03-01T06:00:00Z', text: 'Clashes resume along border in Nangarhar, Khost, and Paktia provinces' },
    // February 28 — Day 3
    { time: '2026-02-28T16:00:00Z', text: 'Pakistan claims 32 sq km of Afghan territory south of Zhob sector \u2014 establishes "Ghudwana Enclave"' },
    { time: '2026-02-28T12:00:00Z', text: 'Afghanistan claims Pakistani F-16 shot down over Jalalabad \u2014 Pakistan denies, calls it "wartime propaganda"' },
    { time: '2026-02-28T08:00:00Z', text: 'Pakistan rejects all dialogue: "There won\'t be any talks. There\'s no dialogue. There\'s no negotiation."' },
    // February 27 — Day 2: Open War Declared
    { time: '2026-02-27T14:00:00Z', text: 'Pakistan launches Operation Ghazab Lil Haq \u2014 massive airstrikes on Kabul, Kandahar, and Paktia' },
    { time: '2026-02-27T12:00:00Z', text: 'Defence Minister Khawaja Asif declares Pakistan in "open war" with Afghanistan \u2014 "Islamabad\'s patience is exhausted"' },
    { time: '2026-02-27T10:00:00Z', text: 'Explosions rock Kabul \u2014 secondary blasts at weapons depot on western outskirts' },
    { time: '2026-02-27T08:00:00Z', text: 'Pakistan military: 274 Taliban killed, 83 posts destroyed, 17 captured in first day of operation' },
    // February 26 — Day 1
    { time: '2026-02-26T14:00:00Z', text: 'Afghanistan launches coordinated attack on 53 locations along 2,600 km Durand Line border' },
    { time: '2026-02-26T10:00:00Z', text: 'Afghan forces capture multiple Pakistani military outposts in Khyber Pakhtunkhwa' },
    { time: '2026-02-26T06:00:00Z', text: 'Afghan Defence Ministry claims 55 Pakistani soldiers killed, 19 army posts destroyed, 2 bases overrun' },
    // February 21 — Initial Strikes
    { time: '2026-02-21T02:00:00Z', text: 'PAF strikes 7 alleged TTP/ISIS-K camps in Nangarhar, Paktika, and Khost \u2014 18 civilians killed in Nangarhar' },
  ];

  const PAK_AFG_WAR_KW = ['pakistan', 'pakistani', 'afghanistan', 'afghan', 'taliban', 'kabul', 'kandahar', 'durand', 'ghazab', 'paktia', 'paktika', 'nangarhar', 'bagram', 'nur khan', 'islamabad'];
  const PAK_AFG_TIMELINE = useMemo(() => {
    const merged = [...PAK_AFG_TIMELINE_BASE];
    const baseTexts = PAK_AFG_TIMELINE_BASE.map(b => b.text.toLowerCase());

    for (const event of DAILY_EVENTS) {
      if (event.breaking) continue;
      const hl = (event.headline || '').toLowerCase();
      if (!PAK_AFG_WAR_KW.some(kw => hl.includes(kw))) continue;
      // Must relate to the war specifically
      const warTerms = ['strike', 'bomb', 'attack', 'kill', 'war', 'military', 'operation', 'border', 'clash', 'drone', 'airbase', 'troops'];
      if (!warTerms.some(t => hl.includes(t))) continue;

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

  const PAK_AFG_INTEL = {
    what: 'Pakistan declared "open war" on Afghanistan on February 27, 2026, launching Operation Ghazab Lil Haq ("Righteous Fury") with massive airstrikes on Kabul, Kandahar, and Paktia. The operation followed months of escalating TTP terrorism inside Pakistan and cross-border clashes along the Durand Line. On February 26, Afghan Taliban forces attacked 53 locations along the 2,600 km border, capturing multiple Pakistani outposts. Pakistan responded with full-scale air and ground operations, striking 46+ locations including Bagram Airfield (confirmed by NYT satellite imagery). Pakistan claims 481 Taliban fighters killed and 696+ injured, with 130+ Taliban posts destroyed. Afghanistan claims 110 civilians killed including 65 women and children. Afghan Taliban retaliated by striking deep into Pakistan \u2014 hitting Nur Khan Airbase in Rawalpindi, the 12th Division HQ in Quetta, and camps in Mohmand Agency. Pakistan claims to have seized 32 sq km of Afghan territory (the "Ghudwana Enclave"). Nearly 66,000 Afghans have been displaced across 6 provinces.',
    why: 'This is the first conventional inter-state war between Pakistan and Afghanistan\'s Taliban government \u2014 a regime Pakistan itself helped bring to power. Pakistan is a nuclear-armed state of 231 million people; Afghanistan is already in humanitarian crisis. The war threatens to destabilize the entire South Asian region. Pakistan has rejected all dialogue ("There won\'t be any talks"). WFP has suspended food distribution across 46 districts affecting 160,000 people. Health facilities including an IOM transit centre have been damaged. The conflict creates a refugee crisis on top of Afghanistan\'s existing displacement of millions. Both sides\' casualty claims are unverifiable \u2014 the fog of war is thick.',
    outlook: 'No ceasefire is in sight. Pakistan has explicitly rejected negotiations. Turkey has offered to mediate but neither side has accepted. The war is entering its second week with sustained air and ground operations. Key risks: further Afghan strikes on Pakistani military infrastructure, escalation to Pakistani cities, humanitarian catastrophe in border provinces, and the nuclear dimension \u2014 Pakistan possesses ~170 nuclear warheads. China has called for restraint given its CPEC investments in Pakistan. The international community is urging de-escalation but has limited leverage over either side.',
  };

  const openPakAfgModal = () => {
    const syntheticEvent = {
      id: 'breaking-pak-afg-war',
      headline: 'Pakistan Declares Open War on Afghanistan',
      category: 'CONFLICT',
      breaking: true,
      time: timeAgo('2026-02-27T12:00:00Z'),
      warIntel: PAK_AFG_INTEL,
      warTimeline: PAK_AFG_TIMELINE,
      articles: [],
    };
    setSelectedEvent(syntheticEvent);
  };

  const renderPakAfgCard = () => {
    const preview = 'Operation Ghazab Lil Haq. Kabul, Kandahar, Bagram hit. 481 Taliban killed (claimed). Afghan drones strike Nur Khan Airbase. 66,000 displaced. No talks \u2014 Day 8.';

    return (
      <div
        key="breaking-pak-afg-card"
        className="card"
        onClick={openPakAfgModal}
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
          <span className="card-time">{timeAgo('2026-02-27T12:00:00Z')}</span>
        </div>
        <div className="card-headline" style={{ fontWeight: 700, color: '#fca5a5' }}>
          Pakistan Declares Open War on Afghanistan
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#fca5a5', background: 'rgba(220,38,38,0.2)', padding: '2px 6px', borderRadius: '3px' }}>
            AFG: 110+ civilians killed
          </span>
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#fca5a5', background: 'rgba(220,38,38,0.2)', padding: '2px 6px', borderRadius: '3px' }}>
            66,000 displaced
          </span>
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#93c5fd', background: 'rgba(59,130,246,0.2)', padding: '2px 6px', borderRadius: '3px' }}>
            PAK: 12+ soldiers killed
          </span>
        </div>
        <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '3px', lineHeight: 1.5 }}>
          {preview}
        </div>
      </div>
    );
  };

  // ============================================================
  // Russia-Ukraine War Data (Persistent Top Story)
  // ============================================================
  const UKR_RUS_TIMELINE = [
    { time: '2026-03-05T12:00:00Z', text: 'Russia and Ukraine exchange 200 POWs each \u2014 300 more expected, agreed during Geneva round' },
    { time: '2026-02-18T12:00:00Z', text: 'Geneva talks end abruptly after 2 hours on day two \u2014 territory remains core sticking point' },
    { time: '2026-01-23T12:00:00Z', text: 'First trilateral US-Russia-Ukraine talks in Abu Dhabi \u2014 first time all three sit at same table since invasion' },
    { time: '2025-04-30T12:00:00Z', text: 'US-Ukraine minerals deal signed \u2014 Trump secures critical minerals agreement, resumes military aid' },
    { time: '2024-08-06T12:00:00Z', text: 'Ukraine launches Kursk incursion \u2014 captures ~1,300 sq km of Russian territory, first foreign occupation since WWII' },
    { time: '2024-02-17T12:00:00Z', text: 'Avdiivka falls to Russia \u2014 largest Russian advance since Bakhmut, marks shift in battlefield momentum' },
    { time: '2023-06-24T12:00:00Z', text: 'Wagner mutiny \u2014 Prigozhin marches to within 200 km of Moscow before standing down' },
    { time: '2023-06-06T12:00:00Z', text: 'Kakhovka Dam destroyed \u2014 catastrophic flooding in southern Ukraine' },
    { time: '2023-05-20T12:00:00Z', text: 'Bakhmut falls after 9 months of brutal urban combat \u2014 costliest battle of the war' },
    { time: '2022-11-11T12:00:00Z', text: 'Kherson liberated \u2014 Ukraine\u2019s most significant counteroffensive victory' },
    { time: '2022-09-30T12:00:00Z', text: 'Russia annexes Donetsk, Luhansk, Zaporizhzhia, Kherson \u2014 none fully controlled' },
    { time: '2022-04-02T12:00:00Z', text: 'Bucha massacre revealed \u2014 mass civilian killings spark international war crimes investigations' },
    { time: '2022-02-24T06:00:00Z', text: 'Russia launches full-scale invasion of Ukraine \u2014 largest European land war since WWII' },
  ];

  const UKR_RUS_INTEL = {
    what: 'Russia\'s full-scale invasion of Ukraine, launched on February 24, 2022, is now in its fourth year \u2014 the largest military conflict in Europe since WWII. Russia occupies approximately 20% of Ukraine\'s territory (~120,000 sq km). Combined casualties are approaching 2 million: Russia has lost an estimated 325,000 killed and ~1.2 million total casualties; Ukraine has suffered 500,000-600,000 total casualties. Russia gained only 49 sq mi in February 2026 \u2014 the smallest monthly gain since July 2024. Ukrainian Commander-in-Chief Syrskyi claimed Ukraine captured more territory than it lost in February 2026, with offensive operations along the southern front.',
    why: 'This conflict has fundamentally reshaped European security. Three rounds of US-brokered trilateral talks (Abu Dhabi, Geneva) have produced no breakthrough \u2014 territory remains the core sticking point. Russia demands Ukraine cede all of Donetsk, Luhansk, Zaporizhzhia, and Kherson oblasts; Ukraine refuses. Russia is now losing ~40,000 troops per month, exceeding its recruitment rate for the first time. The US-Ukraine minerals deal in April 2025 restored military aid after a freeze. France and the UK have pledged military hubs in Ukraine.',
    outlook: 'Peace talks are stalled with the next round (Abu Dhabi, early March) uncertain. A POW exchange of 500 per side was agreed at Geneva. The battlefield has reached an attritional equilibrium \u2014 neither side can achieve decisive breakthrough. Key variables: Trump\'s diplomatic leverage, Putin\'s territorial maximalism, Zelenskyy\'s red lines, European security commitments, and Russian economic sustainability under 16,000+ Western sanctions.',
  };

  const openUkrRusModal = () => {
    const syntheticEvent = {
      id: 'top-ukr-rus-war',
      headline: 'Russia-Ukraine War \u2014 Year 4',
      category: 'CONFLICT',
      breaking: true,
      time: timeAgo('2022-02-24T06:00:00Z'),
      warIntel: UKR_RUS_INTEL,
      warTimeline: UKR_RUS_TIMELINE,
      articles: [],
    };
    setSelectedEvent(syntheticEvent);
  };

  const renderUkrRusCard = () => {
    const preview = '4 years. ~2M casualties. Russia holds 20% of Ukraine. Geneva talks stalled. POW exchange of 500 agreed. Russia gaining slowest since mid-2024.';

    return (
      <div
        key="top-ukr-rus-card"
        className="card"
        onClick={openUkrRusModal}
        style={{ cursor: 'pointer', borderLeft: '2px solid #ef4444' }}
      >
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="card-cat CONFLICT">CONFLICT</span>
            <span style={{ fontSize: '8px', fontWeight: 700, color: '#9ca3af', background: 'rgba(156,163,175,0.15)', padding: '2px 5px', borderRadius: '3px', letterSpacing: '0.3px' }}>
              4 years
            </span>
          </div>
          <span className="card-time">{timeAgo('2022-02-24T06:00:00Z')}</span>
        </div>
        <div className="card-headline" style={{ fontWeight: 600 }}>
          Russia-Ukraine War {'\u2014'} Year 4
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#fca5a5', background: 'rgba(220,38,38,0.2)', padding: '2px 6px', borderRadius: '3px' }}>
            ~2M total casualties
          </span>
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#fcd34d', background: 'rgba(234,179,8,0.2)', padding: '2px 6px', borderRadius: '3px' }}>
            Peace talks stalled
          </span>
        </div>
        <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '3px', lineHeight: 1.5 }}>
          {preview}
        </div>
      </div>
    );
  };

  // Top Stories: up to 4, fixed order — Iran/PakAfg wars covered by BREAKING banners, UkrRus by persistent card
  const getStableTopStories = useCallback((events) => {
    // Filter out Iran/Gulf war events — those belong in the breaking banner
    const IRAN_WAR_KEYWORDS = ['iran', 'iranian', 'tehran', 'khamenei', 'irgc', 'strait of hormuz', 'epic fury', 'roaring lion', 'hezbollah', 'houthi', 'ras tanura', 'pezeshkian', 'beirut'];
    const PAK_AFG_KEYWORDS = ['pakistan', 'pakistani', 'afghanistan', 'afghan', 'taliban', 'kabul', 'kandahar', 'durand', 'ghazab', 'bagram', 'islamabad'];
    const UKR_RUS_KEYWORDS = ['ukraine', 'ukrainian', 'kyiv', 'zelensky', 'donbas', 'crimea', 'russia', 'russian', 'moscow', 'kremlin'];
    const isBannerWar = (e) => {
      const text = ((e.headline || '') + ' ' + (e.articles || []).map(a => (a.headline || '')).join(' ')).toLowerCase();
      return IRAN_WAR_KEYWORDS.some(kw => text.includes(kw)) ||
        PAK_AFG_KEYWORDS.some(kw => text.includes(kw)) ||
        UKR_RUS_KEYWORDS.some(kw => text.includes(kw));
    };
    const filtered = events.filter(e => !isBannerWar(e));

    const PRIORITY = [
      {
        countries: ['sudan'],
        keywords: ['sudan', 'sudanese', 'darfur', 'khartoum', 'el-fasher'],
        boost: ['genocide', 'un ', 'atrocities', 'famine', 'crisis', 'humanitarian', 'war crime'],
        penalize: ['drone'],
        fallback: null,
      },
      {
        countries: ['drc', 'congo'],
        keywords: ['congo', 'drc', 'goma', 'bukavu', 'm23', 'kivu'],
        boost: ['m23', 'rwanda', 'ceasefire', 'humanitarian', 'displaced', 'rebel'],
        penalize: [],
        fallback: null,
      },
      {
        countries: ['myanmar'],
        keywords: ['myanmar', 'burma', 'junta', 'rohingya'],
        boost: ['coup', 'resistance', 'military', 'rebel', 'offensive', 'junta'],
        penalize: [],
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
  // All timestamps are absolute ISO dates; timeAgo() computes relative display dynamically.
  const WAR_TIMELINE_BASE = [
    // March 6 — Day 7
    { time: '2026-03-06T02:00:00Z', text: 'Assembly of Experts reportedly selects Mojtaba Khamenei as new Supreme Leader — succession amid active war' },
    // March 5 — Day 6
    { time: '2026-03-05T22:00:00Z', text: 'Trump declares "no time limits" on war — demands role in choosing Iran\'s next leader, rejects Mojtaba Khamenei' },
    { time: '2026-03-05T20:00:00Z', text: 'WHO reports 13 Iranian health facilities hit by US-Israeli strikes — calls for protection of medical infrastructure' },
    { time: '2026-03-05T18:00:00Z', text: 'Iranian drones strike Azerbaijan\'s Nakhchivan airport — President Aliyev vows retaliation, calls attack "terrorism"' },
    { time: '2026-03-05T16:00:00Z', text: 'Houthis announce resumption of Red Sea shipping attacks — first since Nov 2024 pause, internal debate ongoing' },
    { time: '2026-03-05T14:00:00Z', text: 'IDF begins "broad wave of strikes" on Tehran — military chief declares "next phase" of war with 2,500+ strikes and 6,000+ weapons' },
    { time: '2026-03-05T12:00:00Z', text: 'Iranian death toll surpasses 1,230 — Tasnim reports mounting civilian casualties across 24 provinces' },
    { time: '2026-03-05T10:00:00Z', text: 'Insurance withdrawn for Hormuz transit — commercial shipping at standstill, VLCC rates hit record $423,736/day' },
    { time: '2026-03-05T08:00:00Z', text: 'QatarEnergy halts Ras Laffan LNG production after Iranian drone strike — force majeure on 20% of global LNG' },
    { time: '2026-03-05T06:00:00Z', text: 'Iran strikes hotel and residential buildings in Bahrain\'s Manama — Kuwait intercepts hostile missiles and drones' },
    { time: '2026-03-05T04:00:00Z', text: 'Brent crude rises to $85/barrel — European gas prices surge 45% after Qatar LNG halt' },
    // March 4 — Day 5
    { time: '2026-03-04T18:00:00Z', text: 'Three-day state funeral for Khamenei begins — burial planned in Mashhad' },
    { time: '2026-03-04T16:00:00Z', text: 'CIA reportedly arming Kurdish forces along Iraq-Iran border to spark internal uprising' },
    { time: '2026-03-04T14:00:00Z', text: 'US submarine torpedoes IRIS Dena off Sri Lanka — 87+ killed, first sub-sinking of warship since Falklands War' },
    { time: '2026-03-04T12:00:00Z', text: 'Hegseth says US "just getting started" — CENTCOM confirms 2,000+ targets struck across Iran' },
    { time: '2026-03-04T10:00:00Z', text: 'Iranian death toll surpasses 1,000 — hospitals overwhelmed, mass burials in multiple provinces' },
    { time: '2026-03-04T08:00:00Z', text: 'US Senate votes down War Powers Resolution — fails along party lines, Trump veto expected regardless' },
    { time: '2026-03-04T06:00:00Z', text: 'Lebanese death toll reaches 77 — Israel issues evacuation warnings south of Litani River' },
    { time: '2026-03-04T04:00:00Z', text: 'France deploys aircraft carrier Charles de Gaulle to eastern Mediterranean' },
    { time: '2026-03-04T02:00:00Z', text: 'IRGC announces ground forces entering battlefield operations — 230 drones engaged' },
    { time: '2026-03-04T00:00:00Z', text: 'French Rafale fighters shoot down Iranian drones over UAE — two French bases sustain damage' },
    // March 3 — Day 4 (late)
    { time: '2026-03-03T22:00:00Z', text: 'IRGC launches 17th wave of Operation True Promise IV — 40+ missiles at US base in Bahrain' },
    { time: '2026-03-03T20:00:00Z', text: 'IDF ground incursion into southern Lebanon — described as "forward defence" against Hezbollah' },
    // March 3 — Day 4 of war
    { time: '2026-03-03T18:00:00Z', text: 'Rubio warns "hardest hits yet to come" — US escalation in scope and intensity' },
    { time: '2026-03-03T16:00:00Z', text: 'Trump says war could last 4-5 weeks — offers US insurance for Gulf shipping and tanker escorts' },
    { time: '2026-03-03T15:00:00Z', text: 'Iranian drone strikes US Consulate parking lot in Dubai — fire erupts, all personnel accounted for' },
    { time: '2026-03-03T14:00:00Z', text: 'Satellite imagery confirms Natanz Nuclear Facility damage — IAEA says no radiological release' },
    { time: '2026-03-03T13:00:00Z', text: 'Iranian attack on UAE Fujairah Oil Industry Zone — drone intercepted, shrapnel starts fire' },
    { time: '2026-03-03T12:00:00Z', text: 'IDF claims destruction of covert nuclear weapons site "Minzadehei" near Tehran' },
    { time: '2026-03-03T11:00:00Z', text: 'US-Israel achieve air superiority over Tehran — 2,000+ targets struck since Feb 28' },
    { time: '2026-03-03T10:00:00Z', text: 'Israel strikes Beirut and Tehran simultaneously — hits IRIB broadcasting complex and Golestan Palace' },
    { time: '2026-03-03T09:00:00Z', text: 'Israel strikes Assembly of Experts building in Qom — disrupting Supreme Leader succession vote' },
    { time: '2026-03-03T08:00:00Z', text: 'Iran\'s interim leadership council formed: Pezeshkian, Mohseni-Ejei, Ayatollah Arafi' },
    { time: '2026-03-03T06:00:00Z', text: '4 US soldiers killed in drone attack in Kuwait — total 6 US service members killed' },
    { time: '2026-03-03T04:00:00Z', text: 'Iranian death toll rises to 787+ — strike on girls\' school in Minab kills 175+' },
    { time: '2026-03-03T02:00:00Z', text: 'IRGC launches 16th wave of Operation True Promise IV — missiles and drones at US/Israeli targets' },
    // March 2 — Day 3 of war
    { time: '2026-03-02T16:00:00Z', text: 'Lebanese PM Salam demands Hezbollah surrender weapons — bans all militia military activity' },
    { time: '2026-03-02T14:00:00Z', text: 'Hezbollah Secretary-General Qassem declares "duty of confronting the aggression"' },
    { time: '2026-03-02T12:00:00Z', text: 'France unveils updated nuclear doctrine — offers Gulf states defense umbrella against Iranian ballistic missiles' },
    { time: '2026-03-02T11:00:00Z', text: 'IRGC officially declares Strait of Hormuz closed — threatens to "set ships ablaze"' },
    { time: '2026-03-02T10:00:00Z', text: 'Oil prices surge past $84/barrel — analysts warn of $120-200 if Hormuz closure sustained' },
    { time: '2026-03-02T09:00:00Z', text: 'US deploys additional carrier strike group and B-2 bombers to Persian Gulf' },
    { time: '2026-03-02T08:00:00Z', text: 'Iran attacks targets across 8+ Arab states including US embassy in Riyadh' },
    { time: '2026-03-02T07:30:00Z', text: 'Dubai International Airport diverts all inbound flights amid regional escalation' },
    { time: '2026-03-02T07:00:00Z', text: 'Israeli strikes on Beirut and southern Lebanon — 31 killed, 149 wounded' },
    { time: '2026-03-02T06:00:00Z', text: 'Hezbollah launches rocket barrage into northern Israel — first attack since Nov 2024 ceasefire' },
    { time: '2026-03-02T05:15:00Z', text: 'Saudi defense ministry says air defenses repelled Iranian drones targeting Ras Tanura' },
    { time: '2026-03-02T04:30:00Z', text: 'Iran strikes Ras Tanura oil refinery in Saudi Arabia — first direct hit on Saudi oil infrastructure' },
    // March 1 — Day 2 of war
    { time: '2026-03-01T12:00:00Z', text: 'Iranian ballistic missile hits synagogue shelter in Beit Shemesh — 9 killed including 3 children' },
    { time: '2026-03-01T10:00:00Z', text: 'Iranian death toll surpasses 555 — hospitals in Tehran and Isfahan overwhelmed, morgues at capacity' },
    { time: '2026-03-01T08:00:00Z', text: 'IRGC begins electronic warfare in Strait of Hormuz — tanker traffic drops 70%' },
    { time: '2026-03-01T06:00:00Z', text: 'Heavy explosions rock Riyadh — second Iranian missile wave targets Saudi capital' },
    { time: '2026-03-01T04:00:00Z', text: '150+ ships anchored outside Strait of Hormuz to avoid combat zone' },
    { time: '2026-03-01T02:00:00Z', text: 'IRGC launches fresh missile salvos — ongoing operations across multiple fronts' },
    { time: '2026-02-28T20:00:00Z', text: 'Pezeshkian surfaces in broadcast: calls US-Israeli strikes "war against Muslims," urges Islamic world to act' },
    { time: '2026-02-28T18:00:00Z', text: 'Iranian missiles reach Mediterranean — strikes reported near Cyprus, EU calls emergency session' },
    { time: '2026-02-28T16:00:00Z', text: 'New Iranian missile salvos hit Riyadh — Saudi air defenses intercept majority but fires reported' },
    { time: '2026-02-28T14:00:00Z', text: 'IDF confirms Israeli casualties from Iranian retaliatory strikes — Iron Dome overwhelmed in south' },
    { time: '2026-02-28T12:15:00Z', text: 'IRGC threatens "most intense offensive operation" targeting Israel and US bases' },
    { time: '2026-02-28T11:15:00Z', text: 'Iran launches retaliatory strikes on Saudi Arabia, UAE, Qatar, Bahrain, Kuwait' },
    { time: '2026-02-28T10:15:00Z', text: 'Khamenei confirmed killed in Israeli strike on Tehran compound — 40+ senior officials also killed' },
    { time: '2026-02-28T10:00:00Z', text: 'Jordan intercepts 49 Iranian drones and ballistic missiles' },
    { time: '2026-02-28T09:15:00Z', text: 'Iran retaliates with hundreds of missiles and drones' },
    { time: '2026-02-28T08:15:00Z', text: 'Strikes hit 24 of 31 Iranian provinces — 200+ killed' },
    { time: '2026-02-28T08:00:00Z', text: 'Israel declares state of emergency, sirens across the country' },
    { time: '2026-02-28T06:15:00Z', text: 'Operation "Epic Fury" (US) and "Roaring Lion" (Israel) launched at 9:45 AM Iran time' },
    { time: '2026-02-28T00:00:00Z', text: 'Trump announces strikes aimed at regime change in 8-minute video' },
  ];

  // Auto-merge live Iran war articles from RSS feeds into the timeline
  const IRAN_WAR_KW = ['iran', 'iranian', 'tehran', 'khamenei', 'mojtaba', 'irgc', 'hormuz', 'epic fury', 'roaring lion', 'pezeshkian', 'hezbollah', 'ras tanura', 'ras laffan', 'beirut', 'houthi', 'iris dena', 'nakhchivan'];
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
    what: 'The United States and Israel launched coordinated military strikes on Iran on February 28, 2026, in operations codenamed "Epic Fury" (US) and "Roaring Lion" (Israel). Over 2,000 targets have been struck across 24 of 31 Iranian provinces with 2,500+ strikes and 6,000+ weapons. Supreme Leader Khamenei was killed along with 40+ senior officials including Chief of Staff Mousavi and former President Ahmadinejad. The Iranian death toll has surpassed 1,230 (Tasnim), with some estimates exceeding 7,000 (HRANA). A strike on a girls\' school in Minab killed 175+ students and staff. The Assembly of Experts has reportedly selected Mojtaba Khamenei as the new Supreme Leader. Iran retaliated across 9+ countries with 17+ waves of Operation True Promise IV \u2014 a ballistic missile hit a synagogue shelter in Beit Shemesh killing 9 including 3 children, bringing Israeli deaths to 11+. Six US service members have been killed. A US submarine torpedoed the Iranian frigate IRIS Dena off Sri Lanka, killing 87+ \u2014 the first submarine sinking of a warship since the Falklands War. The IRGC declared the Strait of Hormuz closed and insurance has been withdrawn for all transit. QatarEnergy declared force majeure after Iranian drones hit the Ras Laffan LNG complex \u2014 20% of global LNG supply offline. Iranian drones struck Azerbaijan\'s Nakhchivan airport, expanding the conflict to 10+ countries. WHO reports 13 Iranian health facilities hit. The IDF launched a ground incursion into southern Lebanon.',
    why: 'This is the most significant military confrontation in the Middle East since the 2003 Iraq invasion. Khamenei\'s assassination removes Iran\'s supreme authority after 35 years \u2014 the Assembly of Experts has reportedly selected his son Mojtaba as successor, though Trump demands a role in choosing Iran\'s next leader. The IRGC is the de facto power center. The Strait of Hormuz is commercially closed \u2014 insurance withdrawal has achieved what a physical blockade could not, with 20% of global oil transit blocked. Brent crude has spiked to $85/barrel with VLCC rates hitting an all-time record of $423,736/day. QatarEnergy\'s force majeure on Ras Laffan has taken 20% of global LNG offline, sending European gas prices up 45%. The conflict has expanded to 10+ countries with France actively shooting down Iranian drones and the US sinking an Iranian warship in the Indian Ocean. Iranian proxies are activated: Hezbollah resumed hostilities from Lebanon (77+ killed in Israeli retaliatory strikes), the IDF launched a ground incursion with evacuation warnings south of the Litani, Iraqi Shia militias declared war on US positions, Houthis threatening renewed Red Sea attacks, and the CIA arming Kurdish insurgents along the Iraq-Iran border.',
    outlook: 'Full regional war is the baseline scenario. Trump declares "no time limits" on the conflict. Active fronts: IRGC has launched 17+ waves of retaliatory strikes against Gulf infrastructure, a US submarine sank the IRIS Dena in the Indian Ocean, IDF ground forces operating in southern Lebanon with evacuation warnings south of the Litani, Houthis preparing Red Sea shipping attacks (dual Hormuz + Red Sea blockade would be unprecedented), Iranian drones hitting Azerbaijan for the first time, and the CIA arming Kurdish insurgents. France has deployed the aircraft carrier Charles de Gaulle. The Assembly of Experts has reportedly selected Mojtaba Khamenei as successor \u2014 Trump calls this "unacceptable." Iran\'s nuclear program is severely damaged but the political incentive to rebuild is absolute. Russia and China may exploit US overstretch. The risk of wider global conflict is at its highest point since the Cuban Missile Crisis.',
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
    const preview = '2,500+ strikes on Iran. 1,230+ killed. IRIS Dena sunk. Azerbaijan hit. Mojtaba Khamenei named successor. Qatar LNG halted. Hormuz insurance pulled. IDF ground incursion in Lebanon \u2014 Day 7.';

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
        <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#fca5a5', background: 'rgba(220,38,38,0.2)', padding: '2px 6px', borderRadius: '3px' }}>
            IRAN: 1,230+ killed
          </span>
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#93c5fd', background: 'rgba(59,130,246,0.2)', padding: '2px 6px', borderRadius: '3px' }}>
            ISRAEL: 11 killed
          </span>
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#93c5fd', background: 'rgba(59,130,246,0.2)', padding: '2px 6px', borderRadius: '3px' }}>
            US: 6 killed
          </span>
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

        {/* Top Stories — persistent war banners + dynamic RSS stories */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'linear-gradient(90deg, rgba(239,68,68,0.15) 0%, transparent 100%)', borderLeft: '3px solid #ef4444', marginBottom: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444', letterSpacing: '1px' }}>TOP STORIES</span>
          {DAILY_EVENTS.some(e => e.summaryLoading) && (
            <span style={{ fontSize: '8px', color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', border: '1.5px solid #1f2937', borderTopColor: '#06b6d4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              AI summaries loading
            </span>
          )}
        </div>
        {renderPakAfgCard()}
        {renderUkrRusCard()}
        {topEvents.map(event => renderEventCard(event, true))}

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
        {/* Nuclear Arsenals (military mode only, above tabs) */}
        {militaryMode && (
          <div className="nuclear-arsenals-box">
            <div className="nuclear-arsenals-title">{'\u2622'} NUCLEAR ARSENALS</div>
            <div className="nuclear-arsenals-grid">
              {NUCLEAR_ARSENALS.map(n => (
                <div key={n.country} className="nuclear-arsenals-row">
                  <span>{n.flag}</span>
                  <span>{n.country}</span>
                  <span className="nuclear-arsenals-count">{n.warheads}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '7px', color: '#4b5563', textAlign: 'center', marginTop: '4px' }}>Data as of March 2026</div>
          </div>
        )}

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
              <>{newsTimestamp}</>
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
