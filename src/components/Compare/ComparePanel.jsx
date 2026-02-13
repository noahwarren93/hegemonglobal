// ComparePanel.jsx - Slide-in comparison panel with search, radar chart, tables

import { useState, useEffect, useRef, useCallback } from 'react';
import { COUNTRIES } from '../../data/countries';
import { COMPARE_DATA } from '../../data/compareData';

const COMPARE_COLORS = ['#3b82f6', '#ef4444', '#22c55e'];

const SECTIONS = [
  { title: 'Economic', rows: [['GDP','gdp'],['GDP Growth','gdpGrowth'],['GDP/Capita','gdpPerCapita'],['Inflation','inflation'],['Unemployment','unemployment'],['Debt %GDP','debt']] },
  { title: 'Military', rows: [['Spending','milSpend'],['% GDP','milPercent'],['Personnel','milPersonnel'],['Nuclear','nuclear'],['Alliances','alliances']] },
  { title: 'Demographics', rows: [['Population','pop'],['Median Age','medianAge']] },
  { title: 'Governance', rows: [['Democracy','democracy'],['Press Freedom','pressFreedom'],['HDI','hdi']] },
  { title: 'Markets', rows: [['Stock YTD','stockYTD'],['FDI','fdi']] }
];

// ============================================================
// Radar Chart Helpers
// ============================================================

function parseToTrillions(str) {
  if (!str) return 0;
  const num = parseFloat(str.replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return 0;
  if (str.indexOf('T') !== -1) return num;
  if (str.indexOf('B') !== -1) return num / 1000;
  if (str.indexOf('M') !== -1) return num / 1000000;
  return num;
}

function getVals(name) {
  const d = COMPARE_DATA[name];
  if (!d) return [0.3, 0.3, 0.3, 0.3, 0.3, 0.3];
  const gdpT = parseToTrillions(d.gdp);
  const milT = parseToTrillions(d.milSpend);
  const fdiT = parseToTrillions(d.fdi);
  return [
    Math.min(1, gdpT / 25),
    Math.min(1, milT / 0.9),
    Math.min(1, parseFloat(d.democracy) / 10),
    Math.min(1, parseFloat(d.hdi)),
    Math.min(1, (100 - parseFloat(d.unemployment)) / 100),
    Math.min(1, fdiT / 0.3)
  ];
}

function drawRadarChart(canvas, countries) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2;
  const r = Math.min(w, h) / 2 - 40;
  ctx.clearRect(0, 0, w, h);

  const cats = ['Economy', 'Military', 'Democracy', 'Development', 'Stability', 'Trade'];
  const nc = cats.length;

  // Grid rings
  for (let lev = 1; lev <= 5; lev++) {
    ctx.beginPath();
    const lr = r * (lev / 5);
    for (let i = 0; i <= nc; i++) {
      const a = (Math.PI * 2 * i) / nc - Math.PI / 2;
      const x = cx + lr * Math.cos(a);
      const y = cy + lr * Math.sin(a);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Axis lines + labels
  for (let i = 0; i < nc; i++) {
    const a = (Math.PI * 2 * i) / nc - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
    ctx.strokeStyle = '#1f293777';
    ctx.stroke();
    ctx.fillStyle = '#6b7280';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(cats[i], cx + (r + 20) * Math.cos(a), cy + (r + 20) * Math.sin(a));
  }

  // Country polygons
  countries.forEach((name, ci) => {
    const vals = getVals(name);
    ctx.beginPath();
    vals.forEach((val, i) => {
      const a = (Math.PI * 2 * i) / nc - Math.PI / 2;
      const x = cx + r * val * Math.cos(a);
      const y = cy + r * val * Math.sin(a);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = COMPARE_COLORS[ci] + '33';
    ctx.fill();
    ctx.strokeStyle = COMPARE_COLORS[ci];
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

// ============================================================
// ComparePanel Component
// ============================================================

export default function ComparePanel({ isActive, countries, onClose, onAddCountry, onRemoveCountry, onCountryClick }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const canvasRef = useRef(null);

  // Draw radar chart when countries change
  useEffect(() => {
    if (countries.length >= 2 && canvasRef.current) {
      drawRadarChart(canvasRef.current, countries);
    }
  }, [countries]);

  // Search
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (!query || query.length < 1) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }
    const matches = Object.entries(COUNTRIES)
      .filter(([name, c]) =>
        name.toLowerCase().includes(query.toLowerCase()) ||
        c.region.toLowerCase().includes(query.toLowerCase())
      )
      .filter(([name]) => !countries.includes(name))
      .slice(0, 6);
    setSearchResults(matches);
    setShowSearch(true);
  }, [countries]);

  const handleSelectCountry = useCallback((name) => {
    onAddCountry(name);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);
  }, [onAddCountry]);

  if (!isActive || countries.length === 0) return null;

  const isExpanded = countries.length >= 2;

  return (
    <div className={`compare-panel active ${isExpanded ? 'expanded' : ''}`}>
      {/* Header */}
      <div className="compare-header">
        <div className="compare-title">Compare Countries</div>
        <button className="compare-close" onClick={onClose}>&times;</button>
      </div>

      {/* Search */}
      <div className="compare-search" style={{ position: 'relative' }}>
        <input
          type="text"
          className="compare-search-input"
          placeholder="Search countries..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {showSearch && searchResults.length > 0 && (
          <div className="compare-search-results">
            {searchResults.map(([name, c]) => (
              <div
                key={name}
                className="compare-search-item"
                onClick={() => handleSelectCountry(name)}
              >
                {c.flag} {name}
              </div>
            ))}
          </div>
        )}
        {showSearch && searchResults.length === 0 && searchQuery && (
          <div className="compare-search-results">
            <div style={{ color: '#6b7280', fontSize: '10px', padding: '8px', textAlign: 'center' }}>
              No matches
            </div>
          </div>
        )}
      </div>

      {/* Country Chips */}
      <div className="compare-countries">
        {countries.map((name, i) => {
          const c = COUNTRIES[name];
          return (
            <div
              key={name}
              className="compare-country-chip"
              style={{
                background: COMPARE_COLORS[i] + '33',
                border: '1px solid ' + COMPARE_COLORS[i]
              }}
            >
              {c ? c.flag : ''} {name}
              <button onClick={() => onRemoveCountry(name)}>&times;</button>
            </div>
          );
        })}
      </div>

      {/* Data Area */}
      {isExpanded ? (
        <div className="compare-data-area">
          {/* Radar Chart */}
          <canvas ref={canvasRef} id="radarChart" width={280} height={280} style={{ display: 'block', margin: '0 auto 12px' }} />

          {/* Comparison Tables */}
          {SECTIONS.map((section, si) => (
            <div key={si} className="compare-section">
              <div className="compare-section-title">{section.title}</div>
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    {countries.map((n, i) => (
                      <th key={n} style={{ color: COMPARE_COLORS[i] }}>{n}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map((row, ri) => (
                    <tr key={ri}>
                      <td style={{ color: '#6b7280', fontSize: '9px' }}>{row[0]}</td>
                      {countries.map(n => {
                        const d = COMPARE_DATA[n];
                        return <td key={n}>{d ? (d[row[1]] || '\u2014') : '\u2014'}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ color: '#6b7280', fontSize: '10px', textAlign: 'center', padding: '8px' }}>
          Tap another country or search above to compare
        </div>
      )}
    </div>
  );
}
