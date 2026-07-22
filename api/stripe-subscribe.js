const Stripe = require('stripe');
const { sendJson, setCors, rateLimit, readBody, setSecurityHeaders } = require('./_helpers');

const PLANS = {
  pro: { priceId: process.env.STRIPE_PRO_PRICE_ID, name: 'Pro' },
  premium: { priceId: process.env.STRIPE_PREMIUM_PRICE_ID, name: 'Premium' }
};

module.exports = async function handler(req, res) {
  setCors(res, req.headers?.origin);
  setSecurityHeaders(res);
  if (req.method === 'OPTIONS') return sendJson(res, 200, { ok: true });
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (!rateLimit(ip, 'stripe-subscribe', { max: 20, windowMs: 60000 })) {
    return sendJson(res, 429, { error: 'Too many requests' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return sendJson(res, 500, { error: 'Payments not configured' });

  let body;
  try { body = await readBody(req); } catch (e) { return sendJson(res, 400, { error: 'Invalid JSON' }); }

  const { plan, email, name, paymentMethodId } = body;

  if (!plan || !PLANS[plan]) return sendJson(res, 400, { error: 'Invalid plan. Use: pro, premium' });
  if (!email) return sendJson(res, 400, { error: 'Email required' });

  const stripe = new Stripe(secretKey);

  try {
    // Find or create customer
    var customers = await stripe.customers.list({ email: email, limit: 1 });
    var customer = customers.data.length > 0 ? customers.data[0] : await stripe.customers.create({ email: email, name: name || '', metadata: { plan, email, name: name || '' } });

    // Attach payment method if provided (for Google Pay)
    if (paymentMethodId) {
      await stripe.paymentMethods.attach(paymentMethodId, { customer: customer.id });
      await stripe.customers.update(customer.id, { invoice_settings: { default_payment_method: paymentMethodId } });
    }

    // Create subscription
    var subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: PLANS[plan].priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: { plan, email, name: name || '' }
    });

    var clientSecret = subscription.latest_invoice.payment_intent.client_secret;

    return sendJson(res, 200, {
      subscriptionId: subscription.id,
      clientSecret: clientSecret,
      customerId: customer.id
    });
  } catch (e) {
    return sendJson(res, 500, { error: 'Failed to create subscription: ' + e.message });
  }
};
