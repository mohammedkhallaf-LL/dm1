import type { IndividualRecord, ScanType, CompanyRecord } from '../types.ts'
import type { ExampleConfig } from '../../examples/index.ts'
import { seededFaker, idFactory } from './seed.ts'
import { personAvatarSvg, svgToDataUri } from './avatar.ts'

const IND_TYPES: ScanType[] = ['attendees', 'speakers', 'exhibitors', 'sponsors', 'others']

export function generateIndividuals(cfg: ExampleConfig, companies: CompanyRecord[]): IndividualRecord[] {
  const f = seededFaker(cfg.seed + 2)
  const nextId = idFactory('in')
  const out: IndividualRecord[] = []
  for (let i = 0; i < cfg.scale.individuals; i++) {
    const id = nextId()
    const firstName = f.person.firstName()
    const lastName = f.person.lastName()
    const fullName = `${firstName} ${lastName}`
    const co = companies.length ? f.helpers.arrayElement(companies) : null
    const types: ScanType[] = [f.helpers.arrayElement(IND_TYPES)]
    if (f.datatype.boolean(0.2)) {
      const extra = f.helpers.arrayElement(IND_TYPES)
      if (!types.includes(extra)) types.push(extra)
    }
    const domain = co ? new URL(co.website!).hostname.replace(/^www\./, '') : f.internet.domainName()
    out.push({
      id,
      firstName,
      lastName,
      fullName,
      email: f.internet.email({ firstName, lastName, provider: domain }).toLowerCase(),
      title: f.helpers.arrayElement(cfg.titlePool),
      types,
      linkedin: `https://www.linkedin.com/in/${f.internet.username({ firstName, lastName }).toLowerCase()}`,
      twitter: f.datatype.boolean(0.3) ? `https://twitter.com/${f.internet.username()}` : null,
      instagram: f.datatype.boolean(0.15) ? `https://instagram.com/${f.internet.username()}` : null,
      profileUrl: `/attendees/${id}`,
      photoUrl: svgToDataUri(personAvatarSvg(fullName)),
      bio: f.datatype.boolean(0.6) ? f.person.bio() : null,
      interests: f.datatype.boolean(0.5) ? f.helpers.arrayElements(cfg.sessionTopics, { min: 1, max: 3 }).join(', ') : null,
      company: co?.name ?? f.company.name(),
      companyWebsite: co?.website ?? `https://www.${domain}`,
      phone: f.phone.number(),
      city: f.location.city(),
      country: f.location.country(),
      region: f.location.state(),
      industry: co?.industry ?? f.helpers.arrayElement(cfg.industryPool),
      orgType: f.helpers.arrayElement(['Private', 'Public', 'Nonprofit', 'Startup']),
      additionalInfo: {},
    })
  }
  return out
}
