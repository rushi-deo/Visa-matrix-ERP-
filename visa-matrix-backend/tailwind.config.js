/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        app: {
          base: "#0f172a",
          card: "#1e293b",
          text: "#e2e8f0",
          accent: "#3b82f6",
        },
      },
      boxShadow: {
        panel: "0 24px 60px rgba(2, 6, 23, 0.45)",
      },
    },
  },
  plugins: [],
};
