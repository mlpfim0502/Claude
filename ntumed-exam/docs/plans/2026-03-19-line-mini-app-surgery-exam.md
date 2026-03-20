# LINE Mini App – Surgery Exam POC Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a working LINE LIFF mini-app where NTU Med students can practice surgery past-exam MCQ questions, tap an answer, and see instant feedback with explanation.

**Architecture:** Next.js 14 App Router + Prisma ORM + Supabase PostgreSQL. The LIFF SDK authenticates the user via LINE; a `LiffProvider` exposes the profile throughout the app. For local dev, a mock fallback bypasses real LINE auth. Questions are seeded manually for the POC (Google Sheets sync is deferred).

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Prisma, Supabase (PostgreSQL), `@line/liff`, Prisma Client

---

## POC Scope (what's in / out)

| In POC | Deferred |
|--------|----------|
| MCQ question type | FIB, SAQ, Essay, ORDER, MATCH |
| Manual seed (10 surgery Qs) | Google Sheets sync |
| Mock LIFF (local dev) | ngrok / real LINE login in dev |
| Home → Practice → Results flow | Progress dashboard, Review screen |
| Supabase (hosted DB) | Local SQLite |

---

## Task 1: Scaffold Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `.env.example`, `.gitignore`
- Run commands only — no source files yet

**Step 1: Init Next.js app (in the existing repo root)**

```bash
cd /Users/chenyulee/ntumed-exam
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git
```

When prompted, accept all defaults.

**Step 2: Install dependencies**

```bash
npm install @prisma/client @line/liff
npm install -D prisma
npm install @supabase/supabase-js
npx shadcn@latest init -d
npx shadcn@latest add button card badge progress
```

**Step 3: Verify**

```bash
npm run build
```
Expected: build succeeds with no errors.

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 14 app with Tailwind + shadcn"
```

---

## Task 2: Prisma schema + Supabase connection

**Files:**
- Create: `prisma/schema.prisma`
- Create: `.env.local` (local only, not committed)
- Create: `.env.example`

**Step 1: Init Prisma**

```bash
npx prisma init --datasource-provider postgresql
```

This creates `prisma/schema.prisma` and adds `DATABASE_URL` to `.env`.

**Step 2: Replace `prisma/schema.prisma` with POC schema**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum QuestionType {
  MCQ
  TF
  MULTI
  FIB
  SAQ
  ESSAY
  ORDER
  MATCH
}

model Subject {
  id        String     @id @default(cuid())
  name      String     @unique
  questions Question[]
  createdAt DateTime   @default(now())

  @@map("subjects")
}

model User {
  id          String    @id @default(cuid())
  lineUserId  String    @unique
  displayName String
  pictureUrl  String?
  attempts    Attempt[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("users")
}

model Question {
  id             String       @id @default(cuid())
  subjectId      String
  subject        Subject      @relation(fields: [subjectId], references: [id])
  questionType   QuestionType @default(MCQ)
  batchYear      String?
  questionNumber Int?
  isActive       Boolean      @default(true)
  stem           String
  stemImages     String[]     @default([])
  optionA        String?
  optionB        String?
  optionC        String?
  optionD        String?
  optionE        String?
  answer         String?
  explanation    String?
  difficulty     Int?
  tags           String[]     @default([])
  sheetRowId     String?      @unique
  lastSyncedAt   DateTime?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  attempts       Attempt[]

  @@unique([batchYear, questionNumber])
  @@map("questions")
}

model Attempt {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  questionId     String
  question       Question @relation(fields: [questionId], references: [id])
  selectedAnswer String?
  isCorrect      Boolean?
  timeSpentMs    Int?
  attemptedAt    DateTime @default(now())

  @@map("attempts")
}
```

**Step 3: Create `.env.local` with your Supabase credentials**

```bash
# .env.local  — fill in your real values from Supabase dashboard
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_LIFF_ID=your-liff-id-or-placeholder
SYNC_SECRET=dev-secret
```

**Step 4: Push schema to Supabase**

```bash
npx prisma db push
```
Expected: `Your database is now in sync with your Prisma schema.`

**Step 5: Generate Prisma client**

```bash
npx prisma generate
```

**Step 6: Create Prisma singleton `src/lib/prisma.ts`**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: ['query'] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Step 7: Commit**

```bash
git add prisma/ src/lib/prisma.ts .env.example
git commit -m "feat: add Prisma schema and Supabase connection"
```

---

## Task 3: Seed 10 surgery MCQ questions

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json` (add prisma.seed config)

**Step 1: Create `prisma/seed.ts`**

```typescript
import { PrismaClient, QuestionType } from '@prisma/client'

const prisma = new PrismaClient()

const questions = [
  {
    batchYear: 'b10',
    questionNumber: 1,
    stem: 'A 45-year-old man presents with acute right lower quadrant pain, fever (38.5°C), and leukocytosis. McBurney\'s point tenderness is present. What is the MOST likely diagnosis?',
    optionA: 'Meckel\'s diverticulum',
    optionB: 'Acute appendicitis',
    optionC: 'Right ureteral colic',
    optionD: 'Mesenteric adenitis',
    answer: 'B',
    explanation: 'Classic presentation of acute appendicitis: RLQ pain migrating from periumbilical area, fever, leukocytosis, and McBurney\'s point tenderness (1/3 from ASIS to umbilicus).',
    difficulty: 1,
    tags: ['appendicitis', 'acute abdomen'],
  },
  {
    batchYear: 'b10',
    questionNumber: 2,
    stem: 'Which of the following is the MOST common cause of small bowel obstruction in adults?',
    optionA: 'Inguinal hernia',
    optionB: 'Volvulus',
    optionC: 'Adhesions from prior surgery',
    optionD: 'Intussusception',
    answer: 'C',
    explanation: 'Post-operative adhesions account for approximately 60-70% of small bowel obstructions in adults. Hernias are the second most common cause.',
    difficulty: 1,
    tags: ['bowel obstruction', 'adhesions'],
  },
  {
    batchYear: 'b10',
    questionNumber: 3,
    stem: 'A patient presents with hematemesis and is found to have esophageal varices. What is the FIRST-LINE treatment?',
    optionA: 'Surgical portosystemic shunt',
    optionB: 'Endoscopic band ligation + octreotide',
    optionC: 'TIPS procedure',
    optionD: 'Balloon tamponade (Sengstaken-Blakemore)',
    answer: 'B',
    explanation: 'First-line management combines vasoactive agents (octreotide/somatostatin) with endoscopic therapy (band ligation). Balloon tamponade is reserved for refractory bleeding as a bridge.',
    difficulty: 2,
    tags: ['varices', 'GI bleed', 'portal hypertension'],
  },
  {
    batchYear: 'b10',
    questionNumber: 4,
    stem: 'What is Courvoisier\'s sign and what does it suggest?',
    optionA: 'Palpable non-tender gallbladder → pancreatic head cancer',
    optionB: 'Palpable tender gallbladder → acute cholecystitis',
    optionC: 'Murphy\'s sign positive → cholelithiasis',
    optionD: 'Cullen\'s sign → acute pancreatitis',
    answer: 'A',
    explanation: 'Courvoisier\'s law: a palpable, non-tender gallbladder in a jaundiced patient suggests obstruction by pancreatic head malignancy (not gallstones, which cause chronic inflammation/fibrosis of GB wall).',
    difficulty: 2,
    tags: ['jaundice', 'pancreatic cancer', 'gallbladder'],
  },
  {
    batchYear: 'b10',
    questionNumber: 5,
    stem: 'Charcot\'s triad consists of which three findings?',
    optionA: 'Fever, jaundice, RUQ pain',
    optionB: 'Fever, jaundice, altered mental status',
    optionC: 'RUQ pain, nausea, leukocytosis',
    optionD: 'Fever, RUQ pain, hypotension',
    answer: 'A',
    explanation: 'Charcot\'s triad (fever + jaundice + RUQ pain) = acute cholangitis. Reynolds\' pentad adds hypotension and altered mental status indicating septic shock.',
    difficulty: 2,
    tags: ['cholangitis', 'biliary'],
  },
  {
    batchYear: 'b10',
    questionNumber: 6,
    stem: 'A 60-year-old man with a long history of GERD undergoes endoscopy showing Barrett\'s esophagus with high-grade dysplasia. What is the recommended management?',
    optionA: 'Increase PPI dose and repeat EGD in 3 months',
    optionB: 'Endoscopic eradication therapy (radiofrequency ablation)',
    optionC: 'Esophagectomy',
    optionD: 'H. pylori eradication',
    answer: 'B',
    explanation: 'High-grade dysplasia in Barrett\'s is treated with endoscopic eradication therapy (EET) — typically radiofrequency ablation ± endoscopic mucosal resection. Esophagectomy is reserved for invasive adenocarcinoma.',
    difficulty: 3,
    tags: ['Barrett\'s esophagus', 'GERD', 'esophageal cancer'],
  },
  {
    batchYear: 'b10',
    questionNumber: 7,
    stem: 'Which hernia type passes MEDIAL to the inferior epigastric vessels?',
    optionA: 'Indirect inguinal hernia',
    optionB: 'Direct inguinal hernia',
    optionC: 'Femoral hernia',
    optionD: 'Spigelian hernia',
    answer: 'B',
    explanation: 'Direct inguinal hernias pass through Hesselbach\'s triangle, MEDIAL to the inferior epigastric vessels. Indirect hernias pass LATERAL to them through the deep inguinal ring.',
    difficulty: 2,
    tags: ['hernia', 'inguinal', 'anatomy'],
  },
  {
    batchYear: 'b10',
    questionNumber: 8,
    stem: 'What is the MOST common site of peptic ulcer perforation?',
    optionA: 'Posterior wall of the duodenum',
    optionB: 'Anterior wall of the duodenum',
    optionC: 'Lesser curvature of the stomach',
    optionD: 'Gastric antrum',
    answer: 'B',
    explanation: 'Anterior duodenal ulcers perforate into the peritoneal cavity (causing peritonitis). Posterior duodenal ulcers erode into the gastroduodenal artery, causing massive GI bleeding.',
    difficulty: 2,
    tags: ['peptic ulcer', 'perforation', 'duodenum'],
  },
  {
    batchYear: 'b10',
    questionNumber: 9,
    stem: 'A patient develops fever, tachycardia, and wound erythema on post-op day 1 after colectomy. A foul-smelling, gas-forming infection is suspected. What organism is MOST likely?',
    optionA: 'Staphylococcus aureus',
    optionB: 'Clostridium perfringens',
    optionC: 'Pseudomonas aeruginosa',
    optionD: 'Bacteroides fragilis',
    answer: 'B',
    explanation: 'Gas gangrene (clostridial myonecrosis) from C. perfringens presents within 24-48h with rapidly spreading crepitant, foul-smelling wound infection. Requires immediate surgical debridement + IV penicillin.',
    difficulty: 3,
    tags: ['surgical infection', 'clostridium', 'gas gangrene'],
  },
  {
    batchYear: 'b10',
    questionNumber: 10,
    stem: 'The "duct of Wirsung" refers to which structure?',
    optionA: 'Common bile duct',
    optionB: 'Main pancreatic duct',
    optionC: 'Accessory pancreatic duct',
    optionD: 'Cystic duct',
    answer: 'B',
    explanation: 'The main pancreatic duct is the duct of Wirsung. The accessory duct is the duct of Santorini. Both drain into the duodenum; Wirsung joins the CBD at the ampulla of Vater.',
    difficulty: 1,
    tags: ['pancreas', 'anatomy'],
  },
]

async function main() {
  console.log('Seeding database...')

  const subject = await prisma.subject.upsert({
    where: { name: '外科學' },
    update: {},
    create: { name: '外科學' },
  })

  for (const q of questions) {
    await prisma.question.upsert({
      where: { batchYear_questionNumber: { batchYear: q.batchYear, questionNumber: q.questionNumber } },
      update: q,
      create: { ...q, subjectId: subject.id, questionType: QuestionType.MCQ },
    })
  }

  console.log(`Seeded ${questions.length} questions in subject "${subject.name}"`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

**Step 2: Add seed config to `package.json`**

Add inside the top-level JSON object:
```json
"prisma": {
  "seed": "ts-node --compiler-options '{\"module\":\"CommonJS\"}' prisma/seed.ts"
}
```

Also install ts-node:
```bash
npm install -D ts-node
```

**Step 3: Run seed**

```bash
npx prisma db seed
```
Expected: `Seeded 10 questions in subject "外科學"`

**Step 4: Verify in Prisma Studio**

```bash
npx prisma studio
```
Open `http://localhost:5555` → check `questions` table has 10 rows.

**Step 5: Commit**

```bash
git add prisma/seed.ts package.json
git commit -m "feat: seed 10 surgery MCQ questions"
```

---

## Task 4: LIFF Provider with mock fallback

**Files:**
- Create: `src/components/providers/LiffProvider.tsx`
- Create: `src/lib/liff.ts`

**Step 1: Create `src/lib/liff.ts`**

```typescript
import type { Profile } from '@line/liff'

export type LiffProfile = Pick<Profile, 'userId' | 'displayName' | 'pictureUrl'>

export const MOCK_PROFILE: LiffProfile = {
  userId: 'mock-user-001',
  displayName: 'Mock Student',
  pictureUrl: undefined,
}

export function isMockMode(): boolean {
  return (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1') &&
    !process.env.NEXT_PUBLIC_LIFF_ID
  )
}
```

**Step 2: Create `src/components/providers/LiffProvider.tsx`**

```typescript
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { LiffProfile } from '@/lib/liff'
import { MOCK_PROFILE } from '@/lib/liff'

type LiffContextValue = {
  profile: LiffProfile | null
  isLoading: boolean
  error: string | null
}

const LiffContext = createContext<LiffContextValue>({
  profile: null,
  isLoading: true,
  error: null,
})

export function useLiff() {
  return useContext(LiffContext)
}

export function LiffProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<LiffProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID

      // Mock mode for local dev without a real LIFF ID
      if (!liffId || liffId === 'your-liff-id-or-placeholder') {
        setProfile(MOCK_PROFILE)
        // Upsert mock user in DB
        await fetch('/api/auth/upsert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(MOCK_PROFILE),
        })
        setIsLoading(false)
        return
      }

      try {
        const liff = (await import('@line/liff')).default
        await liff.init({ liffId })
        if (!liff.isLoggedIn()) {
          liff.login()
          return
        }
        const p = await liff.getProfile()
        setProfile({ userId: p.userId, displayName: p.displayName, pictureUrl: p.pictureUrl ?? undefined })
        await fetch('/api/auth/upsert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: p.userId, displayName: p.displayName, pictureUrl: p.pictureUrl }),
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'LIFF init failed')
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  return (
    <LiffContext.Provider value={{ profile, isLoading, error }}>
      {children}
    </LiffContext.Provider>
  )
}
```

**Step 3: Commit**

```bash
git add src/lib/liff.ts src/components/providers/LiffProvider.tsx
git commit -m "feat: add LIFF provider with mock mode for local dev"
```

---

## Task 5: API routes (auth + questions + attempts)

**Files:**
- Create: `src/app/api/auth/upsert/route.ts`
- Create: `src/app/api/questions/random/route.ts`
- Create: `src/app/api/attempts/route.ts`
- Create: `src/app/api/questions/[id]/route.ts`

**Step 1: Create `src/app/api/auth/upsert/route.ts`**

```typescript
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
```

Install zod:
```bash
npm install zod
```

**Step 2: Create `src/app/api/questions/random/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const batchYear = searchParams.get('batchYear') ?? undefined
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 50)

  const where = { isActive: true, ...(batchYear ? { batchYear } : {}) }
  const total = await prisma.question.count({ where })
  if (total === 0) return NextResponse.json({ questions: [] })

  // Random offset sampling (good enough for POC)
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
      // answer and explanation intentionally excluded — revealed after attempt
    },
  })
  return NextResponse.json({ questions })
}
```

**Step 3: Create `src/app/api/questions/[id]/route.ts`**

```typescript
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
      modelAnswer: true,
      keyPoints: true,
    },
  })
  if (!question) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ question })
}
```

**Step 4: Create `src/app/api/attempts/route.ts`**

```typescript
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

  const isCorrect = question.answer != null && selectedAnswer != null
    ? selectedAnswer.toUpperCase() === question.answer.toUpperCase()
    : null

  const attempt = await prisma.attempt.create({
    data: { userId: user.id, questionId, selectedAnswer, isCorrect, timeSpentMs },
  })

  // Return the answer so the UI can show feedback immediately
  return NextResponse.json({ attempt, correctAnswer: question.answer, isCorrect })
}
```

**Step 5: Commit**

```bash
git add src/app/api/
git commit -m "feat: add auth/upsert, questions/random, questions/[id], attempts API routes"
```

---

## Task 6: QuestionCard component

**Files:**
- Create: `src/components/QuestionCard.tsx`

This is the core interactive component — MCQ with tap-to-select and instant feedback.

**Step 1: Create `src/components/QuestionCard.tsx`**

```typescript
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
  loading: boolean
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
    const res = await fetch('/api/attempts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lineUserId, questionId, selectedAnswer: key, timeSpentMs }),
    })
    const data = await res.json()

    // Fetch explanation
    const qRes = await fetch(`/api/questions/${questionId}`)
    const qData = await qRes.json()

    setAnswerState({
      selected: key,
      correct: data.correctAnswer,
      isCorrect: data.isCorrect,
      explanation: qData.question?.explanation ?? null,
      loading: false,
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
```

Install lucide-react (usually bundled with shadcn, but ensure):
```bash
npm install lucide-react
```

**Step 2: Commit**

```bash
git add src/components/QuestionCard.tsx
git commit -m "feat: add MCQ QuestionCard with tap-to-select and instant feedback"
```

---

## Task 7: Practice page

**Files:**
- Create: `src/app/practice/page.tsx`

**Step 1: Create `src/app/practice/page.tsx`**

```typescript
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useLiff } from '@/components/providers/LiffProvider'
import { QuestionCard } from '@/components/QuestionCard'

type RawQuestion = {
  id: string
  stem: string
  optionA?: string
  optionB?: string
  optionC?: string
  optionD?: string
  optionE?: string
  batchYear?: string
  questionNumber?: number
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
      .then((data) => { setQuestions(data.questions ?? []); setLoading(false) })
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
  const options = [
    q.optionA && { key: 'A', label: q.optionA },
    q.optionB && { key: 'B', label: q.optionB },
    q.optionC && { key: 'C', label: q.optionC },
    q.optionD && { key: 'D', label: q.optionD },
    q.optionE && { key: 'E', label: q.optionE },
  ].filter(Boolean) as { key: string; label: string }[]

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
```

**Step 2: Commit**

```bash
git add src/app/practice/page.tsx
git commit -m "feat: add practice page fetching random MCQ questions"
```

---

## Task 8: Home screen + Results page + Layout

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Create: `src/app/results/page.tsx`
- Create: `src/lib/utils.ts` (if not exists from shadcn)

**Step 1: Update `src/app/layout.tsx`**

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LiffProvider } from '@/components/providers/LiffProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NTU Med – 外科考題練習',
  description: 'Surgery exam practice for NTU Med students',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        <LiffProvider>
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </LiffProvider>
      </body>
    </html>
  )
}
```

**Step 2: Replace `src/app/page.tsx` (Home screen)**

```typescript
'use client'

import Link from 'next/link'
import { useLiff } from '@/components/providers/LiffProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const BATCH_YEARS = [
  { key: 'b09', label: 'Batch 09', sublabel: '109學年度', color: 'bg-blue-100 text-blue-700' },
  { key: 'b10', label: 'Batch 10', sublabel: '110學年度', color: 'bg-green-100 text-green-700' },
  { key: 'b11', label: 'Batch 11', sublabel: '111學年度', color: 'bg-purple-100 text-purple-700' },
]

export default function HomePage() {
  const { profile, isLoading } = useLiff()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">初始化中...</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">外科學考題練習</h1>
        {profile && (
          <p className="text-sm text-gray-500 mt-1">嗨，{profile.displayName} 👋</p>
        )}
      </div>

      {/* Batch year cards */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">選擇題庫</h2>
        <div className="flex flex-col gap-3">
          {BATCH_YEARS.map((b) => (
            <Link key={b.key} href={`/practice?batchYear=${b.key}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-blue-300">
                <CardContent className="flex items-center justify-between py-4 px-5">
                  <div>
                    <p className="font-semibold text-gray-800">{b.label}</p>
                    <p className="text-xs text-gray-400">{b.sublabel}</p>
                  </div>
                  <Badge className={b.color}>開始練習 →</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick start — all questions */}
      <Link href="/practice">
        <Button className="w-full" size="lg">
          隨機練習（所有題庫）
        </Button>
      </Link>
    </div>
  )
}
```

**Step 3: Create `src/app/results/page.tsx`**

```typescript
'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function ResultsContent() {
  const searchParams = useSearchParams()
  const correct = parseInt(searchParams.get('correct') ?? '0')
  const total = parseInt(searchParams.get('total') ?? '0')
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0

  const emoji = pct >= 80 ? '🎉' : pct >= 60 ? '💪' : '📖'
  const message = pct >= 80 ? '太棒了！' : pct >= 60 ? '繼續加油！' : '再複習一下吧'

  return (
    <div className="px-4 py-12 max-w-lg mx-auto flex flex-col items-center gap-6">
      <div className="text-6xl">{emoji}</div>
      <h1 className="text-2xl font-bold text-gray-800">{message}</h1>

      <Card className="w-full">
        <CardContent className="pt-6 text-center">
          <p className="text-5xl font-bold text-blue-600">{pct}%</p>
          <p className="text-gray-500 mt-2">{correct} / {total} 答對</p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 w-full">
        <Link href="/practice" className="w-full">
          <Button className="w-full" size="lg">再練一輪</Button>
        </Link>
        <Link href="/" className="w-full">
          <Button variant="outline" className="w-full" size="lg">回首頁</Button>
        </Link>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">載入中...</div>}>
      <ResultsContent />
    </Suspense>
  )
}
```

**Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/page.tsx src/app/results/page.tsx
git commit -m "feat: add home screen, results page, and root layout with LiffProvider"
```

---

## Task 9: Run locally and verify full flow

**Step 1: Start dev server**

```bash
npm run dev
```
Open `http://localhost:3000`

**Step 2: Verify the flow**

1. Home page loads with batch year cards and mock user greeting
2. Click "Batch 10" → practice page loads 10 questions
3. Tap an answer → option highlights green/red immediately
4. Explanation appears below
5. Click "下一題 →" → next question loads
6. After Q10 → redirects to `/results?correct=X&total=10`
7. Results page shows score + emoji

**Step 3: Fix any TypeScript / build errors**

```bash
npm run build
```
Fix any errors reported. Common ones:
- Missing `@prisma/client` field selections → ensure `keyPoints` is in Question model only if field exists
- Import path mismatches → check `@/*` tsconfig path alias

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: verify full POC flow works end-to-end"
```

---

## POC Complete — What You Have

| Feature | Status |
|---------|--------|
| LIFF auth (mock for local) | ✅ |
| Supabase + Prisma schema | ✅ |
| 10 seeded surgery MCQs | ✅ |
| Home screen (batch year picker) | ✅ |
| MCQ question card + instant feedback | ✅ |
| Explanation on answer reveal | ✅ |
| Results screen | ✅ |
| API: upsert user, random questions, save attempt | ✅ |

## Next Steps (post-POC)

1. Add real LIFF ID → test in LINE via ngrok
2. Deploy to Vercel → set env vars
3. Add Google Sheets sync (`/api/admin/sync-sheet`)
4. Add question types: FIB, SAQ, ORDER, MATCH
5. Progress dashboard (`/progress`)
6. Wrong answers review (`/review`)
