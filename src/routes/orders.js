const express = require('express');
const {
  createOrder,
  listOrders,
  trackOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', createOrder);
router.post('/track', trackOrders);
router.get('/', requireAuth, listOrders);
router.patch('/:id', requireAuth, updateOrderStatus);

module.exports = router;
