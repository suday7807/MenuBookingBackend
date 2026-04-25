const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// Configurable via .env, defaults to 5% GST.
const TAX_RATE = parseFloat(process.env.TAX_RATE || '0.05');

/**
 * Authoritative server-side pricing.
 * Takes client-supplied items + optional couponCode, rebuilds every line
 * from the DB (so prices can't be tampered with), recomputes the discount,
 * and returns { items, subtotal, discount, tax, taxRate, total, couponCode }.
 *
 * Throws { status, message } on any validation failure — callers should
 * forward that to the response.
 */
async function computeOrderPricing({ items, couponCode }) {
  if (!Array.isArray(items) || items.length === 0) {
    throw { status: 400, message: 'items must be a non-empty array' };
  }

  // Collect and validate product IDs
  const ids = items.map((it) => it.productId || it._id).filter(Boolean);
  if (ids.length !== items.length) {
    throw { status: 400, message: 'Every item must include a productId' };
  }

  const products = await Product.find({ _id: { $in: ids } });
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  const rebuiltItems = [];
  let subtotal = 0;

  for (const it of items) {
    const pid = String(it.productId || it._id);
    const product = productMap.get(pid);
    if (!product) {
      throw { status: 400, message: `Product ${pid} not found` };
    }
    if (product.isAvailable === false) {
      throw { status: 400, message: `${product.name} is no longer available` };
    }
    const qty = Number(it.quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      throw { status: 400, message: `Invalid quantity for ${product.name}` };
    }
    rebuiltItems.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: qty,
    });
    subtotal += product.price * qty;
  }

  // Re-validate and recompute discount from the Coupon record, if any.
  let discount = 0;
  let appliedCouponCode = null;
  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: String(couponCode).toUpperCase().trim(),
    });
    if (!coupon || !coupon.isActive) {
      throw { status: 400, message: 'Coupon is invalid or inactive' };
    }
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      throw { status: 400, message: 'Coupon has expired' };
    }
    if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
      throw { status: 400, message: 'Coupon usage limit reached' };
    }
    if (subtotal < coupon.minOrderAmount) {
      throw {
        status: 400,
        message: `Minimum order ₹${coupon.minOrderAmount} required for this coupon`,
      };
    }
    if (coupon.discountType === 'percentage') {
      discount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount != null) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = Math.min(coupon.discountValue, subtotal);
    }
    appliedCouponCode = coupon.code;
  }

  // Tax is computed on the post-discount taxable value.
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * TAX_RATE);
  const total = taxable + tax;

  return {
    items: rebuiltItems,
    subtotal,
    discount,
    tax,
    taxRate: TAX_RATE,
    total,
    couponCode: appliedCouponCode,
  };
}

module.exports = { computeOrderPricing, TAX_RATE };
