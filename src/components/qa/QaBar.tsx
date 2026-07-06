'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { EXAMPLES } from '../../examples/index.ts'
import { exportCurrent } from './qa-export.ts'

const THEMES = [
  { key: 'tech', label: 'Tech / SaaS' },
  { key: 'health', label: 'Healthcare' },
  { key: 'multi', label: 'Multi-industry' },
] as const

export function QaBar() {
  const router = useRouter()
  const pathname = usePathname()
  const search = useSearchParams()
  const current = search.get('example') ?? EXAMPLES[0].id
  const [hidden, setHidden] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (search.get('qa') === '0') setHidden(true)
    const onKey = (e: KeyboardEvent) => { if (e.shiftKey && e.key.toLowerCase() === 'q') setHidden((h) => !h) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [search])

  if (hidden) return null
  const cfg = EXAMPLES.find((e) => e.id === current) ?? EXAMPLES[0]

  const onSwitch = (id: string) => {
    const sp = new URLSearchParams(Array.from(search.entries()))
    sp.set('example', id)
    router.push(`${pathname}?${sp.toString()}`)
  }
  const doExport = async (format: 'csv' | 'xlsx' | 'json') => {
    setBusy(true)
    try { await exportCurrent(current, format, 'truth') } finally { setBusy(false) }
  }

  return (
    <div className="sticky top-0 z-50 flex flex-wrap items-center gap-2 border-b border-border bg-[#1a1512] px-3 py-2 text-xs text-white">
      <span className="font-semibold text-brand">QA</span>
      <select value={current} onChange={(e) => onSwitch(e.target.value)} className="rounded bg-white/10 px-2 py-1 text-white">
        {THEMES.map((t) => (
          <optgroup key={t.key} label={t.label}>
            {EXAMPLES.filter((e) => e.theme === t.key).map((e) => (
              <option key={e.id} value={e.id} className="text-black">{e.order}. {e.eventName} [{e.difficulty}]</option>
            ))}
          </optgroup>
        ))}
      </select>
      <span className="text-white/60">{cfg.label}</span>
      <div className="ml-auto flex items-center gap-1">
        <span className="text-white/60">Export truth:</span>
        <button disabled={busy} onClick={() => doExport('csv')} className="rounded bg-white/10 px-2 py-1 hover:bg-white/20 disabled:opacity-50">CSV</button>
        <button disabled={busy} onClick={() => doExport('xlsx')} className="rounded bg-white/10 px-2 py-1 hover:bg-white/20 disabled:opacity-50">XLSX</button>
        <button disabled={busy} onClick={() => doExport('json')} className="rounded bg-white/10 px-2 py-1 hover:bg-white/20 disabled:opacity-50">JSON</button>
        <button onClick={() => setHidden(true)} className="rounded bg-white/10 px-2 py-1 hover:bg-white/20" title="Hide (Shift+Q)">✕</button>
      </div>
    </div>
  )
}
