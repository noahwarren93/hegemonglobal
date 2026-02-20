// StocksModal.jsx - Detailed stock view modal with SVG line chart

import { useState, useEffect, useCallback } from 'react';
import { STOCKS_DETAIL, MARKET_CONFIG } from '../../data/stocksData';
import { getMarketStatus, fetchChartData, formatStockPrice } from '../../services/stocksService';

const TIME_RANGES = [
  { key: '1D', range: '1d', interval: '5m' },
  { key: '1W', range: '5d', interval: '1h' },
  { key: '1M', range: '1mo', interval: '1d' },
  { key: '1Y', range: '1y', interval: '1wk' },
];

// ============================================================
// Smooth SVG Path (Catmull-Rom to Cubic Bezier)
// ============================================================

function buildSmoothPath(points) {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M${points[0].x},${points[0].y}L${points[1].x},${points[1].y}`;
  }
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += `C${cp1x},${cp1y},${cp2x},${cp2y},${p2.x},${p2.y}`;
  }
  return d;
}

// ============================================================
// Y-Axis Label Formatting
// ============================================================

function formatYLabel(val) {
  if (Math.abs(val) >= 10000) return val.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (Math.abs(val) >= 100) return val.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ============================================================
// X-Axis Label Formatting
// ============================================================

function formatXLabel(timestamp, rangeKey) {
  const d = new Date(timestamp * 1000);
  switch (rangeKey) {
    case '1D': return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    case '1W': return d.toLocaleDateString('en-US', { weekday: 'short' });
    case '1M': return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case '1Y': return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    default: return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

// ============================================================
// SVG Line Chart Component
// ============================================================

function StockChart({ chartData, rangeKey }) {
  const [hoverIdx, setHoverIdx] = useState(null);

  if (!chartData || !chartData.closes || chartData.closes.length < 2) {
    return (
      <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', fontSize: '10px' }}>
        No chart data available
      </div>
    );
  }

  const W = 400, H = 180;
  const PAD = { top: 10, right: 10, bottom: 24, left: 52 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;

  const { closes, timestamps } = chartData;
  const minVal = Math.min(...closes);
  const maxVal = Math.max(...closes);
  const valRange = maxVal - minVal || 1;
  const yPad = valRange * 0.06;
  const yMin = minVal - yPad;
  const yMax = maxVal + yPad;
  const yRange = yMax - yMin;

  const points = closes.map((v, i) => ({
    x: PAD.left + (i / (closes.length - 1)) * cW,
    y: PAD.top + (1 - (v - yMin) / yRange) * cH
  }));

  const linePath = buildSmoothPath(points);
  const bottom = PAD.top + cH;
  const fillPath = linePath + `L${points[points.length - 1].x},${bottom}L${points[0].x},${bottom}Z`;

  const isUp = closes[closes.length - 1] >= closes[0];
  const color = isUp ? '#22c55e' : '#ef4444';

  // Grid lines (4 horizontal)
  const grids = [];
  for (let i = 0; i <= 3; i++) {
    const y = PAD.top + (i / 3) * cH;
    const val = yMax - (i / 3) * yRange;
    grids.push({ y, label: formatYLabel(val) });
  }

  // X-axis labels (5 evenly spaced)
  const xLabels = [];
  if (timestamps && timestamps.length >= 2) {
    const n = Math.min(5, timestamps.length);
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(i * (timestamps.length - 1) / (n - 1));
      xLabels.push({
        x: PAD.left + (idx / (closes.length - 1)) * cW,
        label: formatXLabel(timestamps[idx], rangeKey)
      });
    }
  }

  // Mouse hover for tooltip
  const handleMouseMove = (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const svgX = (e.clientX - rect.left) / rect.width * W;
    const chartX = svgX - PAD.left;
    if (chartX < 0 || chartX > cW) { setHoverIdx(null); return; }
    const idx = Math.round((chartX / cW) * (closes.length - 1));
    setHoverIdx(Math.max(0, Math.min(closes.length - 1, idx)));
  };

  // Tooltip data
  let ttip = null;
  if (hoverIdx !== null && points[hoverIdx]) {
    const px = points[hoverIdx].x;
    const py = points[hoverIdx].y;
    const above = py - 34 > 2;
    const ty = above ? py - 34 : py + 8;
    const anchor = px < PAD.left + 50 ? 'start' : px > W - PAD.right - 50 ? 'end' : 'middle';
    const rx = anchor === 'start' ? px - 4 : anchor === 'end' ? px - 74 : px - 39;
    const tx = anchor === 'start' ? px + 2 : anchor === 'end' ? px - 37 : px;
    let priceStr = formatStockPrice(closes[hoverIdx]);
    let dateStr = '';
    if (timestamps && timestamps[hoverIdx]) {
      const d = new Date(timestamps[hoverIdx] * 1000);
      dateStr = rangeKey === '1D'
        ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    ttip = { px, py, ty, rx, tx, anchor, priceStr, dateStr };
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', cursor: 'crosshair' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverIdx(null)}
    >
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {grids.map((g, i) => (
        <g key={i}>
          <line x1={PAD.left} y1={g.y} x2={PAD.left + cW} y2={g.y} stroke="#1f2937" strokeWidth="0.5" />
          <text x={PAD.left - 5} y={g.y + 3} textAnchor="end" fontSize="7" fill="#4b5563" fontFamily="system-ui, sans-serif">{g.label}</text>
        </g>
      ))}
      {/* Fill area under curve */}
      <path d={fillPath} fill="url(#chartFill)" />
      {/* Line */}
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Current price dashed line */}
      <line
        x1={PAD.left} y1={points[points.length - 1].y}
        x2={PAD.left + cW} y2={points[points.length - 1].y}
        stroke={color} strokeWidth="0.5" strokeDasharray="3,3" opacity="0.4"
      />
      {/* Tooltip */}
      {ttip && (
        <g>
          <line x1={ttip.px} y1={PAD.top} x2={ttip.px} y2={bottom} stroke="#6b7280" strokeWidth="0.5" strokeDasharray="2,2" />
          <circle cx={ttip.px} cy={ttip.py} r="3" fill={color} stroke="#111827" strokeWidth="1.5" />
          <rect x={ttip.rx} y={ttip.ty} width="78" height="22" rx="3" fill="#1f2937ee" stroke="#374151" strokeWidth="0.5" />
          <text x={ttip.tx} y={ttip.ty + 10} textAnchor={ttip.anchor} fontSize="8" fontWeight="700" fill="#e5e7eb" fontFamily="system-ui, sans-serif">{ttip.priceStr}</text>
          <text x={ttip.tx} y={ttip.ty + 18} textAnchor={ttip.anchor} fontSize="6.5" fill="#6b7280" fontFamily="system-ui, sans-serif">{ttip.dateStr}</text>
        </g>
      )}
      {/* X labels */}
      {xLabels.map((l, i) => (
        <text key={i} x={l.x} y={bottom + 14} textAnchor="middle" fontSize="7" fill="#4b5563" fontFamily="system-ui, sans-serif">{l.label}</text>
      ))}
    </svg>
  );
}

// ============================================================
// Main Modal Component
// ============================================================

export default function StocksModal({ country, stocksData, lastUpdated, isOpen, onClose }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [rangeKey, setRangeKey] = useState('1W');
  const [chartData, setChartData] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [showingSearch, setShowingSearch] = useState(false);

  // Load chart data for a symbol + range
  const loadChart = useCallback(async (symbol, rk) => {
    const tr = TIME_RANGES.find(t => t.key === rk) || TIME_RANGES[1];
    setChartLoading(true);
    const data = await fetchChartData(symbol, tr.range, tr.interval);
    setChartData(data);
    setChartLoading(false);
  }, []);

  // Reset and load on open / country change
  useEffect(() => {
    if (!isOpen || !country) return;
    const mc = MARKET_CONFIG.find(m => m.country === country);
    if (!mc) return;

    setSelectedIdx(0);
    setRangeKey('1W');
    setShowingSearch(false);
    setSearchResult(null);
    setSearchQuery('');
    setSearchError(null);
    setChartData(null);

    const sym = mc.symbols[0]?.sym;
    if (sym) loadChart(sym, '1W');
  }, [isOpen, country, loadChart]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !country) return null;

  const data = stocksData ? stocksData.find(d => d.country === country) : null;
  if (!data) return null;

  const marketConfig = MARKET_CONFIG.find(m => m.country === country);
  const detail = STOCKS_DETAIL[country];
  const status = getMarketStatus(country);

  // Handle index click
  const handleIndexClick = (i) => {
    if (data.indices[i]?.noData) return;
    setSelectedIdx(i);
    setShowingSearch(false);
    setSearchResult(null);
    setSearchError(null);
    const sym = marketConfig?.symbols[i]?.sym;
    if (sym) loadChart(sym, rangeKey);
  };

  // Handle time range change
  const handleRangeChange = (rk) => {
    setRangeKey(rk);
    if (showingSearch && searchResult) {
      loadChart(searchResult.symbol, rk);
    } else {
      const sym = marketConfig?.symbols[selectedIdx]?.sym;
      if (sym) loadChart(sym, rk);
    }
  };

  // Handle search
  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) return;
    setSearchLoading(true);
    setSearchError(null);
    const tr = TIME_RANGES.find(t => t.key === rangeKey) || TIME_RANGES[1];
    const result = await fetchChartData(q.toUpperCase(), tr.range, tr.interval);
    if (result && result.price) {
      const positive = result.changePct >= 0;
      setSearchResult({
        symbol: result.symbol,
        name: result.shortName || '',
        exchangeName: result.exchangeName || '',
        price: formatStockPrice(result.price),
        change: (positive ? '+' : '') + result.changePct.toFixed(2) + '%',
        positive
      });
      setChartData(result);
      setShowingSearch(true);
    } else {
      setSearchError('Ticker not found');
    }
    setSearchLoading(false);
  };

  // Chart header info
  let chartSymbol = '', chartPrice = '', chartChange = '', chartPositive = true, chartName = '';
  if (showingSearch && searchResult) {
    chartSymbol = searchResult.symbol;
    chartPrice = searchResult.price;
    chartChange = searchResult.change;
    chartPositive = searchResult.positive;
    chartName = searchResult.name;
  } else if (chartData) {
    chartSymbol = chartData.symbol;
    chartPrice = formatStockPrice(chartData.price);
    const pct = chartData.changePct;
    chartChange = (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%';
    chartPositive = pct >= 0;
    chartName = chartData.shortName || '';
  } else if (data.indices[selectedIdx] && !data.indices[selectedIdx].noData) {
    const idx = data.indices[selectedIdx];
    chartSymbol = marketConfig?.symbols[selectedIdx]?.name || idx.name;
    chartPrice = idx.value;
    chartChange = idx.change;
    chartPositive = idx.positive;
  }

  return (
    <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        {/* Header */}
        <div className="modal-header">
          <span className="modal-flag">{data.flag}</span>
          <div className="modal-titles">
            <div className="modal-title">{country} Markets</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: status.isOpen ? '#22c55e' : '#9ca3af', marginTop: '2px' }}>
              <span style={{
                width: '7px', height: '7px', borderRadius: '50%', display: 'inline-block',
                background: status.isOpen ? '#22c55e' : '#ef4444',
                boxShadow: status.isOpen ? '0 0 6px #22c55e' : 'none'
              }} />
              Market {status.label}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* ===== Chart Section ===== */}
          <div style={{ background: '#08080f', borderRadius: '8px', padding: '12px', marginBottom: '16px', border: '1px solid #1f2937' }}>
            {/* Chart header: symbol + price + change */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#e5e7eb' }}>{chartSymbol}</span>
                {chartName && <span style={{ fontSize: '9px', color: '#6b7280', marginLeft: '6px' }}>{chartName}</span>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#e5e7eb', fontVariantNumeric: 'tabular-nums' }}>{chartPrice}</span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: chartPositive ? '#22c55e' : '#ef4444', marginLeft: '8px', fontVariantNumeric: 'tabular-nums' }}>
                  {chartChange}
                </span>
              </div>
            </div>

            {/* Chart */}
            {chartLoading ? (
              <div style={{ height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loading-spinner" />
              </div>
            ) : (
              <StockChart chartData={chartData} rangeKey={rangeKey} />
            )}

            {/* Time range buttons */}
            <div style={{ display: 'flex', gap: '4px', marginTop: '8px', justifyContent: 'center' }}>
              {TIME_RANGES.map(tr => (
                <button
                  key={tr.key}
                  onClick={() => handleRangeChange(tr.key)}
                  style={{
                    padding: '4px 14px', fontSize: '9px', fontWeight: 600,
                    background: rangeKey === tr.key ? '#1f2937' : 'transparent',
                    border: `1px solid ${rangeKey === tr.key ? '#374151' : '#1f293766'}`,
                    borderRadius: '4px',
                    color: rangeKey === tr.key ? '#e5e7eb' : '#6b7280',
                    cursor: 'pointer', transition: 'all 0.15s'
                  }}
                >
                  {tr.key}
                </button>
              ))}
            </div>
          </div>

          {/* ===== Market Overview (clickable indices) ===== */}
          <div className="stocks-section">
            <div className="stocks-section-title">Market Overview</div>
            {data.indices.map((idx, i) => {
              if (idx.noData) {
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center',
                    padding: '6px 0', borderBottom: '1px solid #1f293744'
                  }}>
                    <span style={{ color: '#6b7280', fontSize: '11px', flex: 1 }}>{idx.name}</span>
                    <span style={{ color: '#4b5563', fontSize: '10px' }}>Unavailable</span>
                  </div>
                );
              }
              const isSelected = !showingSearch && selectedIdx === i;
              return (
                <div
                  key={i}
                  onClick={() => handleIndexClick(i)}
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: '6px 4px', borderBottom: '1px solid #1f293744',
                    cursor: 'pointer', borderRadius: '4px',
                    background: isSelected ? 'rgba(34,197,94,0.08)' : 'transparent',
                    borderLeft: isSelected ? '2px solid #22c55e' : '2px solid transparent',
                    transition: 'all 0.15s'
                  }}
                >
                  <span style={{ color: isSelected ? '#e5e7eb' : '#9ca3af', fontSize: '11px', flex: 1, fontWeight: isSelected ? 600 : 400 }}>
                    {idx.name}
                  </span>
                  <span style={{ color: '#e5e7eb', fontSize: '12px', fontWeight: 600, textAlign: 'right', minWidth: '70px', fontVariantNumeric: 'tabular-nums' }}>
                    {idx.value}
                  </span>
                  <span style={{
                    color: idx.positive ? '#22c55e' : '#ef4444',
                    fontSize: '11px', fontWeight: 700, textAlign: 'right', minWidth: '60px', fontVariantNumeric: 'tabular-nums'
                  }}>
                    {idx.change}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ===== Stock Search ===== */}
          <div style={{ marginTop: '16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '9px', color: '#9ca3af', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '6px' }}>Search Any Ticker</div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <input
                type="text"
                placeholder="Ticker (e.g. AAPL, TSLA, MSFT)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                style={{
                  flex: 1, padding: '6px 10px', fontSize: '11px', background: '#111827',
                  border: '1px solid #374151', borderRadius: '4px', color: '#e5e7eb', outline: 'none'
                }}
              />
              <button
                onClick={handleSearch}
                disabled={searchLoading}
                style={{
                  padding: '6px 14px', fontSize: '10px', fontWeight: 600, background: '#1f2937',
                  border: '1px solid #374151', borderRadius: '4px', color: '#9ca3af', cursor: 'pointer'
                }}
              >
                {searchLoading ? '...' : 'GO'}
              </button>
            </div>
            {searchError && <div style={{ fontSize: '10px', color: '#ef4444', marginTop: '4px' }}>{searchError}</div>}
            {searchResult && (
              <div
                style={{
                  marginTop: '8px', padding: '8px 10px', background: showingSearch ? 'rgba(34,197,94,0.08)' : '#0d0d14',
                  borderRadius: '6px', border: `1px solid ${showingSearch ? '#22c55e44' : '#1f2937'}`,
                  cursor: 'pointer', transition: 'all 0.15s'
                }}
                onClick={() => {
                  setShowingSearch(true);
                  loadChart(searchResult.symbol, rangeKey);
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#e5e7eb' }}>{searchResult.symbol}</span>
                    {searchResult.exchangeName && (
                      <span style={{ fontSize: '8px', color: '#06b6d4', marginLeft: '6px', fontWeight: 600, background: 'rgba(6,182,212,0.1)', padding: '1px 5px', borderRadius: '3px' }}>
                        {searchResult.exchangeName}
                      </span>
                    )}
                    {searchResult.name && <span style={{ fontSize: '9px', color: '#6b7280', marginLeft: '6px' }}>{searchResult.name}</span>}
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#e5e7eb', fontVariantNumeric: 'tabular-nums' }}>{searchResult.price}</span>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: searchResult.positive ? '#22c55e' : '#ef4444', marginLeft: '6px', fontVariantNumeric: 'tabular-nums' }}>
                      {searchResult.change}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ===== Why It Matters / Outlook ===== */}
          {detail ? (
            <>
              <div className="stocks-section">
                <div className="stocks-section-title">Why It Matters</div>
                <p style={{ fontSize: '11px', color: '#9ca3af', lineHeight: 1.6 }}>{detail.whyMatters}</p>
              </div>
              <div className="stocks-section">
                <div className="stocks-section-title">Outlook</div>
                <p style={{ fontSize: '11px', color: '#9ca3af', lineHeight: 1.6 }}>{detail.outlook}</p>
                <p style={{ fontSize: '9px', color: '#6b7280', marginTop: '8px', fontStyle: 'italic' }}>
                  Not financial advice. Data may be delayed up to 15 minutes.
                </p>
              </div>
            </>
          ) : (
            <div style={{ fontSize: '9px', color: '#6b7280', padding: '8px 0', fontStyle: 'italic' }}>
              Data may be delayed up to 15 minutes. Not financial advice.
            </div>
          )}

          {/* Timestamp */}
          <div style={{ fontSize: '8px', color: '#374151', textAlign: 'right', marginTop: '8px' }}>
            Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
}
