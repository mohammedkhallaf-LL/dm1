import type { ListLayoutProps } from './CardGrid.tsx'
import { CardGrid } from './CardGrid.tsx'
import { Pagination } from '../site/Pagination.tsx'

export function PaginatedList(props: ListLayoutProps) {
  return (
    <>
      <CardGrid {...props} />
      {props.baseHref && props.totalPages ? (
        <Pagination page={props.page ?? 1} totalPages={props.totalPages} baseHref={props.baseHref} query={`?example=${props.exampleId}`} />
      ) : null}
    </>
  )
}
