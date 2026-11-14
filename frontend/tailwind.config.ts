import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          pink: {
            light: "#FFF0F4",
            DEFAULT: "#FF4D79",
            dark: "#E01E53",
            vibrant: "#FF1A53",
          },
          cream: {
            light: "#FFFFFF",
            DEFAULT: "#FFF9FA",
            dark: "#FFE8EE",
          },
          cocoa: {
            light: "#475569",
            DEFAULT: "#0F172A",
            dark: "#020617",
          },
          espresso: {
            light: "#334155",
            DEFAULT: "#0F172A",
            dark: "#020617",
          },
          gold: {
            light: "#FEF3C7",
            DEFAULT: "#F59E0B",
            dark: "#D97706",
            shimmer: "#FDE68A",
          },
          'baby-blue': {
            light: "#E8F6FC",
            DEFAULT: "#89CFF0",
            soft: "#BDE6F7",
            dark: "#5BBBE7",
            border: "#CEECFA",
          },
        },
      },
      fontFamily: {
        arabic: ["Cairo", "Tajawal", "system-ui", "sans-serif"],
      },
      boxShadow: {
        'luxury': '0 10px 25px -5px rgba(255, 77, 121, 0.08), 0 0 0 1px rgba(255, 77, 121, 0.1)',
        'luxury-hover': '0 20px 35px -5px rgba(255, 77, 121, 0.15), 0 0 0 1px rgba(255, 77, 121, 0.25)',
        'gold-glow': '0 4px 20px rgba(245, 158, 11, 0.35)',
        'rose-glow': '0 4px 25px rgba(255, 77, 121, 0.35)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'shimmer-sweep': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'float-slow': 'float 4s ease-in-out infinite',
        'shimmer': 'shimmer-sweep 3s linear infinite',
      },
    },
  },
  plugins: [],
};
export default config;
