import { resolveExampleId } from '../../lib/active-example.ts'
import { loadCompanies, loadMeta, paginate } from '../../lib/data.ts'
import { pickLayout } from '../../components/layouts/index.ts'
import { SiteNav } from '../../components/site/SiteNav.tsx'
import { Footer } from '../../components/site/Footer.tsx'

const PER_PAGE = 60

export default async function ExhibitorsPage({ searchParams }: { searchParams: Promise<{ example?: string }> }) {
  const { example } = await searchParams
  const id = resolveExampleId(example)
  const meta = loadMeta(id)
  const rows = loadCompanies(id).map((r) => r.display)
  const usePages = meta.config.layout === 'paginated-list' || meta.config.layout === 'dense-table'
  const Layout = pickLayout(meta.config.layout)
  const view = usePages ? paginate(rows, 1, PER_PAGE) : { items: rows, page: 1, totalPages: 1, total: rows.length }
  return (
    <>
      <SiteNav exampleId={id} meta={meta} />
      <h1 className="px-4 pt-6 text-2xl font-bold text-foreground">Exhibitors <span className="text-sm font-normal text-muted-foreground">({view.total.toLocaleString()})</span></h1>
      <Layout companies={view.items} exampleId={id} page={view.page} totalPages={view.totalPages} baseHref="/exhibitors" />
      <Footer />
    </>
  )
}
