import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path"; // Add this line to import the path module

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  open: true,
  css: {
    postcss: "./postcss.config.js",
  },
  resolve: {
    alias: {
      "@": path.resolve(path.dirname(new URL(import.meta.url).pathname), "src"), // Add this line to resolve the alias
    },
  },
  optimizeDeps: {
    esbuildOptions: { target: "es2020" },
  },
  build: {
    target: "es2020",
  },
  server: {
    proxy: {
      "/api": {
        target: "https://dtix-backend-7f609a0e60c3.herokuapp.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
