# Code style, formatting & lint

Chef Room uses [Prettier](https://prettier.io/) for consistent formatting and [ESLint](https://eslint.org/) for static analysis. CI runs both on every PR — **failures block the merge**.

## Before you push

```bash
pnpm format:check   # must pass (same as CI)
pnpm lint           # must pass — no ESLint errors
pnpm typecheck
pnpm test:unit
```

If `format:check` fails, fix locally:

```bash
pnpm format
```

If `lint` fails, fix reported issues and re-run:

```bash
pnpm lint
```

Many issues auto-fix with:

```bash
pnpm exec eslint . --fix
```

## Cursor / VS Code (recommended)

This repo ships workspace settings in `.vscode/settings.json`:

- **`editor.formatOnSave": true`** — formats the file when you save (Prettier)
- **`editor.codeActionsOnSave.source.fixAll.eslint": "explicit"`** — applies ESLint auto-fixes on save
- **Default formatter:** Prettier (`esbenp.prettier-vscode`)

Install the recommended extensions when prompted:

- **Prettier - Code formatter** (`esbenp.prettier-vscode`)
- **ESLint** (`dbaeumer.vscode-eslint`)

Reload the window after installing if format-on-save or ESLint fixes do not run.

## ESLint rules to watch

CI treats **errors** as hard failures. Common ones in this repo:

| Rule                                 | What to do                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------------- |
| `@typescript-eslint/no-explicit-any` | Use `Prisma.JsonValue`, `Prisma.InputJsonValue`, or a concrete type — not `any` |
| `prefer-const`                       | Use `const` when a variable is never reassigned                                 |
| `@typescript-eslint/no-unused-vars`  | Remove unused imports/variables (warnings today; keep the tree clean)           |

For Prisma JSON columns (`configJson`, snapshots), prefer:

```ts
import type { Prisma } from '@prisma/client'

configJson?: Prisma.InputJsonValue      // writes / inputs
configJson: Prisma.JsonValue | null      // reads / GraphQL payloads
```

## Prettier config

Project root `.prettierrc`:

| Option          | Value   |
| --------------- | ------- |
| `semi`          | `false` |
| `singleQuote`   | `true`  |
| `trailingComma` | `all`   |
| `printWidth`    | `100`   |

Ignored paths are listed in `.prettierignore` (e.g. generated `next-env.d.ts`).

## Line endings

`.gitattributes` enforces **LF** line endings so `format:check` matches on Windows, macOS, and GitHub Actions.

## Why deploys fail on format or lint

The PR workflow runs `prettier --check .` and `pnpm lint` with no auto-fix. Unformatted files or ESLint **errors** fail CI even when the code runs locally.

**Prevention:** enable format-on-save and ESLint fix-on-save in Cursor/VS Code (see above), or run `pnpm format` and `pnpm lint` before committing.

See also: [`release-workflow.md`](./release-workflow.md) (CI gates and pre-push checklist).
