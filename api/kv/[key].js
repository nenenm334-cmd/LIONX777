import { MongoClient } from 'mongodb';

const MAX_BODY = 1048576;
let clientPromise;

function getDb() {
  if (!clientPromise) {
    clientPromise = new MongoClient(process.env.MONGO_URL).connect();
  }
  return clientPromise.then(c => c.db(process.env.DB_NAME || 'minbar'));
}

function checkAuth(req, res) {
  const secret = process.env.API_SECRET || '';
  if (!secret) return true;
  const tok = (req.headers?.authorization || '').replace('Bearer ', '');
  if (tok !== secret) { res.status(401).json({ error: 'Unauthorized' }); return false; }
  return true;
}

function readBody(req) {
  return new Promise((ok, fail) => {
    let d = '', n = 0;
    req.on('data', c => { n += c.length; if (n > MAX_BODY) { req.destroy(); fail(new Error('Too large')); return; } d += c; });
    req.on('end', () => { try { ok(d ? JSON.parse(d) : {}); } catch (e) { fail(e); } });
    req.on('error', fail);
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (!checkAuth(req, res)) return;

  const key = req.query?.key || '';
  if (!key) { res.status(400).json({ error: 'Missing key' }); return; }

  try {
    const db = await getDb();
    const col = db.collection('kv_store');

    if (req.method === 'GET') {
      const doc = await col.findOne({ key });
      if (!doc) { res.status(404).json({ error: 'Key not found' }); return; }
      res.status(200).json({ key: doc.key, value: doc.value });
      return;
    }

    if (req.method === 'PUT') {
      const body = await readBody(req);
      if (typeof body !== 'object' || !('value' in body)) {
        res.status(400).json({ error: 'Invalid body' }); return;
      }
      const now = new Date().toISOString();
      await col.updateOne(
        { key },
        { $set: { key, value: body.value, updated_at: now }, $setOnInsert: { created_at: now } },
        { upsert: true }
      );
      res.status(200).json({ key, value: body.value });
      return;
    }

    if (req.method === 'DELETE') {
      const r = await col.deleteOne({ key });
      res.status(200).json({ key, deleted: r.deletedCount > 0 });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[KV]', req.method, key, err);
    res.status(500).json({ error: 'Internal error', detail: err.message });
  }
}
