import fs from 'node:fs'
import path from 'node:path'
import type { IndividualRecord, CompanyRecord, EventRecord } from './types.ts'
import type { ExampleConfig } from '../examples/index.ts'

const DATA_DIR = path.join(process.cwd(), 'src/data')

export interface Row<T> { truth: T; display: T }

function read<T>(exampleId: string, file: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, exampleId, file), 'utf-8')) as T
}

export function loadIndividuals(exampleId: string): Row<IndividualRecord>[] {
  return read<Row<IndividualRecord>[]>(exampleId, 'individuals.json')
}
export function loadCompanies(exampleId: string): Row<CompanyRecord>[] {
  return read<Row<CompanyRecord>[]>(exampleId, 'companies.json')
}
export function loadEvents(exampleId: string): EventRecord[] {
  return read<EventRecord[]>(exampleId, 'events.json')
}
export function loadMeta(exampleId: string): { config: ExampleConfig; counts: { individuals: number; companies: number; events: number } } {
  return read(exampleId, 'meta.json')
}

export function paginate<T>(items: T[], page: number, perPage: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage))
  const p = Math.min(Math.max(1, page), totalPages)
  return { items: items.slice((p - 1) * perPage, p * perPage), page: p, totalPages, total: items.length }
}
