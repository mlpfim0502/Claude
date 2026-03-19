'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLiff } from '@/components/providers/LiffProvider'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type WrongQuestion = {
  id: string
  stem: string
  optionA?: string | null
  optionB?: string | null
  optionC?: string | null
  optionD?: string | null
  answer?: string | null
  explanation?: string | null
  batchYear?: string | null
  questionNumber?: number | null
}

export default function ReviewPage() {
  const { profile, isLoading: liffLoading } = useLiff()
  const [questions, setQuestions] = useState<WrongQuestion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    fetch(`/api/wrong-answers?lineUserId=${profile.userId}`)
      .then((r) => r.json())
      .then((data) => { setQuestions(data.questions ?? []); setLoading(false) })
  }, [profile])

  if (liffLoading || loading) {
    return <div className="p-8 text-center text-gray-400">載入中...</div>
  }

  return (
    <div className="px-4 py-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">錯題複習</h1>
      <p className="text-sm text-gray-400 mb-6">最近一次答錯的題目</p>

      {questions.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p>沒有錯題，繼續保持！</p>
          <Link href="/practice" className="mt-4 block">
            <Button>繼續練習</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {questions.map((q) => {
            const options = [
              q.optionA && { key: 'A', label: q.optionA },
              q.optionB && { key: 'B', label: q.optionB },
              q.optionC && { key: 'C', label: q.optionC },
              q.optionD && { key: 'D', label: q.optionD },
            ].filter(Boolean) as { key: string; label: string }[]

            return (
              <Card key={q.id} className="border-red-100">
                <CardHeader className="pb-2">
                  <div className="flex gap-2 mb-2">
                    {q.batchYear && <Badge variant="outline">{q.batchYear}</Badge>}
                    {q.questionNumber && <Badge variant="outline">Q{q.questionNumber}</Badge>}
                  </div>
                  <p className="text-sm font-medium text-gray-800">{q.stem}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-1 mb-3">
                    {options.map(({ key, label }) => (
                      <p
                        key={key}
                        className={`text-sm px-3 py-1.5 rounded-lg ${
                          key === q.answer
                            ? 'bg-green-50 border border-green-300 font-semibold text-green-700'
                            : 'text-gray-600'
                        }`}
                      >
                        <span className="font-semibold mr-1">{key}</span> {label}
                      </p>
                    ))}
                  </div>
                  {q.explanation && (
                    <p className="text-xs text-gray-500 border-t pt-2">{q.explanation}</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Link href="/" className="mt-6 block">
        <Button variant="outline" className="w-full">回首頁</Button>
      </Link>
    </div>
  )
}
