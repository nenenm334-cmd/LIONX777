const { Resend } = require('resend');
const { setCors, sendJson, readBody, rateLimit, setSecurityHeaders } = require('./_helpers');

module.exports = async function handler(req, res) {
  setCors(res, req.headers?.origin);
  setSecurityHeaders(res);
  if (req.method === 'OPTIONS') return sendJson(res, 200, { ok: true });
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (!rateLimit(ip, 'send-email', { max: 10, windowMs: 60000 })) {
    return sendJson(res, 429, { error: 'Too many requests. Try again in 1 minute.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return sendJson(res, 500, { error: 'Email service not configured' });
  }

  let body;
  try {
    body = await readBody(req);
  } catch (e) {
    return sendJson(res, 400, { error: 'Invalid request body' });
  }

  const { to, subject, html, type } = body;

  if (!to || !subject || !html) {
    return sendJson(res, 400, { error: 'Missing required fields: to, subject, html' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    return sendJson(res, 400, { error: 'Invalid email address' });
  }

  try {
    const resend = new Resend(apiKey);
    const from = process.env.EMAIL_FROM || 'Minbar <noreply@resend.dev>';
    const result = await resend.emails.send({
      from,
      to: [to],
      subject,
      html
    });

    if (result.error) {
      return sendJson(res, 500, { error: result.error.message || 'Failed to send email' });
    }

    return sendJson(res, 200, { ok: true, id: result.data?.id });
  } catch (e) {
    return sendJson(res, 500, { error: 'Email sending failed: ' + e.message });
  }
};
