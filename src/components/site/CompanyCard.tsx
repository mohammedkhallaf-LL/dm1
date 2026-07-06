import Link from 'next/link'
import type { CompanyRecord } from '../../lib/types.ts'
import { logoProps } from '../../lib/generate/avatar.ts'

export function CompanyCard({ company, exampleId }: { company: CompanyRecord; exampleId: string }) {
  const { id, c1, c2, label } = logoProps(company.name)
  const sponsorTier = typeof company.additionalInfo.sponsorTier === 'string' ? company.additionalInfo.sponsorTier : null
  return (
    <Link
      href={`/exhibitors/${company.id}?example=${exampleId}`}
      className="relative flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors transition-shadow duration-200 hover:border-brand hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      {sponsorTier && (
        <span className="absolute top-2 right-2 rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
          {sponsorTier}
        </span>
      )}
      <svg width={48} height={48} viewBox="0 0 96 96" aria-label={`${company.name} logo`} className="shrink-0 rounded-md">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={c1} />
            <stop offset="1" stopColor={c2} />
          </linearGradient>
        </defs>
        <rect width="96" height="96" rx="18" fill={`url(#${id})`} />
        <text x="48" y="60" fontFamily="Inter, sans-serif" fontSize="34" fontWeight="700" fill="#fff" textAnchor="middle">{label}</text>
      </svg>
      <div className="min-w-0">
        <div className="truncate font-medium text-foreground">{company.name}</div>
        <div className="truncate text-sm text-muted-foreground">{company.industry ?? '—'}</div>
      </div>
    </Link>
  )
}
