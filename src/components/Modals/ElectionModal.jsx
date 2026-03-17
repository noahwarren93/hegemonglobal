// ElectionModal.jsx - Election detail modal (center popup)

import { useEffect, useState } from 'react';
import { COUNTRIES } from '../../data/countries';
import { fetchCountryNews } from '../../services/apiService';
import CountryFlag from '../CountryFlag';

const RISK_FG = { catastrophic: '#fca5a5', extreme: '#fcd34d', severe: '#fde047', stormy: '#c4b5fd', cloudy: '#93c5fd', clear: '#86efac' };
const RISK_BG = { catastrophic: '#7f1d1d', extreme: '#78350f', severe: '#713f12', stormy: '#5b21b6', cloudy: '#1e3a5f', clear: '#14532d' };

export default function ElectionModal({ election, isOpen, onClose, onCountryClick }) {
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);

  // Fetch election-related news when modal opens
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!isOpen || !election) { setNews([]); return; }
    let cancelled = false;
    setNewsLoading(true);
    setNews([]);
    fetchCountryNews(election.country).then(articles => {
      if (!cancelled) {
        const electionKeywords = /election|vote|ballot|poll|candidate|campaign|party|coalition|parliament|congress|senate|runoff|incumbent|opposition/i;
        const relevant = (articles || []).filter(a => {
          const text = ((a.title || '') + ' ' + (a.headline || '')).toLowerCase();
          return electionKeywords.test(text);
        });
        setNews((relevant.length >= 2 ? relevant : articles || []).slice(0, 8));
        setNewsLoading(false);
      }
    }).catch(() => {
      if (!cancelled) { setNews([]); setNewsLoading(false); }
    });
    return () => { cancelled = true; };
  }, [isOpen, election]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !election) return null;

  const e = election;
  const isPast = !!e.winner;
  const countryData = COUNTRIES[e.country];
  const risk = countryData?.risk || 'cloudy';

  return (
    <div className="modal-overlay active" onClick={(ev) => { if (ev.target === ev.currentTarget) onClose(); }}>
      <div className="modal election-modal" style={{ maxWidth: '600px' }}>
        {/* Header */}
        <div className="modal-header" style={{ padding: '16px 20px', borderLeft: `3px solid ${isPast ? '#22c55e' : '#f97316'}` }}>
          <div className="modal-titles" style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontSize: '28px' }}><CountryFlag flag={e.flag} /></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#e5e7eb', lineHeight: 1.3 }}>{e.country}</div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{e.type}</div>
              </div>
              {countryData && (
                <span style={{ fontSize: '8px', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, textTransform: 'uppercase', background: RISK_BG[risk], color: RISK_FG[risk] }}>
                  {risk.toUpperCase()}
                </span>
              )}
            </div>
            <div style={{ fontSize: '11px', color: isPast ? '#22c55e' : '#f97316', fontWeight: 600 }}>
              {e.date} {isPast ? '— COMPLETED' : '— UPCOMING'}
            </div>
          </div>
          <button className="modal-close" onClick={onClose} style={{ alignSelf: 'flex-start' }}>&times;</button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ padding: '16px 20px', maxHeight: '70vh', overflowY: 'auto' }}>

          {/* ===== PAST ELECTION ===== */}
          {isPast && (
            <>
              {/* Results */}
              <div className="em-result-box">
                <div className="em-section-label" style={{ color: '#22c55e' }}>RESULTS</div>
                <div className="em-winner">{e.winner}</div>
                {e.result && <div className="em-result-line">{e.result}</div>}
                {e.summary && <div className="em-summary">{e.summary}</div>}
              </div>

              {/* Party Breakdown */}
              {e.parties && e.parties.length > 0 && (
                <div style={{ marginTop: '14px' }}>
                  <div className="em-section-label" style={{ color: '#06b6d4' }}>POLITICAL PARTY BREAKDOWN</div>
                  <div className="em-parties">
                    {e.parties.map((p, i) => (
                      <div key={i} className="em-party-card">
                        <div className="em-party-header">
                          <span className="em-party-name">{p.name}</span>
                          <div className="em-party-stats">
                            {p.seats && <span className="em-party-seats">{p.seats}</span>}
                            {p.pct && <span className="em-party-pct">{p.pct}</span>}
                          </div>
                        </div>
                        <div className="em-party-desc">{p.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Why It Matters */}
              {e.significance && (
                <div style={{ marginTop: '14px' }}>
                  <div className="em-section-label" style={{ color: '#a78bfa' }}>WHY IT MATTERS</div>
                  <div className="em-analysis-box">{e.significance}</div>
                </div>
              )}
            </>
          )}

          {/* ===== UPCOMING ELECTION ===== */}
          {!isPast && (
            <>
              {/* Key Parties / Candidates */}
              {e.candidates && e.candidates.length > 0 && (
                <div>
                  <div className="em-section-label" style={{ color: '#06b6d4' }}>KEY PARTIES / CANDIDATES</div>
                  <div className="em-parties">
                    {e.candidates.map((c, i) => (
                      <div key={i} className="em-party-card">
                        <div className="em-party-name">{c.name}</div>
                        <div className="em-party-desc">{c.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What to Watch */}
              <div style={{ marginTop: '14px' }}>
                <div className="em-section-label" style={{ color: '#f97316' }}>WHAT TO WATCH</div>
                <div className="em-stakes-box">
                  <div className="em-stakes-text">{e.watchFor || e.stakes}</div>
                </div>
              </div>
            </>
          )}

          {/* News section */}
          <div style={{ marginTop: '14px' }}>
            <div className="em-section-label" style={{ color: '#06b6d4' }}>
              RELATED NEWS {!newsLoading && news.length > 0 && `(${news.length})`}
            </div>
            {newsLoading ? (
              <div className="em-news-loading">
                <span className="em-spinner" />
                Loading election news...
              </div>
            ) : news.length === 0 ? (
              <div className="em-news-empty">No recent election news found</div>
            ) : (
              <div className="em-news-list">
                {news.map((article, i) => (
                  <div key={i} className="em-news-item" onClick={() => article.url && article.url !== '#' && window.open(article.url, '_blank')}>
                    <div className="em-news-source">{article.source}</div>
                    <div className="em-news-headline">{article.title || article.headline}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* View Country Profile button */}
          {onCountryClick && (
            <button className="em-view-country" onClick={() => { onClose(); onCountryClick(e.country); }}>
              View Country Profile →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
