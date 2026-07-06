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
