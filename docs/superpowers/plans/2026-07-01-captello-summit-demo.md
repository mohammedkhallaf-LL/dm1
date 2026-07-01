# Captello Summit Demo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the `dm1` repo into "Captello Summit" — a Next.js 16 event-conference website that the Captello Envoy extension scans live, backed by ground-truth data whose field shape matches the extension's export contract, with 21 QA-selectable example sites and a byte-compatible data export.

**Architecture:** Static-first Next.js 16 App Router site. A seeded generator (`@faker-js/faker`) reads 21 editable example configs and emits committed JSON fixtures (ground-truth + a rendered/messy view). Pages render list views (pre-rendered) and detail views (on-demand, Vercel-native — no `output:'export'`). A toggleable "QA bar" switches examples and exports the current example's ground-truth as CSV/XLSX/JSON matching `captello-envoy/src/sidepanel/lib/export.ts` exactly.

**Tech Stack:** Next.js ≥16.2.7 (App Router), React 19, TypeScript 5, Tailwind CSS v4 (`@tailwindcss/postcss`), `@faker-js/faker` v10, `exceljs@4.4.0` (browser XLSX, matches extension), `lucide-react` (icons), `@fontsource-variable/inter` (self-hosted Inter), `tsx` (run generator). Deploy: Vercel.

## Global Constraints

- **Repo reuse:** work in `/home/workl/leadliaison/dm1/`; keep `.git`, remote `github.com/mohammedkhallaf-LL/dm1`, branch `main`, and dm1's `AGENTS.md`. Wipe old source, rebuild, commits stack on `main`. Package name → `captello-summit-demo`.
- **Next.js 16 rule:** `params`/`searchParams` are `Promise<...>` — always `await` (or `use()` in client components). Never read `searchParams` on a page that must stay statically rendered. Do NOT set `output:'export'`.
- **Read Next docs first:** per `AGENTS.md`, consult `node_modules/next/dist/docs/` before writing Next-specific code; training data is stale for v16.
- **Export contract is law:** field keys, labels, order, and serialization must match `captello-envoy/src/sidepanel/lib/export.ts` + `schema.ts` verbatim (22 individual fields, 20 company fields — reproduced in Task 3).
- **NO real human faces, ever:** all avatars/logos are deterministically generated SVG (monogram/identicon). No photo services, no external image hosts, no face references anywhere.
- **Ground-truth vs rendered:** `messify` corrupts only the *rendered* value; the exported ground-truth is always the clean intended value.
- **Determinism:** every example generates from its own `seed`; regeneration is reproducible. Fixtures are committed (adjust `.gitignore`).
- **Theme:** Captello red `#ff0000`, Inter, shadcn tokens — ported from `captello-envoy/src/shared/styles.css`. No per-theme accent colors.
- **Scale reality:** pre-render list pages; render individual detail/profile routes on demand (default dynamic). Do not `generateStaticParams` hundreds of thousands of profile pages.
- **Commit discipline:** each task ends by committing. Do NOT push until the user asks. Conventional Commits (`type(scope): desc`).
- **Verify before done:** `npx tsc --noEmit` clean and `npm run build` succeeds are required at the milestones noted.
- **Test imports use explicit `.ts` extensions** (test files run via `tsx`). `tsconfig.json` sets `allowImportingTsExtensions: true` (added in Task 3; safe under `moduleResolution: bundler` + `noEmit`), so `tsc --noEmit` accepts `.ts`-suffixed imports — this is intentional, not a defect.

---

## File Structure

```
dm1/
  AGENTS.md                         KEEP (extend with project rules)
  package.json                      rewritten: name, scripts, deps
  next.config.ts                    KEEP minimal (no output:export)
  postcss.config.mjs                KEEP (@tailwindcss/postcss)
  tsconfig.json                     KEEP (paths @/* -> src/*)
  .gitignore                        MODIFY: commit example fixtures
  src/
    app/
      layout.tsx                    root layout: theme, fonts, QaBar mount
      globals.css                   Tailwind import + ported theme tokens
      page.tsx                      home = active example hero
      attendees/page.tsx            + page/[n]/page.tsx  + [id]/page.tsx
      speakers/page.tsx             + [id]/page.tsx
      exhibitors/page.tsx           + page/[n]/page.tsx  + [id]/page.tsx
      sponsors/page.tsx
      agenda/page.tsx
    components/
      qa/QaBar.tsx                  client: example switcher + export + toggle
      qa/ExampleSwitcher.tsx        client dropdown
      layouts/CardGrid.tsx  DenseTable.tsx  PaginatedList.tsx
      layouts/SingleRoster.tsx  TabbedProfiles.tsx  InfiniteScroll.tsx
      site/Hero.tsx  SiteNav.tsx  Footer.tsx  PersonCard.tsx  CompanyCard.tsx
      site/Avatar.tsx  StatBadge.tsx
    lib/
      schema.ts                     INDIVIDUAL_FIELDS / COMPANY_FIELDS (contract)
      types.ts                      IndividualRecord / CompanyRecord / EventRecord
      active-example.ts             resolve active example (param/cookie)
      data.ts                       read committed fixtures, pagination helpers
      export/
        cell.ts  csv.ts  xlsx.ts  json.ts   (mirror extension export.ts)
      generate/
        seed.ts  avatar.ts  companies.ts  individuals.ts  events.ts  messify.ts
    examples/
      index.ts                      registry (ordered 21) + ExampleConfig type
      tech/*.ts  health/*.ts  multi/*.ts   (21 editable configs)
    data/
      <exampleId>/individuals.json companies.json events.json meta.json
  scripts/
    generate-data.ts                regenerates all fixtures from examples/
  public/
    (generated avatar SVGs if file-based; else inline data URIs)
```

---

## Task 0: Reset the repo to a clean Captello Summit skeleton

**Files:**
- Delete: `src/` (all), `scripts/generate-data.ts`, `README.md`
- Modify: `package.json`, `.gitignore`, `AGENTS.md`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `README.md`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: a buildable empty Next 16 app named `captello-summit-demo` with Tailwind v4 wired and the extension theme importable.

- [ ] **Step 1: Confirm clean tree & branch**

Run:
```bash
cd /home/workl/leadliaison/dm1
git status --porcelain        # note the untracked package-lock.json is fine
git branch --show-current     # expect: main
git rev-parse HEAD            # RECORD this sha (recovery point)
```
Expected: on `main`; record the current HEAD sha in the commit body later.

- [ ] **Step 2: Remove old source**

Run:
```bash
cd /home/workl/leadliaison/dm1
git rm -r --quiet src scripts README.md
rm -f package-lock.json          # regenerate from the new package.json
```
Expected: `src/`, `scripts/`, `README.md` staged for deletion.

- [ ] **Step 3: Rewrite `package.json`**

Create `package.json`:
```json
{
  "name": "captello-summit-demo",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "npm run generate && next build",
    "start": "next start",
    "generate": "tsx scripts/generate-data.ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@fontsource-variable/inter": "^5",
    "exceljs": "4.4.0",
    "lucide-react": "^0.400.0",
    "next": "^16.2.7",
    "react": "^19",
    "react-dom": "^19"
  },
  "devDependencies": {
    "@faker-js/faker": "^10",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tailwindcss": "^4",
    "tsx": "^4",
    "typescript": "^5"
  }
}
```
Note: install resolves `next`/`react` to the latest matching (≥16.2.7 / 19.x) — that is intentional per the tech scan. `exceljs` pinned to `4.4.0` to match the extension.

- [ ] **Step 4: Install & verify versions**

Run:
```bash
cd /home/workl/leadliaison/dm1 && npm install
node -p "require('next/package.json').version + ' / react ' + require('react/package.json').version + ' / exceljs ' + require('exceljs/package.json').version"
```
Expected: next ≥ 16.2.7, react 19.x, exceljs 4.4.0. If a peer warning appears for exceljs, it is fine (browser use).

- [ ] **Step 5: `.gitignore` — commit example fixtures**

Replace the "generated event data" block at the bottom of `.gitignore` with:
```gitignore
# generated example fixtures — COMMITTED for reproducible demos & QA diffing
# (regenerate with `npm run generate`)
!src/data/
```
Remove the three old lines (`src/data/events/*.json`, the `!index.json`, `src/data/stats.json`). Keep everything else (`/node_modules`, `/.next/`, `/out/`, `.env*`, `.vercel`, `next-env.d.ts`, `*.tsbuildinfo`).

- [ ] **Step 6: Extend `AGENTS.md`**

Append below the existing `<!-- END:nextjs-agent-rules -->` block:
```md

# Captello Summit demo — project rules

- This is the Envoy **scan-target** demo. Data field shape MUST match the extension's
  export contract (`captello-envoy/src/sidepanel/lib/export.ts` + `schema.ts`).
- NEVER use real human faces. All avatars/logos are generated SVG (see `src/lib/generate/avatar.ts`).
- `messify` corrupts only the RENDERED value; exported ground-truth stays clean.
- Regenerate fixtures with `npm run generate` (deterministic per example seed).
```

- [ ] **Step 7: Minimal `globals.css` (Tailwind only for now; full theme in Task 1)**

Create `src/app/globals.css`:
```css
@import "tailwindcss";
```

- [ ] **Step 8: Root layout**

Create `src/app/layout.tsx`:
```tsx
import type { Metadata } from 'next'
import '@fontsource-variable/inter'
import './globals.css'

export const metadata: Metadata = {
  title: 'Captello Summit',
  description: 'Event intelligence demo site',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 9: Placeholder home page**

Create `src/app/page.tsx`:
```tsx
export default function Home() {
  return <main className="p-8 text-2xl font-bold">Captello Summit — building…</main>
}
```

- [ ] **Step 10: New README**

Create `README.md`:
```md
# Captello Summit — Envoy Scan-Target Demo

A Next.js site that the Captello Envoy extension scans during demos. 21 selectable
example event sites (Tech / Healthcare / Multi-industry), each with committed,
deterministic ground-truth data matching the extension's export schema.

## Commands
- `npm run generate` — regenerate committed fixtures from `src/examples/`
- `npm run dev` — local dev at http://localhost:3000
- `npm run build` — generate + `next build`
- `npm run typecheck` — `tsc --noEmit`

See `docs/superpowers/specs/2026-07-01-captello-summit-demo-design.md`.
```

- [ ] **Step 11: Verify it builds**

Run:
```bash
cd /home/workl/leadliaison/dm1 && npx tsc --noEmit && npx next build
```
Expected: type-check clean; build succeeds (one static `/` route). If `next build` complains about no `next-env.d.ts`, run `npx next build` again (it generates it).

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "chore: reset dm1 to Captello Summit skeleton (Next 16 + Tailwind v4)"
```

---

## Task 1: Port the extension theme

**Files:**
- Modify: `src/app/globals.css`
- Test: `src/app/page.tsx` (temporary swatch, reverted at end of task)

**Interfaces:**
- Consumes: nothing.
- Produces: theme tokens usable as Tailwind classes: `bg-brand` `text-brand` `bg-brand-hover` `bg-background` `text-foreground` `text-muted-foreground` `border-border` `bg-card` `text-destructive`, plus `--radius`, `font-sans` = Inter. Dark mode via `.dark` class on `<html>`.

- [ ] **Step 1: Copy the theme block**

Open `captello-envoy/src/shared/styles.css` for reference. Replace `src/app/globals.css` with:
```css
@import 'tailwindcss';
@import '@fontsource-variable/inter';

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-brand: #ff0000;
  --color-brand-hover: #cc0000;
  --color-brand-light: #fff0f0;
  --color-disabled-bg: #e6e6e6;
  --color-disabled-fg: #cccccc;
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-bg-tertiary: #f3f4f6;
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-text-tertiary: #9ca3af;
  --color-border: #e4e0de;
  --font-sans: 'Inter Variable', 'Inter', 'Roboto', sans-serif;
  --font-heading: var(--font-sans);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --color-foreground: var(--foreground);
  --color-background: var(--background);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
}

:root {
  --brand: #ff0000;
  --brand-hover: #cc0000;
  --brand-light: #fff0f0;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.5 0.3 29);
  --primary-foreground: oklch(1 0 0);
  --ring: oklch(0.5 0.3 29);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --input: oklch(0.922 0 0);
  --radius: 0.625rem;
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
}

@layer base {
  * { @apply border-border; box-sizing: border-box; }
  body {
    @apply bg-background text-foreground;
    font-family: var(--font-sans);
    font-size: 14px;
    line-height: 1.5;
  }
}
```

- [ ] **Step 2: Temporary swatch to verify tokens compile**

Replace `src/app/page.tsx` body with:
```tsx
export default function Home() {
  return (
    <main className="min-h-dvh bg-background p-8">
      <div className="rounded-lg border border-border bg-card p-6">
        <h1 className="text-2xl font-bold text-foreground">Captello Summit</h1>
        <p className="text-muted-foreground">Theme check</p>
        <button className="mt-4 rounded-md bg-brand px-4 py-2 text-white hover:bg-brand-hover">
          Brand button
        </button>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Run dev, verify visually**

Run:
```bash
cd /home/workl/leadliaison/dm1 && npx next build
```
Expected: build succeeds, no CSS/Tailwind errors. (Optional: `npm run dev` and confirm red brand button + Inter font at http://localhost:3000.)

- [ ] **Step 4: Revert the temporary swatch**

Restore `src/app/page.tsx` to the Task 0 placeholder (`Captello Summit — building…`). The real home page comes in Task 8.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(theme): port Captello extension theme tokens (red + Inter, light/dark)"
```

---

## Task 2: Core record types

**Files:**
- Create: `src/lib/types.ts`
- Test: `src/lib/types.test-d.ts` (type-only assertion file, compiled by tsc)

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type ScanType = 'attendees'|'speakers'|'exhibitors'|'sponsors'|'others'`
  - `type CompanyScanType = 'exhibitors'|'sponsors'|'others'`
  - `interface IndividualRecord` with the 22 export keys (see Task 3) + generation-only fields
  - `interface CompanyRecord` with the 20 export keys + generation-only fields
  - `interface EventRecord` (name, eventUrl, startDate, endDate, location, eventType, eventOverview)
  - `type AdditionalInfo = Record<string, unknown>`

- [ ] **Step 1: Write the type file**

Create `src/lib/types.ts`:
```ts
/** Multi-label participant taxonomy — mirrors captello-envoy schema.ts. */
export type ScanType = 'attendees' | 'speakers' | 'exhibitors' | 'sponsors' | 'others'
export type CompanyScanType = Extract<ScanType, 'exhibitors' | 'sponsors' | 'others'>

export type AdditionalInfo = Record<string, unknown>

/**
 * A person record. The keys through `additionalInfo` are the EXACT export
 * contract (INDIVIDUAL_FIELDS). `id`/`eventId` are generation-only (never exported).
 */
export interface IndividualRecord {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string | null
  title: string | null
  types: ScanType[]
  linkedin: string | null
  twitter: string | null
  instagram: string | null
  profileUrl: string | null
  photoUrl: string | null
  bio: string | null
  interests: string | null
  company: string | null
  companyWebsite: string | null
  phone: string | null
  city: string | null
  country: string | null
  region: string | null
  industry: string | null
  orgType: string | null
  additionalInfo: AdditionalInfo
}

/** A company record. Keys through `additionalInfo` are the export contract (COMPANY_FIELDS). */
export interface CompanyRecord {
  id: string
  name: string
  website: string | null
  phone: string | null
  country: string | null
  city: string | null
  region: string | null
  address: string | null
  types: CompanyScanType[]
  industry: string | null
  numEmployees: number | null
  revenue: number | null
  orgType: string | null
  linkedin: string | null
  facebook: string | null
  twitter: string | null
  instagram: string | null
  youtube: string | null
  description: string | null
  profileUrl: string | null
  additionalInfo: AdditionalInfo
}

/** Event/session — mirrors EI EventResponse. */
export interface EventRecord {
  id: string
  name: string
  eventUrl: string
  startDate: number   // epoch ms
  endDate: number
  location: string
  eventType: string
  eventOverview: string
}
```

- [ ] **Step 2: Write a type-level assertion**

Create `src/lib/types.test-d.ts`:
```ts
import type { IndividualRecord, CompanyRecord } from './types'

// These must compile. `types` is multi-label; nullable fields accept null.
const ind: IndividualRecord = {
  id: '1', firstName: 'A', lastName: 'B', fullName: 'A B', email: null,
  title: null, types: ['attendees', 'speakers'], linkedin: null, twitter: null,
  instagram: null, profileUrl: null, photoUrl: null, bio: null, interests: null,
  company: null, companyWebsite: null, phone: null, city: null, country: null,
  region: null, industry: null, orgType: null, additionalInfo: {},
}
const co: CompanyRecord = {
  id: '2', name: 'Acme', website: null, phone: null, country: null, city: null,
  region: null, address: null, types: ['exhibitors'], industry: null,
  numEmployees: null, revenue: null, orgType: null, linkedin: null, facebook: null,
  twitter: null, instagram: null, youtube: null, description: null,
  profileUrl: null, additionalInfo: {},
}
void ind; void co
```

- [ ] **Step 3: Run type-check to verify it passes**

Run:
```bash
cd /home/workl/leadliaison/dm1 && npx tsc --noEmit
```
Expected: PASS (no errors). If `types: ['attendees']` errors on `CompanyRecord`, you mistyped `CompanyScanType` — companies must reject `'attendees'`/`'speakers'`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(types): add IndividualRecord/CompanyRecord/EventRecord (export contract)"
```

---

## Task 3: Export field contract (schema.ts) — mirrors the extension

**Files:**
- Create: `src/lib/schema.ts`
- Test: `src/lib/schema.test.ts` (run with `tsx`)

**Interfaces:**
- Consumes: `./types`.
- Produces:
  - `interface FieldDef { key: string; label: string }`
  - `const INDIVIDUAL_FIELDS: FieldDef[]` — 22 entries, exact keys/labels/order below
  - `const COMPANY_FIELDS: FieldDef[]` — 20 entries, exact keys/labels/order below

- [ ] **Step 1: Write the schema**

Create `src/lib/schema.ts` (keys/labels/order copied verbatim from `captello-envoy/src/sidepanel/store/schema.ts`):
```ts
export interface FieldDef {
  key: string
  label: string
}

/** Individuals — order & labels MUST match the extension's INDIVIDUAL_FIELDS. */
export const INDIVIDUAL_FIELDS: FieldDef[] = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'fullName', label: 'Full Name' },
  { key: 'email', label: 'Email' },
  { key: 'title', label: 'Job Title' },
  { key: 'types', label: 'Type(s)' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'twitter', label: 'Twitter' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'profileUrl', label: 'Profile URL' },
  { key: 'photoUrl', label: 'Photo URL' },
  { key: 'bio', label: 'Bio' },
  { key: 'interests', label: 'Interests' },
  { key: 'company', label: 'Company' },
  { key: 'companyWebsite', label: 'Company Website' },
  { key: 'phone', label: 'Company Phone' },
  { key: 'city', label: 'City' },
  { key: 'country', label: 'Country' },
  { key: 'region', label: 'Region' },
  { key: 'industry', label: 'Industry' },
  { key: 'orgType', label: 'Org Type' },
  { key: 'additionalInfo', label: 'Additional Info' },
]

/** Companies — order & labels MUST match the extension's COMPANY_FIELDS. */
export const COMPANY_FIELDS: FieldDef[] = [
  { key: 'name', label: 'Name' },
  { key: 'website', label: 'Website' },
  { key: 'phone', label: 'Phone' },
  { key: 'country', label: 'Country' },
  { key: 'city', label: 'City' },
  { key: 'region', label: 'Region' },
  { key: 'address', label: 'Address' },
  { key: 'types', label: 'Type(s)' },
  { key: 'industry', label: 'Industry' },
  { key: 'numEmployees', label: 'Num of Employees' },
  { key: 'revenue', label: 'Revenue ($)' },
  { key: 'orgType', label: 'Org Type' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'twitter', label: 'Twitter' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'description', label: 'About (summary)' },
  { key: 'profileUrl', label: 'Company Profile URL' },
  { key: 'additionalInfo', label: 'Additional Info' },
]
```

- [ ] **Step 2: Write the test**

Create `src/lib/schema.test.ts`:
```ts
import assert from 'node:assert'
import { INDIVIDUAL_FIELDS, COMPANY_FIELDS } from './schema.ts'

assert.equal(INDIVIDUAL_FIELDS.length, 22, 'individual field count')
assert.equal(COMPANY_FIELDS.length, 20, 'company field count')
assert.equal(INDIVIDUAL_FIELDS[0].label, 'First Name')
assert.equal(INDIVIDUAL_FIELDS[15].label, 'Company Phone') // extension quirk: phone => "Company Phone"
assert.equal(COMPANY_FIELDS[10].label, 'Revenue ($)')
assert.equal(COMPANY_FIELDS[17].label, 'About (summary)')
// last field is always additionalInfo
assert.equal(INDIVIDUAL_FIELDS.at(-1)!.key, 'additionalInfo')
assert.equal(COMPANY_FIELDS.at(-1)!.key, 'additionalInfo')
console.log('schema OK')
```

- [ ] **Step 3: Run test to verify it passes**

Run:
```bash
cd /home/workl/leadliaison/dm1 && npx tsx src/lib/schema.test.ts
```
Expected: prints `schema OK`, exit 0.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(schema): mirror extension export field contract (22 individual, 20 company)"
```

---

## Task 4: Deterministic SVG avatar generator (NO real faces)

**Files:**
- Create: `src/lib/generate/avatar.ts`
- Test: `src/lib/generate/avatar.test.ts`

**Interfaces:**
- Consumes: nothing (pure, no faker — uses a small internal hash for determinism).
- Produces:
  - `function personAvatarSvg(name: string): string` — returns an inline SVG string (monogram on a deterministic gradient).
  - `function companyLogoSvg(name: string): string` — SVG monogram tile.
  - `function svgToDataUri(svg: string): string` — `data:image/svg+xml;utf8,<encoded>`.

- [ ] **Step 1: Write the test**

Create `src/lib/generate/avatar.test.ts`:
```ts
import assert from 'node:assert'
import { personAvatarSvg, companyLogoSvg, svgToDataUri } from './avatar.ts'

const a = personAvatarSvg('Jane Doe')
const b = personAvatarSvg('Jane Doe')
assert.equal(a, b, 'deterministic for same name')
assert.ok(a.startsWith('<svg'), 'is svg')
assert.ok(a.includes('JD'), 'monogram = initials')
assert.ok(!/photo|face|image\.|\.jpg|\.png|http/i.test(a), 'no real image refs')

const c = companyLogoSvg('Acme Cloud')
assert.ok(c.includes('AC'), 'company monogram')

const uri = svgToDataUri(a)
assert.ok(uri.startsWith('data:image/svg+xml'), 'data uri')
console.log('avatar OK')
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
cd /home/workl/leadliaison/dm1 && npx tsx src/lib/generate/avatar.test.ts
```
Expected: FAIL — `Cannot find module './avatar.ts'`.

- [ ] **Step 3: Implement**

Create `src/lib/generate/avatar.ts`:
```ts
/** Tiny deterministic string hash (FNV-1a) → non-negative int. */
function hash(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function hslPair(seed: number): [string, string] {
  const hue = seed % 360
  return [`hsl(${hue} 65% 45%)`, `hsl(${(hue + 40) % 360} 65% 35%)`]
}

/** Monogram avatar on a deterministic gradient. Pure SVG — never a real face. */
export function personAvatarSvg(name: string): string {
  const seed = hash(name)
  const [c1, c2] = hslPair(seed)
  const id = `g${seed}`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" role="img" aria-label="${initials(name)} avatar"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="96" height="96" rx="48" fill="url(#${id})"/><text x="48" y="60" font-family="Inter, sans-serif" font-size="38" font-weight="600" fill="#fff" text-anchor="middle">${initials(name)}</text></svg>`
}

/** Company logo tile (rounded square, monogram). Pure SVG. */
export function companyLogoSvg(name: string): string {
  const seed = hash(name)
  const [c1, c2] = hslPair(seed + 7)
  const id = `l${seed}`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" role="img" aria-label="${initials(name)} logo"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="96" height="96" rx="18" fill="url(#${id})"/><text x="48" y="60" font-family="Inter, sans-serif" font-size="34" font-weight="700" fill="#fff" text-anchor="middle">${initials(name)}</text></svg>`
}

export function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
cd /home/workl/leadliaison/dm1 && npx tsx src/lib/generate/avatar.test.ts
```
Expected: prints `avatar OK`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(generate): deterministic SVG monogram avatars (no real faces)"
```

---

## Task 5: Example config registry (21 examples)

**Files:**
- Create: `src/examples/index.ts`, `src/examples/tech/*.ts` (7), `src/examples/health/*.ts` (7), `src/examples/multi/*.ts` (7)
- Test: `src/examples/index.test.ts`

**Interfaces:**
- Consumes: `../lib/types` (for `ScanType` reuse if needed).
- Produces:
  - `type ThemeKey = 'tech' | 'health' | 'multi'`
  - `type Difficulty = 'easy' | 'medium' | 'hard'`
  - `type LayoutVariant = 'card-grid' | 'dense-table' | 'paginated-list' | 'single-roster' | 'tabbed-profiles' | 'infinite-scroll'`
  - `interface ExampleConfig { id; order; theme; eventName; tagline; venue; city; country; dates:{start;end}; seed; difficulty; layout; scale:{individuals;companies;sessions}; coverage:{ entities:('individuals'|'companies'|'events')[]; emailsInline:boolean; fieldFullness:'full'|'partial' }; industryPool:string[]; titlePool:string[]; sessionTopics:string[] }`
  - `const EXAMPLES: ExampleConfig[]` — 21, sorted by `order`
  - `function getExample(id: string): ExampleConfig | undefined`

- [ ] **Step 1: Define the config type + registry**

Create `src/examples/index.ts`:
```ts
export type ThemeKey = 'tech' | 'health' | 'multi'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type LayoutVariant =
  | 'card-grid' | 'dense-table' | 'paginated-list'
  | 'single-roster' | 'tabbed-profiles' | 'infinite-scroll'

export interface ExampleConfig {
  id: string
  order: number
  theme: ThemeKey
  eventName: string
  tagline: string
  venue: string
  city: string
  country: string
  dates: { start: string; end: string } // ISO date (YYYY-MM-DD)
  seed: number
  difficulty: Difficulty
  layout: LayoutVariant
  scale: { individuals: number; companies: number; sessions: number }
  coverage: {
    entities: Array<'individuals' | 'companies' | 'events'>
    emailsInline: boolean
    fieldFullness: 'full' | 'partial'
  }
  industryPool: string[]
  titlePool: string[]
  sessionTopics: string[]
}

import { techExamples } from './tech/index.ts'
import { healthExamples } from './health/index.ts'
import { multiExamples } from './multi/index.ts'

export const EXAMPLES: ExampleConfig[] = [
  ...techExamples,
  ...healthExamples,
  ...multiExamples,
].sort((a, b) => a.order - b.order)

export function getExample(id: string): ExampleConfig | undefined {
  return EXAMPLES.find((e) => e.id === id)
}

export const DEFAULT_EXAMPLE_ID = EXAMPLES[0].id
```

- [ ] **Step 2: Create the three theme barrels + shared pools**

Create `src/examples/pools.ts`:
```ts
export const TECH_INDUSTRIES = ['Software/SaaS', 'Cloud Infrastructure', 'Cybersecurity', 'MarTech', 'FinTech', 'AI/ML', 'DevTools', 'Data & Analytics']
export const TECH_TITLES = ['CEO', 'CTO', 'VP Engineering', 'VP Sales', 'Head of Growth', 'Product Manager', 'Solutions Engineer', 'Developer Advocate', 'Founder', 'Head of Marketing']
export const TECH_TOPICS = ['Scaling GTM in 2026', 'The AI-Native Stack', 'DevEx at Scale', 'PLG vs Sales-Led', 'Zero-Trust Architecture', 'RAG in Production', 'Observability 101']

export const HEALTH_INDUSTRIES = ['Medical Devices', 'Pharmaceuticals', 'Health IT', 'Biotech', 'Digital Health', 'Diagnostics', 'Hospital Systems']
export const HEALTH_TITLES = ['Chief Medical Officer', 'Director of Nursing', 'Clinical Research Lead', 'Hospital Administrator', 'VP Regulatory', 'Biomedical Engineer', 'Physician', 'Head of R&D']
export const HEALTH_TOPICS = ['AI in Diagnostics', 'Value-Based Care', 'FDA Pathways', 'Interoperability & FHIR', 'Remote Patient Monitoring', 'Clinical Trial Design']

export const MULTI_INDUSTRIES = ['Manufacturing', 'Finance', 'Retail', 'Energy', 'Logistics', 'Real Estate', 'Education', 'Media', 'Automotive']
export const MULTI_TITLES = ['CEO', 'COO', 'VP Operations', 'Plant Manager', 'CFO', 'Head of Procurement', 'Regional Director', 'Sales Director']
export const MULTI_TOPICS = ['Supply Chain Resilience', 'The Future of Work', 'ESG Reporting', 'Automation ROI', 'Omnichannel Retail', 'Energy Transition']
```

Create `src/examples/tech/index.ts` (7 configs; scale/difficulty/layout per the design spec §4 distribution):
```ts
import type { ExampleConfig } from '../index.ts'
import { TECH_INDUSTRIES, TECH_TITLES, TECH_TOPICS } from '../pools.ts'

const base = {
  theme: 'tech' as const,
  industryPool: TECH_INDUSTRIES,
  titlePool: TECH_TITLES,
  sessionTopics: TECH_TOPICS,
}

export const techExamples: ExampleConfig[] = [
  { ...base, id: 'captello-summit-2026', order: 1, eventName: 'Captello Summit 2026', tagline: 'Where revenue teams meet the AI-native stack', venue: 'Moscone West', city: 'San Francisco', country: 'United States', dates: { start: '2026-09-14', end: '2026-09-16' }, seed: 101, difficulty: 'hard', layout: 'single-roster', scale: { individuals: 1500, companies: 700, sessions: 60 }, coverage: { entities: ['individuals', 'companies', 'events'], emailsInline: false, fieldFullness: 'full' } },
  { ...base, id: 'cloudcon-2026', order: 2, eventName: 'CloudCon 2026', tagline: 'Infrastructure for builders', venue: 'Austin Convention Center', city: 'Austin', country: 'United States', dates: { start: '2026-05-04', end: '2026-05-05' }, seed: 102, difficulty: 'easy', layout: 'card-grid', scale: { individuals: 50, companies: 0, sessions: 8 }, coverage: { entities: ['individuals'], emailsInline: true, fieldFullness: 'full' } },
  { ...base, id: 'devworld-2026', order: 3, eventName: 'DevWorld 2026', tagline: 'The developer experience conference', venue: 'RAI Amsterdam', city: 'Amsterdam', country: 'Netherlands', dates: { start: '2026-06-10', end: '2026-06-12' }, seed: 103, difficulty: 'medium', layout: 'dense-table', scale: { individuals: 500, companies: 200, sessions: 40 }, coverage: { entities: ['individuals', 'companies', 'events'], emailsInline: true, fieldFullness: 'full' } },
  { ...base, id: 'saastock-north-2026', order: 4, eventName: 'SaaStock North 2026', tagline: 'Scale your SaaS', venue: 'ExCeL London', city: 'London', country: 'United Kingdom', dates: { start: '2026-10-20', end: '2026-10-22' }, seed: 104, difficulty: 'hard', layout: 'paginated-list', scale: { individuals: 900, companies: 300, sessions: 45 }, coverage: { entities: ['individuals', 'companies', 'events'], emailsInline: false, fieldFullness: 'partial' } },
  { ...base, id: 'ai-frontier-2026', order: 5, eventName: 'AI Frontier 2026', tagline: 'Applied machine learning in production', venue: 'Javits Center', city: 'New York', country: 'United States', dates: { start: '2026-11-02', end: '2026-11-03' }, seed: 105, difficulty: 'medium', layout: 'tabbed-profiles', scale: { individuals: 300, companies: 0, sessions: 30 }, coverage: { entities: ['individuals', 'events'], emailsInline: false, fieldFullness: 'full' } },
  { ...base, id: 'martech-expo-2026', order: 6, eventName: 'MarTech Expo 2026', tagline: 'The marketing technology showcase', venue: 'McCormick Place', city: 'Chicago', country: 'United States', dates: { start: '2026-04-15', end: '2026-04-16' }, seed: 106, difficulty: 'easy', layout: 'card-grid', scale: { individuals: 0, companies: 400, sessions: 0 }, coverage: { entities: ['companies'], emailsInline: false, fieldFullness: 'full' } },
  { ...base, id: 'fintech-connect-2026', order: 7, eventName: 'FinTech Connect 2026', tagline: 'The future of financial software', venue: 'Marina Bay Sands', city: 'Singapore', country: 'Singapore', dates: { start: '2026-12-01', end: '2026-12-03' }, seed: 107, difficulty: 'hard', layout: 'infinite-scroll', scale: { individuals: 1200, companies: 500, sessions: 50 }, coverage: { entities: ['individuals', 'companies', 'events'], emailsInline: true, fieldFullness: 'partial' } },
]
```

Create `src/examples/health/index.ts` (7) and `src/examples/multi/index.ts` (7) analogously, using the design spec §4 rows 8–14 (health) and 15–21 (multi). Each imports its theme pools from `../pools.ts`, sets `theme: 'health'`/`'multi'`, and uses `order` 8–14 / 15–21 and unique `seed`s (201–207 / 301–307). Copy the exact eventName/venue/city/difficulty/layout/scale/coverage values from the design spec's numbered list.

> Implementer note: the design spec §4 gives the full 21-row table. Transcribe rows 8–21 into the two files following the tech file's shape. Do not invent different values.

- [ ] **Step 3: Write the registry test**

Create `src/examples/index.test.ts`:
```ts
import assert from 'node:assert'
import { EXAMPLES, getExample, DEFAULT_EXAMPLE_ID } from './index.ts'

assert.equal(EXAMPLES.length, 21, 'exactly 21 examples')
assert.deepEqual(EXAMPLES.map((e) => e.order), Array.from({ length: 21 }, (_, i) => i + 1), 'orders 1..21 contiguous')
assert.equal(new Set(EXAMPLES.map((e) => e.id)).size, 21, 'ids unique')
assert.equal(new Set(EXAMPLES.map((e) => e.seed)).size, 21, 'seeds unique')
assert.equal(EXAMPLES.filter((e) => e.theme === 'tech').length, 7, '7 tech')
assert.equal(EXAMPLES.filter((e) => e.theme === 'health').length, 7, '7 health')
assert.equal(EXAMPLES.filter((e) => e.theme === 'multi').length, 7, '7 multi')

// coverage sanity: totals clear the spec floors
const totalInd = EXAMPLES.reduce((s, e) => s + e.scale.individuals, 0)
const totalCo = EXAMPLES.reduce((s, e) => s + e.scale.companies, 0)
assert.ok(totalInd >= 1000, `>=1000 individuals total (got ${totalInd})`)
assert.ok(totalCo >= 600, `>=600 companies total (got ${totalCo})`)
assert.ok(EXAMPLES.some((e) => e.scale.individuals >= 1500), 'at least one >=1500 individuals')

assert.equal(getExample(DEFAULT_EXAMPLE_ID)!.order, 1)
assert.equal(getExample('nope'), undefined)
console.log('examples OK')
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
cd /home/workl/leadliaison/dm1 && npx tsx src/examples/index.test.ts
```
Expected: prints `examples OK`. If a count assert fails, you mis-transcribed a row; fix the offending config.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(examples): 21 editable example configs (7 tech / 7 health / 7 multi)"
```

---

## Task 6: Seeded record generators + messify engine

**Files:**
- Create: `src/lib/generate/seed.ts`, `src/lib/generate/companies.ts`, `src/lib/generate/individuals.ts`, `src/lib/generate/events.ts`, `src/lib/generate/messify.ts`
- Test: `src/lib/generate/generate.test.ts`

**Interfaces:**
- Consumes: `../types`, `../../examples/index` (`ExampleConfig`), `./avatar`, `@faker-js/faker`.
- Produces:
  - `seed.ts`: `function seededFaker(seed: number): typeof faker` (calls `faker.seed(seed)` and returns faker); `function idFactory(prefix: string): () => string`.
  - `companies.ts`: `function generateCompanies(cfg: ExampleConfig): CompanyRecord[]` (length = `cfg.scale.companies`).
  - `individuals.ts`: `function generateIndividuals(cfg: ExampleConfig, companies: CompanyRecord[]): IndividualRecord[]` (length = `cfg.scale.individuals`).
  - `events.ts`: `function generateEvents(cfg: ExampleConfig): EventRecord[]` (length = `cfg.scale.sessions`).
  - `messify.ts`: `function messifyIndividual(rec: IndividualRecord, cfg: ExampleConfig, rng: () => number): IndividualRecord` and `messifyCompany(...)` — returns a display-corrupted COPY; never mutates input.

- [ ] **Step 1: seed + id helpers**

Create `src/lib/generate/seed.ts`:
```ts
import { faker } from '@faker-js/faker'

/** Seed the shared faker and return it. Call once per example before generating. */
export function seededFaker(seed: number): typeof faker {
  faker.seed(seed)
  return faker
}

export function idFactory(prefix: string): () => string {
  let n = 0
  return () => `${prefix}${1000 + n++}`
}

/** Mulberry32 PRNG — deterministic [0,1) generator for messify decisions. */
export function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
```

- [ ] **Step 2: company generator**

Create `src/lib/generate/companies.ts`:
```ts
import type { CompanyRecord, CompanyScanType } from '../types.ts'
import type { ExampleConfig } from '../../examples/index.ts'
import { seededFaker, idFactory } from './seed.ts'

const COMPANY_TYPES: CompanyScanType[] = ['exhibitors', 'sponsors', 'others']

export function generateCompanies(cfg: ExampleConfig): CompanyRecord[] {
  const f = seededFaker(cfg.seed + 1)
  const nextId = idFactory('co')
  const out: CompanyRecord[] = []
  for (let i = 0; i < cfg.scale.companies; i++) {
    const id = nextId()
    const name = f.company.name()
    const domain = f.internet.domainName()
    const slug = domain.split('.')[0]
    const types: CompanyScanType[] = [f.helpers.arrayElement(COMPANY_TYPES)]
    if (f.datatype.boolean(0.25)) {
      const extra = f.helpers.arrayElement(COMPANY_TYPES)
      if (!types.includes(extra)) types.push(extra)
    }
    out.push({
      id,
      name,
      website: `https://www.${domain}`,
      phone: f.phone.number(),
      country: f.location.country(),
      city: f.location.city(),
      region: f.location.state(),
      address: f.location.streetAddress(),
      types,
      industry: f.helpers.arrayElement(cfg.industryPool),
      numEmployees: f.number.int({ min: 5, max: 25000 }),
      revenue: f.number.int({ min: 100000, max: 900000000 }),
      orgType: f.helpers.arrayElement(['Private', 'Public', 'Nonprofit', 'Startup']),
      linkedin: `https://www.linkedin.com/company/${slug}`,
      facebook: f.datatype.boolean(0.5) ? `https://facebook.com/${slug}` : null,
      twitter: f.datatype.boolean(0.4) ? `https://twitter.com/${slug}` : null,
      instagram: f.datatype.boolean(0.3) ? `https://instagram.com/${slug}` : null,
      youtube: f.datatype.boolean(0.2) ? `https://youtube.com/@${slug}` : null,
      description: f.company.catchPhrase(),
      profileUrl: `/exhibitors/${id}`,
      additionalInfo: { booth: `#${f.number.int({ min: 100, max: 4999 })}` },
    })
  }
  return out
}
```
`id` is computed once per iteration and reused for both the record `id` and its `profileUrl`, so a company's card link always resolves to its own detail page.

- [ ] **Step 3: individual generator**

Create `src/lib/generate/individuals.ts`:
```ts
import type { IndividualRecord, ScanType, CompanyRecord } from '../types.ts'
import type { ExampleConfig } from '../../examples/index.ts'
import { seededFaker, idFactory } from './seed.ts'
import { personAvatarSvg, svgToDataUri } from './avatar.ts'

const IND_TYPES: ScanType[] = ['attendees', 'speakers', 'exhibitors', 'sponsors', 'others']

export function generateIndividuals(cfg: ExampleConfig, companies: CompanyRecord[]): IndividualRecord[] {
  const f = seededFaker(cfg.seed + 2)
  const nextId = idFactory('in')
  const out: IndividualRecord[] = []
  for (let i = 0; i < cfg.scale.individuals; i++) {
    const id = nextId()
    const firstName = f.person.firstName()
    const lastName = f.person.lastName()
    const fullName = `${firstName} ${lastName}`
    const co = companies.length ? f.helpers.arrayElement(companies) : null
    const types: ScanType[] = [f.helpers.arrayElement(IND_TYPES)]
    if (f.datatype.boolean(0.2)) {
      const extra = f.helpers.arrayElement(IND_TYPES)
      if (!types.includes(extra)) types.push(extra)
    }
    const domain = co ? new URL(co.website!).hostname.replace(/^www\./, '') : f.internet.domainName()
    out.push({
      id,
      firstName,
      lastName,
      fullName,
      email: f.internet.email({ firstName, lastName, provider: domain }).toLowerCase(),
      title: f.helpers.arrayElement(cfg.titlePool),
      types,
      linkedin: `https://www.linkedin.com/in/${f.internet.username({ firstName, lastName }).toLowerCase()}`,
      twitter: f.datatype.boolean(0.3) ? `https://twitter.com/${f.internet.username()}` : null,
      instagram: f.datatype.boolean(0.15) ? `https://instagram.com/${f.internet.username()}` : null,
      profileUrl: `/attendees/${id}`,
      photoUrl: svgToDataUri(personAvatarSvg(fullName)),
      bio: f.datatype.boolean(0.6) ? f.person.bio() : null,
      interests: f.datatype.boolean(0.5) ? f.helpers.arrayElements(cfg.sessionTopics, { min: 1, max: 3 }).join(', ') : null,
      company: co?.name ?? f.company.name(),
      companyWebsite: co?.website ?? `https://www.${domain}`,
      phone: f.phone.number(),
      city: f.location.city(),
      country: f.location.country(),
      region: f.location.state(),
      industry: co?.industry ?? f.helpers.arrayElement(cfg.industryPool),
      orgType: f.helpers.arrayElement(['Private', 'Public', 'Nonprofit', 'Startup']),
      additionalInfo: {},
    })
  }
  return out
}
```

- [ ] **Step 4: event/session generator**

Create `src/lib/generate/events.ts`:
```ts
import type { EventRecord } from '../types.ts'
import type { ExampleConfig } from '../../examples/index.ts'
import { seededFaker, idFactory } from './seed.ts'

export function generateEvents(cfg: ExampleConfig): EventRecord[] {
  const f = seededFaker(cfg.seed + 3)
  const nextId = idFactory('ev')
  const start = new Date(cfg.dates.start).getTime()
  const out: EventRecord[] = []
  for (let i = 0; i < cfg.scale.sessions; i++) {
    const id = nextId()
    const dayOffset = f.number.int({ min: 0, max: 2 }) * 86400000
    const hour = f.number.int({ min: 9, max: 16 })
    const s = start + dayOffset + hour * 3600000
    out.push({
      id,
      name: f.helpers.arrayElement(cfg.sessionTopics),
      eventUrl: `/agenda#${id}`,
      startDate: s,
      endDate: s + 3600000,
      location: f.helpers.arrayElement(['Main Stage', 'Room A', 'Room B', 'Workshop Hall', 'Expo Theater']),
      eventType: f.helpers.arrayElement(['Keynote', 'Panel', 'Workshop', 'Breakout']),
      eventOverview: f.lorem.sentences(2),
    })
  }
  return out
}
```

- [ ] **Step 5: messify engine (corrupts DISPLAY only)**

Create `src/lib/generate/messify.ts`:
```ts
import type { IndividualRecord, CompanyRecord } from '../types.ts'
import type { ExampleConfig } from '../../examples/index.ts'

function obfuscateEmail(email: string): string {
  return email.replace('@', ' [at] ').replace(/\.([a-z]+)$/i, ' dot $1')
}
const EMOJI = ['🚀', '✨', '💡', '🔥']

/** Returns a display-corrupted COPY. Ground-truth (input) is never mutated. */
export function messifyIndividual(rec: IndividualRecord, cfg: ExampleConfig, rand: () => number): IndividualRecord {
  const d = { ...rec, additionalInfo: { ...rec.additionalInfo } }
  if (cfg.difficulty === 'easy') return d
  const drop = (v: string | null) => (rand() < 0.2 ? (rand() < 0.5 ? null : 'N/A') : v)
  // medium: drop optional fields, mixed case
  d.title = drop(d.title)
  d.bio = drop(d.bio)
  d.interests = drop(d.interests)
  d.twitter = drop(d.twitter)
  if (rand() < 0.3 && d.city) d.city = d.city.toUpperCase()
  if (cfg.difficulty === 'hard') {
    if (rand() < 0.25) { const t = d.firstName; d.firstName = d.lastName; d.lastName = t } // swap
    if (rand() < 0.2) d.fullName = `${d.fullName}  ${EMOJI[Math.floor(rand() * EMOJI.length)]}` // emoji + double space
    if (rand() < 0.3 && d.email) d.email = obfuscateEmail(d.email) // obfuscated
    if (rand() < 0.15 && d.title) d.title = `${d.title} / ${cfg.titlePool[0]}` // multi-value cell
  }
  return d
}

export function messifyCompany(rec: CompanyRecord, cfg: ExampleConfig, rand: () => number): CompanyRecord {
  const d = { ...rec, additionalInfo: { ...rec.additionalInfo } }
  if (cfg.difficulty === 'easy') return d
  const drop = (v: string | null) => (rand() < 0.2 ? (rand() < 0.5 ? null : 'N/A') : v)
  d.phone = drop(d.phone)
  d.address = drop(d.address)
  d.description = drop(d.description)
  if (cfg.difficulty === 'hard') {
    if (rand() < 0.2) d.name = `${d.name}   ${EMOJI[Math.floor(rand() * EMOJI.length)]}`
    if (rand() < 0.2 && d.website) d.website = d.website.replace('https://www.', '')
  }
  return d
}
```

- [ ] **Step 6: Write the generator test**

Create `src/lib/generate/generate.test.ts`:
```ts
import assert from 'node:assert'
import { generateCompanies } from './companies.ts'
import { generateIndividuals } from './individuals.ts'
import { generateEvents } from './events.ts'
import { messifyIndividual } from './messify.ts'
import { rng } from './seed.ts'
import type { ExampleConfig } from '../../examples/index.ts'

const cfg: ExampleConfig = {
  id: 't', order: 1, theme: 'tech', eventName: 'T', tagline: '', venue: '', city: '', country: '',
  dates: { start: '2026-09-14', end: '2026-09-16' }, seed: 999, difficulty: 'hard',
  layout: 'card-grid', scale: { individuals: 30, companies: 10, sessions: 5 },
  coverage: { entities: ['individuals', 'companies', 'events'], emailsInline: false, fieldFullness: 'full' },
  industryPool: ['Software/SaaS'], titlePool: ['CEO', 'CTO'], sessionTopics: ['AI'],
}

// determinism
const a1 = generateCompanies(cfg)
const a2 = generateCompanies(cfg)
assert.equal(a1.length, 10, 'company count = scale.companies')
assert.deepEqual(a1, a2, 'company generation deterministic')

const ind = generateIndividuals(cfg, a1)
assert.equal(ind.length, 30, 'individual count = scale.individuals')
assert.ok(ind.every((r) => r.types.length >= 1), 'every individual has >=1 type')
assert.ok(ind.every((r) => r.photoUrl!.startsWith('data:image/svg+xml')), 'photoUrl is generated svg, no real face')

assert.equal(generateEvents(cfg).length, 5, 'event count = scale.sessions')

// messify does not mutate the ground truth
const original = ind[0]
const snapshot = JSON.stringify(original)
const messy = messifyIndividual(original, cfg, rng(1))
assert.equal(JSON.stringify(original), snapshot, 'messify must not mutate input (ground truth intact)')
assert.notEqual(messy, original, 'messify returns a copy')
console.log('generate OK')
```

- [ ] **Step 7: Run test to verify it passes**

Run:
```bash
cd /home/workl/leadliaison/dm1 && npx tsx src/lib/generate/generate.test.ts
```
Expected: prints `generate OK`. If "deterministic" fails, ensure each generator calls `seededFaker` with a fixed per-example seed and does not read `Date.now()`/`Math.random()`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(generate): seeded company/individual/event generators + messify engine"
```

---

## Task 7: Build-time fixture generation script

**Files:**
- Create: `scripts/generate-data.ts`
- Create (output): `src/data/<exampleId>/{individuals,companies,events,meta}.json` (committed)

**Interfaces:**
- Consumes: `../src/examples/index`, all of `../src/lib/generate/*`.
- Produces: for each example, four JSON files. `meta.json` = `{ config: ExampleConfig, counts: { individuals, companies, events } }`. Each `individuals.json`/`companies.json` entry is `{ truth: <clean record>, display: <messified record> }`.

- [ ] **Step 1: Write the script**

Create `scripts/generate-data.ts`:
```ts
import fs from 'node:fs'
import path from 'node:path'
import { EXAMPLES } from '../src/examples/index.ts'
import { generateCompanies } from '../src/lib/generate/companies.ts'
import { generateIndividuals } from '../src/lib/generate/individuals.ts'
import { generateEvents } from '../src/lib/generate/events.ts'
import { messifyIndividual, messifyCompany } from '../src/lib/generate/messify.ts'
import { rng } from '../src/lib/generate/seed.ts'

const DATA_DIR = path.join(process.cwd(), 'src/data')

function writeJson(file: string, data: unknown) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(data))
}

let totalInd = 0
let totalCo = 0
for (const cfg of EXAMPLES) {
  const companies = cfg.coverage.entities.includes('companies') ? generateCompanies(cfg) : []
  const individuals = cfg.coverage.entities.includes('individuals') ? generateIndividuals(cfg, companies) : []
  const events = cfg.coverage.entities.includes('events') ? generateEvents(cfg) : []

  const rIndividuals = rng(cfg.seed + 11)
  const rCompanies = rng(cfg.seed + 12)
  const dir = path.join(DATA_DIR, cfg.id)
  writeJson(path.join(dir, 'individuals.json'), individuals.map((t) => ({ truth: t, display: messifyIndividual(t, cfg, rIndividuals) })))
  writeJson(path.join(dir, 'companies.json'), companies.map((t) => ({ truth: t, display: messifyCompany(t, cfg, rCompanies) })))
  writeJson(path.join(dir, 'events.json'), events)
  writeJson(path.join(dir, 'meta.json'), { config: cfg, counts: { individuals: individuals.length, companies: companies.length, events: events.length } })

  totalInd += individuals.length
  totalCo += companies.length
  process.stdout.write(`\r  ${cfg.order}/21 ${cfg.eventName} (${individuals.length} ind, ${companies.length} co)        `)
}
console.log(`\nDone. ${totalInd} individuals, ${totalCo} companies across 21 examples.`)
if (totalInd < 1000) throw new Error(`Only ${totalInd} individuals — spec requires >=1000`)
if (totalCo < 600) throw new Error(`Only ${totalCo} companies — spec requires >=600`)
```

- [ ] **Step 2: Run the generator**

Run:
```bash
cd /home/workl/leadliaison/dm1 && npm run generate
```
Expected: progress through 21 examples; final line reports totals ≥1000 individuals and ≥600 companies (no thrown error).

- [ ] **Step 3: Spot-check output**

Run:
```bash
cd /home/workl/leadliaison/dm1
ls src/data | wc -l                       # expect 21
node -p "JSON.parse(require('fs').readFileSync('src/data/captello-summit-2026/meta.json')).counts"
node -e "const a=JSON.parse(require('fs').readFileSync('src/data/captello-summit-2026/individuals.json')); const r=a[0]; console.log('has truth+display:', !!r.truth && !!r.display); console.log('photoUrl is svg:', r.truth.photoUrl.startsWith('data:image/svg+xml'));"
```
Expected: 21 dirs; counts `{ individuals: 1500, companies: 700, events: 60 }`; `has truth+display: true`; `photoUrl is svg: true`.

- [ ] **Step 4: Commit (fixtures included)**

```bash
git add -A
git commit -m "feat(data): commit generated fixtures for 21 examples (truth + display split)"
```

---

## Task 8: Data-access layer + active-example resolution

**Files:**
- Create: `src/lib/data.ts`, `src/lib/active-example.ts`
- Test: `src/lib/data.test.ts`

**Interfaces:**
- Consumes: committed `src/data/*`, `./types`, `../examples/index`.
- Produces:
  - `active-example.ts`: `const EXAMPLE_PARAM = 'example'`; `function resolveExampleId(raw: string | undefined): string` (validates against `EXAMPLES`, falls back to `DEFAULT_EXAMPLE_ID`).
  - `data.ts`:
    - `interface Row<T> { truth: T; display: T }`
    - `function loadIndividuals(exampleId: string): Row<IndividualRecord>[]`
    - `function loadCompanies(exampleId: string): Row<CompanyRecord>[]`
    - `function loadEvents(exampleId: string): EventRecord[]`
    - `function loadMeta(exampleId: string): { config: ExampleConfig; counts: {...} }`
    - `function paginate<T>(items: T[], page: number, perPage: number): { items: T[]; page: number; totalPages: number; total: number }`

- [ ] **Step 1: active-example resolver**

Create `src/lib/active-example.ts`:
```ts
import { EXAMPLES, DEFAULT_EXAMPLE_ID } from '../examples/index.ts'

export const EXAMPLE_PARAM = 'example'

export function resolveExampleId(raw: string | undefined): string {
  if (raw && EXAMPLES.some((e) => e.id === raw)) return raw
  return DEFAULT_EXAMPLE_ID
}
```

- [ ] **Step 2: data loader**

Create `src/lib/data.ts`:
```ts
import fs from 'node:fs'
import path from 'node:path'
import type { IndividualRecord, CompanyRecord, EventRecord } from './types.ts'
import type { ExampleConfig } from '../examples/index.ts'

const DATA_DIR = path.join(process.cwd(), 'src/data')

export interface Row<T> { truth: T; display: T }

function read<T>(exampleId: string, file: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, exampleId, file), 'utf-8')) as T
}

export function loadIndividuals(exampleId: string): Row<IndividualRecord>[] {
  return read<Row<IndividualRecord>[]>(exampleId, 'individuals.json')
}
export function loadCompanies(exampleId: string): Row<CompanyRecord>[] {
  return read<Row<CompanyRecord>[]>(exampleId, 'companies.json')
}
export function loadEvents(exampleId: string): EventRecord[] {
  return read<EventRecord[]>(exampleId, 'events.json')
}
export function loadMeta(exampleId: string): { config: ExampleConfig; counts: { individuals: number; companies: number; events: number } } {
  return read(exampleId, 'meta.json')
}

export function paginate<T>(items: T[], page: number, perPage: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage))
  const p = Math.min(Math.max(1, page), totalPages)
  return { items: items.slice((p - 1) * perPage, p * perPage), page: p, totalPages, total: items.length }
}
```

- [ ] **Step 3: Write the test**

Create `src/lib/data.test.ts`:
```ts
import assert from 'node:assert'
import { loadIndividuals, loadMeta, paginate } from './data.ts'
import { resolveExampleId } from './active-example.ts'

assert.equal(resolveExampleId('captello-summit-2026'), 'captello-summit-2026')
assert.equal(resolveExampleId('bogus'), 'captello-summit-2026') // default
assert.equal(resolveExampleId(undefined), 'captello-summit-2026')

const rows = loadIndividuals('captello-summit-2026')
assert.ok(rows.length === 1500, 'loads all rows')
assert.ok(rows[0].truth && rows[0].display, 'row has truth+display')

const meta = loadMeta('captello-summit-2026')
assert.equal(meta.config.id, 'captello-summit-2026')

const pg = paginate(rows, 2, 20)
assert.equal(pg.items.length, 20)
assert.equal(pg.page, 2)
assert.equal(pg.total, 1500)
console.log('data OK')
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
cd /home/workl/leadliaison/dm1 && npx tsx src/lib/data.test.ts
```
Expected: prints `data OK`. (Requires Task 7 fixtures to exist.)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(data): data-access layer + active-example resolver"
```

---

## Task 9: Export module (byte-compatible with the extension)

**Files:**
- Create: `src/lib/export/cell.ts`, `src/lib/export/csv.ts`, `src/lib/export/xlsx.ts`, `src/lib/export/json.ts`
- Test: `src/lib/export/export.test.ts`

**Interfaces:**
- Consumes: `../schema` (`INDIVIDUAL_FIELDS`, `COMPANY_FIELDS`, `FieldDef`), `../types`, `exceljs`.
- Produces (mirroring `captello-envoy/src/sidepanel/lib/export.ts`):
  - `cell.ts`: `function cellValue(record: Record<string, unknown>, field: FieldDef): string`; `function stamp(): string`.
  - `csv.ts`: `function toCsv(records, fields): string` (pure, testable).
  - `xlsx.ts`: `async function buildXlsxBuffer(individuals, companies): Promise<ArrayBuffer>` (pure builder, testable in Node) + `async function downloadXlsx(...)` (browser-only wrapper).
  - `json.ts`: `function toJson(individuals, companies): string`.

- [ ] **Step 1: cell serializer (exact extension logic)**

Create `src/lib/export/cell.ts`:
```ts
import type { FieldDef } from '../schema.ts'

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Matches captello-envoy/src/sidepanel/lib/export.ts cellValue exactly. */
export function cellValue(record: Record<string, unknown>, field: FieldDef): string {
  if (field.key === 'additionalInfo') {
    return JSON.stringify(record.additionalInfo ?? {})
  }
  const v = record[field.key]
  if (field.key === 'types' && Array.isArray(v)) {
    return v.map((t) => titleCase(String(t))).join(', ')
  }
  return v === null || v === undefined ? '' : String(v)
}

/** File-safe ISO timestamp, e.g. 2026-06-24T10-57-48-000Z. Matches extension. */
export function stamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-')
}
```

- [ ] **Step 2: CSV serializer**

Create `src/lib/export/csv.ts`:
```ts
import type { FieldDef } from '../schema.ts'
import { cellValue } from './cell.ts'

function csvEscape(v: string): string {
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`
  }
  return v
}

/** One CSV string: header row of labels + one row per record. Matches extension toCsv. */
export function toCsv(records: Record<string, unknown>[], fields: FieldDef[]): string {
  const lines = [fields.map((f) => csvEscape(f.label)).join(',')]
  for (const r of records) {
    lines.push(fields.map((f) => csvEscape(cellValue(r, f))).join(','))
  }
  return lines.join('\n')
}
```

- [ ] **Step 3: JSON serializer**

Create `src/lib/export/json.ts`:
```ts
export function toJson(individuals: unknown[], companies: unknown[]): string {
  return JSON.stringify({ individuals, companies }, null, 2)
}
```

- [ ] **Step 4: XLSX builder + browser download**

Create `src/lib/export/xlsx.ts`:
```ts
import ExcelJS from 'exceljs'
import { INDIVIDUAL_FIELDS, COMPANY_FIELDS, type FieldDef } from '../schema.ts'
import { cellValue, stamp } from './cell.ts'

function addSheet(wb: ExcelJS.Workbook, name: string, records: Record<string, unknown>[], fields: FieldDef[]) {
  const ws = wb.addWorksheet(name)
  ws.addRow(fields.map((f) => f.label))
  ws.getRow(1).font = { bold: true }
  for (const r of records) ws.addRow(fields.map((f) => cellValue(r, f)))
}

/** Pure builder — testable in Node. One workbook, Individuals + Companies sheets. */
export async function buildXlsxBuffer(
  individuals: Record<string, unknown>[],
  companies: Record<string, unknown>[],
): Promise<ArrayBuffer> {
  const wb = new ExcelJS.Workbook()
  addSheet(wb, 'Individuals', individuals, INDIVIDUAL_FIELDS)
  addSheet(wb, 'Companies', companies, COMPANY_FIELDS)
  return wb.xlsx.writeBuffer()
}

/** Browser-only: build + trigger download. Filename matches extension. */
export async function downloadXlsx(
  individuals: Record<string, unknown>[],
  companies: Record<string, unknown>[],
): Promise<void> {
  const buffer = await buildXlsxBuffer(individuals, companies)
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  triggerDownload(blob, `envoy-results-${stamp()}.xlsx`)
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
```

- [ ] **Step 5: Write the test (validates extension parity)**

Create `src/lib/export/export.test.ts`:
```ts
import assert from 'node:assert'
import { toCsv } from './csv.ts'
import { cellValue } from './cell.ts'
import { buildXlsxBuffer } from './xlsx.ts'
import { INDIVIDUAL_FIELDS } from '../schema.ts'

// header row = labels, comma-joined
const csv = toCsv([], INDIVIDUAL_FIELDS)
assert.ok(csv.startsWith('First Name,Last Name,Full Name,Email,Job Title,Type(s),'), 'header order matches extension')

// types => "Attendees, Speakers"; additionalInfo => JSON; null => ''
const rec = { fullName: 'Jane', types: ['attendees', 'speakers'], additionalInfo: { booth: '#1' }, email: null }
assert.equal(cellValue(rec, { key: 'types', label: 'Type(s)' }), 'Attendees, Speakers')
assert.equal(cellValue(rec, { key: 'additionalInfo', label: 'Additional Info' }), '{"booth":"#1"}')
assert.equal(cellValue(rec, { key: 'email', label: 'Email' }), '')

// csvEscape: value with comma gets quoted
const csv2 = toCsv([{ fullName: 'Doe, John', types: [], additionalInfo: {} }], [{ key: 'fullName', label: 'Full Name' }])
assert.ok(csv2.includes('"Doe, John"'), 'comma value quoted')

// xlsx builder produces a non-empty buffer
const buf = await buildXlsxBuffer([{ fullName: 'A', types: [], additionalInfo: {} }], [])
assert.ok(buf.byteLength > 0, 'xlsx buffer non-empty')
console.log('export OK')
```

- [ ] **Step 6: Run test to verify it passes**

Run:
```bash
cd /home/workl/leadliaison/dm1 && npx tsx src/lib/export/export.test.ts
```
Expected: prints `export OK`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(export): CSV/XLSX/JSON export byte-compatible with the extension"
```

---

## Task 10: Site chrome — nav, footer, hero, avatar, cards

**Files:**
- Create: `src/components/site/SiteNav.tsx`, `Footer.tsx`, `Hero.tsx`, `Avatar.tsx`, `StatBadge.tsx`, `PersonCard.tsx`, `CompanyCard.tsx`
- Modify: `src/app/layout.tsx`, `src/app/page.tsx`

**Interfaces:**
- Consumes: `../../lib/types`, `../../lib/generate/avatar` (for `Avatar`), `lucide-react`.
- Produces (all server components unless noted):
  - `Avatar({ name, src, size }: { name: string; src?: string | null; size?: number })` — renders `src` if a data-URI, else generates one from `name`. Never renders a remote/real image.
  - `SiteNav({ exampleId, meta }: { exampleId: string; meta: Meta })` — links to the sections present in `meta.config.coverage.entities`, preserving `?example=<id>`.
  - `Hero({ meta }: { meta: Meta })` — event name, tagline, dates, venue, countdown (client sub-component for the live countdown).
  - `PersonCard({ person }: { person: IndividualRecord })`, `CompanyCard({ company }: { company: CompanyRecord })`.
  - `StatBadge({ label, value })`, `Footer()`.
  - `type Meta = ReturnType<typeof loadMeta>` (import the type).

- [ ] **Step 1: Avatar (no real faces)**

Create `src/components/site/Avatar.tsx`:
```tsx
import { personAvatarSvg, svgToDataUri } from '../../lib/generate/avatar.ts'

export function Avatar({ name, src, size = 48 }: { name: string; src?: string | null; size?: number }) {
  // Only ever render a data-URI SVG. If src isn't a generated SVG, regenerate from name.
  const uri = src && src.startsWith('data:image/svg+xml') ? src : svgToDataUri(personAvatarSvg(name))
  return (
    <img
      src={uri}
      width={size}
      height={size}
      alt={`${name} avatar`}
      className="rounded-full"
    />
  )
}
```

- [ ] **Step 2: StatBadge + Footer**

Create `src/components/site/StatBadge.tsx`:
```tsx
export function StatBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <div className="text-2xl font-bold text-foreground tabular-nums">{value}</div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  )
}
```
Create `src/components/site/Footer.tsx`:
```tsx
export function Footer() {
  return (
    <footer className="mt-16 border-t border-border py-8 text-center text-sm text-muted-foreground">
      Captello Summit demo — synthetic data for extension testing. No real people.
    </footer>
  )
}
```

- [ ] **Step 3: SiteNav**

Create `src/components/site/SiteNav.tsx`:
```tsx
import Link from 'next/link'
import type { loadMeta } from '../../lib/data.ts'
type Meta = ReturnType<typeof loadMeta>

const SECTION_LINKS = [
  { key: 'individuals', items: [{ href: '/attendees', label: 'Attendees' }, { href: '/speakers', label: 'Speakers' }] },
  { key: 'companies', items: [{ href: '/exhibitors', label: 'Exhibitors' }, { href: '/sponsors', label: 'Sponsors' }] },
  { key: 'events', items: [{ href: '/agenda', label: 'Agenda' }] },
] as const

export function SiteNav({ exampleId, meta }: { exampleId: string; meta: Meta }) {
  const q = `?example=${exampleId}`
  const links = SECTION_LINKS
    .filter((s) => meta.config.coverage.entities.includes(s.key as 'individuals' | 'companies' | 'events'))
    .flatMap((s) => s.items)
  return (
    <nav className="sticky top-0 z-20 flex items-center gap-1 border-b border-border bg-background/90 px-4 py-3 backdrop-blur">
      <Link href={`/${q}`} className="mr-4 font-bold text-brand">{meta.config.eventName}</Link>
      {links.map((l) => (
        <Link key={l.href} href={`${l.href}${q}`} className="rounded-md px-3 py-1.5 text-sm text-foreground hover:bg-muted">
          {l.label}
        </Link>
      ))}
    </nav>
  )
}
```

- [ ] **Step 4: Hero (with client countdown)**

Create `src/components/site/Countdown.tsx`:
```tsx
'use client'
import { useEffect, useState } from 'react'

export function Countdown({ target }: { target: string }) {
  const [label, setLabel] = useState('')
  useEffect(() => {
    const tick = () => {
      const ms = new Date(target).getTime() - Date.now()
      if (ms <= 0) { setLabel('Live now'); return }
      const days = Math.floor(ms / 86400000)
      const hrs = Math.floor((ms % 86400000) / 3600000)
      setLabel(`${days}d ${hrs}h to go`)
    }
    tick()
    const t = setInterval(tick, 60000)
    return () => clearInterval(t)
  }, [target])
  return <span className="tabular-nums">{label}</span>
}
```
Create `src/components/site/Hero.tsx`:
```tsx
import type { loadMeta } from '../../lib/data.ts'
import { Countdown } from './Countdown.tsx'
import { StatBadge } from './StatBadge.tsx'
type Meta = ReturnType<typeof loadMeta>

export function Hero({ meta }: { meta: Meta }) {
  const { config, counts } = meta
  return (
    <header className="bg-gradient-to-b from-brand-light to-background px-4 py-14 text-center">
      <h1 className="text-4xl font-bold text-foreground">{config.eventName}</h1>
      <p className="mt-2 text-lg text-muted-foreground">{config.tagline}</p>
      <p className="mt-4 text-sm text-foreground">
        {config.dates.start} – {config.dates.end} · {config.venue}, {config.city} ·{' '}
        <Countdown target={config.dates.start} />
      </p>
      <div className="mx-auto mt-8 grid max-w-2xl grid-cols-3 gap-3">
        <StatBadge label="Attendees" value={counts.individuals.toLocaleString()} />
        <StatBadge label="Exhibitors" value={counts.companies.toLocaleString()} />
        <StatBadge label="Sessions" value={counts.events.toLocaleString()} />
      </div>
    </header>
  )
}
```

- [ ] **Step 5: PersonCard + CompanyCard**

Create `src/components/site/PersonCard.tsx`:
```tsx
import Link from 'next/link'
import type { IndividualRecord } from '../../lib/types.ts'
import { Avatar } from './Avatar.tsx'

export function PersonCard({ person, exampleId }: { person: IndividualRecord; exampleId: string }) {
  return (
    <Link href={`/attendees/${person.id}?example=${exampleId}`} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:border-brand">
      <Avatar name={person.fullName} src={person.photoUrl} />
      <div className="min-w-0">
        <div className="truncate font-medium text-foreground">{person.fullName}</div>
        <div className="truncate text-sm text-muted-foreground">{person.title ?? '—'}{person.company ? ` · ${person.company}` : ''}</div>
      </div>
    </Link>
  )
}
```
Create `src/components/site/CompanyCard.tsx`:
```tsx
import Link from 'next/link'
import type { CompanyRecord } from '../../lib/types.ts'
import { companyLogoSvg, svgToDataUri } from '../../lib/generate/avatar.ts'

export function CompanyCard({ company, exampleId }: { company: CompanyRecord; exampleId: string }) {
  return (
    <Link href={`/exhibitors/${company.id}?example=${exampleId}`} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:border-brand">
      <img src={svgToDataUri(companyLogoSvg(company.name))} width={48} height={48} alt={`${company.name} logo`} className="rounded-md" />
      <div className="min-w-0">
        <div className="truncate font-medium text-foreground">{company.name}</div>
        <div className="truncate text-sm text-muted-foreground">{company.industry ?? '—'}</div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 6: Wire the home page**

Replace `src/app/page.tsx`:
```tsx
import { resolveExampleId } from '../lib/active-example.ts'
import { loadMeta } from '../lib/data.ts'
import { Hero } from '../components/site/Hero.tsx'
import { SiteNav } from '../components/site/SiteNav.tsx'
import { Footer } from '../components/site/Footer.tsx'

export default async function Home({ searchParams }: { searchParams: Promise<{ example?: string }> }) {
  const { example } = await searchParams
  const id = resolveExampleId(example)
  const meta = loadMeta(id)
  return (
    <>
      <SiteNav exampleId={id} meta={meta} />
      <Hero meta={meta} />
      <Footer />
    </>
  )
}
```

- [ ] **Step 7: Build & visually verify**

Run:
```bash
cd /home/workl/leadliaison/dm1 && npx tsc --noEmit && npx next build
```
Expected: type-check clean; build succeeds. (Optional: `npm run dev`, open `/` and `/?example=cloudcon-2026`, confirm hero + nav render and countdown ticks.)

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(site): nav, hero, footer, avatar, person/company cards + home page"
```

---

## Task 11: Layout variants

**Files:**
- Create: `src/components/layouts/CardGrid.tsx`, `DenseTable.tsx`, `PaginatedList.tsx`, `SingleRoster.tsx`, `TabbedProfiles.tsx`, `InfiniteScroll.tsx`, `src/components/layouts/index.ts`

**Interfaces:**
- Consumes: `PersonCard`, `CompanyCard`, `../../lib/types`.
- Produces:
  - `type ListLayoutProps = { people?: IndividualRecord[]; companies?: CompanyRecord[]; exampleId: string; page?: number; totalPages?: number; baseHref?: string }`
  - One component per `LayoutVariant`.
  - `function pickLayout(variant: LayoutVariant): React.ComponentType<ListLayoutProps>` in `index.ts`.

- [ ] **Step 1: CardGrid + DenseTable**

Create `src/components/layouts/CardGrid.tsx`:
```tsx
import type { IndividualRecord, CompanyRecord } from '../../lib/types.ts'
import { PersonCard } from '../site/PersonCard.tsx'
import { CompanyCard } from '../site/CompanyCard.tsx'

export type ListLayoutProps = {
  people?: IndividualRecord[]
  companies?: CompanyRecord[]
  exampleId: string
  page?: number
  totalPages?: number
  baseHref?: string
}

export function CardGrid({ people, companies, exampleId }: ListLayoutProps) {
  return (
    <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
      {people?.map((p) => <PersonCard key={p.id} person={p} exampleId={exampleId} />)}
      {companies?.map((c) => <CompanyCard key={c.id} company={c} exampleId={exampleId} />)}
    </div>
  )
}
```
Create `src/components/layouts/DenseTable.tsx`:
```tsx
import Link from 'next/link'
import type { ListLayoutProps } from './CardGrid.tsx'

export function DenseTable({ people, companies, exampleId }: ListLayoutProps) {
  const q = `?example=${exampleId}`
  return (
    <div className="overflow-x-auto p-4">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            {people ? (<><th className="p-2">Name</th><th className="p-2">Title</th><th className="p-2">Company</th><th className="p-2">Email</th></>)
                    : (<><th className="p-2">Company</th><th className="p-2">Industry</th><th className="p-2">Website</th><th className="p-2">City</th></>)}
          </tr>
        </thead>
        <tbody>
          {people?.map((p) => (
            <tr key={p.id} className="border-b border-border hover:bg-muted">
              <td className="p-2"><Link href={`/attendees/${p.id}${q}`} className="text-brand hover:underline">{p.fullName}</Link></td>
              <td className="p-2">{p.title ?? '—'}</td>
              <td className="p-2">{p.company ?? '—'}</td>
              <td className="p-2">{p.email ?? '—'}</td>
            </tr>
          ))}
          {companies?.map((c) => (
            <tr key={c.id} className="border-b border-border hover:bg-muted">
              <td className="p-2"><Link href={`/exhibitors/${c.id}${q}`} className="text-brand hover:underline">{c.name}</Link></td>
              <td className="p-2">{c.industry ?? '—'}</td>
              <td className="p-2">{c.website ?? '—'}</td>
              <td className="p-2">{c.city ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 2: SingleRoster + PaginatedList (+ Pagination control)**

Create `src/components/site/Pagination.tsx`:
```tsx
import Link from 'next/link'

export function Pagination({ page, totalPages, baseHref, query }: { page: number; totalPages: number; baseHref: string; query: string }) {
  if (totalPages <= 1) return null
  const href = (n: number) => (n === 1 ? `${baseHref}${query}` : `${baseHref}/page/${n}${query}`)
  return (
    <div className="flex items-center justify-center gap-2 py-6 text-sm">
      {page > 1 && <Link href={href(page - 1)} className="rounded-md border border-border px-3 py-1.5 hover:bg-muted">Prev</Link>}
      <span className="text-muted-foreground">Page {page} of {totalPages}</span>
      {page < totalPages && <Link href={href(page + 1)} className="rounded-md border border-border px-3 py-1.5 hover:bg-muted">Next</Link>}
    </div>
  )
}
```
Create `src/components/layouts/SingleRoster.tsx`:
```tsx
import type { ListLayoutProps } from './CardGrid.tsx'
import { DenseTable } from './DenseTable.tsx'

// SingleRoster = the entire set on one long page (no pagination). Reuse DenseTable body.
export function SingleRoster(props: ListLayoutProps) {
  return <DenseTable {...props} />
}
```
Create `src/components/layouts/PaginatedList.tsx`:
```tsx
import type { ListLayoutProps } from './CardGrid.tsx'
import { CardGrid } from './CardGrid.tsx'
import { Pagination } from '../site/Pagination.tsx'

export function PaginatedList(props: ListLayoutProps) {
  return (
    <>
      <CardGrid {...props} />
      {props.baseHref && props.totalPages ? (
        <Pagination page={props.page ?? 1} totalPages={props.totalPages} baseHref={props.baseHref} query={`?example=${props.exampleId}`} />
      ) : null}
    </>
  )
}
```

- [ ] **Step 3: TabbedProfiles + InfiniteScroll**

Create `src/components/layouts/TabbedProfiles.tsx`:
```tsx
import type { ListLayoutProps } from './CardGrid.tsx'
import { CardGrid } from './CardGrid.tsx'

// TabbedProfiles: same data, grouped visual (kept simple = CardGrid with a header band).
// The DOM difference (section grouping) is what varies the scan surface.
export function TabbedProfiles(props: ListLayoutProps) {
  return (
    <section data-layout="tabbed">
      <div className="border-b border-border bg-muted px-4 py-2 text-xs uppercase tracking-wide text-muted-foreground">Directory</div>
      <CardGrid {...props} />
    </section>
  )
}
```
Create `src/components/layouts/InfiniteScroll.tsx`:
```tsx
'use client'
import { useState } from 'react'
import type { ListLayoutProps } from './CardGrid.tsx'
import { PersonCard } from '../site/PersonCard.tsx'
import { CompanyCard } from '../site/CompanyCard.tsx'

const STEP = 60

// SSG renders ALL items in the DOM (scanner-friendly); the button just reveals more visually.
export function InfiniteScroll({ people, companies, exampleId }: ListLayoutProps) {
  const [shown, setShown] = useState(STEP)
  const items = people ?? companies ?? []
  return (
    <div className="p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, shown).map((it) =>
          people ? <PersonCard key={it.id} person={it as never} exampleId={exampleId} />
                 : <CompanyCard key={it.id} company={it as never} exampleId={exampleId} />,
        )}
      </div>
      {shown < items.length && (
        <button onClick={() => setShown((s) => s + STEP)} className="mx-auto mt-6 block rounded-md bg-brand px-4 py-2 text-white hover:bg-brand-hover">
          Load more ({items.length - shown} remaining)
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 4: layout picker**

Create `src/components/layouts/index.ts`:
```ts
import type { LayoutVariant } from '../../examples/index.ts'
import type { ListLayoutProps } from './CardGrid.tsx'
import { CardGrid } from './CardGrid.tsx'
import { DenseTable } from './DenseTable.tsx'
import { PaginatedList } from './PaginatedList.tsx'
import { SingleRoster } from './SingleRoster.tsx'
import { TabbedProfiles } from './TabbedProfiles.tsx'
import { InfiniteScroll } from './InfiniteScroll.tsx'
import type { ComponentType } from 'react'

export type { ListLayoutProps }

const MAP: Record<LayoutVariant, ComponentType<ListLayoutProps>> = {
  'card-grid': CardGrid,
  'dense-table': DenseTable,
  'paginated-list': PaginatedList,
  'single-roster': SingleRoster,
  'tabbed-profiles': TabbedProfiles,
  'infinite-scroll': InfiniteScroll,
}

export function pickLayout(variant: LayoutVariant): ComponentType<ListLayoutProps> {
  return MAP[variant]
}
```

- [ ] **Step 5: Type-check**

Run:
```bash
cd /home/workl/leadliaison/dm1 && npx tsc --noEmit
```
Expected: PASS. (No runtime test — these are visual components validated when wired into pages in Task 12.)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(layouts): six list-layout variants + picker + pagination control"
```

---

## Task 12: List + detail routes (per entity)

**Files:**
- Create: `src/app/attendees/page.tsx`, `attendees/page/[n]/page.tsx`, `attendees/[id]/page.tsx`
- Create: `src/app/speakers/page.tsx`, `speakers/[id]/page.tsx`
- Create: `src/app/exhibitors/page.tsx`, `exhibitors/page/[n]/page.tsx`, `exhibitors/[id]/page.tsx`
- Create: `src/app/sponsors/page.tsx`, `src/app/agenda/page.tsx`

**Interfaces:**
- Consumes: `data.ts`, `active-example.ts`, `pickLayout`, site components. Uses `messify` output = the **`display`** field for rendering; detail pages render `display` too (email hidden if `!coverage.emailsInline` on the list, shown on detail).
- Produces: the crawlable pages the extension scans. Detail routes are dynamic (no `generateStaticParams` — per Global Constraints).

- [ ] **Step 1: Attendees list (renders display values via layout)**

Create `src/app/attendees/page.tsx`:
```tsx
import { resolveExampleId } from '../../lib/active-example.ts'
import { loadIndividuals, loadMeta, paginate } from '../../lib/data.ts'
import { pickLayout } from '../../components/layouts/index.ts'
import { SiteNav } from '../../components/site/SiteNav.tsx'
import { Footer } from '../../components/site/Footer.tsx'

const PER_PAGE = 60

export default async function AttendeesPage({ searchParams }: { searchParams: Promise<{ example?: string }> }) {
  const { example } = await searchParams
  const id = resolveExampleId(example)
  const meta = loadMeta(id)
  const rows = loadIndividuals(id).map((r) => r.display)
  const usePages = meta.config.layout === 'paginated-list' || meta.config.layout === 'dense-table'
  const Layout = pickLayout(meta.config.layout)
  const view = usePages ? paginate(rows, 1, PER_PAGE) : { items: rows, page: 1, totalPages: 1, total: rows.length }
  return (
    <>
      <SiteNav exampleId={id} meta={meta} />
      <h1 className="px-4 pt-6 text-2xl font-bold text-foreground">Attendees <span className="text-sm font-normal text-muted-foreground">({view.total.toLocaleString()})</span></h1>
      <Layout people={view.items} exampleId={id} page={view.page} totalPages={view.totalPages} baseHref="/attendees" />
      <Footer />
    </>
  )
}
```

- [ ] **Step 2: Attendees paginated page/[n]**

Create `src/app/attendees/page/[n]/page.tsx`:
```tsx
import { notFound } from 'next/navigation'
import { resolveExampleId } from '../../../../lib/active-example.ts'
import { loadIndividuals, loadMeta, paginate } from '../../../../lib/data.ts'
import { pickLayout } from '../../../../components/layouts/index.ts'
import { SiteNav } from '../../../../components/site/SiteNav.tsx'
import { Footer } from '../../../../components/site/Footer.tsx'

const PER_PAGE = 60

export default async function AttendeesPageN({ params, searchParams }: { params: Promise<{ n: string }>; searchParams: Promise<{ example?: string }> }) {
  const { n } = await params
  const { example } = await searchParams
  const page = parseInt(n, 10)
  if (isNaN(page) || page < 2) notFound()
  const id = resolveExampleId(example)
  const meta = loadMeta(id)
  const rows = loadIndividuals(id).map((r) => r.display)
  const view = paginate(rows, page, PER_PAGE)
  if (view.items.length === 0) notFound()
  const Layout = pickLayout(meta.config.layout)
  return (
    <>
      <SiteNav exampleId={id} meta={meta} />
      <Layout people={view.items} exampleId={id} page={view.page} totalPages={view.totalPages} baseHref="/attendees" />
      <Footer />
    </>
  )
}
```

- [ ] **Step 3: Attendee detail**

Create `src/app/attendees/[id]/page.tsx`:
```tsx
import { notFound } from 'next/navigation'
import { resolveExampleId } from '../../../lib/active-example.ts'
import { loadIndividuals, loadMeta } from '../../../lib/data.ts'
import { SiteNav } from '../../../components/site/SiteNav.tsx'
import { Footer } from '../../../components/site/Footer.tsx'
import { Avatar } from '../../../components/site/Avatar.tsx'

export default async function AttendeeDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ example?: string }> }) {
  const { id: personId } = await params
  const { example } = await searchParams
  const id = resolveExampleId(example)
  const meta = loadMeta(id)
  const row = loadIndividuals(id).find((r) => r.display.id === personId)
  if (!row) notFound()
  const p = row.display
  return (
    <>
      <SiteNav exampleId={id} meta={meta} />
      <article className="mx-auto max-w-2xl px-4 py-10">
        <div className="flex items-center gap-4">
          <Avatar name={p.fullName} src={p.photoUrl} size={80} />
          <div>
            <h1 className="text-2xl font-bold text-foreground">{p.fullName}</h1>
            <p className="text-muted-foreground">{p.title ?? '—'}{p.company ? ` · ${p.company}` : ''}</p>
          </div>
        </div>
        <dl className="mt-6 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-muted-foreground">Email</dt><dd className="text-foreground">{p.email ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">Phone</dt><dd className="text-foreground">{p.phone ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">City</dt><dd className="text-foreground">{p.city ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">Country</dt><dd className="text-foreground">{p.country ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">LinkedIn</dt><dd className="truncate text-foreground">{p.linkedin ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">Industry</dt><dd className="text-foreground">{p.industry ?? '—'}</dd></div>
        </dl>
        {p.bio && <p className="mt-6 text-foreground">{p.bio}</p>}
      </article>
      <Footer />
    </>
  )
}
```

- [ ] **Step 4: Speakers list + detail (reuse pattern)**

Create `src/app/speakers/page.tsx` — identical to attendees list but filter `rows` to those whose `types` include `'speakers'`, heading "Speakers", `baseHref="/speakers"`. Create `src/app/speakers/[id]/page.tsx` — identical to the attendee detail but resolve from the speakers filter (or just reuse the full individuals list by id; both work since ids are global). Copy the attendees files and change: the `.filter((p) => p.types.includes('speakers'))` on the mapped rows, the `<h1>` label, and `baseHref`.

- [ ] **Step 5: Exhibitors list + page/[n] + detail (companies)**

Create `src/app/exhibitors/page.tsx`, `exhibitors/page/[n]/page.tsx`, `exhibitors/[id]/page.tsx` mirroring the attendees trio but with `loadCompanies` and the `companies=` prop on the layout, heading "Exhibitors", `baseHref="/exhibitors"`, and detail fields from `CompanyRecord` (name, website, industry, numEmployees, revenue, address, description). Use `companyLogoSvg` for the detail header image.

- [ ] **Step 6: Sponsors + Agenda**

Create `src/app/sponsors/page.tsx` — load companies, filter `display.types.includes('sponsors')`, render with `CardGrid` (sponsors always single-page), heading "Sponsors". Create `src/app/agenda/page.tsx` — `loadEvents(id)`, render a simple list of sessions (name, time from `startDate`, location, type), heading "Agenda". Both include `SiteNav` + `Footer`.

- [ ] **Step 7: Build the whole site**

Run:
```bash
cd /home/workl/leadliaison/dm1 && npx tsc --noEmit && npx next build
```
Expected: type-check clean; build succeeds. List routes pre-render; `[id]` and `page/[n]` show as dynamic (ƒ) — that is intended.

- [ ] **Step 8: Smoke-test key routes**

Run:
```bash
cd /home/workl/leadliaison/dm1 && (npm run dev &) && sleep 6
for u in "/" "/attendees?example=captello-summit-2026" "/exhibitors?example=devworld-2026" "/attendees/in1000?example=captello-summit-2026" "/agenda?example=ai-frontier-2026"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$u"); echo "$code  $u"
done
kill %1 2>/dev/null
```
Expected: all `200`. If a detail route 404s, confirm the id exists in that example's fixture.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(routes): attendees/speakers/exhibitors/sponsors/agenda list + detail pages"
```

---

## Task 13: QA bar — example switcher, export, toggle

**Files:**
- Create: `src/components/qa/QaBar.tsx` (client), `src/components/qa/qa-export.ts` (client helper)
- Modify: `src/app/layout.tsx` (mount QaBar), each page already passes `exampleId`

**Interfaces:**
- Consumes: `EXAMPLES` (registry), `load* ` data is NOT available client-side — so the QA bar fetches the active example's fixtures from a tiny route handler OR imports them. Decision: add a **route handler** `src/app/api/export/[id]/route.ts` that returns the ground-truth arrays as JSON (server reads fixtures); the client export helper fetches it, then serializes with the export module. This keeps `fs` on the server.
- Produces:
  - `QaBar` renders a fixed top strip: example `<select>` (grouped by theme), Export buttons (CSV/XLSX/JSON), and a hide toggle. Hidden when `?qa=0` or after pressing `Shift+Q`.
  - `qa-export.ts`: `async function exportCurrent(exampleId: string, format: 'csv'|'xlsx'|'json', which: 'truth'|'display')`.

- [ ] **Step 1: Export route handler (server reads fixtures)**

Create `src/app/api/export/[id]/route.ts`:
```ts
import { NextResponse } from 'next/server'
import { loadIndividuals, loadCompanies } from '../../../../lib/data.ts'
import { resolveExampleId } from '../../../../lib/active-example.ts'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const exampleId = resolveExampleId(id)
  const individuals = loadIndividuals(exampleId)
  const companies = loadCompanies(exampleId)
  return NextResponse.json({
    truth: { individuals: individuals.map((r) => r.truth), companies: companies.map((r) => r.truth) },
    display: { individuals: individuals.map((r) => r.display), companies: companies.map((r) => r.display) },
  })
}
```

- [ ] **Step 2: client export helper**

Create `src/components/qa/qa-export.ts`:
```ts
'use client'
import { toCsv } from '../../lib/export/csv.ts'
import { toJson } from '../../lib/export/json.ts'
import { downloadXlsx, triggerDownload } from '../../lib/export/xlsx.ts'
import { stamp } from '../../lib/export/cell.ts'
import { INDIVIDUAL_FIELDS, COMPANY_FIELDS } from '../../lib/schema.ts'

export async function exportCurrent(exampleId: string, format: 'csv' | 'xlsx' | 'json', which: 'truth' | 'display') {
  const res = await fetch(`/api/export/${exampleId}`)
  const data = await res.json()
  const { individuals, companies } = data[which]
  if (format === 'json') {
    triggerDownload(new Blob([toJson(individuals, companies)], { type: 'application/json' }), `envoy-groundtruth-${which}-${stamp()}.json`)
    return
  }
  if (format === 'csv') {
    const ts = stamp()
    if (individuals.length) triggerDownload(new Blob([toCsv(individuals, INDIVIDUAL_FIELDS)], { type: 'text/csv;charset=utf-8' }), `envoy-individuals-${ts}.csv`)
    if (companies.length) triggerDownload(new Blob([toCsv(companies, COMPANY_FIELDS)], { type: 'text/csv;charset=utf-8' }), `envoy-companies-${ts}.csv`)
    return
  }
  await downloadXlsx(individuals, companies)
}
```

- [ ] **Step 3: QaBar component**

Create `src/components/qa/QaBar.tsx`:
```tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { EXAMPLES } from '../../examples/index.ts'
import { exportCurrent } from './qa-export.ts'

const THEMES = [
  { key: 'tech', label: 'Tech / SaaS' },
  { key: 'health', label: 'Healthcare' },
  { key: 'multi', label: 'Multi-industry' },
] as const

export function QaBar() {
  const router = useRouter()
  const pathname = usePathname()
  const search = useSearchParams()
  const current = search.get('example') ?? EXAMPLES[0].id
  const [hidden, setHidden] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (search.get('qa') === '0') setHidden(true)
    const onKey = (e: KeyboardEvent) => { if (e.shiftKey && e.key.toLowerCase() === 'q') setHidden((h) => !h) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [search])

  if (hidden) return null
  const cfg = EXAMPLES.find((e) => e.id === current) ?? EXAMPLES[0]

  const onSwitch = (id: string) => {
    const sp = new URLSearchParams(Array.from(search.entries()))
    sp.set('example', id)
    router.push(`${pathname}?${sp.toString()}`)
  }
  const doExport = async (format: 'csv' | 'xlsx' | 'json') => {
    setBusy(true)
    try { await exportCurrent(current, format, 'truth') } finally { setBusy(false) }
  }

  return (
    <div className="sticky top-0 z-50 flex flex-wrap items-center gap-2 border-b border-border bg-[#1a1512] px-3 py-2 text-xs text-white">
      <span className="font-semibold text-brand">QA</span>
      <select value={current} onChange={(e) => onSwitch(e.target.value)} className="rounded bg-white/10 px-2 py-1 text-white">
        {THEMES.map((t) => (
          <optgroup key={t.key} label={t.label}>
            {EXAMPLES.filter((e) => e.theme === t.key).map((e) => (
              <option key={e.id} value={e.id} className="text-black">{e.order}. {e.eventName} [{e.difficulty}]</option>
            ))}
          </optgroup>
        ))}
      </select>
      <span className="text-white/60">{cfg.layout} · {cfg.scale.individuals} ind / {cfg.scale.companies} co</span>
      <div className="ml-auto flex items-center gap-1">
        <span className="text-white/60">Export truth:</span>
        <button disabled={busy} onClick={() => doExport('csv')} className="rounded bg-white/10 px-2 py-1 hover:bg-white/20 disabled:opacity-50">CSV</button>
        <button disabled={busy} onClick={() => doExport('xlsx')} className="rounded bg-white/10 px-2 py-1 hover:bg-white/20 disabled:opacity-50">XLSX</button>
        <button disabled={busy} onClick={() => doExport('json')} className="rounded bg-white/10 px-2 py-1 hover:bg-white/20 disabled:opacity-50">JSON</button>
        <button onClick={() => setHidden(true)} className="rounded bg-white/10 px-2 py-1 hover:bg-white/20" title="Hide (Shift+Q)">✕</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Mount in layout (wrapped in Suspense — useSearchParams requirement)**

Modify `src/app/layout.tsx` — import and mount `QaBar` inside a `Suspense` boundary above `{children}`:
```tsx
import type { Metadata } from 'next'
import { Suspense } from 'react'
import '@fontsource-variable/inter'
import './globals.css'
import { QaBar } from '../components/qa/QaBar.tsx'

export const metadata: Metadata = { title: 'Captello Summit', description: 'Event intelligence demo site' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}><QaBar /></Suspense>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 5: Build & verify export parity**

Run:
```bash
cd /home/workl/leadliaison/dm1 && npx tsc --noEmit && npx next build
```
Expected: type-check clean; build succeeds. (`useSearchParams` without Suspense would fail the build — the Suspense boundary prevents that.)

- [ ] **Step 6: Manual export check**

Run:
```bash
cd /home/workl/leadliaison/dm1 && (npm run dev &) && sleep 6
curl -s "http://localhost:3000/api/export/cloudcon-2026" | node -e "const d=JSON.parse(require('fs').readFileSync(0));console.log('truth ind:',d.truth.individuals.length,'display ind:',d.display.individuals.length);"
kill %1 2>/dev/null
```
Expected: `truth ind: 50 display ind: 50`. (In-browser, clicking CSV/XLSX/JSON downloads files; verify the CSV header row equals the extension's labels.)

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(qa): QA bar with example switcher, ground-truth export (CSV/XLSX/JSON), toggle"
```

---

## Task 14: Final verification, no-real-faces audit, deploy config

**Files:**
- Create: `vercel.json` (only if needed), `.git-blame-ignore-revs` (optional)
- Modify: none expected

**Interfaces:**
- Consumes: the whole app.
- Produces: a verified, deployable build.

- [ ] **Step 1: Full type-check + build**

Run:
```bash
cd /home/workl/leadliaison/dm1 && npm run typecheck && npm run build
```
Expected: both succeed; generator reports ≥1000 individuals / ≥600 companies; `next build` completes.

- [ ] **Step 2: No-real-faces audit**

Run:
```bash
cd /home/workl/leadliaison/dm1
grep -rniE "unsplash|pravatar|thispersondoesnotexist|randomuser|gravatar|\.jpe?g|\.png|placeimg|i\.pravatar|photo(s)?\.|face" src/ | grep -viE "photoUrl|svg\+xml|favicon" || echo "AUDIT CLEAN: no external image/face references"
grep -rn "data:image/svg" src/lib/generate/avatar.ts >/dev/null && echo "avatars are SVG data URIs: OK"
```
Expected: `AUDIT CLEAN`; avatars SVG confirmed. If anything matches, replace it with a generated SVG.

- [ ] **Step 3: Responsive/dark spot-check (optional but recommended)**

Run `npm run dev`, then in the browser check `/attendees?example=captello-summit-2026` at 375px and 1440px widths, and add `class="dark"` to `<html>` via devtools to confirm dark tokens read. No horizontal scroll on mobile.

- [ ] **Step 4: Vercel deploy config (only if build needs it)**

Next 16 deploys to Vercel with zero config. Only create `vercel.json` if you must override the build command; otherwise skip. If created:
```json
{ "buildCommand": "npm run build", "framework": "nextjs" }
```

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: final verification + no-real-faces audit clean"
```

- [ ] **Step 6: Report to user (do NOT push)**

Summarize: build green, totals, 21 examples reachable, export parity confirmed, faces audit clean. Ask the user before `git push` and before any Vercel deploy (both are outward-facing actions).

---

## Self-Review

**1. Spec coverage** (design spec §1–§12 → task):
- §1 purpose/success criteria → all tasks; ≥1000/≥600 asserted in Task 7 Step 2 + Task 14 Step 1. ✓
- §2 stack → Task 0. ✓
- §3 theme port → Task 1. ✓
- §4 21 examples (4 axes) → Task 5 (configs) + Task 11 (layouts) + Task 6 (difficulty/scale). ✓
- §5 export contract → Task 3 (schema) + Task 9 (serializers). ✓
- §6 messify → Task 6 Step 5. ✓
- §7 no real faces → Task 4 + audit Task 14 Step 2. ✓
- §8 site structure/routes → Task 12. ✓
- §9 QA bar (toggle, export, switcher) → Task 13. ✓
- §10 module layout → File Structure + tasks match. ✓
- §11 testing → each task's test step + Task 14. ✓
- §12 open items: XLSX lib resolved (exceljs, Task 9); active-example = URL param (Task 8); avatars = inline data URIs (Task 4/10). ✓

**2. Placeholder scan:** Task 12 Steps 4–6 and Task 5 Step 2 (health/multi) describe "mirror the pattern / transcribe rows" rather than repeating full code. This is deliberate DRY for near-identical files, with an explicit implementer note and the exact source (design spec §4 table / the attendees files) to copy from — not a vague TODO. All *novel* code is shown in full. (Task 6 Step 2's earlier `nextIdPeek` stub was fixed inline — the loop now computes `id` once and reuses it; no post-paste correction needed.)

**3. Type consistency:** `Row<T>` (Task 8) consumed in Tasks 12–13. `ListLayoutProps` defined in `CardGrid.tsx` (Task 11) and reused across layouts + pages. `cellValue`/`toCsv`/`buildXlsxBuffer`/`downloadXlsx`/`triggerDownload` (Task 9) consumed in Task 13. `ExampleConfig`/`EXAMPLES`/`getExample` (Task 5) consumed in Tasks 6–8, 13. `resolveExampleId` (Task 8) used in Tasks 12–13. Field keys/labels (Task 3) match `IndividualRecord`/`CompanyRecord` (Task 2). Consistent. ✓

No open items — the one flagged defect (Task 6 `nextIdPeek`) is fixed in-plan.
