# Farmio PTS Hub

A two-dashboard platform for managing Farmio SG's part-time sales agent (PTS) program —
replacing the manual spreadsheet tracker with role-based, real-time dashboards.

- **Agent dashboard**: read-only view of your own orders and a transparent commission ledger
  (paid vs. pending, down to the dollar).
- **Internal team dashboard**: quick order entry, full order visibility across all agents, agent
  roster management, team performance overview, and commission payout management.

Built with Next.js 16, Supabase (Postgres + Auth + Row-Level Security), and Tailwind CSS.

## Get started

See **[SETUP.md](./SETUP.md)** for the full step-by-step guide to creating your Supabase project
and deploying to Vercel. It takes about 10 minutes.

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase URL + anon key
npm run dev
```

## Project structure

```
app/                    Next.js App Router pages (one folder per route)
  actions/mutations.ts  Server actions — every database write goes through here
components/             Shared React components (tables, forms, cards, shell/nav)
lib/                     Supabase client setup, auth helpers, formatting utilities
types/database.ts       TypeScript types matching the database schema
supabase/
  schema.sql             Run this first in the Supabase SQL Editor
  seed.sql               Run this second — loads the real agent roster + sample orders
```

## Security model

Access control is enforced at the database level via Postgres Row-Level Security, not just hidden
in the UI:
- Agents can only ever read their own `orders` and assigned `customers` rows.
- Only `internal`-role accounts can insert/update/delete orders, customers, agents, or config.
- A brand-new sign-up defaults to agent-level access with no data linked, until an existing
  internal team member explicitly links or promotes the account.
