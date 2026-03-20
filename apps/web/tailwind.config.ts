import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#6366f1", dark: "#4f46e5" },
        danger: "#ef4444",
        success: "#22c55e",
      },
    },
  },
  plugins: [],
};

export default config;
