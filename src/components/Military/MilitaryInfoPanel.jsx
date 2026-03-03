// MilitaryInfoPanel.jsx — Centered modal for military installation / carrier group details

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
    <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: '520px' }}>
        {/* Header */}
        <div className="modal-header" style={{ borderLeft: `3px solid ${accentColor}` }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '24px' }}>{installation.flag}</span>
              <span style={{
                fontSize: '8px', fontWeight: 700, color: accentColor,
                background: `${accentColor}22`, padding: '2px 8px',
                borderRadius: '3px', letterSpacing: '0.5px', textTransform: 'uppercase',
              }}>
                {isCarrier ? 'CARRIER STRIKE GROUP' : installation.branch}
              </span>
            </div>
            <div className="modal-title" style={{ fontSize: '16px' }}>
              {installation.name}
            </div>
            <div className="modal-subtitle">
              {isCarrier ? installation.location : `${installation.location} ${installation.hostNation ? `(${installation.hostNation})` : ''}`}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Quick Facts */}
          <div className="facts-grid" style={{ marginBottom: '16px' }}>
            <div className="fact">
              <div className="fact-label">Branch</div>
              <div className="fact-value">{installation.branch}</div>
            </div>
            <div className="fact">
              <div className="fact-label">Personnel</div>
              <div className="fact-value">{installation.personnel || 'Classified'}</div>
            </div>
            <div className="fact">
              <div className="fact-label">Operator</div>
              <div className="fact-value">{installation.flag} {installation.country}</div>
            </div>
            {installation.hostNation && installation.hostNation !== installation.country && (
              <div className="fact">
                <div className="fact-label">Host Nation</div>
                <div className="fact-value">{installation.hostNation}</div>
              </div>
            )}
          </div>

          {/* History */}
          <div className="analysis-block">
            <div className="analysis-header">
              <div className="analysis-num n2">1</div>
              <div className="analysis-title">History</div>
            </div>
            <div className="analysis-text">{installation.history}</div>
          </div>

          {/* Strategic Significance */}
          <div className="analysis-block">
            <div className="analysis-header">
              <div className="analysis-num n1">2</div>
              <div className="analysis-title">Strategic Significance</div>
            </div>
            <div className="analysis-text">{installation.significance}</div>
          </div>

          {/* Iran War Role */}
          {installation.iranWarRole && (
            <div className="analysis-block" style={{ borderLeftColor: '#ef4444', background: 'rgba(239,68,68,0.06)' }}>
              <div className="analysis-header">
                <div className="analysis-num" style={{ background: '#7f1d1d', color: '#fca5a5' }}>!</div>
                <div className="analysis-title" style={{ color: '#ef4444' }}>Current Role — Iran War</div>
              </div>
              <div className="analysis-text" style={{ color: '#fca5a5' }}>{installation.iranWarRole}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
