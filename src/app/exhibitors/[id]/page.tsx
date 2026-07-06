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
  const booth = typeof c.additionalInfo.booth === 'string' ? c.additionalInfo.booth : undefined
  const sponsorTier = typeof c.additionalInfo.sponsorTier === 'string' ? c.additionalInfo.sponsorTier : undefined
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
          <div><dt className="text-muted-foreground">Phone</dt><dd className="text-foreground">{c.phone ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">Employees</dt><dd className="text-foreground">{c.numEmployees?.toLocaleString() ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">Revenue</dt><dd className="text-foreground">{c.revenue ? `$${c.revenue.toLocaleString()}` : '—'}</dd></div>
          <div><dt className="text-muted-foreground">Address</dt><dd className="text-foreground">{c.address ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">City</dt><dd className="text-foreground">{c.city ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">Region</dt><dd className="text-foreground">{c.region ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">Country</dt><dd className="text-foreground">{c.country ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">Org Type</dt><dd className="text-foreground">{c.orgType ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">LinkedIn</dt><dd className="truncate text-foreground">{c.linkedin ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">Facebook</dt><dd className="truncate text-foreground">{c.facebook ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">Twitter</dt><dd className="truncate text-foreground">{c.twitter ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">Instagram</dt><dd className="truncate text-foreground">{c.instagram ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">YouTube</dt><dd className="truncate text-foreground">{c.youtube ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">Company Profile URL</dt><dd className="truncate text-foreground">{c.profileUrl ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">Participant Type(s)</dt><dd className="text-foreground">{c.types.length ? c.types.join(', ') : '—'}</dd></div>
          <div><dt className="text-muted-foreground">Booth</dt><dd className="text-foreground">{booth ?? '—'}</dd></div>
          {sponsorTier && <div><dt className="text-muted-foreground">Sponsor Tier</dt><dd className="text-foreground">{sponsorTier}</dd></div>}
        </dl>
        {c.description && <p className="mt-6 text-foreground">{c.description}</p>}
      </article>
      <Footer />
    </>
  )
}
