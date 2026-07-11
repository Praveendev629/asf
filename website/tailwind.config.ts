import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        asf: {
          slate: "#4B5568",
          slateDark: "#2E3442",
          slateDeep: "#1C2028",
          copper: "#B8763E",
          copperLight: "#D9985C",
          copperDark: "#8F5A2C",
          cream: "#FAF7F2",
          mist: "#F0F1F4",
        },
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        premium: "0 10px 40px -10px rgba(28,32,40,0.25)",
        soft: "0 2px 12px rgba(28,32,40,0.08)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: { fadeUp: "fadeUp 0.6s ease-out forwards" },
    },
  },
  plugins: [],
};
export default config;
