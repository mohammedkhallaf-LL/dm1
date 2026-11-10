import { getExample } from '../../../../examples/index.ts'
import { loadCompanies, loadIndividuals } from '../../../../lib/data.ts'
import { cursorPage, isAuthorized, parseLimit } from '../../../../lib/cursor-envelope.ts'

export async function GET(req: Request, ctx: { params: Promise<{ example: string }> }) {
  const { example } = await ctx.params
  const cfg = getExample(example)
  if (!cfg || cfg.surface !== 'cursor-feed') return Response.json({ error: 'not_found' }, { status: 404 })
  if (!isAuthorized(req.headers.get('authorization'), cfg.id, cfg.seed)) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }
  const url = new URL(req.url)
  const role = url.searchParams.get('role') ?? 'attendee'
  if (role !== 'attendee' && role !== 'exhibitor') return Response.json({ error: 'bad_role' }, { status: 400 })
  const rows: unknown[] = role === 'attendee'
    ? loadIndividuals(cfg.id).map((r) => r.display)
    : loadCompanies(cfg.id).map((r) => r.display)
  const body = cursorPage(rows, parseLimit(url.searchParams.get('limit')), url.searchParams.get('cursor'), cfg.seed)
  if (!body) return Response.json({ error: 'bad_cursor' }, { status: 400 })
  return Response.json(body)
}
