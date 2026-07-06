import { resolveExampleId } from '../../lib/active-example.ts'
import { loadIndividuals, loadMeta, paginate } from '../../lib/data.ts'
import { pickLayout } from '../../components/layouts/index.ts'
import { ApiList } from '../../components/layouts/ApiList.tsx'
import { SiteNav } from '../../components/site/SiteNav.tsx'
import { Footer } from '../../components/site/Footer.tsx'

const PER_PAGE = 60

export default async function AttendeesPage({ searchParams }: { searchParams: Promise<{ example?: string }> }) {
  const { example } = await searchParams
  const id = resolveExampleId(example)
  const meta = loadMeta(id)

  if (meta.config.surface === 'api-spa' || meta.config.surface === 'load-more') {
    return (
      <>
        <SiteNav exampleId={id} meta={meta} />
        <h1 className="px-4 pt-8 pb-2 text-2xl font-bold text-foreground">Attendees</h1>
        <ApiList exampleId={id} kind="attendees" autoLoad={meta.config.surface === 'api-spa'} />
        <Footer />
      </>
    )
  }
  // api-hybrid and ssr: fall through to the existing SSR render. For
  // api-hybrid, the SSR page 1 (below) plus the /api/[example]/attendees
  // endpoint together satisfy the hybrid surface — no client change needed.

  const rows = loadIndividuals(id).map((r) => r.display)
  const usePages = meta.config.layout === 'paginated-list' || meta.config.layout === 'dense-table'
  const Layout = pickLayout(meta.config.layout)
  const view = usePages ? paginate(rows, 1, PER_PAGE) : { items: rows, page: 1, totalPages: 1, total: rows.length }
  return (
    <>
      <SiteNav exampleId={id} meta={meta} />
      <h1 className="px-4 pt-8 pb-2 text-2xl font-bold text-foreground">Attendees <span className="text-sm font-normal text-muted-foreground">({view.total.toLocaleString()})</span></h1>
      <Layout people={view.items} exampleId={id} page={view.page} totalPages={view.totalPages} baseHref="/attendees" />
      <Footer />
    </>
  )
}
