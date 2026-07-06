import type { faker as Faker } from '@faker-js/faker'

export interface GeoTuple { city: string; region: string; country: string }

/**
 * Curated, INTERNALLY-COHERENT (city, region, country) tuples with realistic
 * B2B-conference clustering. Weights approximate verified distributions
 * (SaaStr US-state table: CA 41.9%, NY 8.8%, TX 6.5%, MA 3.4%, WA 2.9%, GA 2.5%;
 * ~66% US / 33% international; ~9-10 countries cover the bulk). Non-US regions are
 * real sub-national names (never US states). Source: deep-research digest 2026-07-06.
 */
const ROWS: Array<{ t: GeoTuple; weight: number }> = [
  // US — heavy, CA-dominant
  { t: { city: 'San Francisco', region: 'California', country: 'United States' }, weight: 22 },
  { t: { city: 'San Jose', region: 'California', country: 'United States' }, weight: 8 },
  { t: { city: 'Los Angeles', region: 'California', country: 'United States' }, weight: 6 },
  { t: { city: 'New York', region: 'New York', country: 'United States' }, weight: 9 },
  { t: { city: 'Austin', region: 'Texas', country: 'United States' }, weight: 6 },
  { t: { city: 'Boston', region: 'Massachusetts', country: 'United States' }, weight: 4 },
  { t: { city: 'Seattle', region: 'Washington', country: 'United States' }, weight: 3 },
  { t: { city: 'Atlanta', region: 'Georgia', country: 'United States' }, weight: 3 },
  { t: { city: 'Chicago', region: 'Illinois', country: 'United States' }, weight: 3 },
  { t: { city: 'Denver', region: 'Colorado', country: 'United States' }, weight: 2 },
  // UK / EU
  { t: { city: 'London', region: 'England', country: 'United Kingdom' }, weight: 7 },
  { t: { city: 'Manchester', region: 'England', country: 'United Kingdom' }, weight: 2 },
  { t: { city: 'Berlin', region: 'Berlin', country: 'Germany' }, weight: 4 },
  { t: { city: 'Munich', region: 'Bavaria', country: 'Germany' }, weight: 2 },
  { t: { city: 'Amsterdam', region: 'North Holland', country: 'Netherlands' }, weight: 3 },
  { t: { city: 'Paris', region: 'Île-de-France', country: 'France' }, weight: 3 },
  { t: { city: 'Dublin', region: 'Leinster', country: 'Ireland' }, weight: 2 },
  { t: { city: 'Stockholm', region: 'Stockholm County', country: 'Sweden' }, weight: 2 },
  // India / APAC / Americas
  { t: { city: 'Bengaluru', region: 'Karnataka', country: 'India' }, weight: 6 },
  { t: { city: 'Mumbai', region: 'Maharashtra', country: 'India' }, weight: 3 },
  { t: { city: 'Singapore', region: 'Central Region', country: 'Singapore' }, weight: 3 },
  { t: { city: 'Sydney', region: 'New South Wales', country: 'Australia' }, weight: 2 },
  { t: { city: 'Toronto', region: 'Ontario', country: 'Canada' }, weight: 4 },
  { t: { city: 'São Paulo', region: 'São Paulo', country: 'Brazil' }, weight: 3 },
  { t: { city: 'Tel Aviv', region: 'Tel Aviv District', country: 'Israel' }, weight: 2 },
]

export const GEO_TUPLES: GeoTuple[] = ROWS.map((r) => r.t)

export function pickLocation(f: typeof Faker): GeoTuple {
  return f.helpers.weightedArrayElement(ROWS.map((r) => ({ value: r.t, weight: r.weight })))
}
