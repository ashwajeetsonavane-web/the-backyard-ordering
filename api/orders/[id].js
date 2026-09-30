const { supabase } = require('../../lib');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    const id = String(req.query.id || '').trim();

    if (!id) {
      return res.status(400).json({
        error: 'Order ID is required'
      });
    }

    const data = await supabase(
      `orders?order_id=eq.${encodeURIComponent(id)}&select=order_id,status,total,payment,payment_method&limit=1`,
      {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      }
    );

    console.log(
      'TRACKING ORDER:',
      id,
      JSON.stringify(data)
    );

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    const order = data[0];

    return res.json({
      orderId: order.order_id,
      status: order.status || 'NEW',
      total: order.total,
      payment: order.payment || order.payment_method
    });

  } catch (e) {
    console.error('TRACKING ERROR:', e);

    return res.status(500).json({
      error: 'Could not fetch order.'
    });
  }
};
