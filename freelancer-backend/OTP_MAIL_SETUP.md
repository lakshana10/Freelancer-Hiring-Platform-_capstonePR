# OTP email (Gmail App Password) — setup

Workflow is unchanged:

```
signup page → POST /api/otp/generate → Gmail SMTP → user inbox
          → POST /api/otp/verify → verified flag
          → POST /api/users/signup (blocked until verified)
```

## 1. Gmail prerequisites

1. 2-Step Verification ON for the Gmail account.
2. Create an App Password: Google Account → Security → App passwords
   → name e.g. `FreelanceHub` → copy the 16-char code
   (looks like `abcd efgh ijkl mnop` — spaces are optional,
   `abcdefghijklmnop` works too).
3. Sender = that same Gmail address (`MAIL_USERNAME`).

## 2. Local run (PowerShell, secrets stay in env only)

```powershell
$env:MAIL_USERNAME="you@gmail.com"
$env:MAIL_PASSWORD="abcdefghijklmnop"
.\mvnw spring-boot:run
```

Test manually:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/otp/generate `
  -ContentType 'application/json' -Body '{"email":"user@test.com"}'
# check inbox, then:
Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/otp/verify `
  -ContentType 'application/json' -Body '{"email":"user@test.com","otp":"123456"}'
```

## 3. Render (production)

Dashboard → `freelancer-backend` → Environment → add:

| Key | Value |
|---|---|
| `MAIL_HOST` | `smtp.gmail.com` |
| `MAIL_PORT` | `587` |
| `MAIL_USERNAME` | the Gmail address |
| `MAIL_PASSWORD` | the 16-char App Password |
| `JWT_SECRET` | 32+ char random string |
| `CORS_ALLOWED_ORIGINS` | `https://*.vercel.app,http://localhost:*,http://127.0.0.1:*` |

`render.yaml` already declares these with `sync: false` so the
Blueprint never commits the secret. Redeploy after saving.

## 4. JUnit (no real SMTP needed)

```powershell
.\mvnw test
```

Covers:

- `EmailServiceTest` — from/to/subject/body, blank-recipient and
  misconfigured-sender guards.
- `OTPControllerTest` — generate 200/400/429/500, verify 200/400,
  mail-failure path.
- `OTPEmailWorkflowTest` — full generate→verify→delete cycle on H2
  with mocked `JavaMailSender`.
- Existing `OTPServiceTest` — 6-digit format, rate limit, attempts,
  expiry, lockout.

## 5. Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `Email service is not configured` (500) | `MAIL_USERNAME` empty on server. |
| `Failed to send OTP` + `535-5.7.8 Username and Password not accepted` | Wrong `MAIL_PASSWORD` or not the account that created it; regenerate App Password. |
| `Failed to send OTP` + timeout | Port 587 blocked; keep `MAIL_HOST/PORT` defaults. |
| `429 Too many OTP requests` | 5 generates / 10 min / email — frontend now has a 60s resend cooldown. |
| Signup says `verify OTP first` | Email was edited after verification — request + verify again for the same address. |
