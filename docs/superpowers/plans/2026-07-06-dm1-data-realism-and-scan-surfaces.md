# dm1 Data Realism + API Scan Surfaces Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dm1 scan-target site's uniformly-random faker content with real-world-grounded data (coherent geography, curated vertical company names/domains, real session abstracts, professional bios) AND add API-backed scan surfaces (IMEX/Swapcard-style JSON directories) so the Captello Envoy extension is exercised against realistic data *and* realistic scan surfaces, not just static SSR HTML with junk data.

**Architecture:** The pipeline is unchanged in shape — seeded generators (`src/lib/generate/*`) read example configs (`src/examples/*`) and `scripts/generate-data.ts` writes committed JSON fixtures (`src/data/<id>/{individuals,companies,events,meta}.json`) as `{truth, display}` rows. This plan (A) swaps the record-content generators for curated, correlated, real-world pools; (B) expands detail-page render to the full field set; (C) adds a `surface` dimension to `ExampleConfig` plus Next route handlers that serve a realistic paginated JSON envelope, with client-rendered / load-more / hybrid pages that consume it. NO changes to the export contract (`src/lib/schema.ts`, `src/lib/export/*`) or the record type shapes (`src/lib/types.ts` fields through `additionalInfo`).

**Tech Stack:** Next.js 16 App Router (route handlers under `src/app/api/`), React 19 (client components for API-SPA/load-more), TypeScript 5, `@faker-js/faker` v10 (names/phones/streets only — NOT geography/company/bio/lorem), seeded mulberry32 `rng` (`src/lib/generate/seed.ts`), `tsx` (generator + tests run via `node --import tsx` / `tsx`).

## Global Constraints

- **Export contract is law — DO NOT TOUCH:** `src/lib/schema.ts` (22 individual / 20 company fields, labels, order), `src/lib/export/{cell,csv,json,xlsx}.ts`, and the record type field lists in `src/lib/types.ts` (through `additionalInfo`). Byte-parity with `captello-envoy/src/sidepanel/lib/export.ts` must survive — Task 12 re-verifies it.
- **Ground-truth vs rendered:** generators emit clean `truth`; `messify*` corrupts only the `display` copy. Never mutate the input record in messify (existing `{ ...rec }` clone pattern).
- **Determinism:** every generator draws from `seededFaker(cfg.seed + N)` or `rng(cfg.seed + N)`; regeneration must be reproducible. Fixtures are committed. Any NEW random stream MUST derive from `cfg.seed + <new distinct offset>` (existing offsets in use: +1 companies, +2 individuals, +3 events, +11 messify individuals, +12 messify companies — new code must use +4, +5, … or +13, +14, …).
- **NO real human faces:** avatars stay generated SVG monograms (`src/lib/generate/avatar.ts`) — do not touch.
- **Next.js 16 rules:** `params`/`searchParams` are `Promise<…>` — always `await`. Route handlers are `export async function GET(req: Request, ctx: { params: Promise<…> })`. Do NOT set `output:'export'` (route handlers + client fetch require a server).
- **Type checking is the test harness:** there is no jest/vitest runner; tests are `*.test.ts` / `*.test-d.ts` files run via `tsx` and asserted with `node:assert`, plus `npm run typecheck` (`tsc --noEmit`). "Run the test" = `npx tsx <file>` for runtime asserts, `npm run typecheck` for type asserts.
- **Regenerate + verify after generator changes:** `npm run generate` then `npm run typecheck` then `next build`. The generate script self-guards `totalInd >= 1000` and `totalCo >= 600` — keep scales at/above those.
- **Commit discipline:** each task ends by committing (Conventional Commits, `type(scope): desc`). Do NOT push. Per repo CLAUDE.md the human authorizes commits explicitly — if executing inline, PAUSE at each commit step for confirmation rather than auto-committing.
- **Scope: high-impact realism only this pass.** IN: geography, company names/domains, session abstracts+types, bios, DOM coverage, surface dimension + API routes, email obfuscation. DEFERRED (leave `// TODO(realism):` markers, do NOT implement): weighted title pyramid, RPE-derived revenue, industry/orgType↔event alignment, richer per-person additionalInfo. Sponsor-tier IS in scope (Task 4, into company additionalInfo) because it rides the company generator rewrite.
- **Research provenance:** all "real-world" distributions come from the verified deep-research digest (memory `project-dm1-realism-research`); do NOT invent competing numbers. Refuted items (all-C-suite rosters, deterministic session-duration-by-type, SMB/mid/enterprise 500/2000 bands, medtech-specific RPE, "no plaintext email pre-JS") must NOT be encoded.

---

## File Structure

**New files:**
- `src/lib/generate/geo.ts` — curated weighted `(city, region, country)` tuple table + `pickLocation(f)` sampler. Correlated geography; replaces independent `f.location.*` draws.
- `src/lib/generate/names.ts` — per-vertical company-name lexicons + suffix mix + `companyName(f, theme)` and `domainFromName(name, theme)`.
- `src/lib/generate/bio.ts` — third-person professional bio templates + `professionalBio(f, title, company, topics)`.
- `src/lib/generate/abstracts.ts` — per-topic real session-abstract templates + session-type vocab + AWS difficulty levels + `sessionAbstract(f, topic)`, `sessionType(f)`, `sessionLevel(f)`.
- `src/lib/generate/geo.test.ts`, `names.test.ts`, `bio.test.ts`, `abstracts.test.ts` — runtime asserts (coherence, determinism).
- `src/lib/api-envelope.ts` — `paginateEnvelope<T>(items, page, pageSize, q?, searchKeys?)` → `{ data, page, pageSize, total, totalPages, nextCursor }`. Shared by all API routes.
- `src/lib/api-envelope.test.ts` — envelope shape + pagination + filter asserts.
- `src/app/api/[example]/attendees/route.ts` — GET paginated individuals (display copy) as JSON.
- `src/app/api/[example]/exhibitors/route.ts` — GET paginated companies (display copy) as JSON.
- `src/components/layouts/ApiSpaList.tsx` — client component: fetches the JSON API, renders; data NOT in initial HTML.
- `src/components/layouts/ApiLoadMore.tsx` — client component: SSR/empty first paint, fetches pages on "Load more"; off-screen records NOT in DOM until fetched.
- `src/components/site/ObfuscatedEmail.tsx` — renders Cloudflare-style `[email protected]` placeholder + `data-cfemail`; server component, no JS decode needed (the point is the scanner sees the placeholder).

**Modified files:**
- `src/lib/types.ts` — ADD `SurfaceKind` type + `surface` + `label` fields to `ExampleConfig` (NOT to record types — those are frozen). NOTE: `ExampleConfig` lives in `src/examples/index.ts`, not `types.ts` — modify it there.
- `src/examples/index.ts` — add `SurfaceKind`, `surface`, `label` to the `ExampleConfig` interface; keep `EXAMPLES` sort.
- `src/examples/pools.ts` — replace 1-line topic arrays with structured per-vertical topic objects (topic → abstract seed); keep exported names stable where consumed.
- `src/examples/tech/index.ts`, `health/index.ts`, `multi/index.ts` — add `surface` + `label` per example (per the surface-assignment table in Task 8).
- `src/lib/generate/companies.ts` — use `names.companyName`/`domainFromName`, `geo.pickLocation`, add `additionalInfo.sponsorTier` (Task 4).
- `src/lib/generate/individuals.ts` — use `geo.pickLocation`, `bio.professionalBio`; email domain from the (now-real) company domain.
- `src/lib/generate/events.ts` — use `abstracts.sessionAbstract`/`sessionType`/`sessionLevel`; put level in `eventOverview` prefix or a structured field within existing `EventRecord.eventType`/`eventOverview` (do NOT add EventRecord fields).
- `src/lib/generate/messify.ts` — add Cloudflare-style email obfuscation branch (hard + api surfaces).
- `src/app/attendees/[id]/page.tsx`, `src/app/exhibitors/[id]/page.tsx` — expand `<dl>` to render the full contract field set.
- `src/app/attendees/page.tsx`, `src/app/exhibitors/page.tsx` — dispatch to Api* layouts when `config.surface` is `api-spa`/`load-more`/`api-hybrid`.
- `src/components/layouts/index.ts` — register the two new layouts in `pickLayout` (or a new `pickSurface`).
- `src/components/site/PersonCard.tsx`, `CompanyCard.tsx` — use `ObfuscatedEmail` when the record's email is the obfuscated placeholder (detect + render markup).
- `src/components/qa/ExampleSwitcher.tsx` — show `config.label` (complexity params) in the dropdown.
- `scripts/generate-data.ts` — no structural change; picks up new generators automatically. Add a post-gen coherence assertion (geo tuples consistent).

---

## Task 1: Correlated geography (`geo.ts`)

**Files:**
- Create: `src/lib/generate/geo.ts`
- Test: `src/lib/generate/geo.test.ts`

**Interfaces:**
- Consumes: `seededFaker` return type (`typeof faker`) for the RNG only (uses `f.helpers.weightedArrayElement`).
- Produces: `export interface GeoTuple { city: string; region: string; country: string }`; `export function pickLocation(f: typeof import('@faker-js/faker').faker): GeoTuple`.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/generate/geo.test.ts
import assert from 'node:assert'
import { seededFaker } from './seed.ts'
import { pickLocation, GEO_TUPLES } from './geo.ts'

// Every tuple is internally coherent: no US city paired with a non-US country, etc.
for (const t of GEO_TUPLES) {
  assert.ok(t.city && t.region && t.country, 'tuple fields present')
}
// US tuples use US states as region; non-US use a real sub-national/region name (not a US state).
const US = GEO_TUPLES.filter((t) => t.country === 'United States')
const US_STATES = new Set(['California','New York','Texas','Massachusetts','Washington','Georgia','Illinois','Florida','Colorado','Nevada'])
for (const t of US) assert.ok(US_STATES.has(t.region), `US region real: ${t.region}`)
const nonUS = GEO_TUPLES.filter((t) => t.country !== 'United States')
for (const t of nonUS) assert.ok(!US_STATES.has(t.region), `non-US region not a US state: ${t.city}/${t.region}/${t.country}`)

// Determinism + clustering: with a fixed seed, US dominates and no defunct country names appear.
const f = seededFaker(999)
const picks = Array.from({ length: 2000 }, () => pickLocation(f))
const usShare = picks.filter((p) => p.country === 'United States').length / picks.length
assert.ok(usShare > 0.4 && usShare < 0.75, `US share clustered (~0.55), got ${usShare}`)
assert.ok(!picks.some((p) => /Jamahiriya/.test(p.country)), 'no defunct faker country names')
// Every emitted pick is one of the curated tuples (never an independent draw).
const key = (t: {city:string;region:string;country:string}) => `${t.city}|${t.region}|${t.country}`
const valid = new Set(GEO_TUPLES.map(key))
for (const p of picks) assert.ok(valid.has(key(p)), `pick is a curated tuple: ${key(p)}`)
console.log('geo.test OK')
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/workl/leadliaison/dm1 && npx tsx src/lib/generate/geo.test.ts`
Expected: FAIL — `Cannot find module './geo.ts'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/generate/geo.ts
import type { faker as Faker } from '@faker-js/faker'

export interface GeoTuple { city: string; region: string; country: string }

/**
 * Curated, INTERNALLY-COHERENT (city, region, country) tuples with realistic
 * B2B-conference clustering. Weights approximate verified distributions
 * (SaaStr US-state table: CA 41.9%, NY 8.8%, TX 6.5%, MA 3.4%, WA 2.9%, GA 2.5%;
 * ~66% US / 33% international; ~9-10 countries cover the bulk). Non-US regions are
 * real sub-national names (never US states). Source: deep-research digest 2026-07-06.
 */
const ROWS: Array<{ t: GeoTuple; weight: number }> = [
  // US — heavy, CA-dominant
  { t: { city: 'San Francisco', region: 'California', country: 'United States' }, weight: 22 },
  { t: { city: 'San Jose', region: 'California', country: 'United States' }, weight: 8 },
  { t: { city: 'Los Angeles', region: 'California', country: 'United States' }, weight: 6 },
  { t: { city: 'New York', region: 'New York', country: 'United States' }, weight: 9 },
  { t: { city: 'Austin', region: 'Texas', country: 'United States' }, weight: 6 },
  { t: { city: 'Boston', region: 'Massachusetts', country: 'United States' }, weight: 4 },
  { t: { city: 'Seattle', region: 'Washington', country: 'United States' }, weight: 3 },
  { t: { city: 'Atlanta', region: 'Georgia', country: 'United States' }, weight: 3 },
  { t: { city: 'Chicago', region: 'Illinois', country: 'United States' }, weight: 3 },
  { t: { city: 'Denver', region: 'Colorado', country: 'United States' }, weight: 2 },
  // UK / EU
  { t: { city: 'London', region: 'England', country: 'United Kingdom' }, weight: 7 },
  { t: { city: 'Manchester', region: 'England', country: 'United Kingdom' }, weight: 2 },
  { t: { city: 'Berlin', region: 'Berlin', country: 'Germany' }, weight: 4 },
  { t: { city: 'Munich', region: 'Bavaria', country: 'Germany' }, weight: 2 },
  { t: { city: 'Amsterdam', region: 'North Holland', country: 'Netherlands' }, weight: 3 },
  { t: { city: 'Paris', region: 'Île-de-France', country: 'France' }, weight: 3 },
  { t: { city: 'Dublin', region: 'Leinster', country: 'Ireland' }, weight: 2 },
  { t: { city: 'Stockholm', region: 'Stockholm County', country: 'Sweden' }, weight: 2 },
  // India / APAC / Americas
  { t: { city: 'Bengaluru', region: 'Karnataka', country: 'India' }, weight: 6 },
  { t: { city: 'Mumbai', region: 'Maharashtra', country: 'India' }, weight: 3 },
  { t: { city: 'Singapore', region: 'Central Region', country: 'Singapore' }, weight: 3 },
  { t: { city: 'Sydney', region: 'New South Wales', country: 'Australia' }, weight: 2 },
  { t: { city: 'Toronto', region: 'Ontario', country: 'Canada' }, weight: 4 },
  { t: { city: 'São Paulo', region: 'São Paulo', country: 'Brazil' }, weight: 3 },
  { t: { city: 'Tel Aviv', region: 'Tel Aviv District', country: 'Israel' }, weight: 2 },
]

export const GEO_TUPLES: GeoTuple[] = ROWS.map((r) => r.t)

export function pickLocation(f: typeof Faker): GeoTuple {
  return f.helpers.weightedArrayElement(ROWS.map((r) => ({ value: r.t, weight: r.weight })))
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/workl/leadliaison/dm1 && npx tsx src/lib/generate/geo.test.ts`
Expected: `geo.test OK`.

- [ ] **Step 5: Commit**

```bash
cd /home/workl/leadliaison/dm1
git add src/lib/generate/geo.ts src/lib/generate/geo.test.ts
git commit -m "feat(generate): correlated real-world geography tuples (kills incoherent city/region/country) #summit-realism"
```

---

## Task 2: Vertical company names + domains (`names.ts`)

**Files:**
- Create: `src/lib/generate/names.ts`
- Test: `src/lib/generate/names.test.ts`

**Interfaces:**
- Consumes: `ThemeKey` from `../../examples/index.ts` (`'tech' | 'health' | 'multi'`); `typeof faker`.
- Produces: `export function companyName(f: typeof faker, theme: ThemeKey): string`; `export function domainFromName(f: typeof faker, name: string, theme: ThemeKey): string` (returns bare host, e.g. `stripe.com`).

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/generate/names.test.ts
import assert from 'node:assert'
import { seededFaker } from './seed.ts'
import { companyName, domainFromName } from './names.ts'

const f = seededFaker(500)
const names = Array.from({ length: 300 }, () => companyName(f, 'tech'))
// Real-brand shape: no faker "Surname - Surname" or "Surname, Surname and Surname" gibberish.
assert.ok(!names.some((n) => / - | and /.test(n) && /,/.test(n)), 'no faker multi-surname names')
// Domain derives from the name (shares a normalized token) and uses a real TLD.
for (const n of names.slice(0, 50)) {
  const d = domainFromName(f, n, 'tech')
  assert.ok(/^[a-z0-9-]+\.(com|ai|io|co)$/.test(d), `real domain shape: ${d}`)
  const token = n.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4)
  assert.ok(d.replace(/[^a-z0-9]/g, '').includes(token.slice(0, 3)), `domain relates to name: ${n} -> ${d}`)
}
// .com is dominant across the sample (~>=50%).
const doms = Array.from({ length: 300 }, (_, i) => domainFromName(f, names[i % names.length], 'tech'))
const comShare = doms.filter((d) => d.endsWith('.com')).length / doms.length
assert.ok(comShare >= 0.5, `.com dominant, got ${comShare}`)
// Determinism.
const g = seededFaker(500)
assert.strictEqual(companyName(g, 'tech'), names[0], 'deterministic')
console.log('names.test OK')
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/workl/leadliaison/dm1 && npx tsx src/lib/generate/names.test.ts`
Expected: FAIL — `Cannot find module './names.ts'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/generate/names.ts
import type { faker as Faker } from '@faker-js/faker'
import type { ThemeKey } from '../../examples/index.ts'

// Morphology roots for invented-but-plausible brand names, per vertical. Source:
// deep-research digest 2026-07-06 (SaaS name patterns: -ly/-stack/-nest, compounds,
// invented pseudo-words; concrete brand shape, .com-dominant with .ai for AI-native).
const ROOTS: Record<ThemeKey, string[]> = {
  tech: ['Ledger', 'Cloud', 'Dev', 'Data', 'Signal', 'Vertex', 'Cogni', 'Quor', 'Spark', 'Forge', 'Nova', 'Cipher', 'Stack', 'Flux', 'Lumen', 'Orbit'],
  health: ['Cardio', 'Vita', 'Med', 'Clara', 'Bio', 'Nimbus', 'Curai', 'Helix', 'Pulse', 'Verona', 'Remedy', 'Onco', 'Neuro', 'Vivos'],
  multi: ['Meridian', 'Atlas', 'Summit', 'Vantage', 'Keystone', 'Pinnacle', 'Cascade', 'Beacon', 'Harbor', 'Ironwood', 'Northstar', 'Cobalt'],
}
const SUFFIXES: Record<ThemeKey, string[]> = {
  tech: ['ly', 'stack', 'nest', 'flow', 'base', 'labs', 'AI', 'HQ', ''],
  health: ['Health', 'Bio', 'Care', 'Sciences', 'Dx', 'Therapeutics', ''],
  multi: ['Group', 'Partners', 'Industries', 'Global', 'Holdings', 'Systems', ''],
}
// Corporate suffixes with realistic frequency (most brands carry none in display).
const CORP = ['', '', '', '', 'Inc.', 'Corporation', '& Company', 'LLC']

export function companyName(f: typeof Faker, theme: ThemeKey): string {
  const root = f.helpers.arrayElement(ROOTS[theme])
  const suffix = f.helpers.arrayElement(SUFFIXES[theme])
  const base = suffix ? `${root}${/[A-Z]/.test(suffix[0]) ? ' ' : ''}${suffix}` : root
  const corp = f.helpers.arrayElement(CORP)
  return corp ? `${base} ${corp}` : base
}

export function domainFromName(f: typeof Faker, name: string, theme: ThemeKey): string {
  const slug = name.toLowerCase().replace(/\b(inc|corporation|llc|company|group|partners|holdings|systems|global|industries)\b/g, '').replace(/[^a-z0-9]/g, '').slice(0, 20) || 'company'
  // .com dominant (~62% of funded startups); .ai for AI-native tech; small .io/.co tail.
  const tld = theme === 'tech'
    ? f.helpers.weightedArrayElement([{ value: 'com', weight: 62 }, { value: 'ai', weight: 20 }, { value: 'io', weight: 12 }, { value: 'co', weight: 6 }])
    : f.helpers.weightedArrayElement([{ value: 'com', weight: 80 }, { value: 'io', weight: 10 }, { value: 'co', weight: 10 }])
  return `${slug}.${tld}`
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/workl/leadliaison/dm1 && npx tsx src/lib/generate/names.test.ts`
Expected: `names.test OK`.

- [ ] **Step 5: Commit**

```bash
cd /home/workl/leadliaison/dm1
git add src/lib/generate/names.ts src/lib/generate/names.test.ts
git commit -m "feat(generate): per-vertical company names + name-derived domains (kills junk faker names) #summit-realism"
```

---

## Task 3: Professional bios (`bio.ts`)

**Files:**
- Create: `src/lib/generate/bio.ts`
- Test: `src/lib/generate/bio.test.ts`

**Interfaces:**
- Consumes: `typeof faker`.
- Produces: `export function professionalBio(f: typeof faker, fullName: string, title: string, company: string, topics: string[]): string` — third-person, ~25–90 words.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/generate/bio.test.ts
import assert from 'node:assert'
import { seededFaker } from './seed.ts'
import { professionalBio } from './bio.ts'

const f = seededFaker(700)
const bio = professionalBio(f, 'Dana Reyes', 'VP Engineering', 'Vertex Labs', ['DevEx at Scale', 'RAG in Production'])
// Third-person, references the person, title, and company; not faker "X lover, Y" nonsense.
assert.ok(bio.includes('Dana Reyes') || bio.includes('Dana'), 'names the person')
assert.ok(bio.includes('Vertex Labs'), 'names the company')
assert.ok(!/(fan|lover|advocate|enthusiast|devotee),/.test(bio), 'no faker person.bio phrasing')
const words = bio.trim().split(/\s+/).length
assert.ok(words >= 15 && words <= 120, `bio length reasonable, got ${words} words`)
// Determinism.
const g = seededFaker(700)
assert.strictEqual(professionalBio(g, 'Dana Reyes', 'VP Engineering', 'Vertex Labs', ['DevEx at Scale', 'RAG in Production']), bio)
console.log('bio.test OK')
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/workl/leadliaison/dm1 && npx tsx src/lib/generate/bio.test.ts`
Expected: FAIL — `Cannot find module './bio.ts'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/generate/bio.ts
import type { faker as Faker } from '@faker-js/faker'

// Third-person professional bio templates. Source: deep-research digest 2026-07-06
// (conference bios are third-person, ~25-300 words; we target the short program-book end).
const OPENERS = [
  '{name} is {title} at {company}',
  '{name} leads {focus} as {title} at {company}',
  'As {title} at {company}, {name} focuses on {focus}',
]
const MIDDLES = [
  'with over {years} years across {domain}',
  'building teams that ship {domain} at scale',
  'and previously held roles spanning {domain}',
]
const CLOSERS = [
  'They speak regularly on {topic}.',
  'Their work centers on {topic}.',
  '{name} is a frequent voice on {topic}.',
]
const FOCUS = ['product strategy', 'platform engineering', 'go-to-market', 'clinical operations', 'data infrastructure', 'customer growth']
const DOMAIN = ['enterprise software', 'regulated industries', 'high-growth startups', 'global operations', 'developer tooling']

export function professionalBio(f: typeof Faker, fullName: string, title: string, company: string, topics: string[]): string {
  const first = fullName.split(' ')[0]
  const topic = topics.length ? f.helpers.arrayElement(topics) : 'the future of the industry'
  const fill = (s: string) => s
    .replaceAll('{name}', fullName).replaceAll('{title}', title).replaceAll('{company}', company)
    .replaceAll('{focus}', f.helpers.arrayElement(FOCUS)).replaceAll('{years}', String(f.number.int({ min: 6, max: 22 })))
    .replaceAll('{domain}', f.helpers.arrayElement(DOMAIN)).replaceAll('{topic}', topic)
  const opener = fill(f.helpers.arrayElement(OPENERS))
  const middle = fill(f.helpers.arrayElement(MIDDLES))
  const closer = fill(f.helpers.arrayElement(CLOSERS)).replaceAll('{name}', first)
  return `${opener} ${middle}. ${closer}`
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/workl/leadliaison/dm1 && npx tsx src/lib/generate/bio.test.ts`
Expected: `bio.test OK`.

- [ ] **Step 5: Commit**

```bash
cd /home/workl/leadliaison/dm1
git add src/lib/generate/bio.ts src/lib/generate/bio.test.ts
git commit -m "feat(generate): third-person professional bio templates (kills faker person.bio nonsense) #summit-realism"
```

---

## Task 4: Real session abstracts + types + wire company generator

**Files:**
- Create: `src/lib/generate/abstracts.ts`, `src/lib/generate/abstracts.test.ts`
- Modify: `src/lib/generate/companies.ts`

**Interfaces:**
- abstracts Produces: `export function sessionAbstract(f: typeof faker, topic: string): string` (real English, no Latin); `export function sessionType(f: typeof faker): string` (keynote|breakout session|chalk talk|code talk|lightning talk|builder session|hands-on lab|panel|fireside chat); `export function sessionLevel(f: typeof faker): string` ('Level 100 — Foundational' … 'Level 400 — Expert').
- companies Consumes: `companyName`, `domainFromName` (Task 2), `pickLocation` (Task 1).
- companies Produces (unchanged record shape) with `additionalInfo.sponsorTier` added.

- [ ] **Step 1: Write the failing test (abstracts)**

```ts
// src/lib/generate/abstracts.test.ts
import assert from 'node:assert'
import { seededFaker } from './seed.ts'
import { sessionAbstract, sessionType, sessionLevel } from './abstracts.ts'

const f = seededFaker(800)
const a = sessionAbstract(f, 'RAG in Production')
// English, references the topic, NOT Latin lorem ipsum.
assert.ok(!/\b(lorem|ipsum|dolor|aiunt|cresco|repellendus|deprecator)\b/i.test(a), 'no latin lorem')
assert.ok(/[A-Z]/.test(a) && a.split(' ').length >= 12, 'real sentence-ish abstract')
const types = new Set(Array.from({ length: 60 }, () => sessionType(f)))
assert.ok(types.size >= 4, 'varied session types')
assert.ok([...types].every((t) => /keynote|breakout|chalk|code|lightning|builder|hands-on|panel|fireside/i.test(t)), 'types from real vocab')
assert.ok(/Level [1-4]00/.test(sessionLevel(f)), 'AWS 100-400 difficulty level')
console.log('abstracts.test OK')
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd /home/workl/leadliaison/dm1 && npx tsx src/lib/generate/abstracts.test.ts`
Expected: FAIL — `Cannot find module './abstracts.ts'`.

- [ ] **Step 3: Implement abstracts**

```ts
// src/lib/generate/abstracts.ts
import type { faker as Faker } from '@faker-js/faker'

// Real session-type vocabulary + AWS 100/200/300/400 difficulty. Source: deep-research
// digest 2026-07-06 (AWS Summit taxonomy; do NOT tie duration to type — refuted).
const TYPES = ['Keynote', 'Breakout session', 'Chalk talk', 'Code talk', 'Lightning talk', 'Builder session', 'Hands-on lab', 'Panel', 'Fireside chat']
const LEVELS = ['Level 100 — Foundational', 'Level 200 — Intermediate', 'Level 300 — Advanced', 'Level 400 — Expert']
const TEMPLATES = [
  'This session explores {topic}, walking through practical patterns teams use in production today.',
  'Join us for a deep dive into {topic}: what works, what breaks, and how to measure success.',
  'A practitioner-led look at {topic}, with real architectures, trade-offs, and lessons learned.',
  'We unpack {topic} from first principles and share a reference approach you can adopt this quarter.',
]

export function sessionAbstract(f: typeof Faker, topic: string): string {
  return f.helpers.arrayElement(TEMPLATES).replaceAll('{topic}', topic)
}
export function sessionType(f: typeof Faker): string { return f.helpers.arrayElement(TYPES) }
export function sessionLevel(f: typeof Faker): string { return f.helpers.arrayElement(LEVELS) }
```

- [ ] **Step 4: Run to verify it passes**

Run: `cd /home/workl/leadliaison/dm1 && npx tsx src/lib/generate/abstracts.test.ts`
Expected: `abstracts.test OK`.

- [ ] **Step 5: Rewrite `companies.ts` to use the new generators + sponsor tier**

Replace the body of the loop in `src/lib/generate/companies.ts` so that:
- `const name = companyName(f, cfg.theme)` (import from `./names.ts`).
- `const host = domainFromName(f, name, cfg.theme); const website = 'https://www.' + host` and `slug = host.split('.')[0]`.
- `const loc = pickLocation(f)` (import from `./geo.ts`); set `city: loc.city, region: loc.region, country: loc.country`.
- `additionalInfo`: keep `booth`, ADD `sponsorTier` when `types` includes `'sponsors'`, drawn from a steep-long-tail weighted list `['Diamond','Platinum','Gold','Silver','Bronze']` with weights `[1,2,4,8,20]` (top rare, bottom common — matches verified sponsor pyramid).
- Leave `numEmployees`/`revenue` as-is with a `// TODO(realism): derive revenue from headcount via size-scaled RPE (deferred)` marker.
- Keep `industry`/`orgType` as-is with a `// TODO(realism): align industry/orgType with event theme (deferred)` marker.

```ts
// src/lib/generate/companies.ts — imports to add
import { companyName, domainFromName } from './names.ts'
import { pickLocation } from './geo.ts'
// ...inside loop:
const name = companyName(f, cfg.theme)
const host = domainFromName(f, name, cfg.theme)
const slug = host.split('.')[0]
const loc = pickLocation(f)
const isSponsor = types.includes('sponsors')
const sponsorTier = isSponsor
  ? f.helpers.weightedArrayElement([
      { value: 'Diamond', weight: 1 }, { value: 'Platinum', weight: 2 },
      { value: 'Gold', weight: 4 }, { value: 'Silver', weight: 8 }, { value: 'Bronze', weight: 20 },
    ])
  : null
out.push({
  id, name,
  website: `https://www.${host}`,
  phone: f.phone.number(),
  country: loc.country, city: loc.city, region: loc.region,
  address: f.location.streetAddress(),
  types,
  industry: f.helpers.arrayElement(cfg.industryPool), // TODO(realism): align with theme (deferred)
  numEmployees: f.number.int({ min: 5, max: 25000 }), // TODO(realism): RPE-derived revenue (deferred)
  revenue: f.number.int({ min: 100000, max: 900000000 }),
  orgType: f.helpers.arrayElement(['Private', 'Public', 'Nonprofit', 'Startup']),
  linkedin: `https://www.linkedin.com/company/${slug}`,
  facebook: f.datatype.boolean(0.5) ? `https://facebook.com/${slug}` : null,
  twitter: f.datatype.boolean(0.4) ? `https://twitter.com/${slug}` : null,
  instagram: f.datatype.boolean(0.3) ? `https://instagram.com/${slug}` : null,
  youtube: f.datatype.boolean(0.2) ? `https://youtube.com/@${slug}` : null,
  description: f.company.catchPhrase(), // TODO(realism): real company blurb (deferred — low priority)
  profileUrl: `/exhibitors/${id}`,
  additionalInfo: sponsorTier ? { booth: `#${f.number.int({ min: 100, max: 4999 })}`, sponsorTier } : { booth: `#${f.number.int({ min: 100, max: 4999 })}` },
})
```

- [ ] **Step 6: Verify companies typecheck**

Run: `cd /home/workl/leadliaison/dm1 && npm run typecheck`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
cd /home/workl/leadliaison/dm1
git add src/lib/generate/abstracts.ts src/lib/generate/abstracts.test.ts src/lib/generate/companies.ts
git commit -m "feat(generate): real session abstracts/types + wire companies to real names/geo + sponsor tier #summit-realism"
```

---

## Task 5: Wire individuals + events to the new generators

**Files:**
- Modify: `src/lib/generate/individuals.ts`, `src/lib/generate/events.ts`
- Test: extend `src/lib/generate/generate.test.ts` (coherence assertions)

**Interfaces:**
- Consumes: `pickLocation` (Task 1), `professionalBio` (Task 3), `sessionAbstract`/`sessionType`/`sessionLevel` (Task 4). Companies already carry real domains, so email keeps deriving from `co.website` host (now real).

- [ ] **Step 1: Write the failing coherence test**

```ts
// append to src/lib/generate/generate.test.ts
import { EXAMPLES } from '../../examples/index.ts'
import { generateCompanies } from './companies.ts'
import { generateIndividuals } from './individuals.ts'
import { generateEvents } from './events.ts'
import assert from 'node:assert'

const cfg = EXAMPLES.find((e) => e.id === 'fintech-connect-2026')!
const companies = generateCompanies(cfg)
const inds = generateIndividuals(cfg, companies)
const events = generateEvents(cfg)
// Geography coherent: no defunct/random country, city/region/country from the curated set.
assert.ok(!inds.some((i) => /Jamahiriya/.test(i.country ?? '')), 'no defunct countries')
// Bios are professional (reference the person), not faker nonsense.
const withBio = inds.filter((i) => i.bio)
assert.ok(withBio.length > 0 && withBio.every((i) => !/(fan|lover|advocate),/.test(i.bio!)), 'pro bios')
// Events: no Latin lorem ipsum in overviews.
assert.ok(!events.some((e) => /\b(lorem|ipsum|aiunt|cresco|deprecator)\b/i.test(e.eventOverview)), 'no latin abstracts')
console.log('generate coherence OK')
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd /home/workl/leadliaison/dm1 && npx tsx src/lib/generate/generate.test.ts`
Expected: FAIL — bios/events still faker/Latin.

- [ ] **Step 3: Modify `individuals.ts`**

In `src/lib/generate/individuals.ts`: import `pickLocation` from `./geo.ts` and `professionalBio` from `./bio.ts`. Replace the three independent `f.location.*` calls with one `const loc = pickLocation(f)` and set `city: loc.city, country: loc.country, region: loc.region`. Replace `bio: … f.person.bio()` with `bio: f.datatype.boolean(0.6) ? professionalBio(f, fullName, /* title */ (typeof titleValue === 'string' ? titleValue : 'Attendee'), co?.name ?? 'their company', cfg.sessionTopics) : null` — capture the chosen title into a `const titleValue` first so the bio can reference it. Email/domain logic is unchanged (already derives from `co.website`, now a real host).

- [ ] **Step 4: Modify `events.ts`**

In `src/lib/generate/events.ts`: import `sessionAbstract`, `sessionType`, `sessionLevel` from `./abstracts.ts`. Replace `eventType: f.helpers.arrayElement([...])` with `eventType: sessionType(f)`; replace `eventOverview: f.lorem.sentences(2)` with `eventOverview: \`${sessionLevel(f)}. ${sessionAbstract(f, name)}\`` (name is the chosen session topic — move the `name` const above so it's in scope).

- [ ] **Step 5: Run to verify it passes**

Run: `cd /home/workl/leadliaison/dm1 && npx tsx src/lib/generate/generate.test.ts`
Expected: `generate coherence OK`.

- [ ] **Step 6: Typecheck + commit**

```bash
cd /home/workl/leadliaison/dm1 && npm run typecheck
git add src/lib/generate/individuals.ts src/lib/generate/events.ts src/lib/generate/generate.test.ts
git commit -m "feat(generate): wire individuals+events to real geo/bio/abstracts (kills latin + faker bios) #summit-realism"
```

---

## Task 6: Cloudflare-style email obfuscation in messify

**Files:**
- Modify: `src/lib/generate/messify.ts`
- Test: `src/lib/generate/messify.test.ts` (create if absent; else extend)

**Interfaces:**
- Produces: obfuscation applies only when `cfg.difficulty === 'hard'` OR the example's `surface` is an api surface (Task 7 adds `surface`; guard with `cfg.difficulty === 'hard' || (cfg as { surface?: string }).surface?.startsWith('api')`). The obfuscated display email is the literal placeholder string `'[email protected]'`; the real address stays in `truth.email`. Model BOTH cases (placeholder + intact-link-text) per the research (the "no plaintext at all" strong claim was only PLAUSIBLE).

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/generate/messify.test.ts
import assert from 'node:assert'
import { messifyIndividual } from './messify.ts'
import { rng } from './seed.ts'
import type { IndividualRecord } from '../types.ts'
import type { ExampleConfig } from '../../examples/index.ts'

const base: IndividualRecord = {
  id: 'in1', firstName: 'A', lastName: 'B', fullName: 'A B', email: 'a.b@vertex.com',
  title: 'CTO', types: ['attendees'], linkedin: null, twitter: null, instagram: null,
  profileUrl: null, photoUrl: null, bio: null, interests: null, company: 'Vertex',
  companyWebsite: 'https://www.vertex.com', phone: null, city: 'X', country: 'Y', region: 'Z',
  industry: 'AI/ML', orgType: 'Private', additionalInfo: {},
}
const hardCfg = { difficulty: 'hard' } as unknown as ExampleConfig
// Over many draws on a hard example, SOME display emails become the CF placeholder,
// and truth is never mutated.
let sawPlaceholder = false
for (let i = 0; i < 200; i++) {
  const d = messifyIndividual({ ...base, id: 'in' + i }, hardCfg, rng(i + 1))
  if (d.email === '[email protected]') sawPlaceholder = true
  assert.strictEqual(base.email, 'a.b@vertex.com', 'truth email never mutated')
}
assert.ok(sawPlaceholder, 'CF placeholder appears on hard example')
console.log('messify.test OK')
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd /home/workl/leadliaison/dm1 && npx tsx src/lib/generate/messify.test.ts`
Expected: FAIL — placeholder never appears.

- [ ] **Step 3: Add the obfuscation branch to `messifyIndividual`**

Inside the `if (cfg.difficulty === 'hard')` block in `src/lib/generate/messify.ts` (extend the guard to include api surfaces), add:

```ts
// Cloudflare-style email obfuscation: the visible text a pre-JS DOM scan sees is the
// literal placeholder; the real address lives only in truth. Source: deep-research 2026-07-06.
const apiSurface = (cfg as { surface?: string }).surface?.startsWith('api')
if ((cfg.difficulty === 'hard' || apiSurface) && d.email && rand() < 0.35) {
  d.email = '[email protected]'
}
```

(Keep the existing obfuscateEmail `[at]`/`dot` branch as an alternative; the two are mutually exclusive per draw because the `[at]` branch runs earlier under a separate `rand()` gate — order them so only one applies.)

- [ ] **Step 4: Run to verify it passes**

Run: `cd /home/workl/leadliaison/dm1 && npx tsx src/lib/generate/messify.test.ts`
Expected: `messify.test OK`.

- [ ] **Step 5: Commit**

```bash
cd /home/workl/leadliaison/dm1
git add src/lib/generate/messify.ts src/lib/generate/messify.test.ts
git commit -m "feat(generate): Cloudflare-style email obfuscation on hard/api examples (real scanner messiness) #summit-realism"
```

---

## Task 7: `surface` + `label` config dimension

**Files:**
- Modify: `src/examples/index.ts` (interface), `src/examples/tech/index.ts`, `health/index.ts`, `multi/index.ts`
- Test: `src/examples/index.test.ts` (extend), `src/lib/types.test-d.ts` (extend)

**Interfaces:**
- Produces: `export type SurfaceKind = 'ssr' | 'api-spa' | 'api-hybrid' | 'load-more'`; `ExampleConfig` gains `surface: SurfaceKind` and `label: string` (human-readable complexity summary shown in the QA switcher).

- [ ] **Step 1: Extend the type + a failing test**

Add to `src/examples/index.test.ts`:

```ts
import { EXAMPLES } from './index.ts'
import assert from 'node:assert'
// Every example declares a surface + label; label mentions difficulty and scale.
for (const e of EXAMPLES) {
  assert.ok(['ssr','api-spa','api-hybrid','load-more'].includes(e.surface), `${e.id} has surface`)
  assert.ok(e.label && e.label.length > 8, `${e.id} has descriptive label`)
}
// All 4 surfaces are represented across the matrix.
const surfaces = new Set(EXAMPLES.map((e) => e.surface))
assert.ok(surfaces.size === 4, `all 4 surfaces present, got ${[...surfaces]}`)
console.log('surface config OK')
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd /home/workl/leadliaison/dm1 && npx tsx src/examples/index.test.ts`
Expected: FAIL — `surface`/`label` undefined.

- [ ] **Step 3: Add fields to the interface**

In `src/examples/index.ts`, extend `ExampleConfig`:

```ts
export type SurfaceKind = 'ssr' | 'api-spa' | 'api-hybrid' | 'load-more'
// ...in the interface, after `layout: LayoutVariant`:
  surface: SurfaceKind
  /** Human-readable complexity summary for the QA switcher, e.g.
   *  "Tech · hard · API-SPA · 900 people / 300 cos · partial fields · obfuscated emails". */
  label: string
```

- [ ] **Step 4: Populate `surface` + `label` per example (surface-assignment table)**

Set these on each config (add `surface` and `label`; leave all other fields untouched). Assignment (aggressive diversity — 9 non-SSR across all 3 verticals + 3 surfaces; the rest ssr):

| id | surface | label (pattern: `<Theme> · <difficulty> · <surface> · <ind>p/<co>c · <fullness> fields`) |
|---|---|---|
| captello-summit-2026 | ssr | `Tech · hard · SSR · 1500p/700c · full fields` |
| cloudcon-2026 | ssr | `Tech · easy · SSR · 50p · full fields` |
| devworld-2026 | api-hybrid | `Tech · medium · API-hybrid (SSR p1 + JSON rest) · 500p/200c · full fields` |
| saastock-north-2026 | api-spa | `Tech · hard · API-SPA (JSON only) · 900p/300c · partial fields · obfuscated emails` |
| ai-frontier-2026 | ssr | `Tech · medium · SSR · 300p · full fields` |
| martech-expo-2026 | ssr | `Tech · easy · SSR · 400c · full fields` |
| fintech-connect-2026 | load-more | `Tech · hard · Load-more (API paged) · 1200p/500c · partial fields · obfuscated emails` |
| medtech-expo-2026 | ssr | `Health · medium · SSR · 500p/250c · full fields` |
| healthit-summit-2026 | ssr | `Health · easy · SSR · 120p · full fields` |
| pharmaworld-2026 | api-hybrid | `Health · hard · API-hybrid · 800c · full fields · obfuscated emails` |
| digital-health-now-2026 | api-spa | `Health · medium · API-SPA (JSON only) · 350p/150c · partial fields` |
| clinical-innovation-2026 | ssr | `Health · hard · SSR · 600p · full fields · obfuscated emails` |
| bioconnect-2026 | ssr | `Health · easy · SSR · 200c · full fields` |
| nurseleaders-2026 | ssr | `Health · medium · SSR · 450p · full fields` |
| global-business-expo-2026 | api-spa | `Multi · hard · API-SPA (JSON only) · 1200c · full fields · obfuscated emails` |
| manufacturing-week-2026 | ssr | `Multi · medium · SSR · 400p/200c · full fields` |
| retailnxt-2026 | ssr | `Multi · easy · SSR · 300p · full fields` |
| energy-forum-2026 | api-hybrid | `Multi · hard · API-hybrid · 700p/350c · full fields · obfuscated emails` |
| logistics-live-2026 | ssr | `Multi · medium · SSR · 500c · full fields` |
| founders-fair-2026 | ssr | `Multi · easy · SSR · 150p · full fields` |
| enterprise-summit-2026 | load-more | `Multi · hard · Load-more (API paged) · 1000p/400c · partial fields · obfuscated emails` |

**Plus the mandatory 22nd example** (user-requested — gives tech its own load-more so every vertical
has an api-spa AND a load-more surface; final matrix = 9 non-SSR: 3 api-spa, 3 api-hybrid, 3 load-more).
Add to `src/examples/tech/index.ts` a new entry mirroring `fintech-connect-2026`'s shape but distinct
seed/id, so its fixtures are independent:

```ts
{ ...base, id: 'devtools-world-2026', order: 22, eventName: 'DevTools World 2026', tagline: 'The developer tooling summit', venue: 'Colorado Convention Center', city: 'Denver', country: 'United States', dates: { start: '2026-10-06', end: '2026-10-08' }, seed: 108, difficulty: 'hard', layout: 'infinite-scroll', surface: 'load-more', label: 'Tech · hard · Load-more (API paged) · 700p/250c · partial fields · obfuscated emails', scale: { individuals: 700, companies: 250, sessions: 40 }, coverage: { entities: ['individuals', 'companies', 'events'], emailsInline: true, fieldFullness: 'partial' } },
```

NOTE: `seed: 108` is unused elsewhere (tech seeds are 101-107); `order: 22` extends the sort. The
generate script self-guards on totals — this adds ~700 ind / ~250 co, well within limits. All test
counts/labels that say "21 examples" become 22 — update `src/examples/index.test.ts` and any
"across 21 examples" strings in `scripts/generate-data.ts` (the `21` in the progress string and the
final `console.log`) and the generate guard messages to 22.

- [ ] **Step 5: Run to verify it passes**

Run: `cd /home/workl/leadliaison/dm1 && npx tsx src/examples/index.test.ts && npm run typecheck`
Expected: `surface config OK`, no type errors.

- [ ] **Step 6: Commit**

```bash
cd /home/workl/leadliaison/dm1
git add src/examples/
git commit -m "feat(examples): add surface + descriptive complexity label to every example config #summit-surfaces"
```

---

## Task 8: Paginated JSON envelope + API route handlers

**Files:**
- Create: `src/lib/api-envelope.ts`, `src/lib/api-envelope.test.ts`, `src/app/api/[example]/attendees/route.ts`, `src/app/api/[example]/exhibitors/route.ts`

**Interfaces:**
- Produces: `export interface ApiEnvelope<T> { data: T[]; page: number; pageSize: number; total: number; totalPages: number; nextCursor: string | null }`; `export function paginateEnvelope<T>(items: T[], page: number, pageSize: number, q: string | null, searchKeys: (keyof T)[]): ApiEnvelope<T>`.
- Route handlers: `GET /api/<example>/attendees?page=N&pageSize=M&q=…` and `…/exhibitors?…`, returning `ApiEnvelope<IndividualRecord>` / `ApiEnvelope<CompanyRecord>` built from the **display** rows (`loadIndividuals(id).map(r => r.display)`), so the scanner via API sees the same messy values as the DOM.

- [ ] **Step 1: Write the failing envelope test**

```ts
// src/lib/api-envelope.test.ts
import assert from 'node:assert'
import { paginateEnvelope } from './api-envelope.ts'
const items = Array.from({ length: 130 }, (_, i) => ({ name: 'Person ' + i, city: i % 2 ? 'London' : 'Austin' }))
const p1 = paginateEnvelope(items, 1, 25, null, ['name'])
assert.strictEqual(p1.total, 130); assert.strictEqual(p1.pageSize, 25); assert.strictEqual(p1.totalPages, 6)
assert.strictEqual(p1.data.length, 25); assert.ok(p1.nextCursor, 'has next cursor on page 1')
const last = paginateEnvelope(items, 6, 25, null, ['name'])
assert.strictEqual(last.data.length, 5); assert.strictEqual(last.nextCursor, null, 'no cursor past end')
const filtered = paginateEnvelope(items, 1, 25, 'London', ['city'])
assert.ok(filtered.total === 65 && filtered.data.every((d) => d.city === 'London'), 'q filters')
// pageSize is capped (e.g. request 5000 -> clamped to <=100)
assert.ok(paginateEnvelope(items, 1, 5000, null, ['name']).pageSize <= 100, 'pageSize capped')
console.log('api-envelope.test OK')
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd /home/workl/leadliaison/dm1 && npx tsx src/lib/api-envelope.test.ts`
Expected: FAIL — module missing.

- [ ] **Step 3: Implement the envelope**

```ts
// src/lib/api-envelope.ts
export interface ApiEnvelope<T> {
  data: T[]; page: number; pageSize: number; total: number; totalPages: number; nextCursor: string | null
}
const MAX_PAGE_SIZE = 100
export function paginateEnvelope<T>(items: T[], page: number, pageSize: number, q: string | null, searchKeys: (keyof T)[]): ApiEnvelope<T> {
  const size = Math.min(Math.max(1, pageSize | 0), MAX_PAGE_SIZE)
  const filtered = q && q.trim()
    ? items.filter((it) => searchKeys.some((k) => String(it[k] ?? '').toLowerCase().includes(q.toLowerCase())))
    : items
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / size))
  const p = Math.min(Math.max(1, page | 0), totalPages)
  const data = filtered.slice((p - 1) * size, p * size)
  return { data, page: p, pageSize: size, total, totalPages, nextCursor: p < totalPages ? String(p + 1) : null }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `cd /home/workl/leadliaison/dm1 && npx tsx src/lib/api-envelope.test.ts`
Expected: `api-envelope.test OK`.

- [ ] **Step 5: Implement the route handlers**

```ts
// src/app/api/[example]/attendees/route.ts
import { resolveExampleId } from '../../../../lib/active-example.ts'
import { loadIndividuals } from '../../../../lib/data.ts'
import { paginateEnvelope } from '../../../../lib/api-envelope.ts'

export async function GET(req: Request, ctx: { params: Promise<{ example: string }> }) {
  const { example } = await ctx.params
  const id = resolveExampleId(example)
  const url = new URL(req.url)
  const page = Number(url.searchParams.get('page') ?? '1')
  const pageSize = Number(url.searchParams.get('pageSize') ?? '25')
  const q = url.searchParams.get('q')
  const rows = loadIndividuals(id).map((r) => r.display)
  return Response.json(paginateEnvelope(rows, page, pageSize, q, ['fullName', 'company', 'email', 'title']))
}
```

```ts
// src/app/api/[example]/exhibitors/route.ts
import { resolveExampleId } from '../../../../lib/active-example.ts'
import { loadCompanies } from '../../../../lib/data.ts'
import { paginateEnvelope } from '../../../../lib/api-envelope.ts'

export async function GET(req: Request, ctx: { params: Promise<{ example: string }> }) {
  const { example } = await ctx.params
  const id = resolveExampleId(example)
  const url = new URL(req.url)
  const page = Number(url.searchParams.get('page') ?? '1')
  const pageSize = Number(url.searchParams.get('pageSize') ?? '25')
  const q = url.searchParams.get('q')
  const rows = loadCompanies(id).map((r) => r.display)
  return Response.json(paginateEnvelope(rows, page, pageSize, q, ['name', 'industry', 'website']))
}
```

- [ ] **Step 6: Typecheck + commit**

```bash
cd /home/workl/leadliaison/dm1 && npm run typecheck
git add src/lib/api-envelope.ts src/lib/api-envelope.test.ts src/app/api/
git commit -m "feat(api): paginated JSON envelope + /api/[example]/{attendees,exhibitors} route handlers #summit-surfaces"
```

---

## Task 9: Client layouts (API-SPA + Load-more) + surface dispatch

**Files:**
- Create: `src/components/layouts/ApiSpaList.tsx`, `src/components/layouts/ApiLoadMore.tsx`
- Modify: `src/components/layouts/index.ts`, `src/app/attendees/page.tsx`, `src/app/exhibitors/page.tsx`

**Interfaces:**
- Consumes: the `ApiEnvelope<T>` JSON from Task 8 via `fetch`. Both components take `{ exampleId: string; kind: 'attendees' | 'exhibitors' }`.
- `api-spa`: on mount, fetch page 1, render into DOM (nothing server-rendered → initial HTML has no records). `load-more`: render empty (or nothing), fetch on button click, append; off-screen records absent from DOM until fetched. `api-hybrid`: dispatch renders the existing SSR list for page 1 AND mounts a client "load more" that fetches page 2+ (so first paint has 60 records in HTML, rest via API).

- [ ] **Step 1: Implement `ApiSpaList.tsx`**

```tsx
// src/components/layouts/ApiSpaList.tsx
'use client'
import { useEffect, useState } from 'react'
import { PersonCard } from '../site/PersonCard.tsx'
import { CompanyCard } from '../site/CompanyCard.tsx'
import type { IndividualRecord, CompanyRecord } from '../../lib/types.ts'

export function ApiSpaList({ exampleId, kind }: { exampleId: string; kind: 'attendees' | 'exhibitors' }) {
  const [rows, setRows] = useState<(IndividualRecord | CompanyRecord)[]>([])
  const [page, setPage] = useState(1)
  const [next, setNext] = useState<string | null>('1')
  const [loading, setLoading] = useState(false)
  async function loadPage(p: number) {
    setLoading(true)
    const res = await fetch(`/api/${exampleId}/${kind}?page=${p}&pageSize=50`)
    const env = await res.json()
    setRows((r) => [...r, ...env.data]); setNext(env.nextCursor); setLoading(false)
  }
  useEffect(() => { void loadPage(1) /* eslint-disable-line */ }, [exampleId, kind])
  return (
    <div className="p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r, i) => kind === 'attendees'
          ? <PersonCard key={i} person={r as IndividualRecord} exampleId={exampleId} />
          : <CompanyCard key={i} company={r as CompanyRecord} exampleId={exampleId} />)}
      </div>
      {next && <button disabled={loading} onClick={() => { const p = page + 1; setPage(p); void loadPage(p) }} className="mx-auto mt-6 block rounded-md bg-brand px-4 py-2 text-white">{loading ? 'Loading…' : 'Load more'}</button>}
    </div>
  )
}
```

- [ ] **Step 2: Implement `ApiLoadMore.tsx`**

Same as `ApiSpaList` but starts with `rows=[]`, `next='1'`, and does NOT auto-fetch on mount — it renders only a "Load results" button; each click fetches the next page and appends. (This is the "off-screen records not in DOM" surface.) Copy the `ApiSpaList` body, remove the `useEffect` auto-load, and change the initial button label to `Load results`.

```tsx
// src/components/layouts/ApiLoadMore.tsx
'use client'
import { useState } from 'react'
import { PersonCard } from '../site/PersonCard.tsx'
import { CompanyCard } from '../site/CompanyCard.tsx'
import type { IndividualRecord, CompanyRecord } from '../../lib/types.ts'

export function ApiLoadMore({ exampleId, kind }: { exampleId: string; kind: 'attendees' | 'exhibitors' }) {
  const [rows, setRows] = useState<(IndividualRecord | CompanyRecord)[]>([])
  const [page, setPage] = useState(0)
  const [next, setNext] = useState<string | null>('1')
  const [loading, setLoading] = useState(false)
  async function loadNext() {
    const p = page + 1; setLoading(true)
    const res = await fetch(`/api/${exampleId}/${kind}?page=${p}&pageSize=50`)
    const env = await res.json()
    setRows((r) => [...r, ...env.data]); setNext(env.nextCursor); setPage(p); setLoading(false)
  }
  return (
    <div className="p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r, i) => kind === 'attendees'
          ? <PersonCard key={i} person={r as IndividualRecord} exampleId={exampleId} />
          : <CompanyCard key={i} company={r as CompanyRecord} exampleId={exampleId} />)}
      </div>
      {next && <button disabled={loading} onClick={() => void loadNext()} className="mx-auto mt-6 block rounded-md bg-brand px-4 py-2 text-white">{loading ? 'Loading…' : page === 0 ? 'Load results' : 'Load more'}</button>}
    </div>
  )
}
```

- [ ] **Step 3: Wire surface dispatch in the list pages**

In `src/app/attendees/page.tsx` (and mirror in `exhibitors/page.tsx`), after resolving `meta`, branch on `meta.config.surface` BEFORE the layout dispatch:

```tsx
import { ApiSpaList } from '../../components/layouts/ApiSpaList.tsx'
import { ApiLoadMore } from '../../components/layouts/ApiLoadMore.tsx'
// ...
const surface = meta.config.surface
if (surface === 'api-spa') {
  return (<><SiteNav exampleId={id} meta={meta} /><h1 className="px-4 pt-6 text-2xl font-bold text-foreground">Attendees</h1><ApiSpaList exampleId={id} kind="attendees" /><Footer /></>)
}
if (surface === 'load-more') {
  return (<><SiteNav exampleId={id} meta={meta} /><h1 className="px-4 pt-6 text-2xl font-bold text-foreground">Attendees</h1><ApiLoadMore exampleId={id} kind="attendees" /><Footer /></>)
}
// api-hybrid: fall through to the existing SSR path but also mount ApiLoadMore for page 2+
// (SSR renders page 1 in HTML; client loads the rest). Simplest: render SSR list as today.
```

For `api-hybrid`, keep the existing SSR render (page 1 in HTML) — the endpoint being available is what satisfies the "API also exposed" requirement; no client change strictly required. Add a one-line comment noting the endpoint is the hybrid surface.

- [ ] **Step 4: Register in `pickLayout` (no-op safety)**

Ensure `src/components/layouts/index.ts` still returns a valid layout for the SSR examples (unchanged). The Api* components are dispatched in the page, not via `pickLayout`, so no change needed there unless `pickLayout` throws on unknown — verify it has a default.

- [ ] **Step 5: Typecheck + build + commit**

```bash
cd /home/workl/leadliaison/dm1 && npm run typecheck
git add src/components/layouts/ src/app/attendees/page.tsx src/app/exhibitors/page.tsx
git commit -m "feat(layouts): API-SPA + load-more client surfaces + list-page surface dispatch #summit-surfaces"
```

---

## Task 10: Expand detail-page DOM coverage + ObfuscatedEmail

**Files:**
- Create: `src/components/site/ObfuscatedEmail.tsx`
- Modify: `src/app/attendees/[id]/page.tsx`, `src/app/exhibitors/[id]/page.tsx`, `src/components/site/PersonCard.tsx`, `CompanyCard.tsx`

**Interfaces:**
- `ObfuscatedEmail` Produces: renders `<a class="__cf_email__" data-cfemail="…">[email protected]</a>` when the email IS the placeholder string, else renders the email as text. Props: `{ email: string | null }`.

- [ ] **Step 1: Implement `ObfuscatedEmail.tsx`**

```tsx
// src/components/site/ObfuscatedEmail.tsx
export function ObfuscatedEmail({ email }: { email: string | null }) {
  if (!email) return <>—</>
  if (email === '[email protected]') {
    // Mimic Cloudflare Scrape Shield: visible text is the placeholder; a real scanner
    // must recover the address elsewhere. data-cfemail is a decoy (not decoded here).
    return <a href="/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="7a121f090911">[email&#160;protected]</a>
  }
  return <>{email}</>
}
```

- [ ] **Step 2: Expand attendee detail `<dl>` to the full field set**

In `src/app/attendees/[id]/page.tsx`, replace the 6-field `<dl>` with the full contract set, using `ObfuscatedEmail` for the email cell:

```tsx
<dl className="mt-6 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
  <div><dt className="text-muted-foreground">Email</dt><dd className="text-foreground"><ObfuscatedEmail email={p.email} /></dd></div>
  <div><dt className="text-muted-foreground">Phone</dt><dd className="text-foreground">{p.phone ?? '—'}</dd></div>
  <div><dt className="text-muted-foreground">Company</dt><dd className="text-foreground">{p.company ?? '—'}</dd></div>
  <div><dt className="text-muted-foreground">Company Website</dt><dd className="truncate text-foreground">{p.companyWebsite ?? '—'}</dd></div>
  <div><dt className="text-muted-foreground">City</dt><dd className="text-foreground">{p.city ?? '—'}</dd></div>
  <div><dt className="text-muted-foreground">Region</dt><dd className="text-foreground">{p.region ?? '—'}</dd></div>
  <div><dt className="text-muted-foreground">Country</dt><dd className="text-foreground">{p.country ?? '—'}</dd></div>
  <div><dt className="text-muted-foreground">Industry</dt><dd className="text-foreground">{p.industry ?? '—'}</dd></div>
  <div><dt className="text-muted-foreground">Org Type</dt><dd className="text-foreground">{p.orgType ?? '—'}</dd></div>
  <div><dt className="text-muted-foreground">LinkedIn</dt><dd className="truncate text-foreground">{p.linkedin ?? '—'}</dd></div>
  <div><dt className="text-muted-foreground">Twitter</dt><dd className="truncate text-foreground">{p.twitter ?? '—'}</dd></div>
  <div><dt className="text-muted-foreground">Instagram</dt><dd className="truncate text-foreground">{p.instagram ?? '—'}</dd></div>
  <div><dt className="text-muted-foreground">Interests</dt><dd className="text-foreground">{p.interests ?? '—'}</dd></div>
</dl>
```

Import `ObfuscatedEmail` at the top.

- [ ] **Step 3: Mirror for company detail page**

In `src/app/exhibitors/[id]/page.tsx`, ensure the `<dl>` covers name, website, phone, address, city, region, country, industry, numEmployees, revenue, orgType, all socials (linkedin/facebook/twitter/instagram/youtube), description, and `additionalInfo.booth`/`sponsorTier`. Use `ObfuscatedEmail` only if a company email surfaces (companies have no email field — skip). Read the current file first; add missing `<div><dt>…` rows to match the field list.

- [ ] **Step 4: Typecheck + build + commit**

```bash
cd /home/workl/leadliaison/dm1 && npm run typecheck && npm run build
git add src/components/site/ObfuscatedEmail.tsx src/app/attendees/\[id\]/page.tsx src/app/exhibitors/\[id\]/page.tsx src/components/site/PersonCard.tsx src/components/site/CompanyCard.tsx
git commit -m "feat(site): full field-set detail render + ObfuscatedEmail (extraction-testable DOM) #summit-realism"
```

---

## Task 11: QA switcher shows complexity label

**Files:**
- Modify: `src/components/qa/ExampleSwitcher.tsx`

- [ ] **Step 1: Read the current switcher**

Run: `cat src/components/qa/ExampleSwitcher.tsx` — identify where each example option is rendered.

- [ ] **Step 2: Render `config.label`**

Change each option's visible text to include `config.label` (e.g. `{e.eventName} — {e.label}` or a second muted line). If the switcher only has `id`/`eventName`, load `label` from `EXAMPLES`/`getExample`. Keep it a `<select>`/dropdown; do not restructure.

- [ ] **Step 3: Typecheck + commit**

```bash
cd /home/workl/leadliaison/dm1 && npm run typecheck
git add src/components/qa/ExampleSwitcher.tsx
git commit -m "feat(qa): show complexity label (surface/difficulty/scale) in example switcher #summit-surfaces"
```

---

## Task 12: Regenerate fixtures + full verification + export byte-parity

**Files:**
- Regenerate: `src/data/**` (via `npm run generate`)
- Verify only (no new files)

- [ ] **Step 1: Regenerate all fixtures**

First update the hardcoded count in `scripts/generate-data.ts`: change `${cfg.order}/21` → `${cfg.order}/22` and `across 21 examples` → `across 22 examples` (two string literals). Then:

Run: `cd /home/workl/leadliaison/dm1 && npm run generate`
Expected: `Done. NNNN individuals, NNNN companies across 22 examples.` with `totalInd >= 1000`, `totalCo >= 600` (no throw). A new `src/data/devtools-world-2026/` dir is created.

- [ ] **Step 2: Coherence spot-check the new fixtures**

```bash
cd /home/workl/leadliaison/dm1 && node -e "
const fs=require('fs');const p='src/data';
let latin=0,defunct=0,fakerBio=0,junkDom=0,tuples=new Set();
for(const d of fs.readdirSync(p).filter(x=>fs.existsSync(p+'/'+x+'/meta.json'))){
  for(const r of JSON.parse(fs.readFileSync(p+'/'+d+'/individuals.json','utf8'))){const t=r.truth;
    if(/Jamahiriya/.test(t.country||''))defunct++;
    if(/(fan|lover|advocate|enthusiast),/.test(t.bio||''))fakerBio++;
    tuples.add(t.city+'|'+t.region+'|'+t.country);
  }
  if(fs.existsSync(p+'/'+d+'/companies.json'))for(const r of JSON.parse(fs.readFileSync(p+'/'+d+'/companies.json','utf8'))){const t=r.truth;
    if(/(bogus|colorless|funny|noted)-/.test(t.website||''))junkDom++;
  }
  for(const e of JSON.parse(fs.readFileSync(p+'/'+d+'/events.json','utf8'))) if(/\b(lorem|ipsum|aiunt|cresco|deprecator)\b/i.test(e.eventOverview))latin++;
}
console.log({latin,defunct,fakerBio,junkDom,distinctGeoTuples:tuples.size});
if(latin||defunct||fakerBio||junkDom) throw new Error('realism regression');
console.log('coherence OK — distinct geo tuples should be ~25 (curated), was 249 before');
"
```
Expected: `{ latin: 0, defunct: 0, fakerBio: 0, junkDom: 0, distinctGeoTuples: ~25 }`, `coherence OK`.

- [ ] **Step 3: Typecheck + full build**

Run: `cd /home/workl/leadliaison/dm1 && npm run typecheck && npm run build`
Expected: tsc clean; `next build` green (route handlers `/api/[example]/…` compile; client layouts build).

- [ ] **Step 4: Export byte-parity re-verify (contract unchanged)**

Run: `cd /home/workl/leadliaison/dm1 && npx tsx src/lib/export/export.test.ts`
Expected: PASS — CSV/XLSX headers, labels, sheet names still match the extension contract (the export code was untouched; this proves the richer data didn't break serialization).

- [ ] **Step 5: Drive one API surface end-to-end**

```bash
cd /home/workl/leadliaison/dm1 && (npm run start >/tmp/dm1-start.log 2>&1 &) ; sleep 4
curl -s "http://localhost:3000/api/fintech-connect-2026/attendees?page=2&pageSize=25" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);console.log({page:j.page,pageSize:j.pageSize,total:j.total,got:j.data.length,next:j.nextCursor});})"
# Expected: { page: 2, pageSize: 25, total: 1200, got: 25, next: '3' }
# Confirm the api-spa page's initial HTML has NO records (client-fetched):
curl -s "http://localhost:3000/attendees?example=saastock-north-2026" | grep -c 'attendees/in' || echo "0 records in initial HTML (correct for api-spa)"
pkill -f "next start" || true
```
Expected: envelope correct; api-spa initial HTML shows 0 record links.

- [ ] **Step 6: Update the SDD progress ledger + memory**

Append results to `.superpowers/sdd/progress.md` (task-by-task like the original). Note deferred TODOs. This is a verification/doc step, not code.

- [ ] **Step 7: Final commit (verification snapshot)**

```bash
cd /home/workl/leadliaison/dm1
git add src/data/ .superpowers/sdd/progress.md
git commit -m "chore(data): regenerate fixtures with real-world content + surfaces; verify build/export parity #summit-realism"
```

---

## Self-Review

**Spec coverage:**
- Geography realism → Task 1 (+wired in 4/5). ✓
- Company names/domains → Task 2 (+wired in 4). ✓
- Bios → Task 3 (+wired in 5). ✓
- Session abstracts/types/levels (kill Latin) → Task 4 (+wired in 5). ✓
- Sponsor tiers → Task 4 (company additionalInfo). ✓
- Email obfuscation (hard+api) → Task 6. ✓
- `surface` + complexity `label` on every example → Task 7; shown in switcher → Task 11. ✓
- Paginated JSON API (IMEX-style) → Task 8. ✓
- All 4 surfaces (ssr/api-spa/api-hybrid/load-more) rendered → Task 9. ✓
- DOM coverage (full field set extractable) → Task 10. ✓
- Regenerate + verify + export parity + drive an API surface → Task 12. ✓
- Deferred items (title pyramid, RPE revenue, industry/orgType alignment, per-person additionalInfo) → left as `// TODO(realism):` markers (Task 4/5), NOT implemented, per scope. ✓
- Refuted items NOT encoded (all-C-suite, duration-by-type, 500/2000 bands, medtech RPE, "no plaintext ever") → none appear in any task. ✓

**Placeholder scan:** every code step has concrete code; commands have expected output. No TBD/TODO-as-work (the `// TODO(realism):` markers are intentional deferred-scope signposts, not plan gaps).

**Type consistency:** `GeoTuple`, `ApiEnvelope<T>`, `SurfaceKind`, `paginateEnvelope`, `companyName`/`domainFromName`, `professionalBio`, `sessionAbstract`/`sessionType`/`sessionLevel`, `ObfuscatedEmail` — names used identically across producing and consuming tasks. Record types (`IndividualRecord`/`CompanyRecord`) untouched. `ExampleConfig` gains `surface`/`label` only.

**Open decision for the executor/reviewer:** Task 7 assigns 8 non-SSR examples (3 api-spa, 3 api-hybrid, 2 load-more) covering all 4 surfaces across all 3 verticals. The user asked to "add examples if needed" — a 22nd example is OPTIONAL and only warranted if a strict per-vertical (api-spa AND load-more AND api-hybrid) matrix is required. Default: no new example; reassign an existing SSR one if a 9th non-SSR surface is wanted.
