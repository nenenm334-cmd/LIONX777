const Stripe = require('stripe');
const { sendJson, setCors, rateLimit, readBody, setSecurityHeaders } = require('./_helpers');

async function kvSet(key, value) {
  const { getDb } = require('./_helpers');
  const db = await getDb();
  const now = new Date().toISOString();
  await db.collection('kv_store').updateOne(
    { key },
    { $set: { key, value, updated_at: now }, $setOnInsert: { created_at: now } },
    { upsert: true }
  );
}

module.exports = async function handler(req, res) {
  setCors(res, req.headers?.origin);
  setSecurityHeaders(res);
  if (req.method === 'OPTIONS') return sendJson(res, 200, { ok: true });
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (!rateLimit(ip, 'booking-checkout', { max: 20, windowMs: 60000 })) {
    return sendJson(res, 429, { error: 'Too many requests' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return sendJson(res, 500, { error: 'Payments not configured' });

  let body;
  try { body = await readBody(req); } catch (e) { return sendJson(res, 400, { error: 'Invalid JSON' }); }

  const { teacherId, teacherName, teacherEmail, studentName, studentEmail, day, time, price, note, duration } = body;

  if (!teacherEmail || !studentEmail || !price) {
    return sendJson(res, 400, { error: 'Missing required fields: teacherEmail, studentEmail, price' });
  }

  const amount = Math.round(parseFloat(price) * 100);
  if (amount < 50) return sendJson(res, 400, { error: 'Minimum amount is $0.50' });

  const stripe = new Stripe(secretKey);
  const origin = req.headers?.origin || 'https://lionx777.vercel.app';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Lesson with ' + (teacherName || 'Teacher'),
            description: (day || '') + ' at ' + (time || '') + (duration ? ' (' + duration + ' min)' : '')
          },
          unit_amount: amount
        },
        quantity: 1
      }],
      customer_email: studentEmail,
      metadata: {
        type: 'booking',
        teacherId: teacherId || '',
        teacherName: teacherName || '',
        teacherEmail: teacherEmail,
        studentName: studentName || studentEmail,
        studentEmail: studentEmail,
        day: day || '',
        time: time || '',
        price: String(price),
        note: note || '',
        duration: String(duration || 60)
      },
      success_url: origin + '/payment-success.html?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: origin + '/payment-cancel.html',
      allow_promotion_codes: true
    });

    // Store pending booking data
    await kvSet('booking_pending:' + session.id, {
      teacherId, teacherName, teacherEmail,
      studentName: studentName || studentEmail,
      studentEmail, day, time,
      price: parseFloat(price),
      note: note || '',
      duration: parseInt(duration) || 60,
      sessionId: session.id,
      status: 'pending_payment',
      createdAt: Date.now()
    });

    return sendJson(res, 200, { url: session.url, sessionId: session.id });
  } catch (e) {
    return sendJson(res, 500, { error: 'Failed to create checkout: ' + e.message });
  }
};
