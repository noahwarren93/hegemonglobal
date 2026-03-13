// CountryModal.jsx - Country detail modal with analysis, sanctions, trend chart, news

import { useState, useEffect } from 'react';
import { COUNTRIES, SANCTIONS_DATA, TAG_COLORS, getResearchSources } from '../../data/countries';
import { renderCredibilityTag, renderTrendChart, getStateMediaLabel, timeAgo, SPORTS_HEADLINE_RE, SOURCE_BLOCKLIST, getSourceCredibility } from '../../utils/riskColors';
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
        const raw = articles || [];

        // Pre-filter: remove sports headlines and blocked sources from entire pool
        const all = raw.filter(a => {
          const hl = (a.headline || '').toLowerCase();
          // Block sports headlines
          if (SPORTS_HEADLINE_RE.test(hl)) return false;
          // Block known non-news sources
          if (a.source && SOURCE_BLOCKLIST.has(a.source.toLowerCase())) return false;
          // Block generic roundup/brief titles
          if (/^(morning news brief|evening roundup|daily digest|news update|daily briefing|weekly roundup|news wrap|headlines today)\b/i.test(hl.trim())) return false;
          // Block headlines too short to be real articles
          if ((a.headline || '').length < 15) return false;
          // Block celebrity/entertainment headlines
          if (/\b(meghan markle|markle|kardashian|kim kardashian|kanye west|jenner|prince harry|royal baby|duchess of sussex|kate middleton|celebrity gossip|red carpet fashion)\b/i.test(hl)) return false;
          // Block X.com/Twitter sourced articles (unreliable without editorial curation)
          if (a.source && /\b(x\.com|twitter)\b/i.test(a.source)) return false;
          if (a.url && /^https?:\/\/(x\.com|twitter\.com)\//i.test(a.url)) return false;
          return true;
        });

        const nowMs = Date.now();
        const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
        const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000;

        // Robust date parser — returns ms timestamp or 0
        const parseDate = (d) => {
          if (!d) return 0;
          const t = new Date(d).getTime();
          return isNaN(t) ? 0 : t;
        };

        // Opinion/commentary patterns — exclude from Top Stories
        const OPINION_RE = /\b(trolls?|slams?|claps?\s*back|opinion:|editorial:|op-ed|column:|commentary:|rips|blasts|mocks|dunks on|fires back|hits back|lashes out|takes aim|sounds off)\b/i;

        // Generic roundup titles — exclude from Latest Coverage
        const GENERIC_RE = /^(morning news brief|evening roundup|daily digest|news update|daily briefing|weekly roundup|news wrap|headlines today|today'?s top stories|the daily|what happened today|news summary)\b/i;

        // Check if country is the PRIMARY subject (appears in first half of headline)
        const isPrimarySubject = (headline) => {
          const hl = (headline || '').toLowerCase();
          const mid = Math.ceil(hl.length / 2);
          const firstHalf = hl.substring(0, mid);
          const cLower = countryName.toLowerCase();
          if (firstHalf.includes(cLower)) return true;
          // Also check demonyms in first half
          const demonyms = {
            'Iran': ['iranian', 'tehran', 'hormuz', 'khamenei'],
            'Ukraine': ['ukrainian', 'kyiv', 'zelensky'],
            'Russia': ['russian', 'moscow', 'kremlin', 'putin'],
            'Israel': ['israeli', 'idf', 'netanyahu'],
            'Palestine': ['palestinian', 'gaza', 'hamas'],
            'China': ['chinese', 'beijing', 'xi jinping'],
            'Pakistan': ['pakistani', 'islamabad'],
            'Sudan': ['sudanese', 'khartoum', 'darfur'],
          };
          const terms = demonyms[countryName] || [];
          return terms.some(t => firstHalf.includes(t));
        };

        // Helper: get significant words from headline
        const getWords = (h) => (h || '').toLowerCase().split(/\s+/).filter(w => w.length > 2);

        // Helper: check if two articles cover the same event (50%+ word overlap)
        const isSameEvent = (a, b) => {
          const wa = getWords(a.headline);
          const wb = getWords(b.headline);
          if (wa.length === 0 || wb.length === 0) return false;
          const overlap = wa.filter(w => wb.includes(w)).length;
          return overlap / Math.min(wa.length, wb.length) >= 0.5;
        };

        // Count unique source domains in a cluster
        const uniqueSources = (cluster) => new Set(cluster.map(a => (a.source || '').toLowerCase())).size;

        // Top Stories pool: within 7 days, primary subject, not opinion
        const topPool = all.filter(a => {
          const t = parseDate(a.pubDate);
          if (t === 0 || (nowMs - t) > SEVEN_DAYS) return false;
          if (!isPrimarySubject(a.headline)) return false;
          if (OPINION_RE.test(a.headline || '')) return false;
          return true;
        });

        // Cluster by event
        const clusters = [];
        for (const article of topPool) {
          let placed = false;
          for (const cluster of clusters) {
            if (isSameEvent(article, cluster[0])) {
              cluster.push(article);
              placed = true;
              break;
            }
          }
          if (!placed) clusters.push([article]);
        }

        // Conflict keywords boost for Top Stories ranking
        const CONFLICT_RE = /\b(killed|attacks?|strikes?|war|military|bomb(?:ed|ing)?|casualties|explosion|shooting|invasion|troops|fighting|airstrike|massacre|genocide|assassination|hostage|wounded|shelling|missile|rocket|drone strike|armed|clashes|siege|offensive)\b/i;

        // Sort clusters by conflict priority + unique source count, then recency
        clusters.sort((a, b) => {
          const conflictA = a.some(x => CONFLICT_RE.test(x.headline || '')) ? 3 : 0;
          const conflictB = b.some(x => CONFLICT_RE.test(x.headline || '')) ? 3 : 0;
          const scoreA = uniqueSources(a) + conflictA;
          const scoreB = uniqueSources(b) + conflictB;
          if (scoreB !== scoreA) return scoreB - scoreA;
          const newestA = Math.max(...a.map(x => parseDate(x.pubDate)));
          const newestB = Math.max(...b.map(x => parseDate(x.pubDate)));
          return newestB - newestA;
        });
        const top = clusters.slice(0, 3).map(cluster => {
          const sorted = [...cluster].sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));
          return { ...sorted[0], _sourceCount: uniqueSources(cluster) };
        });
        setTopStories(top);

        // Latest Coverage: soft window — 14d first, expand to 30d/90d if < 3 articles
        const topUrls = new Set(top.map(a => a.url));
        const topHeadlines = new Set(top.map(a => (a.headline || '').toLowerCase().substring(0, 60)));
        const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
        const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000;

        const filterByWindow = (windowMs) => all.filter(a => {
          const t = parseDate(a.pubDate);
          if (t === 0) return false;
          if ((nowMs - t) > windowMs) return false;
          if (a.url && topUrls.has(a.url)) return false;
          if (topHeadlines.has((a.headline || '').toLowerCase().substring(0, 60))) return false;
          if (GENERIC_RE.test((a.headline || '').trim())) return false;
          return true;
        });

        let withinWindow = filterByWindow(FOURTEEN_DAYS);
        if (withinWindow.length < 3) withinWindow = filterByWindow(THIRTY_DAYS);
        if (withinWindow.length < 3) withinWindow = filterByWindow(NINETY_DAYS);

        // Cluster-based dedup: group by event, collapse 3+ to most credible source
        const CRED_RANK = { wire: 6, specialist: 5, independent: 4, 'state-affiliated': 3, tabloid: 2, state: 1 };
        const getCredScore = (src) => CRED_RANK[getSourceCredibility(src)] || 3;

        const dedupClusters = [];
        for (const article of withinWindow) {
          let placed = false;
          for (const cluster of dedupClusters) {
            if (isSameEvent(article, cluster[0])) {
              cluster.push(article);
              placed = true;
              break;
            }
          }
          if (!placed) dedupClusters.push([article]);
        }

        const deduped = [];
        for (const cluster of dedupClusters) {
          if (cluster.length >= 3) {
            // 3+ articles about same event → keep most credible source
            cluster.sort((a, b) => getCredScore(b.source) - getCredScore(a.source));
            deduped.push(cluster[0]);
          } else {
            deduped.push(...cluster);
          }
        }

        // Sort strictly by date, newest first
        deduped.sort((a, b) => parseDate(b.pubDate) - parseDate(a.pubDate));
        setLatestCoverage(deduped);
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
