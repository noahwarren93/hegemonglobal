// news.js - Newsletter rendering, entity extraction

let lastNewsletterData = null;
let lastNewsletterTime = null;

// Check if it's past 5pm EST (22:00 UTC in winter, 21:00 UTC in summer)
function isNewsletterTime() {
  const now = new Date();
  // Convert to EST (UTC-5)
  const estHour = (now.getUTCHours() - 5 + 24) % 24;
  return estHour >= 17; // 5pm EST or later
}

// Get the newsletter release time for today
function getNewsletterReleaseTime() {
  const now = new Date();
  // Create today at 5pm EST (22:00 UTC)
  const release = new Date(now);
  release.setUTCHours(22, 0, 0, 0);

  // If we're past that time, show it
  if (now >= release) {
    return release;
  }
  return null;
}

// Get time until next newsletter
function getTimeUntilNewsletter() {
  const now = new Date();
  const estHour = (now.getUTCHours() - 5 + 24) % 24;
  const estMinute = now.getUTCMinutes();

  if (estHour >= 17) {
    return null; // Already released
  }

  const hoursLeft = 16 - estHour;
  const minsLeft = 60 - estMinute;

  return { hours: hoursLeft, minutes: minsLeft };
}

// Categorize news by region
function categorizeNewsByRegion(articles) {
  const regionNews = {};

  // Initialize all regions
  Object.keys(NEWSLETTER_REGIONS).forEach(region => {
    regionNews[region] = [];
  });
  regionNews['Global'] = []; // For uncategorized news

  articles.forEach(article => {
    const text = (article.headline || article.title || '');
    let matched = false;

    for (const [region, keywords] of Object.entries(NEWSLETTER_REGIONS)) {
      // Use word-boundary matching to prevent "US" matching inside "suspect", "focus", etc.
      if (keywords.some(kw => {
        const rx = new RegExp('\\b' + kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
        return rx.test(text);
      })) {
        regionNews[region].push(article);
        matched = true;
        break; // Only assign to first matching region
      }
    }

    if (!matched) {
      regionNews['Global'].push(article);
    }
  });

  return regionNews;
}

// ============================================================
// BRIEFING NARRATIVE ENGINE - Generate prose summaries from headlines
// ============================================================

// Extract key entities (countries, orgs) from headline text — word-boundary matching only
function extractEntities(text) {
  const entities = [];
  const allCountries = Object.keys(COUNTRIES);
  allCountries.forEach(c => {
    // Use word boundary regex to avoid substring matches (e.g. "Mali" inside "Somalia")
    const rx = new RegExp('\\b' + c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
    if (rx.test(text)) entities.push(c);
  });
  // Check common shorthand/orgs
  const orgs = { 'NATO': /\bNATO\b/i, 'EU': /\bEU\b|\bEuropean Union\b/i, 'UN': /\bUN\b|\bUnited Nations\b/i,
    'G7': /\bG7\b/i, 'BRICS': /\bBRICS\b/i, 'IMF': /\bIMF\b/i, 'OPEC': /\bOPEC\b/i };
  Object.entries(orgs).forEach(([name, rx]) => { if (rx.test(text)) entities.push(name); });
  return [...new Set(entities)];
}

// Filter entities to only those belonging to a specific region
function getRegionEntities(entities, region) {
  const regionCountries = NEWSLETTER_REGIONS[region] || [];
  return entities.filter(e => {
    // Check if entity is in this region's keyword list
    if (regionCountries.some(kw => kw.toLowerCase() === e.toLowerCase())) return true;
    // Also allow orgs that are relevant globally
    if (['NATO', 'EU', 'UN', 'G7', 'BRICS', 'IMF', 'OPEC'].includes(e)) return true;
    return false;
  });
}

// Classify a headline's tone/action
function classifyHeadline(headline) {
  const h = headline.toLowerCase();
  if (h.match(/attack|strike|bomb|shell|raid|kill|dead|casualt|wound|massacre|assault|shoot|shot|gunfire|stabbing|hostage|murder|execution|slain|slay|terror|explos|arson|ambush/)) return 'violence';
  if (h.match(/ceasefire|peace|truce|agreement|deal|negotiat|talks|summit|diplomat/)) return 'diplomacy';
  if (h.match(/protest|demonstrat|rally|unrest|riot|dissent|opposition/)) return 'unrest';
  if (h.match(/sanction|embargo|tariff|ban|restrict|penalt/)) return 'sanctions';
  if (h.match(/elect|vote|ballot|campaign|inaugurati|sworn|president|prime minister/)) return 'politics';
  if (h.match(/economy|market|stock|trade|gdp|inflation|recession|growth|rate/)) return 'economic';
  if (h.match(/humanitarian|refugee|famine|aid|crisis|disaster|flood|earthquake/)) return 'humanitarian';
  if (h.match(/military|troops|deploy|defense|weapon|missile|nuclear|navy|army/)) return 'military';
  if (h.match(/tech|ai |cyber|chip|data|digital|space/)) return 'technology';
  if (h.match(/climate|carbon|emission|energy|oil|gas|renewable/)) return 'energy';
  return 'general';
}

// Generate a narrative summary for a region
function generateRegionNarrative(region, articles) {
  if (articles.length === 0) return 'No significant developments were reported in this region over the past 24 hours.';

  // Strong deduplication: compare subject words with 50% overlap threshold
  const stopWords = new Set(['the','a','an','in','on','at','to','for','of','and','or','is','are','was','were','has','have','had','with','by','from','that','this','as','it','its','but','not','be','been','will','would','could','should','may','might','after','before','over','into','about','than','also','just','more','most','some','new','other','says','said','amid','during','between','reports','reported','report','latest','live','updates','happened']);
  const classified = [];
  const seenSubjects = [];

  articles.forEach(a => {
    const headline = a.headline || a.title || '';
    if (!headline) return;
    const subjectWords = headline.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));
    // Check 50%+ word overlap with any already-seen headline
    const isDuplicate = seenSubjects.some(prev => {
      const overlap = subjectWords.filter(w => prev.includes(w)).length;
      return overlap >= Math.max(Math.min(subjectWords.length, prev.length) * 0.5, 2);
    });
    if (isDuplicate) return;
    seenSubjects.push(subjectWords);
    classified.push({
      headline, source: a.source || '', category: a.category || 'WORLD',
      importance: a.importance || 'medium', type: classifyHeadline(headline),
      entities: extractEntities(headline)
    });
  });

  if (classified.length === 0) return 'No significant developments were reported in this region over the past 24 hours.';

  const high = classified.filter(a => a.importance === 'high');
  const types = {};
  classified.forEach(a => { types[a.type] = (types[a.type] || 0) + 1; });
  const topTypes = Object.entries(types).sort((a, b) => b[1] - a[1]);
  // Only include entities that belong in this region
  const allEntities = getRegionEntities([...new Set(classified.flatMap(a => a.entities))], region);

  const sentences = [];
  const usedIdx = new Set();

  // Helper: format source name with "the" where appropriate
  function fmtSource(src) {
    if (!src) return '';
    const needsThe = /^(New York Times|Washington Post|Guardian|Wall Street Journal|Financial Times|Associated Press|Hindu|Telegraph|Economist|Independent|Atlantic|Intercept|Hill|Times|Sun|Mirror|Observer|Spectator|Globe and Mail|National Post|Japan Times|Jerusalem Post|Moscow Times)$/i;
    return needsThe.test(src) ? 'the ' + src : src;
  }

  // LEAD: Most important story
  const leadStory = high.length > 0 ? high[0] : classified[0];
  usedIdx.add(classified.indexOf(leadStory));
  const leadClean = cleanHeadlineForProse(leadStory.headline);
  if (leadStory.source) {
    sentences.push(`According to ${fmtSource(leadStory.source)}, ${leadClean}.`);
  } else {
    sentences.push(`${leadClean.charAt(0).toUpperCase() + leadClean.slice(1)}.`);
  }

  // SECOND STORY: Different type preferred
  const secondIdx = classified.findIndex((a, i) => !usedIdx.has(i) && a.type !== leadStory.type);
  const altIdx = classified.findIndex((a, i) => !usedIdx.has(i));
  const pickIdx = secondIdx >= 0 ? secondIdx : altIdx;
  if (pickIdx >= 0) {
    usedIdx.add(pickIdx);
    const s = classified[pickIdx];
    const sClean = cleanHeadlineForProse(s.headline);
    const bridge = s.type !== leadStory.type ? ({
      'violence': 'On the security front,', 'diplomacy': 'Diplomatically,', 'unrest': 'Domestically,',
      'sanctions': 'Regarding sanctions,', 'politics': 'Politically,', 'economic': 'Economically,',
      'humanitarian': 'On the humanitarian side,', 'military': 'In defense matters,',
      'technology': 'In technology,', 'energy': 'On energy,', 'general': 'Separately,'
    }[s.type] || 'Separately,') : 'Meanwhile,';
    const srcFmt = fmtSource(s.source);
    const src = s.source ? ` (${srcFmt.charAt(0).toUpperCase() + srcFmt.slice(1)})` : '';
    sentences.push(`${bridge} ${sClean}${src}.`);
  }

  // THIRD STORY: Only if genuinely different and enough stories
  const thirdIdx = classified.findIndex((a, i) => !usedIdx.has(i));
  if (thirdIdx >= 0 && classified.length >= 4) {
    const t = classified[thirdIdx];
    const tClean = cleanHeadlineForProse(t.headline);
    const srcFmt2 = fmtSource(t.source);
    const src = t.source ? ` (${srcFmt2.charAt(0).toUpperCase() + srcFmt2.slice(1)})` : '';
    sentences.push(`Additionally, ${tClean}${src}.`);
  }

  // WHY IT MATTERS: Use only region-relevant entities
  const dominantType = topTypes[0][0];
  const entityStr = allEntities.length >= 2 ? ` involving ${formatEntityList(allEntities.slice(0, 3))}` : (allEntities.length === 1 ? ` regarding ${allEntities[0]}` : '');
  if (classified.length >= 2) {
    const analysis = {
      'violence': `The active conflict situation${entityStr} risks further displacement, economic disruption, and potential external involvement.`,
      'diplomacy': `Whether these diplomatic efforts${entityStr} produce binding commitments will shape stability in ${fmtRegion(region)} over the coming weeks.`,
      'unrest': `This pattern of civil unrest${entityStr} points to structural pressures unlikely to resolve without substantive policy changes.`,
      'politics': `These political developments${entityStr} could shift governance trajectories and reshape international partnerships in ${fmtRegion(region)}.`,
      'economic': `These economic pressures${entityStr} carry implications beyond ${fmtRegion(region)}, as changes in monetary policy and market confidence tend to produce ripple effects across connected economies.`,
      'military': `This military activity${entityStr} raises the risk of miscalculation, particularly when multiple actors are increasing their posture simultaneously.`,
      'humanitarian': `The humanitarian situation${entityStr} demands international attention, as conditions are likely to deteriorate without adequate intervention.`,
      'sanctions': `These economic measures${entityStr} are reshaping trade relationships and pushing affected governments toward alternative partnerships.`,
      'technology': `Technology competition${entityStr} has direct implications for both economic positioning and national security in ${fmtRegion(region)}.`,
      'energy': `Energy developments${entityStr} affect global supply chains and pricing, making them relevant well beyond ${fmtRegion(region)}.`
    };
    sentences.push(analysis[dominantType] || `The range of developments${entityStr} reflects an evolving situation across ${fmtRegion(region)}.`);
  }

  // FORWARD LOOK
  if (high.length >= 3) {
    sentences.push(`The next several days will be important in determining whether these situations escalate or move toward resolution.`);
  } else if (high.length >= 1) {
    sentences.push(`These developments are worth monitoring as the situation continues to evolve.`);
  }

  // Post-process: add formal titles and grammar connectors
  return addThatConnector(addLeaderTitles(sentences.slice(0, 6).join(' ')));
}

// Convert Title Case headlines to sentence case for prose embedding
function toSentenceCase(text) {
  if (!text || text.length < 2) return text;
  // Detect Title Case: >60% of words with 4+ letters are capitalized
  const words = text.split(/\s+/);
  const longWords = words.filter(w => w.replace(/[^a-zA-Z]/g, '').length >= 4);
  const capsLongWords = longWords.filter(w => /^[A-Z]/.test(w));
  const isTitleCase = longWords.length >= 2 && (capsLongWords.length / longWords.length) > 0.6;
  if (!isTitleCase) return text;
  // Build set of words to keep capitalized
  const keepCaps = new Set();
  if (typeof COUNTRIES !== 'undefined') {
    Object.keys(COUNTRIES).forEach(name => {
      name.split(/\s+/).forEach(word => { if (word.length > 1) keepCaps.add(word); });
    });
  }
  ['President','Prime','Minister','King','Queen','Prince','Princess','Pope','Senator','Secretary','General','Admiral','Colonel','Governor','Chancellor','Ambassador',
   'Congress','Parliament','Senate','Pentagon','Kremlin','Vatican','Taliban','Hamas','Hezbollah','ISIS','Houthi','Houthis',
   'Republican','Democrat','Democratic','Labour','Conservative','Liberal','Tory','Tories',
   'European','African','Asian','American','Atlantic','Pacific','Arctic','Antarctic','Mediterranean','Caribbean',
   'Islamic','Muslim','Christian','Jewish','Hindu','Buddhist','Orthodox','Sunni','Shia',
   'Israeli','Iranian','Persian','Chinese','Russian','Ukrainian','Syrian','Iraqi','Afghan','Palestinian','Lebanese',
   'Yemeni','Somali','Sudanese','Libyan','Nigerian','Egyptian','Saudi','Turkish','Japanese','Korean',
   'Indian','Pakistani','Brazilian','Mexican','Cuban','Venezuelan','Colombian','British','French','German',
   'Italian','Spanish','Polish','Dutch','Swedish','Norwegian','Finnish','Danish','Greek','Portuguese',
   'Hungarian','Czech','Romanian','Serbian','Croatian','Bosnian','Albanian','Georgian','Armenian',
   'Canadian','Australian','Taiwanese','Greenlandic','Kurdish','Rohingya','Uyghur','Tibetan','Arab',
   'Trump','Biden','Putin','Xi','Macron','Zelensky','Netanyahu','Modi','Erdogan','Scholz','Starmer','Meloni','Kishida','Lula','Milei','Orban',
   'Wall','Street','Reuters','BBC','CNN','OPEC','WHO','IMF','NATO','BRICS',
   'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday',
   'January','February','March','April','May','June','July','August','September','October','November','December',
   'Republic','Federation','Assembly','Union','Kingdom','Nations','Commonwealth',
   'Sea','Gulf','Strait','Red','Cross','Crescent','Bank','West','East','Horn','Sahel','Levant','Peninsula','Mount'
  ].forEach(w => keepCaps.add(w));
  return text.replace(/\S+/g, (word, offset) => {
    const cleanW = word.replace(/[^a-zA-Z]/g, '');
    // Keep acronyms (2+ uppercase chars like NATO, U.S., BBC, EU)
    if (/^[A-Z]{2,}\.?$/.test(cleanW)) return word;
    // Keep words with internal dots (U.S., U.K.)
    if (/[A-Z]\.[A-Z]/.test(word)) return word;
    // Keep mixed-case brand names (TikTok, iPhone, YouTube)
    if (/[a-z][A-Z]/.test(word)) return word;
    // Keep known proper nouns
    const base = word.replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, '');
    if (keepCaps.has(base)) return word;
    // Keep possessives of proper nouns (Iran's, Trump's)
    const stem = base.replace(/'s$|'s$/i, '');
    if (stem !== base && keepCaps.has(stem)) return word;
    // Otherwise lowercase Title Case words
    if (word[0] === word[0].toUpperCase() && word.length > 1) {
      return word[0].toLowerCase() + word.slice(1);
    }
    return word;
  });
}

// Format region name with "the" where grammatically required
function fmtRegion(region) {
  const needsThe = /^(Middle East|Americas|United States|United Kingdom|Philippines|Netherlands|Balkans|Caucasus|Caribbean|Sahel|Horn of Africa|Levant|Czech Republic|Dominican Republic)$/i;
  return needsThe.test(region) ? 'the ' + region : region;
}

// Add formal titles to world leaders on first mention for professional prose
function addLeaderTitles(text) {
  const titles = [
    ['Trump', 'President'], ['Biden', 'President'], ['Putin', 'President'],
    ['Zelensky', 'President'], ['Xi Jinping', 'President'], ['Xi', 'President'],
    ['Macron', 'President'], ['Erdogan', 'President'], ['Lula', 'President'],
    ['Milei', 'President'], ['Sisi', 'President'], ['Assad', 'President'],
    ['Netanyahu', 'Prime Minister'], ['Modi', 'Prime Minister'],
    ['Starmer', 'Prime Minister'], ['Kishida', 'Prime Minister'],
    ['Scholz', 'Chancellor'], ['Meloni', 'Prime Minister'],
    ['Orban', 'Prime Minister'], ['Trudeau', 'Prime Minister']
  ];
  let result = text;
  for (const [name, title] of titles) {
    if (result.includes(`${title} ${name}`)) continue;
    const idx = result.indexOf(name);
    if (idx < 0) continue;
    const before = result.substring(Math.max(0, idx - 25), idx).toLowerCase();
    if (/\b(president|minister|chancellor|king|queen|pope|premier|secretary|prince|leader)\s*$/.test(before)) continue;
    result = result.replace(new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`), `${title} ${name}`);
  }
  return result;
}

// Add "that" connector after reporting verbs for natural prose flow
function addThatConnector(text) {
  // After "tells/told [Titled Name]" + clause starting with proper noun, insert "that"
  text = text.replace(/\b(tells?|told)\s+((?:President|Prime Minister|Chancellor)\s+[\w]+)\s+(?!that\b)([A-Z])/g, '$1 $2 that $3');
  // After reporting verbs + clause starting with proper noun (not already followed by that/the/a/pronouns/prepositions)
  text = text.replace(/\b(says?|said|warns?|warned|claims?|claimed|announces?|announced|confirms?|confirmed|denies?|denied|suggests?|suggested|indicates?|indicated|signals?|signaled|reveals?|revealed|declares?|declared|states?|stated|acknowledges?|acknowledged|reports?|reported)\s+(?!that |the |a |an |it |he |she |they |this |these |there |his |her |its |to |in |on |at |for |of |with |from |no |not |more )([A-Z])/g, '$1 that $2');
  return text;
}

// Format a list with Oxford comma: ["A","B","C"] → "A, B, and C"
function formatEntityList(items) {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return items[0] + ' and ' + items[1];
  return items.slice(0, -1).join(', ') + ', and ' + items[items.length - 1];
}

// Add missing articles (a/an/the) that headlines drop for brevity
function addMissingArticles(text) {
  // Add "the" before geographic features: Sea of X, Strait of X, Gulf of X, etc.
  text = text.replace(/\b(over|near|across|through|in|at|along|around|off|into|from|toward|towards|between|beyond|throughout)\s+((?:Sea|Gulf|Strait|Bay|Cape|Horn|Canal|Channel|Peninsula|Coast)\s+of\s+\w+)/gi, (m, prep, geo) => {
    return prep + ' the ' + geo;
  });
  // Named geographic features: Taiwan Strait, English Channel, Suez Canal, etc.
  text = text.replace(/\b(over|near|across|through|in|at|along|around|off|into|from|toward|towards|between|beyond)\s+(Taiwan Strait|English Channel|Suez Canal|Panama Canal|Korean Peninsula|Sinai Peninsula|Arabian Peninsula|Bering Strait|South China Sea|East China Sea|Yellow Sea|Red Sea|Black Sea|Caspian Sea|Dead Sea|Persian Gulf|Gulf of Aden|Gulf of Mexico|Indian Ocean|Pacific Ocean|Atlantic Ocean|Arctic Ocean|Mediterranean Sea|Sea of Japan|Strait of Hormuz|Strait of Malacca|Cape of Good Hope)/gi, (m, prep, geo) => {
    return prep + ' the ' + geo;
  });
  // Add "the" before standalone geographic nouns after prepositions
  // Capitalize proper features (Strait, Canal, Channel, Peninsula); keep common nouns lowercase (coast, border)
  const properGeoNouns = new Set(['strait','canal','channel','peninsula']);
  text = text.replace(/\b(over|near|across|through|along|around|off|into|from|toward|towards|beyond)\s+(strait|coast|border|peninsula|canal|channel|coastline|frontier)\b/gi, (m, prep, noun) => {
    const formatted = properGeoNouns.has(noun.toLowerCase()) ? noun.charAt(0).toUpperCase() + noun.slice(1).toLowerCase() : noun.toLowerCase();
    return prep + ' the ' + formatted;
  });
  // Add "a/an" after transitive verbs before adjective+noun phrases (headline→prose)
  const verbs = 'signals?|conducts?|launches?|announces?|proposes?|unveils?|signs?|stages?|holds?|tests?|fires?|strikes?|reaches?|orders?|declares?|faces?|seeks?|passes?|approves?|rejects?|adopts?|drafts?|releases?|presents?|issues?|begins?|starts?|opens?|plans?|builds?|creates?|forms?|calls?|makes?|sends?|sets?|targets?|secures?|deploys?|initiates?|negotiates?|brokers?';
  const adjectives = 'major|minor|new|key|massive|significant|potential|critical|large|joint|historic|landmark|formal|fresh|preliminary|strategic|sweeping|broad|controversial|surprise|bold|ambitious|record|emergency|special|temporary|permanent|bilateral|unilateral|ballistic|nuclear|diplomatic|military|ceasefire|peace|trade|economic|political|humanitarian|long-awaited|nationwide|partial|full|limited|comprehensive|retaliatory|preemptive|multinational';
  const regex = new RegExp('\\b(' + verbs + ')\\s+(' + adjectives + ')\\s+', 'gi');
  text = text.replace(regex, (match, verb, adj) => {
    const article = /^[aeiou]/i.test(adj) ? 'an' : 'a';
    return verb + ' ' + article + ' ' + adj + ' ';
  });
  return text;
}

// Clean a headline for embedding in prose
function cleanHeadlineForProse(headline) {
  if (!headline) return 'ongoing developments';
  let clean = headline;
  // Strip source prefixes like "Reuters: " or "BBC - "
  clean = clean.replace(/^[A-Z][A-Za-z\s]+[\-:]\s*/, '');
  // Strip live-blog suffixes: "– as it happened", "| Live updates", "- live", etc.
  clean = clean.replace(/\s*[\-–|]+\s*(as it happened|live updates?|live blog|breaking|developing story|watch live|latest|updates?)\s*$/i, '');
  // Strip "(PHOTOS)", "(VIDEO)", "[WATCH]", etc.
  clean = clean.replace(/\s*[\(\[](photos?|videos?|watch|gallery|breaking|exclusive|updated?|opinion|analysis)[\)\]]\s*/gi, '');
  // Strip leading "BREAKING:" "EXCLUSIVE:" "WATCH:" "UPDATE:" etc.
  clean = clean.replace(/^(BREAKING|EXCLUSIVE|WATCH|UPDATE|JUST IN|ALERT|DEVELOPING|OPINION|ANALYSIS)\s*[:\-–]\s*/i, '');
  // Convert Title Case headlines to sentence case for natural prose
  clean = toSentenceCase(clean);
  // Add missing articles (a/an/the) that headlines drop for brevity
  clean = addMissingArticles(clean);
  // Remove trailing periods, dashes, pipes
  clean = clean.replace(/[\.\-–|]\s*$/, '').trim();
  return clean || 'ongoing developments';
}

// Generate a Global Ramifications section tying all regions together + uncategorized stories
function generateGlobalRamifications(regionData, globalArticles) {
  const allArticles = regionData.flatMap(([_, arts]) => arts);
  const uncategorized = globalArticles || [];
  const combined = [...allArticles, ...uncategorized];
  if (combined.length === 0) return '';

  // Deduplicate with 50% subject-word overlap
  const stopWords = new Set(['the','a','an','in','on','at','to','for','of','and','or','is','are','was','were','has','have','had','with','by','from','that','this','as','it','its','but','not','be','been','will','would','could','should','may','might','after','before','over','into','about','than','also','just','more','most','some','new','other','says','said','amid','during','between','reports','reported','report','latest','live','updates','happened']);
  const classified = [];
  const seenSubjects = [];
  combined.forEach(a => {
    const headline = a.headline || a.title || '';
    if (!headline) return;
    const subjectWords = headline.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
    const isDuplicate = seenSubjects.some(prev => {
      const overlap = subjectWords.filter(w => prev.includes(w)).length;
      return overlap >= Math.max(Math.min(subjectWords.length, prev.length) * 0.5, 2);
    });
    if (isDuplicate) return;
    seenSubjects.push(subjectWords);
    classified.push({
      headline, source: a.source || '', type: classifyHeadline(headline),
      category: a.category || 'WORLD', importance: a.importance || 'medium',
      entities: extractEntities(headline)
    });
  });

  const high = classified.filter(a => a.importance === 'high');
  const types = {};
  classified.forEach(a => { types[a.type] = (types[a.type] || 0) + 1; });
  const topTypes = Object.entries(types).sort((a, b) => b[1] - a[1]);
  const activeRegions = regionData.filter(([_, arts]) => arts.length > 0).map(([r]) => r);
  const allEntities = [...new Set(classified.flatMap(a => a.entities))];
  const majorPowers = allEntities.filter(e => ['United States', 'China', 'Russia', 'EU', 'NATO', 'UN', 'United Kingdom', 'France', 'Germany', 'India', 'Iran', 'Israel', 'Saudi Arabia', 'Turkey', 'Japan'].includes(e));
  const conflictRegions = regionData.filter(([_, arts]) => arts.some(a => a.importance === 'high')).map(([r]) => r);

  const sentences = [];

  // PARAGRAPH 1: Set the scene — what kind of day was it globally
  if (high.length >= 5) {
    sentences.push(`Taking the regional developments together, the past 24 hours represented an elevated period for global risk. ${high.length} high-priority situations were tracked across ${activeRegions.length} regions, a concentration that places strain on international attention and response capacity.`);
  } else if (high.length >= 2) {
    sentences.push(`Viewed collectively, the past 24 hours produced a period of sustained geopolitical activity, with ${high.length} high-priority developments spread across ${activeRegions.length} regions. While no single event dominated the global stage, the combination of these developments paints a picture of an international system under consistent pressure.`);
  } else {
    sentences.push(`Across ${activeRegions.length} active regions, the past 24 hours reflected a measured but active news cycle. ${classified.length} developments were tracked in total, none of which individually rose to crisis level but which, taken together, suggest a baseline of tension that bears monitoring.`);
  }

  // PARAGRAPH 2: Cross-regional connections — the analytical core
  if (conflictRegions.length >= 2) {
    sentences.push(`The most consequential pattern in this cycle is the simultaneity of high-priority activity in ${formatEntityList(conflictRegions.slice(0, 4).map(fmtRegion))}. When crises unfold in multiple theaters at once, the practical effect is a stretching of diplomatic bandwidth and military readiness. Policymakers cannot give full attention to any one situation, and the risk increases that a secondary crisis escalates precisely because primary attention is directed elsewhere.`);
  } else if (activeRegions.length >= 3) {
    sentences.push(`Activity was spread across ${activeRegions.map(fmtRegion).join(', ')}, each contributing distinct threads. While the situations in these regions are not directly connected in most cases, they share an underlying dynamic: a global order under strain, where local instability increasingly has international dimensions and where the capacity for coordinated response has not kept pace with the number of active situations.`);
  }

  // PARAGRAPH 3: Major power dynamics
  if (majorPowers.length >= 3) {
    sentences.push(`Several major powers appeared across the day's developments, including ${majorPowers.slice(0, 4).join(', ')}. This is significant because the positions and actions of these actors set the parameters within which smaller conflicts and negotiations take place. When major powers are simultaneously engaged in multiple theaters, their leverage in any single negotiation tends to diminish, creating openings for regional actors to pursue independent agendas.`);
  } else if (majorPowers.length >= 1) {
    sentences.push(`${majorPowers[0]} was visible across multiple developments in this cycle. The decisions made by ${majorPowers[0]} in the coming days, particularly regarding resource allocation and diplomatic priorities, will influence how several of these situations evolve.`);
  }

  // PARAGRAPH 4: Uncategorized stories that didn't fit a continent
  const uncatDedupe = [];
  const uncatSeenSubjects = [];
  uncategorized.forEach(a => {
    const headline = a.headline || a.title || '';
    if (!headline) return;
    const sw = headline.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
    const isDup = uncatSeenSubjects.some(prev => {
      const ov = sw.filter(w => prev.includes(w)).length;
      return ov >= Math.max(Math.min(sw.length, prev.length) * 0.5, 2);
    });
    if (!isDup) { uncatSeenSubjects.push(sw); uncatDedupe.push({ headline, source: a.source || '' }); }
  });
  if (uncatDedupe.length > 0) {
    const topGlobal = uncatDedupe[0];
    const sourceRef = topGlobal.source ? `, per ${topGlobal.source}` : '';
    sentences.push(`Beyond the regional analysis, developments at the global level included ${cleanHeadlineForProse(topGlobal.headline)}${sourceRef}. These cross-cutting issues often receive less attention than active conflicts but carry long-term consequences for the international system.`);
  }

  // PARAGRAPH 5: Forward look — grounded, not generic
  if (high.length >= 3) {
    sentences.push(`With ${high.length} unresolved high-priority situations across multiple regions, the next several days carry elevated risk. The key question is whether any of these situations produce a decisive shift, either toward resolution or escalation, that changes the broader calculus. Until that happens, the current posture of sustained tension is likely to persist.`);
  } else if (classified.length >= 10) {
    sentences.push(`The overall picture is one of managed instability. No single crisis is spiraling out of control, but the number of active situations means that the margin for error across the international system is thinner than it might appear on any given day. Sustained attention across these fronts remains necessary.`);
  } else {
    sentences.push(`While the global risk level is not at its highest, several of these threads have the potential to develop into more significant stories. The coming days will be worth watching, particularly where domestic pressures intersect with international dynamics.`);
  }

  return addThatConnector(addLeaderTitles(sentences.join(' ')));
}

// Render a single briefing's regional content (reusable for current + past)
function renderBriefingContent(articles) {
  if (!articles || articles.length === 0) {
    return `<div style="text-align:center;padding:20px;color:#6b7280;font-size:11px;">No articles available for this briefing.</div>`;
  }

  const regionNews = categorizeNewsByRegion(articles);

  // Separate continent regions from the 'Global' catch-all bucket
  const globalArticles = regionNews['Global'] || [];
  const continentRegions = Object.entries(regionNews)
    .filter(([name, arts]) => name !== 'Global' && arts.length > 0);

  // Sort regions by significance: high-priority count first, then total article count
  // This means the most eventful continent leads the briefing each day
  continentRegions.sort((a, b) => {
    const aScore = a[1].filter(x => x.importance === 'high').length * 10 + a[1].length;
    const bScore = b[1].filter(x => x.importance === 'high').length * 10 + b[1].length;
    return bScore - aScore;
  });

  if (continentRegions.length === 0 && globalArticles.length === 0) {
    return `<div style="text-align:center;padding:20px;color:#6b7280;font-size:11px;">No regional updates available.</div>`;
  }

  let html = '';

  // Regional narrative summaries — ordered by significance of the day
  continentRegions.forEach(([region, arts]) => {
    const highPriority = arts.filter(a => a.importance === 'high');
    const narrative = generateRegionNarrative(region, arts);

    html += `
      <div class="newsletter-region" style="margin-bottom:16px;">
        <div class="newsletter-region-header">
          <span class="newsletter-region-name">${region.toUpperCase()}</span>
          ${highPriority.length > 0 ? `<span style="font-size:8px;background:#7f1d1d;color:#fca5a5;padding:2px 6px;border-radius:3px;">${highPriority.length} CRITICAL</span>` : ''}
          <span class="newsletter-region-count">${arts.length} update${arts.length > 1 ? 's' : ''}</span>
        </div>
        <div style="font-size:11px;color:#c9cdd4;line-height:1.7;padding:8px 12px 12px;letter-spacing:0.01em;">
          ${narrative}
        </div>
      </div>
    `;
  });

  // Global Ramifications section — ties all regions together + absorbs uncategorized stories
  const ramifications = generateGlobalRamifications(continentRegions, globalArticles);
  if (ramifications) {
    html += `
      <div style="margin-top:8px;border-top:1px solid #1f2937;padding-top:14px;">
        <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:linear-gradient(90deg,rgba(6,182,212,0.12) 0%,transparent 100%);border-left:3px solid #06b6d4;margin-bottom:6px;">
          <span style="font-size:11px;font-weight:700;color:#06b6d4;letter-spacing:1px;">GLOBAL RAMIFICATIONS</span>
        </div>
        <div style="font-size:11px;color:#c9cdd4;line-height:1.7;padding:8px 12px 12px;letter-spacing:0.01em;">
          ${ramifications}
        </div>
      </div>
    `;
  }

  return html;
}

// Toggle past briefing dropdown in Brief tab
function toggleBriefDropdown(id) {
  const el = document.getElementById(id);
  const arrow = document.getElementById(id + '-arrow');
  if (el) {
    const isOpen = el.style.maxHeight && el.style.maxHeight !== '0px';
    el.style.maxHeight = isOpen ? '0px' : el.scrollHeight + 'px';
    el.style.opacity = isOpen ? '0' : '1';
    if (arrow) arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
  }
}

// Render the newsletter / Brief tab
function renderNewsletter() {
  const now = new Date();
  const timeUntil = getTimeUntilNewsletter();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Build header — always visible, countdown inline when pending
  let html = `
    <div class="newsletter-header">
      <div class="newsletter-title">DAILY INTELLIGENCE BRIEFING</div>
      <div class="newsletter-meta">`;

  if (timeUntil) {
    // Before 5pm EST — show PENDING status with inline countdown
    html += `
        <span class="newsletter-status pending"><span style="display:inline-block;width:6px;height:6px;background:#f59e0b;border-radius:50%;margin-right:4px;"></span>PENDING</span>
        <span>Released daily at 5:00 PM EST</span>
        <span style="font-size:9px;color:#f59e0b;font-weight:600;font-family:monospace;background:rgba(245,158,11,0.1);padding:2px 6px;border-radius:4px;margin-left:4px;">Next in ${String(timeUntil.hours).padStart(2, '0')}:${String(timeUntil.minutes).padStart(2, '0')}</span>`;
  } else {
    // After 5pm EST — show LIVE status
    html += `
        <span class="newsletter-status live"><span style="display:inline-block;width:6px;height:6px;background:#22c55e;border-radius:50%;margin-right:4px;animation:pulse 1.5s infinite;"></span>LIVE</span>
        <span>${dateStr}</span>`;
  }

  html += `
      </div>
    </div>
  `;

  // Always show current briefing content (whether pending or live)
  html += renderBriefingContent(DAILY_BRIEFING);

  // Footer for current briefing
  html += `
    <div style="text-align:center;padding:12px;margin-top:8px;border-top:1px solid #1f2937;">
      <div style="font-size:9px;color:#6b7280;">Compiled from ${DAILY_BRIEFING.length} sources</div>
    </div>
  `;

  // Past briefings as collapsible dropdowns
  const pastBriefings = getPastBriefings();
  if (pastBriefings.length > 0) {
    html += `<div style="margin-top:6px;border-top:1px solid #1f2937;padding-top:12px;">
      <div style="font-size:9px;color:#6b7280;font-weight:600;letter-spacing:1px;margin-bottom:10px;padding:0 4px;">PREVIOUS BRIEFINGS</div>`;

    pastBriefings.forEach((briefing, index) => {
      const id = 'brief-history-' + index;
      const dateLabel = formatBriefingDate(briefing.date);
      const articleCount = briefing.articles ? briefing.articles.length : 0;

      html += `
        <div style="margin-bottom:8px;border:1px solid #1f2937;border-radius:8px;overflow:hidden;background:#0d0d14;">
          <div onclick="toggleBriefDropdown('${id}')" style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;cursor:pointer;transition:background 0.2s;background:#0d0d14;" onmouseover="this.style.background='#131320'" onmouseout="this.style.background='#0d0d14'">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:11px;font-weight:600;color:#9ca3af;">${dateLabel}'s Brief</span>
              <span style="font-size:8px;color:#6b7280;background:#1f2937;padding:2px 6px;border-radius:4px;">${articleCount} articles</span>
            </div>
            <span id="${id}-arrow" style="color:#6b7280;font-size:10px;transition:transform 0.3s ease;">▼</span>
          </div>
          <div id="${id}" style="max-height:0px;opacity:0;overflow:hidden;transition:max-height 0.4s ease, opacity 0.3s ease;">
            ${renderBriefingContent(briefing.articles)}
          </div>
        </div>`;
    });

    html += `</div>`;
  }

  return html;
}

// DAILY BRIEFING
// Fallback static news (used if API fails)