/**
 * Cursor-feed envelope, modelled on the Erleah attendee directory:
 * `{ data, total, next_cursor }`. The cursor is opaque (base64url of
 * `{"o":<offset>,"s":<seed>}`), never a page number.
 */
export interface CursorEnvelope<T> {
  data: T[]
  total: number
  next_cursor: string | null
}

export const CURSOR_DEFAULT_LIMIT = 30
export const CURSOR_MAX_LIMIT = 100
export const TOKEN_STORAGE_KEY = 'summit_widget_token'

/** Fixed fake bearer token per example. A test fixture, NOT a secret. */
export function cursorToken(exampleId: string, seed: number): string {
  return `demo.${exampleId}.${seed}`
}

export function isAuthorized(header: string | null, exampleId: string, seed: number): boolean {
  return header === `Bearer ${cursorToken(exampleId, seed)}`
}

export function encodeCursor(offset: number, seed: number): string {
  return Buffer.from(JSON.stringify({ o: offset, s: seed }), 'utf8').toString('base64url')
}

/** Returns the offset, or null when the cursor is malformed / tampered / from another example. */
export function decodeCursor(cursor: string, seed: number): number | null {
  try {
    if (!/^[A-Za-z0-9_-]+$/.test(cursor)) return null
    const obj = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as { o?: unknown; s?: unknown }
    if (!obj || typeof obj.o !== 'number' || !Number.isInteger(obj.o) || obj.o < 0) return null
    if (obj.s !== seed) return null
    return obj.o
  } catch {
    return null
  }
}

export function parseLimit(raw: string | null): number {
  const n = raw === null ? NaN : Number(raw)
  if (!Number.isFinite(n)) return CURSOR_DEFAULT_LIMIT
  return Math.min(Math.max(1, Math.floor(n)), CURSOR_MAX_LIMIT)
}

/** Returns the envelope, or `null` when the cursor is invalid (caller answers 400). */
export function cursorPage<T>(items: T[], limit: number, cursor: string | null, seed: number): CursorEnvelope<T> | null {
  let offset = 0
  if (cursor !== null) {
    const o = decodeCursor(cursor, seed)
    if (o === null || o > items.length) return null
    offset = o
  }
  const end = offset + limit
  return {
    data: items.slice(offset, end),
    total: items.length,
    next_cursor: end < items.length ? encodeCursor(end, seed) : null,
  }
}
