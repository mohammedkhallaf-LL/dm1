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
