import Link from 'next/link'
import type { loadMeta } from '../../lib/data.ts'
type Meta = ReturnType<typeof loadMeta>

type SectionKey = 'individuals' | 'companies' | 'events'
type LinkItem = { href: string; label: string }

const SECTION_LINKS: { key: SectionKey; items: LinkItem[] }[] = [
  { key: 'individuals', items: [{ href: '/attendees', label: 'Attendees' }, { href: '/speakers', label: 'Speakers' }] },
  { key: 'companies', items: [{ href: '/exhibitors', label: 'Exhibitors' }, { href: '/sponsors', label: 'Sponsors' }] },
  { key: 'events', items: [{ href: '/agenda', label: 'Agenda' }] },
]

export function SiteNav({ exampleId, meta }: { exampleId: string; meta: Meta }) {
  const q = `?example=${exampleId}`
  const links = SECTION_LINKS
    .filter((s) => meta.config.coverage.entities.includes(s.key as 'individuals' | 'companies' | 'events'))
    .flatMap((s) => s.items)
  return (
    <nav className="sticky top-0 z-20 flex items-center gap-1 border-b border-border bg-background/90 px-4 py-3 backdrop-blur">
      <Link href={`/${q}`} className="mr-4 font-bold text-brand">{meta.config.eventName}</Link>
      {links.map((l) => (
        <Link key={l.href} href={`${l.href}${q}`} className="rounded-md px-3 py-1.5 text-sm text-foreground hover:bg-muted">
          {l.label}
        </Link>
      ))}
    </nav>
  )
}
