<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Captello Summit demo — project rules

- This is the Envoy **scan-target** demo. Data field shape MUST match the extension's
  export contract (`captello-envoy/src/sidepanel/lib/export.ts` + `schema.ts`).
- NEVER use real human faces. All avatars/logos are generated SVG (see `src/lib/generate/avatar.ts`).
- `messify` corrupts only the RENDERED value; exported ground-truth stays clean.
- Regenerate fixtures with `npm run generate` (deterministic per example seed).
