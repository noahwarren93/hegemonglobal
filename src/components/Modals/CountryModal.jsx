// CountryModal.jsx - Country detail modal with analysis, sanctions, trend chart, news

import { useState, useEffect } from 'react';
import { COUNTRIES, SANCTIONS_DATA, TAG_COLORS, getResearchSources } from '../../data/countries';
import { renderUnifiedSourceTag, renderTrendChart, timeAgo, SPORTS_HEADLINE_RE, SOURCE_BLOCKLIST, getSourceCredibility } from '../../utils/riskColors';
import CountryFlag from '../CountryFlag';
import { fetchCountryNews } from '../../services/apiService';
import { COUNTRY_CODES } from '../../data/countryCodes';
import { fetchEconomicBrief, getEconomicDataForCountry } from '../../services/economicService';

// Economic keyword filter for news
const ECONOMIC_KEYWORDS_RE = /\b(gdp|inflation|interest rate|central bank|federal reserve|ecb|imf|world bank|recession|deficit|debt|bond|treasury|fiscal|monetary|currency|devaluation|tariff|trade war|sanctions?|unemployment|jobs report|stock market|credit rating|default|bailout|austerity|stimulus|quantitative|exchange rate)\b/i;

export default function CountryModal({ countryName, isOpen, onClose, economicMode, economicData }) {
  const [topStories, setTopStories] = useState([]);
  const [latestCoverage, setLatestCoverage] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [sanctionsOpen, setSanctionsOpen] = useState(false);
  const [casualtiesExpanded, setCasualtiesExpanded] = useState(false);
  const [econBrief, setEconBrief] = useState(null);
  const [econBriefLoading, setEconBriefLoading] = useState(false);
  const [econBriefTimeout, setEconBriefTimeout] = useState(false);
  const [conflictExpanded, setConflictExpanded] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState([]);

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
        // OR is mentioned in a border/proximity context anywhere in the headline
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
          if (terms.some(t => firstHalf.includes(t))) return true;
          // Border/proximity mentions anywhere in headline count for both countries
          const borderRe = new RegExp('\\b(border(?:s|ing)?\\s+(?:with|of|near|between|region)\\s+' + cLower + '|' + cLower + '(?:\'s|\\s+)border|near\\s+(?:the\\s+)?' + cLower + ')\\b');
          if (borderRe.test(hl)) return true;
          return false;
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
        let top = clusters.slice(0, 3).map(cluster => {
          const sorted = [...cluster].sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));
          return { ...sorted[0], _sourceCount: uniqueSources(cluster) };
        });

        // If no top stories but we have articles, always show at least one
        // Relax filters: drop isPrimarySubject, widen to 14 days, then take best from all
        if (top.length === 0 && all.length > 0) {
          const relaxedPool = all.filter(a => {
            const t = parseDate(a.pubDate);
            if (t > 0 && (nowMs - t) > FOURTEEN_DAYS) return false;
            if (OPINION_RE.test(a.headline || '')) return false;
            return true;
          });
          const fallbackPool = relaxedPool.length > 0 ? relaxedPool : all;
          // Pick the highest quality article
          const best = [...fallbackPool].sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));
          top = [{ ...best[0], _sourceCount: 1 }];
        }
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

  // Fetch economic brief + calendar when in economic mode
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isOpen && countryName && economicMode) {
      const codes = COUNTRY_CODES[countryName];
      if (codes) {
        setEconBriefLoading(true);
        setEconBrief(null);
        setEconBriefTimeout(false);
        setConflictExpanded(false);
        setCalendarEvents([]);
        const timeoutId = setTimeout(() => setEconBriefTimeout(true), 8000);
        fetchEconomicBrief(codes.alpha3).then(data => {
          clearTimeout(timeoutId);
          setEconBrief(data);
          setEconBriefLoading(false);
          setEconBriefTimeout(false);
        }).catch(() => { clearTimeout(timeoutId); setEconBriefLoading(false); });
        // Fetch Forex Factory calendar events for this country
        fetch('https://hegemon-rss-proxy.hegemonglobal.workers.dev/api/economic-calendar')
          .then(r => r.ok ? r.json() : null)
          .then(data => {
            if (data?.events) {
              const now = new Date();
              const countryEvents = data.events
                .filter(e => e.country === codes.alpha3 && new Date(e.date) >= now)
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 8);
              setCalendarEvents(countryEvents);
            }
          })
          .catch(() => {});
      }
    }
  }, [isOpen, countryName, economicMode]);
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

  // Economic data for this country
  const countryEcon = economicMode ? getEconomicDataForCountry(economicData, countryName) : null;

  // Helper: color class for indicator values
  const indicatorColor = (value, thresholds) => {
    if (value === null || value === undefined) return 'neutral';
    const [goodMax, warnMax] = thresholds;
    if (value <= goodMax) return 'good';
    if (value <= warnMax) return 'warn';
    return 'bad';
  };
  const indicatorColorInvert = (value, thresholds) => {
    if (value === null || value === undefined) return 'neutral';
    const [goodMin, warnMin] = thresholds;
    if (value >= goodMin) return 'good';
    if (value >= warnMin) return 'warn';
    return 'bad';
  };

  const sanctions = SANCTIONS_DATA[countryName];
  const researchSources = getResearchSources(countryName);

  // Build facts grid (original order: Region, Population, GDP, Leader)
  const facts = [];
  if (country.region) facts.push({ label: 'Region', value: country.region });
  if (country.pop) facts.push({ label: 'Population', value: country.pop });
  if (country.gdp) facts.push({ label: 'GDP', value: country.gdp });
  if (country.leader) facts.push({ label: 'Leader', value: country.leader });
  if (country.capital) facts.push({ label: 'Capital', value: country.capital });
  if (country.currency) facts.push({ label: 'Currency', value: country.currency });

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
    return (
      <div key={i} className="news-item">
        <div className="news-meta">
          {article.category && (
            <span className={`card-cat ${article.category}`} style={{ fontSize: '7px', padding: '1px 4px' }}>{article.category}</span>
          )}
          <span className="news-source">{article.source}</span>
          <span dangerouslySetInnerHTML={{ __html: renderUnifiedSourceTag(article.source) }} />
          <span className="news-time">{article.pubDate ? timeAgo(article.pubDate) : (article.time || '')}</span>
        </div>
        <div className="news-headline">
          {article.url && article.url !== '#' ? (
            <a href={article.url} target="_blank" rel="noopener noreferrer" className="news-link" style={{ fontSize: '12px' }}>{article.headline}</a>
          ) : article.headline}
        </div>
      </div>
    );
  };

  const ECON_TIER_COLORS_MAP = { catastrophic: '#dc2626', extreme: '#f97316', severe: '#eab308', stormy: '#8b5cf6', cloudy: '#3b82f6', clear: '#22c55e' };

  return (
    <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        {/* Green tinted header bar for economic mode */}
        {economicMode && (
          <div style={{ background: 'linear-gradient(90deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 50%, transparent 100%)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(34,197,94,0.2)' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: ECON_TIER_COLORS_MAP[countryEcon?.tier] || '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {countryEcon?.tier || 'N/A'}
            </span>
            <span style={{ fontSize: '9px', color: '#9ca3af' }}>Economic Risk</span>
            <span className="beta-badge">BETA</span>
            {countryEcon?.riskScore != null && (
              <span style={{ fontSize: '10px', color: '#6b7280', marginLeft: 'auto' }}>Score: {countryEcon.riskScore}/100</span>
            )}
          </div>
        )}
        {/* Header */}
        <div className="modal-header">
          <span className="modal-flag"><CountryFlag flag={country.flag} /></span>
          <div className="modal-titles">
            <div className="modal-title">
              <span>{countryName}</span>
              <span className={`modal-risk risk-${country.risk}`} style={{ color: '#fff' }}>
                {country.risk.toUpperCase()}
              </span>
              {economicMode && (
                <span className="econ-risk-badge" style={{ background: `${ECON_TIER_COLORS_MAP[countryEcon?.tier] || '#6b7280'}22`, color: ECON_TIER_COLORS_MAP[countryEcon?.tier] || '#6b7280', border: `1px solid ${ECON_TIER_COLORS_MAP[countryEcon?.tier] || '#6b7280'}40` }}>
                  ECON: {countryEcon?.tier ? countryEcon.tier.toUpperCase() : 'N/A'}
                </span>
              )}
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
          {/* ===== Economic Mode Content ===== */}
          {economicMode && (
            <>
              {/* Economic Indicators Grid */}
              <div className="section-title">Economic Indicators</div>
              <div className="econ-indicators-grid">
                <div className="econ-indicator">
                  <div className="econ-indicator-label">GDP Growth</div>
                  <div className={`econ-indicator-value ${indicatorColorInvert(countryEcon?.gdpGrowth, [3, 1])}`}>
                    {countryEcon?.gdpGrowth != null ? `${countryEcon.gdpGrowth}%` : 'N/A'}
                  </div>
                </div>
                <div className="econ-indicator">
                  <div className="econ-indicator-label">Inflation</div>
                  <div className={`econ-indicator-value ${indicatorColor(countryEcon?.inflation, [5, 10])}`}>
                    {countryEcon?.inflation != null ? `${countryEcon.inflation}%` : 'N/A'}
                  </div>
                </div>
                <div className="econ-indicator">
                  <div className="econ-indicator-label">Debt/GDP</div>
                  <div className={`econ-indicator-value ${indicatorColor(countryEcon?.debtGdp, [60, 90])}`}>
                    {countryEcon?.debtGdp != null ? `${countryEcon.debtGdp}%` : 'N/A'}
                  </div>
                </div>
                <div className="econ-indicator">
                  <div className="econ-indicator-label">Unemployment</div>
                  <div className={`econ-indicator-value ${indicatorColor(countryEcon?.unemployment, [7, 12])}`}>
                    {countryEcon?.unemployment != null ? `${countryEcon.unemployment}%` : 'N/A'}
                  </div>
                </div>
                <div className="econ-indicator">
                  <div className="econ-indicator-label">Interest Rate</div>
                  <div className={`econ-indicator-value neutral`}>
                    {countryEcon?.interestRate != null ? `${countryEcon.interestRate}%` : 'N/A'}
                  </div>
                </div>
                <div className="econ-indicator">
                  <div className="econ-indicator-label">Credit Rating</div>
                  <div className={`econ-indicator-value neutral`}>
                    {countryEcon?.creditRating || 'N/A'}
                  </div>
                </div>
                <div className="econ-indicator">
                  <div className="econ-indicator-label">Currency YTD</div>
                  <div className={`econ-indicator-value ${countryEcon?.currencyYtd != null ? (countryEcon.currencyYtd > 5 ? 'bad' : countryEcon.currencyYtd > 2 ? 'warn' : 'good') : 'neutral'}`}>
                    {countryEcon?.currencyYtd != null ? `${countryEcon.currencyYtd > 0 ? '+' : ''}${countryEcon.currencyYtd}%` : 'N/A'}
                  </div>
                </div>
                <div className="econ-indicator">
                  <div className="econ-indicator-label">Risk Score</div>
                  <div className={`econ-indicator-value ${countryEcon?.riskScore != null ? (countryEcon.riskScore > 55 ? 'bad' : countryEcon.riskScore > 25 ? 'warn' : 'good') : 'neutral'}`}>
                    {countryEcon?.riskScore != null ? `${countryEcon.riskScore}/100` : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Economic Snapshot from Claude (right below indicators) */}
              {econBriefLoading && (
                <div style={{ marginBottom: '12px' }}>
                  {econBriefTimeout && (
                    <div style={{ color: '#f59e0b', fontSize: '10px', marginBottom: '8px' }}>Analysis loading slowly — cached results will appear shortly</div>
                  )}
                  {['Economic Snapshot', 'Key Risks', 'Outlook'].map(label => (
                    <div key={label} className="econ-analysis-block" style={{ opacity: 0.5 }}>
                      <div className="econ-analysis-header">{label}</div>
                      <div className="econ-skeleton-line" style={{ width: '95%' }} />
                      <div className="econ-skeleton-line" style={{ width: '80%' }} />
                      <div className="econ-skeleton-line" style={{ width: '60%' }} />
                    </div>
                  ))}
                </div>
              )}
              {econBrief && (
                <>
                  {econBrief.snapshot && (
                    <div className="econ-analysis-block">
                      <div className="econ-analysis-header">Economic Snapshot</div>
                      <p className="econ-analysis-text">{econBrief.snapshot}</p>
                    </div>
                  )}
                  {econBrief.risks && (
                    <div className="econ-analysis-block">
                      <div className="econ-analysis-header">Key Risks</div>
                      <p className="econ-analysis-text">{econBrief.risks}</p>
                    </div>
                  )}
                  {econBrief.outlook && (
                    <div className="econ-analysis-block">
                      <div className="econ-analysis-header">Outlook</div>
                      <p className="econ-analysis-text">{econBrief.outlook}</p>
                    </div>
                  )}
                </>
              )}
              {!econBriefLoading && !econBrief && (
                <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '12px' }}>Economic analysis unavailable.</div>
              )}

              {/* Upcoming Economic Events */}
              {econBrief && econBrief.upcoming && econBrief.upcoming.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <div className="section-title">Upcoming Economic Events</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {econBrief.upcoming.map((evt, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '6px 8px', background: 'rgba(34,197,94,0.05)', borderRadius: '4px', borderLeft: '2px solid rgba(34,197,94,0.3)' }}>
                        <div style={{ minWidth: '60px', fontSize: '9px', fontWeight: 700, color: '#22c55e', whiteSpace: 'nowrap' }}>
                          {evt.date ? new Date(evt.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
                        </div>
                        <div style={{ fontSize: '10px', color: '#d1d5db', lineHeight: '1.3' }}>{evt.event}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Economic News */}
              {!newsLoading && (topStories.length > 0 || latestCoverage.length > 0) && (
                <div style={{ marginTop: '12px' }}>
                  <div className="section-title">Economic News</div>
                  {[...topStories, ...latestCoverage]
                    .filter(a => ECONOMIC_KEYWORDS_RE.test(a.headline || ''))
                    .slice(0, 5)
                    .map((article, i) => renderNewsItem(cleanNewsDisplay(article), `econ-${i}`))}
                  {[...topStories, ...latestCoverage].filter(a => ECONOMIC_KEYWORDS_RE.test(a.headline || '')).length === 0 && (
                    <div style={{ color: '#6b7280', fontSize: '11px' }}>No recent economic coverage</div>
                  )}
                </div>
              )}

              {/* Forex Factory Calendar Events */}
              {!econBriefLoading && (
                <div style={{ marginTop: '12px' }}>
                  <div className="section-title">This Week&apos;s Calendar</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {calendarEvents.length === 0 ? (
                      <div style={{ fontSize: '10px', color: '#6b7280', fontStyle: 'italic', padding: '6px 8px' }}>No upcoming events scheduled this week</div>
                    ) : calendarEvents.map((evt, i) => {
                      const d = new Date(evt.date);
                      const impactColor = evt.impact === 'High' ? '#ef4444' : evt.impact === 'Medium' ? '#eab308' : '#6b7280';
                      return (
                        <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '5px 8px', background: '#111827', borderRadius: '4px', borderLeft: `2px solid ${impactColor}` }}>
                          <div style={{ minWidth: '70px', fontSize: '9px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                            {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </div>
                          <div style={{ flex: 1, fontSize: '10px', color: '#d1d5db', lineHeight: '1.3' }}>{evt.title}</div>
                          <div style={{ fontSize: '7px', fontWeight: 700, color: impactColor, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{evt.impact}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* IG Economic Calendar Link */}
              <a
                href="https://www.ig.com/uk/economic-calendar"
                target="_blank"
                rel="noopener noreferrer"
                className="research-link"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}
              >
                <div>
                  <div className="research-name" style={{ color: '#22c55e' }}>IG Economic Calendar</div>
                  <div className="research-desc">Full calendar with all global economic events</div>
                </div>
                <span className="research-arrow">&#8599;</span>
              </a>

              {/* Condensed Conflict Assessment Accordion (ISSUE 8) */}
              <div className="conflict-accordion-toggle" onClick={() => setConflictExpanded(!conflictExpanded)}>
                <span className="conflict-accordion-title">Conflict Assessment</span>
                <span className={`conflict-accordion-chevron${conflictExpanded ? ' open' : ''}`}>&#9660;</span>
              </div>
              <div className={`conflict-accordion-body${conflictExpanded ? ' open' : ''}`}>
                <div style={{ padding: '8px 0' }}>
                  {/* Conflict risk badge */}
                  <span className={`modal-risk risk-${country.risk}`} style={{ color: '#fff', fontSize: '9px', marginBottom: '8px', display: 'inline-block' }}>
                    {country.risk.toUpperCase()}
                  </span>
                  {/* First 2-3 sentences of analysis.what */}
                  {country.analysis && (
                    <p style={{ fontSize: '11px', color: '#d1d5db', lineHeight: '1.4', margin: '6px 0 0' }}>
                      {(typeof country.analysis === 'string' ? country.analysis : (country.analysis.what || '')).split('. ').slice(0, 3).join('. ')}.
                    </p>
                  )}
                  {/* Conflict tags */}
                  {country.tags && country.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                      {country.tags.map((tag, i) => (
                        <span key={i} className="country-tag" style={{ background: TAG_COLORS[tag]?.bg, color: TAG_COLORS[tag]?.text, fontSize: '8px' }}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Full conflict content (shown when NOT in economic mode) */}
          {!economicMode && (
          <>
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
          </>
          )}
        </div>
      </div>
    </div>
  );
}
