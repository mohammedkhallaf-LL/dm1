import assert from 'node:assert'
import ExcelJS from 'exceljs'
import { toCsv } from './csv.ts'
import { cellValue } from './cell.ts'
import { buildXlsxBuffer } from './xlsx.ts'
import { INDIVIDUAL_FIELDS, COMPANY_FIELDS } from '../schema.ts'

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

// Company CSV header assertion
const coCsv = toCsv([], COMPANY_FIELDS)
assert.ok(coCsv.startsWith('Name,Website,Phone,Country,City,Region,Address,Type(s),Industry,'), 'company CSV header order matches extension')

// xlsx builder produces a non-empty buffer
const buf = await buildXlsxBuffer([{ fullName: 'A', types: [], additionalInfo: {} }], [])
assert.ok(buf.byteLength > 0, 'xlsx buffer non-empty')

// Round-trip xlsx via exceljs: verify sheet names, header labels, and bold formatting
const wb2 = new ExcelJS.Workbook()
const xlsxBuf = await buildXlsxBuffer(
  [{ fullName: 'A', types: ['attendees'], additionalInfo: {} }],
  [{ name: 'Acme', types: ['exhibitors'], additionalInfo: {} }],
)
await wb2.xlsx.load(xlsxBuf)
const sheetNames = wb2.worksheets.map((w) => w.name)
assert.deepEqual(sheetNames, ['Individuals', 'Companies'], 'exact sheet names + order')

const indWorksheet = wb2.getWorksheet('Individuals')
assert.ok(indWorksheet, 'Individuals sheet exists')
const indHeader = indWorksheet!.getRow(1)
assert.equal(indHeader.getCell(1).value, 'First Name', 'ind sheet row1 cell1 = First Name label')
assert.equal(indHeader.getCell(1).font?.bold, true, 'ind header row is bold')

const coWorksheet = wb2.getWorksheet('Companies')
assert.ok(coWorksheet, 'Companies sheet exists')
const coHeader = coWorksheet!.getRow(1)
assert.equal(coHeader.getCell(1).value, 'Name', 'co sheet row1 cell1 = Name label')
assert.equal(coHeader.getCell(1).font?.bold, true, 'co header row is bold')

console.log('export OK')
