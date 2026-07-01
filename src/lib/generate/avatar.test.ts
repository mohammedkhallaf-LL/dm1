import assert from 'node:assert'
import { personAvatarSvg, companyLogoSvg, svgToDataUri } from './avatar.ts'

const a = personAvatarSvg('Jane Doe')
const b = personAvatarSvg('Jane Doe')
assert.equal(a, b, 'deterministic for same name')
assert.ok(a.startsWith('<svg'), 'is svg')
assert.ok(a.includes('JD'), 'monogram = initials')
assert.ok(!/photo|face|image\.|\.jpg|\.png|http/i.test(a), 'no real image refs')

const c = companyLogoSvg('Acme Cloud')
assert.ok(c.includes('AC'), 'company monogram')

const uri = svgToDataUri(a)
assert.ok(uri.startsWith('data:image/svg+xml'), 'data uri')
console.log('avatar OK')
