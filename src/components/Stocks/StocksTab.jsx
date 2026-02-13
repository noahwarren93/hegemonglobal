// StocksTab.jsx - Renders stock market data in sidebar Stocks tab

import { useState, useEffect, useCallback } from 'react';
import { MARKET_CONFIG, STATIC_FALLBACK_DATA } from '../../data/stocksData';
import { loadStockData, formatStockPrice } from '../../services/stocksService';

export default function StocksTab({ onOpenStocksModal }) {
  const [stocksData, setStocksData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleUpdate = useCallback(({ data, lastUpdated: updated, error: err }) => {
    setStocksData(data);
    setLastUpdated(updated);
    setError(err);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStockData(handleUpdate);
    const interval = setInterval(() => loadStockData(handleUpdate), 180000); // 3 min
    return () => clearInterval(interval);
  }, [handleUpdate]);

  if (loading && !stocksData) {
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

  return (
    <>
      <div className="section-label">
        GLOBAL MARKETS
        {lastUpdated && (
          <span style={{ float: 'right', fontSize: '8px', color: '#6b7280', fontWeight: '400' }}>
            {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
      {error && (
        <div style={{ fontSize: '9px', color: '#f59e0b', padding: '4px 8px', marginBottom: '8px' }}>
          Using cached/sample data. Live feed reconnecting...
        </div>
      )}
      {markets.map((market, i) => {
        const sparkline = market.sparkline || [];
        const mainPositive = sparkline.length > 1 ? sparkline[sparkline.length - 1] >= sparkline[0] : true;

        return (
          <div
            key={i}
            className="market-section"
            onClick={() => onOpenStocksModal && onOpenStocksModal(market.country)}
            style={{ cursor: 'pointer' }}
          >
            <div className="market-country">
              <span className="market-flag">{market.flag}</span>
              {market.country}
            </div>

            {/* Sparkline */}
            {sparkline.length > 1 && (
              <div className="sparkline" style={{ marginBottom: '6px' }}>
                {sparkline.map((val, k) => {
                  const max = Math.max(...sparkline);
                  const min = Math.min(...sparkline);
                  const range = max - min || 1;
                  const height = ((val - min) / range) * 16 + 2;
                  return (
                    <div
                      key={k}
                      className={`spark-bar ${mainPositive ? 'positive' : 'negative'}`}
                      style={{ height: `${height}px` }}
                    />
                  );
                })}
              </div>
            )}

            {/* Indices */}
            {market.indices.map((idx, j) => {
              if (idx.noData) {
                return (
                  <div key={j} className="stock-row">
                    <div className="stock-name">{idx.name}</div>
                    <div className="stock-price" style={{ color: '#6b7280' }}>Unavailable</div>
                  </div>
                );
              }
              return (
                <div key={j} className="stock-row">
                  <div className="stock-name">
                    {idx.name}
                    {idx.isStatic && <span style={{ fontSize: '7px', color: '#6b7280' }}> (sample)</span>}
                  </div>
                  <div className="stock-price">{idx.value}</div>
                  <div className={`stock-change ${idx.positive ? 'positive' : 'negative'}`}>
                    {idx.change}
                  </div>
                </div>
              );
            })}

            {/* Sentiment */}
            {market.sentiment && (
              <div style={{ fontSize: '9px', color: '#6b7280', marginTop: '4px', fontStyle: 'italic' }}>
                {market.sentiment}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
