import type { ListLayoutProps } from './CardGrid.tsx'
import { DenseTable } from './DenseTable.tsx'

// SingleRoster = the entire set on one long page (no pagination). Reuse DenseTable body.
export function SingleRoster(props: ListLayoutProps) {
  return <DenseTable {...props} />
}
