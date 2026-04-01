import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3001,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (id.includes("firebase")) {
            return "firebase";
          }

          if (id.includes("framer-motion")) {
            return "motion";
          }

          if (id.includes("@radix-ui")) {
            return "radix";
          }

          if (id.includes("react-router") || id.includes("@remix-run")) {
            return "router";
          }

          if (id.includes("react-dom") || id.includes(`${path.sep}react${path.sep}`) || id.includes("scheduler")) {
            return "react-vendor";
          }

          return "vendor";
        },
      },
    },
  },
}));
