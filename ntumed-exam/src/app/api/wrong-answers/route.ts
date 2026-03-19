import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lineUserId = searchParams.get('lineUserId')
  if (!lineUserId) return NextResponse.json({ error: 'Missing lineUserId' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { lineUserId } })
  if (!user) return NextResponse.json({ questions: [] })

  // Find questions where the most recent attempt was wrong
  const wrongAttempts = await prisma.$queryRaw<Array<{ questionId: string; isCorrect: boolean }>>`
    SELECT DISTINCT ON ("questionId") "questionId", "isCorrect"
    FROM "attempts"
    WHERE "userId" = ${user.id} AND "isCorrect" IS NOT NULL
    ORDER BY "questionId", "attemptedAt" DESC
  `

  const wrongIds = wrongAttempts
    .filter((a) => a.isCorrect === false)
    .map((a) => a.questionId)

  if (wrongIds.length === 0) return NextResponse.json({ questions: [] })

  const questions = await prisma.question.findMany({
    where: { id: { in: wrongIds } },
    select: {
      id: true,
      stem: true,
      optionA: true,
      optionB: true,
      optionC: true,
      optionD: true,
      answer: true,
      explanation: true,
      batchYear: true,
      questionNumber: true,
    },
  })

  return NextResponse.json({ questions })
}
