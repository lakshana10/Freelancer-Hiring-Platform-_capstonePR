# Deploy on Railway

Postgres is already deployed and the schema is live (verified:
`users`, `freelancer_profile` tables exist — Hibernate `update`
creates the rest on first boot).

## 1. Backend service

1. Railway → New → Deploy from GitHub repo → select this repo.
2. Service Settings:
   - **Root Directory:** empty (repo root — the root `Dockerfile`
     builds from repo-root context, so nothing to configure)
   - **Builder:** Dockerfile (auto-detected `Dockerfile` at repo root)
   - **Dockerfile Path:** empty / default (do NOT set
     `freelancer-backend/Dockerfile` — that file expects
     `freelancer-backend/` as context and is only for local compose)
   - **Custom Healthcheck Path:** `/api/jobs`
3. Variables tab — add:

| Key | Value |
|---|---|
| `DATABASE_URL` | the **internal** Postgres URL (`postgres.railway.internal:5432`, same private network, no egress fees). Bare `postgresql://` form works — the app normalizes it |
| `DATABASE_USERNAME` / `DATABASE_PASSWORD` | only if the URL has no embedded credentials |
| `JWT_SECRET` | Generate (32+ chars) |
| `MAIL_HOST` / `MAIL_PORT` | `smtp.gmail.com` / `587` (local SMTP path only) |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | Gmail + 16-char App Password (local SMTP path; also the Brevo sender address) |
| `BREVO_API_KEY` | **Required on Railway** — Brevo dashboard API key. Railway blocks outbound SMTP (`SocketTimeoutException` on `smtp.gmail.com:587`), so OTP mail goes via the Brevo HTTPS API when this is set. Free tier 300/day; verify `MAIL_USERNAME` as a sender in Brevo first |
| `CORS_ALLOWED_ORIGINS` | your frontend origin, e.g. `https://<app>.vercel.app` |

`PORT` is injected by Railway and honored automatically. No secrets
in git — everything above lives in Variables only.

## 2. Frontend (`freelancer-frontend-react` on Vercel)

1. Vercel → New Project → same repo, **Root Directory:**
   `freelancer-frontend-react` (the `vercel.json` SPA rewrite is ready).
2. Environment variable: `VITE_API_URL` =
   `https://<backend-service>.up.railway.app`
3. Redeploy the backend after setting `CORS_ALLOWED_ORIGINS` to the
   Vercel URL, so browser calls are accepted.

## 3. Verify live

- `GET https://<backend>/api/jobs` → `[]` or job list (public)
- Signup → OTP email arrives → verify → account created
- Client posts job → freelancer applies → accept → project chat LIVE
