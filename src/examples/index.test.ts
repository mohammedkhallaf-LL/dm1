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
