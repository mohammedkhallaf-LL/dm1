import type { Metadata } from 'next'
import { Suspense } from 'react'
import '@fontsource-variable/inter'
import './globals.css'
import { QaBar } from '../components/qa/QaBar.tsx'

export const metadata: Metadata = {
  title: 'Captello Summit',
  description: 'Event intelligence demo site',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}><QaBar /></Suspense>
        {children}
      </body>
    </html>
  )
}
