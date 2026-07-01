import Link from 'next/link'
import type { ListLayoutProps } from './CardGrid.tsx'
import { Pagination } from '../site/Pagination.tsx'

export function DenseTable({ people, companies, exampleId, page, totalPages, baseHref }: ListLayoutProps) {
  const q = `?example=${exampleId}`
  return (
    <div className="overflow-x-auto p-4">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            {people ? (<><th className="p-2">Name</th><th className="p-2">Title</th><th className="p-2">Company</th><th className="p-2">Email</th></>)
                    : (<><th className="p-2">Company</th><th className="p-2">Industry</th><th className="p-2">Website</th><th className="p-2">City</th></>)}
          </tr>
        </thead>
        <tbody>
          {people?.map((p) => (
            <tr key={p.id} className="border-b border-border hover:bg-muted">
              <td className="p-2"><Link href={`/attendees/${p.id}${q}`} className="text-brand hover:underline">{p.fullName}</Link></td>
              <td className="p-2">{p.title ?? '—'}</td>
              <td className="p-2">{p.company ?? '—'}</td>
              <td className="p-2">{p.email ?? '—'}</td>
            </tr>
          ))}
          {companies?.map((c) => (
            <tr key={c.id} className="border-b border-border hover:bg-muted">
              <td className="p-2"><Link href={`/exhibitors/${c.id}${q}`} className="text-brand hover:underline">{c.name}</Link></td>
              <td className="p-2">{c.industry ?? '—'}</td>
              <td className="p-2">{c.website ?? '—'}</td>
              <td className="p-2">{c.city ?? '—'}</td>
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
