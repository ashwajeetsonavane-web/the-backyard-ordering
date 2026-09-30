const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function env(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function db() {
  return createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function menu() {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'menu.json'), 'utf8'));
}

function validPhone(p) { return /^[0-9]{10}$/.test(String(p || '')); }
function adminOk(req) { return Boolean(process.env.ADMIN_KEY && req.headers['x-admin-key'] === process.env.ADMIN_KEY); }

async function notifyWhatsApp(order) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const to = process.env.ADMIN_WHATSAPP || '917397964842';
  if (!token || !phoneId) return;
  const lines = (order.items || []).map(i => `• ${i.name} × ${i.qty} = ₹${i.price * i.qty}`).join('\n');
  const body = `🔔 NEW ORDER ${order.order_id}\n\n${order.customer_name} | ${order.customer_phone}\n\n${lines}\n\nTOTAL: ₹${order.total}\nPayment: ${order.payment}\nLocation: ${order.customer_location}${order.note ? `\nNote: ${order.note}` : ''}`;
  try {
    const r = await fetch(`https://graph.facebook.com/v23.0/${phoneId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body } })
    });
    if (!r.ok) console.error('WhatsApp error:', await r.text());
  } catch (e) { console.error('WhatsApp notification failed:', e); }
}

module.exports = { db, menu, validPhone, adminOk, notifyWhatsApp };
