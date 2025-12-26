/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0B0E14",
        surface: "#121826",
        elevated: "#1A2133",
        border: "#232A3A",
        text: "#E6EAF2",
        muted: "#8A93A7",
        done: "#22C55E",
        warning: "#F59E0B",
        missed: "#EF4444",
        today: "#3B82F6",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      animation: {
        "scale-pulse": "scalePulse 0.3s ease-in-out",
        shake: "shake 0.4s cubic-bezier(.36,.07,.19,.97) both",
        "neon-pulse": "neonPulse 1s ease-in-out infinite",
      },
      keyframes: {
        scalePulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.15)" },
        },
        shake: {
          "10%, 90%": { transform: "translate3d(-1px, 0, 0)" },
          "20%, 80%": { transform: "translate3d(2px, 0, 0)" },
          "30%, 50%, 70%": { transform: "translate3d(-4px, 0, 0)" },
          "40%, 60%": { transform: "translate3d(4px, 0, 0)" },
        },
        neonPulse: {
          "0%, 100%": { boxShadow: "0 0 5px #3B82F6, 0 0 10px #3B82F6" },
          "50%": { boxShadow: "0 0 20px #3B82F6, 0 0 30px #3B82F6" },
        },
      },
    },
  },
  plugins: [],
};
