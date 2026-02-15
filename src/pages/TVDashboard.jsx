// TVDashboard.jsx - Full-screen TV dashboard mode with auto-cycling screens

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { COUNTRIES, FORECASTS, DAILY_BRIEFING, DAILY_BRIEFING_FALLBACK } from '../data/countries';
import { RISK_COLORS } from '../utils/riskColors';

// ============================================================
// Static Data for TV Display
// ============================================================

const RISK_ORDER = ['catastrophic', 'extreme', 'severe', 'stormy', 'cloudy', 'clear'];

const STOCKS_DATA = [
  { country: 'United States', flag: '\u{1F1FA}\u{1F1F8}', indices: [
    { name: 'Dow Jones', value: '43,287.54', change: '+0.87%', positive: true },
    { name: 'S&P 500', value: '5,918.23', change: '+0.92%', positive: true },
    { name: 'NASDAQ', value: '18,847.61', change: '+1.14%', positive: true }
  ], sentiment: 'Tech rally lifts markets amid strong earnings', sparkline: [40,55,45,60,65,58,70,75,68,80,78,85] },
  { country: 'China', flag: '\u{1F1E8}\u{1F1F3}', indices: [
    { name: 'SSE Composite', value: '3,318.07', change: '-0.34%', positive: false },
    { name: 'Hang Seng', value: '21,543.89', change: '+0.67%', positive: true }
  ], sentiment: 'Mixed signals as property sector under pressure', sparkline: [60,55,50,48,52,45,40,42,38,44,40,43] },
  { country: 'Japan', flag: '\u{1F1EF}\u{1F1F5}', indices: [
    { name: 'Nikkei 225', value: '39,149.43', change: '+1.23%', positive: true },
    { name: 'TOPIX', value: '2,756.12', change: '+0.89%', positive: true }
  ], sentiment: 'Yen weakness boosts exporters', sparkline: [50,55,60,58,65,70,68,75,72,78,80,82] },
  { country: 'United Kingdom', flag: '\u{1F1EC}\u{1F1E7}', indices: [
    { name: 'FTSE 100', value: '8,765.43', change: '+0.45%', positive: true }
  ], sentiment: 'BOE rate cut expectations support sentiment', sparkline: [60,62,58,65,63,68,70,67,72,71,74,73] },
  { country: 'European Union', flag: '\u{1F1EA}\u{1F1FA}', indices: [
    { name: 'Euro Stoxx 50', value: '5,287.34', change: '+0.56%', positive: true },
    { name: 'DAX', value: '22,147.89', change: '+0.73%', positive: true }
  ], sentiment: 'Defense stocks surge on NATO spending', sparkline: [55,58,60,62,59,65,68,64,70,72,69,74] },
  { country: 'India', flag: '\u{1F1EE}\u{1F1F3}', indices: [
    { name: 'BSE Sensex', value: '76,543.21', change: '-0.28%', positive: false },
    { name: 'Nifty 50', value: '23,187.65', change: '-0.31%', positive: false }
  ], sentiment: 'FII outflows weigh on broader market', sparkline: [70,72,68,65,63,60,58,62,55,52,54,50] },
  { country: 'Brazil', flag: '\u{1F1E7}\u{1F1F7}', indices: [
    { name: 'Bovespa', value: '127,543.21', change: '+0.89%', positive: true }
  ], sentiment: 'Commodities boost resource stocks', sparkline: [45,50,48,55,52,58,60,57,63,65,62,68] },
  { country: 'Australia', flag: '\u{1F1E6}\u{1F1FA}', indices: [
    { name: 'ASX 200', value: '8,234.56', change: '+0.34%', positive: true }
  ], sentiment: 'Mining sector leads modest gains', sparkline: [55,58,56,60,62,59,63,65,61,66,64,67] },
  { country: 'South Korea', flag: '\u{1F1F0}\u{1F1F7}', indices: [
    { name: 'KOSPI', value: '2,634.78', change: '-0.52%', positive: false }
  ], sentiment: 'Chip stocks retreat on demand concerns', sparkline: [65,62,60,58,55,53,50,52,48,46,49,45] },
  { country: 'Saudi Arabia', flag: '\u{1F1F8}\u{1F1E6}', indices: [
    { name: 'Tadawul', value: '12,187.43', change: '+0.41%', positive: true }
  ], sentiment: 'Oil price stability supports gains', sparkline: [50,52,55,53,58,60,57,62,64,61,65,63] }
];

const TV_TRADE_ROUTES = [
  { from: 'United States', to: 'China', volume: '$582B', goods: 'Electronics, Agriculture', status: 'tension' },
  { from: 'United States', to: 'Canada', volume: '$783B', goods: 'Vehicles, Oil', status: 'healthy' },
  { from: 'United States', to: 'Mexico', volume: '$687B', goods: 'Vehicles, Electronics', status: 'healthy' },
  { from: 'China', to: 'Japan', volume: '$318B', goods: 'Electronics, Chemicals', status: 'tension' },
  { from: 'United States', to: 'Japan', volume: '$248B', goods: 'Vehicles, Machinery', status: 'healthy' },
  { from: 'United States', to: 'United Kingdom', volume: '$295B', goods: 'Finance, Pharma', status: 'healthy' },
  { from: 'Russia', to: 'China', volume: '$240B', goods: 'Oil, Gas', status: 'healthy' },
  { from: 'United States', to: 'Russia', volume: '$12B', goods: 'Limited', status: 'sanctioned' },
  { from: 'Saudi Arabia', to: 'China', volume: '$98B', goods: 'Crude Oil', status: 'healthy' },
  { from: 'India', to: 'United States', volume: '$128B', goods: 'IT, Pharma', status: 'healthy' },
  { from: 'Brazil', to: 'China', volume: '$157B', goods: 'Soybeans, Iron Ore', status: 'healthy' }
];

const ALL_SCREENS = ['globe', 'headlines', 'hotspots', 'risk', 'markets', 'forecast'];
const SCREEN_LABELS = {
  globe: 'GLOBE OVERVIEW',
  headlines: 'BREAKING HEADLINES',
  hotspots: 'REGIONAL HOTSPOTS',
  risk: 'RISK ASSESSMENT',
  markets: 'MARKETS OVERVIEW',
  forecast: 'FORECAST'
};

const INTERVAL = 18000; // 18 seconds

// ============================================================
// Helpers
// ============================================================

function mapRiskToCategory(risk) {
  const map = { catastrophic: 'CONFLICT', extreme: 'CRISIS', severe: 'SECURITY', stormy: 'POLITICS', cloudy: 'ECONOMY', clear: 'DIPLOMACY' };
  return map[risk] || 'POLITICS';
}

// ============================================================
// Sub-Components
// ============================================================

function Sparkline({ data, height = 28 }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const isUp = data[data.length - 1] >= data[0];
  const color = isUp ? '#22c55e' : '#ef4444';

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height, marginTop: 10 }}>
      {data.map((v, i) => (
        <div key={i} style={{
          width: 4, borderRadius: 1, minHeight: 2,
          height: Math.max(3, ((v - min) / range) * height),
          background: color, opacity: 0.7
        }} />
      ))}
    </div>
  );
}

// Globe Screen
function GlobeScreen({ globeRef }) {
  const riskCounts = useMemo(() => {
    const counts = {};
    RISK_ORDER.forEach(r => { counts[r] = 0; });
    Object.values(COUNTRIES).forEach(c => { if (counts[c.risk] !== undefined) counts[c.risk]++; });
    return counts;
  }, []);

  const total = Object.keys(COUNTRIES).length;
  const critical = (riskCounts.catastrophic || 0) + (riskCounts.extreme || 0);

  const watchlist = useMemo(() =>
    Object.entries(COUNTRIES)
      .filter(([, c]) => c.risk === 'catastrophic' || c.risk === 'extreme')
      .slice(0, 8),
  []);

  return (
    <div className="globe-screen">
      <div className="globe-3d" ref={globeRef} />
      <div className="globe-stats">
        <div className="globe-stat-card">
          <div className="globe-stat-title">Countries Monitored</div>
          <div className="globe-stat-value" style={{ color: '#06b6d4' }}>{total}</div>
        </div>
        <div className="globe-stat-card">
          <div className="globe-stat-title">Critical Alerts</div>
          <div className="globe-stat-value" style={{ color: '#ef4444' }}>{critical}</div>
        </div>
        <div className="globe-stat-card">
          <div className="globe-stat-title">Risk Breakdown</div>
          {RISK_ORDER.map(risk => riskCounts[risk] > 0 && (
            <div key={risk} className="globe-risk-row">
              <div className="globe-risk-dot" style={{ background: RISK_COLORS[risk] }} />
              <div className="globe-risk-name">{risk.charAt(0).toUpperCase() + risk.slice(1)}</div>
              <div className="globe-risk-count" style={{ color: RISK_COLORS[risk] }}>{riskCounts[risk]}</div>
            </div>
          ))}
        </div>
        {watchlist.length > 0 && (
          <div className="globe-stat-card">
            <div className="globe-stat-title">Critical Watchlist</div>
            {watchlist.map(([name, c]) => (
              <div key={name} className="globe-risk-row">
                <span style={{ fontSize: 14 }}>{c.flag}</span>
                <div className="globe-risk-name">{name}</div>
                <div style={{ fontSize: 9, color: RISK_COLORS[c.risk], fontWeight: 700, textTransform: 'uppercase' }}>{c.risk}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Headlines Screen
function HeadlinesScreen() {
  const items = useMemo(() => {
    const briefing = DAILY_BRIEFING && DAILY_BRIEFING.length > 0 ? DAILY_BRIEFING : DAILY_BRIEFING_FALLBACK;
    if (briefing && briefing.length > 0) {
      return briefing.slice(0, 12).map(b => ({
        headline: b.headline || b.title || '',
        source: b.source || 'Unknown',
        time: b.time || '',
        category: b.category || 'POLITICS'
      }));
    }
    // Fallback: generate from country news
    const newsItems = [];
    Object.entries(COUNTRIES).forEach(([, c]) => {
      if (c.news && c.news.length > 0) {
        c.news.forEach(n => {
          newsItems.push({ headline: n.headline, source: n.source, time: n.time, category: mapRiskToCategory(c.risk) });
        });
      }
    });
    return newsItems.slice(0, 12);
  }, []);

  return (
    <div className="news-screen">
      <div className="news-header-row">
        <div className="news-title">BREAKING HEADLINES</div>
        <div className="news-subtitle">Live feed</div>
      </div>
      <div className="news-grid">
        {items.map((item, i) => (
          <div key={i} className="news-card">
            <span className={`news-card-cat ${item.category}`}>{item.category}</span>
            <div className="news-card-headline">{item.headline}</div>
            <div className="news-card-meta">
              <span>{item.source}</span>
              <span>{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Regional Hotspots Screen
function HotspotsScreen() {
  const regions = useMemo(() => {
    const regionMap = {};
    Object.entries(COUNTRIES).forEach(([name, c]) => {
      const region = c.region || 'Other';
      if (!regionMap[region]) regionMap[region] = [];
      regionMap[region].push({ name, ...c });
    });
    const riskPriority = { catastrophic: 0, extreme: 1, severe: 2, stormy: 3, cloudy: 4, clear: 5 };
    return Object.entries(regionMap)
      .map(([region, countries]) => {
        const sorted = countries.sort((a, b) => (riskPriority[a.risk] || 5) - (riskPriority[b.risk] || 5));
        const worstRisk = sorted[0]?.risk || 'clear';
        const criticalCount = countries.filter(c => c.risk === 'catastrophic' || c.risk === 'extreme').length;
        return { region, countries: sorted, worstRisk, criticalCount };
      })
      .sort((a, b) => (riskPriority[a.worstRisk] || 5) - (riskPriority[b.worstRisk] || 5));
  }, []);

  return (
    <div className="risk-screen">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#06b6d4', letterSpacing: 1 }}>REGIONAL HOTSPOTS</div>
      </div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 12, overflow: 'hidden', alignContent: 'start' }}>
        {regions.slice(0, 8).map(({ region, countries, worstRisk, criticalCount }) => (
          <div key={region} className="risk-tier" style={{ borderLeft: `3px solid ${RISK_COLORS[worstRisk] || '#3b82f6'}` }}>
            <div className="risk-tier-header">
              <div className="risk-tier-dot" style={{ background: RISK_COLORS[worstRisk] }} />
              <div className="risk-tier-name" style={{ color: RISK_COLORS[worstRisk] }}>{region}</div>
              <div className="risk-tier-count">
                {criticalCount > 0 && <span style={{ color: '#ef4444', marginRight: 8 }}>{criticalCount} critical</span>}
                {countries.length} countries
              </div>
            </div>
            <div className="risk-tier-countries">
              {countries.slice(0, 10).map(c => (
                <div key={c.name} className="risk-country-chip" style={{ borderColor: (RISK_COLORS[c.risk] || '#3b82f6') + '66' }}>
                  <span className="flag">{c.flag}</span>
                  {c.name}
                  <span style={{ fontSize: 8, color: RISK_COLORS[c.risk], fontWeight: 700 }}>{c.risk.toUpperCase()}</span>
                </div>
              ))}
              {countries.length > 10 && (
                <div className="risk-country-chip" style={{ color: '#6b7280', fontSize: 10 }}>+{countries.length - 10} more</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Risk Matrix Screen
function RiskScreen() {
  const tiers = useMemo(() => {
    const grouped = {};
    RISK_ORDER.forEach(r => { grouped[r] = []; });
    Object.entries(COUNTRIES).forEach(([name, c]) => {
      if (grouped[c.risk]) grouped[c.risk].push({ name, flag: c.flag, region: c.region });
    });
    return grouped;
  }, []);

  return (
    <div className="risk-screen">
      <div style={{ fontSize: 18, fontWeight: 700, color: '#06b6d4', letterSpacing: 1, marginBottom: 4 }}>GLOBAL RISK MATRIX</div>
      <div className="risk-tiers">
        {RISK_ORDER.map(risk => tiers[risk].length > 0 && (
          <div key={risk} className="risk-tier">
            <div className="risk-tier-header">
              <div className="risk-tier-dot" style={{ background: RISK_COLORS[risk] }} />
              <div className="risk-tier-name" style={{ color: RISK_COLORS[risk] }}>{risk}</div>
              <div className="risk-tier-count">{tiers[risk].length} countries</div>
            </div>
            <div className="risk-tier-countries">
              {tiers[risk].map(c => (
                <div key={c.name} className="risk-country-chip">
                  <span className="flag">{c.flag}</span>{c.name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Markets Screen
function MarketsScreen() {
  return (
    <div className="markets-screen">
      <div className="markets-grid">
        {STOCKS_DATA.map((s, i) => (
          <div key={i} className="market-card">
            <div className="market-card-header">
              <span className="market-flag">{s.flag}</span>
              <div>
                <div className="market-country">{s.country}</div>
                <div className="market-sentiment">{s.sentiment}</div>
              </div>
            </div>
            <div className="market-indices">
              {s.indices.map((idx, j) => (
                <div key={j} className="market-index">
                  <span className="market-index-name">{idx.name}</span>
                  <span className="market-index-val">{idx.value}</span>
                  <span className={`market-index-change ${idx.positive ? 'up' : 'down'}`}>{idx.change}</span>
                </div>
              ))}
            </div>
            <Sparkline data={s.sparkline} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Forecast Screen
function ForecastScreen() {
  const dirArrow = (dir) => {
    if (dir === 'up') return { symbol: '\u2191', color: '#ef4444' };
    if (dir === 'down') return { symbol: '\u2193', color: '#22c55e' };
    return { symbol: '\u2192', color: '#f59e0b' };
  };

  return (
    <div className="risk-screen">
      <div style={{ fontSize: 18, fontWeight: 700, color: '#06b6d4', letterSpacing: 1, marginBottom: 4 }}>STRATEGIC FORECAST</div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: 14, overflow: 'auto', alignContent: 'start' }}>
        {FORECASTS.map((f, i) => (
          <div key={i} className="market-card" style={{ borderLeft: `3px solid ${RISK_COLORS[f.risk] || '#3b82f6'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div className="risk-tier-dot" style={{ background: RISK_COLORS[f.risk] }} />
              <div style={{ fontSize: 15, fontWeight: 700, color: '#e5e7eb' }}>{f.region}</div>
              <div style={{ fontSize: 9, color: RISK_COLORS[f.risk], fontWeight: 700, textTransform: 'uppercase', marginLeft: 'auto' }}>{f.risk}</div>
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.5, marginBottom: 8 }}>{f.current}</div>
            <div style={{ fontSize: 11, color: '#d1d5db', lineHeight: 1.5, marginBottom: 10, fontStyle: 'italic' }}>{f.forecast}</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {f.indicators && f.indicators.map((ind, j) => {
                const { symbol, color } = dirArrow(ind.dir);
                return (
                  <div key={j} style={{
                    fontSize: 10, padding: '3px 8px', borderRadius: 4,
                    background: color + '15', color, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 4
                  }}>
                    {ind.text} <span style={{ fontSize: 12 }}>{symbol}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Bottom Ticker
function BottomTicker() {
  const totalIndices = STOCKS_DATA.reduce((sum, s) => sum + s.indices.length, 0);
  const duration = Math.max(30, totalIndices * 3) + 's';

  return (
    <div className="tv-ticker">
      <div className="tv-ticker-label">MARKETS</div>
      <div style={{ overflow: 'hidden', flex: 1 }}>
        <div className="tv-ticker-scroll" style={{ '--ticker-duration': duration }}>
          {[0, 1].map(rep =>
            STOCKS_DATA.map((s, si) =>
              s.indices.map((idx, ii) => (
                <span key={`${rep}-${si}-${ii}`} style={{ display: 'contents' }}>
                  <div className="tv-ticker-item">
                    <span className="tv-ticker-name">{idx.name}</span>
                    <span className="tv-ticker-value">{idx.value}</span>
                    <span className={`tv-ticker-change ${idx.positive ? 'up' : 'down'}`}>{idx.change}</span>
                  </div>
                  <span className="tv-ticker-sep">{'\u00B7'}</span>
                </span>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main TVDashboard Component
// ============================================================

export default function TVDashboard() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [paused, setPaused] = useState(false);
  const [clock, setClock] = useState('');
  const [date, setDate] = useState('');
  const [progress, setProgress] = useState(0);

  const progressStartRef = useRef(Date.now());
  const globeContainerRef = useRef(null);
  const tvRendererRef = useRef(null);
  const tvSceneRef = useRef(null);
  const tvCameraRef = useRef(null);
  const tvGlobeRef = useRef(null);
  const globeAnimRef = useRef(null);
  const globeInitedRef = useRef(false);

  // Clock update
  useEffect(() => {
    function tick() {
      const now = new Date();
      setClock(now.toLocaleTimeString('en-US', { hour12: false }));
      setDate(now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Screen rotation
  useEffect(() => {
    if (paused) return;
    progressStartRef.current = Date.now();

    const rotationId = setInterval(() => {
      setCurrentScreen(prev => (prev + 1) % ALL_SCREENS.length);
      progressStartRef.current = Date.now();
    }, INTERVAL);

    const progressId = setInterval(() => {
      const elapsed = Date.now() - progressStartRef.current;
      setProgress(Math.min(100, (elapsed / INTERVAL) * 100));
    }, 50);

    return () => {
      clearInterval(rotationId);
      clearInterval(progressId);
    };
  }, [paused]);

  // Reset progress when screen changes
  useEffect(() => {
    progressStartRef.current = Date.now();
    setProgress(0);
  }, [currentScreen]);

  // Keyboard controls
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'ArrowRight') {
        setCurrentScreen(prev => (prev + 1) % ALL_SCREENS.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentScreen(prev => (prev - 1 + ALL_SCREENS.length) % ALL_SCREENS.length);
      } else if (e.key === ' ') {
        e.preventDefault();
        setPaused(p => !p);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Three.js Globe
  const initGlobe = useCallback(() => {
    const container = globeContainerRef.current;
    if (!container || globeInitedRef.current) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;

    globeInitedRef.current = true;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    camera.position.z = 2.6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(5, 3, 5);
    scene.add(dir);

    const earthGeom = new THREE.SphereGeometry(1, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({ color: 0x111122, emissive: 0x050510, specular: 0x222244, shininess: 15 });
    const globe = new THREE.Mesh(earthGeom, earthMat);
    scene.add(globe);

    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    loader.load('https://unpkg.com/three-globe@2.24.4/example/img/earth-blue-marble.jpg', (tex) => {
      earthMat.map = tex;
      earthMat.color.set(0xffffff);
      earthMat.emissive.set(0x000000);
      earthMat.needsUpdate = true;
    });

    // Atmosphere
    const glowGeom = new THREE.SphereGeometry(1.02, 64, 64);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.04, side: THREE.BackSide });
    scene.add(new THREE.Mesh(glowGeom, glowMat));

    // Country markers
    Object.entries(COUNTRIES).forEach(([, c]) => {
      const phi = (90 - c.lat) * Math.PI / 180;
      const theta = (c.lng + 180) * Math.PI / 180;
      const x = -(1.02) * Math.sin(phi) * Math.cos(theta);
      const y = (1.02) * Math.cos(phi);
      const z = (1.02) * Math.sin(phi) * Math.sin(theta);

      const markerGeom = new THREE.SphereGeometry(0.015, 8, 8);
      const col = RISK_COLORS[c.risk] || '#3b82f6';
      const markerMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(col) });
      const marker = new THREE.Mesh(markerGeom, markerMat);
      marker.position.set(x, y, z);
      globe.add(marker);
    });

    tvSceneRef.current = scene;
    tvCameraRef.current = camera;
    tvRendererRef.current = renderer;
    tvGlobeRef.current = globe;
  }, []);

  // Globe animation start/stop
  const startGlobeAnim = useCallback(() => {
    if (globeAnimRef.current) return;
    function animate() {
      globeAnimRef.current = requestAnimationFrame(animate);
      if (tvGlobeRef.current) tvGlobeRef.current.rotation.y += 0.001;
      if (tvRendererRef.current && tvSceneRef.current && tvCameraRef.current) {
        tvRendererRef.current.render(tvSceneRef.current, tvCameraRef.current);
      }
    }
    animate();
  }, []);

  const stopGlobeAnim = useCallback(() => {
    if (globeAnimRef.current) {
      cancelAnimationFrame(globeAnimRef.current);
      globeAnimRef.current = null;
    }
  }, []);

  // Manage globe lifecycle based on active screen
  useEffect(() => {
    if (ALL_SCREENS[currentScreen] === 'globe') {
      const t = setTimeout(() => {
        initGlobe();
        startGlobeAnim();
      }, 100);
      return () => clearTimeout(t);
    } else {
      stopGlobeAnim();
    }
  }, [currentScreen, initGlobe, startGlobeAnim, stopGlobeAnim]);

  // Handle resize for globe
  useEffect(() => {
    function handleResize() {
      const container = globeContainerRef.current;
      if (!container || !tvRendererRef.current || !tvCameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      tvCameraRef.current.aspect = w / h;
      tvCameraRef.current.updateProjectionMatrix();
      tvRendererRef.current.setSize(w, h);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cleanup Three.js on unmount
  useEffect(() => {
    return () => {
      stopGlobeAnim();
      if (tvRendererRef.current) {
        tvRendererRef.current.dispose();
        tvRendererRef.current = null;
      }
      globeInitedRef.current = false;
    };
  }, [stopGlobeAnim]);

  const screenName = ALL_SCREENS[currentScreen];

  return (
    <>
      <style>{TV_STYLES}</style>

      {/* Top Bar */}
      <div className="tv-topbar">
        <div>
          <div className="tv-logo">
            HEGEMON
            <span className="tv-logo-sub">TV DASHBOARD</span>
          </div>
        </div>
        <div className="tv-center">
          <div className="tv-clock">{clock}</div>
          <div className="tv-date">{date}</div>
        </div>
        <div className="tv-right">
          <div className="tv-live">
            <div className="tv-live-dot" />
            {paused ? 'PAUSED' : 'LIVE'}
          </div>
          <div>
            <div className="tv-screen-label">{SCREEN_LABELS[screenName]}</div>
            <div className="tv-screen-dots">
              {ALL_SCREENS.map((_, i) => (
                <div key={i} className={`tv-dot${i === currentScreen ? ' active' : ''}`} onClick={() => setCurrentScreen(i)} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="tv-progress">
        <div className="tv-progress-bar" style={{ width: progress + '%' }} />
      </div>

      {/* Main Content */}
      <div className="tv-main">
        <div className={`tv-screen${screenName === 'globe' ? ' active' : ''}`}>
          <GlobeScreen globeRef={globeContainerRef} />
        </div>
        <div className={`tv-screen${screenName === 'headlines' ? ' active' : ''}`}>
          <HeadlinesScreen />
        </div>
        <div className={`tv-screen${screenName === 'hotspots' ? ' active' : ''}`}>
          <HotspotsScreen />
        </div>
        <div className={`tv-screen${screenName === 'risk' ? ' active' : ''}`}>
          <RiskScreen />
        </div>
        <div className={`tv-screen${screenName === 'markets' ? ' active' : ''}`}>
          <MarketsScreen />
        </div>
        <div className={`tv-screen${screenName === 'forecast' ? ' active' : ''}`}>
          <ForecastScreen />
        </div>
      </div>

      {/* Bottom Ticker */}
      <BottomTicker />

      {/* Watermark */}
      <div className="tv-watermark">HEGEMON GLOBAL</div>
    </>
  );
}

// ============================================================
// Embedded Styles
// ============================================================

const TV_STYLES = `
  /* ===== TOP BAR ===== */
  .tv-topbar { position: fixed; top: 0; left: 0; right: 0; height: 56px; background: linear-gradient(180deg, rgba(5,5,8,0.98) 0%, rgba(5,5,8,0.85) 100%); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: space-between; padding: 0 32px; z-index: 100; border-bottom: 1px solid #1f2937; }
  .tv-logo { font-size: 22px; font-weight: 800; color: #06b6d4; letter-spacing: 3px; display: flex; align-items: center; gap: 12px; }
  .tv-logo-sub { font-size: 9px; color: #64748b; letter-spacing: 2px; font-weight: 600; }
  .tv-live { display: flex; align-items: center; gap: 6px; font-size: 10px; color: #22c55e; font-weight: 700; letter-spacing: 1px; }
  .tv-live-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; animation: tvPulse 1.5s infinite; box-shadow: 0 0 10px #22c55e; }
  @keyframes tvPulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  .tv-center { text-align: center; }
  .tv-clock { font-size: 28px; font-weight: 300; color: #f3f4f6; letter-spacing: 2px; font-variant-numeric: tabular-nums; }
  .tv-date { font-size: 11px; color: #6b7280; margin-top: 2px; letter-spacing: 1px; }
  .tv-right { display: flex; align-items: center; gap: 20px; }
  .tv-screen-label { font-size: 10px; color: #9ca3af; letter-spacing: 1px; font-weight: 600; text-transform: uppercase; }
  .tv-screen-dots { display: flex; gap: 6px; margin-top: 4px; }
  .tv-dot { width: 8px; height: 8px; border-radius: 50%; background: #1f2937; transition: all 0.3s; cursor: pointer; }
  .tv-dot.active { background: #06b6d4; box-shadow: 0 0 8px #06b6d4; }

  /* ===== PROGRESS BAR ===== */
  .tv-progress { position: fixed; top: 56px; left: 0; right: 0; height: 3px; background: #111827; z-index: 100; }
  .tv-progress-bar { height: 100%; background: linear-gradient(90deg, #06b6d4, #3b82f6); transition: width 0.3s linear; }

  /* ===== MAIN CONTENT ===== */
  .tv-main { position: fixed; top: 59px; left: 0; right: 0; bottom: 48px; overflow: hidden; }
  .tv-screen { position: absolute; inset: 0; opacity: 0; transition: opacity 0.8s ease-in-out; pointer-events: none; padding: 24px 32px; overflow: hidden; }
  .tv-screen.active { opacity: 1; pointer-events: auto; }

  /* ===== BOTTOM TICKER ===== */
  .tv-ticker { position: fixed; bottom: 0; left: 0; right: 0; height: 48px; background: linear-gradient(0deg, rgba(5,5,8,0.98) 0%, rgba(5,5,8,0.9) 100%); backdrop-filter: blur(12px); border-top: 1px solid #1f2937; display: flex; align-items: center; overflow: hidden; z-index: 100; }
  .tv-ticker-label { background: #06b6d4; color: #000; font-size: 10px; font-weight: 800; padding: 4px 12px; letter-spacing: 1px; flex-shrink: 0; height: 100%; display: flex; align-items: center; }
  .tv-ticker-scroll { display: flex; animation: tvTickerScroll var(--ticker-duration, 60s) linear infinite; white-space: nowrap; }
  .tv-ticker-item { display: flex; align-items: center; gap: 8px; padding: 0 24px; font-size: 13px; flex-shrink: 0; }
  .tv-ticker-name { color: #9ca3af; font-weight: 500; }
  .tv-ticker-value { color: #e5e7eb; font-weight: 700; }
  .tv-ticker-change { font-weight: 700; font-size: 12px; }
  .tv-ticker-change.up { color: #22c55e; }
  .tv-ticker-change.down { color: #ef4444; }
  .tv-ticker-sep { color: #374151; font-size: 18px; flex-shrink: 0; }
  @keyframes tvTickerScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

  /* ===== GLOBE SCREEN ===== */
  .globe-screen { display: flex; gap: 24px; height: 100%; }
  .globe-3d { flex: 1; position: relative; border-radius: 16px; overflow: hidden; background: #070710; }
  .globe-3d canvas { width: 100% !important; height: 100% !important; }
  .globe-stats { width: 320px; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; }
  .globe-stat-card { background: rgba(15,15,25,0.9); border: 1px solid #1f2937; border-radius: 12px; padding: 16px; }
  .globe-stat-title { font-size: 10px; color: #6b7280; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
  .globe-stat-value { font-size: 32px; font-weight: 700; }
  .globe-stat-label { font-size: 11px; color: #9ca3af; margin-top: 2px; }
  .globe-risk-row { display: flex; align-items: center; gap: 10px; padding: 6px 0; border-bottom: 1px solid #1f293744; }
  .globe-risk-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .globe-risk-name { font-size: 11px; color: #d1d5db; flex: 1; }
  .globe-risk-count { font-size: 14px; font-weight: 700; }

  /* ===== MARKETS SCREEN ===== */
  .markets-screen { height: 100%; overflow: hidden; }
  .markets-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; height: 100%; overflow-y: auto; align-content: start; }
  .market-card { background: rgba(15,15,25,0.9); border: 1px solid #1f2937; border-radius: 12px; padding: 18px; transition: border-color 0.3s; }
  .market-card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
  .market-flag { font-size: 28px; }
  .market-country { font-size: 14px; font-weight: 700; color: #e5e7eb; }
  .market-sentiment { font-size: 9px; color: #6b7280; font-style: italic; margin-top: 2px; }
  .market-indices { display: flex; flex-direction: column; gap: 8px; }
  .market-index { display: flex; align-items: center; justify-content: space-between; }
  .market-index-name { font-size: 11px; color: #9ca3af; font-weight: 500; }
  .market-index-val { font-size: 14px; font-weight: 700; color: #e5e7eb; }
  .market-index-change { font-size: 12px; font-weight: 700; }
  .market-index-change.up { color: #22c55e; }
  .market-index-change.down { color: #ef4444; }

  /* ===== NEWS SCREEN ===== */
  .news-screen { height: 100%; display: flex; flex-direction: column; gap: 12px; overflow: hidden; }
  .news-header-row { display: flex; align-items: center; justify-content: space-between; }
  .news-title { font-size: 18px; font-weight: 700; color: #06b6d4; letter-spacing: 1px; }
  .news-subtitle { font-size: 11px; color: #6b7280; }
  .news-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; flex: 1; overflow: hidden; align-content: start; }
  .news-card { background: rgba(15,15,25,0.9); border: 1px solid #1f2937; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; }
  .news-card-cat { font-size: 9px; font-weight: 700; letter-spacing: 1px; padding: 3px 8px; border-radius: 4px; display: inline-block; margin-bottom: 8px; width: fit-content; text-transform: uppercase; }
  .news-card-cat.CONFLICT { background: rgba(239,68,68,0.15); color: #ef4444; }
  .news-card-cat.CRISIS { background: rgba(249,115,22,0.15); color: #f97316; }
  .news-card-cat.SECURITY { background: rgba(234,179,8,0.15); color: #eab308; }
  .news-card-cat.POLITICS { background: rgba(59,130,246,0.15); color: #3b82f6; }
  .news-card-cat.ECONOMY { background: rgba(34,197,94,0.15); color: #22c55e; }
  .news-card-cat.DIPLOMACY { background: rgba(139,92,246,0.15); color: #8b5cf6; }
  .news-card-cat.SOCIETY { background: rgba(6,182,212,0.15); color: #06b6d4; }
  .news-card-cat.ENVIRONMENT { background: rgba(16,185,129,0.15); color: #10b981; }
  .news-card-cat.TECH { background: rgba(168,85,247,0.15); color: #a855f7; }
  .news-card-headline { font-size: 14px; font-weight: 600; color: #e5e7eb; line-height: 1.4; flex: 1; }
  .news-card-meta { display: flex; align-items: center; justify-content: space-between; margin-top: 10px; font-size: 10px; color: #6b7280; }

  /* ===== RISK SCREEN ===== */
  .risk-screen { height: 100%; overflow: hidden; display: flex; flex-direction: column; gap: 16px; }
  .risk-tiers { flex: 1; display: flex; flex-direction: column; gap: 12px; overflow: hidden; }
  .risk-tier { background: rgba(15,15,25,0.6); border: 1px solid #1f2937; border-radius: 10px; padding: 12px 16px; }
  .risk-tier-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .risk-tier-dot { width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0; }
  .risk-tier-name { font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
  .risk-tier-count { font-size: 11px; color: #6b7280; margin-left: auto; }
  .risk-tier-countries { display: flex; flex-wrap: wrap; gap: 6px; }
  .risk-country-chip { display: flex; align-items: center; gap: 5px; background: rgba(255,255,255,0.05); border: 1px solid #1f293766; border-radius: 6px; padding: 4px 10px; font-size: 11px; color: #d1d5db; }
  .risk-country-chip .flag { font-size: 14px; }

  /* ===== WATERMARK ===== */
  .tv-watermark { position: fixed; bottom: 56px; right: 20px; font-size: 10px; color: #1f2937; letter-spacing: 2px; font-weight: 600; z-index: 50; pointer-events: none; }
`;
