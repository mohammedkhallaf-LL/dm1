'use client'
import { useEffect, useState } from 'react'
import { PersonCard } from '../site/PersonCard.tsx'
import { CompanyCard } from '../site/CompanyCard.tsx'
import type { IndividualRecord, CompanyRecord } from '../../lib/types.ts'
import type { ApiEnvelope } from '../../lib/api-envelope.ts'

/**
 * Shared client-rendered, API-backed list surface.
 *
 * `autoLoad: true`  -> "API-SPA (JSON only)" surface: fetches page 1 on mount
 *   (initial server HTML has no records), then a "Load more" button fetches
 *   subsequent pages.
 * `autoLoad: false` -> "load-more" surface: nothing is fetched on mount;
 *   only a "Load results" button is rendered, and each click fetches the
 *   next page and appends (off-screen records are absent from the DOM until
 *   fetched).
 */
export function ApiList({
  exampleId,
  kind,
  autoLoad,
}: {
  exampleId: string
  kind: 'attendees' | 'exhibitors'
  autoLoad: boolean
}) {
  const [rows, setRows] = useState<(IndividualRecord | CompanyRecord)[]>([])
  const [page, setPage] = useState(autoLoad ? 1 : 0)
  const [next, setNext] = useState<string | null>('1')
  const [loading, setLoading] = useState(false)

  async function loadPage(p: number) {
    setLoading(true)
    const res = await fetch(`/api/${exampleId}/${kind}?page=${p}&pageSize=50`)
    const env: ApiEnvelope<IndividualRecord | CompanyRecord> = await res.json()
    setRows((r) => [...r, ...env.data])
    setNext(env.nextCursor)
    setPage(p)
    setLoading(false)
  }

  useEffect(() => {
    if (autoLoad) void loadPage(1) // eslint-disable-line react-hooks/exhaustive-deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exampleId, kind, autoLoad])

  const buttonLabel = loading ? 'Loading…' : autoLoad ? 'Load more' : page === 0 ? 'Load results' : 'Load more'

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r, i) =>
          kind === 'attendees' ? (
            <PersonCard key={i} person={r as IndividualRecord} exampleId={exampleId} />
          ) : (
            <CompanyCard key={i} company={r as CompanyRecord} exampleId={exampleId} />
          ),
        )}
      </div>
      {next && (
        <button
          disabled={loading}
          onClick={() => void loadPage(page + 1)}
          className="mx-auto mt-6 block rounded-md bg-brand px-4 py-2 text-white"
        >
          {buttonLabel}
        </button>
      )}
    </div>
  )
}
