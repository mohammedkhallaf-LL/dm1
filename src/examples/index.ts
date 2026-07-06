export type ThemeKey = 'tech' | 'health' | 'multi'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type LayoutVariant =
  | 'card-grid' | 'dense-table' | 'paginated-list'
  | 'single-roster' | 'tabbed-profiles' | 'infinite-scroll'
export type SurfaceKind = 'ssr' | 'api-spa' | 'api-hybrid' | 'load-more'

export interface ExampleConfig {
  id: string
  order: number
  theme: ThemeKey
  eventName: string
  tagline: string
  venue: string
  city: string
  country: string
  dates: { start: string; end: string } // ISO date (YYYY-MM-DD)
  seed: number
  difficulty: Difficulty
  layout: LayoutVariant
  surface: SurfaceKind
  /** Human-readable complexity summary for the QA switcher, e.g.
   *  "Tech · hard · API-SPA · 900 people / 300 cos · partial fields · obfuscated emails". */
  label: string
  scale: { individuals: number; companies: number; sessions: number }
  coverage: {
    entities: Array<'individuals' | 'companies' | 'events'>
    emailsInline: boolean
    fieldFullness: 'full' | 'partial'
  }
  industryPool: string[]
  titlePool: string[]
  sessionTopics: string[]
}

import { techExamples } from './tech/index.ts'
import { healthExamples } from './health/index.ts'
import { multiExamples } from './multi/index.ts'

export const EXAMPLES: ExampleConfig[] = [
  ...techExamples,
  ...healthExamples,
  ...multiExamples,
].sort((a, b) => a.order - b.order)

export function getExample(id: string): ExampleConfig | undefined {
  return EXAMPLES.find((e) => e.id === id)
}

export const DEFAULT_EXAMPLE_ID = EXAMPLES[0].id
