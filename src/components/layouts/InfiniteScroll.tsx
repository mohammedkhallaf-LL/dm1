'use client'
import { useState } from 'react'
import type { ListLayoutProps } from './CardGrid.tsx'
import { PersonCard } from '../site/PersonCard.tsx'
import { CompanyCard } from '../site/CompanyCard.tsx'

const STEP = 60

// SSG renders ALL items in the DOM (scanner-friendly); the button just reveals more visually.
export function InfiniteScroll({ people, companies, exampleId }: ListLayoutProps) {
  const [shown, setShown] = useState(STEP)
  const items = people ?? companies ?? []
  return (
    <div className="p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, shown).map((it) =>
          people ? <PersonCard key={it.id} person={it as never} exampleId={exampleId} />
                 : <CompanyCard key={it.id} company={it as never} exampleId={exampleId} />,
        )}
      </div>
      {shown < items.length && (
        <button onClick={() => setShown((s) => s + STEP)} className="mx-auto mt-6 block rounded-md bg-brand px-4 py-2 text-white hover:bg-brand-hover">
          Load more ({items.length - shown} remaining)
        </button>
      )}
    </div>
  )
}
