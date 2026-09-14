# TextJune Concern Portal

A concern-submission and resolution portal for VAs and their managers, built with
Next.js (App Router), NextAuth (Google sign-in), Prisma + Postgres, and Vercel Blob
for attachments. Deep green theme, ready to deploy on Vercel.

## Features

- **Google sign-in only** — anyone with a Gmail account in your org can sign in.
- **Concern submission form** — VA/Slack name, manager, severity, concern type,
  description, impact, actions already taken, what's needed, and file/photo
  attachments.
- **Queue page** — everyone can see all concerns, filterable by Pending /
  Escalated / Resolved, with search.
- **Manager admin page (`/admin`)** — each manager only sees the tickets routed
  to them (their "bucket"), matched by the Gmail address they sign in with.
- **Responses** — managers can post a response, edit it later, and every edit is
  saved with its own timestamp (full version history, viewable inline).
- **Status control** — the owning manager can move a ticket between Pending,
  Escalated, and Resolved; every change is logged with a timestamp.
- **Notifications** — the moment a ticket is created, the assigned manager gets
  both an email (via Resend) and an in-app notification (bell icon, top right).
  Submitters get notified in-app when their manager responds.
- **Manage Managers page (`/admin/managers`)** — a super admin (set via env var)
  can add/deactivate managers without touching code.

## Tech stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- NextAuth.js — Google OAuth, database session strategy
- Prisma ORM + PostgreSQL (built for Vercel Postgres / Neon)
- Vercel Blob — file uploads, client-side direct upload
- Resend — transactional email

## 1. Local setup

```bash
npm install
cp .env.example .env
```

Fill in `.env` as you complete the steps below.

### Database (Vercel Postgres / Neon)

1. In your Vercel project: **Storage → Create Database → Postgres**.
2. Copy the pooled connection string into `DATABASE_URL` and the
   non-pooling one into `DIRECT_URL`.
3. Push the schema:
   ```bash
   npm run db:push
   ```
4. (Optional) seed a couple of starter managers — edit the list in
   `prisma/seed.ts` first:
   ```bash
   npm run db:seed
   ```
   You can also add managers later from `/admin/managers` in the app.

### Google OAuth

1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create an OAuth Client ID (type: Web application).
3. Authorized redirect URI:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://YOUR-DOMAIN/api/auth/callback/google`
4. Copy the Client ID/Secret into `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.
5. Generate a NextAuth secret: `openssl rand -base64 32` → `NEXTAUTH_SECRET`.
6. If you only want your organization's Gmail accounts to be able to sign in,
   restrict this at the Google Cloud OAuth consent screen level (internal app),
   or add an allow-list check in `lib/auth.ts`'s `signIn` callback.

### Vercel Blob (file uploads)

1. In Vercel: **Storage → Create Database → Blob**.
2. Copy the read/write token into `BLOB_READ_WRITE_TOKEN`.

### Resend (email notifications)

1. Create a free account at [resend.com](https://resend.com) and grab an API key
   for `RESEND_API_KEY`.
2. Verify a sending domain (or use their sandbox `onboarding@resend.dev` for
   testing) and set `EMAIL_FROM` accordingly.

### Super admin

Set `SUPER_ADMIN_EMAILS` to a comma-separated list of Gmail addresses that
should be able to manage the Manager list at `/admin/managers`. This is separate
from being a manager — a super admin doesn't automatically get a manager queue.

### Run it

```bash
npm run dev
```

Visit `http://localhost:3000`, sign in with Google. If your email matches a
row in the `Manager` table, you'll land on `/admin` (your queue); otherwise
you'll land on `/submit`.

## 2. Deploy to Vercel

1. Push this project to a GitHub repo.
2. In Vercel: **New Project → Import** the repo.
3. Add all the environment variables from `.env` in the Vercel project
   settings (Production and Preview).
4. Set `NEXTAUTH_URL` to your production URL once you know it (e.g.
   `https://concerns.textjune.com`), and update the Google OAuth redirect URI
   to match.
5. Deploy. On first deploy, run `npm run db:push` once (locally, pointed at the
   production `DATABASE_URL`/`DIRECT_URL`) to create the tables — or wire it
   into a build step if you prefer.

## How manager routing works

There's a `Manager` table (`name`, `email`, `active`). When someone submits a
concern, they pick a manager by name from a dropdown populated from this
table. When a manager signs in with Google, their session is flagged
`isManager: true` if their Gmail matches a `Manager.email`, and `/admin` shows
only tickets where `managerId` matches that manager — this is the "queue
bucket" per manager.

To onboard a new manager: go to `/admin/managers` (signed in as a super admin)
and add their name + Gmail address.

## Project structure

```
app/
  page.tsx                 Landing + sign-in
  submit/page.tsx           Concern submission form
  queue/page.tsx             All-tickets queue (filterable)
  admin/page.tsx              Manager's own queue bucket
  admin/managers/             Super-admin manager management
  ticket/[id]/                Ticket detail, responses, status, edit history
  api/                        REST endpoints (tickets, responses, uploads, notifications, managers)
components/                  Shared UI (Navbar, badges, file upload, notification bell, ticket list)
lib/                         auth.ts, prisma.ts, email.ts, session.ts
prisma/schema.prisma         Data model
```

## Notes / things you may want to customize

- **Concern types** and **severity labels** are defined in
  `app/submit/page.tsx` (`CONCERN_TYPES`, `SEVERITIES`) — edit freely.
- The notification bell polls every 30 seconds; for true real-time you could
  swap this for Pusher/Ably or a Postgres LISTEN/NOTIFY setup later.
- File upload limit is 10MB per file (`app/api/upload/route.ts`).
- Theme colors live in `tailwind.config.ts` under `colors.brand` if you want to
  adjust the exact shade of green.
