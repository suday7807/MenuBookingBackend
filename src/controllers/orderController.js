const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');
const { computeOrderPricing } = require('../utils/orderPricing');

// POST /api/orders
exports.createOrder = asyncHandler(async (req, res) => {
  const { items, tableNumber, couponCode } = req.body;

  if (!tableNumber || typeof tableNumber !== 'string') {
    return res.status(400).json({ error: 'tableNumber is required' });
  }

  let pricing;
  try {
    pricing = await computeOrderPricing({ items, couponCode });
  } catch (err) {
    if (err && err.status) return res.status(err.status).json({ error: err.message });
    throw err;
  }

  const order = await Order.create({
    items: pricing.items,
    subtotal: pricing.subtotal,
    tax: pricing.tax,
    taxRate: pricing.taxRate,
    total: pricing.total,
    discount: pricing.discount,
    couponCode: pricing.couponCode,
    tableNumber,
  });

  res.status(201).json(order);
});

// GET /api/orders
exports.listOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

// POST /api/orders/track  — public, fetch orders by array of IDs
exports.trackOrders = asyncHandler(async (req, res) => {
  const { orderIds } = req.body;
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return res.status(400).json({ error: 'orderIds must be a non-empty array' });
  }
  const orders = await Order.find({ _id: { $in: orderIds } }).sort({ createdAt: -1 });
  res.json(orders);
});

// PATCH /api/orders/:id
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['Pending', 'Preparing', 'Completed'].includes(status)) {
    return res.status(400).json({ error: 'status must be Pending, Preparing, or Completed' });
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  if (!order) return res.status(404).json({ error: 'Order not found' });

  res.json(order);
});
