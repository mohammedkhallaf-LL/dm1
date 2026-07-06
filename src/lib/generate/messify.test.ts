import assert from 'node:assert'
import { messifyIndividual } from './messify.ts'
import { rng } from './seed.ts'
import type { IndividualRecord } from '../types.ts'
import type { ExampleConfig } from '../../examples/index.ts'

const base: IndividualRecord = {
  id: 'in1', firstName: 'A', lastName: 'B', fullName: 'A B', email: 'a.b@vertex.com',
  title: 'CTO', types: ['attendees'], linkedin: null, twitter: null, instagram: null,
  profileUrl: null, photoUrl: null, bio: null, interests: null, company: 'Vertex',
  companyWebsite: 'https://www.vertex.com', phone: null, city: 'X', country: 'Y', region: 'Z',
  industry: 'AI/ML', orgType: 'Private', additionalInfo: {},
}
const hardCfg = { difficulty: 'hard' } as unknown as ExampleConfig
// Over many draws on a hard example, SOME display emails become the CF placeholder,
// and truth is never mutated.
let sawPlaceholder = false
for (let i = 0; i < 200; i++) {
  const d = messifyIndividual({ ...base, id: 'in' + i }, hardCfg, rng(i + 1))
  if (d.email === '[email protected]') sawPlaceholder = true
  assert.strictEqual(base.email, 'a.b@vertex.com', 'truth email never mutated')
}
assert.ok(sawPlaceholder, 'CF placeholder appears on hard example')
console.log('messify.test OK')
