import { notFound } from 'next/navigation'
import { resolveExampleId } from '../../../../lib/active-example.ts'
import { loadIndividuals, loadMeta, paginate } from '../../../../lib/data.ts'
import { pickLayout } from '../../../../components/layouts/index.ts'
import { SiteNav } from '../../../../components/site/SiteNav.tsx'
import { Footer } from '../../../../components/site/Footer.tsx'

const PER_PAGE = 60

export default async function AttendeesPageN({ params, searchParams }: { params: Promise<{ n: string }>; searchParams: Promise<{ example?: string }> }) {
  const { n } = await params
  const { example } = await searchParams
  const page = parseInt(n, 10)
  if (isNaN(page) || page < 2) notFound()
  const id = resolveExampleId(example)
  const meta = loadMeta(id)
  const rows = loadIndividuals(id).map((r) => r.display)
  const view = paginate(rows, page, PER_PAGE)
  if (view.items.length === 0) notFound()
  const Layout = pickLayout(meta.config.layout)
  return (
    <>
      <SiteNav exampleId={id} meta={meta} />
      <Layout people={view.items} exampleId={id} page={view.page} totalPages={view.totalPages} baseHref="/attendees" />
      <Footer />
    </>
  )
}
