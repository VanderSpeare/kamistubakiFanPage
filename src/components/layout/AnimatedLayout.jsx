import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const pageVariants = {
  initial: { opacity: 0, scale: 0.96, y: 30 },
  in: { opacity: 1, scale: 1, y: 0 },
  out: { opacity: 0, scale: 0.96, y: -30 }
};

export default function AnimatedLayout({ children }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="pt-24 max-w-7xl mx-auto px-6 text-white min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}