const crypto = require('crypto');
const { sendJson, setCors, rateLimit, readBody, setSecurityHeaders, getDb } = require('./_helpers');

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

function verifyPassword(password, hash, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) return reject(err);
      try {
        resolve(crypto.timingSafeEqual(Buffer.from(hash, 'hex'), derivedKey));
      } catch (e) {
        resolve(false);
      }
    });
  });
}

function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

module.exports = async function handler(req, res) {
  try {
  setCors(res, req.headers?.origin);
  setSecurityHeaders(res);
  if (req.method === 'OPTIONS') return sendJson(res, 200, { ok: true });
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (!rateLimit(ip, 'student-auth', { max: 20, windowMs: 60000 })) {
    return sendJson(res, 429, { error: 'Too many requests. Try again in 1 minute.' });
  }

  let body;
  try { body = await readBody(req); } catch (e) { return sendJson(res, 400, { error: 'Invalid JSON' }); }

  const { action, email, password, name, avatar, teacherEmail } = body;

  if (!action) return sendJson(res, 400, { error: 'Missing action' });

  const db = await getDb();

  // ── REGISTER ──
  if (action === 'register') {
    if (!email || !password || !name) {
      return sendJson(res, 400, { error: 'Missing email, password, or name' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return sendJson(res, 400, { error: 'Invalid email' });

    if (password.length < 6 || password.length > 128) {
      return sendJson(res, 400, { error: 'Password must be 6-128 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const existing = await db.collection('kv_store').findOne({ _id: 'user:' + normalizedEmail });
    if (existing) {
      return sendJson(res, 409, { error: 'An account with this email already exists' });
    }

    // Hash password
    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);

    const userRecord = {
      email: normalizedEmail,
      name: name.trim(),
      passwordHash,
      salt,
      avatar: avatar || '',
      bio: '',
      createdAt: Date.now(),
      lastSeen: Date.now(),
      blocked: false,
      userAgent: '',
      deviceId: '',
      teacherEmail: teacherEmail || ''
    };

    await db.collection('kv_store').updateOne(
      { _id: 'user:' + normalizedEmail },
      { $set: { _id: 'user:' + normalizedEmail, value: JSON.stringify(userRecord) } },
      { upsert: true }
    );

    return sendJson(res, 200, {
      ok: true,
      user: { email: normalizedEmail, name: name.trim(), avatar: avatar || '' }
    });
  }

  // ── LOGIN ──
  if (action === 'login') {
    if (!email || !password) {
      return sendJson(res, 400, { error: 'Missing email or password' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const doc = await db.collection('kv_store').findOne({ _id: 'user:' + normalizedEmail });

    if (!doc || !doc.value) {
      return sendJson(res, 401, { error: 'No account found with this email' });
    }

    let userData;
    try { userData = JSON.parse(doc.value); } catch (e) {
      return sendJson(res, 500, { error: 'Invalid user data' });
    }

    if (userData.blocked) {
      return sendJson(res, 403, { error: 'Your account has been blocked. Please contact support.' });
    }

    let passwordValid = false;

    // Check hashed password first (new accounts)
    if (userData.passwordHash && userData.salt) {
      passwordValid = await verifyPassword(password, userData.passwordHash, userData.salt);

      // Migration: if hashed password is valid and old plaintext exists, remove it
      if (passwordValid && userData.password) {
        delete userData.password;
        await db.collection('kv_store').updateOne(
          { _id: 'user:' + normalizedEmail },
          { $set: { value: JSON.stringify(userData) } }
        );
      }
    }
    // Backward compatibility: check old plaintext password
    else if (userData.password) {
      if (userData.password === password) {
        passwordValid = true;
        // Migrate to hashed password
        const salt = generateSalt();
        const passwordHash = await hashPassword(password, salt);
        userData.passwordHash = passwordHash;
        userData.salt = salt;
        delete userData.password;
        await db.collection('kv_store').updateOne(
          { _id: 'user:' + normalizedEmail },
          { $set: { value: JSON.stringify(userData) } }
        );
      }
    }

    if (!passwordValid) {
      return sendJson(res, 401, { error: 'Incorrect password' });
    }

    // Update last seen
    userData.lastSeen = Date.now();
    await db.collection('kv_store').updateOne(
      { _id: 'user:' + normalizedEmail },
      { $set: { value: JSON.stringify(userData) } }
    );

    return sendJson(res, 200, {
      ok: true,
      user: {
        email: normalizedEmail,
        name: userData.name,
        avatar: userData.avatar || '',
        teacherEmail: userData.teacherEmail || ''
      }
    });
  }

  return sendJson(res, 400, { error: 'Invalid action. Use "register" or "login".' });
  } catch (e) {
    return sendJson(res, 500, { error: 'Internal server error: ' + e.message });
  }
};
