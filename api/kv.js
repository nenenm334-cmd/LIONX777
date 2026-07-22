const { MongoClient } = require('mongodb');
const { sendJson, setCors, checkAuth, rateLimit, readBody } = require('./_helpers');

const MAX_VALUE_SIZE = 524288; // 512KB max value

let _cachedClient = null;
async function getDb() {
  if (_cachedClient) {
    try { await _cachedClient.db().command({ ping: 1 }); return _cachedClient.db(process.env.DB_NAME || 'minbar'); }
    catch (e) { try { await _cachedClient.close(); } catch (x) {} _cachedClient = null; }
  }
  _cachedClient = await new MongoClient(process.env.MONGO_URL).connect();
  return _cachedClient.db(process.env.DB_NAME || 'minbar');
}

function sanitizeKey(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return raw.replace(/[^a-zA-Z0-9_\-:.\/@]/g, '').slice(0, 512);
}

function regexEsc(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = async function handler(req, res) {
  setCors(res, req.headers?.origin);
  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }

  // Rate limit: 120 reads/min, 40 writes/min per IP
  const ip = req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  const isWrite = req.method === 'PUT' || req.method === 'DELETE';
  if (!rateLimit(ip, 'kv:' + (isWrite ? 'w' : 'r'), { max: isWrite ? 40 : 120, windowMs: 120000 })) {
    sendJson(res, 429, { error: 'Too many requests' }); return;
  }

  if (!checkAuth(req, res)) return;

  try {
    const db = await getDb();
    const col = db.collection('kv_store');
    const key = sanitizeKey(req.query?.key);

    if (!key) {
      if (req.method !== 'GET') { sendJson(res, 405, { error: 'Method not allowed' }); return; }
      const rawPrefix = String(req.query?.prefix || '').replace(/[^a-zA-Z0-9_\-:.\/]/g, '').slice(0, 512);
      const filter = rawPrefix ? { key: { $regex: `^${regexEsc(rawPrefix)}` } } : {};
      const docs = await col.find(filter, { projection: { _id: 0, key: 1 } }).limit(10000).toArray();
      sendJson(res, 200, { keys: docs.map(d => d.key), prefix: rawPrefix });
      return;
    }

    if (req.method === 'GET') {
      const doc = await col.findOne({ key });
      if (!doc) { sendJson(res, 200, { key, value: null }); return; }
      sendJson(res, 200, { key: doc.key, value: doc.value });
      return;
    }

    if (req.method === 'PUT') {
      let body;
      try { body = await readBody(req, MAX_VALUE_SIZE); }
      catch (e) { sendJson(res, 400, { error: e.message }); return; }
      if (typeof body !== 'object' || body === null || Array.isArray(body) || !('value' in body)) {
        sendJson(res, 400, { error: 'Invalid body' }); return;
      }
      // Validate value size
      const valStr = JSON.stringify(body.value);
      if (valStr.length > MAX_VALUE_SIZE) {
        sendJson(res, 413, { error: 'Value too large (max 512KB)' }); return;
      }
      const now = new Date().toISOString();
      await col.updateOne(
        { key },
        { $set: { key, value: body.value, updated_at: now }, $setOnInsert: { created_at: now } },
        { upsert: true }
      );
      sendJson(res, 200, { key, value: body.value });
      return;
    }

    if (req.method === 'DELETE') {
      const r = await col.deleteOne({ key });
      sendJson(res, 200, { key, deleted: r.deletedCount > 0 });
      return;
    }

    sendJson(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('[KV]', req.method, err);
    sendJson(res, 500, { error: 'Internal error' });
  }
};
