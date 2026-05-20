/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2F6FCC",   // Logo Blue
        dark: "#0B2F5B",      // Navy Text
        lightBg: "#F3F4F6",   // Soft Grey Background
      },
    },
  },
  plugins: [],
}
