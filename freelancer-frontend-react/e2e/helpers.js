import { expect } from "@playwright/test";

export const BACKEND = process.env.E2E_BACKEND_URL || "http://localhost:8080";
export const FRONTEND = process.env.E2E_FRONTEND_URL || "http://localhost:5174";

// Must satisfy the backend's strong-password rule:
// 8+ chars, upper, lower, digit, special.
export const STRONG_PW = "Secret123!";

/**
 * Thin JSON API client over Playwright's APIRequestContext.
 * Always sends the JWT when a token is provided, mirroring the
 * frontend axios interceptor. Returns { status, body } so tests
 * can assert on HTTP codes as well as payloads.
 */
export async function api(request, method, path, { token, data } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const opts = { headers, failOnStatusCode: false };
  if (data !== undefined) opts.data = data;

  const res = await request[method](`${BACKEND}${path}`, opts);
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { status: res.status(), body };
}

/** Unique email per run so re-runs never collide on 409. */
export function uniqueEmail(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@test.local`;
}

export async function signup(request, role, email, password = STRONG_PW) {
  const res = await api(request, "post", "/api/users/signup", {
    data: { name: role.toLowerCase(), email, password, role },
  });
  expect(res.status).toBe(201);
  return res.body;
}

export async function login(request, email, password = STRONG_PW) {
  const res = await api(request, "post", "/api/users/login", {
    data: { email, password },
  });
  expect(res.status).toBe(200);
  return res.body.token;
}

/**
 * Seeds one full engagement: client + freelancer accounts, a job,
 * an ACCEPTED proposal, and a signed contract. Returns the tokens
 * and ids every downstream assertion needs.
 */
export async function seedEngagement(request, titlePrefix = "E2E") {
  const clientEmail = uniqueEmail(`${titlePrefix}-client`);
  const freelancerEmail = uniqueEmail(`${titlePrefix}-free`);
  const outsiderEmail = uniqueEmail(`${titlePrefix}-outsider`);

  await signup(request, "CLIENT", clientEmail);
  await signup(request, "FREELANCER", freelancerEmail);
  await signup(request, "FREELANCER", outsiderEmail);

  const clientToken = await login(request, clientEmail);
  const freelancerToken = await login(request, freelancerEmail);
  const outsiderToken = await login(request, outsiderEmail);

  const jobRes = await api(request, "post", "/api/jobs", {
    token: clientToken,
    data: {
      title: `${titlePrefix} job ${Date.now()}`,
      description: "Automated end-to-end test job.",
      budget: 500,
      skills: "React",
    },
  });
  expect(jobRes.status).toBe(201);
  const job = jobRes.body;

  const applyRes = await api(request, "post", "/applications/apply", {
    token: freelancerToken,
    data: { jobId: job.id, jobTitle: job.title },
  });
  expect(applyRes.status).toBe(200);
  const application = applyRes.body;

  const acceptRes = await api(
    request,
    "put",
    `/applications/${application.id}/status?status=ACCEPTED`,
    { token: clientToken },
  );
  expect(acceptRes.status).toBe(200);

  const contractRes = await api(request, "post", "/api/contracts", {
    token: clientToken,
    data: {
      jobId: job.id,
      jobTitle: job.title,
      freelancerEmail,
    },
  });
  expect(contractRes.status).toBe(201);

  return {
    clientEmail,
    freelancerEmail,
    outsiderEmail,
    clientToken,
    freelancerToken,
    outsiderToken,
    job,
    application,
    contract: contractRes.body,
  };
}
