import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AdminClientDetail from '@/components/admin/AdminClientDetail'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminClientPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: profile }, { data: application }, { data: documents }, { data: notes }] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('applications').select('*').eq('client_id', id).single(),
      supabase.from('documents').select('*').eq('client_id', id),
      supabase.from('client_notes').select('*').eq('client_id', id).order('created_at', { ascending: false }),
    ])

  if (!profile) notFound()

  return (
    <AdminClientDetail
      profile={profile}
      application={application}
      documents={documents ?? []}
      notes={notes ?? []}
    />
  )
}
