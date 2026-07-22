const { YoutubeTranscript } = require('youtube-transcript');
const { MongoClient } = require('mongodb');
const { sendJson, setCors, checkAuth, rateLimit, validVideoId, readBody } = require('./_helpers');

const DB_NAME = process.env.DB_NAME || 'minbar';

let client = null;
async function getClient() {
  if (client) {
    try { await client.db().command({ ping: 1 }); return client; }
    catch (e) { try { await client.close(); } catch (x) {} client = null; }
  }
  if (!process.env.MONGO_URL) throw new Error('MONGO_URL is not configured');
  client = new MongoClient(process.env.MONGO_URL, { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000 });
  await client.connect();
  return client;
}

module.exports = async (req, res) => {
  setCors(res, req.headers?.origin);
  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }
  if (req.method !== 'POST') { sendJson(res, 405, { error: 'Method not allowed' }); return; }

  // Rate limit: 10 req/min per IP
  const ip = req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (!rateLimit(ip, 'quick-extract', { max: 10, windowMs: 60000 })) {
    sendJson(res, 429, { error: 'Too many requests' }); return;
  }

  if (!checkAuth(req, res)) return;

  let body;
  try { body = await readBody(req, 1048576); }
  catch (e) { sendJson(res, 400, { error: 'Invalid request' }); return; }

  const { action } = body;

  if (action === 'extract') {
    const videoId = String(body.videoId || '').trim();
    if (!videoId || !validVideoId(videoId)) {
      sendJson(res, 400, { error: 'Invalid videoId' }); return;
    }
    try {
      const raw = await YoutubeTranscript.fetchTranscript(videoId);
      if (!raw || !raw.length) { sendJson(res, 200, { subs: [], lang: null }); return; }
      const subs = raw.map(s => ({
        start: (s.offset || 0) / 1000,
        dur: (s.duration || 0) / 1000,
        text: (s.text || '').replace(/\n/g, ' ').trim(),
        translation: '',
        words: []
      }));
      sendJson(res, 200, { subs, lang: raw[0]?.lang || null });
    } catch (e) {
      sendJson(res, 200, { subs: [], error: 'Transcript not available' });
    }
    return;
  }

  if (action === 'save') {
    const { videoId, dayNumber, subs, title, channel, thumbnail } = body;
    if (!videoId || !validVideoId(videoId)) {
      sendJson(res, 400, { error: 'Invalid videoId' }); return;
    }
    if (!subs || !Array.isArray(subs)) {
      sendJson(res, 400, { error: 'subs must be an array' }); return;
    }
    const day = Math.max(1, Math.min(365, parseInt(dayNumber) || 1));
    try {
      const db = (await getClient()).db(DB_NAME);
      const now = new Date().toISOString();

      // Sanitize subs - only keep known fields
      const cleanSubs = subs.slice(0, 500).map(s => ({
        start: Number(s.start) || 0,
        dur: Number(s.dur) || 0,
        text: String(s.text || '').slice(0, 500),
        translation: String(s.translation || '').slice(0, 500),
        words: Array.isArray(s.words) ? s.words.slice(0, 20).map(w => ({
          word: String(w.word || '').slice(0, 100),
          meaning: String(w.meaning || '').slice(0, 200),
          definition: String(w.definition || '').slice(0, 200),
          root: String(w.root || '').slice(0, 50),
          level: String(w.level || '').slice(0, 5),
          pronunciation: String(w.pronunciation || '').slice(0, 100)
        })) : []
      }));

      const lessonData = {};
      lessonData[day] = {
        videoId,
        title: String(title || '').slice(0, 200),
        channel: String(channel || '').slice(0, 200),
        thumbnail: String(thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`).slice(0, 500),
        dayNumber: day, subs: cleanSubs, vocab: [], quiz: [], createdAt: Date.now(), processed: false
      };
      await db.collection('kv_store').updateOne(
        { key: 'lessonsData' },
        { $set: { key: 'lessonsData', value: lessonData, updated_at: now }, $setOnInsert: { created_at: now } },
        { upsert: true }
      );
      const journeyData = {};
      journeyData[day] = `https://www.youtube.com/watch?v=${videoId}`;
      await db.collection('kv_store').updateOne(
        { key: 'journeyVideos' },
        { $set: { key: 'journeyVideos', value: journeyData, updated_at: now }, $setOnInsert: { created_at: now } },
        { upsert: true }
      );
      sendJson(res, 200, { ok: true, day, subsCount: cleanSubs.length });
    } catch (e) {
      console.error('[quick-extract] save error:', e);
      sendJson(res, 500, { error: 'Failed to save' });
    }
    return;
  }

  sendJson(res, 400, { error: 'Unknown action' });
};
