import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        asf: { slate: "#4B5568", slateDark: "#2E3442", slateDeep: "#1C2028", copper: "#B8763E", cream: "#FAF7F2", mist: "#F0F1F4" },
      },
      fontFamily: { display: ["Fraunces", "Georgia", "serif"], sans: ["Inter", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
