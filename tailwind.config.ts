import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        areia: {
          DEFAULT: "#EFE5DA",
          2: "#E8DCCE",
        },
        branco: "#FBF6F1",
        preto: "#2E2622",
        cinza: "#8A7A72",
        laranja: "#F0642C",
        magenta: "#E3195A",
      },
      fontFamily: {
        outfit: ["var(--font-outfit)", "Outfit", "sans-serif"],
        fraunces: ["var(--font-fraunces)", "Fraunces", "serif"],
      },
      backgroundImage: {
        "grad-brand": "linear-gradient(120deg, #F0642C 0%, #E3195A 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
