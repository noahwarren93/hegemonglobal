// MilitaryCountryPopup.jsx — Shows military stats when clicking a country in military mode

import { useEffect } from 'react';
import { MILITARY_COUNTRY_DATA } from '../../data/militaryCountryData';
import { COUNTRIES } from '../../data/countries';

export default function MilitaryCountryPopup({ countryName, isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !countryName) return null;

  const data = MILITARY_COUNTRY_DATA[countryName];
  const countryInfo = COUNTRIES[countryName];

  if (!data) {
    return (
      <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="modal" style={{ maxWidth: '420px' }}>
          <div className="modal-header">
            <div style={{ flex: 1 }}>
              <div className="modal-title" style={{ fontSize: '15px' }}>{countryName}</div>
              <div className="modal-subtitle">Military data not available</div>
            </div>
            <button className="modal-close" onClick={onClose}>&times;</button>
          </div>
          <div className="modal-body" style={{ padding: '16px', color: '#9ca3af', fontSize: '12px' }}>
            No military intelligence data available for this country. Data covers the top 50 military powers by Global Firepower ranking.
          </div>
        </div>
      </div>
    );
  }

  const hasNukes = data.nuclear && data.nuclear.warheads > 0;
  const nukeColor = hasNukes ? '#ef4444' : '#4b5563';

  return (
    <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: '480px' }}>
        {/* Header */}
        <div className="modal-header" style={{ borderLeft: '3px solid #3b82f6' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '8px', fontWeight: 700, color: '#60a5fa',
                background: 'rgba(59,130,246,0.15)', padding: '2px 8px',
                borderRadius: '3px', letterSpacing: '0.5px', textTransform: 'uppercase',
              }}>
                MILITARY PROFILE
              </span>
              <span style={{
                fontSize: '8px', fontWeight: 700, color: '#9ca3af',
                background: 'rgba(156,163,175,0.15)', padding: '2px 8px',
                borderRadius: '3px', letterSpacing: '0.5px',
              }}>
                RANK #{data.ranking}
              </span>
              {hasNukes && (
                <span style={{
                  fontSize: '8px', fontWeight: 700, color: '#fca5a5',
                  background: 'rgba(239,68,68,0.15)', padding: '2px 8px',
                  borderRadius: '3px', letterSpacing: '0.5px',
                }}>
                  NUCLEAR
                </span>
              )}
            </div>
            <div className="modal-title" style={{ fontSize: '16px' }}>
              {countryName}
            </div>
            <div className="modal-subtitle">
              {countryInfo?.region || ''} {data.branches ? `\u2014 ${data.branches.length} service branches` : ''}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Quick Facts Grid */}
          <div className="facts-grid" style={{ marginBottom: '14px' }}>
            <div className="fact">
              <div className="fact-label">Active Personnel</div>
              <div className="fact-value">{data.personnel.active.toLocaleString()}</div>
            </div>
            <div className="fact">
              <div className="fact-label">Reserve</div>
              <div className="fact-value">{data.personnel.reserve.toLocaleString()}</div>
            </div>
            <div className="fact">
              <div className="fact-label">Defense Budget</div>
              <div className="fact-value">{data.budget}</div>
            </div>
            <div className="fact">
              <div className="fact-label">Budget % GDP</div>
              <div className="fact-value">{data.budgetPctGdp}</div>
            </div>
          </div>

          {/* Nuclear Capability */}
          <div className="analysis-block" style={{ borderLeftColor: nukeColor, background: hasNukes ? 'rgba(239,68,68,0.06)' : undefined }}>
            <div className="analysis-header">
              <div className="analysis-num" style={hasNukes ? { background: '#7f1d1d', color: '#fca5a5' } : {}}>N</div>
              <div className="analysis-title" style={hasNukes ? { color: '#ef4444' } : {}}>Nuclear Capability</div>
            </div>
            <div className="analysis-text" style={hasNukes ? { color: '#fca5a5' } : {}}>
              {hasNukes ? (
                <>
                  <strong>{data.nuclear.warheads.toLocaleString()}</strong> warheads
                  {data.nuclear.triad && ' \u2014 Full nuclear triad (land, sea, air)'}
                  {!data.nuclear.triad && data.nuclear.warheads > 0 && ` \u2014 ${data.nuclear.status}`}
                </>
              ) : (
                data.nuclear.status
              )}
            </div>
          </div>

          {/* Major Weapons Systems */}
          <div className="analysis-block">
            <div className="analysis-header">
              <div className="analysis-num n1">W</div>
              <div className="analysis-title">Major Weapons Systems</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
              {data.majorWeapons.map((w, i) => (
                <span key={i} style={{
                  fontSize: '9px', color: '#d1d5db', background: 'rgba(255,255,255,0.06)',
                  padding: '3px 7px', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  {w}
                </span>
              ))}
            </div>
          </div>

          {/* Service Branches */}
          <div className="analysis-block">
            <div className="analysis-header">
              <div className="analysis-num n2">B</div>
              <div className="analysis-title">Service Branches</div>
            </div>
            <div className="analysis-text">
              {data.branches.join(', ')}
            </div>
          </div>

          {/* Alliance Memberships */}
          <div className="analysis-block">
            <div className="analysis-header">
              <div className="analysis-num n3">A</div>
              <div className="analysis-title">Alliance Memberships</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
              {data.alliances.map((a, i) => (
                <span key={i} style={{
                  fontSize: '9px', color: '#93c5fd', background: 'rgba(59,130,246,0.12)',
                  padding: '3px 7px', borderRadius: '3px', border: '1px solid rgba(59,130,246,0.2)',
                }}>
                  {a}
                </span>
              ))}
            </div>
          </div>

          {/* Recent Operations */}
          {data.recentOps && data.recentOps.length > 0 && (
            <div className="analysis-block">
              <div className="analysis-header">
                <div className="analysis-num" style={{ background: '#422006', color: '#fdba74' }}>O</div>
                <div className="analysis-title">Recent Operations</div>
              </div>
              <div style={{ marginTop: '4px' }}>
                {data.recentOps.map((op, i) => (
                  <div key={i} style={{
                    fontSize: '10px', color: '#d1d5db', padding: '3px 0',
                    borderBottom: i < data.recentOps.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  }}>
                    {op}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
