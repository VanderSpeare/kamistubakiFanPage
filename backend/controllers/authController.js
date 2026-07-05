const User = require('../models/User.js'); // NOTE: changed from '../Models/User.js' — pick one casing
                                            // project-wide. This works on Windows/Mac (case-insensitive
                                            // filesystems) either way, but a case-sensitive Linux prod
                                            // server will 500 on whichever path doesn't match the real
                                            // folder name. Confirm your actual folder is "models" (lowercase)
                                            // and update any other file still importing "../Models/...".
const generateToken = require('../utils/generateToken');

// Sau khi Google xác thực thành công
exports.googleCallback = async (req, res) => {
  try {
    const user = req.user; // từ passport

    // Tạo token JWT
    const token = generateToken(user._id);

    // Gửi token về frontend (redirect hoặc API)
    res.redirect(`http://localhost:5173/?token=${token}`);
  } catch (err) {
    res.redirect('http://localhost:5173/login?error=auth_failed');
  }
};

// ============================================================================
// getMe — NEW. Lets the frontend ask "who am I / am I an admin?" using the
// token it already has, instead of re-checking a password on every visit.
// This is what the shop's Admin panel now calls to decide whether to show
// the dashboard or bounce the visitor.
//
// Mount as: router.get('/me', protect, authController.getMe);
// in whichever routes file currently has googleCallback wired up.
// ============================================================================
exports.getMe = async (req, res) => {
  // req.user is attached by the `protect` middleware
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    avatar: req.user.avatar,
    isAdmin: Boolean(req.user.isAdmin),
  });
};