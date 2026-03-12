// CountryModal.jsx - Country detail modal with analysis, sanctions, trend chart, news

import { useState, useEffect } from 'react';
import { COUNTRIES, SANCTIONS_DATA, TAG_COLORS, getResearchSources } from '../../data/countries';
import { renderCredibilityTag, renderTrendChart, getStateMediaLabel, timeAgo } from '../../utils/riskColors';
import CountryFlag from '../CountryFlag';
import { fetchCountryNews } from '../../services/apiService';

export default function CountryModal({ countryName, isOpen, onClose }) {
  const [topStories, setTopStories] = useState([]);
  const [latestCoverage, setLatestCoverage] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [sanctionsOpen, setSanctionsOpen] = useState(false);
  const [casualtiesExpanded, setCasualtiesExpanded] = useState(false);

  const country = countryName ? COUNTRIES[countryName] : null;

  /* eslint-disable react-hooks/set-state-in-effect */
  // Fetch news when modal opens, split into Top Stories + Latest Coverage
  useEffect(() => {
    if (isOpen && countryName) {
      setTopStories([]);
      setLatestCoverage([]);
      setNewsLoading(true);
      setSanctionsOpen(false);
      setCasualtiesExpanded(false);
      fetchCountryNews(countryName).then(articles => {
        const all = articles || [];
        const nowMs = Date.now();
        const FIVE_DAYS = 5 * 24 * 60 * 60 * 1000;
        const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
        // Top Stories: prefer last 5 days, fall back to 7 days; sort by date then quality
        let topPool = all.filter(a => a.pubDate && (nowMs - new Date(a.pubDate).getTime()) < FIVE_DAYS);
        if (topPool.length === 0) {
          topPool = all.filter(a => a.pubDate && (nowMs - new Date(a.pubDate).getTime()) < SEVEN_DAYS);
        }
        if (topPool.length === 0) topPool = all;
        const top = [...topPool].sort((a, b) => {
          const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
          const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
          if (db !== da) return db - da;
          return (b.qualityScore || 0) - (a.qualityScore || 0);
        }).slice(0, 5);
        setTopStories(top);
        // Latest Coverage: most recent by date (3 days, expand to 6)
        const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
        const SIX_DAYS = 6 * 24 * 60 * 60 * 1000;
        let recent = all.filter(a => a.pubDate && (nowMs - new Date(a.pubDate).getTime()) < THREE_DAYS);
        if (recent.length === 0) {
          recent = all.filter(a => a.pubDate && (nowMs - new Date(a.pubDate).getTime()) < SIX_DAYS);
        }
        const sorted = [...recent].sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)).slice(0, 8);
        setLatestCoverage(sorted);
        setNewsLoading(false);
      }).catch(() => {
        setNewsLoading(false);
      });
    }
  }, [isOpen, countryName]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
  const researchSources = getResearchSources(countryName);

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

  // Helper: clean Google News headline/source extraction
  const cleanNewsDisplay = (article) => {
    let displayHeadline = article.headline;
    let displaySource = article.source;
    if (displaySource && displaySource.includes('Google News') && displayHeadline) {
      const dashIdx = displayHeadline.lastIndexOf(' - ');
      if (dashIdx > 0) {
        displaySource = displayHeadline.substring(dashIdx + 3).trim();
        displayHeadline = displayHeadline.substring(0, dashIdx).trim();
      }
    }
    return { ...article, headline: displayHeadline, source: displaySource };
  };

  // Helper: render a single news item
  const renderNewsItem = (article, i) => {
    const stateLabel = getStateMediaLabel(article.source);
    return (
      <div key={i} className="news-item">
        <div className="news-meta">
          {article.category && (
            <span className={`card-cat ${article.category}`} style={{ fontSize: '7px', padding: '1px 4px' }}>{article.category}</span>
          )}
          <span className="news-source">
            {article.source}
            {stateLabel && (
              <span style={{ fontSize: '7px', color: '#f59e0b', background: '#78350f', padding: '1px 4px', borderRadius: '3px', marginLeft: '6px', fontWeight: 600, letterSpacing: '0.3px' }}>
                {stateLabel}
              </span>
            )}
          </span>
          <span className="news-time">{article.pubDate ? timeAgo(article.pubDate) : (article.time || '')}</span>
        </div>
        <span dangerouslySetInnerHTML={{ __html: renderCredibilityTag(article.source) }} />
        <div className="news-headline">
          {article.url && article.url !== '#' ? (
            <a href={article.url} target="_blank" rel="noopener noreferrer" className="news-link" style={{ fontSize: '12px' }}>{article.headline}</a>
          ) : article.headline}
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        {/* Header */}
        <div className="modal-header">
          <span className="modal-flag"><CountryFlag flag={country.flag} /></span>
          <div className="modal-titles">
            <div className="modal-title">
              <span>{countryName}</span>
              <span className={`modal-risk risk-${country.risk}`} style={{ color: '#fff' }}>
                {country.risk.toUpperCase()}
              </span>
              {country.tags && country.tags.length > 0 && (
                <div className="country-tags">
                  {country.tags.map((tag, i) => (
                    <span key={i} className="country-tag"
                      style={{ background: TAG_COLORS[tag]?.bg, color: TAG_COLORS[tag]?.text }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
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

          {/* Nuclear Arsenal */}
          {country.nuclear && (
            <div className="nuclear-section">
              <div className="nuclear-header">
                <span className="nuclear-icon">{'\u2622\uFE0F'}</span>
                <span className="nuclear-count">{country.nuclear.warheads}</span>
                <span className="nuclear-label">Nuclear Warheads</span>
              </div>
              <div className="nuclear-details">
                <span className="nuclear-status">{country.nuclear.status}</span>
                <span className="nuclear-deployed">{country.nuclear.deployed}</span>
                <span className="nuclear-source">Source: {country.nuclear.source}</span>
              </div>
            </div>
          )}

          {/* Casualty Estimates */}
          {country.casualties && (
            <div className="casualties-section">
              <div className="casualties-header">
                <div className="casualties-figure">
                  <span className="casualties-label">Est. Casualties:</span>
                  <span className="casualties-total">{country.casualties.total}</span>
                  {country.casualties.contested && (
                    <button className="casualties-contested" onClick={() => setCasualtiesExpanded(!casualtiesExpanded)}>
                      Contested {casualtiesExpanded ? '▴' : '▾'}
                    </button>
                  )}
                </div>
                <div className="casualties-meta">
                  <span className="casualties-scope">{country.casualties.label}</span>
                  {!country.casualties.contested && (
                    <span className="casualties-source">Source: {country.casualties.source}</span>
                  )}
                  <span className="casualties-updated">Last updated: {country.casualties.lastUpdated}</span>
                </div>
              </div>
              {country.casualties.contested && casualtiesExpanded && country.casualties.sources && (
                <div className="casualties-sources">
                  {country.casualties.sources.map((src, i) => (
                    <div key={i} className="casualties-source-item">
                      <div className="casualties-source-header">
                        <span className="casualties-source-name">{src.name}</span>
                        <span className="casualties-source-figure">{src.figure}</span>
                      </div>
                      <div className="casualties-source-note">{src.note}</div>
                    </div>
                  ))}
                </div>
              )}
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

          {/* Top Stories — biggest stories from last 7 days, sorted by quality */}
          {newsLoading && (
            <div style={{ marginTop: '16px' }}>
              <div className="section-title">Top Stories</div>
              <div style={{ color: '#6b7280', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', border: '1.5px solid #374151', borderTopColor: '#06b6d4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Loading...
              </div>
            </div>
          )}
          {!newsLoading && topStories.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div className="section-title">Top Stories</div>
              {topStories.map((article, i) => renderNewsItem(cleanNewsDisplay(article), i))}
            </div>
          )}
          {!newsLoading && topStories.length === 0 && (
            <div style={{ marginTop: '16px' }}>
              <div className="section-title">Top Stories</div>
              <div style={{ color: '#6b7280', fontSize: '11px' }}>No recent developments</div>
            </div>
          )}

          {/* Latest Coverage — most recent articles, sorted by date */}
          {!newsLoading && latestCoverage.length > 0 && (
            <div className="country-news-section">
              <div className="country-news-title">Latest Coverage</div>
              {latestCoverage.map((article, i) => renderNewsItem(cleanNewsDisplay(article), i))}
            </div>
          )}

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

          {/* Further Research */}
          {researchSources.length > 0 && (
            <div className="research-section">
              <div className="section-title">Further Research</div>
              {researchSources.map((src, i) => (
                <a key={i} className="research-link" href={src.url} target="_blank" rel="noopener noreferrer">
                  <div>
                    <div className="research-name">{src.name}</div>
                    <div className="research-desc">{src.description}</div>
                  </div>
                  <span className="research-arrow">&#8599;</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
