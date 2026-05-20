import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules\\react\\") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules\\react-dom\\") ||
            id.includes("node_modules/react-router/") ||
            id.includes("node_modules\\react-router\\") ||
            id.includes("node_modules/react-router-dom/") ||
            id.includes("node_modules\\react-router-dom\\")
          ) {
            return "react-vendor";
          }

          if (id.includes("lucide-react")) {
            return "icons";
          }

          if (id.includes("@tanstack/react-query") || id.includes("/axios/")) {
            return "query";
          }

          if (
            id.includes("@reduxjs/toolkit") ||
            id.includes("react-redux") ||
            id.includes("/redux/") ||
            id.includes("\\redux\\") ||
            id.includes("reselect") ||
            id.includes("victory-vendor")
          ) {
            return "charts-vendor";
          }

          return "vendor";
        },
      },
    },
  },
});
