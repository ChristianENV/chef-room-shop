# Design system — theme tokens and contrast

Chef Room uses CSS variables in `src/app/globals.css` mapped to Tailwind tokens. Prefer tokens over hardcoded colors so light/dark mode stays readable.

## Preferred tokens

| Use case                               | Token                                                                                      |
| -------------------------------------- | ------------------------------------------------------------------------------------------ |
| Primary text                           | `text-foreground`                                                                          |
| Secondary / helper text                | `text-muted-foreground`                                                                    |
| Page background                        | `bg-background`                                                                            |
| Cards, panels                          | `bg-card`                                                                                  |
| Subtle fills (image frames, dropzones) | `bg-muted`                                                                                 |
| Borders                                | `border-border`                                                                            |
| Focus rings                            | `ring-ring`, `focus-visible:ring-[3px]`                                                    |
| Brand actions                          | `bg-primary text-primary-foreground`                                                       |
| Success                                | `bg-success text-success-foreground`                                                       |
| Warning                                | `bg-warning text-warning-foreground`                                                       |
| Errors                                 | `text-destructive`, `bg-destructive/10 border-destructive/30`                              |
| Disabled controls                      | `disabled:text-foreground/60 disabled:opacity-70` (inputs), avoid whole-panel `opacity-50` |

## When hardcoded colors are allowed

- **Marketing hero sections** (landing, auth panel on navy gradient): intentional `text-white` on dark photography/gradient backgrounds.
- **Lightbox / modal overlays** on photos: `bg-black/85` with light controls is acceptable.
- **Brand hex in email templates** or static brand assets (`#2B3280`, logo files).
- **Color swatches** (`style={{ backgroundColor: hex }}`) for fabric/product colors.
- **Third-party icons** (e.g. Google sign-in SVG fills).

Do **not** use `bg-white`, `text-gray-*`, `bg-slate-*`, or `#0d1024`-style hex for app chrome, forms, admin tables, or product UI.

## Dark mode rules

1. Surfaces use `bg-card`, `bg-muted`, or `bg-background` — never fixed white panels.
2. Muted copy uses `text-muted-foreground` (tuned in `:root` and `.dark`).
3. Selected states need visible border + ring: `ring-primary ring-offset-background`.
4. Disabled dropzones: `bg-muted/40` + `cursor-not-allowed`, not full-container opacity.
5. Badges on colored backgrounds: pair `bg-success` with `text-success-foreground`, etc.

## Admin / product UI contrast expectations

- Form labels readable in both themes (`Label` defaults to `text-foreground`).
- Matrix cell states visually distinct at a glance.
- Saving overlay blocks interaction with high-contrast title + stage text.
- Image thumbnails: `object-contain` + `bg-muted` frame.
- 3D uploader warnings use `warning` tokens, not raw `amber-*` only in light mode.

## Storefront expectations

- Product cards: image area `bg-muted`; badges use semantic foreground tokens.
- PDP: stock/trust copy at least `text-foreground/75`–`/80`; disabled swatches `opacity-55` not `opacity-40`.
- Auth forms: errors via `Alert variant="destructive"`; fields use shared `Input`/`Label` tokens.

## Related docs

- [admin-products-ui.md](./admin-products-ui.md) — product form, variant matrix, images
- [storefront-catalog.md](./storefront-catalog.md) — PDP gallery
