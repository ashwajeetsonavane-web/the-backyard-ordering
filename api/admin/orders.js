const { supabase, adminOk } = require('../../lib');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
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
    const data = await supabase(
      'orders?select=*&order=created_at.desc'
    );

    return res.json({
      orders: Array.isArray(data) ? data : []
    });

  } catch (e) {
    console.error('ADMIN ORDERS ERROR:', e);

    return res.status(500).json({
      error: 'Could not load orders.'
    });
  }
};
