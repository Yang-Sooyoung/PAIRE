import React from "react"
import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { Noto_Sans_KR } from 'next/font/google'
import { I18nProvider } from "@/lib/i18n/context"
import AppInit from "@/components/AppInit"
import './globals.css'

const cormorant = localFont({
  src: [
    { path: '../public/fonts/cormorant-300.woff2', weight: '300', style: 'normal' },
    { path: '../public/fonts/cormorant-300-italic.woff2', weight: '300', style: 'italic' },
    { path: '../public/fonts/cormorant-400.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/cormorant-400-italic.woff2', weight: '400', style: 'italic' },
    { path: '../public/fonts/cormorant-500.woff2', weight: '500', style: 'normal' },
    { path: '../public/fonts/cormorant-600.woff2', weight: '600', style: 'normal' },
    { path: '../public/fonts/cormorant-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-cormorant',
  display: 'block',
})

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-noto-kr",
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0f0f12',
}

export const metadata: Metadata = {
  title: 'PAIRÉ - Your Table\'s Fairy Sommelier',
  description: 'Capture your dish, and let the fairy find the perfect pairing for this moment.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${cormorant.className} ${notoSansKR.variable} font-sans antialiased`}>
        <I18nProvider>
          <AppInit />
          {children}
        </I18nProvider>
      </body>
    </html>
  )
}
