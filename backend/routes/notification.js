const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
//const auth = require('../middleware/auth'); // Tạo sau nếu cần bảo vệ

// Lấy thông báo của user hiện tại
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.query.userId })
      .populate('fromUser', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = await Notification.countDocuments({ user: req.query.userId, read: false });

    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Đánh dấu đã đọc
router.patch('/read', async (req, res) => {
  try {
    await Notification.updateMany({ user: req.body.userId, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
