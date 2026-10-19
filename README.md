# Open Knowledge

Course platform built with Next.js 16, Payload 4 (beta), PostgreSQL and Better Auth.

## Stack

| Concern | Choice |
| --- | --- |
| App | Next.js 16 (App Router) with Payload embedded at `/admin` |
| Database | PostgreSQL 18, one schema owned by Payload |
| Student auth | Better Auth: email + password, magic link, Google, GitHub |
| Staff auth | Payload (`admins` collection) |
| Email | nodemailer over SMTP: Mailpit locally, Resend in production |
| Files | S3 API: SeaweedFS locally, Cloudflare R2 in production |
| i18n | Payload localization + next-intl (`en` default, `es`, `ca`) |
| UI | Tailwind CSS 4, shadcn/ui (Base UI), Motion, next-themes |
| Tooling | pnpm, Biome, Vitest, TypeScript |

## Local development

Requirements: Node 24, pnpm, Docker.

```bash
cp .env.example .env            # then fill PAYLOAD_SECRET and BETTER_AUTH_SECRET (openssl rand -hex 32)
docker compose up -d            # Postgres, Mailpit, SeaweedFS (+ creates the private media bucket)
pnpm install
pnpm dev
```

| URL | What |
| --- | --- |
| http://localhost:3000 | Site |
| http://localhost:3000/admin | Payload admin (first visit creates the first admin) |
| http://localhost:8025 | Mailpit: every email sent locally |

Google and GitHub sign-in turn on once their client id and secret are set in `.env`.

Reset all local data: `docker compose down -v && docker compose up -d`.

## Scripts

| Script | Does |
| --- | --- |
| `pnpm dev` | Dev server (Payload pushes schema changes automatically) |
| `pnpm build` | Generates types and import map, then builds |
| `pnpm lint` / `pnpm format` | Biome check / fix |
| `pnpm typecheck` | TypeScript |
| `pnpm test` | Vitest |
| `pnpm generate:db-schema` | Regenerates the Drizzle schema Better Auth uses |
| `pnpm payload migrate:create <name>` | Creates a migration from schema changes |

## Deployment (Dokploy)

1. **Database**: create a PostgreSQL database in Dokploy, with backups to S3/R2.
2. **App**: a Dockerfile application from this repo.
   - Build arg: `NEXT_PUBLIC_SITE_URL`.
   - Runtime env: everything in `.env.example`.
   - Migrations run automatically on boot.
3. **Email**: Resend SMTP: `SMTP_HOST=smtp.resend.com`, `SMTP_PORT=465`, `SMTP_USER=resend`, `SMTP_PASS=<api key>`, with a verified sending domain.
4. **Files**: a private R2 bucket (no public access; Payload serves every file) with an S3 API token (`S3_*`, `S3_REGION=auto`) and a CORS rule allowing `PUT` from the site origin, for uploads straight from the browser. See `docs/media.md`.
5. **OAuth**: callback URLs `{BETTER_AUTH_URL}/api/auth/callback/google` and `/github`.
6. Open `/admin` and create the first admin.
