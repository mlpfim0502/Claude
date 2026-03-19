'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLiff } from '@/components/providers/LiffProvider'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

type SubjectStat = {
  name: string
  correct: number
  total: number
  pct: number
}

export default function ProgressPage() {
  const { profile, isLoading: liffLoading } = useLiff()
  const [stats, setStats] = useState<SubjectStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    fetch(`/api/progress?lineUserId=${profile.userId}`)
      .then((r) => r.json())
      .then((data) => { setStats(data.stats ?? []); setLoading(false) })
  }, [profile])

  if (liffLoading || loading) {
    return <div className="p-8 text-center text-gray-400">載入中...</div>
  }

  return (
    <div className="px-4 py-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">我的學習進度</h1>

      {stats.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p>還沒有作答記錄</p>
          <Link href="/practice" className="mt-4 block">
            <Button>開始練習</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {stats.map((s) => (
            <Card key={s.name}>
              <CardContent className="pt-4 pb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-800">{s.name}</span>
                  <span className="text-sm font-bold text-blue-600">{s.pct}%</span>
                </div>
                <Progress value={s.pct} className="h-2 mb-1" />
                <p className="text-xs text-gray-400">{s.correct} / {s.total} 答對</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Link href="/" className="mt-6 block">
        <Button variant="outline" className="w-full">回首頁</Button>
      </Link>
    </div>
  )
}
