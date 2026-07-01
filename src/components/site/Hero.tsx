import type { loadMeta } from '../../lib/data.ts'
import { Countdown } from './Countdown.tsx'
import { StatBadge } from './StatBadge.tsx'
type Meta = ReturnType<typeof loadMeta>

export function Hero({ meta }: { meta: Meta }) {
  const { config, counts } = meta
  return (
    <header className="bg-gradient-to-b from-brand-light to-background px-4 py-14 text-center">
      <h1 className="text-4xl font-bold text-foreground">{config.eventName}</h1>
      <p className="mt-2 text-lg text-muted-foreground">{config.tagline}</p>
      <p className="mt-4 text-sm text-foreground">
        {config.dates.start} – {config.dates.end} · {config.venue}, {config.city} ·{' '}
        <Countdown target={config.dates.start} />
      </p>
      <div className="mx-auto mt-8 grid max-w-2xl grid-cols-3 gap-3">
        <StatBadge label="Attendees" value={counts.individuals.toLocaleString()} />
        <StatBadge label="Exhibitors" value={counts.companies.toLocaleString()} />
        <StatBadge label="Sessions" value={counts.events.toLocaleString()} />
      </div>
    </header>
  )
}
