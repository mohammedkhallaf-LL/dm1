import type { ExampleConfig } from '../index.ts'
import { TECH_INDUSTRIES, TECH_TITLES, TECH_TOPICS } from '../pools.ts'

const base = {
  theme: 'tech' as const,
  industryPool: TECH_INDUSTRIES,
  titlePool: TECH_TITLES,
  sessionTopics: TECH_TOPICS,
}

export const techExamples: ExampleConfig[] = [
  { ...base, id: 'captello-summit-2026', order: 1, eventName: 'Captello Summit 2026', tagline: 'Where revenue teams meet the AI-native stack', venue: 'Moscone West', city: 'San Francisco', country: 'United States', dates: { start: '2026-09-14', end: '2026-09-16' }, seed: 101, difficulty: 'hard', layout: 'single-roster', scale: { individuals: 1500, companies: 700, sessions: 60 }, coverage: { entities: ['individuals', 'companies', 'events'], emailsInline: false, fieldFullness: 'full' } },
  { ...base, id: 'cloudcon-2026', order: 2, eventName: 'CloudCon 2026', tagline: 'Infrastructure for builders', venue: 'Austin Convention Center', city: 'Austin', country: 'United States', dates: { start: '2026-05-04', end: '2026-05-05' }, seed: 102, difficulty: 'easy', layout: 'card-grid', scale: { individuals: 50, companies: 0, sessions: 8 }, coverage: { entities: ['individuals'], emailsInline: true, fieldFullness: 'full' } },
  { ...base, id: 'devworld-2026', order: 3, eventName: 'DevWorld 2026', tagline: 'The developer experience conference', venue: 'RAI Amsterdam', city: 'Amsterdam', country: 'Netherlands', dates: { start: '2026-06-10', end: '2026-06-12' }, seed: 103, difficulty: 'medium', layout: 'dense-table', scale: { individuals: 500, companies: 200, sessions: 40 }, coverage: { entities: ['individuals', 'companies', 'events'], emailsInline: true, fieldFullness: 'full' } },
  { ...base, id: 'saastock-north-2026', order: 4, eventName: 'SaaStock North 2026', tagline: 'Scale your SaaS', venue: 'ExCeL London', city: 'London', country: 'United Kingdom', dates: { start: '2026-10-20', end: '2026-10-22' }, seed: 104, difficulty: 'hard', layout: 'paginated-list', scale: { individuals: 900, companies: 300, sessions: 45 }, coverage: { entities: ['individuals', 'companies', 'events'], emailsInline: false, fieldFullness: 'partial' } },
  { ...base, id: 'ai-frontier-2026', order: 5, eventName: 'AI Frontier 2026', tagline: 'Applied machine learning in production', venue: 'Javits Center', city: 'New York', country: 'United States', dates: { start: '2026-11-02', end: '2026-11-03' }, seed: 105, difficulty: 'medium', layout: 'tabbed-profiles', scale: { individuals: 300, companies: 0, sessions: 30 }, coverage: { entities: ['individuals', 'events'], emailsInline: false, fieldFullness: 'full' } },
  { ...base, id: 'martech-expo-2026', order: 6, eventName: 'MarTech Expo 2026', tagline: 'The marketing technology showcase', venue: 'McCormick Place', city: 'Chicago', country: 'United States', dates: { start: '2026-04-15', end: '2026-04-16' }, seed: 106, difficulty: 'easy', layout: 'card-grid', scale: { individuals: 0, companies: 400, sessions: 0 }, coverage: { entities: ['companies'], emailsInline: false, fieldFullness: 'full' } },
  { ...base, id: 'fintech-connect-2026', order: 7, eventName: 'FinTech Connect 2026', tagline: 'The future of financial software', venue: 'Marina Bay Sands', city: 'Singapore', country: 'Singapore', dates: { start: '2026-12-01', end: '2026-12-03' }, seed: 107, difficulty: 'hard', layout: 'infinite-scroll', scale: { individuals: 1200, companies: 500, sessions: 50 }, coverage: { entities: ['individuals', 'companies', 'events'], emailsInline: true, fieldFullness: 'partial' } },
]
