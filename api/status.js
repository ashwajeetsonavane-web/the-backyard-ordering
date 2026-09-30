const { supabase, adminOk } = require('../../lib');

const allowedStatuses = [
  'NEW',
  'ACCEPTED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'COMPLETED',
  'CANCELLED'
];

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  if (!adminOk(req)) {
    return res.status(401).json({
      error: 'Unauthorized'
    });
  }

  try {
    const { orderId, status } = req.body || {};

    if (!orderId || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid order or status.'
      });
    }

    const data = await supabase(
      `orders?order_id=eq.${encodeURIComponent(orderId)}`,
      {
        method: 'PATCH',
        headers: {
          Prefer: 'return=representation'
        },
        body: JSON.stringify({
          status
        })
      }
    );

    if (!Array.isArray(data) || !data.length) {
      return res.status(404).json({
        error: 'Order not found.'
      });
    }

    return res.json({
      success: true,
      order: data[0]
    });

  } catch (e) {
    console.error('STATUS UPDATE ERROR:', e);

    return res.status(500).json({
      error: 'Could not update order status.'
    });
  }
};
