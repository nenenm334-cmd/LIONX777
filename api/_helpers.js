// Shared helpers for Vercel Node functions.

const ORIGIN = process.env.ALLOWED_ORIGIN || 'https://lionx777.vercel.app';

// ── In-memory rate limiter (per-IP, per-endpoint) ──
const _buckets = new Map();
const CLEANUP_INTERVAL = 60_000;
let _lastCleanup = Date.now();

function rateLimit(ip, endpoint, { max = 30, windowMs = 60_000 } = {}) {
  const now = Date.now();
  if (now - _lastCleanup > CLEANUP_INTERVAL) {
    for (const [k, v] of _buckets) { if (now - v.resetAt > windowMs * 2) _buckets.delete(k); }
    _lastCleanup = now;
  }
  const key = ip + ':' + endpoint;
  let bucket = _buckets.get(key);
  if (!bucket || now - bucket.resetAt > windowMs) {
    bucket = { count: 1, resetAt: now };
    _buckets.set(key, bucket);
    return true;
  }
  bucket.count++;
  return bucket.count <= max;
}

// ── CORS ──
function setCors(res, origin) {
  const allowed = (origin || '').replace(/\/+$/, '') === ORIGIN.replace(/\/+$/, '');
  res.setHeader('Access-Control-Allow-Origin', allowed ? ORIGIN : '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-openai-key');
  res.setHeader('Access-Control-Max-Age', '86400');
}

// ── Security headers ──
function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
}

// ── Auth check ──
function checkAuth(req, res) {
  const secret = process.env.API_SECRET || '';
  if (!secret) return true;
  const tok = (req.headers?.authorization || '').replace('Bearer ', '').trim();
  if (!tok || tok !== secret) {
    sendJson(res, 401, { error: 'Unauthorized' });
    return false;
  }
  return true;
}

// ── videoId validation (strict YouTube format) ──
function validVideoId(id) {
  return typeof id === 'string' && /^[A-Za-z0-9_-]{11}$/.test(id.trim());
}

// ── Body reader with size limit ──
function readBody(req, maxBytes = 1048576) {
  return new Promise((ok, fail) => {
    let d = '', n = 0;
    req.on('data', c => {
      n += c.length;
      if (n > maxBytes) { req.destroy(); fail(new Error('Body too large')); return; }
      d += c;
    });
    req.on('end', () => { try { ok(d ? JSON.parse(d) : {}); } catch (e) { fail(new Error('Invalid JSON')); } });
    req.on('error', fail);
  });
}

// ── Response helpers ──
function sendJson(res, status, body) {
  setSecurityHeaders(res);
  const payload = JSON.stringify(body);
  res.statusCode = status;
  if (!res.getHeader('content-type')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  }
  res.end(payload);
}

function sendText(res, status, body, contentType) {
  setSecurityHeaders(res);
  res.statusCode = status;
  if (!res.getHeader('content-type')) {
    res.setHeader('Content-Type', contentType || 'text/plain; charset=utf-8');
  }
  res.end(body);
}

function sendBuffer(res, status, buffer, contentType) {
  setSecurityHeaders(res);
  res.statusCode = status;
  if (!res.getHeader('content-type')) {
    res.setHeader('Content-Type', contentType || 'application/octet-stream');
  }
  res.end(buffer);
}

// ── MongoDB shared connection ──
const { MongoClient } = require('mongodb');
let _cachedDbClient = null;

async function getDb() {
  if (_cachedDbClient) {
    try { await _cachedDbClient.db().command({ ping: 1 }); return _cachedDbClient.db(process.env.DB_NAME || 'minbar'); }
    catch (e) { try { await _cachedDbClient.close(); } catch (x) {} _cachedDbClient = null; }
  }
  _cachedDbClient = await new MongoClient(process.env.MONGO_URL).connect();
  return _cachedDbClient.db(process.env.DB_NAME || 'minbar');
}

// ── Stripe key resolver (env → KV fallback) ──
async function getStripeKey(keyName) {
  const envVal = process.env[keyName];
  if (envVal) return envVal;
  try {
    const db = await getDb();
    const doc = await db.collection('kv_store').findOne({ key: 'config:stripe:' + keyName });
    if (doc && doc.value) return doc.value;
  } catch (e) {}
  return null;
}

module.exports = {
  sendJson, sendText, sendBuffer,
  setCors, setSecurityHeaders, checkAuth,
  rateLimit, validVideoId, readBody, getDb, getStripeKey, ORIGIN
};
