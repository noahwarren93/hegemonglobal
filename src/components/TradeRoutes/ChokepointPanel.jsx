// ChokepointPanel.jsx — Left-side slide-out panel for maritime chokepoint details

import { useState, useEffect } from 'react';
import { DAILY_BRIEFING } from '../../data/countries';

const STATUS_COLORS = {
  CLOSED: '#ef4444',
  RESTRICTED: '#f59e0b',
  OPEN: '#22c55e',
  DESTROYED: '#ef4444',
};

const TYPE_COLORS = {
  maritime: '#3b82f6',
  energy: '#f97316',
  land: '#22c55e',
};

const TYPE_LABELS = {
  maritime: 'Maritime Chokepoint',
  energy: 'Energy Chokepoint',
  land: 'Land Corridor',
};

export default function ChokepointPanel({ chokepoint, isOpen, onClose }) {
  const [articles, setArticles] = useState([]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!isOpen || !chokepoint) { setArticles([]); return; }

    // Build search terms: explicit searchTerms + significant words from chokepoint name
    const STOP = new Set(['of', 'the', 'and', 'a', 'an', 'in', 'at', 'to', 'for', 'on', 'by', 'al', 'el']);
    const nameWords = chokepoint.name.toLowerCase().split(/[\s-]+/)
      .filter(w => w.length >= 4 && !STOP.has(w));
    const terms = [...new Set([
      ...(chokepoint.searchTerms || []).map(t => t.toLowerCase()),
      ...nameWords,
    ])];

    const matched = (DAILY_BRIEFING || []).filter(a => {
      // Skip placeholder fallback articles
      if (a.url === '#' || a.link === '#') return false;
      const text = ((a.headline || a.title || '') + ' ' + (a.description || '')).toLowerCase();
      return terms.some(t => text.includes(t));
    }).sort((a, b) => {
      const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return db - da;
    }).slice(0, 5);
    setArticles(matched);
  }, [isOpen, chokepoint]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !chokepoint) return null;

  const statusColor = STATUS_COLORS[chokepoint.status] || '#6b7280';
  const typeColor = TYPE_COLORS[chokepoint.type] || '#f59e0b';
  const typeLabel = TYPE_LABELS[chokepoint.type] || 'Chokepoint';

  return (
    <div className="threat-group-panel active">
      <div className="threat-group-header" style={{ borderBottom: `1px solid ${typeColor}33` }}>
        <div>
          <div className="threat-group-name" style={{ color: typeColor }}>{chokepoint.name}</div>
          <span className="threat-group-type-badge" style={{ background: typeColor + '22', color: typeColor, borderColor: typeColor }}>
            {typeLabel}
          </span>
        </div>
        <button className="threat-group-close" onClick={onClose}>&times;</button>
      </div>

      <div className="threat-group-body">
        <div className="trade-section">
          <div className="trade-section-title">STATUS</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
            <span style={{
              display: 'inline-block', padding: '1px 5px', borderRadius: 3,
              fontSize: '8px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
              background: statusColor + '22', color: statusColor, border: `1px solid ${statusColor}44`
            }}>{chokepoint.status}</span>
          </div>
        </div>

        <div className="trade-section">
          <div className="trade-section-title">SUMMARY</div>
          <div className="trade-section-text">{chokepoint.summary}</div>
        </div>

        <div className="trade-section">
          <div className="trade-section-title">DAILY TRAFFIC</div>
          <div className="trade-section-text">{chokepoint.dailyVessels} vessel transits/day</div>
        </div>

        <div className="trade-section">
          <div className="trade-section-title">OIL VOLUME</div>
          <div className="trade-section-text">{chokepoint.oilVolume}</div>
        </div>

        <div className="trade-section">
          <div className="trade-section-title">GAS VOLUME</div>
          <div className="trade-section-text">{chokepoint.gasVolume}</div>
        </div>

        {chokepoint.dependentCountries && chokepoint.dependentCountries.length > 0 && (
          <div className="trade-section">
            <div className="trade-section-title">DEPENDENT COUNTRIES</div>
            <div className="trade-section-text">{chokepoint.dependentCountries.join(', ')}</div>
          </div>
        )}

        <div className="trade-section">
          <div className="trade-section-title">STRATEGIC SUMMARY</div>
          <div className="trade-section-text">{chokepoint.strategicSummary}</div>
        </div>

        <div className="trade-section">
          <div className="trade-section-title" style={{ color: typeColor }}>RECENT DISRUPTIONS ({articles.length})</div>
          {articles.length > 0 && articles.map((a, i) => (
            <div key={i} style={{ fontSize: '8.5px', color: '#d1d5db', padding: '3px 0', borderBottom: '1px solid #1f293744', lineHeight: 1.3 }}>
              <div>
                {(a.url || a.link) ? (
                  <a href={a.url || a.link} target="_blank" rel="noopener noreferrer" style={{ color: '#d1d5db', textDecoration: 'none' }}
                    onMouseEnter={e => { e.target.style.color = typeColor; }} onMouseLeave={e => { e.target.style.color = '#d1d5db'; }}>
                    {a.headline || a.title}
                  </a>
                ) : (a.headline || a.title)}
              </div>
              <div style={{ fontSize: '7px', color: '#6b7280', marginTop: 1 }}>
                {a.source && <span>{a.source}</span>}
                {a.pubDate && <span style={{ marginLeft: 4 }}>{new Date(a.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
              </div>
            </div>
          ))}
          {articles.length === 0 && (
            <div style={{ fontSize: '8px', color: '#4b5563', fontStyle: 'italic' }}>No recent disruptions reported.</div>
          )}
        </div>
      </div>
    </div>
  );
}
