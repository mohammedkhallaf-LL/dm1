import { notFound } from 'next/navigation'
import { resolveExampleId } from '../../lib/active-example.ts'
import { loadMeta } from '../../lib/data.ts'
import { cursorToken } from '../../lib/cursor-envelope.ts'
import { CursorDirectory } from '../../components/layouts/CursorDirectory.tsx'
import { SiteNav } from '../../components/site/SiteNav.tsx'
import { Footer } from '../../components/site/Footer.tsx'

export default async function DirectoryPage({ searchParams }: { searchParams: Promise<{ example?: string }> }) {
  const { example } = await searchParams
  const id = resolveExampleId(example)
  const meta = loadMeta(id)
  if (meta.config.surface !== 'cursor-feed') notFound()
  return (
    <>
      <SiteNav exampleId={id} meta={meta} />
      <h1 className="px-4 pt-8 pb-2 text-2xl font-bold text-foreground">Directory</h1>
      <CursorDirectory exampleId={id} token={cursorToken(id, meta.config.seed)} />
      <Footer />
    </>
  )
}
