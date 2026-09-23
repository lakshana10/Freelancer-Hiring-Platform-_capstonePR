import { defineConfig, devices } from "@playwright/test";

// End-to-end suite for the Freelancer Hiring Platform.
//
// Prereq — both servers must be running:
//   backend : http://localhost:8080  (.\mvnw spring-boot:run)
//   frontend: http://localhost:5173  (npm run dev)
//
// The backend origin is separate from the frontend origin on
// purpose: it exercises the real cross-origin + CORS + JWT path
// the deployed app uses.
const FRONTEND = process.env.E2E_FRONTEND_URL || "http://localhost:5174";
const BACKEND = process.env.E2E_BACKEND_URL || "http://localhost:8080";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  // The whole suite shares one backend + database, so run serially
  // to keep job/proposal/payment assertions deterministic.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: FRONTEND,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Expose the backend origin to every test via process.env so the
  // API helpers and the UI chat test agree on one source of truth.
  metadata: { backend: BACKEND },
  globalSetup: "./e2e/global-setup.js",
});
