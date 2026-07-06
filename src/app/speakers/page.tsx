import { resolveExampleId } from '../../lib/active-example.ts'
import { loadIndividuals, loadMeta, paginate } from '../../lib/data.ts'
import { pickLayout } from '../../components/layouts/index.ts'
import { SiteNav } from '../../components/site/SiteNav.tsx'
import { Footer } from '../../components/site/Footer.tsx'

const PER_PAGE = 60

export default async function SpeakersPage({ searchParams }: { searchParams: Promise<{ example?: string }> }) {
  const { example } = await searchParams
  const id = resolveExampleId(example)
  const meta = loadMeta(id)
  const rows = loadIndividuals(id).map((r) => r.display).filter((p) => p.types.includes('speakers'))
  const usePages = meta.config.layout === 'paginated-list' || meta.config.layout === 'dense-table'
  const Layout = pickLayout(meta.config.layout)
  const view = usePages ? paginate(rows, 1, PER_PAGE) : { items: rows, page: 1, totalPages: 1, total: rows.length }
  return (
    <>
      <SiteNav exampleId={id} meta={meta} />
      <h1 className="px-4 pt-8 pb-2 text-2xl font-bold text-foreground">Speakers <span className="text-sm font-normal text-muted-foreground">({view.total.toLocaleString()})</span></h1>
      <Layout people={view.items} exampleId={id} page={view.page} totalPages={view.totalPages} baseHref="/speakers" />
      <Footer />
    </>
  )
}
