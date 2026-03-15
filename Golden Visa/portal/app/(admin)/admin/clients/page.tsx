import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { ApplicationStage, Application, Profile, Document } from '@/lib/supabase/types'

type ApplicationWithProfile = Application & { profiles: Profile | null }

const STAGE_LABELS: Record<ApplicationStage, string> = {
  intake: '資料收集',
  attestation: '文件認證',
  submission: '提交申請',
  medical: '體檢',
  emirates_id: 'Emirates ID',
  completed: '完成',
}

const STAGE_COLORS: Record<ApplicationStage, string> = {
  intake: 'bg-gray-100 text-gray-700',
  attestation: 'bg-yellow-100 text-yellow-700',
  submission: 'bg-blue-100 text-blue-700',
  medical: 'bg-purple-100 text-purple-700',
  emirates_id: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
}

export default async function AdminClientsPage() {
  const supabase = await createClient()

  const { data: applicationsRaw } = await supabase
    .from('applications')
    .select(`
      *,
      profiles:client_id (id, email, full_name, phone, created_at)
    `)
    .order('created_at', { ascending: false })
  const applications = applicationsRaw as ApplicationWithProfile[] | null

  const { data: allDocsRaw } = await supabase
    .from('documents')
    .select('*')
  const allDocs = allDocsRaw as Document[] | null

  // Count docs per client
  const docCounts = new Map<string, { total: number; verified: number }>()
  allDocs?.forEach((doc) => {
    const counts = docCounts.get(doc.client_id) ?? { total: 0, verified: 0 }
    docCounts.set(doc.client_id, {
      total: counts.total + 1,
      verified: counts.verified + (doc.status === 'verified' ? 1 : 0),
    })
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">客戶管理 / Clients</h1>
          <p className="text-gray-500 mt-1">共 {applications?.length ?? 0} 位申請人</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(['intake', 'attestation', 'submission', 'completed'] as ApplicationStage[]).map((stage) => {
          const count = applications?.filter((a) => a.stage === stage).length ?? 0
          return (
            <div key={stage} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-sm text-gray-500">{STAGE_LABELS[stage]}</p>
            </div>
          )
        })}
      </div>

      {/* Client table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">姓名 / Name</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden sm:table-cell">Email</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">階段 / Stage</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">文件</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden lg:table-cell">申請日</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {applications?.map((app) => {
              const profile = app.profiles
              const counts = docCounts.get(app.client_id)
              return (
                <tr key={app.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 text-sm">{profile?.full_name ?? '—'}</p>
                    <p className="text-xs text-gray-400 sm:hidden">{profile?.email}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="text-sm text-gray-600">{profile?.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STAGE_COLORS[app.stage]}`}>
                      {STAGE_LABELS[app.stage]}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-sm text-gray-600">
                      {counts ? `${counts.verified}/${counts.total}` : '0/0'}
                    </p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="text-sm text-gray-500">
                      {new Date(app.created_at).toLocaleDateString('zh-TW')}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/clients/${app.client_id}`}
                      className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                    >
                      詳細 →
                    </Link>
                  </td>
                </tr>
              )
            })}
            {(!applications || applications.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">
                  暫無申請人 / No clients yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
