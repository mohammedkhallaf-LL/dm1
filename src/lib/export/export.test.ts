import assert from 'node:assert'
import { toCsv } from './csv.ts'
import { cellValue } from './cell.ts'
import { buildXlsxBuffer } from './xlsx.ts'
import { INDIVIDUAL_FIELDS } from '../schema.ts'

// header row = labels, comma-joined
const csv = toCsv([], INDIVIDUAL_FIELDS)
assert.ok(csv.startsWith('First Name,Last Name,Full Name,Email,Job Title,Type(s),'), 'header order matches extension')

// types => "Attendees, Speakers"; additionalInfo => JSON; null => ''
const rec = { fullName: 'Jane', types: ['attendees', 'speakers'], additionalInfo: { booth: '#1' }, email: null }
assert.equal(cellValue(rec, { key: 'types', label: 'Type(s)' }), 'Attendees, Speakers')
assert.equal(cellValue(rec, { key: 'additionalInfo', label: 'Additional Info' }), '{"booth":"#1"}')
assert.equal(cellValue(rec, { key: 'email', label: 'Email' }), '')

// csvEscape: value with comma gets quoted
const csv2 = toCsv([{ fullName: 'Doe, John', types: [], additionalInfo: {} }], [{ key: 'fullName', label: 'Full Name' }])
assert.ok(csv2.includes('"Doe, John"'), 'comma value quoted')

// xlsx builder produces a non-empty buffer
const buf = await buildXlsxBuffer([{ fullName: 'A', types: [], additionalInfo: {} }], [])
assert.ok(buf.byteLength > 0, 'xlsx buffer non-empty')
console.log('export OK')
