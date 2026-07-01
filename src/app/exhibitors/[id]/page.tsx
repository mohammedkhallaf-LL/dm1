import { notFound } from 'next/navigation'
import { resolveExampleId } from '../../../lib/active-example.ts'
import { loadCompanies, loadMeta } from '../../../lib/data.ts'
import { SiteNav } from '../../../components/site/SiteNav.tsx'
import { Footer } from '../../../components/site/Footer.tsx'
import { companyLogoSvg, svgToDataUri } from '../../../lib/generate/avatar.ts'

export default async function ExhibitorDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ example?: string }> }) {
  const { id: companyId } = await params
  const { example } = await searchParams
  const id = resolveExampleId(example)
  const meta = loadMeta(id)
  const row = loadCompanies(id).find((r) => r.display.id === companyId)
  if (!row) notFound()
  const c = row.display
  return (
    <>
      <SiteNav exampleId={id} meta={meta} />
      <article className="mx-auto max-w-2xl px-4 py-10">
        <div className="flex items-center gap-4">
          <img
            src={svgToDataUri(companyLogoSvg(c.name))}
            width={80}
            height={80}
            alt={`${c.name} logo`}
            className="rounded-md"
          />
          <div>
            <h1 className="text-2xl font-bold text-foreground">{c.name}</h1>
            <p className="text-muted-foreground">{c.industry ?? '—'}</p>
          </div>
        </div>
        <dl className="mt-6 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-muted-foreground">Website</dt><dd className="truncate text-foreground">{c.website ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">Employees</dt><dd className="text-foreground">{c.numEmployees?.toLocaleString() ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">Revenue</dt><dd className="text-foreground">{c.revenue ? `$${c.revenue.toLocaleString()}` : '—'}</dd></div>
          <div><dt className="text-muted-foreground">Address</dt><dd className="text-foreground">{c.address ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">City</dt><dd className="text-foreground">{c.city ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">Country</dt><dd className="text-foreground">{c.country ?? '—'}</dd></div>
        </dl>
        {c.description && <p className="mt-6 text-foreground">{c.description}</p>}
      </article>
      <Footer />
    </>
  )
}
