# Release workflow (design)

Design document for Chef Room’s GitHub branch, CI, and release process.

**Status:** PR quality CI, PR/release validation, accumulated release PR automation, and production tag automation are implemented. Branch protection and deploy workflows are still manual / not in repo.

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
  → create git tag (automated on merge)
  → deploy to chefroom.mx
```

### Release PR (`dev` → `main`)

- **Purpose:** batch everything currently on `dev` that should go to production.
- **Automation:** workflow **Create Release PR** (`.github/workflows/create-release-pr.yml`) opens or updates a single open PR (`head: dev`, `base: main`) when `dev` is pushed and is ahead of `main`. It does **not** merge, tag, deploy, or approve.
- **Title (automated):** `Release: dev to main`
- **Manual merge:** review and merge the release PR after required checks pass; an annotated semver tag is created automatically on merge (see **Tag Production Release** below).
- **Optional bump labels on the release PR:** `release:minor`, `release:major` (default bump is patch; `release:major` wins if both are present).
- **Merge strategy:** merge commit or squash per team preference; tag is created on `main` after merge.
- **Version tag:** first production tag defaults to `v0.1.0` (or `v1.0.0` with `release:major` when no prior tag exists). Does not create GitHub Releases yet.

### Hotfixes (future)

If production needs an urgent fix:

1. Branch from `main` → `hotfix/<issue>`.
2. PR to `main` (exception to the dev-only rule; requires explicit approval).
3. After prod deploy, **back-merge `main` → `dev`** so branches do not diverge.

Document hotfix policy before enabling; not part of the default flow.

---

## Required checks

GitHub Actions workflows run on pull requests targeting `dev` and `main`.

### PR target validation

**Workflow:** Validate PR Target (`.github/workflows/validate-pr-target.yml`)  
**Job:** `validate-pr-target`

| Rule                                              | Result                   |
| ------------------------------------------------- | ------------------------ |
| Base `dev` (any feature/bugfix/chore head branch) | Pass                     |
| Base `main`, head `dev` (release PR)              | Pass                     |
| Base `main`, head not `dev`                       | Fail — retarget to `dev` |
| Any other base                                    | Fail                     |

Normal PRs must target **`dev`**. The only PR allowed into **`main`** is the release PR **`dev` → `main`**.

Configure branch protection to require **`validate-pr-target`** on **`main`** (recommended). Optionally require it on **`dev`** as well.

### PR quality checks

**Workflow:** PR Quality Checks (`.github/workflows/ci-pr.yml`)

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

Require **`validate-pr-target`** (optional but recommended) plus the quality jobs below.

### PRs to `main` (release PR)

Same quality checks as `dev`, plus release validation:

| Check                     | Purpose                                                                  |
| ------------------------- | ------------------------------------------------------------------------ |
| **`validate-pr-target`**  | Blocks direct feature/bugfix/chore/hotfix PRs into `main`                |
| **`validate-release-pr`** | **Required on `main` only** — passes only for accumulated `dev` → `main` |

Configure branch protection on **`main`** to require **`validate-release-pr`**. It does not run quality checks (those stay in `ci-pr.yml`).

### Optional (not required initially)

| Check           | Command                   | Notes                                                                                              |
| --------------- | ------------------------- | -------------------------------------------------------------------------------------------------- |
| Playwright E2E  | `pnpm run test:e2e:smoke` | Login-based specs fail locally (`signIn.email` fetch); keep optional until auth test env is stable |
| Prisma validate | `pnpm db:validate`        | Cheap schema sanity check                                                                          |
| Copy audit      | `pnpm audit:copy`         | Spanish copy lint; optional                                                                        |

---

## CI workflows (implemented)

### PR Quality Checks

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

CI does **not** run migrations or Playwright. No production secrets are hardcoded; DB-backed tests skip when `DATABASE_URL` is unset.

### Validate PR Target

**Workflow file:** `.github/workflows/validate-pr-target.yml`  
**Workflow name:** Validate PR Target

**Triggers:** `pull_request` → branches `dev`, `main`

**Permissions:** `contents: read` only

**Job:** `validate-pr-target` — validates `github.base_ref` and `github.head_ref`:

- `base=dev` → pass
- `base=main` and `head=dev` → pass (release PR)
- `base=main` and `head≠dev` → fail with retarget message
- otherwise → fail with unsupported target message

### Create Release PR

**Workflow file:** `.github/workflows/create-release-pr.yml`  
**Workflow name:** Create Release PR

**Triggers:** `push` → branch `dev`; `workflow_dispatch` (manual)

**Permissions:** `contents: read`, `pull-requests: write`

**Job:** `create-release-pr`

**Behavior:**

1. Fetch `origin/main` and `origin/dev`.
2. If `dev` is not ahead of `main`, exit successfully (no PR needed).
3. If an open PR already exists with `base: main` and `head: dev`, update its title and body.
4. Otherwise create one new PR with `head: dev` and `base: main`.

Does **not** auto-merge, approve, create tags, publish releases, or deploy. The release PR must still be reviewed and merged manually.

### Validate Release PR

**Workflow file:** `.github/workflows/validate-release-pr.yml`  
**Workflow name:** Validate Release PR

**Triggers:** `pull_request` → branch `main` only

**Permissions:** `contents: read` only

**Job:** `validate-release-pr` — passes only when `base=main` and `head=dev`. Blocks any direct feature/bugfix/chore PR into `main`. Does not duplicate quality checks from `ci-pr.yml`. Does not merge, tag, or publish releases.

### Tag Production Release

**Workflow file:** `.github/workflows/tag-production-release.yml`  
**Workflow name:** Tag Production Release

**Triggers:** `pull_request` → branch `main`, type `closed`

**Permissions:** `contents: write`, `pull-requests: read`

**Job:** `tag-production-release`

**Behavior:**

1. If the PR was closed without merge, log and exit successfully (no tag).
2. If merged but not `dev` → `main`, fail (possible branch protection bypass).
3. Check out `main` at `fetch-depth: 0`.
4. If the merge commit on `main` already has a semver tag (`vX.Y.Z`), log and exit successfully (rerun-safe).
5. Find the latest semver tag matching `v[0-9]+.[0-9]+.[0-9]+`; if none, next tag is `v0.1.0` (or `v1.0.0` with `release:major`).
6. Bump: default **patch**; `release:minor` → minor; `release:major` → major (`release:major` wins if both labels exist).
7. Fail if the calculated tag already exists; otherwise create an annotated tag and push to `origin`.

Creates **git tags only** — no GitHub Release, changelog, deploy, or auto-merge.

Separate workflows (later):

- **Deploy NP** — on push to `dev` (hosting-specific).
- **Deploy production** — on tag push or push to `main` (hosting-specific).

---

## Branch protection (configure manually in GitHub)

Configure in **Settings → Branches → Branch protection rules**. Require **PR Quality Checks** jobs: `format`, `lint`, `typecheck`, `test`, `build`. Require **`validate-pr-target`** and **`validate-release-pr`** on **`main`**; optionally require **`validate-pr-target`** on **`dev`** too.

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
2. **Tag Production Release** workflow creates the next annotated semver tag on `main` automatically.
3. Production deploy runs from tag or `main` (match hosting config — deploy workflow not in repo yet).

**Tag format:** `vMAJOR.MINOR.PATCH` (e.g. `v0.1.0`, `v0.1.1`, `v0.2.0`, `v1.0.0`).

**First tag:** `v0.1.0` when no prior semver tag exists (unless `release:major` on the merged PR → `v1.0.0`).

**Bump rules on merged release PR:**

| Label / default  | Bump  | Example (latest `v0.1.0`) |
| ---------------- | ----- | ------------------------- |
| (default)        | patch | `v0.1.1`                  |
| `release:minor`  | minor | `v0.2.0`                  |
| `release:major`  | major | `v1.0.0`                  |
| both major+minor | major | major wins                |

**Initial version:** `package.json` is `0.1.0`. First git tag defaults to `v0.1.0` per workflow policy.

Does **not** create GitHub Releases or changelogs yet.

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
- `.gitattributes` enforces LF line endings repo-wide so `format:check` stays consistent on Windows and GitHub Actions.
- `next-env.d.ts` is auto-updated by Next.js during `next build`; if `format:check` fails locally after a build, restore it with `git checkout -- next-env.d.ts` (CI `format` job does not run build).
- `pnpm run build` already runs Prisma generate; `db:generate` is listed for parity with CI steps that typecheck before build.

### Node.js version

The repo does not pin Node via `.nvmrc`, `.node-version`, or `package.json` `engines`. Local development uses Node **22.x** (e.g. `v22.15.0`). `@types/node` is `^22`. Hosting docs do not specify a Node version in-repo; add `.nvmrc` in a follow-up task once Vercel/Railway runtime is confirmed.

---

## Current repo gaps (audit summary)

| Area                      | State                                                          |
| ------------------------- | -------------------------------------------------------------- |
| `.github/workflows/`      | **Added** — quality, validation, release PR, and tag workflows |
| Tag automation            | **Added** — `tag-production-release.yml` (tags only)           |
| `format` / `format:check` | **Added** — Prettier 3.x; baseline applied                     |
| `test`                    | **Added** — alias to `test:unit` (no Playwright in CI)         |
| Release PR automation     | **Added** — `create-release-pr.yml` (create/update only)       |
| Deploy workflows          | **Not in repo** (likely Vercel/Railway dashboard)              |
| Release / branch docs     | **This document**                                              |

---

## Future improvements

- [x] GitHub Actions quality workflow on PRs to `dev` and `main` (`ci-pr.yml`)
- [x] PR target validation on PRs to `dev` and `main` (`validate-pr-target.yml`)
- [x] Auto-create/update release PR (`dev` → `main`) on push to `dev` (`create-release-pr.yml`)
- [x] Production release PR validation on PRs to `main` (`validate-release-pr.yml`)
- [ ] Automatic changelog (release-please, semantic-release, or custom Action)
- [x] Production semver tags on merged release PR (`tag-production-release.yml`; labels `release:minor`, `release:major`; default patch)
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
