import { resolveExampleId } from '../../../../../lib/active-example.ts'
import { loadCompanies } from '../../../../../lib/data.ts'

export async function GET(_req: Request, ctx: { params: Promise<{ example: string; id: string }> }) {
  const { example, id: companyId } = await ctx.params
  const id = resolveExampleId(example)
  const row = loadCompanies(id).find((r) => r.display.id === companyId)
  if (!row) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json({ data: row.display })
}
