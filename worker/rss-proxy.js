// Cloudflare Worker: RSS Proxy + AI Event Summaries
// Deploy: wrangler deploy
// Environment variable required: ANTHROPIC_API_KEY

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

        // Build prompt for Claude — batch all events in one call for efficiency
        const eventDescriptions = events.map((event, i) => {
          const articles = event.articles || [];
          const articleList = articles.map(a =>
            `  - "${a.headline || a.title}" (${a.source || 'Unknown source'})`
          ).join('\n');

          return `EVENT ${i + 1}: "${event.headline}"
Category: ${event.category || 'WORLD'}
Sources (${articles.length}):
${articleList}`;
        }).join('\n\n');

        const prompt = `You are an intelligence analyst writing briefings for a geopolitical monitoring platform called Hegemon. Summarize each event below in 3-5 sentences.

For each event:
- Synthesize what happened across all sources
- If sources disagree or report different angles, note the discrepancy
- Focus on geopolitical significance — why does this matter for global stability?
- Use a professional, concise intelligence briefing tone
- Do NOT use markdown formatting, bullet points, or headers — write plain prose paragraphs

${eventDescriptions}

Respond with a JSON array of summaries, one per event, in the same order. Format:
[{"summary": "..."}, {"summary": "..."}, ...]

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
            max_tokens: 4096,
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
          // Extract JSON array — handle potential markdown code fences
          const jsonMatch = aiText.match(/\[[\s\S]*\]/);
          summaries = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
        } catch (parseErr) {
          console.error('Failed to parse AI response:', parseErr.message);
          summaries = [];
        }

        return new Response(
          JSON.stringify({ summaries }),
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
    // GET /stock?symbols=SYM1,SYM2 — Yahoo Finance proxy (avoids CORS)
    // ============================================================
    if (url.pathname === '/stock' && request.method === 'GET') {
      const symbols = url.searchParams.get('symbols');
      if (!symbols) {
        return new Response(
          JSON.stringify({ error: 'Missing symbols parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        // Fetch each symbol individually via v8 chart API
        const symList = symbols.split(',').map(s => s.trim()).filter(Boolean);
        const results = {};

        await Promise.all(symList.map(async (sym) => {
          try {
            const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=5d&interval=1d&includePrePost=false`;
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

            let closes = [];
            if (r.indicators?.quote?.[0]?.close) {
              closes = r.indicators.quote[0].close.filter(v => v !== null && v !== undefined);
            }

            results[sym] = {
              symbol: meta.symbol || sym,
              price,
              prevClose: prevClose || price,
              changePct: prevClose ? ((price - prevClose) / prevClose) * 100 : 0,
              shortName: meta.shortName || '',
              longName: meta.longName || '',
              sparkline: closes.length > 0 ? closes : [prevClose || price, price]
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
