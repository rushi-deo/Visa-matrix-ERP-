/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium Deep Navy & Metallics
        premium: {
          // Metallic Blues
          navy: {
            950: "#0a1628", // Deepest navy
            900: "#0d1f3c", // Deep navy
            800: "#0f2854", // Dark navy
            700: "#122d5c", // Navy
            600: "#1a3a78", // Navy accent
            500: "#2a4fa3", // Primary navy
          },
          // Metallic Silvers & Platinums
          silver: {
            50: "#f9fafb",
            100: "#f3f4f6",
            150: "#efefef",
            200: "#e5e7eb",
            300: "#d1d5db",
            400: "#9ca3af",
            500: "#6b7280",
          },
          // Metallic Blues (Accent)
          blue: {
            50: "#f0f6fe",
            100: "#e3edfc",
            200: "#c7ddf9",
            300: "#a1c5f5",
            400: "#7baef1",
            500: "#5a9eef",
            600: "#4a8ee3",
            700: "#3d7ed6",
            800: "#2d6ec8",
            900: "#1f5eb8",
            950: "#0d3a7d",
          },
          // Platinum Greys
          platinum: {
            50: "#fafbfc",
            100: "#f5f6f8",
            150: "#eef0f3",
            200: "#e8eaef",
            300: "#d9dde5",
            400: "#bcc2cc",
          },
          // Status Colors (Premium versions)
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#ef4444",
          orange: "#f97316",
        },
        // Legacy colors (for compatibility)
        brand: {
          navy: "#122d5c",
          blue: "#5a9eef",
        },
        dashboard: "#f5f7fa",
        surface: "#ffffff",
        line: "#e8eaef",
        ink: "#0f2854",
        muted: "#6b7280",
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
      },
      boxShadow: {
        // Premium shadows with metallic depth
        xs: "0 1px 2px rgba(10, 22, 40, 0.05)",
        sm: "0 2px 4px rgba(10, 22, 40, 0.08)",
        card: "0 4px 12px rgba(10, 22, 40, 0.12), 0 1px 3px rgba(10, 22, 40, 0.08)",
        "card-hover": "0 12px 28px rgba(42, 79, 163, 0.18), 0 2px 6px rgba(10, 22, 40, 0.12)",
        "card-lg": "0 8px 24px rgba(10, 22, 40, 0.15)",
        // Metallic glow effects
        glow: "0 0 20px rgba(90, 158, 239, 0.15)",
        "glow-sm": "0 0 12px rgba(90, 158, 239, 0.12)",
        "glow-lg": "0 0 40px rgba(42, 79, 163, 0.2)",
        // Focus states
        focus: "0 0 0 3px rgba(90, 158, 239, 0.1), 0 0 0 1px rgba(90, 158, 239, 0.3)",
      },
      backgroundImage: {
        // Metallic gradients
        "gradient-premium": "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
        "gradient-metallic": "linear-gradient(135deg, #fafbfc 0%, #eef0f3 50%, #dde3ed 100%)",
        "gradient-navy": "linear-gradient(135deg, #0a1628 0%, #122d5c 50%, #1a3a78 100%)",
        "gradient-blue": "linear-gradient(135deg, #e3edfc 0%, #c7ddf9 100%)",
        "gradient-dark": "linear-gradient(135deg, #0f2854 0%, #122d5c 50%, #0d1f3c 100%)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["'Inter'", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        wide: "0.025em",
        wider: "0.05em",
        widest: "0.1em",
      },
      // Premium border radius
      borderRadius: {
        none: "0",
        xs: "0.25rem",
        sm: "0.375rem",
        base: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "2rem",
        "3xl": "2.5rem",
        full: "9999px",
        premium: "1.5rem", // Signature premium radius
        "premium-lg": "2rem",
      },
      transitionDuration: {
        250: "250ms",
        350: "350ms",
        400: "400ms",
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
      },
    },
  },
  plugins: [
    // Custom plugin for premium utilities
    function ({ addUtilities }) {
      addUtilities({
        // Premium glass effect
        ".glass": {
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(12px)",
          "-webkit-backdrop-filter": "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        },
        ".glass-dark": {
          background: "rgba(10, 22, 40, 0.7)",
          backdropFilter: "blur(12px)",
          "-webkit-backdrop-filter": "blur(12px)",
          border: "1px solid rgba(90, 158, 239, 0.1)",
        },
        // Premium metallic borders
        ".border-metallic": {
          borderColor: "rgba(90, 158, 239, 0.2)",
        },
        ".border-metallic-light": {
          borderColor: "rgba(255, 255, 255, 0.3)",
        },
        // Premium focus ring
        ".ring-premium": {
          outline: "2px solid transparent",
          outlineOffset: "2px",
          boxShadow: "0 0 0 3px rgba(90, 158, 239, 0.1), 0 0 0 1px rgba(90, 158, 239, 0.3)",
        },
        // Smooth transitions
        ".transition-premium": {
          transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
        },
      });
    },
  ],
}
