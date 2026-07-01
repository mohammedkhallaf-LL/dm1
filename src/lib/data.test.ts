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
