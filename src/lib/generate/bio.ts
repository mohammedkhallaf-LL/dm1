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
  'building teams that operate across {domain} at scale',
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
  const closer = fill(f.helpers.arrayElement(CLOSERS).replaceAll('{name}', first))
  return `${opener} ${middle}. ${closer}`
}
