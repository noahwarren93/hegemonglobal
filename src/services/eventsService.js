// eventsService.js - Article clustering into event groups

import { COUNTRY_DEMONYMS } from './apiService';

// ============================================================
// Headline Cleanup (strip source attributions, prefixes, junk)
// ============================================================

export function cleanHeadline(headline) {
  if (!headline) return '';
  let h = headline.trim();
  // Strip source attributions at end: em-dash/en-dash/pipe + source name (up to ~25 chars)
  h = h.replace(/\s*[\u2014\u2013\u2015\u00AD—–|]\s*[A-Z][\w\s.&'\u2019,]{0,25}$/, '');
  // Strip " - Source" (hyphen with spaces): only if what follows is capitalized words (source name, not headline continuation)
  h = h.replace(/\s+-\s+[A-Z][\w.&'\u2019]{0,15}(?:\s+[A-Z][\w.&'\u2019]+){0,3}\s*$/, '');
  // Strip ": Source" at end (colon attribution)
  h = h.replace(/\s*:\s+[A-Z][\w.&'\u2019]{0,15}(?:\s+[A-Z][\w.&'\u2019]+){0,2}\s*$/, '');
  // Strip BREAKING:/EXCLUSIVE:/DEVELOPING:/etc. prefixes
  h = h.replace(/^(BREAKING|EXCLUSIVE|DEVELOPING|JUST IN|WATCH|UPDATE|OPINION|ANALYSIS|EDITORIAL|LIVE)\s*[:\-–—|]\s*/i, '');
  // Strip trailing separators and whitespace
  h = h.replace(/[\s|—–\-:]+$/, '').trim();
  return h;
}

// ============================================================
// Entity & Action Extraction
// ============================================================

// Entities that are too common to be useful for clustering.
// These appear in a huge fraction of world news articles and cause
// unrelated stories to merge into mega-clusters.
const STOPLIST_ENTITIES = new Set([
  'united states', 'u.s.', 'american', 'washington', 'trump', 'biden',
  'white house', 'congress', 'pentagon', 'state department',
  'united kingdom', 'british', 'uk', 'britain', 'london',
  'china', 'chinese', 'beijing',
  'russia', 'russian', 'moscow', 'kremlin', 'putin',
  // Generic orgs that appear everywhere
  'un', 'parliament', 'congress', 'white house'
]);

// Key organizations and groups to detect as entities
const ORG_ENTITIES = [
  'nato', 'eu', 'who', 'imf', 'world bank', 'opec', 'asean', 'brics',
  'iaea', 'icc', 'icj', 'g7', 'g20', 'african union', 'arab league',
  'hamas', 'hezbollah', 'houthi', 'taliban', 'isis', 'al-qaeda', 'wagner',
  'rsf', 'idf', 'cia', 'fbi', 'mi6', 'mossad', 'fsb',
  'world trade organization', 'wto', 'interpol', 'red cross'
];

// Key leader names to detect as entities
const LEADER_ENTITIES = [
  'zelensky', 'zelenskyy', 'xi jinping',
  'macron', 'scholz', 'modi', 'erdogan', 'netanyahu', 'kim jong',
  'lula', 'milei', 'orban', 'meloni', 'sunak', 'starmer',
  'marcos', 'kishida', 'trudeau', 'bukele', 'maduro', 'lukashenko',
  'khamenei', 'mbs', 'bin salman', 'sisi', 'assad'
];

// Geographic specifics — regions, cities, straits, etc. that pin an event to a place
const GEO_KEYWORDS = [
  'strait of hormuz', 'hormuz', 'red sea', 'south china sea', 'taiwan strait',
  'black sea', 'baltic sea', 'arctic', 'suez canal', 'bab el-mandeb',
  'donbas', 'donetsk', 'luhansk', 'crimea', 'zaporizhzhia', 'kherson',
  'darfur', 'khartoum', 'tigray', 'amhara', 'sahel',
  'gaza', 'west bank', 'golan heights', 'rafah', 'khan younis',
  'xinjiang', 'tibet', 'hong kong', 'kashmir',
  'nagorno-karabakh', 'transnistria', 'abkhazia', 'south ossetia',
  'aleppo', 'idlib', 'raqqa', 'mosul', 'kirkuk',
  'sinai', 'golan', 'negev', 'galilee',
  'kabul', 'kandahar', 'helmand',
  'mariupol', 'bakhmut', 'avdiivka', 'kharkiv', 'odesa',
  'pyongyang', 'demilitarized zone', 'dmz',
  'kurdistan', 'kurdish',
  'north africa', 'sub-saharan', 'horn of africa', 'east africa', 'west africa',
  'southeast asia', 'central asia', 'middle east', 'persian gulf', 'gulf states',
  'latin america', 'central america', 'caribbean',
  'eastern europe', 'western europe', 'nordic', 'balkans', 'caucasus'
];

// Action words that indicate what kind of event this is
const ACTION_WORDS = [
  'strike', 'strikes', 'attack', 'attacks', 'bomb', 'bombing', 'bombings',
  'missile', 'missiles', 'drone', 'drones', 'airstrikes', 'airstrike',
  'invasion', 'invade', 'offensive', 'advance', 'retreat',
  'talks', 'negotiations', 'summit', 'meeting', 'deal', 'agreement', 'pact',
  'ceasefire', 'truce', 'peace', 'armistice',
  'sanctions', 'embargo', 'tariff', 'tariffs', 'ban', 'restriction',
  'election', 'elections', 'vote', 'voting', 'referendum', 'poll', 'polls',
  'coup', 'overthrow', 'resign', 'resignation', 'impeach', 'impeachment',
  'protest', 'protests', 'uprising', 'riot', 'riots', 'demonstration',
  'earthquake', 'flood', 'hurricane', 'typhoon', 'wildfire', 'disaster',
  'famine', 'drought', 'epidemic', 'pandemic', 'outbreak',
  'genocide', 'ethnic cleansing', 'atrocity', 'massacre', 'war crimes',
  'arrest', 'detained', 'trial', 'sentenced', 'convicted', 'indicted',
  'deploy', 'deployment', 'troops', 'military', 'war', 'conflict',
  'hostage', 'hostages', 'kidnap', 'abduct',
  'nuclear', 'weapons', 'arsenal',
  'trade', 'export', 'import', 'economic', 'recession', 'inflation',
  'refugee', 'refugees', 'displaced', 'evacuation', 'humanitarian',
  'spy', 'espionage', 'cyber', 'hack', 'hacking',
  'assassination', 'killed', 'dead', 'death', 'casualties',
  'alliance', 'treaty', 'withdraw', 'withdrawal',
  'ship', 'shipping', 'naval', 'blockade', 'seized'
];

/**
 * Extract entities (countries, orgs, leaders) from text.
 * Returns { all: Set (including stop-listed), specific: Set (excluding stop-listed) }
 */
function extractEntities(text) {
  const lower = text.toLowerCase();
  const all = new Set();
  const specific = new Set();

  // Country names and demonyms
  for (const [country, aliases] of Object.entries(COUNTRY_DEMONYMS)) {
    const countryLower = country.toLowerCase();
    let matched = false;
    if (lower.includes(countryLower)) {
      matched = true;
    } else {
      for (const alias of aliases) {
        if (lower.includes(alias)) { matched = true; break; }
      }
    }
    if (matched) {
      all.add(countryLower);
      if (!STOPLIST_ENTITIES.has(countryLower)) {
        // Also check aliases against stoplist
        const aliasStop = aliases.some(a => STOPLIST_ENTITIES.has(a));
        if (!aliasStop) specific.add(countryLower);
      }
    }
  }

  // Organizations
  for (const org of ORG_ENTITIES) {
    if (lower.includes(org)) {
      all.add(org);
      if (!STOPLIST_ENTITIES.has(org)) specific.add(org);
    }
  }

  // Leaders
  for (const leader of LEADER_ENTITIES) {
    if (lower.includes(leader)) {
      all.add(leader);
      if (!STOPLIST_ENTITIES.has(leader)) specific.add(leader);
    }
  }

  return { all, specific };
}

/**
 * Extract geographic keywords from text
 */
function extractGeo(text) {
  const lower = text.toLowerCase();
  const geos = new Set();
  for (const geo of GEO_KEYWORDS) {
    if (lower.includes(geo)) geos.add(geo);
  }
  return geos;
}

/**
 * Extract action words from text
 */
function extractActions(text) {
  const lower = text.toLowerCase();
  const actions = new Set();

  for (const action of ACTION_WORDS) {
    const regex = new RegExp('\\b' + action.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
    if (regex.test(lower)) {
      actions.add(action);
    }
  }

  return actions;
}

/**
 * Check if two articles should cluster together.
 * Only uses SPECIFIC (non-stop-listed) entities for matching.
 * Also considers geographic keywords for same-region same-topic clustering.
 */
function shouldCluster(a, b) {
  // Count shared specific entities
  let sharedSpecific = 0;
  for (const e of a._entities.specific) {
    if (b._entities.specific.has(e)) sharedSpecific++;
  }

  // Count shared geographic keywords
  let sharedGeo = 0;
  for (const g of a._geo) {
    if (b._geo.has(g)) sharedGeo++;
  }

  // Count shared actions
  let sharedActions = 0;
  for (const act of a._actions) {
    if (b._actions.has(act)) sharedActions++;
  }

  // 2+ shared specific entities → cluster
  if (sharedSpecific >= 2) return true;

  // 1 specific entity + 1 action → cluster
  if (sharedSpecific >= 1 && sharedActions >= 1) return true;

  // 1 specific entity + 1 shared geo → cluster (same country + same region)
  if (sharedSpecific >= 1 && sharedGeo >= 1) return true;

  // 1 shared geo + 2+ shared actions → cluster (same place, same kind of event)
  if (sharedGeo >= 1 && sharedActions >= 2) return true;

  // 1 shared specific entity clusters if both articles are focused (few entities)
  // This helps single-source stories about the same country merge together
  if (sharedSpecific >= 1 && a._entities.specific.size <= 2 && b._entities.specific.size <= 2) return true;

  return false;
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
  'al jazeera': 7,
  'bloomberg': 7,
  'the economist': 7,
  'washington post': 7,
  'foreign policy': 7,
  'france 24': 6, 'france24': 6,
  'deutsche welle': 6, 'dw': 6,
  'south china morning post': 6, 'scmp': 6,
  'politico': 6,
  'nhk world': 6, 'nhk': 6,
  'kyodo news': 6, 'kyodo': 6,
  'yonhap': 6,
  'anadolu agency': 5,
  'cgtn': 5,
  'tass': 5,
  'times of india': 5,
  'the hill': 5,
  'fox news': 5,
  'rt': 4,
  'xinhua': 4,
  'mehr news': 4,
  'the telegraph': 6, 'telegraph': 6,
  'cbc news': 6, 'cbc': 6,
  'abc australia': 6,
  'irish times': 6,
  'the hindu': 5,
  'haaretz': 6,
  'times of israel': 5,
  'nikkei asia': 6, 'nikkei': 6,
  'straits times': 6,
  'cna': 6,
  'jakarta post': 5, 'the jakarta post': 5,
  'africa news': 5, 'africanews': 5,
  'nation kenya': 4, 'daily nation': 4,
  'the independent': 5, 'independent': 5,
  'globe and mail': 5,
  'sydney morning herald': 5, 'smh': 5,
  'dawn': 5,
  'middle east eye': 5,
  'folha': 5,
  'taipei times': 4,
  'korea herald': 5,
  'the national': 4,
  'vietnam news': 3,
  'rappler': 4,
  'buenos aires herald': 3,
  'premium times': 4,
  'mail & guardian': 4,
  'tempo': 3,
  'daily star': 3,
  'daily mail': 3,
  'new york post': 3, 'ny post': 3
};

function getSourceRank(source) {
  if (!source) return 1;
  const lower = source.toLowerCase();
  for (const [name, rank] of Object.entries(SOURCE_RANK)) {
    if (lower.includes(name)) return rank;
  }
  return 4; // default mid-tier
}

// ============================================================
// Event Ranking Score (for sorting)
// ============================================================

const CATEGORY_PRIORITY = {
  CONFLICT: 5, SECURITY: 4, CRISIS: 3, DIPLOMACY: 2, POLITICS: 1,
  ECONOMY: 1, TECH: 0, CLIMATE: 0, WORLD: 0
};

function scoreEvent(event) {
  const catScore = (CATEGORY_PRIORITY[event.category] || 0) * 10;
  const sourceScore = Math.min(event.sourceCount, 8) * 5; // cap at 8 sources
  const importanceScore = event.importance === 'high' ? 20 : 0;
  return catScore + sourceScore + importanceScore;
}

// ============================================================
// Main Clustering Function
// ============================================================

/**
 * Cluster articles into event groups.
 * @param {Array} articles - Array of article objects
 * @returns {Array} Array of event objects sorted by ranking score
 */
export function clusterArticles(articles) {
  if (!articles || articles.length === 0) return [];

  // Pre-compute entities, geo, and actions for each article
  const articlesWithMeta = articles.map((article, idx) => {
    const text = (article.headline || article.title || '') + ' ' + (article.description || '');
    return {
      ...article,
      _idx: idx,
      _entities: extractEntities(text),
      _geo: extractGeo(text),
      _actions: extractActions(text)
    };
  });

  // Union-Find for clustering
  const parent = articlesWithMeta.map((_, i) => i);

  function find(x) {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  }

  function union(a, b) {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  }

  // Compare all pairs
  for (let i = 0; i < articlesWithMeta.length; i++) {
    for (let j = i + 1; j < articlesWithMeta.length; j++) {
      if (shouldCluster(articlesWithMeta[i], articlesWithMeta[j])) {
        union(i, j);
      }
    }
  }

  // Safety: break up mega-clusters (>8 articles) by re-checking tighter criteria
  const rawClusters = {};
  for (let i = 0; i < articlesWithMeta.length; i++) {
    const root = find(i);
    if (!rawClusters[root]) rawClusters[root] = [];
    rawClusters[root].push(i);
  }

  // If a cluster has more than 8 articles, split it by requiring 2+ shared specific entities
  const finalGroups = [];
  for (const indices of Object.values(rawClusters)) {
    if (indices.length <= 8) {
      finalGroups.push(indices);
      continue;
    }
    // Re-cluster within the mega-cluster using tighter criteria
    const subParent = indices.map((_, i) => i);
    function subFind(x) {
      while (subParent[x] !== x) { subParent[x] = subParent[subParent[x]]; x = subParent[x]; }
      return x;
    }
    function subUnion(a, b) {
      const ra = subFind(a); const rb = subFind(b);
      if (ra !== rb) subParent[ra] = rb;
    }
    for (let i = 0; i < indices.length; i++) {
      for (let j = i + 1; j < indices.length; j++) {
        const a = articlesWithMeta[indices[i]];
        const b = articlesWithMeta[indices[j]];
        let shared = 0;
        for (const e of a._entities.specific) { if (b._entities.specific.has(e)) shared++; }
        if (shared >= 2) subUnion(i, j);
        else if (shared >= 1) {
          // Also need shared geo or 2+ shared actions
          let geoMatch = false;
          for (const g of a._geo) { if (b._geo.has(g)) { geoMatch = true; break; } }
          let actionCount = 0;
          for (const act of a._actions) { if (b._actions.has(act)) actionCount++; }
          if (geoMatch || actionCount >= 2) subUnion(i, j);
        }
      }
    }
    const subClusters = {};
    for (let i = 0; i < indices.length; i++) {
      const root = subFind(i);
      if (!subClusters[root]) subClusters[root] = [];
      subClusters[root].push(indices[i]);
    }
    for (const sub of Object.values(subClusters)) {
      finalGroups.push(sub);
    }
  }

  // Build event objects from final groups
  const events = finalGroups.map(indices => {
    const clusterArts = indices.map(i => articlesWithMeta[i]);

    // Sort articles: highest-ranked source first
    const sorted = [...clusterArts].sort((a, b) => getSourceRank(b.source) - getSourceRank(a.source));
    // Pick broadest headline: shortest among top 3 ranked sources (shorter = more general)
    const topCandidates = sorted.slice(0, Math.min(3, sorted.length));
    const primary = topCandidates.reduce((best, curr) => {
      const currHL = (curr.headline || curr.title || '').trim();
      const bestHL = (best.headline || best.title || '').trim();
      return currHL.length > 0 && currHL.length < bestHL.length ? curr : best;
    }, topCandidates[0]);

    // Collect all unique specific entities across cluster
    const allEntities = new Set();
    for (const a of clusterArts) {
      for (const e of a._entities.specific) allEntities.add(e);
    }

    // Determine category by majority vote
    const catCounts = {};
    for (const a of clusterArts) {
      const cat = a.category || 'WORLD';
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    }
    const category = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0][0];

    // Importance: high if any article is high importance or category is CONFLICT/CRISIS/SECURITY
    const importance = clusterArts.some(a => a.importance === 'high') ||
      ['CONFLICT', 'CRISIS', 'SECURITY'].includes(category)
      ? 'high' : 'medium';

    // Most recent time
    const mostRecentTime = primary.time || clusterArts[0].time;

    // Clean up articles (remove internal metadata, clean headlines)
    const cleanArticles = clusterArts.map(a => {
      const { _idx, _entities, _actions, _geo, ...clean } = a;
      if (clean.headline) clean.headline = cleanHeadline(clean.headline);
      if (clean.title) clean.title = cleanHeadline(clean.title);
      return clean;
    });

    const event = {
      id: `evt-${primary._idx}`,
      headline: cleanHeadline(primary.headline || primary.title || ''),
      category,
      importance,
      sourceCount: clusterArts.length,
      time: mostRecentTime,
      articles: cleanArticles,
      entities: [...allEntities],
      summary: null,
      summaryLoading: false,
      summaryError: false
    };

    event._score = scoreEvent(event);
    return event;
  });

  // Sort by ranking score (highest first)
  events.sort((a, b) => b._score - a._score);

  // Clean up internal score
  for (const e of events) delete e._score;

  return events;
}
