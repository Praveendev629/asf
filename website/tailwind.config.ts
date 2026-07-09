import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2B343C",
        secondary: "#B87333",
        accent: "#F5F5F5",
        success: "#27AE60",
        warning: "#F39C12",
        danger: "#E74C3C",
        background: "#101214",
        card: "#1A1D22",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
