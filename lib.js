const fs = require('fs');
const path = require('path');

function env(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

async function supabase(pathname, options = {}) {
  const base = env('SUPABASE_URL').replace(/\/$/, '');
  const key = env('SUPABASE_SERVICE_ROLE_KEY');

  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(
    `${base}/rest/v1/${pathname}`,
    {
      ...options,
      headers
    }
  );

  const text = await response.text();

  let data;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error_description ||
      data?.hint ||
      'Supabase request failed';

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

function menu() {
  return JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), 'menu.json'),
      'utf8'
    )
  );
}

function validPhone(p) {
  return /^[0-9]{10}$/.test(String(p || ''));
}

function adminOk(req) {
  return Boolean(
    process.env.ADMIN_KEY &&
    req.headers['x-admin-key'] === process.env.ADMIN_KEY
  );
}

async function notifyWhatsApp(order) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const to = process.env.ADMIN_WHATSAPP || '917397964842';

  if (!token || !phoneId) return;

  const lines = (order.items || [])
    .map(
      i => `• ${i.name} × ${i.qty} = ₹${i.price * i.qty}`
    )
    .join('\n');

  const body =
    `🔔 NEW ORDER ${order.order_id}\n\n` +
    `${order.customer_name} | ${order.customer_phone}\n\n` +
    `${lines}\n\n` +
    `TOTAL: ₹${order.total}\n` +
    `Payment: ${order.payment}\n` +
    `Location: ${order.customer_location}` +
    (order.note ? `\nNote: ${order.note}` : '');

  try {
    const r = await fetch(
      `https://graph.facebook.com/v23.0/${phoneId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: {
            body
          }
        })
      }
    );

    if (!r.ok) {
      console.error(
        'WhatsApp error:',
        await r.text()
      );
    }
  } catch (e) {
    console.error(
      'WhatsApp notification failed:',
      e
    );
  }
}

module.exports = {
  supabase,
  menu,
  validPhone,
  adminOk,
  notifyWhatsApp
};
