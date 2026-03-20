# Phase 2 – Deploy + LINE LIFF + Google Sheets Sync

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the surgery exam app live in LINE — deployed on Vercel, authenticated with real LINE LIFF, and questions managed via Google Sheets sync.

**Architecture:** Three independent workstreams: (1) Vercel deployment with env vars, (2) real LIFF ID wired in so LINE users authenticate properly, (3) `/api/admin/sync-sheet` route that reads a Google Sheet and upserts questions into Supabase. Together these turn the POC into a real usable tool.

**Tech Stack:** Vercel (hosting), LINE Developers Console (LIFF), Google Sheets API v4, `googleapis` npm package, Next.js API routes

---

## Prerequisites checklist (do these before coding)

```
[ ] Vercel account created at vercel.com
[ ] GitHub repo pushed (git push origin main)
[ ] LINE Developers account at developers.line.biz
    → Create a LINE Login channel
    → Create a LIFF app (type: Full, endpoint URL = placeholder for now)
    → Copy LIFF ID (looks like 1234567890-AbCdEfGh)
[ ] Google Cloud project at console.cloud.google.com
    → Enable Google Sheets API
    → Create Service Account (name: sheet-reader, role: Viewer)
    → Download JSON key file
    → Open your Google Sheet → Share → add service account email as Viewer
[ ] Supabase anon key from dashboard → Settings → API → anon public
```

---

## Task 1: Push to GitHub and deploy to Vercel

**Files:**
- No new files — just git + Vercel CLI commands

**Step 1: Push the repo to GitHub**

If you haven't already:
```bash
cd /Users/chenyulee/ntumed-exam
git remote add origin https://github.com/YOUR_USERNAME/ntumed-exam.git
git push -u origin main
```

**Step 2: Install Vercel CLI and link project**

```bash
npm install -g vercel
cd /Users/chenyulee/ntumed-exam
vercel link
```

Follow prompts: link to existing Vercel project or create new one named `ntumed-exam`.

**Step 3: Set environment variables in Vercel**

```bash
vercel env add NEXT_PUBLIC_LIFF_ID production
# paste your LIFF ID when prompted

vercel env add DATABASE_URL production
# paste: postgresql://postgres.yywtzuaujuydvqmnntsa:adminMEDSA51%21@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres

vercel env add NEXT_PUBLIC_SUPABASE_URL production
# paste: https://yywtzuaujuydvqmnntsa.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# paste your anon key from Supabase dashboard

vercel env add SYNC_SECRET production
# paste: any random string you'll use to protect the sync endpoint
```

**Step 4: Deploy**

```bash
vercel --prod
```

Expected: deployment URL like `https://ntumed-exam.vercel.app`

**Step 5: Update LIFF endpoint URL**

Go to LINE Developers Console → your LIFF app → edit endpoint URL → set to `https://ntumed-exam.vercel.app`

**Step 6: Verify**

Open `https://ntumed-exam.vercel.app` in a browser → should see home screen (will be in mock mode until opened inside LINE).

**Step 7: Commit**

```bash
git add .vercel/
git commit -m "chore: link Vercel project"
```

---

## Task 2: Wire real LIFF ID + test in LINE

**Files:**
- Modify: `src/components/providers/LiffProvider.tsx` (no code change needed if env var is set)
- Modify: `.env.local` — add real LIFF ID

**Step 1: Update `.env.local` with real LIFF ID**

Edit `/Users/chenyulee/ntumed-exam/.env.local`:
```
NEXT_PUBLIC_LIFF_ID=YOUR_REAL_LIFF_ID_HERE
```

Replace `YOUR_REAL_LIFF_ID_HERE` with the LIFF ID from LINE Developers Console (format: `1234567890-AbCdEfGh`).

**Step 2: Test LIFF locally via ngrok**

```bash
npm install -g ngrok
ngrok http 3000
```

Copy the `https://xxxx.ngrok-free.app` URL.

Go to LINE Developers Console → LIFF app → temporarily set endpoint URL to the ngrok URL.

**Step 3: Start dev server**

```bash
npx next dev
```

**Step 4: Open in LINE**

On your phone, open LINE → search for your bot/channel → open the LIFF URL. Should prompt LINE login, then load the home screen showing your real LINE display name.

**Step 5: Verify full flow in LINE**

1. Home screen shows your real LINE display name
2. Tap "Batch 10" → practice page loads
3. Answer a question → instant feedback
4. Finish 10 questions → results screen

**Step 6: Restore Vercel endpoint in LINE Developers**

After testing, go back to LINE Developers Console and restore the LIFF endpoint to the Vercel URL.

No code commit needed for this task — it's config only.

---

## Task 3: Google Sheets sync API route

**Files:**
- Create: `src/app/api/admin/sync-sheet/route.ts`
- Modify: `.env.local` (add Google creds)
- Modify: `.env.example` (document new vars)
- Modify: `package.json` (add googleapis)

**Step 1: Install googleapis**

```bash
cd /Users/chenyulee/ntumed-exam
npm install googleapis
```

**Step 2: Add Google credentials to `.env.local`**

```bash
# Add to .env.local:
GOOGLE_SHEET_ID=YOUR_SHEET_ID_HERE
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}
SYNC_SECRET=your-sync-secret-here
```

- `GOOGLE_SHEET_ID` — from Sheet URL: `https://docs.google.com/spreadsheets/d/[THIS_PART]/edit`
- `GOOGLE_SERVICE_ACCOUNT_JSON` — paste the entire contents of the downloaded JSON key file as a single line

**Step 3: Create `src/app/api/admin/sync-sheet/route.ts`**

```typescript
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
  difficulty: z.coerce.number().int().min(1).max(5).optional(),
})

type SheetRow = z.infer<typeof ROW_SCHEMA>

function parseRow(headers: string[], values: string[]): Record<string, string> {
  return Object.fromEntries(
    headers.map((h, i) => [h.trim().toLowerCase().replace(/\s+/g, '_'), values[i]?.trim() ?? ''])
  )
}

export async function POST(req: NextRequest) {
  // Protect the endpoint with SYNC_SECRET
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.SYNC_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sheetId = process.env.GOOGLE_SHEET_ID
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!sheetId || !serviceAccountJson) {
    return NextResponse.json({ error: 'Missing Google config' }, { status: 500 })
  }

  // Auth with Google
  const credentials = JSON.parse(serviceAccountJson) as object
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })
  const sheets = google.sheets({ version: 'v4', auth })

  // Get list of sheet tabs (b09, b10, b11, etc.)
  const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId })
  const tabNames = (meta.data.sheets ?? [])
    .map((s) => s.properties?.title ?? '')
    .filter((t) => /^b\d{2}$/.test(t)) // only tabs like b09, b10, b11

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
        // Ensure subject exists
        const subject = await prisma.subject.upsert({
          where: { name: row.subject },
          update: {},
          create: { name: row.subject },
        })

        const sheetRowId = `${tab}-${row.q_num}`

        await prisma.question.upsert({
          where: { sheetRowId },
          update: {
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
            lastSyncedAt: new Date(),
          },
          create: {
            subjectId: subject.id,
            batchYear: tab,
            questionNumber: row.q_num,
            questionType: row.type,
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
```

**Step 4: Update `.env.example`**

Add to `.env.example`:
```
GOOGLE_SHEET_ID=
GOOGLE_SERVICE_ACCOUNT_JSON=
```

**Step 5: Verify build passes**

```bash
npm run build
```

Fix any TypeScript errors.

**Step 6: Test locally**

```bash
npx next dev
```

In another terminal:
```bash
curl -s -X POST http://localhost:3000/api/admin/sync-sheet \
  -H "Authorization: Bearer dev-secret" | python3 -m json.tool
```

Expected:
```json
{
  "ok": true,
  "upserted": 30,
  "skipped": 0,
  "errors": []
}
```

If no Google creds are set locally, expect `{ "error": "Missing Google config" }` — that's fine for now; set real creds to test.

**Step 7: Commit**

```bash
git add src/app/api/admin/sync-sheet/route.ts .env.example package.json package-lock.json
git commit -m "feat: add Google Sheets sync API route"
```

**Step 8: Add Google env vars to Vercel**

```bash
vercel env add GOOGLE_SHEET_ID production
vercel env add GOOGLE_SERVICE_ACCOUNT_JSON production
```

For `GOOGLE_SERVICE_ACCOUNT_JSON` paste the full JSON as one line.

**Step 9: Redeploy**

```bash
vercel --prod
```

**Step 10: Trigger sync on production**

```bash
curl -s -X POST https://ntumed-exam.vercel.app/api/admin/sync-sheet \
  -H "Authorization: Bearer YOUR_SYNC_SECRET" | python3 -m json.tool
```

---

## Task 4: Progress dashboard (`/progress`)

**Files:**
- Create: `src/app/progress/page.tsx`
- Create: `src/app/api/progress/route.ts`

**Step 1: Create `src/app/api/progress/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lineUserId = searchParams.get('lineUserId')
  if (!lineUserId) return NextResponse.json({ error: 'Missing lineUserId' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { lineUserId } })
  if (!user) return NextResponse.json({ stats: [] })

  // Per-subject accuracy stats
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
```

**Step 2: Create `src/app/progress/page.tsx`**

```typescript
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLiff } from '@/components/providers/LiffProvider'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

type SubjectStat = {
  name: string
  correct: number
  total: number
  pct: number
}

export default function ProgressPage() {
  const { profile, isLoading: liffLoading } = useLiff()
  const [stats, setStats] = useState<SubjectStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    fetch(`/api/progress?lineUserId=${profile.userId}`)
      .then((r) => r.json())
      .then((data) => { setStats(data.stats ?? []); setLoading(false) })
  }, [profile])

  if (liffLoading || loading) {
    return <div className="p-8 text-center text-gray-400">載入中...</div>
  }

  return (
    <div className="px-4 py-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">我的學習進度</h1>

      {stats.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p>還沒有作答記錄</p>
          <Link href="/practice" className="mt-4 block">
            <Button>開始練習</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {stats.map((s) => (
            <Card key={s.name}>
              <CardContent className="pt-4 pb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-800">{s.name}</span>
                  <span className="text-sm font-bold text-blue-600">{s.pct}%</span>
                </div>
                <Progress value={s.pct} className="h-2 mb-1" />
                <p className="text-xs text-gray-400">{s.correct} / {s.total} 答對</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Link href="/" className="mt-6 block">
        <Button variant="outline" className="w-full">回首頁</Button>
      </Link>
    </div>
  )
}
```

**Step 3: Add progress link to home page**

Modify `src/app/page.tsx` — add a link below the main button:

```typescript
// After the existing "隨機練習" Button, add:
<Link href="/progress" className="mt-2 block">
  <Button variant="outline" className="w-full">
    我的進度
  </Button>
</Link>
```

**Step 4: Verify build**

```bash
npm run build
```

**Step 5: Commit**

```bash
git add src/app/progress/page.tsx src/app/api/progress/route.ts src/app/page.tsx
git commit -m "feat: add progress dashboard with per-subject accuracy"
```

---

## Task 5: Wrong answers review (`/review`)

**Files:**
- Create: `src/app/review/page.tsx`
- Create: `src/app/api/wrong-answers/route.ts`

**Step 1: Create `src/app/api/wrong-answers/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lineUserId = searchParams.get('lineUserId')
  if (!lineUserId) return NextResponse.json({ error: 'Missing lineUserId' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { lineUserId } })
  if (!user) return NextResponse.json({ questions: [] })

  // Find questions where the most recent attempt was wrong
  const wrongAttempts = await prisma.$queryRaw<Array<{ questionId: string }>>`
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
```

**Step 2: Create `src/app/review/page.tsx`**

```typescript
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

const OPTION_LABELS: Record<string, string | undefined> = {}

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
```

**Step 3: Add review link to home page**

Modify `src/app/page.tsx` — add a third link button:

```typescript
<Link href="/review" className="mt-2 block">
  <Button variant="outline" className="w-full">
    錯題複習
  </Button>
</Link>
```

**Step 4: Verify build**

```bash
npm run build
```

**Step 5: Commit**

```bash
git add src/app/review/page.tsx src/app/api/wrong-answers/route.ts src/app/page.tsx
git commit -m "feat: add wrong answers review page"
```

**Step 6: Deploy**

```bash
vercel --prod
```

---

## Phase 2 Complete — What You'll Have

| Feature | Task |
|---------|------|
| App live on Vercel | Task 1 |
| Real LINE login | Task 2 |
| Google Sheets → DB sync | Task 3 |
| Progress dashboard | Task 4 |
| Wrong answers review | Task 5 |

## Phase 3 Ideas (future)

- Bottom navigation bar (Home / Practice / Progress / Review)
- Push notification when new questions are synced
- Share result card to LINE chat
- FIB, SAQ, ORDER, MATCH question types
- Admin UI to trigger sync without curl
