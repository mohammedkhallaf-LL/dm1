import { resolveExampleId } from '../../../../../lib/active-example.ts'
import { loadIndividuals } from '../../../../../lib/data.ts'

export async function GET(_req: Request, ctx: { params: Promise<{ example: string; id: string }> }) {
  const { example, id: personId } = await ctx.params
  const id = resolveExampleId(example)
  const row = loadIndividuals(id).find((r) => r.display.id === personId)
  if (!row) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json({ data: row.display })
}
