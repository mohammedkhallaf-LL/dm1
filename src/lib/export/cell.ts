import type { FieldDef } from '../schema.ts'

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Matches captello-envoy/src/sidepanel/lib/export.ts cellValue exactly. */
export function cellValue(record: Record<string, unknown>, field: FieldDef): string {
  if (field.key === 'additionalInfo') {
    return JSON.stringify(record.additionalInfo ?? {})
  }
  const v = record[field.key]
  if (field.key === 'types' && Array.isArray(v)) {
    return v.map((t) => titleCase(String(t))).join(', ')
  }
  return v === null || v === undefined ? '' : String(v)
}

/** File-safe ISO timestamp, e.g. 2026-06-24T10-57-48-000Z. Matches extension. */
export function stamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-')
}
