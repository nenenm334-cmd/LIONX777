const Stripe = require('stripe');
const { sendJson, setSecurityHeaders } = require('./_helpers');

module.exports = async function handler(req, res) {
  setSecurityHeaders(res);
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return sendJson(res, 500, { error: 'Payments not configured' });

  const sessionId = req.query?.session_id;
  if (!sessionId) return sendJson(res, 400, { error: 'Missing session_id' });

  const stripe = new Stripe(secretKey);
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const plan = session.metadata?.plan || 'pro';
    const planNames = { pro: 'Minbar Pro', premium: 'Minbar Premium' };
    const planPrices = { pro: '$29/mo', premium: '$59/mo' };
    return sendJson(res, 200, {
      plan: plan,
      planName: planNames[plan] || 'Minbar Pro',
      planPrice: planPrices[plan] || '$29/mo',
      email: session.customer_email || session.metadata?.email || '',
      status: session.payment_status,
      amount: (session.amount_total || 0) / 100,
      currency: (session.currency || 'usd').toUpperCase()
    });
  } catch (e) {
    return sendJson(res, 500, { error: 'Failed to retrieve session: ' + e.message });
  }
};
