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
