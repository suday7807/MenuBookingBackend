const QRCode = require('qrcode');
const asyncHandler = require('../utils/asyncHandler');

const clientOrigin = () => process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// GET /api/qr/:tableNumber
exports.generateQR = asyncHandler(async (req, res) => {
  const { tableNumber } = req.params;
  const menuUrl = `${clientOrigin()}/menu?table=${tableNumber}`;
  const qrDataUrl = await QRCode.toDataURL(menuUrl, {
    width: 400,
    margin: 2,
    color: { dark: '#ac2c00', light: '#ffffff' },
  });
  res.json({ tableNumber, qrDataUrl, menuUrl });
});

// GET /api/qr?count=10
exports.generateBulkQR = asyncHandler(async (req, res) => {
  const count = Math.min(Number(req.query.count) || 10, 50);
  const results = [];
  for (let i = 1; i <= count; i++) {
    const menuUrl = `${clientOrigin()}/menu?table=${i}`;
    const qrDataUrl = await QRCode.toDataURL(menuUrl, {
      width: 400,
      margin: 2,
      color: { dark: '#ac2c00', light: '#ffffff' },
    });
    results.push({ tableNumber: String(i), qrDataUrl, menuUrl });
  }
  res.json(results);
});
