import Link from 'next/link'
import type { IndividualRecord } from '../../lib/types.ts'
import { Avatar } from './Avatar.tsx'

export function PersonCard({ person, exampleId }: { person: IndividualRecord; exampleId: string }) {
  return (
    <Link href={`/attendees/${person.id}?example=${exampleId}`} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:border-brand">
      <Avatar name={person.fullName} src={person.photoUrl} />
      <div className="min-w-0">
        <div className="truncate font-medium text-foreground">{person.fullName}</div>
        <div className="truncate text-sm text-muted-foreground">{person.title ?? '—'}{person.company ? ` · ${person.company}` : ''}</div>
      </div>
    </Link>
  )
}
