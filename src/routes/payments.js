const { Router } = require('express');
const { createPaymentOrder, verifyPayment } = require('../controllers/paymentController');

const router = Router();

router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);

module.exports = router;
