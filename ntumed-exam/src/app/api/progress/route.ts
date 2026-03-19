import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lineUserId = searchParams.get('lineUserId')
  if (!lineUserId) return NextResponse.json({ error: 'Missing lineUserId' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { lineUserId } })
  if (!user) return NextResponse.json({ stats: [] })

  const attempts = await prisma.attempt.findMany({
    where: { userId: user.id, isCorrect: { not: null } },
    include: { question: { include: { subject: true } } },
  })

  const grouped = new Map<string, { name: string; correct: number; total: number }>()
  for (const a of attempts) {
    const key = a.question.subject.id
    const entry = grouped.get(key) ?? { name: a.question.subject.name, correct: 0, total: 0 }
    entry.total++
    if (a.isCorrect) entry.correct++
    grouped.set(key, entry)
  }

  const stats = Array.from(grouped.values()).map((s) => ({
    ...s,
    pct: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
  }))

  return NextResponse.json({ stats })
}
