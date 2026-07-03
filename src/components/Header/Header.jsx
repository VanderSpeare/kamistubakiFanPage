import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const navItems = ["Home", "About", "Services", "Portfolio", "Contact"];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Menu Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed top-0 right-0 z-[100] w-14 h-14 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center text-white"
        whileTap={{ scale: 0.9 }}
      >
        <motion.div
          animate={open ? "open" : "closed"}
          className="flex flex-col gap-1.5"
        >
          <motion.span
            variants={{
              closed: { rotate: 0, y: 0 },
              open: { rotate: 45, y: 8 },
            }}
            className="block w-6 h-0.5 bg-white origin-center"
          />
          <motion.span
            variants={{
              closed: { opacity: 1 },
              open: { opacity: 0 },
            }}
            className="block w-6 h-0.5 bg-white"
          />
          <motion.span
            variants={{
              closed: { rotate: 0, y: 0 },
              open: { rotate: -45, y: -8 },
            }}
            className="block w-6 h-0.5 bg-white origin-center"
          />
        </motion.div>
      </motion.button>

      {/* Fullscreen Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-2xl flex items-center justify-center"
          >
            <motion.ul
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center space-y-10"
            >
              {navItems.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                    onClick={() => setOpen(false)}
                    className="text-4xl md:text-6xl font-Cinzel  text-white hover:text-red-500 transition"
                  >
                    {item}
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
