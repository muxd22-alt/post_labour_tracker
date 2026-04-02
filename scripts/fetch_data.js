// fetch_data.js — Runs in GitHub Actions with secrets
// Fetches RSS, GNews, OpenRouter AI analysis → writes docs/data.json

const fs = require('fs');
const path = require('path');

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || '';
const GNEWS_KEY = process.env.GNEWS_API_KEY || '';
const RSS_PROXY = 'https://api.rss2json.com/api.json?rss_url=';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const AI_MODEL = 'qwen/qwen3.6-plus-preview:free';
const GNEWS_BASE = 'https://gnews.io/api/v4/search';

const ERA_START = new Date('2026-03-31T00:00:00');

// RSS feed URLs
const FEEDS = [
    { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', category: 'threat', label: 'TechCrunch' },
    { url: 'https://www.theverge.com/rss/ai/index.xml', category: 'threat', label: 'The Verge' },
    { url: 'https://news.mit.edu/topic/mitartificial-intelligence2-rss.xml', category: 'hope', label: 'MIT News' },
    { url: 'https://feeds.arstechnica.com/arstechnica/technology-lab', category: 'threat', label: 'Ars Technica' },
];

// Fetch RSS — returns ALL items from AI-related feeds (they're already topic-filtered by the feed URL)
async function fetchRSS(feedUrl, label, maxItems = 6) {
    try {
        const r = await fetch(RSS_PROXY + encodeURIComponent(feedUrl));
        const text = await r.text();
        let d;
        try { d = JSON.parse(text); } catch { console.warn(`  RSS parse failed for ${label}`); return []; }

        if (d.status === 'ok' && d.items && d.items.length > 0) {
            console.log(`  ${label}: ${d.items.length} total items from feed`);
            return d.items.slice(0, maxItems).map(i => ({
                title: i.title,
                date: i.pubDate,
                source: label,
                link: i.link || ''
            }));
        } else {
            console.warn(`  ${label}: status=${d.status}, items=${d.items?.length || 0}`);
        }
    } catch (e) { console.warn(`  ${label}: fetch error — ${e.message}`); }
    return [];
}

// Fetch GNews
async function fetchGNews(query, label, maxItems = 5) {
    if (!GNEWS_KEY) return [];
    try {
        const url = `${GNEWS_BASE}?q=${encodeURIComponent(query)}&lang=en&max=${maxItems}&apikey=${GNEWS_KEY}`;
        const r = await fetch(url);
        const d = await r.json();
        if (d.articles && d.articles.length > 0) {
            console.log(`  GNews "${label}": ${d.articles.length} articles`);
            return d.articles.map(a => ({
                title: a.title,
                date: a.publishedAt,
                source: `GNews: ${a.source?.name || 'Unknown'}`,
                link: a.url || ''
            }));
        } else {
            console.warn(`  GNews "${label}": no articles. Response:`, JSON.stringify(d).slice(0, 150));
        }
    } catch (e) { console.warn(`  GNews "${label}": error — ${e.message}`); }
    return [];
}

// Run AI analysis via OpenRouter
async function runAIAnalysis(threatHeadlines, hopeHeadlines) {
    if (!OPENROUTER_KEY) {
        console.warn('!! OPENROUTER_API_KEY is empty/missing — skipping AI');
        return null;
    }
    console.log(`  Key starts with: ${OPENROUTER_KEY.slice(0, 12)}...`);

    const now = new Date();
    const dayNum = Math.max(1, Math.ceil((now - ERA_START) / 86400000));

    const threatList = threatHeadlines.length > 0
        ? threatHeadlines.slice(0, 10).map(h => `- ${h}`).join('\n')
        : '- No specific threat signals collected today, but AI automation continues to accelerate globally';

    const hopeList = hopeHeadlines.length > 0
        ? hopeHeadlines.slice(0, 10).map(h => `- ${h}`).join('\n')
        : '- No specific safety-net signals collected today. UBI and sovereign wealth fund discussions continue.';

    const prompt = `You are an analyst tracking the global transition to a post-labour economy. Today is Day ${dayNum} of the transition era (starting March 31, 2026). The year is 2026.

Today's THREAT signals (AI replacing jobs, automation pressure):
${threatList}

Today's HOPE signals (UBI, wealth funds, safety nets):
${hopeList}

Provide a brief daily analysis (3-4 paragraphs):
1. What do today's signals tell us about the pace of obsolescence?
2. How are safety-net mechanisms responding?
3. Your assessment: is the transition accelerating, stable, or decelerating?
4. One thing to watch for tomorrow.

Be concise, analytical, and grounded. No hype. Write in plain text, no markdown formatting.`;

    try {
        console.log(`  Calling OpenRouter with model: ${AI_MODEL}`);
        const r = await fetch(OPENROUTER_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://github.com/muxd22-alt/post_labour_tracker',
                'X-Title': 'Convergence Dashboard'
            },
            body: JSON.stringify({
                model: AI_MODEL,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 800,
                temperature: 0.7
            })
        });

        const responseText = await r.text();
        console.log(`  OpenRouter HTTP ${r.status}`);

        let d;
        try { d = JSON.parse(responseText); } catch {
            console.warn('  OpenRouter returned non-JSON:', responseText.slice(0, 200));
            return null;
        }

        if (d.error) {
            console.warn('  OpenRouter API error:', JSON.stringify(d.error).slice(0, 200));
            return null;
        }

        const text = d.choices?.[0]?.message?.content;
        if (text) {
            console.log(`  AI analysis received: ${text.length} chars`);
            return { text, model: AI_MODEL, timestamp: now.toISOString() };
        }
        console.warn('  AI response had no content:', JSON.stringify(d).slice(0, 300));
    } catch (e) { console.warn('  OpenRouter fetch error:', e.message); }
    return null;
}

async function main() {
    console.log('=== Convergence Dashboard Data Fetch ===');
    console.log('Time:', new Date().toISOString());
    console.log('OpenRouter key:', OPENROUTER_KEY ? `present (${OPENROUTER_KEY.length} chars)` : '!! MISSING !!');
    console.log('GNews key:', GNEWS_KEY ? `present (${GNEWS_KEY.length} chars)` : 'not set (optional)');

    // 1. Fetch ALL RSS feeds
    console.log('\n--- RSS Feeds ---');
    const rssResults = {};
    for (const feed of FEEDS) {
        const items = await fetchRSS(feed.url, feed.label);
        if (!rssResults[feed.category]) rssResults[feed.category] = [];
        rssResults[feed.category].push(...items);
    }
    console.log(`Total threat RSS: ${rssResults.threat?.length || 0}`);
    console.log(`Total hope RSS: ${rssResults.hope?.length || 0}`);

    // 2. Fetch GNews
    console.log('\n--- GNews ---');
    if (!GNEWS_KEY) {
        console.log('Skipping GNews (no API key)');
    }
    const [gThreat, gHope] = await Promise.all([
        fetchGNews('artificial intelligence automation jobs', 'AI threat'),
        fetchGNews('universal basic income sovereign wealth fund', 'safety net')
    ]);

    // 3. Combine feeds
    const allThreat = [...(rssResults.threat || []), ...gThreat];
    const allHope = [...(rssResults.hope || []), ...gHope];

    // Use threat items also for obsolescence feed, hope for abundance
    const obsolescence = allThreat.slice(0, 6);
    const abundance = allHope.slice(0, 6);

    // Combine headlines for AI
    const allThreatHeadlines = allThreat.map(i => i.title);
    const allHopeHeadlines = allHope.map(i => i.title);

    console.log(`\nHeadlines for AI — threat: ${allThreatHeadlines.length}, hope: ${allHopeHeadlines.length}`);

    // 4. Run AI analysis (always attempt, even with empty feeds)
    console.log('\n--- AI Analysis ---');
    const ai = await runAIAnalysis(allThreatHeadlines, allHopeHeadlines);
    console.log(ai ? `AI done (${ai.text.length} chars)` : '!! AI analysis failed !!');

    // 5. Build output
    const data = {
        generated: new Date().toISOString(),
        feeds: {
            threat: allThreat.slice(0, 8),
            hope: allHope.slice(0, 8),
            obsolescence: obsolescence,
            abundance: abundance
        },
        ai: ai
    };

    // 6. Write to docs/data.json
    const outPath = path.join(__dirname, '..', 'docs', 'data.json');
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
    const size = (fs.statSync(outPath).size / 1024).toFixed(1);
    console.log(`\nWrote ${outPath} (${size} KB)`);
    console.log('Feed counts:', {
        threat: data.feeds.threat.length,
        hope: data.feeds.hope.length,
        obsolescence: data.feeds.obsolescence.length,
        abundance: data.feeds.abundance.length,
        ai: !!data.ai
    });
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
