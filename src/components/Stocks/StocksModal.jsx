// StocksModal.jsx - Detailed stock view modal

import { useState, useEffect } from 'react';
import { STOCKS_DETAIL } from '../../data/stocksData';
import { formatStockPrice } from '../../services/stocksService';

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
  const subtitleText = data.isStaticFallback
    ? 'Sample data \u2014 connecting to live feed...'
    : data.sentiment;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content stocks-modal">
        <button className="modal-close" onClick={onClose}>&times;</button>

        {/* Header */}
        <div className="modal-header">
          <span className="modal-flag">{data.flag}</span>
          <h2 className="modal-title">{country} Markets</h2>
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '12px' }}>
          {subtitleText}
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
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 0', borderBottom: '1px solid #1f293744'
              }}>
                <span style={{ color: '#9ca3af', fontSize: '11px' }}>
                  {idx.name}{idx.isStatic ? ' (sample)' : ''}
                </span>
                <span style={{ color: '#e5e7eb', fontSize: '12px', fontWeight: 600 }}>
                  {idx.value}
                </span>
                <span style={{
                  color: idx.positive ? '#22c55e' : '#ef4444',
                  fontSize: '11px', fontWeight: 700
                }}>
                  {idx.change}
                </span>
              </div>
            );
          })}
        </div>

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
  );
}
