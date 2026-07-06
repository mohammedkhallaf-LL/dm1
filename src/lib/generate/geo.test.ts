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
