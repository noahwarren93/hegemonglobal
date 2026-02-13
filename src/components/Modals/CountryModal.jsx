// CountryModal.jsx - Country detail modal with analysis, sanctions, trend chart, news

import { useState, useEffect } from 'react';
import { COUNTRIES, SANCTIONS_DATA } from '../../data/countries';
import { RISK_COLORS, renderBiasTag, renderTrendChart } from '../../utils/riskColors';
import { fetchCountryNews } from '../../services/apiService';

export default function CountryModal({ countryName, isOpen, onClose }) {
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [sanctionsOpen, setSanctionsOpen] = useState(false);

  const country = countryName ? COUNTRIES[countryName] : null;

  // Fetch news when modal opens
  useEffect(() => {
    if (isOpen && countryName) {
      setNews([]);
      setNewsLoading(true);
      setSanctionsOpen(false);
      fetchCountryNews(countryName).then(articles => {
        setNews(articles || []);
        setNewsLoading(false);
      }).catch(() => {
        setNewsLoading(false);
      });
    }
  }, [isOpen, countryName]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !country || !countryName) return null;

  const sanctions = SANCTIONS_DATA[countryName];
  const riskColor = RISK_COLORS[country.risk]?.hex || '#888';

  // Build facts grid (original order: Region, Population, GDP, Leader)
  const facts = [];
  if (country.region) facts.push({ label: 'Region', value: country.region });
  if (country.pop) facts.push({ label: 'Population', value: country.pop });
  if (country.gdp) facts.push({ label: 'GDP', value: country.gdp });
  if (country.leader) facts.push({ label: 'Leader', value: country.leader });

  // Build analysis blocks
  const analysisBlocks = [];
  if (country.analysis) {
    if (typeof country.analysis === 'string') {
      analysisBlocks.push({ num: 1, title: 'What Happened', text: country.analysis });
    } else {
      if (country.analysis.what) analysisBlocks.push({ num: 1, title: 'What Happened', text: country.analysis.what });
      if (country.analysis.why) analysisBlocks.push({ num: 2, title: 'Why It Matters', text: country.analysis.why });
      if (country.analysis.next) analysisBlocks.push({ num: 3, title: 'What Might Happen', text: country.analysis.next });
    }
  }

  return (
    <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        {/* Header */}
        <div className="modal-header">
          <span className="modal-flag">{country.flag}</span>
          <div className="modal-titles">
            <div className="modal-title">
              <span>{countryName}</span>
              <span className={`modal-risk risk-${country.risk}`} style={{ color: riskColor }}>
                {country.risk.toUpperCase()}
              </span>
            </div>
            <div className="modal-subtitle">{country.title || country.region}</div>
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Facts Grid */}
          {facts.length > 0 && (
            <div className="facts-grid" style={{ marginBottom: '16px' }}>
              {facts.map((fact, i) => (
                <div key={i} className="fact">
                  <div className="fact-label">{fact.label}</div>
                  <div className="fact-value">{fact.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Risk Trend & Indicators (before Analysis, matching original order) */}
          <div style={{ marginTop: '16px' }}>
            <div className="section-title">Risk Trend & Indicators</div>
            <div dangerouslySetInnerHTML={{ __html: renderTrendChart(countryName, country.risk) }} />
          </div>

          {/* Situation Analysis */}
          {analysisBlocks.length > 0 && (
            <>
              <div className="section-title">Situation Analysis</div>
              {analysisBlocks.map((block) => (
                <div key={block.num} className="analysis-block">
                  <div className="analysis-header">
                    <div className={`analysis-num n${block.num}`}>{block.num}</div>
                    <div className="analysis-title">{block.title}</div>
                  </div>
                  <p className="analysis-text">{block.text}</p>
                </div>
              ))}
            </>
          )}

          {/* Recent Coverage (cached news from country data) */}
          {country.news && country.news.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div className="section-title">Recent Coverage</div>
              {country.news.map((n, i) => (
                <div key={i} className="news-item">
                  <div className="news-meta">
                    <span className="news-source">{n.source}</span>
                    <span className="news-time">{n.time}</span>
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: renderBiasTag(n.source) }} />
                  <div className="news-headline">{n.headline}</div>
                  {n.url && n.url !== '#' && (
                    <a className="news-link" href={n.url} target="_blank" rel="noopener noreferrer">Read more ↗</a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Live News */}
          <div className="country-news-section">
            <div className="country-news-title">LIVE NEWS FOR {countryName.toUpperCase()}</div>
            {newsLoading ? (
              <div className="country-news-loading">Loading latest news...</div>
            ) : news.length > 0 ? (
              news.map((article, i) => (
                <div key={i} className="news-item">
                  <div className="news-meta">
                    {article.category && (
                      <span className={`card-cat ${article.category}`} style={{ fontSize: '7px', padding: '1px 4px' }}>{article.category}</span>
                    )}
                    <span className="news-source">{article.source}</span>
                    <span className="news-time">{article.time}</span>
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: renderBiasTag(article.source) }} />
                  <div className="news-headline">{article.headline}</div>
                  {article.url && article.url !== '#' && (
                    <a className="news-link" href={article.url} target="_blank" rel="noopener noreferrer">Read more ↗</a>
                  )}
                </div>
              ))
            ) : (
              <div style={{ color: '#6b7280', fontSize: '11px' }}>No major international news coverage for this country at this time. This typically indicates a period of relative stability.</div>
            )}
          </div>

          {/* Sanctions - always shown */}
          <div className="sanctions-section">
            <div className="sanctions-toggle" onClick={() => setSanctionsOpen(!sanctionsOpen)}>
              <div className="sanctions-toggle-left">
                <span className="sanctions-toggle-title">Sanctions</span>
              </div>
              <span className={`sanctions-chevron${sanctionsOpen ? ' open' : ''}`}>&#9660;</span>
            </div>
            <div className={`sanctions-body${sanctionsOpen ? ' open' : ''}`}>
              <div className="sanctions-inner">
                {sanctions && sanctions.on && sanctions.on.length > 0 && (
                  <>
                    <div className="sanctions-group-title">Sanctions on {countryName}</div>
                    {sanctions.on.map((s, i) => (
                      <div key={i} className="sanction-item">
                        <div className="sanction-header">
                          <span className="sanction-by">{s.by}</span>
                          <span className="sanction-year">{s.year}</span>
                        </div>
                        <div className="sanction-reason">{s.reason}</div>
                      </div>
                    ))}
                  </>
                )}
                {sanctions && sanctions.by && sanctions.by.length > 0 && (
                  <>
                    <div className="sanctions-group-title">Sanctions by {countryName}</div>
                    {sanctions.by.map((s, i) => (
                      <div key={i} className="sanction-item">
                        <div className="sanction-header">
                          <span className="sanction-by">{s.target}</span>
                          <span className="sanction-year">{s.year}</span>
                        </div>
                        <div className="sanction-reason">{s.reason}</div>
                      </div>
                    ))}
                  </>
                )}
                {(!sanctions || (!sanctions.on?.length && !sanctions.by?.length)) && (
                  <div className="sanctions-none">No active sanctions data for this country.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
