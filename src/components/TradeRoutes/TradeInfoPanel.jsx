// TradeInfoPanel.jsx - Side panel showing country trade details

import { useEffect } from 'react';
import { COUNTRIES } from '../../data/countries';
import { COUNTRY_TRADE_PROFILES } from '../../data/tradeData';
import { TRADE_ROUTES } from './TradeRoutes';

export default function TradeInfoPanel({ country, isOpen, onClose }) {
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

  const c = COUNTRIES[country];
  const profile = COUNTRY_TRADE_PROFILES[country];
  const flag = c ? c.flag : '';

  // Find all routes involving this country
  const countryRoutes = TRADE_ROUTES
    .filter(r => r.from === country || r.to === country)
    .sort((a, b) => b.volume - a.volume);

  const sanctionRoutes = countryRoutes.filter(r => r.status === 'sanctioned' && r.sanctions);

  return (
    <div className="trade-info-panel active">
      <div className="trade-info-header">
        <div className="trade-info-title">{flag} {country} Trade</div>
        <button className="trade-info-close" onClick={onClose}>&times;</button>
      </div>

      <div className="trade-info-body">
        {/* Total trade volume */}
        {profile && profile.totalTrade && (
          <div style={{
            fontSize: '10px', color: '#06b6d4', fontWeight: 600,
            marginBottom: '10px', padding: '6px 8px',
            background: 'rgba(6,182,212,0.08)', borderRadius: '6px', textAlign: 'center'
          }}>
            Annual Trade Volume: {profile.totalTrade}
          </div>
        )}

        {/* Top Trading Partners */}
        <div className="trade-section">
          <div className="trade-section-title">TOP TRADING PARTNERS</div>
          {countryRoutes.length > 0 ? (
            countryRoutes.slice(0, 8).map((r, i) => {
              const partner = r.from === country ? r.to : r.from;
              const pFlag = COUNTRIES[partner] ? COUNTRIES[partner].flag : '';
              const statusColor = r.status === 'healthy' ? '#22c55e' : r.status === 'sanctioned' ? '#ef4444' : '#f59e0b';
              return (
                <div key={i} className="trade-partner-row">
                  <span className="trade-partner-name">{pFlag} {partner}</span>
                  <span className="trade-partner-vol">${r.volume}B</span>
                  <span className="trade-partner-status" style={{ color: statusColor }}>
                    {r.status.toUpperCase()}
                  </span>
                </div>
              );
            })
          ) : profile && profile.topPartners && profile.topPartners.length > 0 ? (
            profile.topPartners.slice(0, 8).map((partner, i) => {
              const pFlag = COUNTRIES[partner] ? COUNTRIES[partner].flag : '';
              return (
                <div key={i} className="trade-partner-row">
                  <span className="trade-partner-name">{pFlag} {partner}</span>
                  <span className="trade-partner-status" style={{ color: '#22c55e', fontSize: '8px' }}>
                    PARTNER
                  </span>
                </div>
              );
            })
          ) : (
            <div className="trade-section-text" style={{ color: '#6b7280' }}>
              Trade data not available for this country.
            </div>
          )}
        </div>

        {/* Exports / Imports / Agreements */}
        {profile && (
          <>
            {profile.exports && (
              <div className="trade-section">
                <div className="trade-section-title">TOP EXPORTS</div>
                <div className="trade-section-text">{profile.exports}</div>
              </div>
            )}
            {profile.imports && (
              <div className="trade-section">
                <div className="trade-section-title">TOP IMPORTS</div>
                <div className="trade-section-text">{profile.imports}</div>
              </div>
            )}
            {profile.agreements && (
              <div className="trade-section">
                <div className="trade-section-title">TRADE AGREEMENTS</div>
                <div className="trade-section-text">{profile.agreements}</div>
              </div>
            )}
          </>
        )}

        {/* Active Sanctions */}
        {sanctionRoutes.length > 0 && (
          <div className="trade-section">
            <div className="trade-section-title" style={{ color: '#ef4444' }}>ACTIVE SANCTIONS</div>
            {sanctionRoutes.map((r, i) => {
              const partner = r.from === country ? r.to : r.from;
              return (
                <div key={i} className="trade-section-text" style={{ color: '#fca5a5' }}>
                  vs {partner}: {r.sanctions}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
