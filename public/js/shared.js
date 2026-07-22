/* ============================================
   MINBAR — Shared Utilities
   ============================================ */

/* ── Safe HTML escaping (handles ', ", &, <, >) ── */
function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/* ── Safe attribute escaping (for onclick etc) ── */
function attr(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ── KV helpers ── */
var KV_API = '/api/kv';

async function kvGet(key) {
  try {
    var r = await fetch(KV_API + '?key=' + encodeURIComponent(key));
    if (!r.ok) return null;
    var data = await r.json();
    if (data && typeof data.value === 'string') { try { data.value = JSON.parse(data.value); } catch(e) {} }
    return data;
  } catch(e) { return null; }
}

async function kvSet(key, value) {
  try {
    await fetch(KV_API + '?key=' + encodeURIComponent(key), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: key, value: value })
    });
  } catch(e) {}
}

/* ── Time helpers ── */
function timeAgo(ts) {
  var diff = Date.now() - ts;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return Math.floor(diff/60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff/3600000) + 'h ago';
  return Math.floor(diff/86400000) + 'd ago';
}

function getCountdown(scheduledAt) {
  var diff = scheduledAt - Date.now();
  if (diff <= 0) return { text: 'NOW', cls: 'live', isLive: true };
  var h = Math.floor(diff / 3600000);
  var m = Math.floor((diff % 3600000) / 60000);
  var s = Math.floor((diff % 60000) / 1000);
  if (h > 24) {
    var d = Math.floor(h / 24);
    return { text: 'in ' + d + ' day' + (d > 1 ? 's' : ''), cls: 'later' };
  }
  if (h > 0) return { text: 'in ' + h + 'h ' + m + 'm', cls: h <= 2 ? 'soon' : 'later' };
  if (m > 0) return { text: 'in ' + m + 'm ' + s + 's', cls: 'soon' };
  return { text: 'in ' + s + 's', cls: 'soon' };
}

function formatTime12(time24) {
  if (!time24) return '--:--';
  var parts = time24.replace(/[^0-9:]/g, '').split(':');
  var h = parseInt(parts[0]) || 0;
  var m = parts[1] || '00';
  var ampm = h >= 12 ? 'PM' : 'AM';
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return { hour: h, min: m, ampm: ampm };
}

/* ── Toast notifications ── */
function toast(msg, type) {
  type = type || 'success';
  var w = document.getElementById('toastWrap');
  if (!w) {
    w = document.createElement('div');
    w.id = 'toastWrap';
    w.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
    document.body.appendChild(w);
  }
  var t = document.createElement('div');
  t.style.cssText = 'padding:12px 24px;border-radius:10px;font-size:13px;font-weight:500;box-shadow:0 8px 30px rgba(0,0,0,.3);animation:toastIn .3s ease;pointer-events:auto;white-space:nowrap;';
  t.style.background = type === 'success' ? '#0d9488' : type === 'error' ? '#ef4444' : '#111827';
  t.style.color = '#fff';
  t.textContent = msg;
  w.appendChild(t);
  setTimeout(function() { t.style.opacity='0'; t.style.transition='opacity .3s'; setTimeout(function(){t.remove();},300); }, 3000);
}

/* ── Session helpers ── */
function getSession() {
  try { return JSON.parse(localStorage.getItem('minbar_session') || '{}'); } catch(e) { return {}; }
}

function saveSession(s) {
  try { localStorage.setItem('minbar_session', JSON.stringify(s)); } catch(e) {}
}

function clearSession() {
  try { localStorage.removeItem('minbar_session'); } catch(e) {}
}
