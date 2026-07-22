const { sendJson, setCors, rateLimit, readBody, setSecurityHeaders } = require('./_helpers');

module.exports = async function handler(req, res) {
  setCors(res, req.headers?.origin);
  setSecurityHeaders(res);
  if (req.method === 'OPTIONS') return sendJson(res, 200, { ok: true });
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (!rateLimit(ip, 'transcribe', { max: 30, windowMs: 60000 })) {
    return sendJson(res, 429, { error: 'Too many requests' });
  }

  const apiKey = process.env.OPENAI_API_KEY || req.headers['x-openai-key'] || '';
  if (!apiKey) {
    return sendJson(res, 400, { error: 'OPENAI_API_KEY not set. Add to Vercel env or save in localStorage.' });
  }

  let body;
  try { body = await readBody(req, 12e6); } catch (e) { return sendJson(res, 400, { error: 'Invalid body' }); }

  var audioBase64 = body.audio;
  var mime = body.mime || 'audio/webm';
  if (!audioBase64) return sendJson(res, 400, { error: 'Missing audio' });

  try {
    var audioBuffer = Buffer.from(audioBase64, 'base64');
    var ext = mime.includes('mp4') ? 'm4a' : mime.includes('wav') ? 'wav' : mime.includes('ogg') ? 'ogg' : mime.includes('mp3') ? 'mp3' : 'webm';
    var boundary = '----boundary' + Date.now();
    var nl = '\r\n';
    var bodyParts = [];
    bodyParts.push(Buffer.from('--' + boundary + nl));
    bodyParts.push(Buffer.from('Content-Disposition: form-data; name="file"; filename="audio.' + ext + '"' + nl));
    bodyParts.push(Buffer.from('Content-Type: ' + mime + nl + nl));
    bodyParts.push(audioBuffer);
    bodyParts.push(Buffer.from(nl + '--' + boundary + nl));
    bodyParts.push(Buffer.from('Content-Disposition: form-data; name="model"' + nl + nl + 'whisper-1' + nl));
    bodyParts.push(Buffer.from('--' + boundary + nl));
    bodyParts.push(Buffer.from('Content-Disposition: form-data; name="language"' + nl + nl + 'ar' + nl));
    bodyParts.push(Buffer.from('--' + boundary + '--' + nl));
    var formBody = Buffer.concat(bodyParts);

    var resp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'multipart/form-data; boundary=' + boundary
      },
      body: formBody
    });

    var result = await resp.json();
    if (result.error) {
      return sendJson(res, 500, { error: 'Whisper error: ' + (result.error.message || JSON.stringify(result.error)) });
    }
    return sendJson(res, 200, { text: result.text || '' });
  } catch (e) {
    return sendJson(res, 500, { error: 'Transcription failed: ' + e.message });
  }
};
