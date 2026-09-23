import { expect, test } from "@playwright/test";
import { seedEngagement } from "./helpers.js";

/**
 * UI realtime chat through the real React frontend.
 * Verifies the STOMP socket reports LIVE, a sent message echoes
 * back over the socket, and it persists via REST history.
 */
test.describe("UI realtime project chat", () => {
  test("freelancer sees LIVE socket, sends, and message persists", async ({
    request,
    page,
  }) => {
    test.setTimeout(60_000);
    const s = await seedEngagement(request, "uichat");

    // Log in through the actual login form.
    await page.goto("/login");
    await page.getByPlaceholder("you@example.com").fill(s.freelancerEmail);
    await page.getByPlaceholder("Your password").fill("Secret123!");
    await page.getByRole("button", { name: /login/i }).click();
    await page.waitForURL(/freelancer-dashboard/, { timeout: 15_000 });

    // Open the job workspace and switch to the project chat tab.
    await page.goto(`/jobs/${s.job.id}`);
    await page.getByRole("button", { name: /project chat/i }).click();

    // The LIVE pill proves the STOMP/SockJS handshake succeeded.
    await expect(page.getByText(/LIVE/).first()).toBeVisible({
      timeout: 15_000,
    });

    // Send through the real input and confirm the socket echo.
    const ping = `ui realtime ping ${Date.now()}`;
    await page.getByPlaceholder("Message the project room…").fill(ping);
    await page.getByRole("button", { name: /^send$/i }).click();
    await expect(page.getByText(ping).first()).toBeVisible({
      timeout: 15_000,
    });

    // And confirm the backend stored it.
    const history = await request.get(
      `${process.env.E2E_BACKEND_URL || "http://localhost:8080"}/api/messages/job/${s.job.id}`,
      {
        headers: {
          Authorization: `Bearer ${s.freelancerToken}`,
          "Content-Type": "application/json",
        },
      },
    );
    expect(history.ok()).toBe(true);
    const messages = await history.json();
    expect(messages.some((m) => m.message === ping)).toBe(true);
  });
});
