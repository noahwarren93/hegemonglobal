// StocksTab.jsx - Renders stock market data in sidebar Stocks tab

import { MARKET_CONFIG, STATIC_FALLBACK_DATA } from '../../data/stocksData';
import { formatStockPrice } from '../../services/stocksService';

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
      {markets.map((market, i) => {
        const sparkline = market.sparkline || [];

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
                    <div key={j} className="stock-index-row">
                      <span className="stock-index-name">{idx.name}</span>
                      <span className="stock-index-value" style={{ color: '#6b7280' }}>Unavailable</span>
                    </div>
                  );
                }
                return (
                  <div key={j} className="stock-index-row">
                    <span className="stock-index-name">
                      {idx.name}
                      {idx.isStatic && <span style={{ fontSize: '7px', color: '#6b7280' }}> (sample)</span>}
                    </span>
                    <span className="stock-index-value">{idx.value}</span>
                    <span className={`stock-index-change ${idx.positive ? 'positive' : 'negative'}`}>
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
          </div>
        );
      })}
    </>
  );
}
