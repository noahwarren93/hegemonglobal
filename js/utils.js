// utils.js - Constants, colors, helper functions

const RISK_COLORS = {
  catastrophic: { hex: '#dc2626', glow: 0xff3333 },
  extreme: { hex: '#f97316', glow: 0xff6600 },
  severe: { hex: '#eab308', glow: 0xffcc00 },
  stormy: { hex: '#8b5cf6', glow: 0x8855ff },
  cloudy: { hex: '#3b82f6', glow: 0x3388ff },
  clear: { hex: '#22c55e', glow: 0x22cc55 }
};

const BIAS_COLORS = { 'left': '#3b82f6', 'center-left': '#60a5fa', 'center': '#a3a3a3', 'center-right': '#f97316', 'right': '#ef4444' };

// COMPREHENSIVE COUNTRY DATABASE WITH FULL ANALYSIS AND NEWS

const SOURCE_BIAS = {
  // Left (AllSides: Left)
  'The Intercept': 'L', 'Democracy Now': 'L', 'Jacobin': 'L', 'Mother Jones': 'L', 'MSNBC': 'L', 'HuffPost': 'L', 'Vox': 'L', 'Slate': 'L', 'The Nation': 'L', 'Raw Story': 'L', 'The Wire': 'L', 'Middle East Monitor': 'L', 'The Guardian': 'L', 'Guardian': 'L', 'The Atlantic': 'L',
  // Left-Center (AllSides: Lean Left)
  'New York Times': 'LC', 'The New York Times': 'LC', 'NY Times': 'LC', 'Washington Post': 'LC', 'The Washington Post': 'LC', 'CNN': 'LC', 'BBC': 'LC', 'BBC World': 'LC', 'BBC News': 'LC', 'NPR': 'LC', 'NBC News': 'LC', 'CBS News': 'LC', 'ABC News': 'LC', 'Time': 'LC', 'TIME': 'LC', 'Politico': 'LC', 'Bloomberg': 'LC', 'The Independent': 'LC', 'BuzzFeed News': 'LC', 'BuzzFeed': 'LC', 'USA Today': 'LC', 'Los Angeles Times': 'LC', 'LA Times': 'LC', 'Daily Beast': 'LC', 'Mediaite': 'LC', 'Business Insider': 'LC', 'Insider': 'LC', 'The New Yorker': 'LC', 'NDTV': 'LC', 'India Today': 'LC', 'Hindustan Times': 'LC', 'The Print': 'LC', 'Scroll': 'LC', 'Firstpost': 'LC', 'Kyiv Independent': 'LC', 'Kyiv Post': 'LC', 'Le Monde': 'LC', 'Der Spiegel': 'LC', 'El País': 'LC', 'Middle East Eye': 'LC', 'Folha': 'LC', 'CNBC': 'LC', 'ABC Australia': 'LC', 'Sydney Morning Herald': 'LC', 'Politico EU': 'LC', 'Irish Times': 'LC', 'Deccan Herald': 'LC', 'Indian Express': 'LC', 'Asahi Shimbun': 'LC', 'Live Mint': 'LC', 'The Conversation': 'LC', 'Times of Israel': 'LC', 'Sky News': 'LC', 'Chicago Tribune': 'LC', 'Miami Herald': 'LC', 'Al Jazeera': 'LC', 'AP': 'LC', 'AP News': 'LC', 'Associated Press': 'LC', 'Axios': 'LC', 'Haaretz': 'LC',
  // Center (AllSides: Center / MBFC: Least Biased)
  'Reuters': 'C', 'France 24': 'C', 'France24': 'C', 'DW News': 'C', 'DW': 'C', 'Deutsche Welle': 'C', 'The Hill': 'C', 'PBS': 'C', 'Nikkei': 'C', 'Nikkei Asia': 'C', 'FT': 'C', 'Financial Times': 'C', 'UN News': 'C', 'The Hindu': 'LC', 'Korea Times': 'C', 'Korea Herald': 'C', 'SCMP': 'C', 'South China Morning Post': 'C', 'Euronews': 'C', 'UPI': 'C', 'PTI': 'C', 'ANI': 'C', 'IANS': 'C', 'DPA': 'C', 'EFE': 'C', 'ANSA': 'C', 'Dawn': 'C', 'Express Tribune': 'C', 'Geo News': 'C', 'Pakistan Today': 'C', 'The News': 'C', 'Straits Times': 'C', 'CNA': 'C', 'Japan Times': 'C', 'Bangkok Post': 'C', 'Bernama': 'C', 'VnExpress': 'C', 'NZ Herald': 'C', 'RNZ': 'C', 'RTÉ': 'C', 'Semafor': 'C', 'Foreign Policy': 'C', 'Foreign Affairs': 'C', 'Defense One': 'C', 'Defense News': 'C', 'Breaking Defense': 'C', 'Clarín': 'C', 'Premium Times': 'C', 'News24': 'C', 'Times Live': 'C', 'Mail & Guardian': 'C', 'East African': 'C', 'Standard Media': 'C', 'Daily Nation': 'C', 'PhilStar': 'C', 'Inquirer': 'C', 'Manila Times': 'C', 'The Star Malaysia': 'C', 'Stuff NZ': 'C', 'Nine News': 'C', 'Dutch News': 'C', 'The Local': 'C', 'WION': 'C', 'Economic Times': 'C', 'Money Control': 'C', 'MarketWatch': 'C', 'Fortune': 'C', 'Barrons': 'C', 'Seeking Alpha': 'C', 'Yonhap': 'C', 'Google News': 'LC', 'AFP': 'C', 'Newsweek': 'C', 'The Economist': 'C', 'Forbes': 'C',
  // Right-Center (AllSides: Lean Right)
  'Wall Street Journal': 'RC', 'The Wall Street Journal': 'RC', 'WSJ': 'RC', 'The Telegraph': 'RC', 'Washington Times': 'RC', 'New York Post': 'RC', 'The Dispatch': 'RC', 'RealClearPolitics': 'RC', 'Daily Mail': 'RC', 'Daily Mail UK': 'RC', 'Daily Express': 'RC', 'The Sun': 'RC', 'The Australian': 'RC', 'Jerusalem Post': 'RC', 'Daily Sabah': 'RC', 'TRT World': 'RC', 'Anadolu Agency': 'RC', 'Arab News': 'RC', 'Gulf News': 'RC', 'Al Arabiya': 'RC', 'Global Times': 'RC', 'O Globo': 'RC', 'La Nación': 'RC', 'Times of India': 'RC', 'ARY News': 'RC', 'Metro UK': 'RC', 'Evening Standard': 'RC', 'Washington Examiner': 'RC',
  // Right (AllSides: Right)
  'Fox News': 'R', 'Daily Wire': 'R', 'Breitbart': 'R', 'The Blaze': 'R', 'Newsmax': 'R', 'Daily Caller': 'R', 'National Review': 'R', 'The Federalist': 'R', 'New York Sun': 'R', 'RT': 'R', 'TASS': 'R', 'Xinhua': 'R', 'China Daily': 'R', 'Tehran Times': 'R', 'Pravda': 'R', 'RIA Novosti': 'R'
};

function getSourceBias(source) {
  if (!source) return null;
  // Try exact match first
  if (SOURCE_BIAS[source]) return SOURCE_BIAS[source];
  // Partial match - prefer longest matching key, skip short keys to avoid false positives
  // (e.g., 'RT' matching inside 'Report', 'AP' inside 'Japan')
  const srcLower = source.toLowerCase();
  let bestKey = null, bestLen = 0;
  Object.keys(SOURCE_BIAS).forEach(k => {
    if (k.length < 4) return; // Short keys (RT, AP, FT, DW) only match exactly
    const kLower = k.toLowerCase();
    if (srcLower.includes(kLower) || kLower.includes(srcLower)) {
      if (k.length > bestLen) { bestLen = k.length; bestKey = k; }
    }
  });
  return bestKey ? SOURCE_BIAS[bestKey] : 'C';
}

function renderBiasTag(source) {
  const bias = getSourceBias(source);
  if (!bias) return '';
  const labels = { 'L': 'Left Leaning', 'LC': 'Slight Left Leaning', 'C': 'Unbiased', 'RC': 'Slight Right Leaning', 'R': 'Right Leaning' };
  const dotPos = { 'L': '8%', 'LC': '28%', 'C': '50%', 'RC': '72%', 'R': '92%' };
  const dotColor = { 'L': '#2563eb', 'LC': '#60a5fa', 'C': '#9ca3af', 'RC': '#f87171', 'R': '#dc2626' };
  const labelColor = { 'L': '#60a5fa', 'LC': '#93c5fd', 'C': '#9ca3af', 'RC': '#fca5a5', 'R': '#f87171' };
  return `<span style="display:inline-flex;align-items:center;gap:4px;margin-left:6px;vertical-align:middle;">`
    + `<span style="display:inline-block;width:48px;height:4px;border-radius:2px;background:linear-gradient(to right,#2563eb 0%,#60a5fa 20%,#93c5fd 35%,#d1d5db 50%,#fca5a5 65%,#f87171 80%,#dc2626 100%);position:relative;">`
    + `<span style="position:absolute;top:50%;left:${dotPos[bias]};width:8px;height:8px;border-radius:50%;background:#fff;border:2px solid ${dotColor[bias]};transform:translate(-50%,-50%);box-shadow:0 1px 3px rgba(0,0,0,0.4);"></span>`
    + `</span>`
    + `<span style="font-size:7px;color:${labelColor[bias]};font-weight:600;white-space:nowrap;">${labels[bias]}</span>`
    + `</span>`;
}

// Disperse bias clusters so no more than 2 consecutive same-direction articles
function disperseBiasArticles(articles) {
  if (articles.length < 4) return articles;

  function biasDir(source) {
    const b = getSourceBias(source);
    if (b === 'L' || b === 'LC') return 'left';
    if (b === 'RC' || b === 'R') return 'right';
    return 'center';
  }

  // Multiple passes to break up any clusters
  for (let pass = 0; pass < 3; pass++) {
    let changed = false;
    for (let i = 2; i < articles.length; i++) {
      const d0 = biasDir(articles[i - 2].source);
      const d1 = biasDir(articles[i - 1].source);
      const d2 = biasDir(articles[i].source);

      // 3 consecutive same direction (only break up left or right, center clusters are fine)
      if (d0 === d1 && d1 === d2 && d0 !== 'center') {
        // Find nearest article with different direction to swap with
        for (let j = i + 1; j < Math.min(i + 8, articles.length); j++) {
          if (biasDir(articles[j].source) !== d0) {
            [articles[i], articles[j]] = [articles[j], articles[i]];
            changed = true;
            break;
          }
        }
      }
    }
    if (!changed) break;
  }
  return articles;
}

// Store last newsletter data

function formatSourceName(sourceId) {
  if (!sourceId) return 'News';
  const id = sourceId.toLowerCase();

  // Comprehensive source mapping
  const sourceMap = {
    // Major International
    'bbc': 'BBC News', 'reuters': 'Reuters', 'aljazeera': 'Al Jazeera', 'theguardian': 'The Guardian',
    'apnews': 'AP News', 'afp': 'AFP', 'dw': 'Deutsche Welle', 'france24': 'France 24',
    // US News
    'cnn': 'CNN', 'nytimes': 'NY Times', 'washingtonpost': 'Washington Post', 'wsj': 'Wall Street Journal',
    'usatoday': 'USA Today', 'latimes': 'LA Times', 'chicagotribune': 'Chicago Tribune',
    'abc': 'ABC News', 'nbc': 'NBC News', 'cbs': 'CBS News', 'fox': 'Fox News', 'foxnews': 'Fox News',
    'nypost': 'New York Post', 'newyorkpost': 'New York Post', 'newsmax': 'Newsmax',
    'npr': 'NPR', 'pbs': 'PBS', 'politico': 'Politico', 'thehill': 'The Hill', 'axios': 'Axios',
    'huffpost': 'HuffPost', 'buzzfeed': 'BuzzFeed', 'vox': 'Vox', 'slate': 'Slate',
    'yardbarker': 'Yardbarker', 'espn': 'ESPN', 'cbssports': 'CBS Sports', 'si': 'Sports Illustrated',
    // Business/Finance
    'bloomberg': 'Bloomberg', 'ft': 'Financial Times', 'economist': 'The Economist',
    'cnbc': 'CNBC', 'marketwatch': 'MarketWatch', 'forbes': 'Forbes', 'fortune': 'Fortune',
    'businessinsider': 'Business Insider', 'insider': 'Insider', 'barrons': 'Barrons',
    'benzinga': 'Benzinga', 'investorplace': 'InvestorPlace', 'seekingalpha': 'Seeking Alpha',
    'thestreet': 'TheStreet', 'investopedia': 'Investopedia', 'kiplinger': 'Kiplinger',
    'biztoc': 'BizToc', 'bizjournals': 'Biz Journals', 'ibtimes': 'IB Times',
    // UK News
    'sky': 'Sky News', 'telegraph': 'The Telegraph', 'independent': 'The Independent',
    'mirror': 'The Mirror', 'express': 'Daily Express', 'metro': 'Metro UK', 'thesun': 'The Sun',
    'dailymail': 'Daily Mail', 'dailymailuk': 'Daily Mail UK', 'eveningstandard': 'Evening Standard',
    'londonlovesbusiness': 'London Loves Business', 'cityam': 'City A.M.',
    // Middle East
    'dailysabah': 'Daily Sabah', 'jpost': 'Jerusalem Post', 'timesofisrael': 'Times of Israel',
    'haaretz': 'Haaretz', 'middleeastmonitor': 'Middle East Monitor', 'middleeasteye': 'Middle East Eye',
    'arabnews': 'Arab News', 'gulfnews': 'Gulf News', 'zawya': 'Zawya', 'alarabiya': 'Al Arabiya',
    'trtworld': 'TRT World', 'aa': 'Anadolu Agency', 'tehrantimes': 'Tehran Times',
    'menafn': 'MENAFN', 'albawaba': 'Al Bawaba', 'middleeaststar': 'Middle East Star',
    // Asia - Pakistan
    'tribune_pk': 'Express Tribune', 'expresstribune': 'Express Tribune', 'dawn': 'Dawn',
    'geo': 'Geo News', 'arynews': 'ARY News', 'thenews': 'The News', 'pakistantoday': 'Pakistan Today',
    // Asia - India
    'thehindu': 'The Hindu', 'hindustantimes': 'Hindustan Times', 'ndtv': 'NDTV',
    'indiatoday': 'India Today', 'mathrubhumi': 'Mathrubhumi', 'timesofindia': 'Times of India',
    'toi': 'Times of India', 'indianexpress': 'Indian Express', 'deccanherald': 'Deccan Herald',
    'theprint': 'The Print', 'thewire': 'The Wire', 'scroll': 'Scroll', 'firstpost': 'Firstpost',
    'livemint': 'Live Mint', 'moneycontrol': 'Money Control', 'economictimes': 'Economic Times',
    // Asia - Others
    'scmp': 'South China Morning Post', 'straitstimes': 'Straits Times', 'channelnewsasia': 'CNA',
    'nikkei': 'Nikkei Asia', 'japantimes': 'Japan Times', 'koreaherald': 'Korea Herald',
    'koreatimes': 'Korea Times', 'asahi': 'Asahi Shimbun', 'bangkokpost': 'Bangkok Post',
    'xinhua': 'Xinhua', 'globaltimes': 'Global Times', 'chinadaily': 'China Daily',
    'philstar': 'PhilStar', 'inquirer': 'Inquirer', 'manilatimes': 'Manila Times',
    'thestar': 'The Star Malaysia', 'bernama': 'Bernama', 'vnexpress': 'VnExpress',
    // Russia/Eastern Europe
    'rt': 'RT', 'tass': 'TASS', 'ria': 'RIA Novosti', 'pravda': 'Pravda',
    'kyivindependent': 'Kyiv Independent', 'kyivpost': 'Kyiv Post', 'unian': 'UNIAN',
    // Europe
    'efe': 'EFE', 'ansa': 'ANSA', 'dpa': 'DPA', 'lemonde': 'Le Monde', 'spiegel': 'Der Spiegel',
    'elpais': 'El País', 'rte': 'RTÉ', 'irishtimes': 'Irish Times', 'dutchnews': 'Dutch News',
    'thelocal': 'The Local', 'euronews': 'Euronews', 'politicoeu': 'Politico EU',
    'rmoutlook': 'RM Outlook', 'rmf24': 'RMF24', 'onet': 'Onet',
    // Africa
    'legit': 'Legit News', 'punch': 'Punch Nigeria', 'vanguard': 'Vanguard Nigeria',
    'dailynigerian': 'Daily Nigerian', 'premiumtimes': 'Premium Times', 'nation': 'The Nation',
    'iol': 'IOL', 'news24': 'News24', 'timeslive': 'Times Live', 'mg': 'Mail & Guardian',
    'theeastafrican': 'East African', 'standardmedia': 'Standard Media', 'nation_ke': 'Daily Nation',
    // Latin America
    'globo': 'O Globo', 'folha': 'Folha', 'clarin': 'Clarín', 'lanacion': 'La Nación',
    'eluniversal': 'El Universal', 'milenio': 'Milenio', 'reforma': 'Reforma',
    // Australia/Oceania
    'abc_au': 'ABC Australia', 'smh': 'Sydney Morning Herald', 'theaustralian': 'The Australian',
    'nzherald': 'NZ Herald', 'stuff': 'Stuff NZ', 'rnz': 'RNZ', '9news': 'Nine News',
    // Tech News
    'techcrunch': 'TechCrunch', 'theverge': 'The Verge', 'wired': 'Wired', 'arstechnica': 'Ars Technica',
    'engadget': 'Engadget', 'cnet': 'CNET', 'zdnet': 'ZDNet', 'tomshardware': 'Toms Hardware',
    'gizmodo': 'Gizmodo', 'mashable': 'Mashable', 'venturebeat': 'VentureBeat',
    // Wire Services & Others
    'upi': 'UPI', 'pti': 'PTI', 'ani': 'ANI', 'ians': 'IANS',
    'report_az': 'Report Azerbaijan', 'spsrasd_info': 'Sahara Press', 'wionews': 'WION',
    // Aggregators & Others
    'newsweek': 'Newsweek', 'time': 'TIME', 'theatlantic': 'The Atlantic', 'newyorker': 'The New Yorker',
    'foreignpolicy': 'Foreign Policy', 'foreignaffairs': 'Foreign Affairs', 'theconversation': 'The Conversation',
    'defenseone': 'Defense One', 'defensenews': 'Defense News', 'breakingdefense': 'Breaking Defense',
    'oilprice': 'OilPrice', 'hellenicshippingnews': 'Hellenic Shipping', 'lloydslist': 'Lloyds List',
    'semafor': 'Semafor', 'puck': 'Puck', 'theintercept': 'The Intercept', 'motherjones': 'Mother Jones',
    'nationalreview': 'National Review', 'dailywire': 'Daily Wire', 'breitbart': 'Breitbart',
    'rawstory': 'Raw Story', 'mediaite': 'Mediaite', 'thedailybeast': 'Daily Beast'
  };

  if (sourceMap[id]) return sourceMap[id];

  // Smart formatting for unknown sources
  return sourceId
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map(word => {
      if (word.length <= 3 && word === word.toUpperCase()) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ')
    .trim();
}

// Calculate time ago with cleaner display

function timeAgo(dateString) {
  if (!dateString) return 'Recent';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Recent';

  const now = new Date();
  const diffMs = now - date;

  // Handle future dates or very recent
  if (diffMs < 60000) return 'Just now';

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return diffMins + 'm ago';
  if (diffHours < 6) return diffHours + 'h ago';
  if (diffHours < 24) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return diffDays + ' days ago';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Fetch RSS feed and convert to JSON
async function fetchRSS(feedUrl, sourceName) {
  try {
    const proxyUrl = RSS2JSON_API + encodeURIComponent(feedUrl);
    const response = await fetch(proxyUrl);
    if (!response.ok) return [];

    const data = await response.json();
    if (data.status !== 'ok' || !data.items) return [];

    return data.items.map(item => {
      let source = sourceName || data.feed?.title || 'News';
      let title = item.title;

      // Google News embeds real source in title: "Headline - Al Jazeera"
      if (source === 'Google News' && title) {
        const dashIdx = title.lastIndexOf(' - ');
        if (dashIdx > 0) {
          source = title.substring(dashIdx + 3).trim();
          title = title.substring(0, dashIdx).trim();
        }
      }

      return {
        title: title,
        description: item.description || item.content || '',
        link: item.link,
        source_id: source,
        pubDate: item.pubDate
      };
    });
  } catch (error) {
    console.warn(`RSS fetch failed for ${sourceName}:`, error.message);
    return [];
  }
}

// Fetch live news from RSS feeds (FREE and UNLIMITED!)
async function fetchLiveNews() {
  console.log('Fetching live news from RSS feeds...');

  // Update UI to show loading
  const timestampEl = document.getElementById('newsTimestamp');
  if (timestampEl) {
    timestampEl.innerHTML = `<span style="color:#eab308;">●</span> Fetching latest news...`;
  }

  try {
    // Fetch from multiple RSS feeds in parallel
    const feedPromises = RSS_FEEDS.daily.map(feed => fetchRSS(feed.url, feed.source));
    const feedResults = await Promise.all(feedPromises);

    // Combine all results
    let allArticles = feedResults.flat();
    console.log(`RSS feeds returned ${allArticles.length} total articles`);

    if (allArticles.length > 0) {
      // Sort by date (newest first)
      allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

      // Filter out irrelevant articles and require geopolitical relevance
      const relevantArticles = allArticles.filter(article => {
        const text = ((article.title || '') + ' ' + (article.description || '')).toLowerCase();
        if (IRRELEVANT_KEYWORDS.some(kw => text.includes(kw))) return false;
        return GEOPOLITICAL_SIGNALS.some(sig => text.includes(sig));
      });

      // Remove duplicates by title similarity
      const seen = new Set();
      const uniqueArticles = relevantArticles.filter(article => {
        const key = article.title.toLowerCase().slice(0, 50);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      DAILY_BRIEFING = uniqueArticles.slice(0, 50).map(article => {
        const category = detectCategory(article.title, article.description);
        const importance = ['CONFLICT', 'CRISIS', 'SECURITY'].includes(category) ? 'high' : 'medium';
        const sourceName = formatSourceName(article.source_id);

        return {
          time: timeAgo(article.pubDate),
          category: category,
          importance: importance,
          headline: article.title,
          source: sourceName,
          url: article.link || ''
        };
      });

      // Ensure political diversity - inject RC/R fallback articles if live feeds lack them
      const rcCount = DAILY_BRIEFING.filter(a => { const b = getSourceBias(a.source); return b === 'RC' || b === 'R'; }).length;
      if (rcCount < 3) {
        const rightFallbacks = DAILY_BRIEFING_FALLBACK.filter(a => {
          const b = getSourceBias(a.source);
          return b === 'RC' || b === 'R';
        });
        const needed = Math.min(4 - rcCount, rightFallbacks.length);
        if (needed > 0) {
          const interval = Math.max(1, Math.floor(DAILY_BRIEFING.length / (needed + 1)));
          for (let i = 0; i < needed; i++) {
            const pos = Math.min((i + 1) * interval + i, DAILY_BRIEFING.length);
            DAILY_BRIEFING.splice(pos, 0, rightFallbacks[i]);
          }
          console.log(`Injected ${needed} right-leaning articles for bias balance`);
        }
      }

      // Disperse any same-direction bias clusters (max 2 consecutive)
      DAILY_BRIEFING = disperseBiasArticles(DAILY_BRIEFING);

      // Demote low-priority stories (stable countries, local incidents) out of top 10
      const DEMOTE_KEYWORDS = ['switzerland', 'swiss', 'nightclub', 'club fire', 'nightlife'];
      for (let i = 0; i < Math.min(10, DAILY_BRIEFING.length); i++) {
        const h = (DAILY_BRIEFING[i].headline || '').toLowerCase();
        if (DEMOTE_KEYWORDS.some(kw => h.includes(kw))) {
          const [item] = DAILY_BRIEFING.splice(i, 1);
          const dest = Math.min(14, DAILY_BRIEFING.length);
          DAILY_BRIEFING.splice(dest, 0, item);
          i--; // re-check this position since a new article slid in
        }
      }

      lastNewsUpdate = new Date();
      console.log('Live news updated:', DAILY_BRIEFING.length, 'articles from RSS feeds');

      // Save briefing snapshot for history
      saveBriefingSnapshot();

      if (currentTab === 'daily') {
        renderSidebar();
      }
      updateNewsTimestamp();
      checkBreakingNews(DAILY_BRIEFING);

      // Dynamic risk: analyze fetched articles
      if (typeof updateDynamicRisks === 'function') {
        updateDynamicRisks(DAILY_BRIEFING);
      }
      return;
    }
  } catch (error) {
    console.warn('RSS feeds failed:', error.message);
  }

  // Fallback: try each backup API in sequence
  const dailyApiOrder = ['gnews', 'newsdata', 'mediastack'];
  for (const apiName of dailyApiOrder) {
    try {
      const api = NEWS_APIS[apiName];
      if (!api || !api.key || !api.buildDailyUrl) continue;
      console.log(`Trying ${apiName} for daily briefing...`);
      const response = await fetch(api.buildDailyUrl(api.key));
      if (response.ok) {
        const data = await response.json();
        const results = api.parseResults(data);
        if (results && results.length > 0) {
          console.log(`Fallback to ${apiName}:`, results.length, 'articles');
          DAILY_BRIEFING = results.filter(article => {
            const text = ((article.title || '') + ' ' + (article.description || '')).toLowerCase();
            if (IRRELEVANT_KEYWORDS.some(kw => text.includes(kw))) return false;
            return GEOPOLITICAL_SIGNALS.some(sig => text.includes(sig));
          }).map(article => ({
            time: timeAgo(article.pubDate),
            category: detectCategory(article.title, article.description),
            importance: 'medium',
            headline: article.title,
            source: formatSourceName(article.source_id),
            url: article.link || ''
          }));
          lastNewsUpdate = new Date();
          saveBriefingSnapshot();
          if (currentTab === 'daily') renderSidebar();
          updateNewsTimestamp();
          if (typeof updateDynamicRisks === 'function') {
            updateDynamicRisks(DAILY_BRIEFING);
          }
          return;
        }
      }
    } catch (e) {
      console.warn(`${apiName} fallback failed:`, e.message);
    }
  }

  // All sources failed - keep existing briefing or use fallback
  console.error('All news sources failed');
  if (DAILY_BRIEFING.length === 0) {
    DAILY_BRIEFING = [...DAILY_BRIEFING_FALLBACK];
  }
  if (timestampEl) {
    timestampEl.innerHTML = `<span style="color:#f97316;">●</span> News temporarily unavailable · Using cached data`;
  }
}

// Update timestamp display
function updateNewsTimestamp() {
  const timestampEl = document.getElementById('newsTimestamp');
  if (timestampEl && lastNewsUpdate) {
    timestampEl.innerHTML = `<span style="color:#22c55e;">●</span> Live · Updated ${lastNewsUpdate.toLocaleTimeString()} · <span style="color:#6b7280;">${DAILY_BRIEFING.length} articles</span>`;
  }
}

// Initialize dynamic risk state system
initializeRiskState();

// Seed briefing history if empty — save fallback data as yesterday's briefing
// so users see a past briefing immediately on first visit
(function seedBriefingHistory() {
  try {
    const history = loadBriefingHistory();
    const todayKey = getBriefingDateKey();
    const pastKeys = Object.keys(history).filter(d => d !== todayKey);
    if (pastKeys.length === 0) {
      // No past briefings exist yet — seed yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = yesterday.toISOString().split('T')[0];
      history[yesterdayKey] = {
        date: yesterdayKey,
        articles: DAILY_BRIEFING_FALLBACK.map(a => ({
          time: a.time,
          category: a.category,
          importance: a.importance,
          headline: a.headline,
          source: a.source,
          url: a.url
        })),
        savedAt: new Date().toISOString(),
        articleCount: DAILY_BRIEFING_FALLBACK.length
      };
      localStorage.setItem(BRIEFING_HISTORY_KEY, JSON.stringify(history));
      console.log('Seeded briefing history with yesterday\'s briefing');
    }
  } catch (e) {
    console.warn('Could not seed briefing history:', e.message);
  }
})();

// Initialize live news and set up auto-refresh
fetchLiveNews();
setInterval(fetchLiveNews, NEWS_REFRESH_INTERVAL);

// Breaking news detection keywords

const COUNTRY_TRENDS = {
  // Active conflicts - consistently high
  'Ukraine': [90, 92, 88, 90, 95, 92, 90, 88, 90, 92, 90, 92], // Ongoing war, fluctuates with offensives
  'Russia': [85, 88, 85, 88, 90, 88, 85, 88, 90, 88, 90, 92], // Tied to Ukraine war
  'Palestine': [70, 72, 75, 78, 80, 82, 80, 78, 80, 82, 80, 78], // West Bank tensions elevated
  'Gaza': [95, 98, 95, 92, 90, 88, 85, 88, 92, 95, 92, 90], // Post-Oct 2023, gradually stabilizing
  'Israel': [80, 85, 82, 78, 75, 72, 70, 72, 75, 78, 75, 78], // Regional tensions persist
  'Sudan': [75, 80, 85, 90, 92, 95, 95, 95, 92, 92, 95, 95], // Civil war escalated Apr 2023
  'Myanmar': [70, 72, 75, 78, 80, 82, 85, 85, 88, 88, 85, 85], // Resistance gaining ground
  'Yemen': [80, 78, 80, 82, 85, 88, 85, 82, 80, 78, 80, 82], // Houthi Red Sea attacks
  'Haiti': [75, 78, 80, 85, 88, 90, 92, 92, 90, 88, 90, 92], // Gang violence worsening
  'Afghanistan': [85, 85, 82, 80, 82, 85, 85, 88, 85, 85, 88, 88], // Taliban control, humanitarian crisis
  'DRC': [78, 80, 82, 85, 88, 85, 82, 85, 88, 90, 88, 88], // M23 conflict ongoing
  'Somalia': [80, 78, 80, 82, 80, 78, 80, 82, 85, 82, 80, 82], // Al-Shabaab persistent

  // Major geopolitical hotspots
  'China': [55, 58, 55, 52, 55, 58, 60, 58, 55, 58, 60, 58], // Taiwan tensions, economic issues
  'Taiwan': [50, 55, 52, 50, 55, 58, 55, 52, 55, 58, 60, 58], // Cross-strait tensions
  'Iran': [65, 68, 70, 72, 75, 78, 75, 72, 70, 72, 75, 78], // Nuclear program, regional proxy wars
  'North Korea': [60, 62, 65, 68, 65, 62, 65, 68, 70, 68, 65, 68], // Missile tests continue
  'Venezuela': [55, 58, 60, 62, 65, 68, 70, 72, 75, 78, 85, 88], // Spiked after Maduro capture
  'Syria': [70, 68, 70, 72, 70, 68, 65, 62, 60, 58, 55, 52], // Assad fell, transitioning
  'Lebanon': [60, 62, 65, 68, 70, 75, 78, 75, 72, 68, 65, 62], // Post-war rebuilding

  // Political transitions
  'South Korea': [35, 38, 45, 55, 65, 70, 68, 65, 60, 55, 50, 48], // Political crisis peaked
  'Germany': [30, 32, 35, 40, 45, 50, 48, 45, 42, 38, 35, 32], // Coalition collapsed, new govt
  'France': [40, 42, 45, 48, 50, 52, 55, 52, 50, 48, 45, 48], // Political instability
  'Japan': [25, 28, 30, 35, 40, 45, 50, 48, 45, 42, 38, 35], // Snap election, new PM

  // Stable countries - low consistent values
  'United States': [35, 38, 35, 32, 35, 38, 40, 38, 35, 38, 40, 42], // Domestic tensions, foreign policy
  'United Kingdom': [25, 28, 25, 22, 25, 28, 30, 28, 25, 28, 25, 28], // Generally stable
  'Canada': [15, 18, 15, 12, 15, 18, 20, 18, 15, 18, 15, 18], // Stable democracy
  'Australia': [15, 18, 15, 18, 20, 18, 15, 18, 20, 18, 15, 18], // Stable
};

// Key risk indicators for countries
const COUNTRY_INDICATORS = {
  'Ukraine': [{ text: 'Conflict', dir: 'up' }, { text: 'Aid Flow', dir: 'stable' }, { text: 'Diplomacy', dir: 'down' }],
  'Russia': [{ text: 'Sanctions', dir: 'up' }, { text: 'Economy', dir: 'down' }, { text: 'Military', dir: 'stable' }],
  'Palestine': [{ text: 'Occupation', dir: 'up' }, { text: 'Settlements', dir: 'up' }, { text: 'Statehood', dir: 'stable' }],
  'Gaza': [{ text: 'Humanitarian', dir: 'up' }, { text: 'Ceasefire', dir: 'stable' }, { text: 'Rebuilding', dir: 'down' }],
  'Israel': [{ text: 'Security', dir: 'up' }, { text: 'Politics', dir: 'down' }, { text: 'Regional', dir: 'up' }],
  'Sudan': [{ text: 'Violence', dir: 'up' }, { text: 'Famine', dir: 'up' }, { text: 'Displacement', dir: 'up' }],
  'Myanmar': [{ text: 'Resistance', dir: 'up' }, { text: 'Junta Control', dir: 'down' }, { text: 'Refugees', dir: 'up' }],
  'Yemen': [{ text: 'Houthi Activity', dir: 'up' }, { text: 'Shipping', dir: 'down' }, { text: 'Peace Talks', dir: 'stable' }],
  'Haiti': [{ text: 'Gang Violence', dir: 'up' }, { text: 'Government', dir: 'down' }, { text: 'Migration', dir: 'up' }],
  'China': [{ text: 'Taiwan Tension', dir: 'up' }, { text: 'Economy', dir: 'down' }, { text: 'US Relations', dir: 'down' }],
  'Taiwan': [{ text: 'China Threat', dir: 'up' }, { text: 'US Support', dir: 'up' }, { text: 'Defense', dir: 'up' }],
  'Iran': [{ text: 'Nuclear', dir: 'up' }, { text: 'Sanctions', dir: 'stable' }, { text: 'Proxies', dir: 'up' }],
  'North Korea': [{ text: 'Missiles', dir: 'up' }, { text: 'Isolation', dir: 'stable' }, { text: 'Provocations', dir: 'up' }],
  'Venezuela': [{ text: 'Transition', dir: 'up' }, { text: 'Stability', dir: 'down' }, { text: 'US Pressure', dir: 'up' }],
  'Syria': [{ text: 'Rebuilding', dir: 'up' }, { text: 'Stability', dir: 'up' }, { text: 'Refugees Return', dir: 'stable' }],
  'South Korea': [{ text: 'Politics', dir: 'down' }, { text: 'Economy', dir: 'stable' }, { text: 'North Threat', dir: 'stable' }],
  'United States': [{ text: 'Polarization', dir: 'up' }, { text: 'Economy', dir: 'stable' }, { text: 'Global Role', dir: 'stable' }],
};

// Get trend data - use real data if available, otherwise generate based on risk level
function getTrendData(countryName, risk) {
  if (COUNTRY_TRENDS[countryName]) {
    return COUNTRY_TRENDS[countryName];
  }
  // Fallback: generate consistent data based on risk level
  const baseValues = { catastrophic: 85, extreme: 70, severe: 55, stormy: 40, cloudy: 25, clear: 10 };
  const base = baseValues[risk] || 50;
  const trends = [];
  for (let i = 0; i < 12; i++) {
    // Use country name as seed for consistent pseudo-random variation
    const seed = (countryName.charCodeAt(i % countryName.length) + i) % 20 - 10;
    trends.push(Math.max(5, Math.min(100, base + seed)));
  }
  return trends;
}

// Render risk trend chart with indicators
function renderTrendChart(countryName, risk) {
  const data = getTrendData(countryName, risk);
  const max = Math.max(...data);
  const indicators = COUNTRY_INDICATORS[countryName] || [];
  const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];

  return `
    <div style="display:flex;gap:16px;align-items:flex-start;">
      <div style="flex:1;">
        <div class="trend-chart">
          ${data.map((val, i) => {
            const height = (val / max) * 25 + 5;
            const trend = i > 0 ? (val > data[i-1] ? 'up' : val < data[i-1] ? 'down' : 'stable') : 'stable';
            return `<div class="trend-bar trend-${trend}" style="height:${height}px" title="${months[i]} 2025: ${val}"></div>`;
          }).join('')}
        </div>
        <div class="trend-label">Mar 2025 → Feb 2026</div>
      </div>
      ${indicators.length > 0 ? `
        <div style="min-width:100px;">
          <div style="font-size:8px;color:#6b7280;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">Key Indicators</div>
          ${indicators.map(ind => `
            <div style="font-size:9px;color:#d1d5db;margin-bottom:4px;display:flex;align-items:center;gap:4px;">
              <span style="color:${ind.dir === 'up' ? '#ef4444' : ind.dir === 'down' ? '#22c55e' : '#6b7280'}">${ind.dir === 'up' ? '↑' : ind.dir === 'down' ? '↓' : '→'}</span>
              ${ind.text}
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

// Conflict zones data (lat, lng, radius, intensity)

const CONFLICT_ZONES = [
  { lat: 48.5, lng: 35.0, radius: 0.15, name: 'Ukraine-Russia', intensity: 1.0 },
  { lat: 31.5, lng: 34.5, radius: 0.08, name: 'Gaza', intensity: 1.0 },
  { lat: 15.5, lng: 32.5, radius: 0.12, name: 'Sudan', intensity: 0.9 },
  { lat: 21.0, lng: 96.0, radius: 0.10, name: 'Myanmar', intensity: 0.8 },
  { lat: 15.5, lng: 47.5, radius: 0.10, name: 'Yemen', intensity: 0.8 },
  { lat: 2.0, lng: 45.0, radius: 0.08, name: 'Somalia', intensity: 0.7 },
  { lat: -2.0, lng: 28.0, radius: 0.12, name: 'DRC East', intensity: 0.8 },
  { lat: 33.5, lng: 36.5, radius: 0.06, name: 'Syria', intensity: 0.7 },
  { lat: 18.5, lng: -72.3, radius: 0.04, name: 'Haiti', intensity: 0.7 },
  { lat: 17.0, lng: -3.0, radius: 0.10, name: 'Sahel', intensity: 0.8 }
];

// Add conflict zones to globe
function addConflictZones(globe) {
  CONFLICT_ZONES.forEach(zone => {
    // Create pulsing conflict zone circle
    const geometry = new THREE.RingGeometry(zone.radius * 0.5, zone.radius, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff3333,
      transparent: true,
      opacity: 0.3 * zone.intensity,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(geometry, material);

    const pos = latLngToVector3(zone.lat, zone.lng, 1.01);
    ring.position.copy(pos);
    ring.lookAt(new THREE.Vector3(0, 0, 0));
    ring.userData = { isConflictZone: true, intensity: zone.intensity, baseOpacity: 0.3 * zone.intensity };

    globe.add(ring);

    // Add outer glow ring
    const glowGeom = new THREE.RingGeometry(zone.radius, zone.radius * 1.3, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xff6666,
      transparent: true,
      opacity: 0.15 * zone.intensity,
      side: THREE.DoubleSide
    });
    const glow = new THREE.Mesh(glowGeom, glowMat);
    glow.position.copy(pos);
    glow.lookAt(new THREE.Vector3(0, 0, 0));
    glow.userData = { isConflictZone: true, isGlow: true };
    globe.add(glow);
  });
}

// Animate conflict zones (pulsing effect)
function animateConflictZones() {
  if (!globe) return;
  const time = Date.now() * 0.002;

  globe.children.forEach(child => {
    if (child.userData && child.userData.isConflictZone && !child.userData.isGlow) {
      const pulse = 0.5 + 0.5 * Math.sin(time * child.userData.intensity);
      child.material.opacity = child.userData.baseOpacity * (0.5 + 0.5 * pulse);
    }
  });
}

// Set current date (updates automatically at midnight)