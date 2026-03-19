import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { prisma } from '@/lib/prisma'
import { QuestionType } from '@prisma/client'
import { z } from 'zod'

const ROW_SCHEMA = z.object({
  q_num: z.coerce.number().int().positive(),
  type: z.nativeEnum(QuestionType).default(QuestionType.MCQ),
  subject: z.string().min(1).default('外科學'),
  stem: z.string().min(1),
  opt_a: z.string().optional(),
  opt_b: z.string().optional(),
  opt_c: z.string().optional(),
  opt_d: z.string().optional(),
  opt_e: z.string().optional(),
  answer: z.string().optional(),
  model_answer: z.string().optional(),
  key_points: z.string().optional(),
  grading_rubric: z.string().optional(),
  matching_json: z.string().optional(),
  ordered_steps_json: z.string().optional(),
  fib_answers: z.string().optional(),
  explanation: z.string().optional(),
  img_urls: z.string().optional(),
  tags: z.string().optional(),
  difficulty: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().min(1).max(5).optional()),
})

type SheetRow = z.infer<typeof ROW_SCHEMA>

function parseRow(headers: string[], values: string[]): Record<string, string> {
  return Object.fromEntries(
    headers.map((h, i) => [h.trim().toLowerCase().replace(/\s+/g, '_'), values[i]?.trim() ?? ''])
  )
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.SYNC_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sheetId = process.env.GOOGLE_SHEET_ID
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!sheetId || !serviceAccountJson) {
    return NextResponse.json({ error: 'Missing Google config' }, { status: 500 })
  }

  const credentials = JSON.parse(serviceAccountJson) as object
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })
  const sheets = google.sheets({ version: 'v4', auth })

  const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId })
  const tabNames = (meta.data.sheets ?? [])
    .map((s) => s.properties?.title ?? '')
    .filter((t) => /^b\d{2}$/.test(t))

  const results = { upserted: 0, skipped: 0, errors: [] as string[] }

  for (const tab of tabNames) {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${tab}!A1:T500`,
    })

    const rows = res.data.values ?? []
    if (rows.length < 2) continue

    const headers = rows[0].map((h: string) => h.toString())
    const dataRows = rows.slice(1)

    for (const rawRow of dataRows) {
      const raw = parseRow(headers, rawRow.map((v: unknown) => String(v ?? '')))
      const parsed = ROW_SCHEMA.safeParse(raw)
      if (!parsed.success) {
        results.skipped++
        continue
      }

      const row: SheetRow = parsed.data

      try {
        const subject = await prisma.subject.upsert({
          where: { name: row.subject },
          update: {},
          create: { name: row.subject },
        })

        const sheetRowId = `${tab}-${row.q_num}`
        const updateData = {
          stem: row.stem,
          optionA: row.opt_a || null,
          optionB: row.opt_b || null,
          optionC: row.opt_c || null,
          optionD: row.opt_d || null,
          optionE: row.opt_e || null,
          answer: row.answer || null,
          explanation: row.explanation || null,
          difficulty: row.difficulty ?? null,
          tags: row.tags ? row.tags.split(',').map((t) => t.trim()) : [],
          sheetRowId,
          lastSyncedAt: new Date(),
        }

        // If a question exists by (batchYear, questionNumber) but lacks sheetRowId,
        // claim it so the upsert by sheetRowId works on retry.
        await prisma.question.updateMany({
          where: { batchYear: tab, questionNumber: row.q_num, sheetRowId: null },
          data: { sheetRowId },
        })

        await prisma.question.upsert({
          where: { sheetRowId },
          update: updateData,
          create: {
            subjectId: subject.id,
            batchYear: tab,
            questionNumber: row.q_num,
            questionType: row.type,
            ...updateData,
          },
        })

        results.upserted++
      } catch (e) {
        results.errors.push(`${tab}-${row.q_num}: ${e instanceof Error ? e.message : String(e)}`)
      }
    }
  }

  return NextResponse.json({ ok: true, ...results })
}
