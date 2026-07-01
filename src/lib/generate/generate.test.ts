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
