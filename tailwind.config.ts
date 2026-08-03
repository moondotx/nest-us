import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
      },
      colors: {
        green: {
          DEFAULT: "#1a6b3c",
          light: "#e8f5ee",
          mid: "#2d8a52",
          dark: "#0f2419",
        },
        accent: {
          DEFAULT: "#f4a427",
          light: "#fef3dc",
        },
      },
    },
  },
  plugins: [],
};

export default config;
