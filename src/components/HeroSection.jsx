import { motion, useScroll, useTransform } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function HeroSection() {
  const { loginWithGoogle } = useAuth();
  const { scrollY } = useScroll();
  const posterY = useTransform(scrollY, [0, 1000], [0, -150]);

  return (
    <section id="home" className="relative h-screen flex items-center justify-center px-4">
      <motion.div style={{ y: posterY }} className="absolute inset-0">
        <img
          src="https://kamitsubaki-anime.jp/assets/img/top/main_visual.png"
          className="w-full h-full object-cover"
        />
      </motion.div>

      <div className="relative z-10 text-center">
        <motion.img
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          src="https://kamitsubaki-anime.jp/assets/img/common/logo.png"
          className="mx-auto mb-6 w-64 md:w-96"
        />

        <motion.h1
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-6xl md:text-8xl font-bold tracking-widest"
        >
          神椿市建設中。
        </motion.h1>

        <motion.button
          onClick={loginWithGoogle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-10 px-10 py-4 bg-white/20 backdrop-blur-md rounded-full"
        >
          Đăng nhập để khám phá
        </motion.button>
      </div>
    </section>
  );
}
