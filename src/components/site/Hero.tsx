import type { loadMeta } from '../../lib/data.ts'
import { Countdown } from './Countdown.tsx'
import { StatBadge } from './StatBadge.tsx'
type Meta = ReturnType<typeof loadMeta>

/**
 * Pure presentation formatter for the hero's date range — inline on purpose
 * (not sourced from src/lib) since this is display-only logic.
 * Renders e.g. "Sep 14–16, 2026" or "Sep 30 – Oct 2, 2026".
 */
function formatDateRange(startIso: string, endIso: string): string {
  const start = new Date(`${startIso}T00:00:00`)
  const end = new Date(`${endIso}T00:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return `${startIso} – ${endIso}`
  }
  const month = (d: Date) => d.toLocaleDateString('en-US', { month: 'short' })
  const day = (d: Date) => d.getDate()
  const year = (d: Date) => d.getFullYear()

  if (year(start) !== year(end)) {
    return `${month(start)} ${day(start)}, ${year(start)} – ${month(end)} ${day(end)}, ${year(end)}`
  }
  if (month(start) !== month(end)) {
    return `${month(start)} ${day(start)} – ${month(end)} ${day(end)}, ${year(end)}`
  }
  if (day(start) !== day(end)) {
    return `${month(start)} ${day(start)}–${day(end)}, ${year(end)}`
  }
  return `${month(start)} ${day(start)}, ${year(end)}`
}

export function Hero({ meta }: { meta: Meta }) {
  const { config, counts } = meta
  return (
    <header className="bg-gradient-to-b from-brand-light to-background px-4 py-20 text-center">
      <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">{config.eventName}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{config.tagline}</p>
      <p className="mt-4 text-sm font-medium text-foreground">
        {formatDateRange(config.dates.start, config.dates.end)}
      </p>
      <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
          <path
            d="M12 22s7-7.58 7-13a7 7 0 1 0-14 0c0 5.42 7 13 7 13Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.75" />
        </svg>
        {config.venue}, {config.city}
      </p>
      <p className="mt-2 text-sm text-foreground">
        <Countdown target={config.dates.start} />
      </p>
      <div className="mt-8">
        <a
          href="#"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-brand px-8 font-medium text-white transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          Register
        </a>
      </div>
      <div className="mx-auto mt-8 grid max-w-2xl grid-cols-3 gap-3">
        <StatBadge label="Attendees" value={counts.individuals.toLocaleString()} />
        <StatBadge label="Exhibitors" value={counts.companies.toLocaleString()} />
        <StatBadge label="Sessions" value={counts.events.toLocaleString()} />
      </div>
    </header>
  )
}
