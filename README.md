# ASEAN Cyber Signals

ASEAN Cyber Signals is a private, presentation-ready cybersecurity intelligence application for presales conversations in Singapore, Malaysia, and Indonesia. It connects reviewed public evidence to customer impact, security outcomes, Cisco-aligned capability plays, discovery questions, and citation-backed briefs.

The application is designed to be shown to customers and partners from a private URL. Presentation Mode removes administration controls and internal Cisco Opportunity Fit scoring while screen sharing.

## What is included

- Fifteen reviewed signals, with five for each market.
- Country views, regional comparisons, source evidence, and transparent score inputs.
- One primary Cisco capability play and up to two supporting capabilities per signal.
- A structured brief builder with citation validation and deterministic PDF output.
- Single-owner authentication backed by Supabase in production.
- Review-first source discovery with fixed allowlists, quarantine states, and no automatic publication.
- A light, keyboard-operable interface with automated WCAG checks.

Threat Priority and Cisco Opportunity Fit are separate 0 to 100 scores. They are never averaged. Raw national incident totals are not compared unless their definitions and normalization are compatible.

## Technology

- Next.js 16 App Router, React 19, TypeScript, and Node.js 24 or newer.
- Tailwind CSS 4, Radix primitives, Phosphor icons, Recharts, and TanStack Table.
- Supabase Postgres, Auth, private Storage, SQL migrations, and row-level security.
- OpenAI Responses API behind a replaceable brief provider, with a deterministic local fallback.
- `@react-pdf/renderer` for server-side A4 exports.
- Vitest, Playwright, axe, ESLint, TypeScript, and GitHub Actions.
- Vercel functions in Singapore (`sin1`).

## Local setup

Prerequisites:

- Node.js 24 or newer.
- pnpm 11.9.0. Corepack can install the version declared in `package.json`.

Install and configure:

```bash
corepack enable
pnpm install
cp .env.example .env.local
```

For a local-only demonstration, set these values in `.env.local`:

```dotenv
DEMO_OWNER_USERNAME=local-owner
DEMO_OWNER_PASSWORD=choose-a-local-password
SESSION_SECRET=generate-at-least-32-random-characters
```

Generate the session secret with `openssl rand -base64 48`. Development demo credentials are ignored when `NODE_ENV=production`.

Start the application:

```bash
pnpm demo
```

Open [http://localhost:3200](http://localhost:3200), then sign in with the local owner credentials. The demo command uses port 3200 to avoid common conflicts with local monitoring services. Use `pnpm dev` if you prefer Next.js on its default port. Without either development demo credentials or a complete Supabase configuration, authentication fails closed.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm e2e
```

`pnpm ci:quality` runs lint, typecheck, unit tests, and the production build. Playwright starts a development server with isolated demo credentials and verifies route protection, login, logout, navigation, Presentation Mode, WCAG rules, keyboard access, and 390 pixel reflow. The plain `pnpm ci` command is reserved by pnpm as a frozen-lockfile install alias.

GitHub Actions repeats these checks with Node.js 24, runs an independent Gitleaks scan, and retains the browser report when a browser test fails.

## Supabase production setup

1. Create a Supabase project in Singapore (`ap-southeast-1`).
2. Apply `supabase/migrations/0001_initial.sql` with the Supabase CLI or SQL editor.
3. Disable public registration, anonymous access, and email sign-ups in Supabase Auth.
4. Create one verified email and password owner account after the migration is applied.
5. Set the production variables below in Vercel.

Required client and owner mapping:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
OWNER_USERNAME=your-private-username
OWNER_EMAIL=the-supabase-owner-email@example.com
```

Required only for trusted server jobs:

```dotenv
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CRON_SECRET=generate-a-long-random-value
INGESTION_ADMIN_SECRET=generate-a-different-long-random-value
```

`OWNER_USERNAME`, `OWNER_EMAIL`, service keys, and integration secrets are server-only. The owner password stays in Supabase Auth and is never placed in source code or Vercel variables. Every database table is protected by row-level security, independently of route checks.

The initial migration includes the owner profile, evidence, immutable trend versioning, product mapping, briefs, audit history, publication prerequisites, and append-only governance controls. Review the migration in a staging project before applying it to production.

## OpenAI brief generation

Set `OPENAI_API_KEY` to enable the Responses API provider. `OPENAI_MODEL` defaults to `gpt-5.6-terra` as specified for this release.

The provider receives only approved public-source excerpts and opaque evidence, trend, and product IDs. It uses structured output, `store: false`, no model tools, a fixed timeout, and post-generation citation validation. Unknown IDs or missing citation coverage are rejected. Raw prompts are not logged. If no API key is present, the application uses a deterministic, citation-backed generator suitable for local evaluation.

Brief input deliberately excludes customer names, free-text architectures, and confidential notes. Do not paste customer-identifying or confidential data into source evidence or environment variables.

## Evidence intake and governance

Automated adapters use fixed HTTPS host allowlists, redirect and DNS revalidation, content-type checks, magic-byte checks, response limits, conservative retries, and quarantine on structural anomalies. They discover material into a review queue and never publish automatically.

Komdigi, JDIH, and OJK remain reviewed URL or PDF inbox sources because unattended collection is unreliable. The application does not bypass WAF controls, crawl arbitrary hosts, execute PDF scripts, render PDFs in a browser, or perform OCR in this release.

The Vercel cron calls `/api/cron/ingest` every four hours. Individual adapters decide whether a target is due according to their configured cadence. Set `CRON_SECRET` and use a paid Vercel tier for this schedule. Keep every adapter in shadow mode for at least 14 days, with at least 95 percent successful checks and zero false publications, before approving routine use.

## Vercel deployment

1. Push the repository to a private GitHub repository and import it into Vercel.
2. Set the Node.js runtime to 24 and use pnpm.
3. Add the production Supabase variables and server secrets.
4. Add `OPENAI_API_KEY` only if AI brief generation is required.
5. Add `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_AUTH_TOKEN` only after configuring a project with PII collection disabled.
6. Deploy, then verify login, a protected route, one brief, and one PDF from the private URL.

`vercel.json` fixes the execution region to Singapore and configures the ingestion schedule. The application adds CSP, HSTS in production, clickjacking protection, MIME sniffing protection, and restrictive browser permissions.

Do not enable a public preview bypass. Restrict deployment access at the Vercel project level as an additional control, while keeping application authentication enabled.

## Data and sharing boundaries

- Public source facts must retain publisher, original link, publication date, retrieval date, observation period, original language, metric kind, and review status.
- Cisco products are positioned as enabling controls. They do not guarantee compliance.
- Cisco Readiness Index material is vendor research and must not be presented as independent threat evidence.
- Opportunity Fit is internal-only and is excluded from Presentation Mode and PDFs.
- Every AI-assisted draft must be reviewed before sharing.
- No customer-identifying or confidential information may be stored or sent to AI.
- The generated identity artwork is original project branding. No Cisco logo or CiscoSans asset is included.

Product capabilities, legal obligations, and source observations can change. Revalidate them before every customer-facing use.
