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
          body: JSON.stringify({ userId: MOCK_PROFILE.userId, displayName: MOCK_PROFILE.displayName }),
        }).catch((e) => console.warn('[LiffProvider] mock upsert failed:', e))
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
