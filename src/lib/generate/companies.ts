import type { CompanyRecord, CompanyScanType } from '../types.ts'
import type { ExampleConfig } from '../../examples/index.ts'
import { seededFaker, idFactory } from './seed.ts'

const COMPANY_TYPES: CompanyScanType[] = ['exhibitors', 'sponsors', 'others']

export function generateCompanies(cfg: ExampleConfig): CompanyRecord[] {
  const f = seededFaker(cfg.seed + 1)
  const nextId = idFactory('co')
  const out: CompanyRecord[] = []
  for (let i = 0; i < cfg.scale.companies; i++) {
    const id = nextId()
    const name = f.company.name()
    const domain = f.internet.domainName()
    const slug = domain.split('.')[0]
    const types: CompanyScanType[] = [f.helpers.arrayElement(COMPANY_TYPES)]
    if (f.datatype.boolean(0.25)) {
      const extra = f.helpers.arrayElement(COMPANY_TYPES)
      if (!types.includes(extra)) types.push(extra)
    }
    out.push({
      id,
      name,
      website: `https://www.${domain}`,
      phone: f.phone.number(),
      country: f.location.country(),
      city: f.location.city(),
      region: f.location.state(),
      address: f.location.streetAddress(),
      types,
      industry: f.helpers.arrayElement(cfg.industryPool),
      numEmployees: f.number.int({ min: 5, max: 25000 }),
      revenue: f.number.int({ min: 100000, max: 900000000 }),
      orgType: f.helpers.arrayElement(['Private', 'Public', 'Nonprofit', 'Startup']),
      linkedin: `https://www.linkedin.com/company/${slug}`,
      facebook: f.datatype.boolean(0.5) ? `https://facebook.com/${slug}` : null,
      twitter: f.datatype.boolean(0.4) ? `https://twitter.com/${slug}` : null,
      instagram: f.datatype.boolean(0.3) ? `https://instagram.com/${slug}` : null,
      youtube: f.datatype.boolean(0.2) ? `https://youtube.com/@${slug}` : null,
      description: f.company.catchPhrase(),
      profileUrl: `/exhibitors/${id}`,
      additionalInfo: { booth: `#${f.number.int({ min: 100, max: 4999 })}` },
    })
  }
  return out
}
