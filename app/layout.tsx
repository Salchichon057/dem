import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/auth-context'

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Desarrollo en Movimiento - Dashboard',
  description: 'Plataforma integral de gestión de formularios y organizaciones para ONGs y organizaciones sociales',
  keywords: 'formularios, organizaciones, gestión, dashboard, ONGs, desarrollo social',
  authors: [{ name: 'Desarrollo en Movimiento' }],
  creator: 'Desarrollo en Movimiento',
  publisher: 'Desarrollo en Movimiento',
  openGraph: {
    title: 'Desarrollo en Movimiento - Dashboard',
    description: 'Plataforma integral de gestión de formularios y organizaciones',
    url: 'https://desarrollo-en-movimiento.com',
    siteName: 'Desarrollo en Movimiento',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Desarrollo en Movimiento Dashboard',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Desarrollo en Movimiento - Dashboard',
    description: 'Plataforma integral de gestión de formularios y organizaciones',
    images: ['/twitter-image.jpg'],
    creator: '@desarrollo_mov',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body
        className={`${geist.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
