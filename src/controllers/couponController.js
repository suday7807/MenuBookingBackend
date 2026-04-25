const Coupon = require('../models/Coupon');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/coupons/validate
exports.validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Coupon code is required' });
  }
  if (typeof orderAmount !== 'number' || orderAmount <= 0) {
    return res.status(400).json({ error: 'Valid order amount is required' });
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

  if (!coupon) {
    return res.status(404).json({ error: 'Invalid coupon code' });
  }
  if (!coupon.isActive) {
    return res.status(400).json({ error: 'This coupon is no longer active' });
  }
  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    return res.status(400).json({ error: 'This coupon has expired' });
  }
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return res.status(400).json({ error: 'This coupon has reached its usage limit' });
  }
  if (orderAmount < coupon.minOrderAmount) {
    return res.status(400).json({
      error: `Minimum order amount is ₹${coupon.minOrderAmount}`,
    });
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = Math.round((orderAmount * coupon.discountValue) / 100);
    if (coupon.maxDiscount !== null) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = Math.min(coupon.discountValue, orderAmount);
  }

  res.json({
    valid: true,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discount,
    finalAmount: orderAmount - discount,
  });
});

// POST /api/coupons (admin — create coupon)
exports.createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json(coupon);
});

// GET /api/coupons (admin — list all coupons)
exports.listCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(coupons);
});

// PATCH /api/coupons/:id/use (increment usage — called after successful payment)
exports.useCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOneAndUpdate(
    { code: req.params.code.toUpperCase() },
    { $inc: { usedCount: 1 } },
    { new: true }
  );
  if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
  res.json(coupon);
});
