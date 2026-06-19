import type { Metadata, Viewport } from 'next'
import { Outfit, Roboto } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AppProviders } from '@/src/providers/app-providers'
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
  keywords: [
    'chef',
    'uniformes',
    'filipinas',
    'mandiles',
    'personalizacion',
    'cocina profesional',
    'bordados',
  ],
  appleWebApp: {
    title: 'Chef Room',
  },
  icons: {
    icon: [
      { url: '/icon0.svg', type: 'image/svg+xml' },
      { url: '/icon1.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#2b3280',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${outfit.variable} ${roboto.variable}`} suppressHydrationWarning>
      <body className="font-serif antialiased" suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
