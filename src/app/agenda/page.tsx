import { resolveExampleId } from '../../lib/active-example.ts'
import { loadEvents, loadMeta } from '../../lib/data.ts'
import { SiteNav } from '../../components/site/SiteNav.tsx'
import { Footer } from '../../components/site/Footer.tsx'

export default async function AgendaPage({ searchParams }: { searchParams: Promise<{ example?: string }> }) {
  const { example } = await searchParams
  const id = resolveExampleId(example)
  const meta = loadMeta(id)
  const sessions = loadEvents(id)
  return (
    <>
      <SiteNav exampleId={id} meta={meta} />
      <h1 className="px-4 pt-8 pb-2 text-2xl font-bold text-foreground">Agenda <span className="text-sm font-normal text-muted-foreground">({sessions.length.toLocaleString()})</span></h1>
      <ul className="flex flex-col gap-3 p-4">
        {sessions.map((s) => (
          <li key={s.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-medium text-foreground">{s.name}</span>
              <span className="text-sm text-muted-foreground">{s.eventType}</span>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {new Date(s.startDate).toLocaleString()} – {new Date(s.endDate).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">{s.location}</div>
          </li>
        ))}
      </ul>
      <Footer />
    </>
  )
}
