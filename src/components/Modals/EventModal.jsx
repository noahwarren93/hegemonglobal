// EventModal.jsx - Event detail modal with AI summary and source list

import { useEffect } from 'react';
import { renderBiasTag, getStateMediaLabel } from '../../utils/riskColors';

const CAT_BORDER = {
  CONFLICT: '#ef4444', CRISIS: '#f97316', SECURITY: '#eab308',
  ECONOMY: '#22c55e', DIPLOMACY: '#8b5cf6', POLITICS: '#3b82f6',
  TECH: '#06b6d4', CLIMATE: '#065f46', WORLD: '#6b7280'
};

function cleanHeadline(headline, source) {
  let h = headline || '';
  let s = source || '';
  if (s.includes('Google News') && h) {
    const di = h.lastIndexOf(' - ');
    if (di > 0) {
      s = h.substring(di + 3).trim();
      h = h.substring(0, di).trim();
    }
  }
  // Strip trailing " - Source" from display headline
  const dashIdx = h.lastIndexOf(' - ');
  if (dashIdx > 0 && dashIdx > h.length - 40) {
    h = h.substring(0, dashIdx).trim();
  }
  return { headline: h, source: s };
}

export default function EventModal({ event, isOpen, onClose }) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  const borderColor = CAT_BORDER[event.category] || '#374151';
  const { headline: displayHeadline } = cleanHeadline(event.headline, '');

  return (
    <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: '560px' }}>
        {/* Header */}
        <div className="modal-header" style={{ padding: '16px 20px', borderLeft: `3px solid ${borderColor}` }}>
          <div className="modal-titles" style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span className={`card-cat ${event.category}`}>{event.category}</span>
              {event.sourceCount > 1 && (
                <span style={{
                  fontSize: '8px', fontWeight: 700, color: '#06b6d4',
                  background: 'rgba(6,182,212,0.15)', padding: '2px 6px',
                  borderRadius: '3px', letterSpacing: '0.3px'
                }}>
                  {event.sourceCount} sources
                </span>
              )}
              <span style={{ fontSize: '9px', color: '#6b7280', marginLeft: 'auto' }}>{event.time}</span>
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#e5e7eb', lineHeight: 1.4 }}>
              {displayHeadline}
            </div>
          </div>
          <button className="modal-close" onClick={onClose} style={{ alignSelf: 'flex-start' }}>&times;</button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ padding: '16px 20px' }}>
          {/* AI Summary */}
          {event.summaryLoading ? (
            <div style={{ padding: '12px 14px', background: '#0d0d14', borderRadius: '8px', borderLeft: '2px solid rgba(6,182,212,0.3)', marginBottom: '16px' }}>
              <div style={{ fontSize: '9px', color: '#06b6d4', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '6px', textTransform: 'uppercase' }}>Intelligence Summary</div>
              <div style={{ fontSize: '10px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', border: '1.5px solid #374151', borderTopColor: '#06b6d4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Generating AI summary...
              </div>
            </div>
          ) : event.summary ? (
            <div style={{ padding: '12px 14px', background: '#0d0d14', borderRadius: '8px', borderLeft: '2px solid rgba(6,182,212,0.3)', marginBottom: '16px' }}>
              <div style={{ fontSize: '9px', color: '#06b6d4', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '6px', textTransform: 'uppercase' }}>Intelligence Summary</div>
              <div style={{ fontSize: '12px', color: '#d1d5db', lineHeight: 1.7 }}>
                {event.summary}
              </div>
            </div>
          ) : null}

          {/* Sources */}
          <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '10px' }}>
            Sources ({event.articles.length})
          </div>

          {event.articles.map((article, i) => {
            const { headline: artHeadline, source: artSource } = cleanHeadline(
              article.headline || article.title || '',
              article.source || ''
            );

            return (
              <div key={i} className="news-item">
                <div className="news-meta">
                  <span className="news-source">{artSource}</span>
                  {getStateMediaLabel(artSource) && (
                    <span style={{ fontSize: '7px', color: '#f59e0b', background: '#78350f', padding: '1px 4px', borderRadius: '3px', fontWeight: 600, letterSpacing: '0.3px' }}>
                      {getStateMediaLabel(artSource)}
                    </span>
                  )}
                  <span dangerouslySetInnerHTML={{ __html: renderBiasTag(artSource) }} />
                  <span className="news-time">{article.time || ''}</span>
                </div>
                <div className="news-headline">
                  {article.url && article.url !== '#' ? (
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="news-link" style={{ fontSize: '12px' }}>{artHeadline}</a>
                  ) : artHeadline}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
