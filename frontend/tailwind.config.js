/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Reduzir a escala padrão
      fontSize: {
        xs: ["0.7rem", { lineHeight: "1rem" }],
        sm: ["0.75rem", { lineHeight: "1.125rem" }],
        base: ["0.8125rem", { lineHeight: "1.25rem" }],
        lg: ["0.875rem", { lineHeight: "1.375rem" }],
        xl: ["1rem", { lineHeight: "1.5rem" }],
        "2xl": ["1.125rem", { lineHeight: "1.5rem" }],
        "3xl": ["1.25rem", { lineHeight: "1.375rem" }],
        "4xl": ["1.5rem", { lineHeight: "1.75rem" }],
      },
      spacing: {
        // Reduzir espaçamentos
        1: "0.2rem",
        1.5: "0.3rem",
        2: "0.4rem",
        2.5: "0.5rem",
        3: "0.6rem",
        3.5: "0.7rem",
        4: "0.8rem",
        5: "1rem",
        6: "1.2rem",
        8: "1.6rem",
        10: "2rem",
        12: "2.4rem",
        16: "3.2rem",
        20: "4rem",
        24: "4.8rem",
        32: "6.4rem",
        40: "8rem",
        48: "9.6rem",
        56: "11.2rem",
        64: "12.8rem",
      },
      padding: {
        0.5: "0.1rem",
        1: "0.2rem",
        1.5: "0.3rem",
        2: "0.4rem",
        2.5: "0.5rem",
        3: "0.6rem",
        3.5: "0.7rem",
        4: "0.8rem",
        5: "1rem",
        6: "1.2rem",
        8: "1.6rem",
        10: "2rem",
      },
      width: {
        72: "16rem",
        80: "18rem",
        96: "22rem",
      },
      colors: {
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#1A2B4C",
          900: "#0f172a",
          DEFAULT: "#1A2B4C",
        },
        success: {
          DEFAULT: "#108243",
        },
        warning: {
          DEFAULT: "#CFC01A",
        },
        danger: {
          DEFAULT: "#D92B14",
        },
        info: {
          DEFAULT: "#3b82f6",
        },
      },
    },
  },
  plugins: [],
};
