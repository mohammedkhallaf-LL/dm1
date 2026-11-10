import assert from 'node:assert'
import type { CursorEnvelope } from './cursor-envelope.ts'
import { cursorPage, cursorToken, decodeCursor, encodeCursor, isAuthorized, parseLimit } from './cursor-envelope.ts'
import { GET } from '../app/api/[example]/directory/route.ts'
import { loadIndividuals } from './data.ts'

const SEED = 308
const items = Array.from({ length: 130 }, (_, i) => ({ id: 'p' + i }))

// 130 rows, limit 30 -> 5 full pages + short last page, cursors chain
let cursor: string | null = null
const pages: { id: string }[][] = []
const cursors: string[] = []
for (let guard = 0; guard < 20; guard++) {
  const env: CursorEnvelope<{ id: string }> = cursorPage(items, 30, cursor, SEED)!
  assert.ok(env, 'valid cursor accepted')
  assert.deepStrictEqual(Object.keys(env).sort(), ['data', 'next_cursor', 'total'], 'exact envelope keys')
  assert.strictEqual(env.total, 130)
  pages.push(env.data)
  if (env.next_cursor === null) break
  cursors.push(env.next_cursor)
  cursor = env.next_cursor
}
assert.strictEqual(pages.length, 5, '130 rows / 30 = 5 pages')
assert.deepStrictEqual(pages.map((p) => p.length), [30, 30, 30, 30, 10])
assert.strictEqual(new Set(cursors).size, 4, 'cursors distinct')
assert.deepStrictEqual(pages.flat(), items, 'pages concatenate to the full list')
assert.ok(cursors.every((c) => !/^\d+$/.test(c)), 'cursor is not a page number')

// opaque cursor round-trips
assert.strictEqual(decodeCursor(encodeCursor(60, SEED), SEED), 60)
assert.deepStrictEqual(JSON.parse(Buffer.from(encodeCursor(60, SEED), 'base64url').toString()), { o: 60, s: SEED })

// tampered / foreign / garbage cursors rejected
assert.strictEqual(cursorPage(items, 30, 'not-a-cursor!!', SEED), null)
assert.strictEqual(cursorPage(items, 30, '2', SEED), null, 'page-number cursor rejected')
assert.strictEqual(cursorPage(items, 30, encodeCursor(30, SEED + 1), SEED), null, 'wrong seed rejected')
assert.strictEqual(cursorPage(items, 30, Buffer.from('{"o":-5,"s":308}').toString('base64url'), SEED), null)
assert.strictEqual(cursorPage(items, 30, encodeCursor(9999, SEED), SEED), null, 'offset past end rejected')

// limit: default 30, max 100
assert.strictEqual(parseLimit(null), 30)
assert.strictEqual(parseLimit('5000'), 100)
assert.strictEqual(parseLimit('abc'), 30)

// auth helper
const token = cursorToken('erleah-style-directory-2026', SEED)
assert.strictEqual(token, 'demo.erleah-style-directory-2026.308')
assert.ok(isAuthorized(`Bearer ${token}`, 'erleah-style-directory-2026', SEED))
assert.ok(!isAuthorized(null, 'erleah-style-directory-2026', SEED))
assert.ok(!isAuthorized('Bearer nope', 'erleah-style-directory-2026', SEED))

// route-level (real fixtures)
const id = 'erleah-style-directory-2026'
const ctx = { params: Promise.resolve({ example: id }) }
const call = (qs: string, auth?: string) =>
  GET(new Request(`http://x/api/${id}/directory?${qs}`, { headers: auth ? { authorization: auth } : {} }), ctx)
assert.strictEqual((await call('role=attendee&limit=30')).status, 401, 'missing token -> 401')
assert.deepStrictEqual(await (await call('role=attendee')).json(), { error: 'unauthorized' })
const r1 = await call('role=attendee&limit=30', `Bearer ${token}`)
assert.strictEqual(r1.status, 200)
const b1 = await r1.json()
assert.strictEqual(b1.data.length, 30); assert.strictEqual(b1.total, loadIndividuals(id).length)
assert.ok(typeof b1.next_cursor === 'string')
assert.strictEqual((await call(`role=attendee&cursor=${b1.next_cursor}x`, `Bearer ${token}`)).status, 400, 'tampered -> 400')
const ex = await (await call('role=exhibitor&limit=100', `Bearer ${token}`)).json()
assert.strictEqual(ex.total, 40); assert.strictEqual(ex.next_cursor, null, 'last page null cursor')
console.log('cursor-envelope.test OK')
