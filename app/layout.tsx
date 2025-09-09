import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Uranai Fortune Telling App',
  description: 'Numerology, tarot, and Mayan calendar features',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}