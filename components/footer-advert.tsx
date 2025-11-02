"use client"

import { motion } from "framer-motion"

export default function FooterAdvert() {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-black text-white py-2 overflow-hidden z-50">
      <motion.div
        className="whitespace-nowrap text-sm font-medium"
        animate={{ x: ["100%", "-100%"] }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: 30,
          ease: "linear",
        }}
      >
        <span className="mx-4">🌍 Developed by www.elmelvinp.com 🌍</span>
        <span className="mx-4">🌍 Developed by +2348149022642 🌍</span>
        <span className="mx-4">🌍 Developed by +2348149022642 🌍</span>
      </motion.div>
    </footer>
  )
}
