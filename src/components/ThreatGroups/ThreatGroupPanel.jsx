// ThreatGroupPanel.jsx — Left-side slide-out panel for non-state actor details

import { useState, useEffect } from 'react';
import { THREAT_TYPE_COLORS, THREAT_TYPE_LABELS } from '../../data/threatGroupData';
import { DAILY_BRIEFING } from '../../data/countries';

export default function ThreatGroupPanel({ group, isOpen, onClose }) {
  const [articles, setArticles] = useState([]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!isOpen || !group) { setArticles([]); return; }
    const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000;
    const nowMs = Date.now();
    const matched = (DAILY_BRIEFING || []).filter(a => {
      const d = a.pubDate || a.time;
      if (d && (nowMs - new Date(d).getTime()) > FOURTEEN_DAYS) return false;
      const text = ((a.headline || a.title || '') + ' ' + (a.description || '')).toLowerCase();
      return group.searchTerms.some(t => text.includes(t.toLowerCase()));
    }).sort((a, b) => {
      const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return db - da;
    }).slice(0, 5);
    setArticles(matched);
  }, [isOpen, group]);
  /* eslint-enable react-hooks/set-state-in-effect */

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

  const statusColor = group.status === 'active' ? '#22c55e' : group.status === 'dormant' ? '#eab308' : '#6b7280';
  const violentColor = group.violent?.answer === 'Yes' ? '#ef4444' : group.violent?.answer === 'No' ? '#22c55e' : '#eab308';

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
        {group.description && (
          <div className="trade-section">
            <div className="trade-section-title">DESCRIPTION</div>
            <div className="trade-section-text">{group.description}</div>
          </div>
        )}

        {group.violent && (
          <div className="trade-section">
            <div className="trade-section-title">VIOLENT</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
              <span style={{
                display: 'inline-block', padding: '1px 5px', borderRadius: 3,
                fontSize: '8px', fontWeight: 700, letterSpacing: '0.5px',
                background: violentColor + '22', color: violentColor, border: `1px solid ${violentColor}44`
              }}>{group.violent.answer}</span>
            </div>
            <div className="trade-section-text">{group.violent.detail}</div>
          </div>
        )}

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

        {group.funding && (
          <div className="trade-section">
            <div className="trade-section-title">FUNDING</div>
            <div className="trade-section-text">{group.funding}</div>
            {group.revenue && (
              <div className="trade-section-text" style={{ color: '#22c55e', marginTop: 1, fontSize: '8px' }}>Est. revenue: {group.revenue}</div>
            )}
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

        {(group.founded || group.ideology || group.majorAttacks) && (
          <div className="trade-section">
            <div className="trade-section-title">HISTORICAL CONTEXT</div>
            {group.founded && (
              <div className="trade-section-text" style={{ marginBottom: 2 }}>Founded: {group.founded}</div>
            )}
            {group.ideology && (
              <div className="trade-section-text" style={{ marginBottom: 2 }}>Ideology: {group.ideology}</div>
            )}
            {group.majorAttacks && group.majorAttacks.length > 0 && (
              <div style={{ marginTop: 3 }}>
                <div style={{ fontSize: '7px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>Major Attacks</div>
                {group.majorAttacks.map((a, i) => (
                  <div key={i} style={{ fontSize: '8px', color: '#9ca3af', padding: '1px 0', lineHeight: 1.3 }}>
                    <span style={{ color: '#ef4444', fontWeight: 600, marginRight: 3 }}>{a.year}</span>
                    {a.event}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {(group.status || group.designation) && (
          <div className="trade-section">
            <div className="trade-section-title">STATUS</div>
            {group.status && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                <span style={{
                  display: 'inline-block', padding: '1px 5px', borderRadius: 3,
                  fontSize: '8px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
                  background: statusColor + '22', color: statusColor, border: `1px solid ${statusColor}44`
                }}>{group.status}</span>
              </div>
            )}
            {group.designation && (
              <div className="trade-section-text">{group.designation}</div>
            )}
          </div>
        )}

        <div className="trade-section">
          <div className="trade-section-title" style={{ color: '#06b6d4' }}>RECENT INTELLIGENCE ({articles.length})</div>
          {articles.length > 0 ? articles.map((a, i) => (
            <div key={i} style={{ fontSize: '8.5px', color: '#d1d5db', padding: '3px 0', borderBottom: '1px solid #1f293744', lineHeight: 1.3 }}>
              <div>{a.headline || a.title}</div>
              <div style={{ fontSize: '7px', color: '#6b7280', marginTop: 1 }}>
                {a.source && <span>{a.source}</span>}
                {a.pubDate && <span style={{ marginLeft: 4 }}>{new Date(a.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
              </div>
            </div>
          )) : (
            <div style={{ fontSize: '8px', color: '#4b5563', fontStyle: 'italic' }}>No recent coverage</div>
          )}
        </div>
      </div>
    </div>
  );
}
