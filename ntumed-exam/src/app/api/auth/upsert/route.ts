import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  userId: z.string().min(1),
  displayName: z.string().min(1),
  pictureUrl: z.string().url().optional().nullable(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }
  const { userId, displayName, pictureUrl } = parsed.data
  const user = await prisma.user.upsert({
    where: { lineUserId: userId },
    update: { displayName, pictureUrl: pictureUrl ?? null },
    create: { lineUserId: userId, displayName, pictureUrl: pictureUrl ?? null },
  })
  return NextResponse.json({ user })
}
