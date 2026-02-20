// eventsService.js - Article clustering into event groups
// APPROACH: Primary-country grouping + headline similarity. NO Union-Find.
// Each article gets ONE primary country. Articles cluster ONLY within
// their primary country group, preventing transitive mega-clusters.

import { COUNTRY_DEMONYMS } from './apiService';

// ============================================================
// Headline Cleanup (strip source attributions, prefixes, junk)
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
// Stop-listed entities (too common for clustering)
// ============================================================

const STOPLIST_ENTITIES = new Set([
  'united states', 'u.s.', 'american', 'washington', 'trump', 'biden',
  'white house', 'congress', 'pentagon', 'state department',
  'united kingdom', 'british', 'uk', 'britain', 'london',
  'china', 'chinese', 'beijing',
  'russia', 'russian', 'moscow', 'kremlin', 'putin',
  'un', 'parliament', 'white house'
]);

// ============================================================
// Geographic keywords → primary country mapping
// Maps specific regions/cities to their parent country for clustering
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
  'sahel': '_sahel', // region, not country
  'red sea': '_red_sea',
  'south china sea': '_south_china_sea',
  'black sea': '_black_sea',
  'baltic sea': '_baltic',
  'arctic': '_arctic',
  'suez canal': 'egypt',
  'bab el-mandeb': '_red_sea',
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
  'her', 'their', 'its', 'does', 'do', 'just', 'now', 'being', 'most', 'some',
  // Also stop country-related super-common words to prevent false similarity
  'trump', 'says', 'news', 'report', 'world', 'global', 'international'
]);

function getHeadlineWords(text) {
  return new Set(text.toLowerCase().split(/\W+/).filter(w => w.length > 2 && !CLUSTER_STOP_WORDS.has(w)));
}

/**
 * Compute word overlap ratio between two word sets.
 * Returns shared / min(sizeA, sizeB).
 */
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

// Build lookup structures lazily
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
 * This is the MAIN SUBJECT country — not every country mentioned.
 * Uses headline only (not description) to get the true subject.
 * Returns lowercase country name or null.
 */
function extractPrimaryCountry(headline) {
  const lower = (headline || '').toLowerCase();
  if (!lower) return null;

  // First check geographic keywords (more specific than country names)
  for (const [geo, country] of Object.entries(GEO_TO_COUNTRY)) {
    if (lower.includes(geo) && !country.startsWith('_')) {
      // Skip stop-listed countries
      if (!STOPLIST_ENTITIES.has(country)) return country;
    }
  }

  // Then check country names/demonyms — find FIRST non-stop-listed match
  const lookup = getCountryLookup();
  for (const { name, terms } of lookup) {
    if (STOPLIST_ENTITIES.has(name)) continue;
    for (const term of terms) {
      if (STOPLIST_ENTITIES.has(term)) continue;
      // Word boundary check for short terms to avoid false matches
      if (term.length <= 3) {
        const regex = new RegExp('\\b' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
        if (regex.test(lower)) return name;
      } else {
        if (lower.includes(term)) return name;
      }
    }
  }

  return null;
}

/**
 * Extract ALL mentioned countries from headline + description (for entity list).
 */
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
// Source Ranking (higher = more authoritative for primary headline)
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
// Category Detection & Event Scoring
// ============================================================

const CATEGORY_PRIORITY = {
  CONFLICT: 5, SECURITY: 4, CRISIS: 3, DIPLOMACY: 2, POLITICS: 1,
  ECONOMY: 1, TECH: 0, CLIMATE: 0, WORLD: 0
};

// Tier keywords for scoring (same as Sidebar but used for sorting)
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
  // Score by: source count * 3 + tier priority * 5 + category bonus
  const tier = getEventTier(event);
  const tierScore = (4 - tier) * 5; // T1=15, T2=10, T3=5
  const sourceScore = Math.min(event.sourceCount, 8) * 3;
  const catBonus = (CATEGORY_PRIORITY[event.category] || 0) * 2;
  const importanceScore = event.importance === 'high' ? 5 : 0;
  return tierScore + sourceScore + catBonus + importanceScore;
}

// ============================================================
// Main Clustering Function — Primary Country + Headline Similarity
// NO Union-Find. NO transitive chaining. Direct grouping only.
// ============================================================

const HARD_CAP = 8; // Maximum articles per cluster. No exceptions.

/**
 * Cluster articles into event groups.
 * Algorithm:
 *   1. Extract primary country for each article (from headline only)
 *   2. Group articles by primary country
 *   3. Within each country group, sub-cluster by headline similarity (50%+ overlap)
 *   4. Articles with no primary country cluster only by very high similarity (60%+)
 *   5. Hard cap: max 8 articles per cluster
 */
export function clusterArticles(articles) {
  if (!articles || articles.length === 0) return [];

  // Step 1: Annotate each article
  const annotated = articles.map((article, idx) => {
    const headline = article.headline || article.title || '';
    const fullText = headline + ' ' + (article.description || '');
    return {
      ...article,
      _idx: idx,
      _headline: headline,
      _headlineWords: getHeadlineWords(headline),
      _primaryCountry: extractPrimaryCountry(headline),
      _allCountries: extractAllCountries(fullText),
    };
  });

  // Step 2: Group by primary country
  const countryGroups = new Map(); // country → [article indices]
  const noCountry = []; // articles with no primary country

  for (let i = 0; i < annotated.length; i++) {
    const pc = annotated[i]._primaryCountry;
    if (pc) {
      if (!countryGroups.has(pc)) countryGroups.set(pc, []);
      countryGroups.get(pc).push(i);
    } else {
      noCountry.push(i);
    }
  }

  // Step 3: Within each country group, sub-cluster by headline similarity
  const allClusters = [];

  for (const [country, indices] of countryGroups.entries()) {
    // Lower threshold within same country — these articles already share a country
    const subClusters = subClusterBySimilarity(annotated, indices, 0.25);
    for (const cluster of subClusters) {
      allClusters.push(cluster);
    }
  }

  // Step 4: No-country articles — cluster only by very high similarity
  if (noCountry.length > 0) {
    const subClusters = subClusterBySimilarity(annotated, noCountry, 0.5);
    for (const cluster of subClusters) {
      allClusters.push(cluster);
    }
  }

  // Step 5: Build event objects
  const events = allClusters.map(indices => {
    const clusterArts = indices.map(i => annotated[i]);

    // Sort by source authority
    const sorted = [...clusterArts].sort((a, b) => getSourceRank(b.source) - getSourceRank(a.source));
    // Pick broadest headline from top 3
    const topCandidates = sorted.slice(0, Math.min(3, sorted.length));
    const primary = topCandidates.reduce((best, curr) => {
      const currHL = (curr._headline || '').trim();
      const bestHL = (best._headline || '').trim();
      return currHL.length > 0 && currHL.length < bestHL.length ? curr : best;
    }, topCandidates[0]);

    // Collect entities
    const allEntities = new Set();
    for (const a of clusterArts) {
      for (const c of a._allCountries) {
        if (!STOPLIST_ENTITIES.has(c)) allEntities.add(c);
      }
    }

    // Category by majority vote
    const catCounts = {};
    for (const a of clusterArts) {
      const cat = a.category || 'WORLD';
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    }
    const category = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0][0];

    const importance = clusterArts.some(a => a.importance === 'high') ||
      ['CONFLICT', 'CRISIS', 'SECURITY'].includes(category)
      ? 'high' : 'medium';

    // Clean articles (remove internal metadata)
    const cleanArticles = clusterArts.map(a => {
      const { _idx, _headline, _headlineWords, _primaryCountry, _allCountries, ...clean } = a;
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
      summary: null,
      summaryLoading: false,
      summaryError: false
    };

    event._score = scoreEvent(event);
    return event;
  });

  // Sort by score
  events.sort((a, b) => b._score - a._score);
  for (const e of events) delete e._score;

  // Diagnostics
  const multiSource = events.filter(e => e.sourceCount > 1).length;
  const singleSource = events.filter(e => e.sourceCount === 1).length;
  const maxCluster = events.reduce((m, e) => Math.max(m, e.sourceCount), 0);
  const avgSources = events.length > 0 ? (articles.length / events.length).toFixed(1) : 0;
  console.log(`[Hegemon] Clustering: ${articles.length} articles → ${events.length} events (${multiSource} multi-source, ${singleSource} single-source, avg ${avgSources} src/evt, max ${maxCluster})`);
  const dist = {};
  for (const e of events) { const k = e.sourceCount; dist[k] = (dist[k] || 0) + 1; }
  console.log(`[Hegemon] Source distribution:`, Object.entries(dist).sort(([a],[b]) => Number(a)-Number(b)).map(([k,v]) => `${k}src:${v}`).join(', '));
  events.slice(0, 8).forEach(e => console.log(`  [${e.sourceCount} src] [${e.category}] ${e.headline}`));
  if (maxCluster > HARD_CAP) console.error(`[Hegemon] WARNING: cluster exceeds hard cap! Max: ${maxCluster}`);

  return events;
}

// ============================================================
// Sub-cluster a group of articles by headline similarity.
// Single-pass greedy: each article joins the first cluster it
// matches (50%+ overlap with the cluster's seed headline).
// NO Union-Find. NO transitivity.
// Hard cap: HARD_CAP articles per cluster.
// ============================================================

function subClusterBySimilarity(annotated, indices, threshold) {
  const clusters = []; // each: { seedWords: Set, members: number[] }

  for (const idx of indices) {
    const art = annotated[idx];
    let placed = false;

    for (const cluster of clusters) {
      // Check if this article matches the cluster's seed
      if (cluster.members.length >= HARD_CAP) continue; // hard cap
      const sim = wordOverlap(art._headlineWords, cluster.seedWords);
      if (sim >= threshold) {
        cluster.members.push(idx);
        placed = true;
        break;
      }
    }

    if (!placed) {
      // Start a new cluster with this article as seed
      clusters.push({
        seedWords: art._headlineWords,
        members: [idx]
      });
    }
  }

  return clusters.map(c => c.members);
}
