# FreelanceHub workflows (React frontend)

## Client workflow — sees only their own data

| Step | Screen | API |
|---|---|---|
| 1. Sign up + verify email | `/signup` | `POST /api/otp/generate` → `POST /api/otp/verify` → `POST /api/users/signup` |
| 2. Post a job | `/post-job` | `POST /api/jobs` |
| 3. Manage own postings | `/my-jobs` | `GET /api/jobs` (client-side filter `clientEmail == me`), `DELETE /api/jobs/{id}` |
| 4. Compare proposals per job | `/applications` or `/jobs/{id}` → Proposals tab | `GET /applications` (filtered to my job IDs), `PUT /applications/{id}/status` |
| 5. Hire | Proposals tab → Hire | `POST /api/contracts` + `PUT /applications/{id}/status=ACCEPTED` |
| 5b. Milestones | Contract card → Milestones | `POST /api/milestones`, `PUT /{id}/submit` (freelancer), `PUT /{id}/review?status=` (client) |
| 6. Project chat (realtime) | `/jobs/{id}` → Project chat tab | `GET /api/messages/job/{jobId}` + WS `/app/chat/{jobId}` ↔ `/topic/jobs/{jobId}` |
| 7. Pay | `/contracts` → Record payment, `/payments` | `POST /api/payments` (+ optional `milestoneId`), `PUT /api/payments/{id}/status` |
| 8. Review | `/reviews/give` | `POST /api/reviews` |

Clients are fenced out of the public board: visiting `/jobs` redirects to
`/my-jobs`, the navbar shows **My Jobs** instead of **Jobs**, and the
freelancer directory link is hidden.

## Freelancer workflow

| Step | Screen | API |
|---|---|---|
| 1. Sign up + verify email | `/signup` | same OTP flow |
| 2. Find work | `/jobs` (public board, all clients) | `GET /api/jobs` |
| 3. Apply | `/jobs/{id}` → Apply | `POST /applications/apply` |
| 4. Track status | `/my-applications` | `GET /applications/freelancer/{email}` |
| 5. Project chat (realtime) | `/jobs/{id}` → Project chat tab (unlocked on ACCEPTED/contract) | same chat APIs |
| 6. Earnings | `/payments` | `GET /api/payments/freelancer/{email}` |
| 7. Reviews received | `/reviews` | `GET /api/reviews/freelancer/{email}` |

## Project chat (realtime, per job page)

- **Why WebSocket/STOMP, not webhooks:** webhooks push server→server on
  events — they can't deliver to a browser tab. Low-latency browser chat
  needs a persistent socket: STOMP over SockJS at `/ws`, JWT in the
  CONNECT header, rooms at `/topic/jobs/{jobId}`.
- **Unlock rule:** chat opens after hiring — owning client, ACCEPTED /
  contracted freelancer, or admin (`MessageService.requireJobParticipant`).
- **History:** `GET /api/messages/job/{jobId}` (same rule, REST).
- **Resilience:** if the socket drops, `ChatBox` falls back to
  `POST /api/messages` (with `jobId`) and shows OFFLINE until reconnect
  (3s auto-retry). No message loss: every send is persisted first.
