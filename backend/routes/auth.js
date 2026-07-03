const express = require('express');
const passport = require('passport');
const { googleCallback } = require('../controllers/authController');

const router = express.Router();

// Bắt đầu đăng nhập Google
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Callback từ Google
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  googleCallback
);

// API lấy thông tin user hiện tại (sau khi login)
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-__v');
    res.json(user);
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;