# Farmio PTS Hub — Setup & Deploy Guide

This app needs two things to go live: a **Supabase** project (free tier is fine) for the database
and login, and a **Vercel** project to host the app itself. Both steps below take about 10 minutes
total.

---

## Part 1 — Create your Supabase project (~5 min)

1. Go to [supabase.com](https://supabase.com) and sign up / sign in (GitHub login is fastest).
2. Click **New Project**.
   - Name: `farmio-pts-hub` (or anything you like)
   - Database password: generate and **save it somewhere** (you won't need it for this app, but keep it anyway)
   - Region: pick **Singapore** if available, otherwise the closest region to SG
   - Click **Create new project** and wait ~2 minutes for it to provision.

3. Once it's ready, go to the **SQL Editor** (left sidebar).
4. Click **New query**, then open the file `supabase/schema.sql` from this project, copy its
   entire contents, paste into the SQL editor, and click **Run**. This creates every table,
   security rule, and trigger.
5. Click **New query** again, open `supabase/seed.sql`, copy/paste, and click **Run**. This
   loads your real agent roster (Lina, Caleb, Joanna, etc.) plus a few sample orders so the
   dashboards aren't empty.

6. Go to **Project Settings** (gear icon) → **API**. You'll need two values from this page:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon / public** key (a long string under "Project API keys")

   Keep this tab open — you'll paste these into Vercel in Part 2.

7. **Turn off email confirmation** (recommended for an internal tool so people can sign in
   immediately without checking email): go to **Authentication** → **Sign In / Providers** →
   **Email**, and turn off **Confirm email**. You can leave it on instead if you'd rather agents
   confirm their email first — just know they'll need to click a confirmation link before they
   can log in.

---

## Part 2 — Deploy to Vercel (~5 min)

### Option A: Deploy via GitHub (recommended — gives you auto-deploys on every change)

1. Create a new GitHub repository and push this project to it:
   ```bash
   cd farmio-pts-hub
   git init
   git add .
   git commit -m "Initial commit — Farmio PTS Hub"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/farmio-pts-hub.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com), sign in, click **Add New** → **Project**.
3. Import the GitHub repo you just pushed.
4. In the **Environment Variables** section of the import screen, add:
   - `NEXT_PUBLIC_SUPABASE_URL` → paste your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → paste your Supabase anon key
5. Click **Deploy**. Wait ~2 minutes.
6. You'll get a live URL like `farmio-pts-hub.vercel.app` — that's your app.

### Option B: Deploy via Vercel CLI (if you don't want to use GitHub)

```bash
cd farmio-pts-hub
npm install -g vercel
vercel
# follow the prompts, then when asked, add the two env vars above
vercel --prod
```

---

## Part 3 — Create your first internal team account

1. Visit your live URL and click **Create account**.
2. Sign up with your work email and a password.
3. **Every new sign-up starts as an "agent" with no data linked** — this is intentional, so a
   random sign-up can never see internal data. You need to manually promote your own first
   account to internal access:
   - Go to your Supabase project → **Table Editor** → `profiles` table.
   - Find the row with your email, click into the `role` column, and change it from `agent` to
     `internal`.
4. Refresh the app — you should now see the **internal team dashboard** (Team Overview, Log Order,
   Agent Roster, etc.).
5. From here on, you can promote any future teammate's account to internal directly from the app:
   **Settings → Internal team access** — no need to touch Supabase again.

---

## Part 4 — Linking real agents to their accounts

Each part-time agent should:
1. Visit the app URL and click **Create account** with their own email.
2. Tell an internal team member they've signed up.

The internal team member then:
1. Goes to **Agent Roster**, clicks into that agent's profile (e.g. "Lina").
2. Under **Login access**, selects the agent's new account from the dropdown and clicks **Link
   account**.

Once linked, that agent can log in and see only their own orders and commissions — never anyone
else's.

---

## What's already set up for you

- **9 real agents** seeded from your spreadsheet (Lina, Caleb, Daniel, Joanna, Kartik, Timothy,
  Alan, Simon, Kai) with their actual status (Active/Inactive) and notes.
- **5 sample orders** so dashboards show real-looking data immediately — delete these once you
  start entering live orders (Supabase Table Editor → `orders` table → delete rows, or just leave
  them, they won't affect anything except early totals).
- **Row-level security** enforced at the database level — even if someone tampers with the app's
  frontend code, an agent account technically cannot query another agent's orders, customers, or
  commissions. This is checked by Postgres itself, not just hidden in the UI.

## Ongoing maintenance

- **Adding a new agent**: Agent Roster → "Add agent" button (internal only).
- **Adjusting LTV multipliers / targets / default commission amounts**: Settings page.
- **Marking a commission as paid**: Commissions page → "Mark paid" button next to any pending row.
- **If you ever need to wipe and reseed sample data**: re-run `supabase/seed.sql` after first
  deleting existing rows from `orders`, `customers`, and `agents` in the Table Editor.

If anything breaks or behaves unexpectedly, the first place to check is the Supabase **Table
Editor** to confirm data looks right, and the Vercel **Deployments** tab to check build/runtime
logs.
