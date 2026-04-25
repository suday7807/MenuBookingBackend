const { Router } = require('express');
const { generateQR, generateBulkQR } = require('../controllers/qrController');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.get('/', requireAuth, generateBulkQR);
router.get('/:tableNumber', requireAuth, generateQR);

module.exports = router;
