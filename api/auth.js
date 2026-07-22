const crypto = require('crypto');
const { sendJson, setCors, checkAuth, rateLimit, readBody, setSecurityHeaders, getDb } = require('./_helpers');

const KEY_LENGTH = 64;

function hashPassword(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(derivedKey.toString('hex'));
    });
  });
}

function generateSalt(len) {
  return crypto.randomBytes(len || 16).toString('hex');
}

async function verifyPassword(password, storedHash, salt) {
  const hash = await hashPassword(password, salt);
  if (hash.length !== storedHash.length) return false;
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
}

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

function sanitizeKey(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return raw.replace(/[^a-zA-Z0-9_\-:.\/@]/g, '').slice(0, 512);
}

async function handleStudentRegister(req, res) {
  let body;
  try { body = await readBody(req); } catch (e) { return sendJson(res, 400, { error: 'Invalid JSON' }); }

  const { email, password, name, avatar, teacherEmail } = body;

  if (!email || !password || !name) {
    return sendJson(res, 400, { error: 'Missing email, password, or name' });
  }

  if (!isValidEmail(email)) return sendJson(res, 400, { error: 'Invalid email' });
  if (!isValidPassword(password)) return sendJson(res, 400, { error: 'Password must be 6-128 characters' });

  const normalizedEmail = email.toLowerCase().trim();

  const db = await getDb();
  const existing = await db.collection('kv_store').findOne({ _id: 'user:' + normalizedEmail });
  if (existing) return sendJson(res, 409, { error: 'An account with this email already exists' });

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);

  const userRecord = {
    email: normalizedEmail,
    name: name.trim(),
    passwordHash, salt,
    avatar: avatar || '', bio: '',
    createdAt: Date.now(), lastSeen: Date.now(),
    blocked: false, userAgent: '', deviceId: '',
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

async function handleStudentLogin(req, res) {
  let body;
  try { body = await readBody(req); } catch (e) { return sendJson(res, 400, { error: 'Invalid JSON' }); }

  const { email, password } = body;
  if (!email || !password) return sendJson(res, 400, { error: 'Missing email or password' });

  const normalizedEmail = email.toLowerCase().trim();
  const db = await getDb();
  const doc = await db.collection('kv_store').findOne({ _id: 'user:' + normalizedEmail });

  if (!doc || !doc.value) return sendJson(res, 401, { error: 'No account found with this email' });

  let userData;
  try { userData = JSON.parse(doc.value); } catch (e) { return sendJson(res, 500, { error: 'Invalid user data' }); }

  if (userData.blocked) return sendJson(res, 403, { error: 'Your account has been blocked. Please contact support.' });

  let passwordValid = false;

  if (userData.passwordHash && userData.salt) {
    passwordValid = await verifyPassword(password, userData.passwordHash, userData.salt);
    if (passwordValid && userData.password) {
      delete userData.password;
      await db.collection('kv_store').updateOne(
        { _id: 'user:' + normalizedEmail },
        { $set: { value: JSON.stringify(userData) } }
      );
    }
  } else if (userData.password) {
    if (userData.password === password) {
      passwordValid = true;
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

  if (!passwordValid) return sendJson(res, 401, { error: 'Incorrect password' });

  userData.lastSeen = Date.now();
  await db.collection('kv_store').updateOne(
    { _id: 'user:' + normalizedEmail },
    { $set: { value: JSON.stringify(userData) } }
  );

  return sendJson(res, 200, {
    ok: true,
    user: { email: normalizedEmail, name: userData.name, avatar: userData.avatar || '', teacherEmail: userData.teacherEmail || '' }
  });
}

async function handleTeacherRegister(req, res) {
  let body;
  try { body = await readBody(req, 4096); } catch (e) { return sendJson(res, 400, { error: 'Invalid request body' }); }

  const email = sanitizeKey((body.email || '').trim().toLowerCase());
  const password = body.password || '';
  const name = sanitizeName(body.name || '');

  if (!isValidEmail(email)) return sendJson(res, 400, { error: 'Please enter a valid email address' });
  if (!isValidPassword(password)) return sendJson(res, 400, { error: 'Password must be at least 6 characters' });
  if (!name) return sendJson(res, 400, { error: 'Please enter your name' });

  try {
    const db = await getDb();
    const col = db.collection('kv_store');
    const teacherKey = 'teacher:' + email;

    const existing = await col.findOne({ key: teacherKey });
    if (existing && existing.value && existing.value.passwordHash) {
      return sendJson(res, 409, { error: 'An account with this email already exists' });
    }

    const salt = generateSalt(32);
    const passwordHash = await hashPassword(password, salt);

    const now = Date.now();
    const teacherData = {
      email, name, passwordHash, salt,
      photo: '', bio: '', country: '',
      createdAt: now, lastSeen: now, status: 'active', verified: false,
      price: 0, yearsExp: 0, specialties: [], schedule: [],
      _status: 'offline', _lastSeen: now,
      gradientStart: '#1D8348', gradientEnd: '#10b981',
      rating: 0, studentsCount: 0, lessonsCount: 0,
    };

    const nowISO = new Date().toISOString();
    await col.updateOne(
      { key: teacherKey },
      { $set: { key: teacherKey, value: teacherData, updated_at: nowISO }, $setOnInsert: { created_at: nowISO } },
      { upsert: true }
    );

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

    const safeData = { ...teacherData };
    delete safeData.passwordHash;
    delete safeData.salt;

    return sendJson(res, 200, { success: true, teacher: safeData });
  } catch (err) {
    console.error('[TEACHER-AUTH] Register error:', err);
    return sendJson(res, 500, { error: 'Registration failed. Please try again.' });
  }
}

async function handleTeacherLogin(req, res) {
  let body;
  try { body = await readBody(req, 4096); } catch (e) { return sendJson(res, 400, { error: 'Invalid request body' }); }

  const email = sanitizeKey((body.email || '').trim().toLowerCase());
  const password = body.password || '';

  if (!email || !password) return sendJson(res, 400, { error: 'Email and password are required' });

  try {
    const db = await getDb();
    const col = db.collection('kv_store');
    const teacherKey = 'teacher:' + email;

    const doc = await col.findOne({ key: teacherKey });
    if (!doc || !doc.value || !doc.value.passwordHash) {
      return sendJson(res, 401, { error: 'No account found with this email' });
    }

    const teacher = doc.value;
    if (teacher.status === 'blocked') return sendJson(res, 403, { error: 'Your account has been blocked' });

    const valid = await verifyPassword(password, teacher.passwordHash, teacher.salt);
    if (!valid) return sendJson(res, 401, { error: 'Incorrect password' });

    teacher.lastSeen = Date.now();
    const nowISO = new Date().toISOString();
    await col.updateOne(
      { key: teacherKey },
      { $set: { key: teacherKey, value: teacher, updated_at: nowISO } }
    );

    const safeData = { ...teacher };
    delete safeData.passwordHash;
    delete safeData.salt;

    return sendJson(res, 200, { success: true, teacher: safeData });
  } catch (err) {
    console.error('[TEACHER-AUTH] Login error:', err);
    return sendJson(res, 500, { error: 'Login failed. Please try again.' });
  }
}

module.exports = async function handler(req, res) {
  setSecurityHeaders(res);

  var path = (req.url || '').split('?')[0].replace(/\/+$/, '');
  var method = req.method;
  var ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';

  switch (path) {
    case '/api/student-auth':
      setCors(res, req.headers?.origin);
      if (method === 'OPTIONS') return sendJson(res, 200, { ok: true });
      if (method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
      if (!rateLimit(ip, 'student-auth', { max: 20, windowMs: 60000 })) {
        return sendJson(res, 429, { error: 'Too many requests. Try again in 1 minute.' });
      }

      let sBody;
      try { sBody = await readBody(req); } catch (e) { return sendJson(res, 400, { error: 'Invalid JSON' }); }

      if (sBody.action === 'register') return handleStudentRegister(req, res);
      if (sBody.action === 'login') return handleStudentLogin(req, res);
      return sendJson(res, 400, { error: 'Invalid action. Use "register" or "login".' });

    case '/api/teacher-auth':
      setCors(res, req.headers?.origin);
      if (method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }
      if (method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
      if (!rateLimit(ip, 'teacher-auth', { max: 20, windowMs: 60000 })) {
        return sendJson(res, 429, { error: 'Too many requests. Please try again later.' });
      }
      if (!checkAuth(req, res)) return;

      let tBody;
      try { tBody = await readBody(req, 4096); } catch (e) { return sendJson(res, 400, { error: 'Invalid request body' }); }

      if (tBody.action === 'register') return handleTeacherRegister(req, res);
      if (tBody.action === 'login') return handleTeacherLogin(req, res);
      return sendJson(res, 400, { error: 'Invalid action' });

    default:
      return sendJson(res, 404, { error: 'Not found' });
  }
};
