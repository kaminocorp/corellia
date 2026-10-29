/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// The backend is the only origin in production (it serves this bundle).
// In development Vite proxies the API and the SSE stream to the Go server
// so the client never needs CORS or a configurable API URL.
const BACKEND = process.env.CORELLIA_BACKEND_URL ?? "http://localhost:8080";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": { target: BACKEND, changeOrigin: false },
      "/healthz": { target: BACKEND, changeOrigin: false },
    },
  },
  build: {
    target: "es2020",
    sourcemap: false,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
