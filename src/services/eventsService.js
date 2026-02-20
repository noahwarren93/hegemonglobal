// eventsService.js - Article clustering into event groups

import { COUNTRY_DEMONYMS } from './apiService';

// ============================================================
// Entity & Action Extraction
// ============================================================

// Key organizations and groups to detect as entities
const ORG_ENTITIES = [
  'nato', 'un', 'eu', 'who', 'imf', 'world bank', 'opec', 'asean', 'brics',
  'iaea', 'icc', 'icj', 'g7', 'g20', 'african union', 'arab league',
  'hamas', 'hezbollah', 'houthi', 'taliban', 'isis', 'al-qaeda', 'wagner',
  'rsf', 'idf', 'cia', 'fbi', 'mi6', 'mossad', 'fsb',
  'pentagon', 'kremlin', 'white house', 'congress', 'parliament',
  'world trade organization', 'wto', 'interpol', 'red cross'
];

// Key leader names to detect as entities
const LEADER_ENTITIES = [
  'putin', 'zelensky', 'zelenskyy', 'biden', 'trump', 'xi jinping', 'xi',
  'macron', 'scholz', 'modi', 'erdogan', 'netanyahu', 'kim jong',
  'lula', 'milei', 'orban', 'meloni', 'sunak', 'starmer',
  'marcos', 'kishida', 'trudeau', 'bukele', 'maduro', 'lukashenko',
  'khamenei', 'mbs', 'bin salman', 'sisi', 'assad'
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
 * Extract entities (countries, orgs, leaders) from text
 */
function extractEntities(text) {
  const lower = text.toLowerCase();
  const entities = new Set();

  // Country names and demonyms
  for (const [country, aliases] of Object.entries(COUNTRY_DEMONYMS)) {
    const countryLower = country.toLowerCase();
    if (lower.includes(countryLower)) {
      entities.add(countryLower);
      continue;
    }
    for (const alias of aliases) {
      if (lower.includes(alias)) {
        entities.add(countryLower);
        break;
      }
    }
  }

  // Organizations
  for (const org of ORG_ENTITIES) {
    if (lower.includes(org)) {
      entities.add(org);
    }
  }

  // Leaders
  for (const leader of LEADER_ENTITIES) {
    if (lower.includes(leader)) {
      entities.add(leader);
    }
  }

  return entities;
}

/**
 * Extract action words from text
 */
function extractActions(text) {
  const lower = text.toLowerCase();
  const actions = new Set();

  for (const action of ACTION_WORDS) {
    // Word boundary check to avoid partial matches
    const regex = new RegExp('\\b' + action.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
    if (regex.test(lower)) {
      actions.add(action);
    }
  }

  return actions;
}

/**
 * Check if two articles should cluster together.
 * Rules:
 *   - Share >= 1 entity AND >= 1 action word → cluster
 *   - Share >= 2 entities → cluster
 */
function shouldCluster(entitiesA, actionsA, entitiesB, actionsB) {
  let sharedEntities = 0;
  for (const e of entitiesA) {
    if (entitiesB.has(e)) sharedEntities++;
  }

  // 2+ shared entities → always cluster
  if (sharedEntities >= 2) return true;

  // 1 shared entity + 1 shared action → cluster
  if (sharedEntities >= 1) {
    for (const a of actionsA) {
      if (actionsB.has(a)) return true;
    }
  }

  return false;
}

// ============================================================
// Source Ranking (higher = more authoritative for primary headline)
// ============================================================

const SOURCE_RANK = {
  'reuters': 10, 'ap': 10, 'associated press': 10,
  'bbc': 9, 'bbc world': 9, 'bbc news': 9,
  'wall street journal': 8, 'wsj': 8,
  'new york times': 8, 'nyt': 8,
  'financial times': 8, 'ft': 8,
  'the guardian': 7, 'guardian': 7,
  'al jazeera': 7,
  'bloomberg': 7,
  'the economist': 7,
  'washington post': 7,
  'south china morning post': 6, 'scmp': 6,
  'cgtn': 5,
  'tass': 5,
  'times of india': 5,
  'the hill': 5,
  'fox news': 5,
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
// Main Clustering Function
// ============================================================

/**
 * Cluster articles into event groups.
 * @param {Array} articles - Array of article objects with { headline, source, time, url, category, importance, description?, pubDate? }
 * @returns {Array} Array of event objects sorted by importance
 */
export function clusterArticles(articles) {
  if (!articles || articles.length === 0) return [];

  // Pre-compute entities and actions for each article
  const articlesWithMeta = articles.map((article, idx) => {
    const text = (article.headline || article.title || '') + ' ' + (article.description || '');
    return {
      ...article,
      _idx: idx,
      _entities: extractEntities(text),
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

  // Compare all pairs (O(n^2) but n <= 50 so fine)
  for (let i = 0; i < articlesWithMeta.length; i++) {
    for (let j = i + 1; j < articlesWithMeta.length; j++) {
      if (shouldCluster(
        articlesWithMeta[i]._entities, articlesWithMeta[i]._actions,
        articlesWithMeta[j]._entities, articlesWithMeta[j]._actions
      )) {
        union(i, j);
      }
    }
  }

  // Group by root
  const clusters = {};
  for (let i = 0; i < articlesWithMeta.length; i++) {
    const root = find(i);
    if (!clusters[root]) clusters[root] = [];
    clusters[root].push(articlesWithMeta[i]);
  }

  // Build event objects
  const events = Object.values(clusters).map(clusterArticles => {
    // Sort articles: highest-ranked source first
    const sorted = [...clusterArticles].sort((a, b) => getSourceRank(b.source) - getSourceRank(a.source));

    const primary = sorted[0];

    // Collect all unique entities across cluster
    const allEntities = new Set();
    for (const a of clusterArticles) {
      for (const e of a._entities) allEntities.add(e);
    }

    // Determine category by majority vote
    const catCounts = {};
    for (const a of clusterArticles) {
      const cat = a.category || 'WORLD';
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    }
    const category = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0][0];

    // Importance: high if any article is high importance or category is CONFLICT/CRISIS/SECURITY
    const importance = clusterArticles.some(a => a.importance === 'high') ||
      ['CONFLICT', 'CRISIS', 'SECURITY'].includes(category)
      ? 'high' : 'medium';

    // Most recent time
    const mostRecentTime = primary.time || clusterArticles[0].time;

    // Clean up articles (remove internal metadata)
    const cleanArticles = clusterArticles.map(a => {
      const { _idx, _entities, _actions, ...clean } = a;
      return clean;
    });

    return {
      id: `evt-${primary._idx}`,
      headline: primary.headline || primary.title || '',
      category,
      importance,
      sourceCount: clusterArticles.length,
      time: mostRecentTime,
      articles: cleanArticles,
      entities: [...allEntities],
      summary: null, // filled in by AI later
      summaryLoading: false,
      summaryError: false
    };
  });

  // Sort: high importance first, then by number of sources (bigger clusters first)
  events.sort((a, b) => {
    if (a.importance !== b.importance) return a.importance === 'high' ? -1 : 1;
    return b.sourceCount - a.sourceCount;
  });

  return events;
}
