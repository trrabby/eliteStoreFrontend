import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config = {
  darkMode: "class",

  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // simplified + future-proof
  ],

  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF3E9B",
          light: "#FF88BA",
          pale: "#FFEDFA",
          dark: "#D4006F",
        },
        brand: {
          50: "#FFF0F7",
          100: "#FFEDFA",
          200: "#FFD6EF",
          300: "#FF88BA",
          400: "#FF5FAD",
          500: "#FF3E9B",
          600: "#E8007F",
          700: "#D4006F",
          800: "#A8005A",
          900: "#7A0040",
        },
      },

      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        body: ["var(--font-dm-sans)", "sans-serif"],
        bengali: ["var(--font-hind-siliguri)", "sans-serif"],
      },

      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #FF3E9B 0%, #FF88BA 100%)",
        "gradient-pale": "linear-gradient(135deg, #FFEDFA 0%, #FFF5FB 100%)",
        "gradient-hero":
          "linear-gradient(135deg, #FF3E9B 0%, #FF88BA 50%, #FFEDFA 100%)",
      },

      boxShadow: {
        pink: "0 4px 24px rgba(255, 62, 155, 0.15)",
        "pink-lg": "0 8px 40px rgba(255, 62, 155, 0.25)",
        card: "0 2px 16px rgba(0, 0, 0, 0.06)",
      },

      animation: {
        "slide-in": "slideIn 0.3s ease-out",
        "fade-in": "fadeIn 0.2s ease-out",
        "bounce-in": "bounceIn 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55)",
      },

      keyframes: {
        slideIn: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        bounceIn: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },

  plugins: [tailwindcssAnimate],
} satisfies Config;

export default config;
