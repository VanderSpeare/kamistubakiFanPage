import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Hero Section - Full screen video background */}
      <section className="relative h-screen flex items-center justify-center">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            src="https://kamitsubaki-anime.jp/assets/img/common/logo.png"
            alt="Logo"
            className="mx-auto mb-8 w-64 md:w-96"
          />

          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-5xl md:text-8xl font-bold tracking-wider mb-6"
          >
            神椿市建設中。
          </motion.h1>

          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-xl md:text-3xl mb-10 opacity-90"
          >
            KAMITSUBAKI CITY UNDER CONSTRUCTION.
          </motion.p>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <a
              href="https://www.youtube.com/watch?v=TB4BxQTXWgI"
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-lg font-medium hover:bg-white/30 transition"
            >
              Trailer
            </a>
            <a
              href="https://kamitsubaki-anime.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-4 bg-[#e60033] rounded-full text-lg font-medium hover:bg-[#c4002b] transition"
            >
              Official Site
            </a>
          </motion.div>
        </div>

        {/* Scroll down indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            ↓
          </motion.div>
        </motion.div>
      </section>

      {/* News Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-bold text-center mb-16"
        >
          NEWS
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10"
            >
              <div className="bg-gray-800 h-48" /> {/* Placeholder image */}
              <div className="p-6">
                <p className="text-sm text-gray-400 mb-2">2025.01.07</p>
                <h3 className="text-xl font-bold mb-2">Tiêu đề tin tức mẫu {i}</h3>
                <p className="text-gray-300">Mô tả ngắn về tin tức anime mới...</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Chào mừng user (nếu đã login) */}
      {user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 text-3xl"
        >
          Chào mừng {user.name.split(' ')[0]} trở lại! 🎉
        </motion.div>
      )}
    </div>
  );
}