import assert from 'node:assert'
import { INDIVIDUAL_FIELDS, COMPANY_FIELDS } from './schema.ts'

assert.equal(INDIVIDUAL_FIELDS.length, 22, 'individual field count')
assert.equal(COMPANY_FIELDS.length, 20, 'company field count')
assert.equal(INDIVIDUAL_FIELDS[0].label, 'First Name')
assert.equal(INDIVIDUAL_FIELDS[15].label, 'Company Phone') // extension quirk: phone => "Company Phone"
assert.equal(COMPANY_FIELDS[10].label, 'Revenue ($)')
assert.equal(COMPANY_FIELDS[17].label, 'About (summary)')
// last field is always additionalInfo
assert.equal(INDIVIDUAL_FIELDS.at(-1)!.key, 'additionalInfo')
assert.equal(COMPANY_FIELDS.at(-1)!.key, 'additionalInfo')
console.log('schema OK')
