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

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
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
  if (!rateLimit(ip, 'password-reset', { max: 5, windowMs: 60000 })) {
    return sendJson(res, 429, { error: 'Too many requests. Try again in 1 minute.' });
  }

  let body;
  try { body = await readBody(req); } catch (e) { return sendJson(res, 400, { error: 'Invalid JSON' }); }

  const { action, email, token, newPassword, role } = body;

  if (!action) return sendJson(res, 400, { error: 'Missing action' });

  const db = await getDb();

  // ── REQUEST RESET TOKEN ──
  if (action === 'request_reset') {
    if (!email || !role) return sendJson(res, 400, { error: 'Missing email or role' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return sendJson(res, 400, { error: 'Invalid email' });

    const normalizedEmail = email.toLowerCase().trim();
    const resetToken = generateToken();
    const expiresAt = Date.now() + 3600000; // 1 hour

    const record = {
      token: resetToken,
      email: normalizedEmail,
      role,
      expiresAt,
      createdAt: Date.now()
    };

    await db.collection('kv_store').updateOne(
      { _id: 'password_reset:' + normalizedEmail },
      { $set: { _id: 'password_reset:' + normalizedEmail, value: JSON.stringify(record) } },
      { upsert: true }
    );

    const resetUrl = 'https://lionx777.vercel.app/reset-password.html?token=' + resetToken + '&email=' + encodeURIComponent(normalizedEmail) + '&role=' + role;

    let emailHtml = '';
    if (role === 'teacher') {
      emailHtml = `
        <div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:32px;">
          <div style="background:linear-gradient(135deg,#0d9488,#0a7e6e);border-radius:16px;padding:32px;text-align:center;color:#fff;">
            <h1 style="margin:0;font-size:28px;">Minbar</h1>
            <p style="margin:8px 0 0;opacity:0.9;">Teacher Portal</p>
          </div>
          <div style="padding:32px;background:#f8fafc;border-radius:0 0 16px 16px;">
            <h2 style="color:#111827;margin:0 0 16px;">Reset Your Password</h2>
            <p style="color:#6b7280;font-size:14px;line-height:1.6;">You requested a password reset for your Minbar teacher account. Click the button below to set a new password.</p>
            <p style="color:#6b7280;font-size:14px;line-height:1.6;">This link expires in <strong>1 hour</strong>.</p>
            <a href="${resetUrl}" style="display:inline-block;background:#0d9488;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;margin:16px 0;">Reset Password</a>
            <p style="color:#9ca3af;font-size:12px;margin-top:24px;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        </div>`;
    } else {
      emailHtml = `
        <div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:32px;">
          <div style="background:linear-gradient(135deg,#0d9488,#0a7e6e);border-radius:16px;padding:32px;text-align:center;color:#fff;">
            <h1 style="margin:0;font-size:28px;">Minbar</h1>
            <p style="margin:8px 0 0;opacity:0.9;">Learn Arabic</p>
          </div>
          <div style="padding:32px;background:#f8fafc;border-radius:0 0 16px 16px;">
            <h2 style="color:#111827;margin:0 0 16px;">Reset Your Password</h2>
            <p style="color:#6b7280;font-size:14px;line-height:1.6;">You requested a password reset for your Minbar account. Click the button below to set a new password.</p>
            <p style="color:#6b7280;font-size:14px;line-height:1.6;">This link expires in <strong>1 hour</strong>.</p>
            <a href="${resetUrl}" style="display:inline-block;background:#0d9488;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;margin:16px 0;">Reset Password</a>
            <p style="color:#9ca3af;font-size:12px;margin-top:24px;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        </div>`;
    }

    // Try to send email via Resend
    const apiKey = process.env.RESEND_API_KEY;
    let emailSent = false;
    if (apiKey) {
      try {
        const { Resend } = require('resend');
        const resend = new Resend(apiKey);
        const from = process.env.EMAIL_FROM || 'Minbar <noreply@resend.dev>';
        const result = await resend.emails.send({
          from,
          to: [normalizedEmail],
          subject: 'Reset Your Minbar Password',
          html: emailHtml
        });
        emailSent = !result.error;
      } catch (e) {
        // Email sending failed, but we still generated the token
      }
    }

    return sendJson(res, 200, {
      ok: true,
      emailSent,
      message: emailSent ? 'Reset email sent' : (apiKey ? 'Email sending failed' : 'Email service not configured. Use the link directly.'),
      resetUrl: !emailSent ? resetUrl : undefined
    });
  }

  // ── VERIFY TOKEN & RESET PASSWORD ──
  if (action === 'reset_password') {
    if (!token || !email || !newPassword || !role) {
      return sendJson(res, 400, { error: 'Missing required fields' });
    }

    if (newPassword.length < 6 || newPassword.length > 128) {
      return sendJson(res, 400, { error: 'Password must be 6-128 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const doc = await db.collection('kv_store').findOne({ _id: 'password_reset:' + normalizedEmail });

    if (!doc || !doc.value) {
      return sendJson(res, 400, { error: 'Invalid or expired reset token' });
    }

    let record;
    try { record = JSON.parse(doc.value); } catch (e) {
      return sendJson(res, 400, { error: 'Invalid reset data' });
    }

    if (record.token !== token) {
      return sendJson(res, 400, { error: 'Invalid reset token' });
    }

    if (Date.now() > record.expiresAt) {
      await db.collection('kv_store').deleteOne({ _id: 'password_reset:' + normalizedEmail });
      return sendJson(res, 400, { error: 'Reset token has expired. Please request a new one.' });
    }

    if (record.role !== role) {
      return sendJson(res, 400, { error: 'Invalid role for this reset token' });
    }

    // Hash new password and update
    const salt = generateSalt();
    const passwordHash = await hashPassword(newPassword, salt);

    if (role === 'teacher') {
      const teacher = await db.collection('kv_store').findOne({ _id: 'teacher:' + normalizedEmail });
      if (!teacher) return sendJson(res, 404, { error: 'Teacher not found' });

      let tData;
      try { tData = JSON.parse(teacher.value); } catch (e) {
        return sendJson(res, 500, { error: 'Invalid teacher data' });
      }

      tData.passwordHash = passwordHash;
      tData.salt = salt;
      tData._status = tData._status || 'online';
      tData._lastSeen = Date.now();

      await db.collection('kv_store').updateOne(
        { _id: 'teacher:' + normalizedEmail },
        { $set: { value: JSON.stringify(tData) } }
      );
    } else {
      // Student password reset
      const user = await db.collection('kv_store').findOne({ _id: 'user:' + normalizedEmail });
      if (!user) return sendJson(res, 404, { error: 'User not found' });

      let uData;
      try { uData = JSON.parse(user.value); } catch (e) {
        return sendJson(res, 500, { error: 'Invalid user data' });
      }

      uData.passwordHash = passwordHash;
      uData.salt = salt;
      delete uData.password; // Remove plaintext password

      await db.collection('kv_store').updateOne(
        { _id: 'user:' + normalizedEmail },
        { $set: { value: JSON.stringify(uData) } }
      );
    }

    // Delete the reset token
    await db.collection('kv_store').deleteOne({ _id: 'password_reset:' + normalizedEmail });

    return sendJson(res, 200, { ok: true, message: 'Password reset successful' });
  }

  return sendJson(res, 400, { error: 'Invalid action. Use "request_reset" or "reset_password".' });
  } catch (e) {
    return sendJson(res, 500, { error: 'Internal server error: ' + e.message });
  }
};
