# Aritfy

A web-based, single-canvas design editor built with Next.js, React, TypeScript and Fabric.js.

## Features

- Account sign-up and sign-in, saved projects and project duplication.
- A template gallery and editable canvas with text, shapes, drawing and images.
- Typography, color, stroke, opacity, image filters and object stacking controls.
- Undo/redo, automatic project saving, workspace resizing and zoom/pan.
- PNG, JPEG, SVG and editable JSON export. JSON design import.
- Optional image-generation, background-removal, uploads and Stripe subscription integrations.

Provider-backed features require their own server configuration. Their presence in the interface is not proof that a provider, payment flow or model is configured or has passed an integration test. This project does not implement multi-slide presentations, PDF/WebP export or ZIP/bulk export.

## Development

Use Node.js 22 and pnpm 10.34.9. `pnpm-lock.yaml` is the canonical dependency lockfile.

```sh
corepack enable
corepack prepare pnpm@10.34.9 --activate
pnpm install --frozen-lockfile
pnpm dev
```

The development command uses Next.js experimental HTTPS. Read its output for the local URL. Add the required environment variables in `.env.local` before starting; never commit that file.

### Environment configuration

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Server-side Neon/PostgreSQL connection string. The legacy `NEXT_PUBLIC_DATABASE_URL` is temporarily accepted for existing deployments, but should be migrated to the private name. |
| `AUTH_SECRET` | Auth.js session secret. |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Optional Google OAuth application credentials. |
| `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` | Optional GitHub OAuth application credentials. |
| `NEXT_PUBLIC_APP_URL` | Canonical application URL used for billing return links. Browser API calls stay on the current origin. |
| `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY` | Existing image-search integration configuration. |
| `UPLOADTHING_TOKEN` | Optional UploadThing configuration. |
| `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` | Optional paid subscriptions. Configure a test environment before testing payment flows. |
| `GOOGLE_API_KEY` or `GEMINI_API_KEY` | Optional server-side Google image-generation key. |
| `GOOGLE_IMAGE_MODEL` | An explicitly configured, image-capable Google model. No model availability is assumed. |
| `HUGGINGFACE_API_TOKEN` | Optional Hugging Face provider access. |
| `GENERATE_IMAGE_MODAL_ENDPOINT`, `REMOVE_BG_MODEL`, `API_KEY` | Optional owner-configured generation/background-removal service endpoints and their API key. |
| `DEMO_PREMIUM_USER_IDS` | Optional comma-separated internal user IDs granted app-level Demo Premium by the owner. Empty means no demo grants. |

Demo Premium is an app entitlement, not a Stripe subscription. It creates no payment-provider records and does not authorize provider charges. Checkout and billing are disabled for these demo users. Remove an ID from the server allowlist to revoke its grant.

Review the Drizzle schema and migrations before applying database changes. Do not run migration commands against an existing production database without reviewing their effect.

## Checks

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Tests cover history branching and save suppression, PNG/JPEG/SVG export paths and viewport restoration, persistence of editor property changes, demo entitlement isolation, and current/legacy invoice subscription references. They use fixtures/mocks and do not prove real payment, AI or storage integrations work. Build-time TypeScript and lint failures are not ignored.

## Security and operations

Keep provider keys server-side, out of source and logs. Removing a leaked key from a file does not revoke it; replace it with the provider, update the deployment configuration, review usage, then revoke the old credential. Review dependency audit results and verify application behavior after updates. A clean audit does not prove an application is secure.

## Self-contained templates and safe loading

Three editable vector templates are included with the app and use local thumbnails and system fonts, without an external image host. Existing saved templates are retained. Some older templates depend on external assets that may be unavailable. If objects fail to load, the editor blocks editing and autosave rather than overwriting the stored design with a partial canvas. JSON import uses a labeled file input and accepts files up to 20 MB.
