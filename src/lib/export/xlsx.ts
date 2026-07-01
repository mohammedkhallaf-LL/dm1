import ExcelJS from 'exceljs'
import { INDIVIDUAL_FIELDS, COMPANY_FIELDS, type FieldDef } from '../schema.ts'
import { cellValue, stamp } from './cell.ts'

function addSheet(wb: ExcelJS.Workbook, name: string, records: Record<string, unknown>[], fields: FieldDef[]) {
  const ws = wb.addWorksheet(name)
  ws.addRow(fields.map((f) => f.label))
  ws.getRow(1).font = { bold: true }
  for (const r of records) ws.addRow(fields.map((f) => cellValue(r, f)))
}

/** Pure builder — testable in Node. One workbook, Individuals + Companies sheets. */
export async function buildXlsxBuffer(
  individuals: Record<string, unknown>[],
  companies: Record<string, unknown>[],
): Promise<ArrayBuffer> {
  const wb = new ExcelJS.Workbook()
  addSheet(wb, 'Individuals', individuals, INDIVIDUAL_FIELDS)
  addSheet(wb, 'Companies', companies, COMPANY_FIELDS)
  return wb.xlsx.writeBuffer()
}

/** Browser-only: build + trigger download. Filename matches extension. */
export async function downloadXlsx(
  individuals: Record<string, unknown>[],
  companies: Record<string, unknown>[],
): Promise<void> {
  const buffer = await buildXlsxBuffer(individuals, companies)
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  triggerDownload(blob, `envoy-results-${stamp()}.xlsx`)
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
