@AGENTS.md

# open-knowledge

Course platform: one Next.js app with Payload v4 (beta) embedded. Setup and scripts: README.md.

## Documentation

`docs/` holds product and technical context: why things are the way they are, the invariants the code keeps, and what a change touches. Code is the source of truth for fields and APIs; docs describe the current product and its intended direction, not a log of decisions.

Read the doc before changing its area:

- `docs/product.md`: people and roles, concepts (course, lesson, enrollment, progress, quiz), access, journeys, languages, SEO, planned work.
- `docs/content-model.md`: collections, relationships, invariants, localization strategy, student data, deletions.
- `docs/editor.md`: the shared Lexical editor and its blocks, table of contents, reading time, checklist for adding a block.
- `docs/media.md`: files, visibility, video, paid-access plan.

Update the doc in the same change as the code. When a product change contradicts a doc, rewrite the doc to the new truth and follow every seam it lists, so nothing is left half-migrated. A new area gets its own doc and a line here.

## Data ownership

Payload owns every table and every migration, including Better Auth's. Two kinds of people:

- **Staff** (`admins`): the only Payload auth collection; they use `/admin`.
- **Students** (`users`, `sessions`, `accounts`, `verifications`): written by Better Auth (`src/lib/auth.ts`) through its Drizzle adapter on top of `src/payload-generated-schema.ts`, and managed from `/admin` by the roles `canManageStudents` (`src/access`) allows. Editors never see student data.

When you change a collection in `src/collections/auth/`, keep field names matching Better Auth's model (`fields` mapping in `auth.ts` covers renames such as `userId → user`) and run `pnpm generate:db-schema`. Future student data (progress, enrollments, plans) is regular Payload collections with a relationship to `users`.

Schema changes reach production as migrations: `pnpm payload migrate:create <name>` before deploying; `prodMigrations` applies them on boot.

## Payload v4 beta

- `payload` and `@payloadcms/*` are pinned to one exact version; upgrade them together, reading the release notes.
- Storage adapters go in the `storage` config key; image variants live in `sharpTransformer({ collections })`.
- The Local API enforces access control by default. Pass `overrideAccess: true` only for trusted system work.
- REST calls authenticated by cookie need an `Origin` (or `Sec-Fetch-Site`) header; browsers send it, curl does not.
- For Payload work, read `node_modules/payload/skills/payload/SKILL.md` first.

## Content and i18n

- Locales `en` (default), `es`, `ca`. Editors write in Spanish first; `en` and `ca` fall back to `es`. `_status` is per locale, so a page can be published in one language only.
- URLs are English everywhere: English route segments and one shared, non-localized slug per document. `home` renders at `/`.
- Internal links use `Link`/`redirect` from `@/i18n/navigation` with locale-less hrefs.
- UI strings live in `messages/{en,es,ca}.json`; every key goes into all three files.

## UI and motion

- shadcn/ui on Base UI (`render` prop, not `asChild`). `src/components/ui` holds upstream copies, excluded from Biome; add components with `pnpm dlx shadcn@latest add`.
- Every animation honours reduced motion. `<html data-motion>` holds the visitor's choice (`system | reduce | full`):
  - CSS: use the `motion-safe:` / `motion-reduce:` variants from `src/styles/globals.css`, which read `data-motion` as well as the OS setting.
  - Motion (JS): `<MotionConfig>` in `src/components/preferences/motion-provider.tsx` already applies it; for custom logic read `useReducedMotion()` from `motion/react`.
- When the motion/animation or shadcn skills are installed, use them for UI work.

## Environment

New env vars go into `src/env.ts` and `.env.example`. `NEXT_PUBLIC_*` values are inlined at build time, so Docker builds take them as build args.
