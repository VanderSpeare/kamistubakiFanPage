const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Người nhận
  type: { type: String, enum: ['like', 'comment', 'follow'], required: true },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Người gây ra
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }, // Nếu liên quan post
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);