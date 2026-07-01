import type { IndividualRecord, CompanyRecord } from './types'

// These must compile. `types` is multi-label; nullable fields accept null.
const ind: IndividualRecord = {
  id: '1', firstName: 'A', lastName: 'B', fullName: 'A B', email: null,
  title: null, types: ['attendees', 'speakers'], linkedin: null, twitter: null,
  instagram: null, profileUrl: null, photoUrl: null, bio: null, interests: null,
  company: null, companyWebsite: null, phone: null, city: null, country: null,
  region: null, industry: null, orgType: null, additionalInfo: {},
}
const co: CompanyRecord = {
  id: '2', name: 'Acme', website: null, phone: null, country: null, city: null,
  region: null, address: null, types: ['exhibitors'], industry: null,
  numEmployees: null, revenue: null, orgType: null, linkedin: null, facebook: null,
  twitter: null, instagram: null, youtube: null, description: null,
  profileUrl: null, additionalInfo: {},
}
void ind; void co
