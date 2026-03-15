import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ApplicationStatus from '@/components/client/ApplicationStatus'
import DocumentChecklist from '@/components/client/DocumentChecklist'

export default async function ClientDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: profile }, { data: application }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('applications').select('*').eq('client_id', user.id).single(),
  ])

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('client_id', user.id)

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          歡迎回來 / Welcome back
          {profile?.full_name && <span className="text-amber-600">, {profile.full_name}</span>}
        </h1>
        <p className="text-gray-500 mt-1">UAE Golden Visa 申請進度</p>
      </div>

      {/* Application status tracker */}
      {application && <ApplicationStatus application={application} />}

      {/* Document checklist */}
      <DocumentChecklist
        documents={documents ?? []}
        applicationId={application?.id ?? ''}
      />

      {/* Contact */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h3 className="font-semibold text-amber-800 mb-2">需要協助？</h3>
        <p className="text-amber-700 text-sm mb-3">如有任何問題，請透過以下方式聯絡我們</p>
        <div className="flex gap-3 flex-wrap">
          <a
            href="https://line.me/ti/p/your-line-id"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition"
          >
            <span>💬</span> LINE
          </a>
          <a
            href="https://wa.me/your-number"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
          >
            <span>📱</span> WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
