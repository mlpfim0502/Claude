'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/types'

interface ClientNavProps {
  profile: Profile | null
}

export default function ClientNav({ profile }: ClientNavProps) {
  const pathname = usePathname()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const links = [
    { href: '/dashboard', label: '申請進度' },
    { href: '/documents', label: '文件上傳' },
  ]

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-amber-600">
            <span>🇦🇪</span> Golden Visa
          </Link>
          <div className="flex gap-4">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition ${
                  pathname === href
                    ? 'text-amber-600 border-b-2 border-amber-500 pb-0.5'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden sm:block">
            {profile?.email ?? ''}
          </span>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 hover:text-gray-700 transition"
          >
            登出
          </button>
        </div>
      </div>
    </nav>
  )
}
