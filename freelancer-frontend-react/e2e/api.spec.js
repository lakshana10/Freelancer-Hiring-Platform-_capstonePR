import { expect, test } from "@playwright/test";
import {
  BACKEND,
  STRONG_PW,
  api,
  login,
  seedEngagement,
  signup,
  uniqueEmail,
} from "./helpers.js";

// Corrects the earlier ad-hoc harness, which used endpoints that do
// not exist (`GET /applications/job/{id}`, `GET /api/users/{email}`)
// and omitted the JWT on review reads. Every assertion below maps to
// a real, guarded route and the payload shape the DTOs require.

test.describe("auth guards", () => {
  test("signup enforces uniqueness and strong passwords", async ({
    request,
  }) => {
    const email = uniqueEmail("auth");

    const first = await api(request, "post", "/api/users/signup", {
      data: { name: "a", email, password: STRONG_PW, role: "CLIENT" },
    });
    expect(first.status).toBe(201);

    const dup = await api(request, "post", "/api/users/signup", {
      data: { name: "a", email, password: STRONG_PW, role: "CLIENT" },
    });
    expect(dup.status).toBe(409);

    const weak = await api(request, "post", "/api/users/signup", {
      data: {
        name: "w",
        email: uniqueEmail("weak"),
        password: "weak",
        role: "CLIENT",
      },
    });
    expect(weak.status).toBe(400);
  });

  test("login rejects bad credentials", async ({ request }) => {
    const email = uniqueEmail("login");
    await signup(request, "CLIENT", email);

    const ok = await api(request, "post", "/api/users/login", {
      data: { email, password: STRONG_PW },
    });
    expect(ok.status).toBe(200);
    expect(ok.body.token).toBeTruthy();

    const bad = await api(request, "post", "/api/users/login", {
      data: { email, password: "Wrong123!" },
    });
    expect(bad.status).toBe(401);
  });

  test("profile update is self-only", async ({ request }) => {
    const cEmail = uniqueEmail("prof-c");
    const fEmail = uniqueEmail("prof-f");
    await signup(request, "CLIENT", cEmail);
    await signup(request, "FREELANCER", fEmail);
    const cTok = await login(request, cEmail);
    const fTok = await login(request, fEmail);

    // Correct route: there is no GET /api/users/{email}; reads go
    // through GET /api/users and the guarded write is PUT.
    const self = await api(request, "put", `/api/users/${cEmail}`, {
      token: cTok,
      data: { bio: "mine", skills: "java", experience: "3y" },
    });
    expect(self.status).toBe(200);

    const other = await api(request, "put", `/api/users/${fEmail}`, {
      token: cTok,
      data: { bio: "hijack" },
    });
    expect(other.status).toBe(403);

    const anon = await api(request, "put", `/api/users/${cEmail}`, {
      data: { bio: "x" },
    });
    expect(anon.status).toBe(401);
  });
});

test.describe("job board + proposals", () => {
  test("client posts a job visible on the public board", async ({
    request,
  }) => {
    const clientEmail = uniqueEmail("job-c");
    await signup(request, "CLIENT", clientEmail);
    const cTok = await login(request, clientEmail);

    const created = await api(request, "post", "/api/jobs", {
      token: cTok,
      data: {
        title: `Board job ${Date.now()}`,
        description: "d",
        budget: 100,
        skills: "React",
      },
    });
    expect(created.status).toBe(201);

    // Board is public (no token).
    const board = await api(request, "get", "/api/jobs");
    expect(board.status).toBe(200);
    expect(board.body.some((j) => j.id === created.body.id)).toBe(true);
  });

  test("freelancers cannot post jobs", async ({ request }) => {
    const fEmail = uniqueEmail("job-f");
    await signup(request, "FREELANCER", fEmail);
    const fTok = await login(request, fEmail);

    const res = await api(request, "post", "/api/jobs", {
      token: fTok,
      data: { title: "x", description: "d", budget: 1, skills: "r" },
    });
    expect(res.status).toBe(403);
  });

  test("proposal flow: apply, dedupe, client visibility", async ({
    request,
  }) => {
    const s = await seedEngagement(request, "prop");

    // Correct route: proposals come from GET /applications (the
    // frontend filters client-side), not GET /applications/job/{id}.
    const all = await api(request, "get", "/applications", {
      token: s.clientToken,
    });
    expect(all.status).toBe(200);
    expect(
      all.body.some(
        (a) =>
          String(a.jobId) === String(s.job.id) &&
          a.freelancerEmail === s.freelancerEmail,
      ),
    ).toBe(true);

    // Duplicate apply is rejected.
    const dup = await api(request, "post", "/applications/apply", {
      token: s.freelancerToken,
      data: { jobId: s.job.id, jobTitle: s.job.title },
    });
    expect(dup.status).toBe(409);

    // Anonymous apply is rejected.
    const anon = await api(request, "post", "/applications/apply", {
      data: { jobId: s.job.id, jobTitle: s.job.title },
    });
    expect(anon.status).toBe(401);
  });

  test("notifications fan out to both sides", async ({ request }) => {
    const s = await seedEngagement(request, "notif");

    const toFreelancer = await api(
      request,
      "get",
      `/api/notifications/${encodeURIComponent(s.freelancerEmail)}`,
      { token: s.freelancerToken },
    );
    expect(toFreelancer.status).toBe(200);
    expect(
      toFreelancer.body.some((n) => /proposal|ACCEPTED|contract/i.test(n.message)),
    ).toBe(true);

    const toClient = await api(
      request,
      "get",
      `/api/notifications/${encodeURIComponent(s.clientEmail)}`,
      { token: s.clientToken },
    );
    expect(toClient.status).toBe(200);
    expect(toClient.body.some((n) => /proposal/i.test(n.message))).toBe(true);
  });
});

test.describe("project chat access control", () => {
  test("only participants can read the room", async ({ request }) => {
    const s = await seedEngagement(request, "chat");

    const asClient = await api(
      request,
      "get",
      `/api/messages/job/${s.job.id}`,
      { token: s.clientToken },
    );
    expect(asClient.status).toBe(200);

    const asFreelancer = await api(
      request,
      "get",
      `/api/messages/job/${s.job.id}`,
      { token: s.freelancerToken },
    );
    expect(asFreelancer.status).toBe(200);

    const asOutsider = await api(
      request,
      "get",
      `/api/messages/job/${s.job.id}`,
      { token: s.outsiderToken },
    );
    expect(asOutsider.status).toBe(403);

    const anon = await api(request, "get", `/api/messages/job/${s.job.id}`);
    expect(anon.status).toBe(401);
  });

  test("room message requires receiverEmail + message DTO", async ({
    request,
  }) => {
    const s = await seedEngagement(request, "room");

    // Correct payload: MessageRequest is { receiverEmail, message,
    // jobId } — not { content }.
    const send = await api(request, "post", "/api/messages", {
      token: s.freelancerToken,
      data: {
        receiverEmail: s.clientEmail,
        message: "hello room",
        jobId: s.job.id,
      },
    });
    expect(send.status).toBe(200);
    expect(send.body.jobId).toBe(s.job.id);

    const history = await api(
      request,
      "get",
      `/api/messages/job/${s.job.id}`,
      { token: s.clientToken },
    );
    expect(history.body.some((m) => m.message === "hello room")).toBe(true);
  });
});

test.describe("milestones + payments", () => {
  test("full milestone lifecycle with role guards", async ({ request }) => {
    const s = await seedEngagement(request, "ms");

    const created = await api(request, "post", "/api/milestones", {
      token: s.clientToken,
      data: { contractId: s.contract.id, title: "Phase 1", amount: 200 },
    });
    expect(created.status).toBe(201);
    expect(created.body.status).toBe("PENDING");
    const msId = created.body.id;

    const freelancerCreate = await api(request, "post", "/api/milestones", {
      token: s.freelancerToken,
      data: { contractId: s.contract.id, title: "x", amount: 1 },
    });
    expect(freelancerCreate.status).toBe(403);

    const anonList = await api(
      request,
      "get",
      `/api/milestones/contract/${s.contract.id}`,
    );
    expect(anonList.status).toBe(401);

    const list = await api(
      request,
      "get",
      `/api/milestones/contract/${s.contract.id}`,
      { token: s.clientToken },
    );
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);

    const submit = await api(request, "put", `/api/milestones/${msId}/submit`, {
      token: s.freelancerToken,
      data: { submission: "done v1" },
    });
    expect(submit.status).toBe(200);
    expect(submit.body.status).toBe("SUBMITTED");

    const strangerSubmit = await api(
      request,
      "put",
      `/api/milestones/${msId}/submit`,
      { token: s.outsiderToken, data: { submission: "hijack" } },
    );
    expect(strangerSubmit.status).toBe(403);

    const revision = await api(
      request,
      "put",
      `/api/milestones/${msId}/review?status=REVISION_REQUESTED`,
      { token: s.clientToken },
    );
    expect(revision.status).toBe(200);

    const resubmit = await api(
      request,
      "put",
      `/api/milestones/${msId}/submit`,
      { token: s.freelancerToken, data: { submission: "done v2" } },
    );
    expect(resubmit.status).toBe(200);

    const approve = await api(
      request,
      "put",
      `/api/milestones/${msId}/review?status=APPROVED`,
      { token: s.clientToken },
    );
    expect(approve.status).toBe(200);
    expect(approve.body.status).toBe("APPROVED");

    const doubleSubmit = await api(
      request,
      "put",
      `/api/milestones/${msId}/submit`,
      { token: s.freelancerToken, data: { submission: "again" } },
    );
    expect(doubleSubmit.status).toBe(400);

    // Payment links to the approved milestone.
    const pay = await api(request, "post", "/api/payments", {
      token: s.clientToken,
      data: {
        contractId: s.contract.id,
        jobId: s.job.id,
        jobTitle: s.job.title,
        freelancerEmail: s.freelancerEmail,
        amount: 200,
        milestoneId: msId,
      },
    });
    expect(pay.status).toBe(201);
    expect(pay.body.status).toBe("PENDING");
    expect(pay.body.milestoneId).toBe(msId);

    const paid = await api(
      request,
      "put",
      `/api/payments/${pay.body.id}/status?status=PAID`,
      { token: s.clientToken },
    );
    expect(paid.status).toBe(200);

    const freelancerPayments = await api(request, "get", "/api/payments", {
      token: s.freelancerToken,
    });
    expect(
      freelancerPayments.body.some(
        (p) => p.id === pay.body.id && p.status === "PAID",
      ),
    ).toBe(true);
  });
});

test.describe("reviews", () => {
  test("review is created, visible when authed, deduped", async ({
    request,
  }) => {
    const s = await seedEngagement(request, "rev");

    const created = await api(request, "post", "/api/reviews", {
      token: s.clientToken,
      data: {
        freelancerEmail: s.freelancerEmail,
        jobId: s.job.id,
        jobTitle: s.job.title,
        contractId: s.contract.id,
        rating: 5,
        comment: "great",
      },
    });
    expect(created.status).toBe(201);
    const revId = created.body.id;

    // Correct: review reads require the JWT (they are not public).
    const byFreelancer = await api(
      request,
      "get",
      `/api/reviews/freelancer/${encodeURIComponent(s.freelancerEmail)}`,
      { token: s.freelancerToken },
    );
    expect(byFreelancer.status).toBe(200);
    expect(byFreelancer.body.some((r) => r.id === revId)).toBe(true);

    const byJob = await api(request, "get", `/api/reviews/job/${s.job.id}`, {
      token: s.clientToken,
    });
    expect(byJob.status).toBe(200);
    expect(byJob.body.some((r) => r.id === revId)).toBe(true);

    // Anonymous review read is rejected — correct, not a bug.
    const anon = await api(
      request,
      "get",
      `/api/reviews/freelancer/${encodeURIComponent(s.freelancerEmail)}`,
    );
    expect(anon.status).toBe(401);

    // One review per contract.
    const dup = await api(request, "post", "/api/reviews", {
      token: s.clientToken,
      data: {
        freelancerEmail: s.freelancerEmail,
        jobId: s.job.id,
        jobTitle: s.job.title,
        contractId: s.contract.id,
        rating: 4,
        comment: "again",
      },
    });
    expect(dup.status).toBe(409);
  });
});

test("backend origin is configured", async () => {
  expect(BACKEND).toMatch(/^https?:\/\//);
});
