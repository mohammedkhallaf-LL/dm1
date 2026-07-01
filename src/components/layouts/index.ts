import type { LayoutVariant } from '../../examples/index.ts'
import type { ListLayoutProps } from './CardGrid.tsx'
import { CardGrid } from './CardGrid.tsx'
import { DenseTable } from './DenseTable.tsx'
import { PaginatedList } from './PaginatedList.tsx'
import { SingleRoster } from './SingleRoster.tsx'
import { TabbedProfiles } from './TabbedProfiles.tsx'
import { InfiniteScroll } from './InfiniteScroll.tsx'
import type { ComponentType } from 'react'

export type { ListLayoutProps }

const MAP: Record<LayoutVariant, ComponentType<ListLayoutProps>> = {
  'card-grid': CardGrid,
  'dense-table': DenseTable,
  'paginated-list': PaginatedList,
  'single-roster': SingleRoster,
  'tabbed-profiles': TabbedProfiles,
  'infinite-scroll': InfiniteScroll,
}

export function pickLayout(variant: LayoutVariant): ComponentType<ListLayoutProps> {
  return MAP[variant]
}
