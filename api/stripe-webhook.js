const Stripe = require('stripe');
const { MongoClient } = require('mongodb');
const { sendJson, setSecurityHeaders } = require('./_helpers');

let _cachedClient = null;
async function getDb() {
  if (_cachedClient) {
    try { await _cachedClient.db().command({ ping: 1 }); return _cachedClient.db(process.env.DB_NAME || 'minbar'); }
    catch (e) { try { await _cachedClient.close(); } catch (x) {} _cachedClient = null; }
  }
  _cachedClient = await new MongoClient(process.env.MONGO_URL).connect();
  return _cachedClient.db(process.env.DB_NAME || 'minbar');
}

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

async function kvPush(key, item) {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.collection('kv_store').updateOne(
    { key },
    { $push: { value: item } },
    { upsert: true }
  );
}

const PLAN_NAMES = { pro: 'Pro', premium: 'Premium' };

module.exports = async function handler(req, res) {
  setSecurityHeaders(res);
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey) return sendJson(res, 500, { error: 'Payments not configured' });

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
            email: email,
            name: name || '',
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
          var entry = { email: email, name: name || email, plan: plan || 'unknown', status: 'active', created: Date.now() };
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
        // Find email from customer mapping
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
          // Update master list
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
};
