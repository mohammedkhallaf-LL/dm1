import { notFound } from 'next/navigation'
import { resolveExampleId } from '../../../lib/active-example.ts'
import { loadIndividuals, loadMeta } from '../../../lib/data.ts'
import { SiteNav } from '../../../components/site/SiteNav.tsx'
import { Footer } from '../../../components/site/Footer.tsx'
import { Avatar } from '../../../components/site/Avatar.tsx'
import { ObfuscatedEmail } from '../../../components/site/ObfuscatedEmail.tsx'

export default async function AttendeeDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ example?: string }> }) {
  const { id: personId } = await params
  const { example } = await searchParams
  const id = resolveExampleId(example)
  const meta = loadMeta(id)
  const row = loadIndividuals(id).find((r) => r.display.id === personId)
  if (!row) notFound()
  const p = row.display
  return (
    <>
      <SiteNav exampleId={id} meta={meta} />
      <article className="mx-auto max-w-2xl px-4 py-10">
        <div className="flex items-center gap-4">
          <Avatar name={p.fullName} src={p.photoUrl} size={80} />
          <div>
            <h1 className="text-2xl font-bold text-foreground">{p.fullName}</h1>
            <p className="text-muted-foreground">{p.title ?? '—'}{p.company ? ` · ${p.company}` : ''}</p>
          </div>
        </div>
        <dl className="mt-6 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-muted-foreground">Email</dt><dd className="text-foreground"><ObfuscatedEmail email={p.email} /></dd></div>
          <div><dt className="text-muted-foreground">Phone</dt><dd className="text-foreground">{p.phone ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">Company</dt><dd className="text-foreground">{p.company ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">Company Website</dt><dd className="truncate text-foreground">{p.companyWebsite ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">City</dt><dd className="text-foreground">{p.city ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">Region</dt><dd className="text-foreground">{p.region ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">Country</dt><dd className="text-foreground">{p.country ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">Industry</dt><dd className="text-foreground">{p.industry ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">Org Type</dt><dd className="text-foreground">{p.orgType ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">Type(s)</dt><dd className="text-foreground">{p.types.length ? p.types.join(', ') : '—'}</dd></div>
          <div><dt className="text-muted-foreground">LinkedIn</dt><dd className="truncate text-foreground">{p.linkedin ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">Twitter</dt><dd className="truncate text-foreground">{p.twitter ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">Instagram</dt><dd className="truncate text-foreground">{p.instagram ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">Interests</dt><dd className="text-foreground">{p.interests ?? '—'}</dd></div>
        </dl>
        {p.bio && <p className="mt-6 text-foreground">{p.bio}</p>}
      </article>
      <Footer />
    </>
  )
}
