import type { FieldDef } from '../schema.ts'
import { cellValue } from './cell.ts'

function csvEscape(v: string): string {
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`
  }
  return v
}

/** One CSV string: header row of labels + one row per record. Matches extension toCsv. */
export function toCsv(records: Record<string, unknown>[], fields: FieldDef[]): string {
  const lines = [fields.map((f) => csvEscape(f.label)).join(',')]
  for (const r of records) {
    lines.push(fields.map((f) => csvEscape(cellValue(r, f))).join(','))
  }
  return lines.join('\n')
}
