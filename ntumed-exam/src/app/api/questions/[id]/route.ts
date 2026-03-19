import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const question = await prisma.question.findUnique({
    where: { id },
    select: {
      id: true,
      answer: true,
      explanation: true,
    },
  })
  if (!question) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ question })
}
