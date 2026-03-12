// ThreatGroupPanel.jsx — Left-side slide-out panel for threat group details

import { useEffect } from 'react';
import { THREAT_TYPE_COLORS, THREAT_TYPE_LABELS } from '../../data/threatGroupData';

export default function ThreatGroupPanel({ group, isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !group) return null;

  const typeColor = THREAT_TYPE_COLORS[group.type] || '#ef4444';
  const typeLabel = THREAT_TYPE_LABELS[group.type] || group.type;

  // Find matching articles from DAILY_BRIEFING
  const articles = (window.DAILY_BRIEFING || []).filter(a => {
    const hl = (a.headline || a.title || '').toLowerCase();
    return group.searchTerms.some(t => hl.includes(t));
  }).slice(0, 5);

  return (
    <div className="threat-group-panel active">
      <div className="threat-group-header">
        <div>
          <div className="threat-group-name">{group.name}</div>
          <span className="threat-group-type-badge" style={{ background: typeColor + '22', color: typeColor, borderColor: typeColor }}>
            {typeLabel}
          </span>
        </div>
        <button className="threat-group-close" onClick={onClose}>&times;</button>
      </div>

      <div className="threat-group-body">
        {group.territory && (
          <div className="trade-section">
            <div className="trade-section-title">TERRITORY</div>
            <div className="trade-section-text">{group.territory}</div>
          </div>
        )}

        {group.strength && (
          <div className="trade-section">
            <div className="trade-section-title">STRENGTH</div>
            <div className="trade-section-text">{group.strength}</div>
          </div>
        )}

        {group.activities && (
          <div className="trade-section">
            <div className="trade-section-title">ACTIVITIES</div>
            <div className="trade-section-text">{group.activities}</div>
          </div>
        )}

        {group.funding && (
          <div className="trade-section">
            <div className="trade-section-title">FUNDING</div>
            <div className="trade-section-text">{group.funding}</div>
          </div>
        )}

        {group.leaders && (
          <div className="trade-section">
            <div className="trade-section-title">LEADERS</div>
            <div className="trade-section-text">{group.leaders}</div>
          </div>
        )}

        {group.allies && group.allies.length > 0 && (
          <div className="trade-section">
            <div className="trade-section-title">ALLIES</div>
            <div className="trade-section-text">{group.allies.join(', ')}</div>
          </div>
        )}

        {group.rivals && group.rivals.length > 0 && (
          <div className="trade-section">
            <div className="trade-section-title">RIVALS</div>
            <div className="trade-section-text" style={{ color: '#fca5a5' }}>{group.rivals.join(', ')}</div>
          </div>
        )}

        {articles.length > 0 && (
          <div className="trade-section">
            <div className="trade-section-title" style={{ color: '#06b6d4' }}>RECENT INTELLIGENCE</div>
            {articles.map((a, i) => (
              <div key={i} style={{ fontSize: '9px', color: '#9ca3af', padding: '4px 0', borderBottom: '1px solid #1f293744', lineHeight: 1.4 }}>
                {a.headline || a.title}
                {a.source && <span style={{ color: '#4b5563', marginLeft: 4 }}>({a.source})</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
