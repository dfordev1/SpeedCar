import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Base path: when deployed to GitHub Pages as a project site it's /SpeedCar/.
// Set VITE_BASE_PATH in CI if the repo name differs. Local dev stays at /.
const basePath = process.env.VITE_BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "SpeedCar",
        short_name: "SpeedCar",
        description:
          "A zero-cost, decentralized rideshare protocol. No servers, no fees, no accounts.",
        theme_color: "#0b0d10",
        background_color: "#0b0d10",
        display: "standalone",
        start_url: basePath,
        scope: basePath,
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        // Map tile requests go to public OSM / PMTiles; we don't cache them
        // aggressively here to keep control outside the SW.
        navigateFallback: basePath,
      },
    }),
  ],
  server: {
    port: 5173,
  },
});
