'use client'
import { useEffect, useState } from 'react'
import { PersonCard } from '../site/PersonCard.tsx'
import { CompanyCard } from '../site/CompanyCard.tsx'
import type { IndividualRecord, CompanyRecord } from '../../lib/types.ts'
import type { CursorEnvelope } from '../../lib/cursor-envelope.ts'
import { TOKEN_STORAGE_KEY } from '../../lib/cursor-envelope.ts'

type Role = 'attendee' | 'exhibitor'
type Row = IndividualRecord | CompanyRecord
interface Feed { rows: Row[]; next: string | null; started: boolean }
const EMPTY: Feed = { rows: [], next: null, started: false }
const LIMIT = 30

/**
 * Cursor-paged directory (mirrors the Erleah widget): the bearer token lives in
 * localStorage, nothing from the feed renders until the user clicks, and paging
 * never changes the URL.
 */
export function CursorDirectory({ exampleId, token }: { exampleId: string; token: string }) {
  const [role, setRole] = useState<Role>('attendee')
  const [feeds, setFeeds] = useState<Record<Role, Feed>>({ attendee: EMPTY, exhibitor: EMPTY })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  }, [token])

  async function load(r: Role) {
    setLoading(true)
    setError(null)
    try {
      const stored = localStorage.getItem(TOKEN_STORAGE_KEY) ?? ''
      const feed = feeds[r]
      const qs = new URLSearchParams({ role: r, limit: String(LIMIT) })
      if (feed.next) qs.set('cursor', feed.next)
      const res = await fetch(`/api/${exampleId}/directory?${qs}`, { headers: { Authorization: `Bearer ${stored}` } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const env: CursorEnvelope<Row> = await res.json()
      setFeeds((f) => ({ ...f, [r]: { rows: [...f[r].rows, ...env.data], next: env.next_cursor, started: true } }))
    } catch {
      setError('Could not load people.')
    } finally {
      setLoading(false)
    }
  }

  const feed = feeds[role]
  const noun = role === 'attendee' ? 'everyone' : 'all exhibitors'

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-2" role="tablist">
        {(['attendee', 'exhibitor'] as const).map((r) => (
          <button
            key={r}
            role="tab"
            aria-selected={role === r}
            onClick={() => setRole(r)}
            className={`rounded-md px-3 py-1.5 text-sm ${role === r ? 'bg-brand text-white' : 'bg-muted text-foreground'}`}
          >
            {r === 'attendee' ? 'Attendees' : 'Exhibitors'}
          </button>
        ))}
      </div>
      {!feed.started ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <h2 className="text-xl font-semibold text-foreground">Welcome to the event directory</h2>
          <p className="mt-2 text-sm text-muted-foreground">Meet the {role === 'attendee' ? 'people' : 'companies'} taking part.</p>
          <button
            disabled={loading}
            onClick={() => void load(role)}
            className="mx-auto mt-4 block rounded-md bg-brand px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? 'Loading…' : role === 'attendee' ? 'Browse everyone' : `Browse ${noun}`}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {feed.rows.map((r) =>
            role === 'attendee' ? (
              <PersonCard key={r.id} person={r as IndividualRecord} exampleId={exampleId} />
            ) : (
              <CompanyCard key={r.id} company={r as CompanyRecord} exampleId={exampleId} />
            ),
          )}
        </div>
      )}
      {error && <p className="mt-4 text-center text-sm text-destructive" role="alert">{error}</p>}
      {feed.started && feed.next && (
        <button
          disabled={loading}
          onClick={() => void load(role)}
          className="mx-auto mt-6 block rounded-md bg-brand px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Show more people'}
        </button>
      )}
    </div>
  )
}
