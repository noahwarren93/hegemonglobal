// eventsService.js - Article clustering into event groups
// APPROACH: Primary-country grouping. Same country = same cluster.
// For stoplist countries (US/UK/China/Russia), require shared topic keyword.
// Cap at 40 articles per cluster. Second pass merges same-country duplicates.

import { COUNTRY_DEMONYMS } from './apiService';

// ============================================================
// Headline Cleanup
// ============================================================

export function cleanHeadline(headline) {
  if (!headline) return '';
  let h = headline.trim();
  h = h.replace(/\s*[\u2014\u2013\u2015\u00AD—–|]\s*[A-Z][\w\s.&'\u2019,]{0,25}$/, '');
  h = h.replace(/\s+-\s+[A-Z][\w.&'\u2019]{0,15}(?:\s+[A-Z][\w.&'\u2019]+){0,3}\s*$/, '');
  h = h.replace(/\s*:\s+[A-Z][\w.&'\u2019]{0,15}(?:\s+[A-Z][\w.&'\u2019]+){0,2}\s*$/, '');
  h = h.replace(/^(BREAKING|EXCLUSIVE|DEVELOPING|JUST IN|WATCH|UPDATE|OPINION|ANALYSIS|EDITORIAL|LIVE)\s*[:\-–—|]\s*/i, '');
  h = h.replace(/[\s|—–\-:]+$/, '').trim();
  return h;
}

// ============================================================
// Stop-listed countries (too common for same-country clustering)
// ============================================================

const STOPLIST_COUNTRIES = new Set([
  'united states', 'united kingdom', 'china', 'russia'
]);

const STOPLIST_ENTITIES = new Set([
  'united states', 'u.s.', 'american', 'washington', 'trump', 'biden',
  'white house', 'congress', 'pentagon', 'state department',
  'united kingdom', 'british', 'uk', 'britain', 'london',
  'china', 'chinese', 'beijing',
  'russia', 'russian', 'moscow', 'kremlin', 'putin',
  'un', 'parliament', 'white house'
]);

// ============================================================
// Topic keywords for stoplist-country clustering & sub-clustering
// ============================================================

const TOPIC_KEYWORDS = [
  'nuclear', 'military', 'war', 'peace', 'trade', 'sanctions', 'election',
  'protest', 'economy', 'climate', 'summit', 'ceasefire', 'genocide',
  'humanitarian', 'missile', 'troops', 'invasion', 'airstrike', 'bombing',
  'reconstruction', 'occupation', 'territorial', 'coup', 'hostage',
  'refugee', 'famine', 'weapons', 'enrichment', 'blockade', 'drone',
  'assassination', 'espionage', 'cyber', 'treaty', 'alliance',
  'diplomatic', 'tariff', 'embargo', 'deployment'
];

function extractTopics(text) {
  const lower = text.toLowerCase();
  const topics = new Set();
  for (const kw of TOPIC_KEYWORDS) {
    if (lower.includes(kw)) topics.add(kw);
  }
  return topics;
}

function sharedTopics(topicsA, topicsB) {
  let count = 0;
  for (const t of topicsA) {
    if (topicsB.has(t)) count++;
  }
  return count;
}

// ============================================================
// Geographic keywords → primary country mapping
// ============================================================

const GEO_TO_COUNTRY = {
  'gaza': 'palestine', 'west bank': 'palestine', 'rafah': 'palestine',
  'khan younis': 'palestine', 'golan heights': 'israel', 'golan': 'israel',
  'negev': 'israel', 'galilee': 'israel',
  'donbas': 'ukraine', 'donetsk': 'ukraine', 'luhansk': 'ukraine',
  'crimea': 'ukraine', 'zaporizhzhia': 'ukraine', 'kherson': 'ukraine',
  'mariupol': 'ukraine', 'bakhmut': 'ukraine', 'avdiivka': 'ukraine',
  'kharkiv': 'ukraine', 'odesa': 'ukraine',
  'darfur': 'sudan', 'khartoum': 'sudan',
  'tigray': 'ethiopia', 'amhara': 'ethiopia',
  'xinjiang': 'china', 'tibet': 'china', 'hong kong': 'china',
  'kashmir': 'india',
  'aleppo': 'syria', 'idlib': 'syria', 'raqqa': 'syria',
  'mosul': 'iraq', 'kirkuk': 'iraq',
  'sinai': 'egypt',
  'kabul': 'afghanistan', 'kandahar': 'afghanistan', 'helmand': 'afghanistan',
  'pyongyang': 'north korea', 'dmz': 'north korea',
  'strait of hormuz': 'iran', 'hormuz': 'iran',
  'taiwan strait': 'taiwan',
  'kurdistan': 'iraq', 'kurdish': 'iraq',
  'suez canal': 'egypt',
  'board of peace': 'palestine', // Trump's Board of Peace = Gaza
};

// ============================================================
// Headline Word Similarity
// ============================================================

const CLUSTER_STOP_WORDS = new Set([
  'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'but',
  'is', 'are', 'was', 'were', 'has', 'have', 'had', 'be', 'been', 'with', 'by',
  'from', 'as', 'its', 'it', 'this', 'that', 'over', 'after', 'new', 'says',
  'said', 'could', 'may', 'will', 'not', 'no', 'more', 'than', 'about', 'up',
  'out', 'into', 'amid', 'what', 'how', 'why', 'who', 'all', 'also', 'his',
  'her', 'their', 'does', 'do', 'just', 'now', 'being', 'most', 'some',
  'trump', 'says', 'news', 'report', 'world', 'global', 'international'
]);

function getHeadlineWords(text) {
  return new Set(text.toLowerCase().split(/\W+/).filter(w => w.length > 2 && !CLUSTER_STOP_WORDS.has(w)));
}

function wordOverlap(wordsA, wordsB) {
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let shared = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) shared++;
  }
  return shared / Math.min(wordsA.size, wordsB.size);
}

// ============================================================
// Primary Country Extraction
// ============================================================

let _countryLookup = null;
function getCountryLookup() {
  if (_countryLookup) return _countryLookup;
  _countryLookup = [];
  for (const [country, aliases] of Object.entries(COUNTRY_DEMONYMS)) {
    const countryLower = country.toLowerCase();
    _countryLookup.push({ name: countryLower, terms: [countryLower, ...aliases] });
  }
  return _countryLookup;
}

/**
 * Extract the PRIMARY country from a headline.
 * Returns lowercase country name or null.
 */
function extractPrimaryCountry(headline) {
  const lower = (headline || '').toLowerCase();
  if (!lower) return null;

  // Check geographic keywords first (more specific)
  for (const [geo, country] of Object.entries(GEO_TO_COUNTRY)) {
    if (lower.includes(geo)) {
      if (!STOPLIST_ENTITIES.has(country)) return country;
    }
  }

  // Then country names/demonyms — first non-stoplist match
  const lookup = getCountryLookup();
  for (const { name, terms } of lookup) {
    if (STOPLIST_ENTITIES.has(name)) continue;
    for (const term of terms) {
      if (STOPLIST_ENTITIES.has(term)) continue;
      if (term.length <= 3) {
        const regex = new RegExp('\\b' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
        if (regex.test(lower)) return name;
      } else {
        if (lower.includes(term)) return name;
      }
    }
  }

  // Check stoplist countries last — return with a prefix so we know it's stoplist
  for (const [country] of Object.entries(COUNTRY_DEMONYMS)) {
    const cl = country.toLowerCase();
    if (!STOPLIST_COUNTRIES.has(cl)) continue;
    const aliases = COUNTRY_DEMONYMS[country];
    for (const term of [cl, ...aliases]) {
      if (lower.includes(term)) return '_stop_' + cl;
    }
  }

  return null;
}

function extractAllCountries(text) {
  const lower = text.toLowerCase();
  const countries = new Set();
  const lookup = getCountryLookup();
  for (const { name, terms } of lookup) {
    for (const term of terms) {
      if (lower.includes(term)) { countries.add(name); break; }
    }
  }
  return countries;
}

// ============================================================
// Source Ranking
// ============================================================

const SOURCE_RANK = {
  'reuters': 10, 'ap': 10, 'ap news': 10, 'associated press': 10,
  'bbc': 9, 'bbc world': 9, 'bbc news': 9,
  'wall street journal': 8, 'wsj': 8,
  'new york times': 8, 'nyt': 8,
  'financial times': 8, 'ft': 8,
  'the guardian': 7, 'guardian': 7,
  'al jazeera': 7, 'bloomberg': 7, 'the economist': 7,
  'washington post': 7, 'foreign policy': 7,
  'france 24': 6, 'france24': 6,
  'deutsche welle': 6, 'dw': 6,
  'south china morning post': 6, 'scmp': 6,
  'politico': 6, 'nhk world': 6, 'nhk': 6,
  'kyodo news': 6, 'kyodo': 6, 'yonhap': 6,
  'anadolu agency': 5, 'cgtn': 5, 'tass': 5,
  'times of india': 5, 'the hill': 5, 'fox news': 5,
  'rt': 4, 'xinhua': 4, 'mehr news': 4,
  'the telegraph': 6, 'telegraph': 6,
  'cbc news': 6, 'cbc': 6, 'abc australia': 6, 'irish times': 6,
  'the hindu': 5, 'haaretz': 6, 'times of israel': 5,
  'nikkei asia': 6, 'nikkei': 6, 'straits times': 6, 'cna': 6,
  'jakarta post': 5, 'the jakarta post': 5,
  'africa news': 5, 'africanews': 5,
  'nation kenya': 4, 'daily nation': 4,
  'the independent': 5, 'independent': 5,
  'globe and mail': 5, 'sydney morning herald': 5, 'smh': 5,
  'dawn': 5, 'middle east eye': 5, 'folha': 5,
  'taipei times': 4, 'korea herald': 5, 'the national': 4,
  'vietnam news': 3, 'rappler': 4, 'buenos aires herald': 3,
  'premium times': 4, 'mail & guardian': 4,
  'tempo': 3, 'daily star': 3, 'daily mail': 3,
  'new york post': 3, 'ny post': 3
};

function getSourceRank(source) {
  if (!source) return 1;
  const lower = source.toLowerCase();
  for (const [name, rank] of Object.entries(SOURCE_RANK)) {
    if (lower.includes(name)) return rank;
  }
  return 4;
}

// ============================================================
// Event Scoring — by relevance, NOT category grouping
// ============================================================

const TIER1_KEYWORDS = [
  'military', 'nuclear', 'invasion', 'missile', 'troops', 'airstrikes',
  'airstrike', 'bombing', 'war crime', 'genocide', 'ethnic cleansing',
  'weapons', 'arsenal', 'enrichment', 'warhead', 'siege', 'blockade', 'offensive'
];
const TIER2_KEYWORDS = [
  'ceasefire', 'peace', 'peace talks', 'sanctions', 'territorial',
  'coup', 'escalat', 'buildup', 'hostage', 'humanitarian crisis',
  'reconstruction', 'occupation'
];

function getEventTier(event) {
  const text = ((event.headline || '') + ' ' +
    (event.articles || []).map(a => (a.headline || '')).join(' ')).toLowerCase();
  if (TIER1_KEYWORDS.some(kw => text.includes(kw))) return 1;
  if (TIER2_KEYWORDS.some(kw => text.includes(kw))) return 2;
  return 3;
}

function scoreEvent(event) {
  const tier = getEventTier(event);
  const tierScore = (4 - tier) * 5;
  const sourceScore = Math.min(event.sourceCount, 40) * 3;
  const importanceScore = event.importance === 'high' ? 5 : 0;
  return tierScore + sourceScore + importanceScore;
}

// ============================================================
// Main Clustering Function
// ============================================================

const HARD_CAP = 40;

function _yieldToMain() {
  return new Promise(resolve => requestAnimationFrame(resolve));
}

export async function clusterArticles(articles) {
  if (!articles || articles.length === 0) return [];

  // Step 1: Annotate each article — yield every 30 to keep UI responsive
  const annotated = [];
  for (let idx = 0; idx < articles.length; idx++) {
    const article = articles[idx];
    const headline = article.headline || article.title || '';
    const fullText = headline + ' ' + (article.description || '');
    annotated.push({
      ...article,
      _idx: idx,
      _headline: headline,
      _headlineWords: getHeadlineWords(headline),
      _primaryCountry: extractPrimaryCountry(headline),
      _topics: extractTopics(fullText),
      _allCountries: extractAllCountries(fullText),
    });
    if (idx > 0 && idx % 20 === 0) await _yieldToMain();
  }

  // Step 2: Group by primary country
  const countryGroups = new Map();
  const stoplistGroups = new Map(); // stoplist countries need topic-based sub-clustering
  const noCountry = [];

  for (let i = 0; i < annotated.length; i++) {
    const pc = annotated[i]._primaryCountry;
    if (!pc) {
      noCountry.push(i);
    } else if (pc.startsWith('_stop_')) {
      const realCountry = pc.replace('_stop_', '');
      if (!stoplistGroups.has(realCountry)) stoplistGroups.set(realCountry, []);
      stoplistGroups.get(realCountry).push(i);
    } else {
      if (!countryGroups.has(pc)) countryGroups.set(pc, []);
      countryGroups.get(pc).push(i);
    }
  }

  const allClusters = [];

  // Yield before clustering phase
  await _yieldToMain();

  // Step 3a: Non-stoplist countries — all articles with same country go into ONE cluster
  // If >8 articles, sub-cluster by topic keywords
  for (const [country, indices] of countryGroups.entries()) {
    if (indices.length <= HARD_CAP) {
      allClusters.push(indices);
    } else {
      // Sub-cluster by topic
      const subs = subClusterByTopic(annotated, indices);
      for (const sub of subs) allClusters.push(sub);
    }
  }

  // Yield between clustering phases
  await _yieldToMain();

  // Step 3b: Stoplist countries (US/UK/China/Russia) — require shared topic keyword
  for (const [country, indices] of stoplistGroups.entries()) {
    const subs = subClusterByTopic(annotated, indices);
    for (const sub of subs) allClusters.push(sub);
  }

  // Step 3c: No-country articles — cluster only by high headline similarity
  if (noCountry.length > 0) {
    const subs = subClusterBySimilarity(annotated, noCountry, 0.4);
    for (const sub of subs) allClusters.push(sub);
  }

  // Yield before building events
  await _yieldToMain();

  // Step 4: Build event objects
  const rawEvents = allClusters.map(indices => buildEvent(annotated, indices));

  // Step 5: SECOND PASS — merge events that share the same non-stoplist primary country.
  // This guarantees ONE Iran event, ONE Gaza event, ONE Ukraine event, etc.
  const events = mergeByCountry(rawEvents);

  // Sort by relevance score (NOT by category)
  events.sort((a, b) => b._score - a._score);
  for (const e of events) delete e._score;

  // Diagnostics
  const multiSource = events.filter(e => e.sourceCount > 1).length;
  const singleSource = events.filter(e => e.sourceCount === 1).length;
  const maxCluster = events.reduce((m, e) => Math.max(m, e.sourceCount), 0);
  const avgSources = events.length > 0 ? (articles.length / events.length).toFixed(1) : 0;
  console.log(`[Hegemon] Clustering: ${articles.length} articles → ${events.length} events (${multiSource} multi-source, ${singleSource} single, avg ${avgSources} src/evt, max ${maxCluster})`);
  const dist = {};
  for (const e of events) { const k = e.sourceCount; dist[k] = (dist[k] || 0) + 1; }
  console.log(`[Hegemon] Distribution:`, Object.entries(dist).sort(([a],[b]) => Number(a)-Number(b)).map(([k,v]) => `${k}src:${v}`).join(', '));
  events.slice(0, 8).forEach(e => console.log(`  [${e.sourceCount} src] [${e.category}] ${e.headline}`));

  return events;
}

// ============================================================
// Sub-cluster by TOPIC keywords.
// Groups articles that share at least one topic keyword.
// Hard cap per cluster.
// ============================================================

function subClusterByTopic(annotated, indices) {
  const clusters = []; // { topics: Set, members: number[] }

  // Sort by source rank descending so best sources seed clusters
  const sorted = [...indices].sort((a, b) =>
    getSourceRank(annotated[b].source) - getSourceRank(annotated[a].source)
  );

  for (const idx of sorted) {
    const art = annotated[idx];
    let placed = false;

    for (const cluster of clusters) {
      if (cluster.members.length >= HARD_CAP) continue;
      // Check if article shares at least one topic with cluster
      if (sharedTopics(art._topics, cluster.topics) >= 1) {
        cluster.members.push(idx);
        // Expand cluster topics
        for (const t of art._topics) cluster.topics.add(t);
        placed = true;
        break;
      }
    }

    if (!placed) {
      clusters.push({
        topics: new Set(art._topics),
        members: [idx]
      });
    }
  }

  return clusters.map(c => c.members);
}

// ============================================================
// Sub-cluster by headline similarity (for no-country articles)
// ============================================================

function subClusterBySimilarity(annotated, indices, threshold) {
  const clusters = [];

  for (const idx of indices) {
    const art = annotated[idx];
    let placed = false;

    for (const cluster of clusters) {
      if (cluster.members.length >= HARD_CAP) continue;
      const sim = wordOverlap(art._headlineWords, cluster.seedWords);
      if (sim >= threshold) {
        cluster.members.push(idx);
        placed = true;
        break;
      }
    }

    if (!placed) {
      clusters.push({
        seedWords: art._headlineWords,
        members: [idx]
      });
    }
  }

  return clusters.map(c => c.members);
}

// ============================================================
// Build event object from cluster indices
// ============================================================

function buildEvent(annotated, indices) {
  const clusterArts = indices.map(i => annotated[i]);

  const sorted = [...clusterArts].sort((a, b) => getSourceRank(b.source) - getSourceRank(a.source));
  const topCandidates = sorted.slice(0, Math.min(3, sorted.length));
  const primary = topCandidates.reduce((best, curr) => {
    const currHL = (curr._headline || '').trim();
    const bestHL = (best._headline || '').trim();
    return currHL.length > 0 && currHL.length < bestHL.length ? curr : best;
  }, topCandidates[0]);

  const allEntities = new Set();
  for (const a of clusterArts) {
    for (const c of a._allCountries) {
      if (!STOPLIST_ENTITIES.has(c)) allEntities.add(c);
    }
  }

  // Determine the dominant primary country for this cluster
  const countryCounts = {};
  for (const a of clusterArts) {
    const pc = a._primaryCountry;
    if (pc && !pc.startsWith('_stop_')) {
      countryCounts[pc] = (countryCounts[pc] || 0) + 1;
    }
  }
  const dominantCountry = Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  const catCounts = {};
  for (const a of clusterArts) {
    const cat = a.category || 'WORLD';
    catCounts[cat] = (catCounts[cat] || 0) + 1;
  }
  const category = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0][0];

  const importance = clusterArts.some(a => a.importance === 'high') ||
    ['CONFLICT', 'CRISIS', 'SECURITY'].includes(category)
    ? 'high' : 'medium';

  const cleanArticles = clusterArts.map(a => {
    const { _idx, _headline, _headlineWords, _primaryCountry, _allCountries, _topics, ...clean } = a;
    if (clean.headline) clean.headline = cleanHeadline(clean.headline);
    if (clean.title) clean.title = cleanHeadline(clean.title);
    return clean;
  });

  const event = {
    id: `evt-${primary._idx}`,
    headline: cleanHeadline(primary._headline || ''),
    category,
    importance,
    sourceCount: clusterArts.length,
    time: primary.time || clusterArts[0].time,
    articles: cleanArticles,
    entities: [...allEntities],
    _primaryCountry: dominantCountry,
    summary: null,
    summaryLoading: false,
    summaryError: false
  };

  event._score = scoreEvent(event);
  return event;
}

// ============================================================
// Second pass: merge events sharing the same non-stoplist primary country
// Guarantees ONE event per country (Iran, Palestine, Ukraine, Sudan, etc.)
// ============================================================

function mergeByCountry(events) {
  const countryMap = new Map(); // country -> [event indices]
  const merged = [];
  const consumed = new Set();

  // Group non-stoplist events by primary country
  for (let i = 0; i < events.length; i++) {
    const pc = events[i]._primaryCountry;
    if (pc && !STOPLIST_COUNTRIES.has(pc)) {
      if (!countryMap.has(pc)) countryMap.set(pc, []);
      countryMap.get(pc).push(i);
    }
  }

  // Merge groups with 2+ events
  for (const [country, indices] of countryMap.entries()) {
    if (indices.length <= 1) continue;

    // Pick the event with the highest score as the base
    indices.sort((a, b) => events[b]._score - events[a]._score);
    const base = events[indices[0]];

    // Absorb all articles from other events into the base
    for (let k = 1; k < indices.length; k++) {
      const donor = events[indices[k]];
      base.articles.push(...donor.articles);
      for (const ent of donor.entities) {
        if (!base.entities.includes(ent)) base.entities.push(ent);
      }
      consumed.add(indices[k]);
    }

    base.sourceCount = base.articles.length;
    base._score = scoreEvent(base);
    console.log(`[Hegemon] Merged ${indices.length} ${country} events → ${base.sourceCount} sources`);
  }

  // Build final list: all events not consumed
  for (let i = 0; i < events.length; i++) {
    if (!consumed.has(i)) merged.push(events[i]);
  }

  return merged;
}
