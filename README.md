# Captello Summit — Envoy Scan-Target Demo

A Next.js site that the Captello Envoy extension scans during demos. 23 selectable
example event sites (Tech / Healthcare / Multi-industry), each with committed,
deterministic ground-truth data matching the extension's export schema.

## Commands
- `npm run generate` — regenerate committed fixtures from `src/examples/`
- `npm run dev` — local dev at http://localhost:3000
- `npm run build` — generate + `next build`
- `npm run typecheck` — `tsc --noEmit`

## JSON API

Read-only endpoints over the same fixtures, used by the `dm1-mob` React Native app.
All list endpoints share the `paginateEnvelope` shape
(`{ data, page, pageSize, total, totalPages, nextCursor }`) and accept `page`,
`pageSize` (max 100) and `q`. Every endpoint serves the `display` row, never `truth`.

| Endpoint | Returns |
| --- | --- |
| `GET /api/examples` | All example configs (id, event name, venue, dates, scale) |
| `GET /api/[example]` | `loadMeta` — config plus entity counts |
| `GET /api/[example]/attendees` | All individuals |
| `GET /api/[example]/speakers` | Individuals with `types` including `speakers` |
| `GET /api/[example]/exhibitors` | All companies |
| `GET /api/[example]/sponsors` | Companies with `types` including `sponsors` |
| `GET /api/[example]/agenda` | Sessions |
| `GET /api/[example]/directory?role=attendee\|exhibitor&limit=30[&cursor=…]` | Cursor feed (`cursor-feed` surface only). Requires `Authorization: Bearer <token>` (else 401 `{"error":"unauthorized"}`). Reply `{ data, total, next_cursor }`; `next_cursor` is opaque and `null` on the last page; `limit` default 30, max 100; bad cursor -> 400 |
| `GET /api/[example]/individuals/[id]` | One `IndividualRecord` |
| `GET /api/[example]/companies/[id]` | One `CompanyRecord` |

Speakers and sponsors reuse the same `types` predicates as `/speakers` and
`/sponsors`. Serve the API to a phone with `npm run dev -- --hostname 0.0.0.0`.

### Cursor feed (Erleah-style directory)

Example `erleah-style-directory-2026` (surface `cursor-feed`, 130 people / 40 companies) pages like
the real Erleah attendee directory. Run `npm run dev` and open
`http://localhost:3000/directory?example=erleah-style-directory-2026`. Nothing renders from the
feed until "Browse everyone" is clicked; "Show more people" appends the next cursor page; the URL never changes.

**Test fixture token (not a secret):** `demo.<exampleId>.<seed>`, i.e.
`demo.erleah-style-directory-2026.308`. The page writes it to `localStorage` key
`summit_widget_token` on mount and sends it as `Authorization: Bearer <token>` on every request.
`/attendees` and `/exhibitors` redirect to `/directory` for this example.

See `docs/superpowers/specs/2026-07-01-captello-summit-demo-design.md`.
