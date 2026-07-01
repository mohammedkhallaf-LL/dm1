'use client'
import { toCsv } from '../../lib/export/csv.ts'
import { toJson } from '../../lib/export/json.ts'
import { downloadXlsx, triggerDownload } from '../../lib/export/xlsx.ts'
import { stamp } from '../../lib/export/cell.ts'
import { INDIVIDUAL_FIELDS, COMPANY_FIELDS } from '../../lib/schema.ts'

export async function exportCurrent(exampleId: string, format: 'csv' | 'xlsx' | 'json', which: 'truth' | 'display') {
  const res = await fetch(`/api/export/${exampleId}`)
  const data = await res.json()
  const { individuals, companies } = data[which]
  if (format === 'json') {
    triggerDownload(new Blob([toJson(individuals, companies)], { type: 'application/json' }), `envoy-groundtruth-${which}-${stamp()}.json`)
    return
  }
  if (format === 'csv') {
    const ts = stamp()
    if (individuals.length) triggerDownload(new Blob([toCsv(individuals, INDIVIDUAL_FIELDS)], { type: 'text/csv;charset=utf-8' }), `envoy-individuals-${ts}.csv`)
    if (companies.length) triggerDownload(new Blob([toCsv(companies, COMPANY_FIELDS)], { type: 'text/csv;charset=utf-8' }), `envoy-companies-${ts}.csv`)
    return
  }
  await downloadXlsx(individuals, companies)
}
