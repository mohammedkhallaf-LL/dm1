import { NextResponse } from 'next/server'
import { loadIndividuals, loadCompanies } from '../../../../lib/data.ts'
import { resolveExampleId } from '../../../../lib/active-example.ts'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const exampleId = resolveExampleId(id)
  const individuals = loadIndividuals(exampleId)
  const companies = loadCompanies(exampleId)
  return NextResponse.json({
    truth: { individuals: individuals.map((r) => r.truth), companies: companies.map((r) => r.truth) },
    display: { individuals: individuals.map((r) => r.display), companies: companies.map((r) => r.display) },
  })
}
