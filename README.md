# Personal Finance App

A learning project based on the Frontend Mentor personal finance challenge. The frontend uses React, TypeScript, Vite, and Tailwind; the local API uses NestJS, Prisma, and PostgreSQL.

## Run locally

Use npm 11 and Node.js 24 LTS (CI uses Node 24). This checkout was also verified with Node 25.1.0 and npm 11.6.2. Docker Desktop must be running for PostgreSQL. Run commands from the repository root:

```sh
npm ci
cp apps/api/.env.example apps/api/.env
npm run db:up
npm run db:migrate
npm run db:seed
npm run dev:api
```

Copy the environment example only on first setup; preserve your existing local configuration. In another terminal:

```sh
npm run dev
```

Open the URL printed by Vite, normally http://127.0.0.1:5173. The API listens at http://127.0.0.1:3000 and PostgreSQL at `127.0.0.1:5433`. These services are for private local development until authentication and ownership are complete. Do not expose them through a tunnel or deploy this setup publicly.

Check the API directly or through Vite:

```sh
curl --fail http://127.0.0.1:3000/api/health
curl --fail http://127.0.0.1:5173/api/health
```

Both return `{"status":"ok","database":"up"}` when a real database query succeeds. This is a connectivity check; use `npm run db:status` to check migration state. Database failures return HTTP 503:

```json
{ "statusCode": 503, "message": "Database unavailable", "path": "/api/health" }
```

Unknown API routes return the same error shape with status 404. Unexpected errors use a generic 500 message. Query strings and database exception details are not included in these responses.

Stop web/API watchers with Ctrl+C. `npm run db:down` removes the database container while retaining the named volume; `npm run db:up` restores access to that same data. Avoid `docker compose down -v`: it deletes the project's local database volume.

## Environment

| Variable            | Location                | Purpose                                                                       |
| ------------------- | ----------------------- | ----------------------------------------------------------------------------- |
| `DATABASE_URL`      | `apps/api/.env`         | Required server-only PostgreSQL connection URL                                |
| `PORT`              | `apps/api/.env`         | API port, defaults to 3000                                                    |
| `VITE_API_BASE_URL` | `apps/web/.env.example` | Public `/api` path for future feature requests; no request client uses it yet |

The API and Prisma CLI load `.env` from their workspace directory; the root npm commands select that workspace. Shell-provided environment variables take precedence. The checked-in credentials in Compose and the API example are disposable local defaults. Use a URL-encoded password if you customize the connection URL. Changing Compose credentials after a volume is initialized does not change the existing database user's password.

Never put database URLs, passwords, tokens, or session secrets in `VITE_*` variables: Vite exposes those values to the browser. The Vite proxy sends `/api` to `http://127.0.0.1:3000` without removing the prefix. If you change the API port, update the proxy target too. No permissive CORS policy is needed because the browser calls Vite on its own origin.

## Currency: IDR

**IDR (Indonesian rupiah) is the only app currency.** Every monetary value in app fixtures, database fields, calculations, and API payloads is an integer number of rupiah, never a fractional amount. PostgreSQL `INTEGER` bounds each nonnegative stored value to `0..2,147,483,647`; targets and movements must be positive. This is a technical storage bound, not a savings target cap. Future arithmetic must validate resulting bounds before writing. Integer columns can coerce fractional input, so validate whole-rupiah values at application boundaries before persistence too.

Display amounts with `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 })`. English UI copy and date/name ordering remain separate from currency formatting. Money inputs use ungrouped digits (for example `150000`); reject fractions and overflow instead of silently rounding.

The approved demo adaptation multiplies every original challenge amount by **1,000 exactly once**: original `4836.00` becomes `4_836_000` rupiah (Rp4.836.000), and `3814.25` becomes `3_814_250` rupiah. This is fixed fixture scaling, not an exchange rate. App-owned transaction and seed fixtures are already adapted: never multiply them again at runtime. Original challenge materials remain unmodified reference inputs; apply the same rule when importing future budget/bill fixtures.

Initial current/income/expenses are Rp4.836.000 / Rp3.814.250 / Rp1.700.500. Five pots hold Rp920.000 in total; combined current balance plus pots is Rp5.756.000. Preserve the independent balance snapshots rather than reconstructing them from transactions. Repository guidance in `AGENTS.md` records these rules for future changes.

## Pots: read and create

Open `/pots` after starting the API and frontend. `GET /api/pots` returns persisted pots for the fixed server-side demo owner. “Add New Pot” opens an accessible, Figma-based dialog; successful creation updates the list from the saved server response and survives reload. Edit/delete and add/withdraw actions use an explicitly labeled local UI preview until FIN-29 and FIN-30 add persisted mutations.

`POST /api/pots` accepts only these fields:

```json
{ "name": "Rainy Days", "target": 2000000, "theme": "#C94736" }
```

`target` is a positive integer **number of rupiah**, from 1 to 2147483647; it is not scaled at runtime. Form entry uses ungrouped digits. Names are trimmed and must contain 1–30 Unicode code points; duplicate names are allowed. Themes must be canonical palette values and unused within this owner's pots. The server supplies the UUID, owner, and initial saved total of zero. Creating a pot does not change the balance snapshot or move money.

Successful creation returns HTTP 201 and `{ id, name, theme, total, target }`. Invalid/extra fields return 400, a used theme returns 409, and a database failure returns a safe 503. The database's existing owner/theme unique key also prevents simultaneous identical submissions from creating two pots. There is no new migration or dependency to install for this feature.

The dialog supports initial focus, Tab containment, keyboard theme selection, Escape, close, and return focus. While saving, fields and dismissal are temporarily disabled; the request has a 15-second timeout. Errors keep the entered values. A failed connection or timeout cannot prove whether the database committed, so the UI advises checking the refreshed list before retrying; POST requests are never retried automatically. When all 15 themes are occupied, the dialog explains the limit and disables submission.

If an API process was running before this change, restart it to register `POST /api/pots`. The regular Vite proxy still uses API port 3000. Read [the FIN-09 learning walkthrough](docs/fin-09-create-pot-outcome.md) for the file order, validation, database conflict handling, focus lifecycle, and verification evidence.

## Commands and checks

```sh
npm run check        # formatting, lint, both workspace type checks and builds
npm run test:web     # IDR, pots validation/client, and progress checks
npm run test:api     # real API/database integration; requires migrated PostgreSQL
npm run db:status    # inspect applied/pending migration history
npm run build        # web static build and API JavaScript compilation
npm run preview      # preview the built frontend, not the full-stack application
```

`npm run dev:api` first generates the Prisma client and compiles the API, then watches TypeScript and restarts Node when emitted JavaScript changes. Fix compiler errors before trusting the running output; the watcher may retain the last successful build. Prisma schema changes require rerunning generation/restarting this command. The frontend development command remains `npm run dev`.

CI runs quality checks and API integration tests using a disposable PostgreSQL service. `npm run check` itself does not require a database or a local environment file; generated Prisma output is recreated by the API build/typecheck commands.

## Database migrations

FIN-06 creates the `finance` schema (a PostgreSQL namespace), with applied migrations recorded in `finance._prisma_migrations`. FIN-07 adds `AccountOwner`, `BalanceSnapshot`, and `Pot`, with owner foreign keys, one balance snapshot per owner, unique themes within each owner's pots, and SQL checks for valid nonnegative money, positive targets, names, and palette themes. Pots may exceed their targets.

Run `npm run db:seed` explicitly after migrations. It builds the API and invokes Prisma's development seed. The seed creates a fixed local demo owner, one balance snapshot, and five pots atomically, using stable UUIDs. Rerunning it preserves existing records and edits, and recreates missing fixture records. It is not a reset command; deleting a seeded pot and then reseeding will restore it. If another pot occupies a required theme or a seed ID belongs to another owner, the seed fails and rolls back instead of overwriting data.

Demo ownership is a temporary backend-only mechanism, not authentication. Never accept an owner ID from browser input as authorization. The seed refuses `NODE_ENV=production` and non-localhost database hosts. Check that `DATABASE_URL` targets your disposable local database; a localhost tunnel could still point elsewhere. Authenticated session ownership replaces the fixed owner in the accounts milestone.

Database integration tests create and remove a uniquely named temporary database, so the test database role needs `CREATEDB` permission (the supplied local/CI PostgreSQL role has it). They do not reset your application database.

For an existing checkout, use `npm run db:migrate`: it applies committed migrations without resetting data and safely does nothing when they are already applied. To author a schema change in a later FIN:

```sh
npm run db:migrate:dev --workspace @personal-finance/api -- --name describe_change
```

Review the generated SQL and commit the schema, migration directory, and lockfile together. Development migration creation uses a shadow database to replay history; the local Compose user has the required permissions. Never edit an already-applied migration or accept a reset prompt without understanding which local data it removes. Do not use `db push` as a substitute for tracked migrations.

## Layout and learning

```text
apps/web/                       React application and Vite proxy
apps/api/src/main.ts             server entry point and local binding
apps/api/src/app.ts              HTTP-wide prefix, errors, validation, shutdown
apps/api/src/app.module.ts       Nest dependency wiring
apps/api/src/database.service.ts shared Prisma client and connection pool
apps/api/src/health.controller.ts GET /api/health
apps/api/src/pots/               owner-scoped GET /api/pots
apps/web/src/features/pots/      request lifecycle, pot cards, and progress
apps/web/src/pages/pots-page.tsx responsive persisted Pots page
apps/api/prisma/                 schema and committed SQL migration history
apps/api/test/                   real HTTP/PostgreSQL integration tests
compose.yaml                    local PostgreSQL and persistent volume
package-lock.json               one lockfile for both npm workspaces
docs/                           shared debt register and FIN-14 walkthrough; other notes Git-ignored
```

Read [the FIN-07 walkthrough](docs/fin-07-ownership-and-idr-outcome.md) for ownership, exact IDR amounts, seed behavior, and the recommended learning order. Read [the FIN-06 walkthrough](docs/fin-06-backend-outcome.md) for the recommended file order, backend concepts, and verification evidence. Earlier decisions are in [FIN-01](docs/fin-01-foundations-review.md); the [backlog](docs/project-backlog.md) defines FIN scope.

Prisma uses its [explicit-output client generator](https://docs.prisma.io/docs/orm/v7/prisma-schema/overview/generators) and [CLI configuration](https://docs.prisma.io/docs/orm/v7/reference/prisma-config-reference). Generated client files, dependencies, compiled output, and local environment files are ignored. The dependency audit currently reports a high-severity Multer advisory through Nest’s Express adapter. This milestone has no multipart/upload routes and remains local-only; review the upstream fix before adding uploads or deploying.

Supplied assets and font licenses remain under `apps/web/public/assets/`. Premium designs stay outside this repository; preserve their ignore rules.

## Technical debt

The [technical-debt register](docs/technical-debt.md) tracks known issues intentionally deferred, including their impact, evidence, proposed remediation, and completion criteria. The register and [FIN-14 walkthrough](docs/fin-14-edit-delete-budgets-outcome.md) are eligible for version control; other planning and learning notes remain ignored.

## Troubleshooting

- Docker connection error: start Docker Desktop and rerun `npm run db:up`.
- Port 5433 occupied: stop the conflicting service or change both Compose's host port and `DATABASE_URL`.
- API port occupied: change `PORT` and Vite's proxy target together, then restart both servers.
- Health returns 503: check `docker compose ps`, the API connection URL, and database credentials. Check migration state separately with `npm run db:status`.
- Vite proxy connection refused: start the API and inspect its terminal for build/configuration errors.
- API requests during `npm run preview`: preview serves frontend build output only; use the two development servers for this milestone.
