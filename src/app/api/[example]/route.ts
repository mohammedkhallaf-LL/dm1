import { resolveExampleId } from '../../../lib/active-example.ts'
import { loadMeta } from '../../../lib/data.ts'

export async function GET(_req: Request, ctx: { params: Promise<{ example: string }> }) {
  const { example } = await ctx.params
  const id = resolveExampleId(example)
  return Response.json(loadMeta(id))
}
