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
});
