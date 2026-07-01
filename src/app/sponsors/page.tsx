import { resolveExampleId } from '../../lib/active-example.ts'
import { loadCompanies, loadMeta } from '../../lib/data.ts'
import { CardGrid } from '../../components/layouts/CardGrid.tsx'
import { SiteNav } from '../../components/site/SiteNav.tsx'
import { Footer } from '../../components/site/Footer.tsx'

export default async function SponsorsPage({ searchParams }: { searchParams: Promise<{ example?: string }> }) {
  const { example } = await searchParams
  const id = resolveExampleId(example)
  const meta = loadMeta(id)
  const rows = loadCompanies(id).map((r) => r.display).filter((c) => c.types.includes('sponsors'))
  return (
    <>
      <SiteNav exampleId={id} meta={meta} />
      <h1 className="px-4 pt-6 text-2xl font-bold text-foreground">Sponsors <span className="text-sm font-normal text-muted-foreground">({rows.length.toLocaleString()})</span></h1>
      <CardGrid companies={rows} exampleId={id} />
      <Footer />
    </>
  )
}
