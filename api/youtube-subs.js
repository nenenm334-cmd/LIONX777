const { sendJson, setCors, checkAuth, rateLimit, validVideoId } = require('./_helpers');
let _cachedClient = null;
async function getDb() {
  if (_cachedClient) {
    try { await _cachedClient.db().command({ ping: 1 }); return _cachedClient.db(process.env.DB_NAME || 'minbar'); }
    catch (e) { try { await _cachedClient.close(); } catch (x) {} _cachedClient = null; }
  }
  _cachedClient = await new (require('mongodb').MongoClient)(process.env.MONGO_URL).connect();
  return _cachedClient.db(process.env.DB_NAME || 'minbar');
}

module.exports = async function handler(req, res) {
  setCors(res, req.headers?.origin);
  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }
  if (req.method !== 'GET') { sendJson(res, 405, { error: 'Method not allowed' }); return; }

  // Rate limit: 15 req/min per IP
  const ip = req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (!rateLimit(ip, 'youtube-subs', { max: 15, windowMs: 60000 })) {
    sendJson(res, 429, { error: 'Too many requests' }); return;
  }

  if (!checkAuth(req, res)) return;

  const videoId = String(req.query?.videoId || '').trim();
  if (!videoId || !validVideoId(videoId)) {
    sendJson(res, 400, { error: 'Invalid videoId' }); return;
  }

  // Check cache
  try {
    const db = await getDb();
    const cached = await db.collection('kv_store').findOne({ key: 'subs_cache:' + videoId });
    if (cached?.value?.subs?.length) {
      sendJson(res, 200, { subs: cached.value.subs, cached: true });
      return;
    }
  } catch (e) {}

  const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
  let lastError = 'All methods failed';

  // Method 1: Embed page
  try {
    const r = await fetch('https://www.youtube.com/embed/' + videoId, {
      headers: { 'User-Agent': UA }
    });
    const html = await r.text();
    const ctIdx = html.indexOf('"captionTracks"');
    if (ctIdx > -1) {
      const colonIdx = html.indexOf(':', ctIdx);
      const arrStart = html.indexOf('[', colonIdx);
      let depth = 0, arrEnd = -1;
      for (let i = arrStart; i < html.length && i < arrStart + 10000; i++) {
        if (html[i] === '[') depth++;
        else if (html[i] === ']') { depth--; if (depth === 0) { arrEnd = i; break; } }
      }
      if (arrEnd > -1) {
        const tracks = JSON.parse(html.substring(arrStart, arrEnd + 1));
        const track = tracks.find(t => t.languageCode === 'ar') || tracks[0];
        if (track?.baseUrl) {
          const subs = await fetchSubs(track.baseUrl, UA, videoId);
          if (subs.length) { await cacheSubs(videoId, subs); sendJson(res, 200, { subs, source: 'embed' }); return; }
        }
      }
    }
  } catch (e) {}

  // Method 2: Watch page with consent cookie
  try {
    const r = await fetch('https://www.youtube.com/watch?v=' + videoId, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9', 'Cookie': 'CONSENT=PENDING+987; SOCS=CAISNQgDEitib3FfaWRlbnRpdHlmcm9udGVuZHVpc2Vydl8yMDIzMDgyOS4wN19wMRoCCG5yAA' }
    });
    const html = await r.text();
    const ctIdx = html.indexOf('"captionTracks"');
    if (ctIdx > -1) {
      const colonIdx = html.indexOf(':', ctIdx);
      const arrStart = html.indexOf('[', colonIdx);
      let depth = 0, arrEnd = -1;
      for (let i = arrStart; i < html.length && i < arrStart + 10000; i++) {
        if (html[i] === '[') depth++;
        else if (html[i] === ']') { depth--; if (depth === 0) { arrEnd = i; break; } }
      }
      if (arrEnd > -1) {
        const tracks = JSON.parse(html.substring(arrStart, arrEnd + 1));
        const track = tracks.find(t => t.languageCode === 'ar') || tracks[0];
        if (track?.baseUrl) {
          const subs = await fetchSubs(track.baseUrl, UA, videoId);
          if (subs.length) { await cacheSubs(videoId, subs); sendJson(res, 200, { subs, source: 'watch' }); return; }
        }
      }
    }
  } catch (e) {}

  // Method 3: innertube player API
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
      const subs = await fetchSubs(track.baseUrl, UA, videoId);
      if (subs.length) { await cacheSubs(videoId, subs); sendJson(res, 200, { subs, source: 'innertube' }); return; }
    }
  } catch (e) {}

  sendJson(res, 200, { subs: [], error: lastError });
};

async function fetchSubs(baseUrl, UA, videoId) {
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
