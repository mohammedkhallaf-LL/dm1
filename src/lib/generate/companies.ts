import type { CompanyRecord, CompanyScanType } from '../types.ts'
import type { ExampleConfig } from '../../examples/index.ts'
import { seededFaker, idFactory } from './seed.ts'
import { companyName, domainFromName } from './names.ts'
import { pickLocation } from './geo.ts'

const COMPANY_TYPES: CompanyScanType[] = ['exhibitors', 'sponsors', 'others']

export function generateCompanies(cfg: ExampleConfig): CompanyRecord[] {
  const f = seededFaker(cfg.seed + 1)
  const nextId = idFactory('co')
  const out: CompanyRecord[] = []
  for (let i = 0; i < cfg.scale.companies; i++) {
    const id = nextId()
    const name = companyName(f, cfg.theme)
    const host = domainFromName(f, name, cfg.theme)
    const slug = host.split('.')[0]
    const loc = pickLocation(f)
    const types: CompanyScanType[] = [f.helpers.arrayElement(COMPANY_TYPES)]
    if (f.datatype.boolean(0.25)) {
      const extra = f.helpers.arrayElement(COMPANY_TYPES)
      if (!types.includes(extra)) types.push(extra)
    }
    const isSponsor = types.includes('sponsors')
    const sponsorTier = isSponsor
      ? f.helpers.weightedArrayElement([
          { value: 'Diamond', weight: 1 }, { value: 'Platinum', weight: 2 },
          { value: 'Gold', weight: 4 }, { value: 'Silver', weight: 8 }, { value: 'Bronze', weight: 20 },
        ])
      : null
    out.push({
      id,
      name,
      website: `https://www.${host}`,
      phone: f.phone.number(),
      country: loc.country,
      city: loc.city,
      region: loc.region,
      address: f.location.streetAddress(),
      types,
      industry: f.helpers.arrayElement(cfg.industryPool), // TODO(realism): align industry/orgType with event theme (deferred)
      numEmployees: f.number.int({ min: 5, max: 25000 }), // TODO(realism): derive revenue from headcount via size-scaled RPE (deferred)
      revenue: f.number.int({ min: 100000, max: 900000000 }),
      orgType: f.helpers.arrayElement(['Private', 'Public', 'Nonprofit', 'Startup']),
      linkedin: `https://www.linkedin.com/company/${slug}`,
      facebook: f.datatype.boolean(0.5) ? `https://facebook.com/${slug}` : null,
      twitter: f.datatype.boolean(0.4) ? `https://twitter.com/${slug}` : null,
      instagram: f.datatype.boolean(0.3) ? `https://instagram.com/${slug}` : null,
      youtube: f.datatype.boolean(0.2) ? `https://youtube.com/@${slug}` : null,
      description: f.company.catchPhrase(), // TODO(realism): real company blurb (deferred — low priority)
      profileUrl: `/exhibitors/${id}`,
      additionalInfo: sponsorTier ? { booth: `#${f.number.int({ min: 100, max: 4999 })}`, sponsorTier } : { booth: `#${f.number.int({ min: 100, max: 4999 })}` },
    })
  }
  return out
}
