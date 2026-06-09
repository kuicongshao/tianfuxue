import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#05070f",
        foreground: "#eef4ff",
        cyanline: "#44d4ff",
        violetline: "#8f6bff",
        jade: "#2be6b7",
        amberdata: "#f4c95d"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        glow: "0 0 30px rgba(68, 212, 255, 0.22)"
      }
    }
  },
  plugins: [animate]
};

export default config;
