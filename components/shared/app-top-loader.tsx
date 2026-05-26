'use client'

import NextTopLoader from 'nextjs-toploader'

/** Chef Room brand primary — matches `globals.css` light theme token. */
const BRAND_PRIMARY_FALLBACK = '#2B3280'

/**
 * Route transition progress bar (storefront + admin).
 * Uses `--primary` so light/dark themes stay on-brand without extra JS.
 */
export function AppTopLoader() {
  const brandColor = `var(--primary, ${BRAND_PRIMARY_FALLBACK})`

  return (
    <NextTopLoader
      color={brandColor}
      height={3}
      showSpinner={false}
      crawl
      crawlSpeed={200}
      speed={200}
      easing="ease"
      shadow={`0 0 10px ${brandColor}, 0 0 5px ${brandColor}`}
      zIndex={9999}
    />
  )
}
