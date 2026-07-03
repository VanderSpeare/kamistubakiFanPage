const User = require('../Models/User.js');
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