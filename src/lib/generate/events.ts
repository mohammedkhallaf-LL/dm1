import type { EventRecord } from '../types.ts'
import type { ExampleConfig } from '../../examples/index.ts'
import { seededFaker, idFactory } from './seed.ts'
import { sessionAbstract, sessionType, sessionLevel } from './abstracts.ts'

export function generateEvents(cfg: ExampleConfig): EventRecord[] {
  const f = seededFaker(cfg.seed + 3)
  const nextId = idFactory('ev')
  const start = new Date(cfg.dates.start).getTime()
  const out: EventRecord[] = []
  for (let i = 0; i < cfg.scale.sessions; i++) {
    const id = nextId()
    const dayOffset = f.number.int({ min: 0, max: 2 }) * 86400000
    const hour = f.number.int({ min: 9, max: 16 })
    const s = start + dayOffset + hour * 3600000
    const name = f.helpers.arrayElement(cfg.sessionTopics)
    out.push({
      id,
      name,
      eventUrl: `/agenda#${id}`,
      startDate: s,
      endDate: s + 3600000,
      location: f.helpers.arrayElement(['Main Stage', 'Room A', 'Room B', 'Workshop Hall', 'Expo Theater']),
      eventType: sessionType(f),
      eventOverview: `${sessionLevel(f)}. ${sessionAbstract(f, name)}`,
    })
  }
  return out
}
