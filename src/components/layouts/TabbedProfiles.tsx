import type { ListLayoutProps } from './CardGrid.tsx'
import { CardGrid } from './CardGrid.tsx'

// TabbedProfiles: same data, grouped visual (kept simple = CardGrid with a header band).
// The DOM difference (section grouping) is what varies the scan surface.
export function TabbedProfiles(props: ListLayoutProps) {
  return (
    <section data-layout="tabbed">
      <div className="border-b border-border bg-muted px-4 py-2 text-xs uppercase tracking-wide text-muted-foreground">Directory</div>
      <CardGrid {...props} />
    </section>
  )
}
