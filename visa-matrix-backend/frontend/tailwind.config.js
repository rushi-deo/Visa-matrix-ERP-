/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0f2b5b",
          blue: "#2f6fed",
        },
        dashboard: "#f5f7fb",
        surface: "#ffffff",
        line: "#e4e7ec",
        ink: "#1f2937",
        muted: "#6b7280",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.05), 0 14px 32px rgba(15, 43, 91, 0.05)",
        "card-hover":
          "0 18px 38px rgba(15, 43, 91, 0.12), 0 4px 10px rgba(15, 23, 42, 0.06)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
