import { EXAMPLES, DEFAULT_EXAMPLE_ID } from '../examples/index.ts'

export const EXAMPLE_PARAM = 'example'

export function resolveExampleId(raw: string | undefined): string {
  if (raw && EXAMPLES.some((e) => e.id === raw)) return raw
  return DEFAULT_EXAMPLE_ID
}
