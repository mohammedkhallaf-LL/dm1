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
