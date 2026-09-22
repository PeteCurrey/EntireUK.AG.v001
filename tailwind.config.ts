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
        brand: {
          graphite: "#0b1220",
          void: "#060a14",
          carbon: "#111a2e",
          "edge-dark": "#1f2a44",
          edge: "#e3e8f0",
          surface: "#f6f8fc",
          slate: "#1e293b",
          silver: "#475569",
          mist: "#cbd5e1",
          electric: "#2563eb",
          "electric-bright": "#3b82f6",
          indigo: "#4f46e5",
          violet: "#7c3aed",
          purple: "#a855f7",
        },
      },
      fontFamily: {
        sans: ["Work Sans", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "3px",
      },
      transitionTimingFunction: {
        brand: "cubic-bezier(0.22, 0.61, 0.36, 1)",
      },
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};

export default config;
