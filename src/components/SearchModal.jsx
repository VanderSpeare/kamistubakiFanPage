import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/search?q=${encodeURIComponent(query)}`);
        setResults(res.data);
      } catch (err) {
        console.error('Search error:', err);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  // Đóng khi click overlay hoặc Esc
  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && onClose();
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-3xl z-50"
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
              {/* Input */}
              <div className="p-6">
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl">🔍</span>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tìm kiếm bài viết, dịch vụ, sản phẩm..."
                    className="w-full pl-16 pr-12 py-5 text-lg bg-gray-100 rounded-2xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#667eea]/30 transition-all"
                    autoFocus
                  />
                  {query && (
                    <button onClick={() => setQuery('')} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto border-t border-gray-200">
                {loading && <div className="p-12 text-center text-gray-500">Đang tìm kiếm...</div>}
                {!loading && results.length === 0 && query && <div className="p-12 text-center text-gray-500">Không tìm thấy kết quả</div>}
                {!loading && results.map((item) => (
                  <a
                    key={item._id}
                    href={`/post/${item.slug || item._id}`}
                    onClick={onClose}
                    className="block px-8 py-5 hover:bg-gradient-to-r hover:from-[#667eea]/10 hover:to-[#764ba2]/10 transition-all border-b border-gray-100 last:border-0"
                  >
                    <h3 className="font-semibold text-gray-800">{item.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.content}</p>
                  </a>
                ))}
                {!query && (
                  <div className="p-12 text-center text-gray-400">
                    Gõ từ khóa để bắt đầu tìm kiếm
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}