import { avatarProps } from '../../lib/generate/avatar.ts'

export function Avatar({ name, size = 48 }: { name: string; src?: string | null; size?: number }) {
  const { id, c1, c2, label } = avatarProps(name)
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" aria-label={`${label} avatar`} className="shrink-0 rounded-full">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
      </defs>
      <rect width="96" height="96" rx="48" fill={`url(#${id})`} />
      <text x="48" y="60" fontFamily="Inter, sans-serif" fontSize="38" fontWeight="600" fill="#fff" textAnchor="middle">{label}</text>
    </svg>
  )
}
