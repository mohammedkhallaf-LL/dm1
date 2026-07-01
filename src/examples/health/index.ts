import type { ExampleConfig } from '../index.ts'
import { HEALTH_INDUSTRIES, HEALTH_TITLES, HEALTH_TOPICS } from '../pools.ts'

const base = {
  theme: 'health' as const,
  industryPool: HEALTH_INDUSTRIES,
  titlePool: HEALTH_TITLES,
  sessionTopics: HEALTH_TOPICS,
}

export const healthExamples: ExampleConfig[] = [
  { ...base, id: 'medtech-expo-2026', order: 8, eventName: 'MedTech Expo 2026', tagline: 'Where medical device innovation meets the market', venue: 'Boston Convention & Exhibition Center', city: 'Boston', country: 'United States', dates: { start: '2026-03-10', end: '2026-03-12' }, seed: 201, difficulty: 'medium', layout: 'dense-table', scale: { individuals: 500, companies: 250, sessions: 30 }, coverage: { entities: ['individuals', 'companies', 'events'], emailsInline: true, fieldFullness: 'full' } },
  { ...base, id: 'healthit-summit-2026', order: 9, eventName: 'HealthIT Summit 2026', tagline: 'Interoperability and the connected patient', venue: 'Gaylord National Resort', city: 'National Harbor', country: 'United States', dates: { start: '2026-02-24', end: '2026-02-25' }, seed: 202, difficulty: 'easy', layout: 'card-grid', scale: { individuals: 120, companies: 0, sessions: 0 }, coverage: { entities: ['individuals'], emailsInline: true, fieldFullness: 'full' } },
  { ...base, id: 'pharmaworld-2026', order: 10, eventName: 'PharmaWorld 2026', tagline: 'Global pharma manufacturing and supply', venue: 'Messe Basel', city: 'Basel', country: 'Switzerland', dates: { start: '2026-06-16', end: '2026-06-18' }, seed: 203, difficulty: 'hard', layout: 'paginated-list', scale: { individuals: 0, companies: 800, sessions: 0 }, coverage: { entities: ['companies'], emailsInline: false, fieldFullness: 'full' } },
  { ...base, id: 'digital-health-now-2026', order: 11, eventName: 'Digital Health Now 2026', tagline: 'Software, sensors, and the future of care', venue: 'Las Vegas Convention Center', city: 'Las Vegas', country: 'United States', dates: { start: '2026-01-13', end: '2026-01-15' }, seed: 204, difficulty: 'medium', layout: 'tabbed-profiles', scale: { individuals: 350, companies: 150, sessions: 30 }, coverage: { entities: ['individuals', 'companies', 'events'], emailsInline: false, fieldFullness: 'partial' } },
  { ...base, id: 'clinical-innovation-2026', order: 12, eventName: 'Clinical Innovation 2026', tagline: 'Advancing trial design and patient outcomes', venue: 'McCormick Place', city: 'Chicago', country: 'United States', dates: { start: '2026-08-05', end: '2026-08-07' }, seed: 205, difficulty: 'hard', layout: 'single-roster', scale: { individuals: 600, companies: 0, sessions: 0 }, coverage: { entities: ['individuals'], emailsInline: false, fieldFullness: 'full' } },
  { ...base, id: 'bioconnect-2026', order: 13, eventName: 'BioConnect 2026', tagline: 'Biotech partnerships and pipeline deals', venue: 'San Diego Convention Center', city: 'San Diego', country: 'United States', dates: { start: '2026-06-22', end: '2026-06-23' }, seed: 206, difficulty: 'easy', layout: 'card-grid', scale: { individuals: 0, companies: 200, sessions: 0 }, coverage: { entities: ['companies'], emailsInline: false, fieldFullness: 'full' } },
  { ...base, id: 'nurseleaders-2026', order: 14, eventName: 'NurseLeaders 2026', tagline: 'Leadership and staffing in modern nursing', venue: 'Music City Center', city: 'Nashville', country: 'United States', dates: { start: '2026-04-28', end: '2026-04-29' }, seed: 207, difficulty: 'medium', layout: 'dense-table', scale: { individuals: 450, companies: 0, sessions: 0 }, coverage: { entities: ['individuals'], emailsInline: true, fieldFullness: 'full' } },
]
