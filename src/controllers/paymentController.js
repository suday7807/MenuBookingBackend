const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');
const { computeOrderPricing } = require('../utils/orderPricing');

// POST /api/payments/create-order
// Client sends items + couponCode. Server recomputes the real total
// from DB prices and creates a Razorpay order for that amount.
exports.createPaymentOrder = asyncHandler(async (req, res) => {
  const { items, couponCode } = req.body;

  let pricing;
  try {
    pricing = await computeOrderPricing({ items, couponCode });
  } catch (err) {
    if (err && err.status) return res.status(err.status).json({ error: err.message });
    throw err;
  }

  if (pricing.total <= 0) {
    return res.status(400).json({ error: 'Order total must be greater than zero' });
  }

  const order = await razorpay.orders.create({
    amount: Math.round(pricing.total * 100), // paise
    currency: 'INR',
    receipt: `rcpt_${Date.now()}`,
  });

  res.json({
    razorpayOrderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    // Echo the verified breakdown so the client can show it before checkout.
    pricing: {
      subtotal: pricing.subtotal,
      tax: pricing.tax,
      taxRate: pricing.taxRate,
      discount: pricing.discount,
      total: pricing.total,
      couponCode: pricing.couponCode,
    },
  });
});

// POST /api/payments/verify
exports.verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    items,
    tableNumber,
    couponCode,
  } = req.body;

  // Verify signature
  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSig !== razorpay_signature) {
    return res.status(400).json({ error: 'Payment verification failed' });
  }

  // Guard against duplicate orders
  const existing = await Order.findOne({ razorpay_order_id });
  if (existing) {
    return res.json(existing);
  }

  if (!tableNumber) {
    return res.status(400).json({ error: 'tableNumber is required' });
  }

  // Recompute pricing server-side — never trust client totals.
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
    tableNumber: String(tableNumber),
    razorpay_order_id,
    razorpay_payment_id,
    payment_status: 'Paid',
  });

  res.status(201).json(order);
});
