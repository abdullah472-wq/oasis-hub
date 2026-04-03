import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 3001,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "site-logo.png"],
      manifest: {
        name: "Annoor Education Family",
        short_name: "Annoor",
        description: "Islamic and modern education programs for students and families in Kapasia, Gazipur.",
        theme_color: "#0c4a3e",
        background_color: "#f7f2e8",
        display: "standalone",
        scope: "/",
        start_url: "/",
        lang: "bn",
        dir: "ltr",
        icons: [
          {
            src: "/site-logo.png",
            sizes: "521x479",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/site-logo.png",
            sizes: "521x479",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "cloudinary-assets",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
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
