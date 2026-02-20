// StocksTab.jsx - Compact stock market sidebar tab

import { getMarketStatus } from '../../services/stocksService';

export default function StocksTab({ onOpenStocksModal, stocksData, stocksLastUpdated, stocksUpdating }) {
  if (!stocksData) {
    return (
      <div className="sidebar-empty">
        <div className="loading-spinner" />
        <span>Loading market data...</span>
      </div>
    );
  }

  const markets = stocksData;
  const updatedStr = stocksLastUpdated ? stocksLastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '\u2014';

  return (
    <>
      {/* Header */}
      <div style={{ padding: '8px 12px', background: 'linear-gradient(90deg, rgba(34,197,94,0.12) 0%, transparent 100%)', borderLeft: '3px solid #22c55e', marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#22c55e', letterSpacing: '1px' }}>
            GLOBAL MARKETS
          </div>
          <div style={{ fontSize: '8px', color: '#6b7280' }}>
            {stocksUpdating ? 'Updating...' : `Updated ${updatedStr}`}
          </div>
        </div>
        <div style={{ fontSize: '9px', color: '#6b7280', marginTop: '2px' }}>
          Live data via Yahoo Finance (may be delayed 15 min)
        </div>
      </div>

      {markets.map((market, i) => {
        const status = getMarketStatus(market.country);

        return (
          <div
            key={i}
            className="stocks-country"
            onClick={() => onOpenStocksModal && onOpenStocksModal(market.country)}
          >
            {/* Country header with market status */}
            <div className="stocks-country-header">
              <span className="stocks-country-flag">{market.flag}</span>
              <span className="stocks-country-name" style={{ flex: 1 }}>{market.country}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '8px', color: status.isOpen ? '#22c55e' : '#6b7280' }}>
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%', display: 'inline-block',
                  background: status.isOpen ? '#22c55e' : '#ef4444',
                  boxShadow: status.isOpen ? '0 0 4px #22c55e' : 'none'
                }} />
                {status.label}
              </span>
            </div>

            {/* Indices - compact rows */}
            <div className="stocks-indices">
              {market.indices.map((idx, j) => {
                if (idx.noData) {
                  return (
                    <div key={j} className="stock-index-row" style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="stock-index-name" style={{ flex: 1 }}>{idx.name}</span>
                      <span style={{ color: '#6b7280', fontSize: '10px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>Unavailable</span>
                    </div>
                  );
                }
                return (
                  <div key={j} className="stock-index-row" style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="stock-index-name" style={{ flex: 1 }}>{idx.name}</span>
                    <span className="stock-index-value" style={{ textAlign: 'right', minWidth: '65px', fontVariantNumeric: 'tabular-nums' }}>{idx.value}</span>
                    <span className={`stock-index-change ${idx.positive ? 'positive' : 'negative'}`} style={{ textAlign: 'right', minWidth: '55px', fontVariantNumeric: 'tabular-nums' }}>
                      {idx.change}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
