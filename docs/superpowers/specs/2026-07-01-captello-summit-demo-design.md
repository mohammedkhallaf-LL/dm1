# Captello Summit — Envoy Scan-Target Demo Site

**Date:** 2026-07-01
**Status:** Approved design → ready for implementation plan
**Location:** `/home/workl/leadliaison/dm1/` — we REUSE the existing `dm1` git repo
(remote `github.com/mohammedkhallaf-LL/dm1`, branch `main`). The user confirmed
"all I need from that project is the repo": we wipe dm1's source and rebuild to
this spec, keeping `.git`, the remote, and dm1's `AGENTS.md` guard. Commits stack
on `main`. Package name → `captello-summit-demo`; folder/remote stay `dm1`.
See the companion `2026-07-01-tech-scan.md` for verified stack versions/APIs.

---

## 1. Purpose

A **realistic B2B conference website** that the Captello Envoy Chrome extension
scans live during demos. It serves two roles at once:

1. **Demo prop** — a convincing, polished event site (attendees, speakers,
   exhibitors, sponsors, agenda) that shows off what the extension can extract.
2. **Test oracle** — every rendered record is backed by known ground-truth data
   whose field shape matches the extension's export schema 1:1, so QA can scan a
   page, export the site's ground-truth, and diff the two files.

**Core constraint (shapes everything):** the data model mirrors the extension's
export contract — `INDIVIDUAL_FIELDS` and `COMPANY_FIELDS` in
`captello-envoy/src/sidepanel/store/schema.ts`. Field keys, labels, and column
order in the site's export must line up with the extension's CSV/XLSX export so a
diff is meaningful.

### Success criteria

- Deploys to Vercel with one command (`vercel --prod`), zero config.
- 21 selectable example sites (7 Tech · 7 Healthcare · 7 Multi-industry).
- ≥1000 individuals and ≥600 companies available across examples; at least one
  example exceeds 1500 individuals to test scan endurance/pagination.
- Ground-truth export (CSV + XLSX + JSON) matching the extension's field order.
- **Zero real human faces** in any avatar/image — generated SVG monograms /
  geometric identicons only.
- Difficulty mix (easy/medium/hard) present across examples.
- Fully TypeScript; `tsc --noEmit` clean; `npm run build` succeeds.

### Non-goals (YAGNI)

- No backend/database — all data is committed JSON generated at build.
- No real auth, no real network calls, no analytics.
- Not a marketing site and not the EI webapp mock (explicitly a **scan target**).
- No live/runtime faker — data is deterministic and committed (a dev-only
  "regenerate" script exists, but pages read committed JSON).

---

## 2. Stack & tooling

| Concern | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router), TypeScript, SSG (`generateStaticParams`) |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`/vite equivalent for Next) + shadcn tokens |
| Theme | Ported from `captello-envoy/src/shared/styles.css` — Captello red `#ff0000`, Inter Variable, `--radius` 0.625rem, light + dark |
| Icons | `lucide-react` (matches extension). No emoji as icons. |
| Data gen | `@faker-js/faker` (seeded), run at build via `scripts/generate.ts` |
| Export | CSV (hand-rolled), XLSX (`exceljs` — already a devDep pattern in envoy), JSON |
| Fonts | `@fontsource-variable/inter` self-hosted (matches extension; avoids remote font requests) |
| Deploy | Vercel |

**Why Next.js SSG:** the scanner reads server-rendered HTML. SSG pages produce
real crawlable markup (no client-only hydration gap), faithful to how a real
event site serves content. Detail routes use `generateStaticParams` so every
person/company has a static URL.

---

## 3. Theme port (single source of truth)

`lib/theme/tokens.css` — copy the `@theme` block and `:root` / `.dark` custom
properties from `captello-envoy/src/shared/styles.css`:

- Brand: `--color-brand: #ff0000`, `--brand-hover: #cc0000`, `--brand-light: #fff0f0`
- Neutrals: white/grey surfaces (`#ffffff`, `#f9fafb`, `#f3f4f6`), text
  `#111827` / `#6b7280` / `#9ca3af`, border `#e4e0de`
- shadcn semantic tokens (oklch) for light + dark, `--radius: 0.625rem`
- Font: `'Inter Variable', 'Inter', 'Roboto', sans-serif`

Per-theme accent is **out** (user chose the single extension palette). All 21
examples share the Captello-red theme; they differ by content/layout/difficulty,
not color.

Style guidance adopted from ui-ux-pro-max: "Event/Conference Landing" pattern
(hero with date/venue/countdown → speakers → agenda → sponsors → register CTA),
"Soft UI Evolution" surface treatment (soft shadows, 200–300ms transitions,
visible focus, WCAG AA+). Icons via Lucide, no emoji.

---

## 4. The 21 examples

Each example is a **manually editable** TypeScript config in `examples/`, read by
the generator. Registry: `examples/index.ts` exports an ordered array.

### Example config shape

```ts
export interface ExampleConfig {
  id: string            // 'captello-summit-2026'
  order: number         // 1..21 (switcher order)
  theme: 'tech' | 'health' | 'multi'
  eventName: string
  tagline: string
  venue: string
  city: string
  dates: { start: string; end: string }  // ISO
  seed: number          // deterministic generation
  difficulty: 'easy' | 'medium' | 'hard'
  layout: LayoutVariant // per-list-page DOM structure
  scale: { individuals: number; companies: number; sessions: number }
  coverage: {
    entities: Array<'individuals' | 'companies' | 'events'>
    emailsInline: boolean       // emails on list page vs. detail-only
    fieldFullness: 'full' | 'partial'
  }
}

export type LayoutVariant =
  | 'card-grid'          // responsive cards
  | 'dense-table'        // data table, many columns
  | 'paginated-list'     // ?page=N pagination
  | 'single-roster'      // one long page, all rows
  | 'tabbed-profiles'    // sectioned detail pages
  | 'infinite-scroll'    // progressive reveal (SSG renders all; client "loads more")
```

### The 4 variation axes (all selected by user)

| Axis | Values |
| --- | --- |
| Layout / DOM | `card-grid`, `dense-table`, `paginated-list`, `single-roster`, `tabbed-profiles`, `infinite-scroll` |
| Difficulty | `easy` (clean, complete) · `medium` (partial fields, mixed case) · `hard` (typos, dupes, unicode/emoji, "N/A", split/swapped names, obfuscated emails) |
| Scale | small ≈50 · medium ≈500 · large ≈1500+ |
| Coverage | companies-only · people-only · full · emails inline vs. detail-page |

### The 21 (draft distribution — adjustable during implementation)

**Tech / SaaS (7)**

1. `Captello Summit 2026` — hard · 1500 ind / 700 co · single-roster · full · emails detail-only
2. `CloudCon` — easy · 50 ind · card-grid · people-only · emails inline
3. `DevWorld` — medium · 500 ind / 200 co · dense-table · full · emails inline
4. `SaaStock North` — hard · 900 ind / 300 co · paginated-list · full · emails detail-only
5. `AI Frontier` — medium · 300 ind · tabbed-profiles · people-only · emails detail-only
6. `MarTech Expo` — easy · 400 co · card-grid · companies-only · n/a
7. `FinTech Connect` — hard · 1200 ind / 500 co · infinite-scroll · full · mixed

**Healthcare / MedTech (7)**

8. `MedTech Expo` — medium · 500 ind / 250 co · dense-table · full · emails inline
9. `HealthIT Summit` — easy · 120 ind · card-grid · people-only · emails inline
10. `PharmaWorld` — hard · 800 co · paginated-list · companies-only · n/a
11. `Digital Health Now` — medium · 350 ind / 150 co · tabbed-profiles · full · detail-only
12. `Clinical Innovation` — hard · 600 ind · single-roster · people-only · obfuscated
13. `BioConnect` — easy · 200 co · card-grid · companies-only · n/a
14. `NurseLeaders` — medium · 450 ind · dense-table · people-only · emails inline

**Multi-industry trade show (7)**

15. `Global Business Expo` — hard · 1200 co · paginated-list · companies-only · n/a
16. `Manufacturing Week` — medium · 400 ind / 200 co · card-grid · full · inline
17. `RetailNXT` — easy · 300 ind · single-roster · people-only · inline
18. `Energy Forum` — hard · 700 ind / 350 co · dense-table · full · detail-only
19. `Logistics Live` — medium · 500 co · card-grid · companies-only · n/a
20. `Founders Fair` — easy · 150 ind · tabbed-profiles · people-only · inline
21. `Enterprise Summit` — hard · 1000 ind / 400 co · infinite-scroll · full · mixed

Totals comfortably clear the ≥1000 individuals / ≥600 companies requirement, and
several examples individually exceed 1500 records.

---

## 5. Data model & the export contract

### Individual record (keys = extension `INDIVIDUAL_FIELDS`)

```
firstName, lastName, fullName, email, title, types,
linkedin, twitter, instagram, profileUrl, photoUrl, bio, interests,
company, companyWebsite, phone, city, country, region, industry, orgType,
additionalInfo
```

### Company record (keys = extension `COMPANY_FIELDS`)

```
name, website, phone, country, city, region, address, types, industry,
numEmployees, revenue, orgType, linkedin, facebook, twitter, instagram,
youtube, description, profileUrl, additionalInfo
```

`types` is a multi-label array (`attendees` | `speakers` | `exhibitors` |
`sponsors` | `others`; companies limited to `exhibitors` | `sponsors` | `others`)
mirroring the extension taxonomy. Events mirror EI `EventResponse`
(`name, eventUrl, startDate, endDate, location, eventType, eventOverview`).

`lib/schema.ts` re-declares `INDIVIDUAL_FIELDS` / `COMPANY_FIELDS` (key + label +
column order) copied from the extension so the export serializer is driven by the
same contract. A comment records the source file so drift is traceable.

### Ground truth vs. rendered

Each record stores its **clean intended value** as ground-truth. The `messify`
step corrupts only the *rendered* HTML (what the scanner sees), never the
ground-truth. So the diff measures how well the extension **normalized** messy
input back toward truth.

---

## 6. Difficulty engine (`lib/generate/messify.ts`)

`messify(record, difficulty)` returns a *display* variant; ground-truth stays
clean. Controlled corruptions by tier:

- **easy** — no corruption; complete fields.
- **medium** — drop ~20% of optional fields (render blank / omit), mixed case,
  inconsistent phone/URL formatting, some `"N/A"` / `"-"` placeholders.
- **hard** — all of medium plus: unicode & emoji in names, typos, near-duplicate
  records (same person twice with a variation), first/last name swapped,
  email obfuscation (`jane [at] acme dot com`), multi-value cells
  (`"CEO / Founder"`), whitespace noise, values split across sibling DOM nodes.

Every corruption is deterministic from the example seed so runs are reproducible.

---

## 7. Avatars & images — NO real faces (hard requirement)

`lib/generate/avatar.ts` produces a **deterministic SVG** from `name + seed`:

- Monogram (initials) on a generated gradient/geometric background, OR a simple
  geometric identicon. No photographs, no face-generation services, no external
  image hosts.
- Company logos: generated SVG wordmark/monogram tiles.
- `photoUrl` in the data points at these generated SVGs (served from `/public` or
  inlined data URIs). This guarantees no real human faces anywhere.

---

## 8. Site structure (per example)

App Router routes (all SSG):

```
/                      hero (name/dates/venue/countdown), stats, sponsor strip
/attendees             list (layout per example) — the volume driver
/attendees/[id]        detail (bio, interests, company; email/phone may live here)
/speakers              speaker cards
/speakers/[id]         speaker bio + sessions
/exhibitors            company list (layout per example)
/exhibitors/[id]       booth/company profile
/sponsors              tiered sponsor companies
/agenda                sessions/events (maps to EI Events)
```

Which routes render is governed by the example's `coverage.entities`. The active
example is selected via a cookie/URL param (see QA bar) and all routes read the
matching `data/<exampleId>/*.json`.

Layout components live in `components/layouts/` — one component per
`LayoutVariant`; the list pages pick the component from the example config.

---

## 9. QA bar (toggleable, on by default)

`components/qa/QaBar.tsx` — a slim top bar, shown by default:

- **Example switcher** — dropdown of all 21 (grouped by theme), shows
  id/difficulty/scale/layout badges. Switching sets the active-example
  cookie/param and navigates.
- **Export** — buttons for **CSV**, **XLSX**, **JSON** of the current example's
  ground-truth, in the extension's field order/labels. Also an option to export
  the *rendered/messy* values, so QA can inspect what the scanner actually saw.
- **Info** — current example's difficulty, scale, layout, coverage, seed.

Hidden via `?qa=0` (URL param) or a keyboard shortcut (e.g. `Shift+Q`), so pure
demo screenshots have no QA chrome. Gated behind a small `IS_QA` flag pattern
mirroring the extension's `IS_DEV`.

---

## 10. Module layout

```
captello-summit-demo/
  app/                      Next.js routes (SSG)
    layout.tsx              root layout, theme, QA bar mount
    page.tsx                hero/home
    attendees/…  speakers/…  exhibitors/…  sponsors/…  agenda/…
  components/
    layouts/                one per LayoutVariant
    qa/QaBar.tsx
    site/                   hero, cards, tables, nav, footer
    ui/                     shadcn primitives
  lib/
    theme/tokens.css        ported extension theme (single source)
    schema.ts               INDIVIDUAL_FIELDS / COMPANY_FIELDS contract
    generate/
      companies.ts  individuals.ts  events.ts
      messify.ts    avatar.ts    seed.ts
    export/
      csv.ts  xlsx.ts  json.ts   (extension field order)
    examples-runtime.ts     active-example resolution (cookie/param)
  examples/
    index.ts                registry (ordered 21)
    *.ts                     one config per example (editable)
  data/
    <exampleId>/individuals.json  companies.json  events.json  (committed)
  scripts/
    generate.ts             regenerates all data/ from examples/
  public/                   generated avatar SVGs (or inlined)
  package.json  tsconfig.json  next.config.ts  vercel.json (if needed)
```

`npm run generate` → regenerates every example's fixtures deterministically.
`npm run build` → `next build` (SSG). `npm run dev` → local preview.

---

## 11. Testing / verification

- `tsc --noEmit` clean.
- `npm run generate && npm run build` succeeds; a spot check confirms
  ≥1000 individuals and ≥600 companies across examples and ≥1 example >1500.
- Export a hard example → open the CSV/XLSX → confirm headers/order match the
  extension's export (`INDIVIDUAL_FIELDS`/`COMPANY_FIELDS`).
- Visual pass at 375 / 768 / 1024 / 1440 px; dark mode; reduced-motion.
- Grep the repo/output for any external image host or face reference — must be
  none; all avatars are generated SVG.

---

## 12. Open items deferred to implementation

- Exact per-example numbers may be tuned so totals stay balanced.
- Whether avatars are files in `/public` vs. inline data URIs (perf call at build).
- Whether the active example is stored in a cookie (SSR-friendly) or purely in
  the URL param (simpler, shareable) — lean URL param, cookie fallback.
- XLSX export runs **client-side** (QA-bar download in the browser), so the
  serializer must be a browser-capable lib. `exceljs` works in-browser but is
  heavy; the plan will confirm `exceljs` vs. a lighter option (e.g. `xlsx`/
  SheetJS, already used in next-gen) before committing. CSV/JSON are trivial and
  hand-rolled.
