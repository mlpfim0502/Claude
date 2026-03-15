import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: '你的NTU學位可以換10年的阿聯酋居留權 | UAE Golden Visa',
  description:
    'NTU畢業生專屬。免擔保人、免工作、2-6週完成申請。薪水100%免稅。立即評估資格。',
  openGraph: {
    title: '你的NTU學位可以換10年的阿聯酋居留權',
    description: '免擔保人、免工作、2-6週完成申請。薪水100%免稅。',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" className="scroll-smooth">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
