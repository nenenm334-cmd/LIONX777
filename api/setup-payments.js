const { sendJson, setCors, rateLimit, readBody, setSecurityHeaders, getDb } = require('./_helpers');

module.exports = async function handler(req, res) {
  setCors(res, req.headers?.origin);
  setSecurityHeaders(res);
  if (req.method === 'OPTIONS') return sendJson(res, 200, { ok: true });
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (!rateLimit(ip, 'setup-payments', { max: 10, windowMs: 60000 })) {
    return sendJson(res, 429, { error: 'Too many requests' });
  }

  let body;
  try { body = await readBody(req); } catch (e) { return sendJson(res, 400, { error: 'Invalid JSON' }); }

  const { secretKey, proPriceId, premiumPriceId } = body;

  if (!secretKey || !proPriceId || !premiumPriceId) {
    return sendJson(res, 400, { error: 'Missing required fields: secretKey, proPriceId, premiumPriceId' });
  }

  if (!secretKey.startsWith('sk_')) {
    return sendJson(res, 400, { error: 'Invalid secret key format (must start with sk_)' });
  }
  if (!proPriceId.startsWith('price_') || !premiumPriceId.startsWith('price_')) {
    return sendJson(res, 400, { error: 'Invalid price ID format (must start with price_)' });
  }

  try {
    const db = await getDb();
    await db.collection('kv_store').updateOne(
      { key: 'config:stripe:STRIPE_SECRET_KEY' },
      { $set: { key: 'config:stripe:STRIPE_SECRET_KEY', value: secretKey, updated_at: new Date().toISOString() } },
      { upsert: true }
    );
    await db.collection('kv_store').updateOne(
      { key: 'config:stripe:STRIPE_PRO_PRICE_ID' },
      { $set: { key: 'config:stripe:STRIPE_PRO_PRICE_ID', value: proPriceId, updated_at: new Date().toISOString() } },
      { upsert: true }
    );
    await db.collection('kv_store').updateOne(
      { key: 'config:stripe:STRIPE_PREMIUM_PRICE_ID' },
      { $set: { key: 'config:stripe:STRIPE_PREMIUM_PRICE_ID', value: premiumPriceId, updated_at: new Date().toISOString() } },
      { upsert: true }
    );
    return sendJson(res, 200, { ok: true, message: 'Payment configuration saved successfully' });
  } catch (e) {
    return sendJson(res, 500, { error: 'Failed to save: ' + e.message });
  }
};
