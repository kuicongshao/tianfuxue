"use client";

import { motion } from "framer-motion";

export function ParticleField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 42 }).map((_, index) => (
        <motion.span
          key={index}
          className="absolute h-1 w-1 rounded-full bg-white/80"
          style={{
            left: `${(index * 19) % 100}%`,
            top: `${(index * 31) % 100}%`
          }}
          animate={{
            x: [0, 18 + (index % 5) * 8, -10],
            y: [0, -32 - (index % 7) * 7, 8],
            opacity: [0, 0.9, 0]
          }}
          transition={{
            duration: 6 + (index % 6),
            repeat: Infinity,
            delay: index * 0.12,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}
