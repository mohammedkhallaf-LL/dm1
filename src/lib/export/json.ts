export function toJson(individuals: unknown[], companies: unknown[]): string {
  return JSON.stringify({ individuals, companies }, null, 2)
}
