'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminNav() {
  const pathname = usePathname()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const links = [
    { href: '/admin/clients', label: '客戶管理' },
  ]

  return (
    <nav className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin/clients" className="flex items-center gap-2 font-bold text-amber-400">
            <span>🇦🇪</span> Admin Portal
          </Link>
          <div className="flex gap-4">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition ${
                  pathname.startsWith(href)
                    ? 'text-amber-400'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="text-sm text-gray-400 hover:text-white transition"
        >
          登出
        </button>
      </div>
    </nav>
  )
}
