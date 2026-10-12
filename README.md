# Personal Finance App

A learning project based on the Frontend Mentor personal finance challenge. FIN-02 provides the frontend scaffold: React, TypeScript, Vite, Tailwind CSS, and npm workspaces. Feature implementation starts in the later cards.

## Run locally

Run commands from this repository's root:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite (normally http://127.0.0.1:5173). Stop the server with Ctrl+C. For a different port, call the workspace script directly: `npm run dev --workspace @personal-finance/web -- --port 5174`.

```sh
npm run typecheck
npm run build
npm run preview
```

The build checks TypeScript before bundling, and writes static output to `apps/web/dist`. Preview serves that production output locally (normally port 4173); it requires a successful build first and is not a production hosting service.

Verified using Node.js 25.1.0 and npm 11.6.2. The root manifest declares Node.js >=22.12.0 and npm 11; use a supported Node release that satisfies these requirements. `packageManager` records the npm version used, but does not automatically install or switch your npm version. The lockfile records resolved dependency versions.

Use `npm install` when changing dependencies; use `npm ci` for an existing lockfile. Add a frontend dependency with `npm install <package> --workspace @personal-finance/web` (or add `-D` for a development dependency). Commit the updated root `package-lock.json` with the manifest change.

## Layout

```text
package.json                 npm workspace and root command shortcuts
package-lock.json            single dependency lockfile
apps/web/
  package.json               frontend dependencies and scripts
  index.html                 browser entry and React mount element
  vite.config.ts             React and Tailwind plugins
  tsconfig.json              strict TypeScript checking
  .env.example               public configuration example
  src/main.tsx               mount React and load CSS
  src/App.tsx                minimal starter screen
  src/styles.css             Tailwind entry
  public/assets/             supplied images and fonts, including licenses
docs/                        decisions, backlog, and learning notes
```

Add `apps/api` and its workspace entry during the backend milestone. No extra monorepo build platform is needed for this structure.

## Environment and assets

The current screen runs without an environment file. `apps/web/.env.example` shows the future public API path `/api`; copy it to `apps/web/.env.local` when needed. Vite exposes `VITE_*` values to browser code, so never put database URLs, passwords, tokens, or session secrets there. The example is not wired into requests yet. API proxy configuration belongs to FIN-06.

Supplied images are served under `/assets/images/` and fonts under `/assets/fonts/`. Public assets are copied into production output unchanged. Font licenses are retained; font loading and design tokens belong to FIN-04. The private Figma file, design references, and challenge preview stay with the separate materials folder. Existing premium-design ignore rules remain; dependencies, output, and local environment files are also ignored.

## Learn from the scaffold

Read [the FIN-02 walkthrough](docs/fin-02-scaffold-outcome.md) to follow the entry flow, understand each configuration choice, and see verification evidence. Domain behavior is documented in [FIN-01](docs/fin-01-foundations-review.md); feature ordering is in [the backlog](docs/project-backlog.md).

Formatting, lint rules, CI, and PR conventions are FIN-03. Shared styles/components are FIN-04; routes and responsive navigation are FIN-05. The starter heading is only a smoke check for React and Tailwind, not the Overview page.
