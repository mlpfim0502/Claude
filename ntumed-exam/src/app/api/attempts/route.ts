import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  lineUserId: z.string().min(1),
  questionId: z.string().min(1),
  selectedAnswer: z.string().optional(),
  timeSpentMs: z.number().int().positive().optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { lineUserId, questionId, selectedAnswer, timeSpentMs } = parsed.data

  const user = await prisma.user.findUnique({ where: { lineUserId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: { answer: true },
  })
  if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 })

  const isCorrect =
    question.answer != null && selectedAnswer != null
      ? selectedAnswer.toUpperCase() === question.answer.toUpperCase()
      : null

  const attempt = await prisma.attempt.create({
    data: { userId: user.id, questionId, selectedAnswer, isCorrect, timeSpentMs },
  })

  return NextResponse.json({ attempt, correctAnswer: question.answer, isCorrect })
}
