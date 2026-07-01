/** Multi-label participant taxonomy — mirrors captello-envoy schema.ts. */
export type ScanType = 'attendees' | 'speakers' | 'exhibitors' | 'sponsors' | 'others'
export type CompanyScanType = Extract<ScanType, 'exhibitors' | 'sponsors' | 'others'>

export type AdditionalInfo = Record<string, unknown>

/**
 * A person record. The keys through `additionalInfo` are the EXACT export
 * contract (INDIVIDUAL_FIELDS). `id`/`eventId` are generation-only (never exported).
 */
export interface IndividualRecord {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string | null
  title: string | null
  types: ScanType[]
  linkedin: string | null
  twitter: string | null
  instagram: string | null
  profileUrl: string | null
  photoUrl: string | null
  bio: string | null
  interests: string | null
  company: string | null
  companyWebsite: string | null
  phone: string | null
  city: string | null
  country: string | null
  region: string | null
  industry: string | null
  orgType: string | null
  additionalInfo: AdditionalInfo
}

/** A company record. Keys through `additionalInfo` are the export contract (COMPANY_FIELDS). */
export interface CompanyRecord {
  id: string
  name: string
  website: string | null
  phone: string | null
  country: string | null
  city: string | null
  region: string | null
  address: string | null
  types: CompanyScanType[]
  industry: string | null
  numEmployees: number | null
  revenue: number | null
  orgType: string | null
  linkedin: string | null
  facebook: string | null
  twitter: string | null
  instagram: string | null
  youtube: string | null
  description: string | null
  profileUrl: string | null
  additionalInfo: AdditionalInfo
}

/** Event/session — mirrors EI EventResponse. */
export interface EventRecord {
  id: string
  name: string
  eventUrl: string
  startDate: number   // epoch ms
  endDate: number
  location: string
  eventType: string
  eventOverview: string
}
