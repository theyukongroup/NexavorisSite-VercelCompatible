# Nexavoris website — Vercel-viable copy

**A standard Next.js app, kept deliberately separate from `07 Website\`.**

## Why two copies exist

`07 Website\nexavoris-website\` is built and hosted through **OpenAI's Sites
product**: it uses `vinext` (a beta Vite-based framework), OpenAI's own
`@openai/sites-vite-plugin`, and deploys as a **Cloudflare Worker** via
`wrangler`, with D1/R2 bindings wired in. Its member area signs people in with
OpenAI's **Sign in with ChatGPT**. That stack has no `next` package at all —
`next build` cannot run against it, and Vercel's framework auto-detection would
not recognize it.

**This folder is a port to plain Next.js** — same pages, same components, same
look, same content — with the OpenAI/Cloudflare-specific pieces replaced: `next`
and a standard Tailwind v4 / TypeScript setup for the build, **Supabase** for
sign-in and the database. It builds with `next build` and deploys on Vercel.

**Do not merge these two folders, and do not point this folder's git remote at
`theyukongroup/nexavoris-website`.** They are two separate GitHub repos on
purpose, so a push to one can never silently affect the other. This folder's
`origin` is `theyukongroup/NexavorisSite-VercelCompatible`; the old
`DamianYuDezign/Nexavoris-TestSite` remote is retained as `testsite`.

`07 Website\` is the **primary** copy and is read-only for us — never edit it.
All Vercel-side work happens here.

| | `07 Website\nexavoris-website\` | `10 User Data and Files\Damian\Nexavoris (Vercel Compatible)\` (here) |
|---|---|---|
| Framework | `vinext` (beta) via Vite | Next.js 16 |
| Deploy target | Cloudflare Workers, via OpenAI Sites | Vercel |
| Sign-in | Sign in with ChatGPT (OpenAI Sites) | Supabase Auth, email + password |
| Database | Cloudflare D1 (SQLite) | Supabase Postgres |
| GitHub repo | `theyukongroup/nexavoris-website` | `theyukongroup/NexavorisSite-VercelCompatible` |
| Edit via | OpenAI Codex / Sites | Any normal Next.js workflow |

## Sync state (2026-09-11)

Content is synced through origin commit **`f1e592f` "Restore version 46
homepage headline font"** — everything in the origin's `app/`, `components/`,
`lib/`, `locales/`, `public/`, `db/`, `scripts/` and `admin-csv-templates/`,
including the member platform, administrator dashboard and SEO/GEO control
center. A full file comparison against the origin shows only the deliberate
divergences listed at the end of this file.

The 2026-09-03 note that "the contact form is client-side only" was wrong: it
POSTs to `/api/consultations`, which did not exist here until this sync, so
contact submissions failed on every earlier Vercel build.

## Local development

UI work needs no secrets:

```
npm install
npm run dev
```

Public pages render without any environment variables. Signing in, the member
area, `/admin` and every `/api/*` route need the Supabase variables below.
**Never put a `.env*` file in this folder** — it is on the shared K: drive, and
company policy forbids credentials there. To run against real services, clone
the repo to local disk (e.g. `C:\dev\`) and run `vercel env pull` there.

**Note on Turbopack:** `dev`/`build` are pinned to `--webpack`. This project
lives on a mapped network drive (`K:\` → `\\UFS-FILE-SERVER\public folder\...`),
and Turbopack's path-containment check gets confused by the two different
Windows path forms for the same UNC location, failing with `Cannot depend on
path ... outside of root directory` even though nothing actually is. Webpack
doesn't have this problem. **Vercel builds from a normal local path and is
unaffected.**

Checks:

```
node --experimental-strip-types scripts/sql-dialect-selftest.mjs   # SQLite -> Postgres translation
npm run audit:seo -- https://<deployment-url>                        # origin's SEO regression script
```

## Deploying

### 1. Vercel project

**Add New → Project → Import** `theyukongroup/NexavorisSite-VercelCompatible`.
No framework preset override is needed. Note the **function region**
(Settings → Functions); the Supabase project should be in the matching region,
because the admin dashboard makes many small database queries per page.

### 2. Supabase (via the Vercel Marketplace)

Vercel project → **Storage / Marketplace → Supabase → create**. The integration
injects the environment variables the code reads:

| Variable | Read by | Notes |
|---|---|---|
| `SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`) | `lib/supabase/config.ts` | |
| `SUPABASE_PUBLISHABLE_KEY` (or `NEXT_PUBLIC_…`, or the legacy `…ANON_KEY`) | `lib/supabase/config.ts` | Public key; safe in the browser, but only used on the server here |
| `POSTGRES_URL` | `lib/member-db.ts` | Pooled (transaction-mode) connection |
| `NEXAVORIS_ADMIN_EMAILS` | `lib/admin-auth.ts` | **Add by hand** (Production + Preview): comma-separated bootstrap administrators |

The service-role key, JWT secret and non-pooled URL are deliberately not used
by the app. Every variable is read at request time and a missing one throws
with a message naming it — there are no defaults.

**Apply the schema:** paste `supabase/migrations/20260911120000_nexavoris_member_platform.sql`
into the Supabase SQL editor and run it. It is idempotent. The app never creates
tables; if one is missing, database calls fail with the table names.

**Supabase Auth settings (Authentication):**

- Email provider **on**, **Confirm email on**. Admin bootstrap depends on it
  staying on (see divergence 8).
- Minimum password length **10** (the forms enforce 10 too).
- JWT signing keys: **asymmetric** (the default for new projects), so session
  checks verify locally instead of calling Supabase on every page view.
- **Site URL:** `https://nexavoris.ai` once the domain is live (the Vercel URL
  while testing).
- **Redirect URLs** allowlist: `https://nexavoris.ai/**`,
  `https://*-<vercel-team>.vercel.app/**`, `http://localhost:3000/**`. If a
  link's host is not on this list, Supabase silently substitutes the Site URL
  and the email link breaks.
- **Rate limits:** raise "sign-ups and sign-ins". Sign-in runs in server actions,
  so every request reaches Supabase from Vercel's IP addresses.

**Email templates** (Authentication → Email Templates). Links must land on
`/login/verify`, which redeems the token only when the person presses a button,
so Outlook/Defender link scanners can't use it up. The app passes
`/login/verify?next=…` as the redirect, so the templates append the token:

- *Confirm signup:* `<a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email">Confirm your email address</a>`
- *Reset password:* `<a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=recovery">Choose a new password</a>`

### 3. Resend (sign-in emails)

Resend → add domain `nexavoris.ai` and create its DNS records **at Bluehost**
(DKIM TXT plus the `send.` SPF/MX records). Leave the root MX
(`mail.nexavoris.ai`) untouched — company mail runs through it. Then Supabase →
Authentication → SMTP settings: host `smtp.resend.com`, port `465`, username
`resend`, password = a Resend API key (stored only in Supabase), sender
`no-reply@nexavoris.ai`, name `Nexavoris`. Raise Supabase's email rate limit
afterwards.

### 4. Domain cutover (after the preview is signed off)

1. Export anything worth keeping from the OpenAI site's `/admin` first. D1 data
   is not migrated: ChatGPT user IDs don't map to Supabase users.
2. Vercel → Domains: add `nexavoris.ai` and `www.nexavoris.ai`, redirecting www
   to the apex (`SITE_URL` in `lib/seo.ts` is the apex).
3. Bluehost DNS: lower the TTL, replace the apex A records (OpenAI/Cloudflare)
   with the value Vercel shows, and add the `www` CNAME it shows. Before
   2026-09-11 `www.nexavoris.ai` had no record at all, which is why "www" had no
   working certificate. Leave MX and TXT records alone.
4. Supabase Site URL → `https://nexavoris.ai`; remove the domain from OpenAI Sites.

## Member platform on Vercel

**Identity.**
- `lib/auth.ts` reads the Supabase session: `getClaims()` for ordinary checks
  (a local JWT check), and `getUser()` where an email address grants access.
- `app/chatgpt-auth.ts` re-exports these under the origin's names
  (`getChatGPTUser`, `requireChatGPTUser`, `chatGPTSignInPath`), so the origin's
  pages copy over unchanged.
- The origin's hard-coded `/signin-with-chatgpt` and `/signout-with-chatgpt`
  links are served by small route handlers of the same name.

**Pages.** `/login` (sign in / create account), `/login/verify` (email links),
`/forgot-password` and `/reset-password`:
- They live under `app/(auth)/` and are server-rendered in all four languages
  from `lib/auth-copy.ts`.
- They are marked `data-no-translate` so the client translator leaves them
  alone, and are noindexed (`robots.ts` already disallows the paths).
- Forms post to server actions in `lib/auth-actions.ts`.

**Data.**
- `lib/member-db.ts` implements the part of the D1 API the origin uses
  (`prepare/bind/first/all/run`, `batch`) on postgres.js, so the origin's API
  routes are byte-identical here.
- `lib/sql-dialect.ts` converts `?` placeholders and `INSERT OR IGNORE`, and
  **throws on any other SQLite-only syntax**, so a re-sync that introduces some
  fails loudly instead of misbehaving.

**Session refresh and request hygiene.** In `proxy.ts`:
- Refreshes expiring sessions (Server Components can't write cookies).
- Rejects cross-site POSTs to `/api/*`.
- Refuses requests carrying `oai-authenticated-*` headers.

**Security rules — keep them true:**

- Every table in `public` has row level security **enabled with no policies**
  and no grants to `anon`/`authenticated`. The app connects as the owner
  (which bypasses RLS). The public key must never be able to read member data
  through Supabase's REST API. Check with:
  `select relname from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;`
  (must return no rows).
- Administrator access via `NEXAVORIS_ADMIN_EMAILS`, or via an email-address
  staff grant, requires a **confirmed** email.
- Suspension is enforced by the member/admin APIs (origin behaviour) and also at
  sign-in.

## Re-syncing from the origin

There is no automatic sync. When the origin changes:

1. Copy changed files with `git -C "<origin>" show HEAD:<path> > <path>`. Both
   working trees are CRLF while git stores LF, so plain file diffs look like
   every line changed; compare with `diff --strip-trailing-cr` or
   `git diff --stat <last-sync> HEAD` in the origin.
2. **Never copy** `app/chatgpt-auth.ts`, `lib/member-db.ts`, `lib/admin-auth.ts`
   or `proxy.ts` wholesale — merge by hand (divergences 6–9).
3. **Schema:** run `git -C "<origin>" diff <last-sync> HEAD -- lib/member-db.ts .openai/drizzle db/schema.ts`.
   Any change needs a new timestamped file in `supabase/migrations/` that also
   enables RLS and revokes `anon`/`authenticated` on new tables. New tables are
   caught at runtime (the adapter checks `db/schema.ts`); new columns are not.
4. Re-apply divergences 1–5 and 11, run `npm run build`, update the sync state above.

## Deliberate divergences from the origin

Re-apply these after any re-sync from `07 Website\nexavoris-website`:

1. **Pricing CSS collision fix** — `extended.css` and `theme-v2.css` define
   `.pricing-grid` / `.price` / `.popular` globally, so `/pricing` and
   `/website-design` corrupt each other. Fixed by scoping the website-design
   rules under `.pricing` (18 selectors in `extended.css`, 9 in `theme-v2.css`).
   When the origin changes either file, merge rather than copy. On 2026-09-11 the
   origin's new "AI ERP pillar content" block was appended to `extended.css`.
2. **`app/fixes.css`** — `:focus-visible` outlines and a
   `prefers-reduced-motion` guard. The origin's `layout.tsx` is used as-is
   **plus `import './fixes.css';`** after `member.css`.
3. **`public/llms.txt`** — AEO file, this copy only.
4. **`components/contact-content.tsx`** — the origin's `app/contact/page.tsx`
   takes a `messages` prop so `localized-content` can re-render it with
   translations. Next.js 16 validates that a route page's props match
   `PageProps`, so that prop fails type checking. The body lives in
   `components/contact-content.tsx`; `app/contact/page.tsx` is a thin wrapper,
   and `localized-content` imports the component directly.
5. **`localized-content` route-key cast** — the origin casts `routeKey(slug)` to
   `keyof typeof pages`, which excludes `'contact'`, then compares it to
   `'contact'`. That is a type error under `tsc`; widened to
   `keyof typeof pages | 'contact'`. Still live in the origin.
6. **`app/chatgpt-auth.ts`** — Supabase-backed shim with the origin's export
   names. **Never overwrite it:** the origin's version trusts
   `oai-authenticated-user-*` request headers, which any client can send on
   Vercel — copying it would let anyone sign in as anyone.
7. **`lib/member-db.ts`** — the D1-compatible Postgres adapter, with
   `lib/sql-dialect.ts`, `scripts/sql-dialect-selftest.mjs` and
   `supabase/migrations/`. `ensureMemberSchema()` verifies tables instead of
   creating them.
8. **`lib/admin-auth.ts`** — origin SQL unchanged; identity from
   `getVerifiedUser()` and **only confirmed email addresses are trusted** for
   bootstrap and staff binding.
9. **`proxy.ts`** — the origin's `proxy` is renamed `localeProxy`, its two bare
   `NextResponse.next()` calls forward request headers, and a Vercel-only block
   (marked in the file) adds session refresh, the cross-site `/api` check and
   the `oai-*` header refusal.
10. **Vercel-only auth files** (no origin counterpart): `lib/auth.ts`,
    `lib/auth-actions.ts`, `lib/auth-copy.ts`, `lib/env.ts`, `lib/supabase/*`,
    `components/auth-forms.tsx`, `app/(auth)/**`, `app/api/auth/confirm/`,
    `app/signin-with-chatgpt/`, `app/signout-with-chatgpt/`.
11. **Type-check fixes in two origin components** — vinext does not type check;
    `next build` does. `components/member-platform.tsx` casts the opportunity
    results passed to `onSave` (`as ReturnType<typeof buildOpportunities>`), and
    `components/admin-dashboard.tsx` annotates one `.filter((x: string) => …)`
    callback. Re-apply both whenever either file is copied from the origin.

**Retired (2026-09-11):**
- The logo/favicon divergence: the origin now ships the same files since
  `7a1aea6`.
- The unused `components/mobile-nav.tsx` and its CSS: superseded by the
  origin's drawer.
- The member-platform omissions (header Sign In link, optional
  `MobileNavigation` props, `/free-account` removed from the sitemap): all
  restored to origin behaviour.
