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

// XML-unsafe names must not leak raw < > & " into the SVG markup
const unsafe = personAvatarSvg('<b>Ann & "Bob"')
assert.ok(!/<text[^>]*>[^<]*<(?!\/text)/.test(unsafe), 'no unescaped < inside text content')
assert.ok(!unsafe.includes('& '), 'raw ampersand escaped')
// deterministic even for unsafe input
assert.equal(personAvatarSvg('<b>Ann'), personAvatarSvg('<b>Ann'), 'deterministic for unsafe input')
// empty/whitespace name falls back without crashing
assert.ok(personAvatarSvg('   ').startsWith('<svg'), 'whitespace name still yields svg')

console.log('avatar OK')
