import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Platinum Boxing Club Registration',
  description: 'Register for Platinum Boxing Club - Feed the Faith, Starve the Doubt',
  generator: 'app',
  icons: {
    icon: [
      {
        url: '/platinum-icon.jpg',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/platinum-icon.jpg',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/platinum-icon.jpg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/platinum-icon.jpg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
