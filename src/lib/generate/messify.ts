import type { IndividualRecord, CompanyRecord } from '../types.ts'
import type { ExampleConfig } from '../../examples/index.ts'

function obfuscateEmail(email: string): string {
  return email.replace('@', ' [at] ').replace(/\.([a-z]+)$/i, ' dot $1')
}
const EMOJI = ['🚀', '✨', '💡', '🔥']

/** Returns a display-corrupted COPY. Ground-truth (input) is never mutated. */
export function messifyIndividual(rec: IndividualRecord, cfg: ExampleConfig, rand: () => number): IndividualRecord {
  const d = { ...rec, additionalInfo: { ...rec.additionalInfo } }
  if (cfg.difficulty === 'easy') return d
  const drop = (v: string | null) => (rand() < 0.2 ? (rand() < 0.5 ? null : 'N/A') : v)
  // medium: drop optional fields, mixed case
  d.title = drop(d.title)
  d.bio = drop(d.bio)
  d.interests = drop(d.interests)
  d.twitter = drop(d.twitter)
  if (rand() < 0.3 && d.city) d.city = d.city.toUpperCase()
  let emailAlreadyObfuscated = false
  if (cfg.difficulty === 'hard') {
    if (rand() < 0.25) { const t = d.firstName; d.firstName = d.lastName; d.lastName = t } // swap
    if (rand() < 0.2) d.fullName = `${d.fullName}  ${EMOJI[Math.floor(rand() * EMOJI.length)]}` // emoji + double space
    if (rand() < 0.3 && d.email) { d.email = obfuscateEmail(d.email); emailAlreadyObfuscated = true } // obfuscated
    if (rand() < 0.15 && d.title && cfg.titlePool?.[0]) d.title = `${d.title} / ${cfg.titlePool[0]}` // multi-value cell
  }
  // Cloudflare-style email obfuscation: the visible text a pre-JS DOM scan sees is the
  // literal placeholder; the real address lives only in truth. Source: deep-research 2026-07-06.
  // Mutually exclusive with the [at]/dot obfuscation above — only one email transform per draw.
  const apiSurface = (cfg as { surface?: string }).surface?.startsWith('api')
  if ((cfg.difficulty === 'hard' || apiSurface) && !emailAlreadyObfuscated && d.email && rand() < 0.35) {
    d.email = '[email protected]'
  }
  return d
}

export function messifyCompany(rec: CompanyRecord, cfg: ExampleConfig, rand: () => number): CompanyRecord {
  const d = { ...rec, additionalInfo: { ...rec.additionalInfo } }
  if (cfg.difficulty === 'easy') return d
  const drop = (v: string | null) => (rand() < 0.2 ? (rand() < 0.5 ? null : 'N/A') : v)
  d.phone = drop(d.phone)
  d.address = drop(d.address)
  d.description = drop(d.description)
  if (cfg.difficulty === 'hard') {
    if (rand() < 0.2) d.name = `${d.name}   ${EMOJI[Math.floor(rand() * EMOJI.length)]}`
    if (rand() < 0.2 && d.website) d.website = d.website.replace('https://www.', '')
  }
  return d
}
