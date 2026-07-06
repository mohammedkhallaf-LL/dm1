import Link from 'next/link'
import type { ListLayoutProps } from './CardGrid.tsx'
import { Pagination } from '../site/Pagination.tsx'

export function DenseTable({ people, companies, exampleId, page, totalPages, baseHref }: ListLayoutProps) {
  const q = `?example=${exampleId}`
  return (
    <div className="overflow-x-auto p-4">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="sticky top-0 border-b border-border bg-muted text-left font-medium text-muted-foreground">
            {people ? (<><th className="px-4 py-2.5">Name</th><th className="px-4 py-2.5">Title</th><th className="px-4 py-2.5">Company</th><th className="px-4 py-2.5">Email</th></>)
                    : (<><th className="px-4 py-2.5">Company</th><th className="px-4 py-2.5">Industry</th><th className="px-4 py-2.5">Website</th><th className="px-4 py-2.5">City</th></>)}
          </tr>
        </thead>
        <tbody>
          {people?.map((p) => (
            <tr key={p.id} className="border-b border-border even:bg-muted/50 hover:bg-muted">
              <td className="px-4 py-2.5"><Link href={`/attendees/${p.id}${q}`} className="text-brand hover:underline">{p.fullName}</Link></td>
              <td className="px-4 py-2.5">{p.title ?? '—'}</td>
              <td className="px-4 py-2.5">{p.company ?? '—'}</td>
              <td className="px-4 py-2.5">{p.email ?? '—'}</td>
            </tr>
          ))}
          {companies?.map((c) => (
            <tr key={c.id} className="border-b border-border even:bg-muted/50 hover:bg-muted">
              <td className="px-4 py-2.5"><Link href={`/exhibitors/${c.id}${q}`} className="text-brand hover:underline">{c.name}</Link></td>
              <td className="px-4 py-2.5">{c.industry ?? '—'}</td>
              <td className="px-4 py-2.5">{c.website ?? '—'}</td>
              <td className="px-4 py-2.5">{c.city ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {baseHref && totalPages ? (
        <Pagination page={page ?? 1} totalPages={totalPages} baseHref={baseHref} query={`?example=${exampleId}`} />
      ) : null}
    </div>
  )
}
