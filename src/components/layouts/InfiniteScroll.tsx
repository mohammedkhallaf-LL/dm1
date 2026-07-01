'use client'
import { useState } from 'react'
import type { ListLayoutProps } from './CardGrid.tsx'
import { PersonCard } from '../site/PersonCard.tsx'
import { CompanyCard } from '../site/CompanyCard.tsx'

const STEP = 60

// SSG renders ALL items in the DOM (scanner-friendly); items past `shown` get
// `hidden` (display:none) instead of being sliced out, so a static-HTML scanner
// still sees every record. The button only toggles visibility, never removes
// items from render output.
export function InfiniteScroll({ people, companies, exampleId }: ListLayoutProps) {
  const [shown, setShown] = useState(STEP)
  const total = people?.length ?? companies?.length ?? 0
  return (
    <div className="p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {people?.map((p, i) => (
          <div key={p.id} className={i >= shown ? 'hidden' : undefined}>
            <PersonCard person={p} exampleId={exampleId} />
          </div>
        ))}
        {companies?.map((c, i) => (
          <div key={c.id} className={i >= shown ? 'hidden' : undefined}>
            <CompanyCard company={c} exampleId={exampleId} />
          </div>
        ))}
      </div>
      {shown < total && (
        <button onClick={() => setShown((s) => s + STEP)} className="mx-auto mt-6 block rounded-md bg-brand px-4 py-2 text-white hover:bg-brand-hover">
          Load more ({total - shown} remaining)
        </button>
      )}
    </div>
  )
}
