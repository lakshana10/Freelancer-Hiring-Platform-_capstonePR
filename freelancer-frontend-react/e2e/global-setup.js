import { request as pwRequest } from "@playwright/test";

const BACKEND = process.env.E2E_BACKEND_URL || "http://localhost:8080";
const FRONTEND = process.env.E2E_FRONTEND_URL || "http://localhost:5174";

/**
 * Fail fast with a clear message instead of dozens of confusing
 * network errors when a server was not started.
 */
async function assertReachable(url, hint) {
  const ctx = await pwRequest.newContext();
  try {
    const res = await ctx.get(url, { timeout: 5_000 });
    if (!res.ok()) throw new Error(`returned HTTP ${res.status()}`);
  } catch (err) {
    throw new Error(
      `${hint} is not reachable at ${url}.\n` +
        `Start it first (${err.message}).`,
    );
  } finally {
    await ctx.dispose();
  }
}

export default async function globalSetup() {
  await assertReachable(
    `${BACKEND}/api/jobs`,
    "Backend — cd freelancer-backend && .\\mvnw spring-boot:run",
  );
  await assertReachable(
    FRONTEND,
    "Frontend — cd freelancer-frontend-react && npm run dev",
  );
}
