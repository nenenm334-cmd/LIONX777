const https = require('https');
const { sendJson, sendBuffer, setCors, checkAuth, rateLimit } = require('./_helpers');

const MAX_TEXT = 300;

module.exports = async function handler(req, res) {
  setCors(res, req.headers?.origin);
  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }
  if (req.method !== 'GET') { sendJson(res, 405, { error: 'Method not allowed' }); return; }

  // Rate limit: 20 req/min per IP
  const ip = req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (!rateLimit(ip, 'tts', { max: 20, windowMs: 60000 })) {
    sendJson(res, 429, { error: 'Too many requests' }); return;
  }

  if (!checkAuth(req, res)) return;

  const text = String(req.query?.text || '').trim();
  if (!text) { sendJson(res, 400, { error: 'Missing text' }); return; }
  if (text.length > MAX_TEXT) { sendJson(res, 400, { error: 'Text too long' }); return; }

  // Sanitize: only allow Arabic, English, spaces, and basic punctuation
  const safe = text.replace(/[^\u0600-\u06FF\u0750-\u077Fa-zA-Z0-9\s.,!?;:'"\-()]/g, '');
  if (!safe) { sendJson(res, 400, { error: 'Invalid text' }); return; }

  const url = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=ar&client=tw-ob&q=' + encodeURIComponent(safe);

  try {
    const audioData = await new Promise((resolve, reject) => {
      const r = https.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 10000
      }, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error('upstream error'));
          return;
        }
        const chunks = [];
        response.on('data', chunk => chunks.push(chunk));
        response.on('end', () => resolve(Buffer.concat(chunks)));
        response.on('error', () => reject(new Error('upstream error')));
      });
      r.on('error', () => reject(new Error('upstream error')));
      r.on('timeout', () => { r.destroy(); reject(new Error('upstream error')); });
    });

    res.setHeader('Cache-Control', 'public, max-age=86400');
    sendBuffer(res, 200, audioData, 'audio/mpeg');
  } catch (e) {
    sendJson(res, 502, { error: 'TTS unavailable' });
  }
};
