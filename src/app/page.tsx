import { resolveExampleId } from '../lib/active-example.ts'
import { loadMeta } from '../lib/data.ts'
import { Hero } from '../components/site/Hero.tsx'
import { SiteNav } from '../components/site/SiteNav.tsx'
import { Footer } from '../components/site/Footer.tsx'

export default async function Home({ searchParams }: { searchParams: Promise<{ example?: string }> }) {
  const { example } = await searchParams
  const id = resolveExampleId(example)
  const meta = loadMeta(id)
  return (
    <>
      <SiteNav exampleId={id} meta={meta} />
      <Hero meta={meta} />
      <Footer />
    </>
  )
}
