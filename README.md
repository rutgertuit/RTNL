# rutgertuit-web

Next.js 15 + plain CSS (token-driven). Cloud Run + Cloud CDN + Cloud Storage on GCP.

This is the scaffolded repo produced by Phase 3.2 Sub-Agent A. It is not yet provisioned to GCP — see `../docs/phase-3-runbook.md` for Rutger's go-live steps.

## Local development

```bash
cd web
npm install
npm run dev
# → http://localhost:3000
```

## Architecture

- **Framework:** Next.js 15 App Router, TypeScript strict
- **Styling:** Plain CSS with custom properties. `styles/variables.css` is the single source of truth for design tokens. **No Tailwind, no CSS-in-JS.**
- **Content:** `content/registry.json` is the metadata source of truth. Markdown holds prose only.
- **Maintenance:** Three loops architected under `maintenance/`. Activated in Phase 4, not v1.

## Conventions

- Each component is a folder: `Component.tsx` + `Component.css`
- Tokens consumed via `var(--token-name)` — never hard-code values
- Class names BEM-ish: `.component`, `.component__element`, `.component--modifier`

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Next dev server with HMR |
| `npm run build` | Production build (standalone output for Docker) |
| `npm run start` | Run the production build locally |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | Next lint |
| `npm run registry:validate` | Validate `content/registry.json` against the schema |

## Section structures (Phase 3.2 outputs)

Each section has 2 structural options to choose between at Gate 1:

- Business: `app/business/README.md`
- Creative: `app/creative/README.md`
- Technical: `app/technical/README.md`
- Media Kit: `app/media-kit/README.md`

## Deploy

Configured via `cloudbuild.yaml` once the GCP project is set up. See `../docs/phase-3-runbook.md`.
