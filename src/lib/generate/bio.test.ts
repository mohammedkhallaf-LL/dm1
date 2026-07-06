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
