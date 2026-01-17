import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";


export default defineConfig({
  plugins: [react(), tailwindcss()],
  css: {
    transformer: "lightningcss",
    lightningcss: {
      // Target older browsers/WebViews for Android POS device compatibility
      // This converts oklch() to rgb(), color-mix() to fallbacks, etc.
      // Target Chrome 70 to force conversion of lab()/oklch() to rgb()
      // Chrome 70 doesn't support lab/oklch, so Lightning CSS will convert them
      targets: browserslistToTargets(browserslist("Chrome >= 70")),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    hmr: {
      host: "localhost",
      port: 5173,
    },
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@ui": path.resolve(__dirname, "src/ui"),
      "@services": path.resolve(__dirname, "src/services"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@db": path.resolve(__dirname, "src/db"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@context": path.resolve(__dirname, "src/context"),
    },
  },
});
