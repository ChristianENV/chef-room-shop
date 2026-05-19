import type { Metadata, Viewport } from 'next'
import { Outfit, Roboto } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/shared/theme-provider'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Chef Room by Bedolla | Uniformes de Chef Personalizados',
  description:
    'Tu cocina te define, tu uniforme te distingue. Plataforma premium de uniformes de chef personalizables con bordados, logotipos y colores a tu medida.',
  generator: 'v0.app',
  keywords: [
    'chef',
    'uniformes',
    'filipinas',
    'mandiles',
    'personalizacion',
    'cocina profesional',
    'bordados',
  ],
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8F7F3' },
    { media: '(prefers-color-scheme: dark)', color: '#0F1129' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${outfit.variable} ${roboto.variable}`}
      suppressHydrationWarning
    >
      <body className="font-serif antialiased" suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
