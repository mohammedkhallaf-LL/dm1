import { resolveExampleId } from '../../../../lib/active-example.ts'
import { loadIndividuals } from '../../../../lib/data.ts'
import { paginateEnvelope } from '../../../../lib/api-envelope.ts'

export async function GET(req: Request, ctx: { params: Promise<{ example: string }> }) {
  const { example } = await ctx.params
  const id = resolveExampleId(example)
  const url = new URL(req.url)
  const page = Number(url.searchParams.get('page') ?? '1')
  const pageSize = Number(url.searchParams.get('pageSize') ?? '25')
  const q = url.searchParams.get('q')
  const rows = loadIndividuals(id).map((r) => r.display)
  return Response.json(paginateEnvelope(rows, page, pageSize, q, ['fullName', 'company', 'email', 'title']))
}
