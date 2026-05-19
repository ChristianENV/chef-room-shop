import { StorefrontChrome } from '@/src/features/storefront/layout/storefront-chrome'

export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <StorefrontChrome>{children}</StorefrontChrome>
}
