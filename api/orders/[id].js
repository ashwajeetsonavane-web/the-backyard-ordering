const { supabase } = require('../../lib');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    const id = req.query.id;

    const data = await supabase(
      `orders?order_id=eq.${encodeURIComponent(id)}&select=order_id,status,total,payment,updated_at&limit=1`,
      { method: 'GET' }
    );

    if (!data || !data.length) {
      return res.status(404).json({
        error: 'Not found'
      });
    }

    const order = data[0];

    return res.json({
      orderId: order.order_id,
      status: order.status,
      total: order.total,
      payment: order.payment,
      updatedAt: order.updated_at
    });

  } catch (e) {
    console.error(e);

    return res.status(500).json({
      error: 'Could not fetch order.'
    });
  }
};
