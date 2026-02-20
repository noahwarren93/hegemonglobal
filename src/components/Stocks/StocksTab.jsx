// StocksTab.jsx - Renders stock market data in sidebar Stocks tab

import { useState, useCallback } from 'react';
import { MARKET_CONFIG, STATIC_FALLBACK_DATA, STOCKS_DETAIL } from '../../data/stocksData';
import { formatStockPrice, searchTicker } from '../../services/stocksService';

function StockSearch() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = useCallback(async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await searchTicker(q);
      if (data) {
        setResult(data);
      } else {
        setError('Ticker not found');
      }
    } catch {
      setError('Search failed');
    }
    setLoading(false);
  }, [query]);

  return (
    <div style={{ padding: '8px 12px', marginBottom: '12px' }}>
      <div style={{ fontSize: '9px', color: '#9ca3af', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '6px' }}>Stock Search</div>
      <div style={{ display: 'flex', gap: '4px' }}>
        <input
          type="text"
          placeholder="Ticker (e.g. AAPL)"
          value={query}
          onChange={(e) => setQuery(e.target.value.toUpperCase())}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
          style={{
            flex: 1, padding: '5px 8px', fontSize: '10px', background: '#111827',
            border: '1px solid #374151', borderRadius: '4px', color: '#e5e7eb',
            outline: 'none'
          }}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            padding: '5px 10px', fontSize: '9px', fontWeight: 600, background: '#1f2937',
            border: '1px solid #374151', borderRadius: '4px', color: '#9ca3af',
            cursor: 'pointer'
          }}
        >
          {loading ? '...' : 'GO'}
        </button>
      </div>
      {error && <div style={{ fontSize: '9px', color: '#ef4444', marginTop: '4px' }}>{error}</div>}
      {result && (
        <div style={{ marginTop: '8px', padding: '8px', background: '#0d0d14', borderRadius: '6px', border: '1px solid #1f2937' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#e5e7eb' }}>{result.symbol}</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#e5e7eb', fontVariantNumeric: 'tabular-nums' }}>{result.price}</span>
          </div>
          {result.name && <div style={{ fontSize: '9px', color: '#6b7280', marginBottom: '4px' }}>{result.name}</div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '9px', color: result.positive ? '#22c55e' : '#ef4444', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {result.change}
            </span>
            {result.sparkline && result.sparkline.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1px', height: '16px' }}>
                {result.sparkline.map((val, k) => {
                  const max = Math.max(...result.sparkline);
                  const min = Math.min(...result.sparkline);
                  const range = max - min || 1;
                  const h = ((val - min) / range) * 14 + 2;
                  const isUp = k > 0 ? val >= result.sparkline[k - 1] : true;
                  return (
                    <div key={k} style={{ width: '2px', height: `${h}px`, borderRadius: '1px', background: isUp ? '#22c55e' : '#ef4444' }} />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function StocksTab({ onOpenStocksModal, stocksData, stocksLastUpdated }) {
  if (!stocksData) {
    return (
      <div className="sidebar-empty">
        <div className="loading-spinner" />
        <span>Loading market data...</span>
      </div>
    );
  }

  // Fallback to static data if no live data
  const markets = stocksData || MARKET_CONFIG.map(market => ({
    country: market.country,
    flag: market.flag,
    indices: market.symbols.map(s => {
      const d = STATIC_FALLBACK_DATA[s.sym];
      if (!d) return { name: s.name, value: '\u2014', change: '\u2014', positive: true, noData: true };
      const pre = s.pre || '';
      const positive = d.changePct >= 0;
      return {
        name: s.name,
        value: pre + formatStockPrice(d.price),
        change: (positive ? '+' : '') + d.changePct.toFixed(2) + '%',
        positive,
        noData: false,
        isStatic: true
      };
    }),
    sparkline: STATIC_FALLBACK_DATA[market.symbols[0].sym]?.sparkline || [],
    sentiment: 'Static data',
    hasData: true,
    isStaticFallback: true
  }));

  const hasError = markets.some(m => m.isStaticFallback);
  const headerColor = hasError ? '#ef4444' : '#22c55e';
  const headerBg = hasError ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)';
  const updatedStr = stocksLastUpdated ? stocksLastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '\u2014';

  return (
    <>
      <div style={{ padding: '8px 12px', background: `linear-gradient(90deg, ${headerBg} 0%, transparent 100%)`, borderLeft: `3px solid ${headerColor}`, marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: headerColor, letterSpacing: '1px' }}>
            GLOBAL MARKETS
          </div>
          <div style={{ fontSize: '8px', color: '#6b7280' }}>Last updated: {updatedStr}</div>
        </div>
        <div style={{ fontSize: '9px', color: '#6b7280', marginTop: '2px' }}>
          {hasError ? 'Market data temporarily unavailable \u2014 will retry' : 'Live data via Yahoo Finance (may be delayed 15 min)'}
        </div>
      </div>

      {/* Stock Search */}
      <StockSearch />

      {markets.map((market, i) => {
        const sparkline = market.sparkline || [];
        const detail = STOCKS_DETAIL[market.country];

        return (
          <div
            key={i}
            className="stocks-country"
            onClick={() => onOpenStocksModal && onOpenStocksModal(market.country)}
          >
            <div className="stocks-country-header">
              <span className="stocks-country-flag">{market.flag}</span>
              <span className="stocks-country-name">{market.country}</span>
              {market.sentiment && (
                <span className="stocks-sentiment">{market.sentiment}</span>
              )}
            </div>

            {/* Indices */}
            <div className="stocks-indices">
              {market.indices.map((idx, j) => {
                if (idx.noData) {
                  return (
                    <div key={j} className="stock-index-row" style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="stock-index-name" style={{ flex: 1 }}>{idx.name}</span>
                      <span className="stock-index-value" style={{ color: '#6b7280', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>Unavailable</span>
                    </div>
                  );
                }
                return (
                  <div key={j} className="stock-index-row" style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="stock-index-name" style={{ flex: 1 }}>
                      {idx.name}
                      {idx.isStatic && <span style={{ fontSize: '7px', color: '#6b7280' }}> (sample)</span>}
                    </span>
                    <span className="stock-index-value" style={{ textAlign: 'right', minWidth: '60px', fontVariantNumeric: 'tabular-nums' }}>{idx.value}</span>
                    <span className={`stock-index-change ${idx.positive ? 'positive' : 'negative'}`} style={{ textAlign: 'right', minWidth: '52px', fontVariantNumeric: 'tabular-nums' }}>
                      {idx.change}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Sparkline */}
            {sparkline.length > 1 && (
              <div className="stocks-sparkline">
                {sparkline.map((val, k) => {
                  const max = Math.max(...sparkline);
                  const min = Math.min(...sparkline);
                  const range = max - min || 1;
                  const h = ((val - min) / range) * 16 + 4;
                  const isUp = k > 0 ? val >= sparkline[k - 1] : true;
                  return (
                    <div
                      key={k}
                      className="stocks-sparkline-bar"
                      style={{ height: `${h}px`, background: isUp ? '#22c55e' : '#ef4444' }}
                    />
                  );
                })}
              </div>
            )}

            {/* Why It Matters + Outlook */}
            {detail && (
              <div style={{ padding: '6px 0 2px', borderTop: '1px solid #1f2937', marginTop: '6px' }}>
                {detail.whyMatters && (
                  <div style={{ marginBottom: '4px' }}>
                    <div style={{ fontSize: '8px', color: '#06b6d4', fontWeight: 600, letterSpacing: '0.3px', textTransform: 'uppercase', marginBottom: '2px' }}>Why It Matters</div>
                    <div style={{ fontSize: '9px', color: '#9ca3af', lineHeight: 1.5 }}>{detail.whyMatters}</div>
                  </div>
                )}
                {detail.outlook && (
                  <div>
                    <div style={{ fontSize: '8px', color: '#f59e0b', fontWeight: 600, letterSpacing: '0.3px', textTransform: 'uppercase', marginBottom: '2px' }}>Outlook</div>
                    <div style={{ fontSize: '9px', color: '#9ca3af', lineHeight: 1.5 }}>{detail.outlook}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
