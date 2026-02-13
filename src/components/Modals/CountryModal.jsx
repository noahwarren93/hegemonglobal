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

  // Build facts grid
  const facts = [];
  if (country.region) facts.push({ label: 'Region', value: country.region });
  if (country.title) facts.push({ label: 'Gov Type', value: country.title });
  if (country.leader) facts.push({ label: 'Leader', value: country.leader });
  if (country.pop) facts.push({ label: 'Population', value: country.pop });
  if (country.gdp) facts.push({ label: 'GDP', value: country.gdp });
  if (country.military) facts.push({ label: 'Military', value: country.military });

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content country-modal">
        {/* Close button */}
        <button className="modal-close" onClick={onClose}>&times;</button>

        {/* Header */}
        <div className="modal-header">
          <span className="modal-flag">{country.flag}</span>
          <h2 className="modal-title">{countryName}</h2>
          <span className={`modal-risk risk-${country.risk}`} style={{ color: riskColor }}>
            {country.risk.toUpperCase()}
          </span>
        </div>

        {/* Facts Grid */}
        {facts.length > 0 && (
          <div className="modal-facts">
            {facts.map((fact, i) => (
              <div key={i} className="fact-item">
                <div className="fact-label">{fact.label}</div>
                <div className="fact-value">{fact.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Analysis */}
        {country.analysis && (
          <div className="modal-section">
            <div className="section-label">ANALYSIS</div>
            <div className="modal-analysis">{country.analysis}</div>
          </div>
        )}

        {/* Sanctions */}
        {sanctions && (sanctions.on?.length > 0 || sanctions.by?.length > 0) && (
          <div className="modal-section">
            <div
              className="section-label sanctions-toggle"
              onClick={() => setSanctionsOpen(!sanctionsOpen)}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              SANCTIONS
              <span style={{
                fontSize: '10px',
                transform: sanctionsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s'
              }}>&#9660;</span>
              {sanctions.severity && sanctions.severity !== 'none' && (
                <span className={`sanctions-severity severity-${sanctions.severity}`}>
                  {sanctions.severity.toUpperCase()}
                </span>
              )}
            </div>
            {sanctionsOpen && (
              <div className="sanctions-content">
                {sanctions.on && sanctions.on.length > 0 && (
                  <div className="sanctions-group">
                    <div className="sanctions-group-label">Sanctions ON {countryName}:</div>
                    {sanctions.on.map((s, i) => (
                      <div key={i} className="sanction-item">
                        <span className="sanction-by">By {s.by}</span>
                        <span className="sanction-reason">{s.reason}</span>
                        <span className="sanction-year">({s.year})</span>
                      </div>
                    ))}
                  </div>
                )}
                {sanctions.by && sanctions.by.length > 0 && (
                  <div className="sanctions-group">
                    <div className="sanctions-group-label">Sanctions BY {countryName}:</div>
                    {sanctions.by.map((s, i) => (
                      <div key={i} className="sanction-item">
                        <span className="sanction-target">On {s.target}</span>
                        <span className="sanction-reason">{s.reason}</span>
                        <span className="sanction-year">({s.year})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Trend Chart */}
        <div className="modal-section">
          <div className="section-label">RISK TREND (12 MONTHS)</div>
          <div dangerouslySetInnerHTML={{ __html: renderTrendChart(countryName, country.risk) }} />
        </div>

        {/* News Coverage */}
        <div className="modal-section">
          <div className="section-label">NEWS COVERAGE</div>
          {newsLoading ? (
            <div className="news-loading">
              <div className="loading-spinner" />
              <span>Fetching latest news...</span>
            </div>
          ) : news.length > 0 ? (
            <div className="modal-news">
              {news.map((article, i) => (
                <div key={i} className="modal-news-item">
                  <div className="news-item-header">
                    <span className={`card-cat ${article.category}`}>{article.category}</span>
                    <span className="news-item-time">{article.time}</span>
                  </div>
                  <div className="news-item-headline">
                    {article.url && article.url !== '#' ? (
                      <a href={article.url} target="_blank" rel="noopener noreferrer">{article.headline}</a>
                    ) : (
                      article.headline
                    )}
                  </div>
                  <div className="news-item-source">
                    {article.source}
                    <span dangerouslySetInnerHTML={{ __html: renderBiasTag(article.source) }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="news-empty">No recent news coverage available.</div>
          )}
        </div>
      </div>
    </div>
  );
}
