import type { Config } from "tailwindcss";

/** Palette derived from the official logo: deep ink-navy background with signal yellow. */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" },
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        ink: {
          950: "#05080F",
          900: "#0A101C",
          800: "#111A2B",
          700: "#1A2540",
          600: "#2A3756",
          500: "#4A5878",
          400: "#7A87A3",
          300: "#AEB7CA",
          200: "#D6DBE6",
          100: "#EDF0F5",
          50: "#F6F7FA",
        },
        brand: {
          50: "#FFFBEA",
          100: "#FFF3C4",
          200: "#FFE680",
          300: "#FFDA3D",
          400: "#FFCD00",
          500: "#F2B900",
          600: "#C79600",
          700: "#8F6B00",
        },
        whatsapp: { DEFAULT: "#1FA855", dark: "#178A45" },
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgb(10 16 28 / 0.06), 0 8px 24px -12px rgb(10 16 28 / 0.18)",
        "card-hover": "0 2px 4px rgb(10 16 28 / 0.08), 0 18px 40px -16px rgb(10 16 28 / 0.28)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: { "fade-up": "fade-up 0.5s ease-out both" },
    },
  },
  plugins: [],
};

export default config;
