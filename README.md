# Captello Summit — Envoy Scan-Target Demo

A Next.js site that the Captello Envoy extension scans during demos. 21 selectable
example event sites (Tech / Healthcare / Multi-industry), each with committed,
deterministic ground-truth data matching the extension's export schema.

## Commands
- `npm run generate` — regenerate committed fixtures from `src/examples/`
- `npm run dev` — local dev at http://localhost:3000
- `npm run build` — generate + `next build`
- `npm run typecheck` — `tsc --noEmit`

See `docs/superpowers/specs/2026-07-01-captello-summit-demo-design.md`.
