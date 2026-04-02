// fetch_data.js — Runs in GitHub Actions with secrets
// Fetches RSS, GNews, OpenRouter AI analysis → writes docs/data.json

const fs = require('fs');
const path = require('path');

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || '';
const GNEWS_KEY = process.env.GNEWS_API_KEY || '';
const RSS_PROXY = 'https://api.rss2json.com/api.json?rss_url=';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const AI_MODEL = 'qwen/qwen3-235b-a22b:free';
const GNEWS_BASE = 'https://gnews.io/api/v4/search';

const ERA_START = new Date('2026-03-31T00:00:00');

const FEEDS = {
    threat: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    hope: 'https://news.mit.edu/topic/mitartificial-intelligence2-news',
    obsSignals: 'https://www.theverge.com/rss/ai/index.xml',
    abuSignals: 'https://www.reutersagency.com/feed/?best-topics=tech-post&post_type=best'
};

const THREAT_TERMS = ['agent','autonomous','robot','automat','replac','layoff','workforce','benchmark','humanoid','llm','obsolete','agentic','ai model'];
const HOPE_TERMS = ['ubi','universal basic','wealth fund','esop','ownership','carbon dividend','safety net','post-scarcity','income','universal income'];
const OBS_TERMS = ['layoff','replac','automat','cut','AI productiv','workforce reduc','efficien','job loss','downsiz'];
const ABU_TERMS = ['ubi','wealth fund','carbon','energy','sovereign','universal income','post-scarcity','fusion','renewable'];

async function fetchRSS(url, terms, maxItems = 6) {
    try {
        const r = await fetch(RSS_PROXY + encodeURIComponent(url));
        const d = await r.json();
        if (d.status === 'ok') {
            return d.items
                .filter(i => terms.some(t => ((i.title || '') + ' ' + (i.description || '')).toLowerCase().includes(t)))
                .slice(0, maxItems)
                .map(i => ({ title: i.title, date: i.pubDate, source: 'RSS', link: i.link }));
        }
    } catch (e) { console.warn('RSS fetch failed for', url, e.message); }
    return [];
}

async function fetchGNews(query, maxItems = 5) {
    if (!GNEWS_KEY) { console.log('No GNEWS_API_KEY, skipping GNews'); return []; }
    try {
        const url = `${GNEWS_BASE}?q=${encodeURIComponent(query)}&lang=en&max=${maxItems}&apikey=${GNEWS_KEY}`;
        const r = await fetch(url);
        const d = await r.json();
        if (d.articles) {
            return d.articles.map(a => ({
                title: a.title,
                date: a.publishedAt,
                source: a.source?.name || 'GNews',
                link: a.url
            }));
        }
    } catch (e) { console.warn('GNews fetch failed:', e.message); }
    return [];
}

async function runAIAnalysis(threatHeadlines, hopeHeadlines) {
    if (!OPENROUTER_KEY) { console.log('No OPENROUTER_API_KEY, skipping AI analysis'); return null; }

    const now = new Date();
    const dayNum = Math.max(1, Math.ceil((now - ERA_START) / 86400000));

    const threatList = threatHeadlines.slice(0, 10).map(h => `- ${h}`).join('\n');
    const hopeList = hopeHeadlines.slice(0, 10).map(h => `- ${h}`).join('\n');

    const prompt = `You are an analyst tracking the global transition to a post-labour economy. Today is Day ${dayNum} of the transition (starting March 31, 2026).

Today's THREAT signals (AI replacing jobs, automation pressure):
${threatList || '- No threat signals collected today'}

Today's HOPE signals (UBI, wealth funds, safety nets):
${hopeList || '- No hope signals collected today'}

Provide a brief daily analysis (3-4 paragraphs):
1. What do today's signals tell us about the pace of obsolescence?
2. How are safety-net mechanisms responding?
3. Your assessment: is the transition accelerating, stable, or decelerating?
4. One thing to watch for tomorrow.

Be concise, analytical, and grounded. No hype.`;

    try {
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
        const d = await r.json();
        const text = d.choices?.[0]?.message?.content;
        if (text) return { text, model: AI_MODEL, timestamp: now.toISOString() };
        console.warn('AI response empty:', JSON.stringify(d).slice(0, 200));
    } catch (e) { console.warn('OpenRouter failed:', e.message); }
    return null;
}

async function main() {
    console.log('=== Convergence Dashboard Data Fetch ===');
    console.log('Time:', new Date().toISOString());
    console.log('OpenRouter key:', OPENROUTER_KEY ? 'present' : 'MISSING');
    console.log('GNews key:', GNEWS_KEY ? 'present' : 'MISSING');

    // 1. Fetch RSS feeds
    console.log('\n--- RSS Feeds ---');
    const [threatRSS, hopeRSS, obsRSS, abuRSS] = await Promise.all([
        fetchRSS(FEEDS.threat, THREAT_TERMS),
        fetchRSS(FEEDS.hope, HOPE_TERMS),
        fetchRSS(FEEDS.obsSignals, OBS_TERMS),
        fetchRSS(FEEDS.abuSignals, ABU_TERMS)
    ]);
    console.log(`Threat RSS: ${threatRSS.length} items`);
    console.log(`Hope RSS: ${hopeRSS.length} items`);
    console.log(`Obsolescence signals: ${obsRSS.length} items`);
    console.log(`Abundance signals: ${abuRSS.length} items`);

    // 2. Fetch GNews
    console.log('\n--- GNews ---');
    const [gThreat, gHope] = await Promise.all([
        fetchGNews('AI automation jobs replace workforce'),
        fetchGNews('universal basic income OR sovereign wealth fund OR employee ownership')
    ]);
    console.log(`GNews threat: ${gThreat.length} items`);
    console.log(`GNews hope: ${gHope.length} items`);

    // Combine all headlines for AI
    const allThreatHeadlines = [...threatRSS, ...obsRSS, ...gThreat].map(i => i.title);
    const allHopeHeadlines = [...hopeRSS, ...abuRSS, ...gHope].map(i => i.title);

    // 3. Run AI analysis
    console.log('\n--- AI Analysis ---');
    const ai = await runAIAnalysis(allThreatHeadlines, allHopeHeadlines);
    console.log(ai ? 'AI analysis generated' : 'AI analysis skipped/failed');

    // 4. Build output
    const data = {
        generated: new Date().toISOString(),
        feeds: {
            threat: [...threatRSS, ...gThreat.map(i => ({...i, source: `GNews: ${i.source}`}))],
            hope: [...hopeRSS, ...gHope.map(i => ({...i, source: `GNews: ${i.source}`}))],
            obsolescence: obsRSS,
            abundance: abuRSS
        },
        ai: ai
    };

    // 5. Write to docs/data.json
    const outPath = path.join(__dirname, '..', 'docs', 'data.json');
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
    console.log(`\nWrote ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
