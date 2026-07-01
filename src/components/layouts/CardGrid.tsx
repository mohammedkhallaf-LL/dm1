import type { IndividualRecord, CompanyRecord } from '../../lib/types.ts'
import { PersonCard } from '../site/PersonCard.tsx'
import { CompanyCard } from '../site/CompanyCard.tsx'

export type ListLayoutProps = {
  people?: IndividualRecord[]
  companies?: CompanyRecord[]
  exampleId: string
  page?: number
  totalPages?: number
  baseHref?: string
}

export function CardGrid({ people, companies, exampleId }: ListLayoutProps) {
  return (
    <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
      {people?.map((p) => <PersonCard key={p.id} person={p} exampleId={exampleId} />)}
      {companies?.map((c) => <CompanyCard key={c.id} company={c} exampleId={exampleId} />)}
    </div>
  )
}
