import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke test against the real backend serving the built bundle. The
 * server is the Go binary scripts/e2e.sh builds; the data dir is throwaway.
 */
const PORT = Number(process.env.E2E_PORT ?? 18099);

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  outputDir: "test-results",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
    viewport: { width: 1600, height: 900 },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], channel: undefined } }],
  webServer: {
    command: "../backend/bin/api",
    url: `http://127.0.0.1:${PORT}/healthz`,
    reuseExistingServer: false,
    timeout: 30_000,
    env: {
      PORT: String(PORT),
      CORELLIA_BIND: "127.0.0.1",
      CORELLIA_CLIENT_DIR: "dist",
      CORELLIA_DATA_DIR: "test-results/data",
      CORELLIA_RUNTIME: "local",
      CORELLIA_STT: "none",
      CORELLIA_TTS: "none",
      CORELLIA_DEVICE_TOKEN: "",
      CORELLIA_TZ: "Europe/Lisbon",
    },
  },
});
