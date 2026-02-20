// StocksModal.jsx - Detailed stock view modal with search

import { useState, useEffect, useCallback } from 'react';
import { STOCKS_DETAIL } from '../../data/stocksData';
import { getMarketStatus, searchTicker, formatStockPrice } from '../../services/stocksService';

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
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontSize: '9px', color: '#9ca3af', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '6px' }}>Search Any Ticker</div>
      <div style={{ display: 'flex', gap: '4px' }}>
        <input
          type="text"
          placeholder="Ticker (e.g. AAPL, TSLA, MSFT)"
          value={query}
          onChange={(e) => setQuery(e.target.value.toUpperCase())}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
          style={{
            flex: 1, padding: '6px 10px', fontSize: '11px', background: '#111827',
            border: '1px solid #374151', borderRadius: '4px', color: '#e5e7eb',
            outline: 'none'
          }}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            padding: '6px 14px', fontSize: '10px', fontWeight: 600, background: '#1f2937',
            border: '1px solid #374151', borderRadius: '4px', color: '#9ca3af',
            cursor: 'pointer'
          }}
        >
          {loading ? '...' : 'GO'}
        </button>
      </div>
      {error && <div style={{ fontSize: '10px', color: '#ef4444', marginTop: '4px' }}>{error}</div>}
      {result && (
        <div style={{ marginTop: '8px', padding: '10px', background: '#0d0d14', borderRadius: '6px', border: '1px solid #1f2937' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#e5e7eb' }}>{result.symbol}</span>
              {result.name && <span style={{ fontSize: '10px', color: '#6b7280', marginLeft: '6px' }}>{result.name}</span>}
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#e5e7eb', fontVariantNumeric: 'tabular-nums' }}>{result.price}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: result.positive ? '#22c55e' : '#ef4444', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {result.change}
            </span>
            {result.sparkline && result.sparkline.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1px', height: '18px' }}>
                {result.sparkline.map((val, k) => {
                  const max = Math.max(...result.sparkline);
                  const min = Math.min(...result.sparkline);
                  const range = max - min || 1;
                  const h = ((val - min) / range) * 15 + 3;
                  const isUp = k > 0 ? val >= result.sparkline[k - 1] : true;
                  return (
                    <div key={k} style={{ width: '3px', height: `${h}px`, borderRadius: '1px', background: isUp ? '#22c55e' : '#ef4444' }} />
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

export default function StocksModal({ country, stocksData, lastUpdated, isOpen, onClose }) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !country) return null;

  const data = stocksData ? stocksData.find(d => d.country === country) : null;
  if (!data) return null;

  const detail = STOCKS_DETAIL[country];
  const status = getMarketStatus(country);

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
          {/* Sentiment */}
          <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '12px' }}>
            {data.sentiment}
          </div>

          {/* Market Overview */}
          <div className="stocks-section">
            <div className="stocks-section-title">Market Overview</div>
            {data.indices.map((idx, i) => {
              if (idx.noData) {
                return (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '6px 0', borderBottom: '1px solid #1f293744'
                  }}>
                    <span style={{ color: '#9ca3af', fontSize: '11px' }}>{idx.name}</span>
                    <span style={{ color: '#6b7280', fontSize: '11px' }}>Data unavailable</span>
                  </div>
                );
              }
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center',
                  padding: '6px 0', borderBottom: '1px solid #1f293744'
                }}>
                  <span style={{ color: '#9ca3af', fontSize: '11px', flex: 1 }}>{idx.name}</span>
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

          {/* Sparkline */}
          {data.sparkline && data.sparkline.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '28px', margin: '12px 0' }}>
              {data.sparkline.map((val, k) => {
                const max = Math.max(...data.sparkline);
                const min = Math.min(...data.sparkline);
                const range = max - min || 1;
                const h = ((val - min) / range) * 22 + 6;
                const isUp = k > 0 ? val >= data.sparkline[k - 1] : true;
                return (
                  <div key={k} style={{ flex: 1, height: `${h}px`, borderRadius: '2px', background: isUp ? '#22c55e' : '#ef4444', opacity: 0.7 }} />
                );
              })}
            </div>
          )}

          {/* Stock Search */}
          <StockSearch />

          {/* Why It Matters / Outlook */}
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
