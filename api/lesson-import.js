const { MongoClient } = require('mongodb');
const { sendJson, setCors, checkAuth, rateLimit, validVideoId, readBody } = require('./_helpers');

let _cachedClient = null;
async function getDb() {
  if (_cachedClient) {
    try { await _cachedClient.db().command({ ping: 1 }); return _cachedClient.db(process.env.DB_NAME || 'minbar'); }
    catch (e) { try { await _cachedClient.close(); } catch (x) {} _cachedClient = null; }
  }
  _cachedClient = await new MongoClient(process.env.MONGO_URL).connect();
  return _cachedClient.db(process.env.DB_NAME || 'minbar');
}

const MAX_BODY = 1048576; // 1MB

module.exports = async function handler(req, res) {
  setCors(res, req.headers?.origin);
  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }
  if (req.method !== 'POST') { sendJson(res, 405, { error: 'Method not allowed' }); return; }

  // Rate limit: 10 req/min per IP
  const ip = req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (!rateLimit(ip, 'lesson-import', { max: 10, windowMs: 60000 })) {
    sendJson(res, 429, { error: 'Too many requests' }); return;
  }

  if (!checkAuth(req, res)) return;

  let body;
  try { body = await readBody(req, MAX_BODY); }
  catch (e) { sendJson(res, 400, { error: 'Invalid request' }); return; }

  const { action } = body;

  // ── Fetch YouTube metadata via oEmbed ──
  if (action === 'fetchMeta') {
    const videoId = String(body.videoId || '').trim();
    if (!videoId || !validVideoId(videoId)) {
      sendJson(res, 400, { error: 'Invalid videoId' }); return;
    }
    try {
      const r = await fetch('https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=' + videoId + '&format=json', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (!r.ok) throw new Error('oEmbed failed');
      const d = await r.json();
      sendJson(res, 200, {
        videoId,
        title: String(d.title || '').slice(0, 200),
        channel: String(d.author_name || '').slice(0, 200),
        thumbnail: 'https://img.youtube.com/vi/' + videoId + '/maxresdefault.jpg'
      });
    } catch (e) {
      sendJson(res, 200, {
        videoId,
        title: '',
        channel: '',
        thumbnail: 'https://img.youtube.com/vi/' + videoId + '/hqdefault.jpg'
      });
    }
    return;
  }

  // ── Fetch subtitles ──
  if (action === 'fetchSubs') {
    const videoId = String(body.videoId || '').trim();
    if (!videoId || !validVideoId(videoId)) {
      sendJson(res, 400, { error: 'Invalid videoId' }); return;
    }

    // Check cache first
    try {
      const db = await getDb();
      const cached = await db.collection('kv_store').findOne({ key: 'subs_cache:' + videoId });
      if (cached?.value?.subs?.length) {
        sendJson(res, 200, { subs: cached.value.subs, source: 'cache' });
        return;
      }
    } catch (e) {}

    const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

    // Method 1: innertube player API
    try {
      const r = await fetch('https://www.youtube.com/youtubei/v1/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': UA },
        body: JSON.stringify({
          context: { client: { clientName: 'WEB', clientVersion: '2.20250715.00.00', hl: 'en', gl: 'US' } },
          videoId
        })
      });
      const data = await r.json();
      const captions = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
      if (captions?.length) {
        const track = captions.find(c => c.languageCode === 'ar') || captions[0];
        const subs = await extractSubs(track.baseUrl, UA, videoId);
        if (subs.length) { await cacheSubs(videoId, subs); sendJson(res, 200, { subs, source: 'innertube' }); return; }
      }
    } catch (e) {}

    // Method 2: Embed page
    try {
      const r = await fetch('https://www.youtube.com/embed/' + videoId, { headers: { 'User-Agent': UA } });
      const html = await r.text();
      const tracks = extractCaptionTracks(html);
      if (tracks) {
        const track = tracks.find(t => t.languageCode === 'ar') || tracks[0];
        if (track?.baseUrl) {
          const subs = await extractSubs(track.baseUrl, UA, videoId);
          if (subs.length) { await cacheSubs(videoId, subs); sendJson(res, 200, { subs, source: 'embed' }); return; }
        }
      }
    } catch (e) {}

    // Method 3: Watch page
    try {
      const r = await fetch('https://www.youtube.com/watch?v=' + videoId, {
        headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9', 'Cookie': 'CONSENT=PENDING+987; SOCS=CAISNQgDEitib3FfaWRlbnRpdHlmcm9udGVuZHVpc2Vydl8yMDIzMDgyOS4wN19wMRoCCG5yAA' }
      });
      const html = await r.text();
      const tracks = extractCaptionTracks(html);
      if (tracks) {
        const track = tracks.find(t => t.languageCode === 'ar') || tracks[0];
        if (track?.baseUrl) {
          const subs = await extractSubs(track.baseUrl, UA, videoId);
          if (subs.length) { await cacheSubs(videoId, subs); sendJson(res, 200, { subs, source: 'watch' }); return; }
        }
      }
    } catch (e) {}

    sendJson(res, 200, { subs: [], error: 'Subtitles not available' });
    return;
  }

  // ── AI Process subtitles ──
  if (action === 'processAI') {
    const { subs, apiKey, title, provider } = body;

    // Validate inputs
    if (!apiKey || typeof apiKey !== 'string' || apiKey.length < 10) {
      sendJson(res, 400, { error: 'Invalid API key' }); return;
    }
    if (!subs || !Array.isArray(subs) || subs.length === 0) {
      sendJson(res, 400, { error: 'No subtitles provided' }); return;
    }

    // Limit subs count
    const limitedSubs = subs.slice(0, 120);
    const totalLines = subs.length;

    const subText = limitedSubs.map((s, i) => `[${i}] (${Number(s.start).toFixed(1)}s) ${String(s.text || '').slice(0, 200)}`).join('\n');

    const prompt = `You are an expert Arabic language teacher creating an interactive lesson from YouTube video subtitles.

Video title: "${String(title || 'Arabic lesson').slice(0, 200)}"

Here are the Arabic subtitles with timestamps:
${subText}

Process these subtitles and return ONLY a valid JSON object (no markdown, no extra text) with this exact structure:
{
  "subs": [
    {
      "start": 0.0,
      "dur": 3.0,
      "text": "Arabic text",
      "translation": "English translation",
      "words": [
        { "word": "ArabicWord", "meaning": "English meaning", "definition": "Simple English definition", "root": "root letters", "level": "A1", "pronunciation": "transliteration" }
      ]
    }
  ],
  "vocab": [
    {
      "word": "Most important Arabic word",
      "meaning": "English meaning",
      "definition": "Simple English definition of the word",
      "pronunciation": "transliteration",
      "root": "root letters",
      "level": "A1",
      "example": "Example sentence in Arabic",
      "exampleEn": "Example translation",
      "category": "Greetings"
    }
  ],
  "quiz": [
    {
      "type": "mcq",
      "q": "What does 'X' mean?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0
    }
  ]
}

Rules:
- "subs": Process EVERY subtitle line. Keep original Arabic "text", add English "translation", and break into individual "words".
- "vocab": Extract the 15-20 most important vocabulary words.
- "quiz": Generate 5 questions: 3 MCQ, 1 fill-in-the-blank, 1 translation.
- Return ONLY the JSON object, nothing else.`;

    let content = '';
    try {
      if (provider === 'gemini') {
        // Pass API key in header instead of URL for security
        const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 16384 } })
        });
        if (!r.ok) { sendJson(res, 400, { error: 'AI API request failed' }); return; }
        const data = await r.json();
        content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } else {
        const r = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
          body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], temperature: 0.3, max_tokens: 16384 })
        });
        if (!r.ok) { sendJson(res, 400, { error: 'AI API request failed' }); return; }
        const data = await r.json();
        content = data.choices?.[0]?.message?.content || '';
      }
      if (!content) { sendJson(res, 500, { error: 'AI returned empty response' }); return; }
      let jsonStr = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
      let result;
      try { result = JSON.parse(jsonStr); }
      catch (e1) {
        const start = jsonStr.indexOf('{');
        const end = jsonStr.lastIndexOf('}');
        if (start >= 0 && end > start) {
          try { result = JSON.parse(jsonStr.substring(start, end + 1)); }
          catch (e2) { sendJson(res, 500, { error: 'AI returned invalid JSON' }); return; }
        } else { sendJson(res, 500, { error: 'AI returned invalid JSON' }); return; }
      }
      if (totalLines > 120) result._warning = 'Only the first 120 of ' + totalLines + ' subtitle lines were processed.';
      result._totalLines = totalLines;
      sendJson(res, 200, result);
    } catch (e) {
      console.error('[lesson-import] AI error:', e);
      sendJson(res, 500, { error: 'AI processing failed' });
    }
    return;
  }

  sendJson(res, 400, { error: 'Unknown action' });
};

function extractCaptionTracks(html) {
  const ctIdx = html.indexOf('"captionTracks"');
  if (ctIdx === -1) return null;
  const colonIdx = html.indexOf(':', ctIdx);
  const arrStart = html.indexOf('[', colonIdx);
  let depth = 0, arrEnd = -1;
  for (let i = arrStart; i < html.length && i < arrStart + 10000; i++) {
    if (html[i] === '[') depth++;
    else if (html[i] === ']') { depth--; if (depth === 0) { arrEnd = i; break; } }
  }
  if (arrEnd === -1) return null;
  try { return JSON.parse(html.substring(arrStart, arrEnd + 1)); }
  catch (e) { return null; }
}

async function extractSubs(baseUrl, UA, videoId) {
  const sr = await fetch(baseUrl, { headers: { 'User-Agent': UA, 'Referer': 'https://www.youtube.com/watch?v=' + videoId } });
  const body = await sr.text();
  if (!body || body.length < 20) return [];
  const subs = [];
  const re = /<text start="([\d.]+)" dur="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const text = m[3].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/\n/g, ' ').trim();
    if (text) subs.push({ start: parseFloat(m[1]), dur: parseFloat(m[2]), text });
  }
  return subs;
}

async function cacheSubs(videoId, subs) {
  try {
    const db = await getDb();
    await db.collection('kv_store').updateOne(
      { key: 'subs_cache:' + videoId },
      { $set: { key: 'subs_cache:' + videoId, value: { subs }, updated_at: new Date().toISOString() } },
      { upsert: true }
    );
  } catch (e) {}
}
