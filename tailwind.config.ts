import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#0B6839", // Primary Green
          accent: "#FEE101",  // Accent Yellow
          pink: "#FF0080",    // Pink
          black: "#000000",   // Black
          offwhite: "#FFFBE8",// Off-White
          white: "#FFFFFF",   // White
        },
      },
      fontFamily: {
        heading: ["var(--font-imbue)", "Imbue", "Georgia", "serif"],
        mono: ["var(--font-victor-mono)", "'Victor Mono'", "monospace"],
        sans: ["var(--font-victor-mono)", "'Victor Mono'", "monospace"],
      },
      boxShadow: {
        hard: "3px 3px 0px 0px #000000",
        "hard-green": "3px 3px 0px 0px #0B6839",
        "hard-pink": "3px 3px 0px 0px #FF0080",
        "hard-yellow": "3px 3px 0px 0px #FEE101",
      },
    },
  },
  plugins: [],
} satisfies Config;
