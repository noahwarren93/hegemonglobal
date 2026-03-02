// MilitaryInfoPanel.jsx — Detail panel for military installations and carrier groups

import { useEffect } from 'react';
import { COUNTRY_COLORS } from '../../data/militaryBases';

export default function MilitaryInfoPanel({ installation, isOpen, onClose }) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !installation) return null;

  const accentColor = COUNTRY_COLORS[installation.country] || '#06b6d4';
  const isCarrier = installation.type === 'carrier';

  return (
    <div className="military-info-panel active">
      <div className="military-info-header" style={{ borderLeft: `3px solid ${accentColor}` }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px' }}>{installation.flag}</span>
            <span style={{
              fontSize: '7px', fontWeight: 700, color: accentColor,
              background: `${accentColor}22`, padding: '2px 6px',
              borderRadius: '3px', letterSpacing: '0.5px', textTransform: 'uppercase',
            }}>
              {isCarrier ? 'CARRIER STRIKE GROUP' : installation.branch}
            </span>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#e5e7eb', lineHeight: 1.3 }}>
            {installation.name}
          </div>
          <div style={{ fontSize: '9px', color: '#9ca3af', marginTop: '2px' }}>
            {isCarrier ? installation.location : `${installation.location} ${installation.hostNation ? `(${installation.hostNation})` : ''}`}
          </div>
        </div>
        <button className="military-info-close" onClick={onClose}>&times;</button>
      </div>

      <div className="military-info-body">
        {/* Quick Facts */}
        <div className="mil-facts-row">
          <div className="mil-fact">
            <div className="mil-fact-label">Branch</div>
            <div className="mil-fact-value">{installation.branch}</div>
          </div>
          <div className="mil-fact">
            <div className="mil-fact-label">Personnel</div>
            <div className="mil-fact-value">{installation.personnel || 'Classified'}</div>
          </div>
          <div className="mil-fact">
            <div className="mil-fact-label">Operator</div>
            <div className="mil-fact-value">{installation.flag} {installation.country}</div>
          </div>
          {installation.hostNation && installation.hostNation !== installation.country && (
            <div className="mil-fact">
              <div className="mil-fact-label">Host Nation</div>
              <div className="mil-fact-value">{installation.hostNation}</div>
            </div>
          )}
        </div>

        {/* History */}
        <div className="mil-section">
          <div className="mil-section-title">History</div>
          <div className="mil-section-text">{installation.history}</div>
        </div>

        {/* Strategic Significance */}
        <div className="mil-section">
          <div className="mil-section-title">Strategic Significance</div>
          <div className="mil-section-text">{installation.significance}</div>
        </div>

        {/* Iran War Role */}
        {installation.iranWarRole && (
          <div className="mil-section" style={{ background: 'rgba(239,68,68,0.06)', borderRadius: '6px', padding: '8px 10px', border: '1px solid rgba(239,68,68,0.15)' }}>
            <div className="mil-section-title" style={{ color: '#ef4444' }}>Current Role — Iran War</div>
            <div className="mil-section-text" style={{ color: '#fca5a5' }}>{installation.iranWarRole}</div>
          </div>
        )}
      </div>
    </div>
  );
}
