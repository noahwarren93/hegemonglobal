// Hegemon Global RSS Proxy - Cloudflare Worker
// Replaces rss2json.com free tier. Handles all RSS feeds + prepares for Claude API summaries.
//
// Endpoints:
//   GET /rss?url=<encoded_rss_url>       → Fetch & parse RSS feed to JSON
//   POST /summarize                       → (Future) Claude API article summarization
//   GET /health                           → Health check
//
// Deploy: npx wrangler deploy
// Test:   https://rss-proxy.<your-subdomain>.workers.dev/rss?url=https://feeds.bbci.co.uk/news/world/rss.xml

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

// Allowed RSS feed domains (security: prevent open proxy abuse)
const ALLOWED_DOMAINS = [
  'news.google.com',
  'feeds.bbci.co.uk',
  'feeds.a.dj.com',
  'rss.nytimes.com',
  'www.dailymail.co.uk',
  'www.cgtn.com',
  'timesofindia.indiatimes.com',
  'tass.com',
  'www.scmp.com',
  // Previously broken feeds — now restored:
  'moxie.foxnews.com',
  'www.theguardian.com',
  'nypost.com',
  'thehill.com',
  'www.washingtontimes.com',
  // Future additions:
  'feeds.feedburner.com',
  'rss.cnn.com',
  'feeds.reuters.com',
  'www.aljazeera.com',
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // Route handling
    if (url.pathname === '/rss') {
      return handleRSS(url, env, ctx);
    }

    if (url.pathname === '/summarize' && request.method === 'POST') {
      return handleSummarize(request, env);
    }

    if (url.pathname === '/health') {
      return jsonResponse({ status: 'ok', service: 'hegemon-rss-proxy', timestamp: new Date().toISOString() });
    }

    // Batch endpoint: fetch multiple feeds at once
    if (url.pathname === '/batch' && request.method === 'POST') {
      return handleBatch(request, env, ctx);
    }

    return jsonResponse({ error: 'Not found. Use /rss?url=<feed_url>, /batch, /summarize, or /health' }, 404);
  }
};

// ============================================================
// RSS Feed Handler
// ============================================================

async function handleRSS(url, env, ctx) {
  const feedUrl = url.searchParams.get('url');

  if (!feedUrl) {
    return jsonResponse({ error: 'Missing ?url= parameter' }, 400);
  }

  // Validate domain
  let parsedUrl;
  try {
    parsedUrl = new URL(feedUrl);
  } catch {
    return jsonResponse({ error: 'Invalid URL' }, 400);
  }

  if (!ALLOWED_DOMAINS.includes(parsedUrl.hostname)) {
    return jsonResponse({ error: `Domain not allowed: ${parsedUrl.hostname}` }, 403);
  }

  try {
    // Check cache first (Cloudflare Cache API)
    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;
    let cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }
  } catch {
    // Cache miss or error, continue to fetch
  }

  try {
    // Fetch the RSS feed
    const feedResponse = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'HegemonGlobal/1.0 (RSS Aggregator; hegemonglobal.com)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      cf: {
        cacheTtl: 300,        // Cache at edge for 5 minutes
        cacheEverything: true,
      },
    });

    if (!feedResponse.ok) {
      return jsonResponse({
        error: `Feed returned ${feedResponse.status}`,
        feedUrl,
      }, 502);
    }

    const xml = await feedResponse.text();
    const parsed = parseRSSXML(xml);

    const response = jsonResponse({
      status: 'ok',
      feed: parsed.feed,
      items: parsed.items,
      itemCount: parsed.items.length,
    });

    // Cache successful responses for 5 minutes
    response.headers.set('Cache-Control', 'public, max-age=300');

    return response;

  } catch (error) {
    return jsonResponse({ error: `Fetch failed: ${error.message}`, feedUrl }, 500);
  }
}

// ============================================================
// Batch Handler - Fetch multiple feeds in parallel
// ============================================================

async function handleBatch(request, env, ctx) {
  try {
    const body = await request.json();
    const feeds = body.feeds; // Array of { url, source }

    if (!Array.isArray(feeds) || feeds.length === 0) {
      return jsonResponse({ error: 'Body must contain "feeds" array' }, 400);
    }

    if (feeds.length > 20) {
      return jsonResponse({ error: 'Max 20 feeds per batch' }, 400);
    }

    const results = await Promise.allSettled(
      feeds.map(async (feed) => {
        try {
          let parsedUrl;
          try {
            parsedUrl = new URL(feed.url);
          } catch {
            return { source: feed.source, error: 'Invalid URL', items: [] };
          }

          if (!ALLOWED_DOMAINS.includes(parsedUrl.hostname)) {
            return { source: feed.source, error: `Domain not allowed: ${parsedUrl.hostname}`, items: [] };
          }

          const feedResponse = await fetch(feed.url, {
            headers: {
              'User-Agent': 'HegemonGlobal/1.0 (RSS Aggregator; hegemonglobal.com)',
              'Accept': 'application/rss+xml, application/xml, text/xml, */*',
            },
            cf: { cacheTtl: 300, cacheEverything: true },
          });

          if (!feedResponse.ok) {
            return { source: feed.source, error: `HTTP ${feedResponse.status}`, items: [] };
          }

          const xml = await feedResponse.text();
          const parsed = parseRSSXML(xml);
          return { source: feed.source, items: parsed.items, feed: parsed.feed };

        } catch (error) {
          return { source: feed.source, error: error.message, items: [] };
        }
      })
    );

    const feedResults = results.map((r, i) => {
      if (r.status === 'fulfilled') return r.value;
      return { source: feeds[i].source, error: r.reason?.message || 'Unknown error', items: [] };
    });

    return jsonResponse({ status: 'ok', results: feedResults });

  } catch (error) {
    return jsonResponse({ error: `Batch failed: ${error.message}` }, 500);
  }
}

// ============================================================
// Summarize Handler (prepped for Claude API)
// ============================================================

async function handleSummarize(request, env) {
  // TODO: Wire up Claude API when ready
  // env.ANTHROPIC_API_KEY should be set as a Worker secret:
  //   npx wrangler secret put ANTHROPIC_API_KEY
  //
  // Expected request body:
  //   { "articles": [{ "title": "...", "description": "...", "url": "..." }] }
  //
  // Will call Claude API to generate 2-3 sentence geopolitical summaries.

  if (!env.ANTHROPIC_API_KEY) {
    return jsonResponse({
      error: 'Summarization not yet configured. Set ANTHROPIC_API_KEY as a Worker secret.',
      hint: 'Run: npx wrangler secret put ANTHROPIC_API_KEY'
    }, 501);
  }

  try {
    const body = await request.json();
    const articles = body.articles;

    if (!Array.isArray(articles) || articles.length === 0) {
      return jsonResponse({ error: 'Body must contain "articles" array' }, 400);
    }

    // Limit batch size
    const batch = articles.slice(0, 10);

    const summaries = await Promise.all(
      batch.map(async (article) => {
        try {
          const prompt = `You are a geopolitical analyst for Hegemon Global, a risk monitoring platform. Summarize this news article in 2-3 concise sentences focused on geopolitical implications, power dynamics, and risk factors. Be direct and analytical, not sensational.

Title: ${article.title}
Description: ${article.description || 'No description available.'}
Source: ${article.source || 'Unknown'}

Summary:`;

          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': env.ANTHROPIC_API_KEY,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: 'claude-sonnet-4-20250514',
              max_tokens: 150,
              messages: [{ role: 'user', content: prompt }],
            }),
          });

          if (!response.ok) {
            const errText = await response.text();
            return { title: article.title, summary: null, error: `API ${response.status}: ${errText}` };
          }

          const data = await response.json();
          const summary = data.content?.[0]?.text?.trim() || null;
          return { title: article.title, summary, url: article.url };

        } catch (error) {
          return { title: article.title, summary: null, error: error.message };
        }
      })
    );

    return jsonResponse({ status: 'ok', summaries });

  } catch (error) {
    return jsonResponse({ error: `Summarize failed: ${error.message}` }, 500);
  }
}

// ============================================================
// RSS XML Parser (no dependencies — runs on Workers runtime)
// ============================================================

function parseRSSXML(xml) {
  const feed = {
    title: extractTag(xml, 'title'),
    link: extractTag(xml, 'link'),
    description: extractTag(xml, 'description'),
  };

  const items = [];

  // Handle both RSS <item> and Atom <entry>
  const isAtom = xml.includes('<feed') && xml.includes('<entry');
  const itemTag = isAtom ? 'entry' : 'item';
  const itemRegex = new RegExp(`<${itemTag}[^>]*>([\\s\\S]*?)<\\/${itemTag}>`, 'gi');

  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    let link;
    if (isAtom) {
      // Atom uses <link href="..."/>
      const linkMatch = itemXml.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/);
      link = linkMatch ? linkMatch[1] : extractTag(itemXml, 'link');
    } else {
      link = extractTag(itemXml, 'link');
    }

    const pubDate = extractTag(itemXml, 'pubDate')
      || extractTag(itemXml, 'published')
      || extractTag(itemXml, 'dc:date')
      || extractTag(itemXml, 'updated')
      || '';

    const description = extractTag(itemXml, 'description')
      || extractTag(itemXml, 'summary')
      || extractTag(itemXml, 'content:encoded')
      || '';

    items.push({
      title: decodeEntities(extractTag(itemXml, 'title') || ''),
      description: decodeEntities(stripHTML(description)),
      link: link || '',
      pubDate: pubDate,
      guid: extractTag(itemXml, 'guid') || extractTag(itemXml, 'id') || link || '',
    });
  }

  return { feed, items };
}

// Extract content between XML tags
function extractTag(xml, tagName) {
  // Handle CDATA sections
  const cdataRegex = new RegExp(`<${tagName}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tagName}>`, 'i');
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();

  // Standard tag extraction
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

// Strip HTML tags from description
function stripHTML(html) {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

// Decode common XML/HTML entities
function decodeEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&apos;/g, "'");
}

// ============================================================
// Helpers
// ============================================================

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}
