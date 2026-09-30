const { supabase, menu, validPhone, notifyWhatsApp } = require('../lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customer, items, payment, note } = req.body || {};

    if (
      !customer?.name ||
      !validPhone(customer.phone) ||
      !customer.location ||
      !Array.isArray(items) ||
      !items.length ||
      !['UPI', 'COD'].includes(payment)
    ) {
      return res.status(400).json({
        error: 'Please complete all required fields.'
      });
    }

    const m = menu();

    const clean = items.map(i => {
      const x = m.find(v => v.name === i.name);
      const q = Math.max(1, Math.min(20, parseInt(i.qty, 10)));

      if (!x || !q) throw new Error('Invalid item');

      return {
        name: x.name,
        price: x.price,
        qty: q
      };
    });

    const total = Math.round(
      clean.reduce((s, i) => s + i.price * i.qty, 0) * 100
    ) / 100;

    const order = {
      order_id: `TB${Date.now().toString().slice(-8)}`,
      customer_name: String(customer.name).slice(0, 80),
      customer_phone: String(customer.phone),
      customer_location: String(customer.location).slice(0, 500),
      items: clean,
      payment,
      note: String(note || '').slice(0, 300),
      total,
      status: 'NEW'
    };

    const { data, error } = await supabase('orders', {
      method: 'POST',
      headers: {
        Prefer: 'return=representation'
      },
      body: JSON.stringify(order)
    });

    if (error) throw error;

    const created = Array.isArray(data) ? data[0] : data;

    notifyWhatsApp(created).catch(console.error);

    return res.json({
      orderId: created.order_id,
      total: created.total
    });

  } catch (e) {
    console.error(e);

    return res.status(500).json({
      error: 'Could not place order. Please try again.'
    });
  }
};
