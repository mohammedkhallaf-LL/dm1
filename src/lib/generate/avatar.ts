/** Tiny deterministic string hash (FNV-1a) → non-negative int. */
function hash(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** First Unicode code point of a string (surrogate-pair safe — never splits an emoji). */
function firstChar(s: string): string {
  return Array.from(s)[0] ?? ''
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return Array.from(parts[0]).slice(0, 2).join('').toUpperCase()
  return (firstChar(parts[0]) + firstChar(parts[parts.length - 1])).toUpperCase()
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function hslPair(seed: number): [string, string] {
  const hue = seed % 360
  return [`hsl(${hue}, 65%, 45%)`, `hsl(${(hue + 40) % 360}, 65%, 35%)`]
}

/** Monogram avatar on a deterministic gradient. Pure SVG — never a real face. */
export function personAvatarSvg(name: string): string {
  const seed = hash(name)
  const [c1, c2] = hslPair(seed)
  const id = `g${seed}`
  const label = escapeXml(initials(name))
  return `<svg width="96" height="96" viewBox="0 0 96 96" role="img" aria-label="${label} avatar"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="96" height="96" rx="48" fill="url(#${id})"/><text x="48" y="60" font-family="Inter, sans-serif" font-size="38" font-weight="600" fill="#fff" text-anchor="middle">${label}</text></svg>`
}

/** Company logo tile (rounded square, monogram). Pure SVG. */
export function companyLogoSvg(name: string): string {
  const seed = hash(name)
  const [c1, c2] = hslPair(seed + 7)
  const id = `l${seed}`
  const label = escapeXml(initials(name))
  return `<svg width="96" height="96" viewBox="0 0 96 96" role="img" aria-label="${label} logo"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="96" height="96" rx="18" fill="url(#${id})"/><text x="48" y="60" font-family="Inter, sans-serif" font-size="34" font-weight="700" fill="#fff" text-anchor="middle">${label}</text></svg>`
}

export function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}
