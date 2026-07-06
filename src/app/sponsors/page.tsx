import type { CompanyRecord } from '../../lib/types.ts'
import { resolveExampleId } from '../../lib/active-example.ts'
import { loadCompanies, loadMeta } from '../../lib/data.ts'
import { CardGrid } from '../../components/layouts/CardGrid.tsx'
import { SiteNav } from '../../components/site/SiteNav.tsx'
import { Footer } from '../../components/site/Footer.tsx'

const TIER_ORDER = ['Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze'] as const

function getTier(c: CompanyRecord): string | null {
  return typeof c.additionalInfo.sponsorTier === 'string' ? c.additionalInfo.sponsorTier : null
}

export default async function SponsorsPage({ searchParams }: { searchParams: Promise<{ example?: string }> }) {
  const { example } = await searchParams
  const id = resolveExampleId(example)
  const meta = loadMeta(id)
  const rows = loadCompanies(id).map((r) => r.display).filter((c) => c.types.includes('sponsors'))

  const tierGroups = TIER_ORDER.map((tier) => ({ tier, companies: rows.filter((c) => getTier(c) === tier) })).filter(
    (g) => g.companies.length > 0,
  )
  const untiered = rows.filter((c) => !TIER_ORDER.includes(getTier(c) as (typeof TIER_ORDER)[number]))

  return (
    <>
      <SiteNav exampleId={id} meta={meta} />
      <h1 className="px-4 pt-8 pb-2 text-2xl font-bold text-foreground">Sponsors <span className="text-sm font-normal text-muted-foreground">({rows.length.toLocaleString()})</span></h1>
      {tierGroups.map(({ tier, companies }) => (
        <section key={tier}>
          <h2 className="px-4 pt-6 text-xl font-bold text-brand">{tier}</h2>
          <CardGrid companies={companies} exampleId={id} />
        </section>
      ))}
      {untiered.length > 0 && (
        <section>
          {tierGroups.length > 0 && <h2 className="px-4 pt-6 text-xl font-bold text-foreground">Sponsors</h2>}
          <CardGrid companies={untiered} exampleId={id} />
        </section>
      )}
      <Footer />
    </>
  )
}
