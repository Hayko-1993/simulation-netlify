# Central Dispatch Portal — Deploy Guide

Portable backup of the carrier portal (React + Netlify Functions + Supabase).

## What you need

- [Node.js](https://nodejs.org/) 18+
- A [Supabase](https://supabase.com) project (database)
- A [Netlify](https://netlify.com) account (hosting)

## 1. Supabase setup

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard)
2. Open **SQL Editor → New query**
3. Paste and run everything in `supabase/setup.sql`
4. Go to **Project Settings → API** and copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** key (Legacy API keys) → `SUPABASE_SERVICE_KEY`

## 2. Netlify environment variables

In **Site settings → Environment variables**, add:

| Key | Value |
|-----|--------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service_role key |

Do **not** set `VITE_API_URL` — leave it unset so the frontend calls the same Netlify domain.

Optional overrides (defaults exist in code if unset):

- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — admin panel login
- `TELEGRAM_TOKEN` / `TELEGRAM_CHAT_ID` — login notifications

## 3. Deploy to Netlify

### Option A — Netlify CLI (recommended)

```powershell
cd path\to\central-dispatch-portal
npm install
npx netlify-cli login
npx netlify-cli deploy --prod
```

When prompted, link to an existing site or create a new one.

### Option B — Netlify Drop

1. Run `npm install && npm run build` locally
2. Zip the **entire project folder** (not just `dist` — Netlify needs `netlify.toml` and source)
3. Go to [app.netlify.com/drop](https://app.netlify.com/drop) or your site **Deploys** tab
4. Drag the folder or zip onto the upload area
5. Add env vars (step 2), then upload again or trigger redeploy

### Option C — GitHub + Netlify

1. Push this folder to a GitHub repo
2. In Netlify: **Add new site → Import from Git**
3. Build command and publish directory are already in `netlify.toml`

## 4. Custom domain

1. Netlify → **Domain management → Add domain**
2. Follow DNS instructions for your registrar
3. HTTPS is automatic once DNS propagates

No code changes needed for a new domain.

## 5. Verify

- `https://YOUR-SITE.netlify.app/api/stats` → `{"activeCarriers":0}` (or a number)
- `/carrier-signup` — create a test carrier
- `/carrier-login` — sign in → 2FA screen after ~5 seconds
- `/admin` — default login: `Remy` / `465385AUA` (change via env vars in production)

## Local development

```powershell
npm install
npm run dev
```

For local API functions, use `npx netlify-cli dev` (requires env vars in Netlify or a local `.env` — never commit secrets).

## Project structure

```
src/                 React frontend
netlify/functions/   Serverless API (login, signup, 2FA, admin)
public/logo.png      Site logo + favicon
supabase/setup.sql   Database schema (run once)
netlify.toml         Netlify build & redirect config
```

## Current live reference

- Site: https://aquamarine-horse-9fdc8e.netlify.app
- Supabase project: **Central** (`muouuswlmwmmbifeegnx`)
- GitHub: https://github.com/Hayko-1993/simulation-netlify

When deploying elsewhere, use a **new** Supabase project or the same one — just point env vars at the right database.
