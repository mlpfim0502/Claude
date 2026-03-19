'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useLiff } from '@/components/providers/LiffProvider'
import { QuestionCard } from '@/components/QuestionCard'

type RawQuestion = {
  id: string
  stem: string
  optionA?: string | null
  optionB?: string | null
  optionC?: string | null
  optionD?: string | null
  optionE?: string | null
  batchYear?: string | null
  questionNumber?: number | null
}

function PracticeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { profile } = useLiff()
  const batchYear = searchParams.get('batchYear') ?? undefined

  const [questions, setQuestions] = useState<RawQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<boolean[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams({ limit: '10' })
    if (batchYear) params.set('batchYear', batchYear)
    fetch(`/api/questions/random?${params}`)
      .then((r) => r.json())
      .then((data: { questions: RawQuestion[] }) => {
        setQuestions(data.questions ?? [])
        setLoading(false)
      })
  }, [batchYear])

  function handleNext({ isCorrect }: { isCorrect: boolean }) {
    const updated = [...results, isCorrect]
    setResults(updated)
    if (currentIndex + 1 >= questions.length) {
      const correct = updated.filter(Boolean).length
      router.push(`/results?correct=${correct}&total=${updated.length}`)
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">載入題目中...</div>
  if (questions.length === 0) return <div className="p-8 text-center text-gray-500">找不到題目</div>

  const q = questions[currentIndex]
  const options = (
    [
      q.optionA ? { key: 'A', label: q.optionA } : null,
      q.optionB ? { key: 'B', label: q.optionB } : null,
      q.optionC ? { key: 'C', label: q.optionC } : null,
      q.optionD ? { key: 'D', label: q.optionD } : null,
      q.optionE ? { key: 'E', label: q.optionE } : null,
    ] as Array<{ key: string; label: string } | null>
  ).filter((o): o is { key: string; label: string } => o !== null)

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <QuestionCard
        key={q.id}
        questionId={q.id}
        index={currentIndex}
        total={questions.length}
        stem={q.stem}
        options={options}
        lineUserId={profile?.userId ?? 'mock-user-001'}
        onNext={handleNext}
      />
    </div>
  )
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">載入中...</div>}>
      <PracticeContent />
    </Suspense>
  )
}
