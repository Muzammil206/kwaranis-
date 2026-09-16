import type { Metadata, Viewport } from 'next'
import './globals.css'
import RegisterSW from '@/components/RegisterSW'

export const metadata: Metadata = {
  title: 'NIS Kwara — Payment System',
  description: 'Nigeria Institution of Surveyors, Kwara State Branch — Member Dues Management',
  manifest: '/manifest.webmanifest',
}

export const viewport: Viewport = {
  themeColor: '#1B5E3B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icons/icon-192.png" sizes="192x192" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/icon-180.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className="min-h-screen bg-stone-50">
        {children}
        <RegisterSW />
      </body>
    </html>
  )
}