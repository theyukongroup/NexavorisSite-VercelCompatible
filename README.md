# Nexavoris website — Vercel-viable copy

**A standard Next.js app, kept deliberately separate from `07 Website\`.**

## Why two copies exist

`07 Website\nexavoris-website\` is built and hosted through **OpenAI's Sites
product**: it uses `vinext` (a beta Vite-based framework), OpenAI's own
`@openai/sites-vite-plugin`, and deploys as a **Cloudflare Worker** via
`wrangler`, with D1/R2 bindings wired in. That stack has no `next` package at
all — `next build` cannot run against it, and Vercel's framework
auto-detection would not recognize it. Full findings in the chat that produced
this folder, 2026-09-03.

**This folder is a from-scratch port to plain Next.js** — same pages, same
components, same look, same content — with the OpenAI/Cloudflare-specific
tooling removed and `next`, real Tailwind v4 PostCSS config, and a standard
`tsconfig.json` in their place. It builds with `next build` and deploys on
Vercel with zero special configuration.

**Do not merge these two folders, and do not point this folder's git remote at
`theyukongroup/nexavoris-website`.** They are two separate GitHub repos on
purpose, so a push to one can never silently affect the other. This folder's
`origin` is `theyukongroup/NexavorisSite-VercelCompatible`; the old
`DamianYuDezign/Nexavoris-TestSite` remote is retained as `testsite`.

`07 Website\` is the **primary** copy and is read-only for us — never edit it.
All Vercel-side work happens here.

| | `07 Website\nexavoris-website\` | `10 User Data and Files\Damian\Nexavoris (Vercel Compatible)\` (here) |
|---|---|---|
| Framework | `vinext` (beta) via Vite | Next.js |
| Deploy target | Cloudflare Workers, via OpenAI Sites | Vercel |
| GitHub repo | `theyukongroup/nexavoris-website` | `theyukongroup/NexavorisSite-VercelCompatible` |
| Edit via | OpenAI Codex / Sites | Any normal Next.js workflow |

## What was verified before porting (2026-09-03)

- No page or component reads `process.env`, and none touches the Cloudflare
  D1/R2 bindings the original config wires in — the contact form is
  client-side only (`useState`, no `fetch`/API call). Nothing functional was
  lost in the port.
- Every runtime package the pages actually import (`@base-ui/react`,
  `@shadcn/react`, `lucide-react`, `recharts`, etc.) is a real, independently
  published npm package — none of it is OpenAI- or Cloudflare-specific.
- All content files (`app/`, `components/`, `hooks/`, `lib/`, `public/`,
  `components.json`) were copied byte-for-byte from the **outer** `07 Website\`
  copy, which is the more complete of the two existing copies there (it has
  the Pricing page the nested one lacks).

## Local development

```
npm install
npm run dev
```

**Note on Turbopack:** `dev`/`build` are pinned to `--webpack`. This project
lives on a mapped network drive (`K:\` → `\\UFS-FILE-SERVER\public folder\...`),
and Turbopack's path-containment check gets confused by the two different
Windows path forms for the same UNC location, failing with `Cannot depend on
path ... outside of root directory` even though nothing actually is. Webpack
doesn't have this problem. This is purely a local-machine/network-drive quirk —
**Vercel builds from a normal local path and is unaffected**; Turbopack would
work fine there. If this folder is ever moved to local disk, feel free to drop
`--webpack` and use Turbopack's faster builds instead.

## Deploying

Push to the GitHub repo, then in Vercel: **Add New → Project → Import** that
repo. No framework preset override needed — Vercel detects Next.js
automatically from `next` in `package.json`.

## Content changes going forward

If a page is edited in the OpenAI-hosted copy (`07 Website\`), the same change
needs to be **manually re-applied here** — there is no automatic sync between
the two. If that becomes painful, the honest fix is to pick one as the single
source of truth and stop maintaining both.

## Sync state (2026-09-09)

Content is synced through origin commit **`f8fbb8b` "Document live search
visibility growth plan"**. This pulled in 15 origin commits / 83 changed files:
the Phase 1-3 GEO/SEO infrastructure (`lib/seo.ts`, per-page canonical and
hreflang metadata, `robots.ts`, `sitemap.ts`), the multilingual resource
library (`app/resources/`, `lib/resource-content.ts`), the authority pages
(case studies, how-it-works, methodology, trust, privacy, terms), industry
personalization, the mobile navigation drawer, and the `theme-v2.css` refresh.

The origin also fixed the `sitemap.ts`/`robots.ts` domain mismatch noted
previously — both now derive from `SITE_URL` in `lib/seo.ts` (`nexavoris.ai`),
so that divergence is retired.

### Deliberately NOT ported: the member platform

The origin's member platform and admin dashboard depend on two things that do
not exist on Vercel:

- **Cloudflare D1** — `lib/member-db.ts` and `lib/admin-auth.ts` import
  `cloudflare:workers` and type against `D1Database`.
- **ChatGPT identity** — `app/chatgpt-auth.ts` (`getChatGPTUser`,
  `chatGPTSignInPath`) is supplied by OpenAI Sites.

Porting them requires choosing a Postgres host and an auth provider, and
rewriting the data layer against it. The schema is already plain SQL in the
origin's `.openai/drizzle/` migrations, so it would move without redesign.

Omitted here: `app/account/`, `app/free-account/`, `app/admin/`,
`app/api/member|events|consultations/`, `app/chatgpt-auth.ts`,
`lib/member-db.ts`, `lib/admin-auth.ts`, and `MemberDashboard` (and its
Profile/Opportunity/ROI/Roadmap tools) from `components/member-platform.tsx`.

Kept, because they are self-contained and need no database: `ScoreCards` and
`AssessmentTool`, so the public `/assessment` lead-generation page works. Its
analytics `emit()` posts to `/api/events`, which does not exist here — the call
is already `void fetch(...).catch(() => undefined)`, so it fails silently.

Consequently:

- `layout.tsx` drops the header Sign In / My Account link and the
  `/free-account` footer link.
- `MobileNavigation`'s `signedIn` / `accountHref` props are now optional; the
  account section of the drawer renders only when `accountHref` is supplied.
  Pass it again once auth exists.
- `/free-account` is commented out of `marketingRoutes` in `lib/seo.ts` so the
  sitemap does not advertise a 404. `robots.ts` still disallows the member
  paths, which is harmless and forward-compatible.
- `proxy.ts` is kept exactly as the origin has it. Next.js 16 **renamed the
  middleware convention to `proxy`** — `middleware.ts` now emits a deprecation
  warning and `npx @next/codemod@canary middleware-to-proxy .` is the official
  migration. vinext already follows the Next 16 convention, so no change was
  needed. (An earlier pass converted it to `middleware.ts`; that was backwards
  and has been reverted.)

## Deliberate divergences from the origin

Fixes that exist only in this copy — **re-apply them after any future re-sync**
from `07 Website\nexavoris-website`:

1. **Pricing CSS collision fix** — `extended.css` and `theme-v2.css` define
   `.pricing-grid` / `.price` / `.popular` globally, so `/pricing` and
   `/website-design` corrupt each other. Fixed by scoping the website-design
   rules under `.pricing`. **The 2026-09-09 sync overwrote this and it was
   re-applied** (18 selectors in `extended.css`, 9 in `theme-v2.css`). The
   origin has since scoped the services-pricing half under `.pricing-group`
   itself, so only the `.pricing` half is still ours to maintain.
2. **`app/fixes.css`** — `:focus-visible` outlines and a
   `prefers-reduced-motion` guard, imported from `layout.tsx`. The origin now
   ships a real mobile drawer (`components/mobile-navigation.tsx`), which
   supersedes the old local `components/mobile-nav.tsx`; that file is now
   unused and can be deleted once the drawer is confirmed good.
3. **Transparent logo + real favicons** — `nexavoris-logo.png` is transparent
   here. `favicon.ico` / `favicon.png` / `apple-touch-icon.png` are cropped
   from the hexagon mark. **The 2026-09-09 sync reverted `layout.tsx` to the
   origin's placeholder `/favicon.svg` and it was restored.**
4. **`public/llms.txt`** — AEO file, this copy only.
5. **`components/contact-content.tsx`** — the origin's `app/contact/page.tsx`
   takes a `messages` prop so `localized-content` can re-render it with
   translations. Next.js 16 validates that a route page's props match
   `PageProps`, so a `messages` prop makes the build fail type checking. The
   body now lives in `components/contact-content.tsx`; `app/contact/page.tsx`
   is a thin wrapper, and `localized-content` imports the component directly.
6. **`localized-content` route-key cast** — the origin casts
   `routeKey(slug)` to `keyof typeof pages`, which excludes `'contact'`, then
   compares the result to `'contact'` two lines later. That is a type error
   under `tsc`. Widened to `keyof typeof pages | 'contact'`. **This bug is
   still live in the origin** — vinext is evidently not type checking it.
