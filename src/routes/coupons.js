const express = require('express');
const {
  validateCoupon,
  createCoupon,
  listCoupons,
  useCoupon,
} = require('../controllers/couponController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Public — validate a coupon code
router.post('/validate', validateCoupon);

// Admin — manage coupons
router.post('/', requireAuth, createCoupon);
router.get('/', requireAuth, listCoupons);
router.patch('/:code/use', useCoupon);

module.exports = router;
