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
        sterinova: {
          dark: "#0c4a4e",
          orange: "#e54d21",
          teal: "#188f95",
          light: "#f3f4f6",
        },
        primary: {
          DEFAULT: "#b83b14",
          hover: "#922e10",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#0f6b70",
          hover: "#0c5559",
          light: "#ecfeff",
          "light-foreground": "#164e63",
          foreground: "#ffffff",
        },
        success: {
          DEFAULT: "#166534",
          light: "#f0fdf4",
          foreground: "#14532d",
        },
        warning: {
          DEFAULT: "#854d0e",
          light: "#fffbeb",
          foreground: "#78350f",
        },
        error: {
          DEFAULT: "#b91c1c",
          hover: "#991b1b",
          light: "#fef2f2",
          foreground: "#991b1b",
          "on-solid": "#ffffff",
        },
        surface: {
          DEFAULT: "#ffffff",
          border: "#cbd5e1",
          foreground: "#1e293b",
          subtle: "#475569",
          overlay: "rgb(12 74 78 / 0.55)",
        },
        background: {
          DEFAULT: "#f3f4f6",
        },
      },
      fontSize: {
        h1: ["2.25rem", { lineHeight: "2.5rem", fontWeight: "700" }],
        h2: ["1.875rem", { lineHeight: "2.25rem", fontWeight: "700" }],
        h3: ["1.5rem", { lineHeight: "2rem", fontWeight: "600" }],
        h4: ["1.25rem", { lineHeight: "1.75rem", fontWeight: "600" }],
        h5: ["1.125rem", { lineHeight: "1.5rem", fontWeight: "600" }],
        h6: ["1rem", { lineHeight: "1.5rem", fontWeight: "600" }],
        body: ["0.875rem", { lineHeight: "1.5rem" }],
        caption: ["0.75rem", { lineHeight: "1rem" }],
      },
      borderRadius: {
        control: "0.5rem",
        card: "0.75rem",
        dialog: "1rem",
      },
    },
  },
  plugins: [],
};

export default config;
