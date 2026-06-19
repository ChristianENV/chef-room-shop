# Release workflow (design)

Design document for Chef Room’s GitHub branch, CI, and release process.

**Status:** PR quality CI is implemented (`.github/workflows/ci-pr.yml`). Branch protection, release PR automation, and deploy workflows are still manual / not in repo.

---

## Environments and branches

| Git branch        | Deploy target                     | App tier  | Skydropx mode |
| ----------------- | --------------------------------- | --------- | ------------- |
| `dev`             | `https://np.chefroom.mx`          | **np**    | mock          |
| `main`            | `https://chefroom.mx`             | **prod**  | live          |
| local workstation | `http://localhost:3000` (typical) | **local** | mock          |

Environment tier resolution is documented in [`configuration.md`](./configuration.md) and implemented in `src/config/app-environment.ts` using existing signals (`NODE_ENV`, `VERCEL_ENV`, `RAILWAY_ENVIRONMENT`) — no separate app-env variable.

---

## Branch strategy

### Long-lived branches

- **`dev`** — integration branch; default target for all feature work. Deploys to NP after merge.
- **`main`** — production branch; protected. Receives changes only through accumulated release PRs from `dev`.

### Short-lived branches

Use prefixes that describe intent:

```txt
feature/<short-description>
bugfix/<short-description>
chore/<short-description>
qa/<short-description>
```

### Rules

1. **Default PR base branch:** `dev` (configure in GitHub repo settings → default branch for PRs can stay `dev`, or set PR template to target `dev`).
2. **Do not open PRs directly to `main`** except the release PR (`dev` → `main`).
3. **Do not push directly to `main`** — merge only via approved release PR.
4. **`dev` may receive frequent merges**; each merge to `dev` triggers NP deploy (once CI/CD exists).
5. **`main` receives batched releases** — one release PR accumulates all changes validated on NP.

---

## Intended flow

```txt
feature / bugfix / chore branches
  → open PR to dev
  → required checks pass
  → merge to dev
  → deploy to np.chefroom.mx

  → release PR dev → main (auto-created or auto-updated)
  → required checks pass (including release PR validation)
  → merge release PR
  → create git tag (version)
  → deploy to chefroom.mx
```

### Release PR (`dev` → `main`)

- **Purpose:** batch everything currently on `dev` that should go to production.
- **Title convention (recommended):** `Release YYYY-MM-DD` or `Release vX.Y.Z`.
- **Body:** summary of changes since last production release; link to merged PRs or changelog (manual for now).
- **Merge strategy:** merge commit or squash per team preference; tag **after** merge on `main`.
- **Version tag:** create only after release PR merges (e.g. `v0.2.0`). Tag triggers or precedes production deploy, depending on hosting setup.

### Hotfixes (future)

If production needs an urgent fix:

1. Branch from `main` → `hotfix/<issue>`.
2. PR to `main` (exception to the dev-only rule; requires explicit approval).
3. After prod deploy, **back-merge `main` → `dev`** so branches do not diverge.

Document hotfix policy before enabling; not part of the default flow.

---

## Required checks

GitHub Actions workflow **PR Quality Checks** (`.github/workflows/ci-pr.yml`) runs on pull requests targeting `dev` and `main`.

Configure branch protection manually in GitHub to require these status checks:

| Job name    | Command                | Script                  | Notes                                |
| ----------- | ---------------------- | ----------------------- | ------------------------------------ |
| `format`    | `pnpm format:check`    | ✅ `format:check`       | Prettier baseline applied            |
| `lint`      | `pnpm run lint`        | ✅ `lint`               | ESLint via `scripts/run-eslint.mjs`  |
| `typecheck` | `pnpm run typecheck`   | ✅ `typecheck`          | Preceded by `pnpm db:generate` in CI |
| `test`      | `pnpm test`            | ✅ `test` → `test:unit` | Does **not** include Playwright      |
| `build`     | `pnpm exec next build` | —                       | Preceded by `pnpm db:generate` in CI |

Playwright E2E (`pnpm run test:e2e:smoke`) is intentionally **not** required yet.

### PRs to `dev`

### PRs to `main` (release PR)

Same quality checks as `dev`, plus:

| Check                   | Purpose                                                                                                    |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Validate release PR** | Ensures head = `dev`, base = `main`, not a feature branch; optional: require release label or version bump |

### Optional (not required initially)

| Check           | Command                   | Notes                                                                                              |
| --------------- | ------------------------- | -------------------------------------------------------------------------------------------------- |
| Playwright E2E  | `pnpm run test:e2e:smoke` | Login-based specs fail locally (`signIn.email` fetch); keep optional until auth test env is stable |
| Prisma validate | `pnpm db:validate`        | Cheap schema sanity check                                                                          |
| Copy audit      | `pnpm audit:copy`         | Spanish copy lint; optional                                                                        |

---

## CI workflow (implemented)

**Workflow file:** `.github/workflows/ci-pr.yml`  
**Workflow name:** PR Quality Checks

**Triggers:** `pull_request` → branches `dev`, `main`

**Permissions:** `contents: read` only

**Setup:** `actions/checkout`, `actions/setup-node` (Node **22** — no `.nvmrc` / `engines` yet; pin in a follow-up after confirming hosting runtime), `corepack enable`, `pnpm install --frozen-lockfile` (pnpm version from `packageManager` in `package.json`).

**Jobs** (separate so branch protection can require each individually):

| Job         | Steps after install                         |
| ----------- | ------------------------------------------- |
| `format`    | `pnpm format:check`                         |
| `lint`      | `pnpm run lint`                             |
| `typecheck` | `pnpm db:generate` → `pnpm run typecheck`   |
| `test`      | `pnpm db:generate` → `pnpm test`            |
| `build`     | `pnpm db:generate` → `pnpm exec next build` |

CI does **not** run migrations, Playwright, or release PR validation. No production secrets are hardcoded; DB-backed tests skip when `DATABASE_URL` is unset.

Separate workflows (later):

- **Deploy NP** — on push to `dev` (hosting-specific).
- **Deploy production** — on tag push or push to `main` (hosting-specific).
- **Release PR bot** — on push to `dev`, open/update PR `dev` → `main` (e.g. GitHub Action or Renovate-style bot).

---

## Branch protection (configure manually in GitHub)

Configure in **Settings → Branches → Branch protection rules**. Require the **PR Quality Checks** jobs: `format`, `lint`, `typecheck`, `test`, `build`.

### `main`

- [ ] Require pull request before merging
- [ ] Require approvals (≥ 1)
- [ ] Dismiss stale approvals when new commits are pushed
- [ ] Require status checks to pass (once CI exists)
- [ ] Require branches to be up to date before merging
- [ ] Restrict who can push (admins only for emergencies)
- [ ] Do not allow bypassing except break-glass admins

### `dev`

- [ ] Require pull request before merging (recommended)
- [ ] Require status checks to pass (once CI exists)
- [ ] Allow direct push for maintainers (optional — team preference)

### Repository settings

- [ ] Default branch for new PRs: **`dev`**
- [ ] Automatically delete head branches after merge (recommended)

---

## Secrets and test infrastructure (CI)

| Secret / config              | Needed for                                 | Notes                                                                                                  |
| ---------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`               | DB-backed unit tests                       | Many suites **skip** without it; some skip `localhost:5432/chef_room`. Use a dedicated CI Neon branch. |
| `BETTER_AUTH_SECRET`         | Build/runtime                              | Required for auth routes; use CI dummy value for build-only jobs if tests mock auth.                   |
| `NEXT_PUBLIC_APP_URL`        | Build                                      | Set to NP or production URL per workflow.                                                              |
| Skydropx / Conekta / R2 keys | Not required for lint/typecheck/unit/build | Integration tests and E2E may need subsets later.                                                      |

Unit tests load `.env.local` via dotenv in helpers when present; CI should inject env via GitHub Secrets, not commit `.env.local`.

---

## Versioning and tags

1. Merge release PR to `main`.
2. Create annotated tag on `main`: `git tag -a vX.Y.Z -m "Release X.Y.Z"`.
3. Push tag: `git push origin vX.Y.Z`.
4. Production deploy runs from tag or `main` (match hosting config).

**Initial version:** `package.json` is `0.1.0`. Align first production tag with team semver policy.

---

## Local quality commands

Run before opening a PR (matches future CI gates):

```bash
pnpm db:generate
pnpm format:check
pnpm run lint
pnpm run typecheck
pnpm test
pnpm exec next build
```

Notes:

- `pnpm test` is an alias for `pnpm test:unit` only — it does **not** run Playwright (`pnpm run test:e2e:smoke` is separate and optional).
- Prettier formatting baseline is applied; `pnpm format:check` is a required CI gate.
- `pnpm run build` already runs Prisma generate; `db:generate` is listed for parity with CI steps that typecheck before build.

### Node.js version

The repo does not pin Node via `.nvmrc`, `.node-version`, or `package.json` `engines`. Local development uses Node **22.x** (e.g. `v22.15.0`). `@types/node` is `^22`. Hosting docs do not specify a Node version in-repo; add `.nvmrc` in a follow-up task once Vercel/Railway runtime is confirmed.

---

## Current repo gaps (audit summary)

| Area                      | State                                                  |
| ------------------------- | ------------------------------------------------------ |
| `.github/workflows/`      | **Added** — `ci-pr.yml` (PR Quality Checks)            |
| `format` / `format:check` | **Added** — Prettier 3.x; baseline applied             |
| `test`                    | **Added** — alias to `test:unit` (no Playwright in CI) |
| Release PR automation     | **Not implemented**                                    |
| Deploy workflows          | **Not in repo** (likely Vercel/Railway dashboard)      |
| Release / branch docs     | **This document**                                      |

---

## Future improvements

- [x] GitHub Actions quality workflow on PRs to `dev` and `main` (`ci-pr.yml`)
- [ ] Auto-create/update release PR (`dev` → `main`) on push to `dev`
- [ ] Automatic changelog (release-please, semantic-release, or custom Action)
- [ ] Semantic version labels on PRs (`major` / `minor` / `patch`)
- [ ] Require Playwright smoke once login E2E has stable CI auth (see `docs/qa-e2e.md`)
- [x] One-time Prettier baseline (`pnpm format`) before gating PRs on `format:check`
- [ ] Pin Node version (`.nvmrc` / `engines`) after confirming hosting runtime
- [ ] Hotfix back-merge policy and automation

---

## Related docs

- [`configuration.md`](./configuration.md) — env vars and secrets
- [`db.md`](./db.md) — Prisma migrate deploy for prod, migrate dev for local
- [`skydropx.md`](./skydropx.md) — local/np/prod Skydropx mock vs live
- [`qa-e2e.md`](./qa-e2e.md) — Playwright smoke suite
