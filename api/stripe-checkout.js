const Stripe = require('stripe');
const { sendJson, setCors, rateLimit, readBody, setSecurityHeaders, getStripeKey } = require('./_helpers');

async function getPlan(planName) {
  var priceId = process.env['STRIPE_PRO_PRICE_ID'] || (await getStripeKey('STRIPE_PRO_PRICE_ID'));
  var premiumPriceId = process.env['STRIPE_PREMIUM_PRICE_ID'] || (await getStripeKey('STRIPE_PREMIUM_PRICE_ID'));
  return {
    pro: { priceId: priceId, name: 'Pro' },
    premium: { priceId: premiumPriceId, name: 'Premium' }
  }[planName] || null;
}

module.exports = async function handler(req, res) {
  setCors(res, req.headers?.origin);
  setSecurityHeaders(res);
  if (req.method === 'OPTIONS') return sendJson(res, 200, { ok: true });
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (!rateLimit(ip, 'stripe-checkout', { max: 20, windowMs: 60000 })) {
    return sendJson(res, 429, { error: 'Too many requests' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY || (await getStripeKey('STRIPE_SECRET_KEY'));
  if (!secretKey) return sendJson(res, 500, { error: 'Payments not configured', hint: 'set STRIPE_SECRET_KEY in Vercel env or use /setup-payments.html' });

  let body;
  try { body = await readBody(req); } catch (e) { return sendJson(res, 400, { error: 'Invalid JSON' }); }

  const { plan, email, name, successUrl, cancelUrl } = body;

  const selectedPlan = await getPlan(plan);
  if (!plan || !selectedPlan) return sendJson(res, 400, { error: 'Invalid plan. Use: pro, premium' });
  if (!email) return sendJson(res, 400, { error: 'Email required' });

  const stripe = new Stripe(secretKey);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      payment_method_options: {
        card: {
          request_three_d_secure: 'any'
        }
      },
      line_items: [{ price: selectedPlan.priceId, quantity: 1 }],
      customer_email: email,
      metadata: { plan, email, name: name || '' },
      success_url: successUrl || 'https://lionx777.vercel.app/payment-success.html?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: cancelUrl || 'https://lionx777.vercel.app/payment-cancel.html',
      allow_promotion_codes: true,
      billing_address_collection: 'auto'
    });

    return sendJson(res, 200, { url: session.url, sessionId: session.id });
  } catch (e) {
    return sendJson(res, 500, { error: 'Failed to create checkout: ' + e.message });
  }
};