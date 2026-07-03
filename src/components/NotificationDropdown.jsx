import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const socket = io('http://localhost:5000');

export default function NotificationDropdown({ isOpen, onToggle }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    socket.emit('register', user._id);

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/notifications?userId=${user._id}`);
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      } catch (err) {
        console.error('Fetch notifications error:', err);
      }
    };

    fetchNotifications();

    socket.on('newNotification', (newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => socket.off('newNotification');
  }, [user]);

  const markAsRead = async () => {
    try {
      await axios.patch('http://localhost:5000/api/notifications/read', { userId: user._id });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      {/* Nút chuông - giữ nguyên thiết kế IconButton đẹp nhất có thể */}
      <motion.button
        whileHover={{ scale: 1.15, y: -4 }}
        whileTap={{ scale: 0.9 }}
        onClick={onToggle}
        className="relative w-12 h-12 rounded-full bg-gray-100/80 backdrop-blur-md flex items-center justify-center text-2xl hover:bg-gradient-to-br hover:from-[#667eea]/20 hover:to-[#764ba2]/20 hover:text-[#667eea] hover:shadow-lg transition-all duration-300"
        title="Thông báo"
      >
        🔔

        {/* Badge số lượng - nằm đúng góc trên phải */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse shadow-md border-2 border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </motion.button>

      {/* Dropdown popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="absolute right-0 mt-4 w-96 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-lg">Thông báo</h3>
              {unreadCount > 0 && (
                <button onClick={markAsRead} className="text-sm text-[#667eea] hover:underline font-medium">
                  Đánh dấu đã đọc
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-12 text-center text-gray-500">Chưa có thông báo nào</div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className={`p-5 border-b border-gray-100 hover:bg-gradient-to-r hover:from-[#667eea]/5 hover:to-[#764ba2]/5 transition-all ${!notif.read ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className="flex gap-4">
                      <img
                        src={notif.fromUser?.avatar || 'https://via.placeholder.com/40'}
                        alt={notif.fromUser?.name}
                        className="w-10 h-10 rounded-full ring-2 ring-gray-200 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 text-sm">
                          <strong>{notif.fromUser?.name || 'Ai đó'}</strong> {notif.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notif.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}