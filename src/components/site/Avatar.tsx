import { personAvatarSvg, svgToDataUri } from '../../lib/generate/avatar.ts'

export function Avatar({ name, src, size = 48 }: { name: string; src?: string | null; size?: number }) {
  // Only ever render a data-URI SVG. If src isn't a generated SVG, regenerate from name.
  const uri = src && src.startsWith('data:image/svg+xml') ? src : svgToDataUri(personAvatarSvg(name))
  return (
    <img
      src={uri}
      width={size}
      height={size}
      alt={`${name} avatar`}
      className="rounded-full"
    />
  )
}
