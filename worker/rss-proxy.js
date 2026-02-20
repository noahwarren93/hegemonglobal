// Cloudflare Worker: RSS Proxy + AI Event Summaries
// Deploy: wrangler deploy
// Environment variable required: ANTHROPIC_API_KEY

// ============================================================
// In-memory summary cache — all users see the same headlines
// Keyed by hash of article titles, expires after 1 hour
// Also backed by Cloudflare Cache API for persistence across cold starts
// ============================================================
const SUMMARY_CACHE = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function hashEventTitles(event) {
  const titles = (event.articles || [])
    .map(a => (a.headline || a.title || '').toLowerCase().trim().substring(0, 50))
    .sort()
    .join('|');
  let h = 0;
  for (let i = 0; i < titles.length; i++) {
    h = ((h << 5) - h + titles.charCodeAt(i)) | 0;
  }
  return 'sc_' + Math.abs(h).toString(36);
}

function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, entry] of SUMMARY_CACHE) {
    if (now - entry.ts > CACHE_TTL) SUMMARY_CACHE.delete(key);
  }
}

// Cloudflare Cache API helpers — persistent across cold starts
const CACHE_URL_PREFIX = 'https://hegemon-cache.internal/summary/';

async function getCacheApi(key) {
  try {
    const cache = caches.default;
    const resp = await cache.match(new Request(CACHE_URL_PREFIX + key));
    if (!resp) return null;
    const data = await resp.json();
    if (Date.now() - data.ts > CACHE_TTL) return null;
    return data;
  } catch { return null; }
}

async function setCacheApi(key, data) {
  try {
    const cache = caches.default;
    const resp = new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'max-age=3600' }
    });
    await cache.put(new Request(CACHE_URL_PREFIX + key), resp);
  } catch { /* best effort */ }
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://hegemonglobal.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

// Also allow localhost for development
function getCorsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const headers = { ...CORS_HEADERS };
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = getCorsHeaders(request);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // ============================================================
    // POST /summarize — AI event summaries via Claude API
    // ============================================================
    if (url.pathname === '/summarize' && request.method === 'POST') {
      try {
        const apiKey = env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          return new Response(
            JSON.stringify({ error: 'API key not configured' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const body = await request.json();
        const events = body.events;

        if (!events || !Array.isArray(events) || events.length === 0) {
          return new Response(
            JSON.stringify({ error: 'No events provided' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Clean expired cache entries
        cleanExpiredCache();

        // Check cache for each event — memory first, then Cache API, only call Claude for uncached
        const results = new Array(events.length).fill(null);
        const uncachedIndices = [];

        for (let i = 0; i < events.length; i++) {
          const key = hashEventTitles(events[i]);
          // Check in-memory cache first
          const memCached = SUMMARY_CACHE.get(key);
          if (memCached && (Date.now() - memCached.ts < CACHE_TTL)) {
            results[i] = memCached.data;
            continue;
          }
          // Check persistent Cache API
          const apiCached = await getCacheApi(key);
          if (apiCached) {
            results[i] = apiCached.data;
            // Re-hydrate in-memory cache
            SUMMARY_CACHE.set(key, apiCached);
            continue;
          }
          uncachedIndices.push(i);
        }

        const cacheHits = events.length - uncachedIndices.length;
        if (cacheHits > 0) {
          console.log(`[Cache] ${cacheHits}/${events.length} events served from cache`);
        }

        // If everything is cached, return immediately (no Claude API call)
        if (uncachedIndices.length === 0) {
          return new Response(
            JSON.stringify({ summaries: results }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Build prompt only for uncached events
        const uncachedEvents = uncachedIndices.map(i => events[i]);
        const eventDescriptions = uncachedEvents.map((event, i) => {
          const articles = event.articles || [];
          const articleList = articles.slice(0, 10).map(a => {
            let line = `  - "${a.headline || a.title}" (${a.source || 'Unknown source'})`;
            if (a.description) {
              const desc = a.description.replace(/<[^>]+>/g, '').trim().substring(0, 200);
              if (desc.length > 20) line += `\n    Context: ${desc}`;
            }
            return line;
          }).join('\n');

          return `EVENT ${i + 1}: "${event.headline}"
Category: ${event.category || 'WORLD'}
Sources (${articles.length}):
${articleList}`;
        }).join('\n\n');

        const prompt = `You are a headline writer and intelligence analyst for a geopolitical monitoring platform called Hegemon.

For each event below, provide TWO things:

1. HEADLINE: A short, punchy newspaper-style headline. STRICT RULES:
   - MAXIMUM 10-12 words. Count them. If over 12, cut words.
   - Write like a newspaper front page: dramatic, engaging, active verbs.
   - Never start with titles ("President Trump" → "Trump", "Prime Minister" → just the name).
   - Include specific details (dollar amounts, country names, key actions).
   - Good: "Board of Peace Convenes, Raises $7 Billion for Gaza"
   - Good: "Will the US Go to War With Iran?"
   - Good: "UN Finds Hallmarks of Genocide in Sudan's El-Fasher"
   - Good: "Russia-Ukraine War Rages On, Day 1,457"
   - Bad: "Trump convened the inaugural Board of Peace meeting with nine member nations..." (too long, starts with full name)
   - Bad: "President Trump warns Iran about nuclear deal deadline as military forces deploy" (too long, has title)

2. SUMMARY: A structured analysis with exactly three sections, each 1-2 sentences:

**What happened:** [Key facts — what occurred, who was involved, what actions were taken.]

**Why it matters:** [Geopolitical significance — strategic implications, regional stability, global order.]

**Outlook:** [Next steps — what to watch for, escalation or resolution paths.]

CRITICAL RULES:
- NEVER say "limited reporting", "insufficient information", or similar cop-outs.
- Write substantive analysis even for single-source events.
- Use "Context:" lines to extract specific facts, numbers, and details.
- Every summary MUST be substantive and informative.
- Keep each section to 1-2 sentences. Total: 3-6 sentences.

${eventDescriptions}

Respond with a JSON array, one per event, in the same order. Format:
[{"headline": "Short Punchy Headline Here", "summary": "**What happened:** ... **Why it matters:** ... **Outlook:** ..."}, ...]

Return ONLY the JSON array, no other text.`;

        const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 8192,
            messages: [{
              role: 'user',
              content: prompt
            }]
          })
        });

        if (!anthropicResponse.ok) {
          const errText = await anthropicResponse.text();
          console.error('Anthropic API error:', errText);
          return new Response(
            JSON.stringify({ error: 'AI API error', details: anthropicResponse.status }),
            { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const aiData = await anthropicResponse.json();
        const aiText = aiData.content?.[0]?.text || '';

        // Parse the JSON array from the response
        let summaries;
        try {
          const jsonMatch = aiText.match(/\[[\s\S]*\]/);
          summaries = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
        } catch (parseErr) {
          console.error('Failed to parse AI response:', parseErr.message);
          summaries = [];
        }

        // Merge uncached results back into the full results array and cache them
        for (let i = 0; i < uncachedIndices.length; i++) {
          const origIdx = uncachedIndices[i];
          const summary = summaries[i] || null;
          results[origIdx] = summary;

          // Cache the result (in-memory + persistent Cache API)
          if (summary) {
            const key = hashEventTitles(events[origIdx]);
            const cacheEntry = { data: summary, ts: Date.now() };
            SUMMARY_CACHE.set(key, cacheEntry);
            setCacheApi(key, cacheEntry);
          }
        }

        return new Response(
          JSON.stringify({ summaries: results }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (err) {
        console.error('Summarize error:', err);
        return new Response(
          JSON.stringify({ error: 'Internal error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ============================================================
    // GET /rss?url= — RSS feed proxy (replaces rss2json for broken feeds)
    // ============================================================
    if (url.pathname === '/rss' && request.method === 'GET') {
      const feedUrl = url.searchParams.get('url');

      if (!feedUrl) {
        return new Response(
          JSON.stringify({ error: 'Missing url parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        const feedResponse = await fetch(feedUrl, {
          headers: {
            'User-Agent': 'Hegemon-RSS-Proxy/1.0',
            'Accept': 'application/rss+xml, application/xml, text/xml, */*'
          },
          cf: { cacheTtl: 300 } // Cache for 5 minutes at Cloudflare edge
        });

        if (!feedResponse.ok) {
          return new Response(
            JSON.stringify({ error: 'Feed fetch failed', status: feedResponse.status }),
            { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const xmlText = await feedResponse.text();

        // Parse RSS/Atom XML into JSON
        const items = parseRSSXML(xmlText);

        return new Response(
          JSON.stringify({
            status: 'ok',
            feed: { url: feedUrl },
            items
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (err) {
        console.error('RSS proxy error:', err);
        return new Response(
          JSON.stringify({ error: 'RSS fetch error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ============================================================
    // GET /stock?symbols=SYM1,SYM2&range=5d&interval=1d — Yahoo Finance proxy
    // ============================================================
    if (url.pathname === '/stock' && request.method === 'GET') {
      const symbols = url.searchParams.get('symbols');
      if (!symbols) {
        return new Response(
          JSON.stringify({ error: 'Missing symbols parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Accept optional range and interval params
      const rangeParam = url.searchParams.get('range') || '5d';
      const intervalParam = url.searchParams.get('interval') || '1d';
      const VALID_RANGES = new Set(['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', 'ytd', 'max']);
      const VALID_INTERVALS = new Set(['1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h', '1d', '5d', '1wk', '1mo']);
      const safeRange = VALID_RANGES.has(rangeParam) ? rangeParam : '5d';
      const safeInterval = VALID_INTERVALS.has(intervalParam) ? intervalParam : '1d';

      try {
        const symList = symbols.split(',').map(s => s.trim()).filter(Boolean);
        const results = {};

        await Promise.all(symList.map(async (sym) => {
          try {
            const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=${safeRange}&interval=${safeInterval}&includePrePost=false`;
            const resp = await fetch(yahooUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0' },
              cf: { cacheTtl: 60 }
            });
            if (!resp.ok) return;
            const data = await resp.json();
            if (!data?.chart?.result?.[0]) return;

            const r = data.chart.result[0];
            const meta = r.meta;
            const price = meta.regularMarketPrice;
            const prevClose = meta.chartPreviousClose || meta.previousClose;
            if (!price) return;

            // Filter closes and timestamps together (remove null values)
            const rawCloses = r.indicators?.quote?.[0]?.close || [];
            const rawTimestamps = r.timestamp || [];
            const closes = [];
            const timestamps = [];
            for (let i = 0; i < rawCloses.length; i++) {
              if (rawCloses[i] !== null && rawCloses[i] !== undefined) {
                closes.push(rawCloses[i]);
                if (i < rawTimestamps.length) timestamps.push(rawTimestamps[i]);
              }
            }

            results[sym] = {
              symbol: meta.symbol || sym,
              price,
              prevClose: prevClose || price,
              changePct: prevClose ? ((price - prevClose) / prevClose) * 100 : 0,
              shortName: meta.shortName || '',
              longName: meta.longName || '',
              exchangeName: meta.fullExchangeName || meta.exchangeName || '',
              sparkline: closes.length > 0 ? closes : [prevClose || price, price],
              timestamps: timestamps.length > 0 ? timestamps : []
            };
          } catch (e) {
            console.warn(`Failed to fetch ${sym}:`, e.message);
          }
        }));

        return new Response(
          JSON.stringify({ quotes: results }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (err) {
        console.error('Stock proxy error:', err);
        return new Response(
          JSON.stringify({ error: 'Stock fetch error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ============================================================
    // 404 for unknown routes
    // ============================================================
    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

// ============================================================
// Simple RSS/Atom XML Parser (no dependencies)
// ============================================================

function parseRSSXML(xml) {
  const items = [];

  // Try RSS <item> elements first
  const rssItemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = rssItemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    items.push({
      title: extractTag(itemXml, 'title'),
      link: extractTag(itemXml, 'link') || extractAttr(itemXml, 'link', 'href'),
      description: extractTag(itemXml, 'description'),
      content: extractTag(itemXml, 'content:encoded') || extractTag(itemXml, 'content'),
      pubDate: extractTag(itemXml, 'pubDate') || extractTag(itemXml, 'dc:date'),
      source: extractTag(itemXml, 'source')
    });
  }

  // If no RSS items, try Atom <entry> elements
  if (items.length === 0) {
    const atomEntryRegex = /<entry[\s>]([\s\S]*?)<\/entry>/gi;
    while ((match = atomEntryRegex.exec(xml)) !== null) {
      const entryXml = match[1];
      items.push({
        title: extractTag(entryXml, 'title'),
        link: extractAttr(entryXml, 'link', 'href') || extractTag(entryXml, 'link'),
        description: extractTag(entryXml, 'summary') || extractTag(entryXml, 'content'),
        content: extractTag(entryXml, 'content'),
        pubDate: extractTag(entryXml, 'published') || extractTag(entryXml, 'updated'),
        source: ''
      });
    }
  }

  return items;
}

function extractTag(xml, tagName) {
  // Handle CDATA: <tag><![CDATA[content]]></tag>
  const cdataRegex = new RegExp(`<${tagName}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tagName}>`, 'i');
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();

  // Handle regular: <tag>content</tag>
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = xml.match(regex);
  if (match) return decodeXMLEntities(match[1].trim());

  return '';
}

function extractAttr(xml, tagName, attrName) {
  const regex = new RegExp(`<${tagName}[^>]*\\s${attrName}=["']([^"']+)["']`, 'i');
  const match = xml.match(regex);
  return match ? match[1] : '';
}

function decodeXMLEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}
