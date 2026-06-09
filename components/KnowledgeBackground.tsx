"use client";

import { motion } from "framer-motion";

const nodes = [
  [12, 22],
  [28, 12],
  [44, 24],
  [68, 14],
  [86, 28],
  [18, 58],
  [36, 70],
  [56, 56],
  [74, 72],
  [92, 60]
];

export function KnowledgeBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg className="absolute inset-0 h-full w-full opacity-55" viewBox="0 0 100 100" preserveAspectRatio="none">
        {nodes.map((node, index) => {
          const next = nodes[(index + 2) % nodes.length];
          return (
            <motion.line
              key={`${node[0]}-${node[1]}`}
              x1={node[0]}
              y1={node[1]}
              x2={next[0]}
              y2={next[1]}
              stroke="url(#line)"
              strokeWidth="0.13"
              initial={{ pathLength: 0, opacity: 0.1 }}
              animate={{ pathLength: [0.15, 1, 0.25], opacity: [0.1, 0.7, 0.2] }}
              transition={{ duration: 7 + index * 0.3, repeat: Infinity, ease: "easeInOut" }}
            />
          );
        })}
        <defs>
          <linearGradient id="line">
            <stop stopColor="#44d4ff" />
            <stop offset="1" stopColor="#8f6bff" />
          </linearGradient>
        </defs>
      </svg>
      {nodes.map(([left, top], index) => (
        <motion.span
          key={`${left}-${top}`}
          className="absolute h-2 w-2 rounded-full bg-cyanline shadow-[0_0_24px_rgba(68,212,255,0.9)]"
          style={{ left: `${left}%`, top: `${top}%` }}
          animate={{ scale: [0.75, 1.6, 0.9], opacity: [0.3, 1, 0.45] }}
          transition={{ duration: 3 + index * 0.25, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
