import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const batchYear = searchParams.get('batchYear') ?? undefined
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 50)

  const where = { isActive: true, ...(batchYear ? { batchYear } : {}) }
  const total = await prisma.question.count({ where })
  if (total === 0) return NextResponse.json({ questions: [] })

  // Random offset sampling — good enough for POC
  const skip = Math.max(0, Math.floor(Math.random() * Math.max(total - limit, 0)))
  const questions = await prisma.question.findMany({
    where,
    skip,
    take: limit,
    select: {
      id: true,
      stem: true,
      optionA: true,
      optionB: true,
      optionC: true,
      optionD: true,
      optionE: true,
      questionType: true,
      batchYear: true,
      questionNumber: true,
      difficulty: true,
      tags: true,
    },
  })
  return NextResponse.json({ questions })
}
