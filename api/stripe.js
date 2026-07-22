const Stripe = require('stripe');
const { sendJson, setCors, rateLimit, readBody, setSecurityHeaders, getDb, getStripeKey } = require('./_helpers');

async function kvSet(key, value) {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.collection('kv_store').updateOne(
    { key },
    { $set: { key, value, updated_at: now }, $setOnInsert: { created_at: now } },
    { upsert: true }
  );
}

async function kvGet(key) {
  const db = await getDb();
  const doc = await db.collection('kv_store').findOne({ key });
  return doc ? doc.value : null;
}

const PLAN_NAMES = { pro: 'Pro', premium: 'Premium' };

async function getPlan(planName) {
  var priceId = process.env['STRIPE_PRO_PRICE_ID'] || (await getStripeKey('STRIPE_PRO_PRICE_ID'));
  var premiumPriceId = process.env['STRIPE_PREMIUM_PRICE_ID'] || (await getStripeKey('STRIPE_PREMIUM_PRICE_ID'));
  return {
    pro: { priceId, name: 'Pro' },
    premium: { priceId: premiumPriceId, name: 'Premium' }
  }[planName] || null;
}

async function handleBookingCheckout(req, res, secretKey) {
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
      cancel_url: origin + '/payment-cancel.html?teacherId=' + encodeURIComponent(teacherId || teacherEmail || ''),
      allow_promotion_codes: true
    });

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
}

async function handleStripeCheckout(req, res, secretKey) {
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
        card: { request_three_d_secure: 'any' }
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
}

async function handleStripeSession(req, res, secretKey) {
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
}

async function handleStripeSubscribe(req, res, secretKey) {
  let body;
  try { body = await readBody(req); } catch (e) { return sendJson(res, 400, { error: 'Invalid JSON' }); }

  const { plan, email, name, paymentMethodId } = body;

  const selectedPlan = await getPlan(plan);
  if (!plan || !selectedPlan) return sendJson(res, 400, { error: 'Invalid plan. Use: pro, premium' });
  if (!email) return sendJson(res, 400, { error: 'Email required' });

  const stripe = new Stripe(secretKey);

  try {
    var customers = await stripe.customers.list({ email, limit: 1 });
    var customer = customers.data.length > 0 ? customers.data[0] : await stripe.customers.create({ email, name: name || '', metadata: { plan, email, name: name || '' } });

    if (paymentMethodId) {
      await stripe.paymentMethods.attach(paymentMethodId, { customer: customer.id });
      await stripe.customers.update(customer.id, { invoice_settings: { default_payment_method: paymentMethodId } });
    }

    var subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: selectedPlan.priceId }],
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
}

async function handleStripeWebhook(req, res, secretKey) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripe = new Stripe(secretKey);
  let event;

  if (webhookSecret) {
    const sig = req.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (e) {
      return sendJson(res, 400, { error: 'Invalid signature' });
    }
  } else {
    try {
      event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (e) {
      return sendJson(res, 400, { error: 'Invalid body' });
    }
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { plan, email, name } = session.metadata || {};
        if (email) {
          await kvSet('stripe:customer:' + email, {
            customerId: session.customer,
            email, name: name || '',
            plan: plan || 'unknown',
            created: Date.now()
          });
          var subData = {
            plan: plan || 'unknown',
            planLabel: PLAN_NAMES[plan] || plan || 'Unknown',
            status: 'active',
            stripeSubId: session.subscription,
            stripeCustomerId: session.customer,
            currentPeriodStart: Date.now(),
            currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
            cancelAtPeriodEnd: false,
            created: Date.now(),
            updated: Date.now()
          };
          await kvSet('stripe:subscription:' + email, subData);
          var allSubs = await kvGet('stripe:subscriptions:all') || [];
          var idx = allSubs.findIndex(function(s) { return s.email === email; });
          var entry = { email, name: name || email, plan: plan || 'unknown', status: 'active', created: Date.now() };
          if (idx >= 0) { allSubs[idx] = entry; } else { allSubs.push(entry); }
          await kvSet('stripe:subscriptions:all', allSubs);
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const customerId = sub.customer;
        var subEmail = null;
        var allKeys = await (await getDb()).collection('kv_store').find({ key: { $regex: /^stripe:customer:/ } }).project({ key: 1, value: 1 }).toArray();
        for (var i = 0; i < allKeys.length; i++) {
          if (allKeys[i].value && allKeys[i].value.customerId === customerId) {
            subEmail = allKeys[i].key.replace('stripe:customer:', '');
            break;
          }
        }
        if (subEmail) {
          var status = sub.status === 'active' ? 'active' : (sub.status === 'past_due' ? 'past_due' : (sub.status === 'canceled' || sub.status === 'unpaid' ? 'canceled' : sub.status));
          var subData = {
            plan: sub.metadata?.plan || 'unknown',
            planLabel: PLAN_NAMES[sub.metadata?.plan] || 'Unknown',
            status: status,
            stripeSubId: sub.id,
            stripeCustomerId: customerId,
            currentPeriodStart: (sub.current_period_start || 0) * 1000,
            currentPeriodEnd: (sub.current_period_end || 0) * 1000,
            cancelAtPeriodEnd: sub.cancel_at_period_end || false,
            created: (sub.start_date || 0) * 1000,
            updated: Date.now()
          };
          await kvSet('stripe:subscription:' + subEmail, subData);
          var allSubs = await kvGet('stripe:subscriptions:all') || [];
          var idx = allSubs.findIndex(function(s) { return s.email === subEmail; });
          var entry = { email: subEmail, plan: subData.plan, status: status, created: subData.created };
          if (idx >= 0) { allSubs[idx] = entry; } else { allSubs.push(entry); }
          await kvSet('stripe:subscriptions:all', allSubs);
        }
        break;
      }

      case 'invoice.paid':
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const custId = invoice.customer;
        const invEmail = invoice.customer_email || invoice.billing_reason || '';
        var invoiceEmail = invEmail;
        if (!invoiceEmail || !invoiceEmail.includes('@')) {
          var allKeys = await (await getDb()).collection('kv_store').find({ key: { $regex: /^stripe:customer:/ } }).project({ key: 1, value: 1 }).toArray();
          for (var i = 0; i < allKeys.length; i++) {
            if (allKeys[i].value && allKeys[i].value.customerId === custId) {
              invoiceEmail = allKeys[i].key.replace('stripe:customer:', '');
              break;
            }
          }
        }
        if (invoiceEmail && invoiceEmail.includes('@')) {
          var invoiceRecord = {
            id: invoice.id || 'inv_' + Date.now(),
            amount: (invoice.amount_paid || invoice.amount_due || 0) / 100,
            currency: (invoice.currency || 'usd').toUpperCase(),
            status: event.type === 'invoice.paid' ? 'paid' : 'failed',
            paid: event.type === 'invoice.paid',
            created: (invoice.created || 0) * 1000,
            invoiceUrl: invoice.hosted_invoice_url || '',
            pdfUrl: invoice.invoice_pdf || '',
            number: invoice.number || '',
            subscription: invoice.subscription || ''
          };
          var existing = await kvGet('stripe:invoices:' + invoiceEmail) || [];
          existing.unshift(invoiceRecord);
          await kvSet('stripe:invoices:' + invoiceEmail, existing);
        }
        break;
      }
    }
    return sendJson(res, 200, { received: true });
  } catch (e) {
    return sendJson(res, 500, { error: 'Webhook handler error: ' + e.message });
  }
}

async function handleSetupPayments(req, res) {
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
}

module.exports = async function handler(req, res) {
  setSecurityHeaders(res);

  var path = (req.url || '').split('?')[0].replace(/\/+$/, '');
  var method = req.method;
  var ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';

  switch (path) {
    case '/api/booking-checkout':
      setCors(res, req.headers?.origin);
      if (method === 'OPTIONS') return sendJson(res, 200, { ok: true });
      if (method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
      if (!rateLimit(ip, 'booking-checkout', { max: 20, windowMs: 60000 })) {
        return sendJson(res, 429, { error: 'Too many requests' });
      }
      var secretKey = process.env.STRIPE_SECRET_KEY || (await getStripeKey('STRIPE_SECRET_KEY'));
      if (!secretKey) return sendJson(res, 500, { error: 'Payments not configured', hint: 'set STRIPE_SECRET_KEY in Vercel env or use /setup-payments.html' });
      return handleBookingCheckout(req, res, secretKey);

    case '/api/stripe-checkout':
      setCors(res, req.headers?.origin);
      if (method === 'OPTIONS') return sendJson(res, 200, { ok: true });
      if (method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
      if (!rateLimit(ip, 'stripe-checkout', { max: 20, windowMs: 60000 })) {
        return sendJson(res, 429, { error: 'Too many requests' });
      }
      var secretKey = process.env.STRIPE_SECRET_KEY || (await getStripeKey('STRIPE_SECRET_KEY'));
      if (!secretKey) return sendJson(res, 500, { error: 'Payments not configured', hint: 'set STRIPE_SECRET_KEY in Vercel env or use /setup-payments.html' });
      return handleStripeCheckout(req, res, secretKey);

    case '/api/stripe-session':
      if (method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });
      var secretKey = process.env.STRIPE_SECRET_KEY;
      if (!secretKey) return sendJson(res, 500, { error: 'Payments not configured' });
      return handleStripeSession(req, res, secretKey);

    case '/api/stripe-subscribe':
      setCors(res, req.headers?.origin);
      if (method === 'OPTIONS') return sendJson(res, 200, { ok: true });
      if (method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
      if (!rateLimit(ip, 'stripe-subscribe', { max: 20, windowMs: 60000 })) {
        return sendJson(res, 429, { error: 'Too many requests' });
      }
      var secretKey = process.env.STRIPE_SECRET_KEY || (await getStripeKey('STRIPE_SECRET_KEY'));
      if (!secretKey) return sendJson(res, 500, { error: 'Payments not configured', hint: 'set STRIPE_SECRET_KEY in Vercel env or use /setup-payments.html' });
      return handleStripeSubscribe(req, res, secretKey);

    case '/api/stripe-webhook':
      if (method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
      var secretKey = process.env.STRIPE_SECRET_KEY;
      if (!secretKey) return sendJson(res, 500, { error: 'Payments not configured' });
      return handleStripeWebhook(req, res, secretKey);

    case '/api/setup-payments':
      setCors(res, req.headers?.origin);
      if (method === 'OPTIONS') return sendJson(res, 200, { ok: true });
      if (method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
      if (!rateLimit(ip, 'setup-payments', { max: 10, windowMs: 60000 })) {
        return sendJson(res, 429, { error: 'Too many requests' });
      }
      return handleSetupPayments(req, res);

    default:
      return sendJson(res, 404, { error: 'Not found' });
  }
};
