import Link from 'next/link'

export function Pagination({ page, totalPages, baseHref, query }: { page: number; totalPages: number; baseHref: string; query: string }) {
  if (totalPages <= 1) return null
  const href = (n: number) => (n === 1 ? `${baseHref}${query}` : `${baseHref}/page/${n}${query}`)
  return (
    <div className="flex items-center justify-center gap-2 py-6 text-sm">
      {page > 1 && <Link href={href(page - 1)} className="rounded-md border border-border px-3 py-1.5 hover:bg-muted">Prev</Link>}
      <span className="text-muted-foreground">Page {page} of {totalPages}</span>
      {page < totalPages && <Link href={href(page + 1)} className="rounded-md border border-border px-3 py-1.5 hover:bg-muted">Next</Link>}
    </div>
  )
}
