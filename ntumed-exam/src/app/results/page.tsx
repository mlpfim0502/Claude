'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function ResultsContent() {
  const searchParams = useSearchParams()
  const correct = parseInt(searchParams.get('correct') ?? '0')
  const total = parseInt(searchParams.get('total') ?? '0')
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0

  const emoji = pct >= 80 ? '🎉' : pct >= 60 ? '💪' : '📖'
  const message = pct >= 80 ? '太棒了！' : pct >= 60 ? '繼續加油！' : '再複習一下吧'

  return (
    <div className="px-4 py-12 max-w-lg mx-auto flex flex-col items-center gap-6">
      <div className="text-6xl">{emoji}</div>
      <h1 className="text-2xl font-bold text-gray-800">{message}</h1>

      <Card className="w-full">
        <CardContent className="pt-6 text-center">
          <p className="text-5xl font-bold text-blue-600">{pct}%</p>
          <p className="text-gray-500 mt-2">{correct} / {total} 答對</p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 w-full">
        <Link href="/practice" className="w-full">
          <Button className="w-full" size="lg">再練一輪</Button>
        </Link>
        <Link href="/" className="w-full">
          <Button variant="outline" className="w-full" size="lg">回首頁</Button>
        </Link>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">載入中...</div>}>
      <ResultsContent />
    </Suspense>
  )
}
