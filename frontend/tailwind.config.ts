import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        espresso: {
          950: "#100C08",
          900: "#17120D",
          800: "#221B14",
          700: "#2E251B",
          600: "#3A2F24",
        },
        gold: {
          400: "#D9B666",
          500: "#C89B3C",
          600: "#A87F2E",
        },
        harbor: {
          400: "#5A8078",
          500: "#3E5C56",
          600: "#2C443F",
        },
        ivory: {
          100: "#F6F1E7",
          200: "#EDE6D6",
          300: "#DCD1B8",
        },
        sand: {
          400: "#A79A85",
          500: "#8A7D68",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        lg: "12px",
      },
      letterSpacing: {
        wide2: "0.08em",
      },
      keyframes: {
        "route-draw": {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "route-draw": "route-draw 2.4s ease-out forwards",
        "fade-up": "fade-up 0.6s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
