require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const searchRoutes = require('./Routes/Search');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/search', searchRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
const Notification = require('./models/Notification');

const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: "http://localhost:5173" }
});

const userSockets = {}; // Lưu socket.id theo user._id

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('register', (userId) => {
    userSockets[userId] = socket.id;
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on('disconnect', () => {
    for (let userId in userSockets) {
      if (userSockets[userId] === socket.id) {
        delete userSockets[userId];
      }
    }
  });
});

// Hàm gửi thông báo realtime (dùng ở các route khác khi có like/comment)
global.sendNotification = async (toUserId, notificationData) => {
  const notification = await Notification.create({
    user: toUserId,
    ...notificationData
  });

  await notification.populate('fromUser', 'name avatar');

  const socketId = userSockets[toUserId];
  if (socketId) {
    io.to(socketId).emit('newNotification', notification);
  }
};

// Routes
app.use('/api/notifications', require('./routes/notification'));

// ... mongoose connect

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));