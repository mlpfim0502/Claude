'use client'

import Link from 'next/link'
import { useLiff } from '@/components/providers/LiffProvider'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const BATCH_YEARS = [
  { key: 'b09', label: 'Batch 09', sublabel: '109學年度', color: 'bg-blue-100 text-blue-700' },
  { key: 'b10', label: 'Batch 10', sublabel: '110學年度', color: 'bg-green-100 text-green-700' },
  { key: 'b11', label: 'Batch 11', sublabel: '111學年度', color: 'bg-purple-100 text-purple-700' },
] as const

export default function HomePage() {
  const { profile, isLoading } = useLiff()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">初始化中...</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-8 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">外科學考題練習</h1>
        {profile && (
          <p className="text-sm text-gray-500 mt-1">嗨，{profile.displayName} 👋</p>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">選擇題庫</h2>
        <div className="flex flex-col gap-3">
          {BATCH_YEARS.map((b) => (
            <Link key={b.key} href={`/practice?batchYear=${b.key}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-blue-300">
                <CardContent className="flex items-center justify-between py-4 px-5">
                  <div>
                    <p className="font-semibold text-gray-800">{b.label}</p>
                    <p className="text-xs text-gray-400">{b.sublabel}</p>
                  </div>
                  <Badge className={b.color}>開始練習 →</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Link href="/practice">
        <Button className="w-full" size="lg">
          隨機練習（所有題庫）
        </Button>
      </Link>

      <Link href="/progress" className="mt-2 block">
        <Button variant="outline" className="w-full">
          我的進度
        </Button>
      </Link>

      <Link href="/review" className="mt-2 block">
        <Button variant="outline" className="w-full">
          錯題複習
        </Button>
      </Link>
    </div>
  )
}
