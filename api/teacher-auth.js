// Teacher Authentication API
// Handles registration and login for teachers with hashed passwords.
// Uses crypto.scrypt for password hashing (no external dependencies needed).

const crypto = require('crypto');
const { MongoClient } = require('mongodb');
const { sendJson, setCors, checkAuth, rateLimit, readBody } = require('./_helpers');

// ── MongoDB connection (reuses same pattern as kv.js) ──
let _cachedClient = null;
async function getDb() {
  if (_cachedClient) {
    try { await _cachedClient.db().command({ ping: 1 }); return _cachedClient.db(process.env.DB_NAME || 'minbar'); }
    catch (e) { try { await _cachedClient.close(); } catch (x) {} _cachedClient = null; }
  }
  _cachedClient = await new MongoClient(process.env.MONGO_URL).connect();
  return _cachedClient.db(process.env.DB_NAME || 'minbar');
}

// ── Password hashing ──
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

function hashPassword(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(derivedKey.toString('hex'));
    });
  });
}

function generateSalt() {
  return crypto.randomBytes(32).toString('hex');
}

async function verifyPassword(password, storedHash, salt) {
  const hash = await hashPassword(password, salt);
  // Constant-time comparison to prevent timing attacks
  if (hash.length !== storedHash.length) return false;
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
}

// ── Input validation ──
function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 6 && password.length <= 128;
}

function sanitizeName(name) {
  if (typeof name !== 'string') return '';
  return name.replace(/[<>]/g, '').trim().slice(0, 100);
}

// ── Sanitize key for storage ──
function sanitizeKey(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return raw.replace(/[^a-zA-Z0-9_\-:.\/@]/g, '').slice(0, 512);
}

module.exports = async function handler(req, res) {
  setCors(res, req.headers?.origin);
  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }

  // Rate limit: 20 register/login attempts per minute per IP
  const ip = req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (!rateLimit(ip, 'teacher-auth', { max: 20, windowMs: 60000 })) {
    sendJson(res, 429, { error: 'Too many requests. Please try again later.' }); return;
  }

  if (!checkAuth(req, res)) return;

  // Only POST allowed
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' }); return;
  }

  let body;
  try { body = await readBody(req, 4096); }
  catch (e) { sendJson(res, 400, { error: 'Invalid request body' }); return; }

  const action = body.action;

  // ── REGISTER ──
  if (action === 'register') {
    const email = sanitizeKey((body.email || '').trim().toLowerCase());
    const password = body.password || '';
    const name = sanitizeName(body.name || '');

    if (!isValidEmail(email)) {
      sendJson(res, 400, { error: 'Please enter a valid email address' }); return;
    }
    if (!isValidPassword(password)) {
      sendJson(res, 400, { error: 'Password must be at least 6 characters' }); return;
    }
    if (!name) {
      sendJson(res, 400, { error: 'Please enter your name' }); return;
    }

    try {
      const db = await getDb();
      const col = db.collection('kv_store');
      const teacherKey = 'teacher:' + email;

      // Check if teacher already exists
      const existing = await col.findOne({ key: teacherKey });
      if (existing && existing.value && existing.value.passwordHash) {
        sendJson(res, 409, { error: 'An account with this email already exists' }); return;
      }

      // Hash password
      const salt = generateSalt();
      const passwordHash = await hashPassword(password, salt);

      const now = Date.now();
      const teacherData = {
        email,
        name,
        passwordHash,
        salt,
        photo: '',
        bio: '',
        country: '',
        createdAt: now,
        lastSeen: now,
        status: 'active',
        verified: false,
        // Profile fields (will be filled in dashboard)
        price: 0,
        yearsExp: 0,
        specialties: [],
        schedule: [],
        _status: 'offline',
        _lastSeen: now,
        gradientStart: '#1D8348',
        gradientEnd: '#10b981',
        rating: 0,
        studentsCount: 0,
        lessonsCount: 0,
      };

      // Save teacher record
      const nowISO = new Date().toISOString();
      await col.updateOne(
        { key: teacherKey },
        { $set: { key: teacherKey, value: teacherData, updated_at: nowISO }, $setOnInsert: { created_at: nowISO } },
        { upsert: true }
      );

      // Add to teachers_list
      const listDoc = await col.findOne({ key: 'teachers_list' });
      let ids = (listDoc && Array.isArray(listDoc.value)) ? listDoc.value : [];
      if (!ids.includes(email)) {
        ids.push(email);
        await col.updateOne(
          { key: 'teachers_list' },
          { $set: { key: 'teachers_list', value: ids, updated_at: nowISO }, $setOnInsert: { created_at: nowISO } },
          { upsert: true }
        );
      }

      // Return teacher data (without password/salt)
      const safeData = { ...teacherData };
      delete safeData.passwordHash;
      delete safeData.salt;

      sendJson(res, 200, { success: true, teacher: safeData });
    } catch (err) {
      console.error('[TEACHER-AUTH] Register error:', err);
      sendJson(res, 500, { error: 'Registration failed. Please try again.' });
    }
    return;
  }

  // ── LOGIN ──
  if (action === 'login') {
    const email = sanitizeKey((body.email || '').trim().toLowerCase());
    const password = body.password || '';

    if (!email || !password) {
      sendJson(res, 400, { error: 'Email and password are required' }); return;
    }

    try {
      const db = await getDb();
      const col = db.collection('kv_store');
      const teacherKey = 'teacher:' + email;

      const doc = await col.findOne({ key: teacherKey });
      if (!doc || !doc.value || !doc.value.passwordHash) {
        sendJson(res, 401, { error: 'No account found with this email' }); return;
      }

      const teacher = doc.value;

      if (teacher.status === 'blocked') {
        sendJson(res, 403, { error: 'Your account has been blocked' }); return;
      }

      const valid = await verifyPassword(password, teacher.passwordHash, teacher.salt);
      if (!valid) {
        sendJson(res, 401, { error: 'Incorrect password' }); return;
      }

      // Update last seen
      const now = Date.now();
      teacher.lastSeen = now;
      const nowISO = new Date().toISOString();
      await col.updateOne(
        { key: teacherKey },
        { $set: { key: teacherKey, value: teacher, updated_at: nowISO } }
      );

      // Return teacher data (without password/salt)
      const safeData = { ...teacher };
      delete safeData.passwordHash;
      delete safeData.salt;

      sendJson(res, 200, { success: true, teacher: safeData });
    } catch (err) {
      console.error('[TEACHER-AUTH] Login error:', err);
      sendJson(res, 500, { error: 'Login failed. Please try again.' });
    }
    return;
  }

  sendJson(res, 400, { error: 'Invalid action' });
};
