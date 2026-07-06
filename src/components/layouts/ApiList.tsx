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
  const [error, setError] = useState<string | null>(null)

  async function loadPage(p: number) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/${exampleId}/${kind}?page=${p}&pageSize=50`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const env: ApiEnvelope<IndividualRecord | CompanyRecord> = await res.json()
      setRows((r) => [...r, ...env.data])
      setNext(env.nextCursor)
      setPage(p)
    } catch {
      // Surface a recoverable error rather than leaving the button stuck on
      // "Loading…" — the user can retry the same page.
      setError('Could not load results.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Guard against React StrictMode's double-invoke in dev (would double-fetch page 1).
    let cancelled = false
    if (autoLoad && !cancelled) void loadPage(1) // eslint-disable-line react-hooks/exhaustive-deps
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exampleId, kind, autoLoad])

  // On error, retry the page we failed on: the next unfetched page is page+1,
  // but a failed load never advanced `page`, so page+1 is the correct retry target.
  const retryPage = page + 1
  const buttonLabel = loading
    ? 'Loading…'
    : error
      ? 'Retry'
      : autoLoad
        ? 'Load more'
        : page === 0
          ? 'Load results'
          : 'Load more'

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) =>
          kind === 'attendees' ? (
            <PersonCard key={r.id} person={r as IndividualRecord} exampleId={exampleId} />
          ) : (
            <CompanyCard key={r.id} company={r as CompanyRecord} exampleId={exampleId} />
          ),
        )}
      </div>
      {error && (
        <p className="mt-4 text-center text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {(next || error) && (
        <button
          disabled={loading}
          onClick={() => void loadPage(retryPage)}
          className="mx-auto mt-6 block rounded-md bg-brand px-4 py-2 text-white disabled:opacity-50"
        >
          {buttonLabel}
        </button>
      )}
    </div>
  )
}
