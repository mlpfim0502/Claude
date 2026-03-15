import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DocumentUploadForm from '@/components/client/DocumentUploadForm'

export default async function DocumentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: application } = await supabase
    .from('applications')
    .select('*')
    .eq('client_id', user.id)
    .single()

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('client_id', user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">上傳文件 / Upload Documents</h1>
        <p className="text-gray-500 mt-1">請上傳所有必要文件以進行申請</p>
      </div>

      <DocumentUploadForm
        applicationId={application?.id ?? ''}
        existingDocuments={documents ?? []}
      />
    </div>
  )
}
