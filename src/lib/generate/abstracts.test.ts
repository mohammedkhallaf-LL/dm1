import assert from 'node:assert'
import { seededFaker } from './seed.ts'
import { sessionAbstract, sessionType, sessionLevel } from './abstracts.ts'

const f = seededFaker(800)
const a = sessionAbstract(f, 'RAG in Production')
// English, references the topic, NOT Latin lorem ipsum.
assert.ok(!/\b(lorem|ipsum|dolor|aiunt|cresco|repellendus|deprecator)\b/i.test(a), 'no latin lorem')
assert.ok(/[A-Z]/.test(a) && a.split(' ').length >= 12, 'real sentence-ish abstract')
const types = new Set(Array.from({ length: 60 }, () => sessionType(f)))
assert.ok(types.size >= 4, 'varied session types')
assert.ok([...types].every((t) => /keynote|breakout|chalk|code|lightning|builder|hands-on|panel|fireside/i.test(t)), 'types from real vocab')
assert.ok(/Level [1-4]00/.test(sessionLevel(f)), 'AWS 100-400 difficulty level')
console.log('abstracts.test OK')
