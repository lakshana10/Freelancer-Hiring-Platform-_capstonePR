# Environment files — local vs production, server vs client

Four env files, split by **side** (server / client) and **environment**
(local / production). Each file says what it is for in its header.

| Side | Environment | File | Tracked in git? |
|---|---|---|---|
| Server (Spring Boot) | Local | `freelancer-backend/.env.development` | ❌ secret |
| Server (Spring Boot) | Production (Railway) | `freelancer-backend/.env.production` | ❌ secret |
| Client (React/Vite) | Local | `freelancer-frontend-react/.env.development` | ✅ public |
| Client (React/Vite) | Production (Vercel) | `freelancer-frontend-react/.env.production` | ✅ public |

Templates (safe, no secrets): `.env.example` at the repo root (docker),
`freelancer-backend/.env.example`, `freelancer-frontend-react/.env.example`.

> **Rule:** server env files are ignored (they hold DB, JWT and Gmail
> app-password secrets). Client `VITE_*` files are committed because Vite
> inlines them into the JS bundle — they are public by definition.

---

## Local development

### Server
Spring Boot does **not** read `.env` files on its own. Use the loader:

```powershell
cd freelancer-backend
.\run-local.ps1                 # loads .env.development, runs Spring Boot
# backend -> http://localhost:8080
```

`run-local.ps1` exports every `KEY=VALUE` into the current session
(masking `*PASSWORD*` / `*SECRET*` in the output) before starting the JVM.

### Client
Vite loads `.env.development` automatically in dev mode:

```powershell
cd freelancer-frontend-react
npm run dev                     # -> http://localhost:5174 (or 5173)
```

`VITE_API_URL=http://localhost:8080` points the browser at the local backend
(in `src/api/client.js` and `src/components/ChatBox.jsx`).

---

## Production

Neither Railway nor Vercel reads these files from the repo by default —
they read **dashboard Variables**. The production files are the source of
truth you copy values from.

### Server -> Railway
1. Open `freelancer-backend/.env.production` and replace every `<PLACEHOLDER>`.
2. Railway → your backend service → **Variables** → paste each `KEY`/`VALUE`.
   (Or `railway variables set KEY=value --service <name>`.)
3. `PORT` is injected by Railway and honored automatically.
4. Set `CORS_ALLOWED_ORIGINS` to your exact Vercel URL, then **redeploy the
   backend** so browser calls are accepted.
5. Details: [`RAILWAY_DEPLOY.md`](./RAILWAY_DEPLOY.md).

Use the **internal** `postgres.railway.internal:5432` URL — same private
network, no egress fees. Bare `postgresql://` works; the app normalizes it.

### Client -> Vercel
1. Edit `freelancer-frontend-react/.env.production` and replace
   `<YOUR_BACKEND_SERVICE>.up.railway.app` with your real Railway URL.
2. **Either** commit it (Vercel's `npm run build` reads it automatically),
   **or** set `VITE_API_URL` in Vercel → Project → Settings → Environment
   Variables. A dashboard variable wins over the file.
3. Vercel → New Project → same repo → **Root Directory:**
   `freelancer-frontend-react` (`vercel.json` SPA rewrite is ready).

---

## Precedence (Vite)

`.env` < `.env.local` < `.env.[mode]` < `.env.[mode].local`, and any real
process env var (e.g. set in the Vercel/Railway dashboard) beats all files.
`.local` overrides are gitignored everywhere.

## Rotating the exposed credentials

The Railway DB password and Gmail app password were pasted in plain text
earlier. Rotate both, then update `freelancer-backend/.env.development`,
`freelancer-backend/.env.production` and the Railway Variables.
