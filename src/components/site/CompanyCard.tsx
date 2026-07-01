import Link from 'next/link'
import type { CompanyRecord } from '../../lib/types.ts'
import { companyLogoSvg, svgToDataUri } from '../../lib/generate/avatar.ts'

export function CompanyCard({ company, exampleId }: { company: CompanyRecord; exampleId: string }) {
  return (
    <Link href={`/exhibitors/${company.id}?example=${exampleId}`} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:border-brand">
      <img src={svgToDataUri(companyLogoSvg(company.name))} width={48} height={48} alt={`${company.name} logo`} className="rounded-md" />
      <div className="min-w-0">
        <div className="truncate font-medium text-foreground">{company.name}</div>
        <div className="truncate text-sm text-muted-foreground">{company.industry ?? '—'}</div>
      </div>
    </Link>
  )
}
