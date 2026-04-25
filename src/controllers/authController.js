const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Staff = require('../models/Staff');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const staff = await Staff.findOne({ username: username.toLowerCase().trim() });
  if (!staff) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const match = await bcrypt.compare(password, staff.passwordHash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { staffId: staff._id },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({ token, username: staff.username });
});
