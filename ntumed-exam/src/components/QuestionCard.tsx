'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle } from 'lucide-react'

type Option = { key: string; label: string }

type QuestionCardProps = {
  questionId: string
  index: number
  total: number
  stem: string
  options: Option[]
  lineUserId: string
  onNext: (result: { isCorrect: boolean }) => void
}

type AnswerState = {
  selected: string
  correct: string
  isCorrect: boolean
  explanation: string | null
}

export function QuestionCard({
  questionId,
  index,
  total,
  stem,
  options,
  lineUserId,
  onNext,
}: QuestionCardProps) {
  const [answerState, setAnswerState] = useState<AnswerState | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startTime] = useState(Date.now())

  async function handleSelect(key: string) {
    if (answerState || isSubmitting) return
    setIsSubmitting(true)

    const timeSpentMs = Date.now() - startTime

    const [attemptRes, questionRes] = await Promise.all([
      fetch('/api/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lineUserId, questionId, selectedAnswer: key, timeSpentMs }),
      }),
      fetch(`/api/questions/${questionId}`),
    ])

    const attemptData = await attemptRes.json()
    const questionData = await questionRes.json()

    setAnswerState({
      selected: key,
      correct: attemptData.correctAnswer,
      isCorrect: attemptData.isCorrect,
      explanation: questionData.question?.explanation ?? null,
    })
    setIsSubmitting(false)
  }

  function getOptionStyle(key: string): string {
    if (!answerState) {
      return 'border-2 border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
    }
    if (key === answerState.correct) {
      return 'border-2 border-green-500 bg-green-50'
    }
    if (key === answerState.selected && !answerState.isCorrect) {
      return 'border-2 border-red-400 bg-red-50'
    }
    return 'border-2 border-gray-100 bg-gray-50 opacity-60'
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Progress */}
      <div className="flex items-center justify-between px-1">
        <span className="text-sm text-gray-500">{index + 1} / {total}</span>
        <Badge variant="outline">MCQ</Badge>
      </div>

      {/* Stem */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <p className="text-base leading-relaxed font-medium text-gray-800">{stem}</p>
        </CardHeader>
      </Card>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {options.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleSelect(key)}
            disabled={!!answerState || isSubmitting}
            className={`w-full text-left rounded-xl px-4 py-3 transition-all ${getOptionStyle(key)}`}
          >
            <span className="font-semibold text-gray-500 mr-2">{key}</span>
            <span className="text-gray-800">{label}</span>
            {answerState && key === answerState.correct && (
              <CheckCircle2 className="inline ml-2 w-4 h-4 text-green-600" />
            )}
            {answerState && key === answerState.selected && !answerState.isCorrect && (
              <XCircle className="inline ml-2 w-4 h-4 text-red-500" />
            )}
          </button>
        ))}
      </div>

      {/* Explanation */}
      {answerState && (
        <Card className={`shadow-sm ${answerState.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <CardContent className="pt-4">
            <p className={`text-sm font-semibold mb-1 ${answerState.isCorrect ? 'text-green-700' : 'text-red-600'}`}>
              {answerState.isCorrect ? '✓ 答對了！' : `✗ 答錯了，正確答案是 ${answerState.correct}`}
            </p>
            {answerState.explanation && (
              <p className="text-sm text-gray-700 mt-1">{answerState.explanation}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Next button */}
      {answerState && (
        <Button
          className="w-full mt-1"
          onClick={() => onNext({ isCorrect: answerState.isCorrect })}
        >
          {index + 1 < total ? '下一題 →' : '查看結果'}
        </Button>
      )}
    </div>
  )
}
