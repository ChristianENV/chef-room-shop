# Code style & formatting

Chef Room uses [Prettier](https://prettier.io/) for consistent formatting. CI runs `pnpm format:check` on every PR — **unformatted files fail the build**.

## Before you push

```bash
pnpm format:check   # must pass (same as CI)
pnpm lint
pnpm typecheck
pnpm test:unit
```

If `format:check` fails, fix locally:

```bash
pnpm format
```

Then re-run `pnpm format:check` to confirm.

## Cursor / VS Code (recommended)

This repo ships workspace settings in `.vscode/settings.json`:

- **`editor.formatOnSave": true`** — formats the file when you save
- **Default formatter:** Prettier (`esbenp.prettier-vscode`)

Install the recommended extension when prompted, or add **Prettier - Code formatter** (`esbenp.prettier-vscode`) manually.

Reload the window after installing Prettier if format-on-save does not run.

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

## Why deploys fail on format

The PR workflow job `format` runs `prettier --check .` with no auto-fix. Any file that was edited without running Prettier (or without format-on-save) will fail CI even if the code is correct.

**Prevention:** enable format-on-save in Cursor/VS Code, or run `pnpm format` before committing.

See also: [`release-workflow.md`](./release-workflow.md) (CI gates and pre-push checklist).
