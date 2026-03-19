import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LiffProvider } from '@/components/providers/LiffProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NTU Med – 外科考題練習',
  description: 'Surgery exam practice for NTU Med students',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        <LiffProvider>
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </LiffProvider>
      </body>
    </html>
  )
}
