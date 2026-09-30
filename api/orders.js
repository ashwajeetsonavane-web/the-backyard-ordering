const { supabase, menu, validPhone, notifyWhatsApp } = require('../lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    const { customer, items, payment, note } = req.body || {};

    // Validate request
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

    // Flatten menu categories into individual products
    const m = menu().flatMap(category => category.items || []);

    // Validate and clean cart items
    const clean = items.map(i => {
      const itemName = String(i.name || '').trim();

      const x = m.find(v =>
        String(v.name || '').trim().toLowerCase() ===
        itemName.toLowerCase()
      );

      const q = Math.max(
        1,
        Math.min(20, parseInt(i.qty, 10))
      );

      if (!x || !q) {
        console.error(
          'INVALID ITEM FROM FRONTEND:',
          JSON.stringify(i)
        );

        console.error(
          'MENU NAMES:',
          JSON.stringify(m.map(v => v.name))
        );

        throw new Error('Invalid item');
      }

      return {
        name: x.name,
        price: x.price,
        qty: q
      };
    });

    // Calculate total from server-side menu prices
    const total =
      Math.round(
        clean.reduce(
          (sum, item) =>
            sum + item.price * item.qty,
          0
        ) * 100
      ) / 100;

    // Build order
    const order = {
      order_id: `TB${Date.now().toString().slice(-8)}`,

      customer_name:
        String(customer.name).slice(0, 80),

      customer_phone:
        String(customer.phone),

      // Existing required column
      phone:
        String(customer.phone),

      customer_location:
        String(customer.location).slice(0, 500),

      // Existing required column
      location:
        String(customer.location).slice(0, 500),

      items: clean,

      payment,

      // Existing required column
      payment_method:
        payment,

      note:
        String(note || '').slice(0, 300),

      total,

      // Existing required column
      subtotal:
        total,

      status: 'NEW'
    };

    // Insert order into Supabase
    const data = await supabase('orders', {
      method: 'POST',

      headers: {
        Prefer: 'return=representation'
      },

      body: JSON.stringify(order)
    });

    const created =
      Array.isArray(data)
        ? data[0]
        : data;

    if (!created || !created.order_id) {
      console.error(
        'Supabase returned:',
        JSON.stringify(data)
      );

      throw new Error(
        'Order was created but no order ID was returned.'
      );
    }

    // Optional WhatsApp notification
    notifyWhatsApp(created).catch(console.error);

    // Send confirmation to website
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
