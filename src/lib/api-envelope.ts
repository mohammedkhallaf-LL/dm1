export interface ApiEnvelope<T> {
  data: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
  nextCursor: string | null
}

const MAX_PAGE_SIZE = 100

export function paginateEnvelope<T>(
  items: T[],
  page: number,
  pageSize: number,
  q: string | null,
  searchKeys: (keyof T)[],
): ApiEnvelope<T> {
  const size = Math.min(Math.max(1, pageSize | 0), MAX_PAGE_SIZE)
  const filtered = q && q.trim()
    ? items.filter((it) => searchKeys.some((k) => String(it[k] ?? '').toLowerCase().includes(q.toLowerCase())))
    : items
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / size))
  const p = Math.min(Math.max(1, page | 0), totalPages)
  const data = filtered.slice((p - 1) * size, p * size)
  return { data, page: p, pageSize: size, total, totalPages, nextCursor: p < totalPages ? String(p + 1) : null }
}
