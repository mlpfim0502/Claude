import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NTU Med – 外科考題練習',
  description: 'Surgery exam practice',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  )
}
