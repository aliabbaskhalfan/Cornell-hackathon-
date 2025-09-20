import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/components/providers/query-provider'
import { SocketProvider } from '@/components/providers/socket-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Sports Commentator',
  description: 'Real-time AI-powered sports commentary with customizable personas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <QueryProvider>
          <SocketProvider>
            <div className="min-h-screen bg-neutral-900">
              {children}
            </div>
          </SocketProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
