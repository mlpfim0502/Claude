'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { Profile, Application, Document, ClientNote, ApplicationStage, DocumentType, DocumentStatus } from '@/lib/supabase/types'

interface AdminClientDetailProps {
  profile: Profile
  application: Application | null
  documents: Document[]
  notes: ClientNote[]
}

const STAGES: { value: ApplicationStage; label: string }[] = [
  { value: 'intake', label: '資料收集 / Intake' },
  { value: 'attestation', label: '文件認證 / Attestation' },
  { value: 'submission', label: '提交申請 / Submission' },
  { value: 'medical', label: '體檢 / Medical' },
  { value: 'emirates_id', label: 'Emirates ID' },
  { value: 'completed', label: '完成 / Completed' },
]

const DOC_LABELS: Record<DocumentType, string> = {
  passport: '護照影本',
  degree_certificate: '學位證書',
  transcripts: '成績單',
  photo: '護照照片',
  medical_exam: '體檢報告',
  other: '其他',
}

const DOC_STATUSES: { value: DocumentStatus; label: string }[] = [
  { value: 'pending', label: '待上傳' },
  { value: 'uploaded', label: '已上傳' },
  { value: 'received', label: '已收到' },
  { value: 'verified', label: '已驗證' },
  { value: 'rejected', label: '需重傳' },
]

export default function AdminClientDetail({ profile, application, documents, notes }: AdminClientDetailProps) {
  const [stage, setStage] = useState<ApplicationStage>(application?.stage ?? 'intake')
  const [appNotes, setAppNotes] = useState(application?.notes ?? '')
  const [newNote, setNewNote] = useState('')
  const [notesList, setNotesList] = useState(notes)
  const [docStatuses, setDocStatuses] = useState<Record<string, DocumentStatus>>(
    Object.fromEntries(documents.map((d) => [d.id, d.status]))
  )
  const [docAdminNotes, setDocAdminNotes] = useState<Record<string, string>>(
    Object.fromEntries(documents.map((d) => [d.id, d.admin_notes ?? '']))
  )
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')

  const supabase = createClient()

  async function saveApplicationChanges() {
    if (!application) return
    setSaving(true)
    const { error } = await supabase
      .from('applications')
      .update({ stage, notes: appNotes })
      .eq('id', application.id)
    setSaving(false)
    setSavedMsg(error ? `錯誤: ${error.message}` : '已儲存 ✓')
    setTimeout(() => setSavedMsg(''), 3000)
  }

  async function saveDocumentStatus(docId: string) {
    const { error } = await supabase
      .from('documents')
      .update({
        status: docStatuses[docId],
        admin_notes: docAdminNotes[docId] || null,
        verified_at: docStatuses[docId] === 'verified' ? new Date().toISOString() : null,
      })
      .eq('id', docId)
    if (!error) {
      setSavedMsg('文件狀態已更新 ✓')
      setTimeout(() => setSavedMsg(''), 3000)
    }
  }

  async function addNote() {
    if (!newNote.trim()) return
    const { data, error } = await supabase
      .from('client_notes')
      .insert({ client_id: profile.id, content: newNote })
      .select()
      .single()
    if (!error && data) {
      setNotesList([data, ...notesList])
      setNewNote('')
    }
  }

  async function getDocumentUrl(filePath: string) {
    const { data } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 300) // 5 min expiry
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/clients" className="text-gray-400 hover:text-gray-600 text-sm">
          ← 返回客戶列表
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{profile.full_name ?? profile.email}</h1>
          <p className="text-gray-500">{profile.email}</p>
          {profile.phone && <p className="text-gray-400 text-sm">{profile.phone}</p>}
        </div>
        {savedMsg && (
          <span className={`text-sm px-3 py-1.5 rounded-lg ${savedMsg.includes('錯誤') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {savedMsg}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application status */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">申請狀態</h2>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">申請階段 / Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as ApplicationStage)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {STAGES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">備注 / Notes</label>
            <textarea
              value={appNotes}
              onChange={(e) => setAppNotes(e.target.value)}
              rows={3}
              placeholder="申請備注..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <button
            onClick={saveApplicationChanges}
            disabled={saving}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 rounded-lg text-sm transition disabled:opacity-50"
          >
            {saving ? '儲存中...' : '儲存變更 / Save'}
          </button>
        </div>

        {/* CRM Notes */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">CRM 備注</h2>

          <div className="flex gap-2">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={2}
              placeholder="新增備注..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              onClick={addNote}
              className="px-4 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition"
            >
              新增
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notesList.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">暫無備注</p>
            )}
            {notesList.map((note) => (
              <div key={note.id} className="bg-gray-50 rounded-lg px-3 py-2">
                <p className="text-sm text-gray-700">{note.content}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(note.created_at).toLocaleString('zh-TW')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">文件管理 / Documents</h2>

        {documents.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">尚未上傳任何文件</p>
        )}

        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-gray-900">
                      {DOC_LABELS[doc.doc_type]}
                    </span>
                    {doc.file_name && (
                      <span className="text-xs text-gray-400 truncate max-w-48">{doc.file_name}</span>
                    )}
                  </div>

                  <div className="flex gap-3 mt-2 flex-wrap">
                    <select
                      value={docStatuses[doc.id]}
                      onChange={(e) => setDocStatuses((prev) => ({ ...prev, [doc.id]: e.target.value as DocumentStatus }))}
                      className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                    >
                      {DOC_STATUSES.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={docAdminNotes[doc.id]}
                      onChange={(e) => setDocAdminNotes((prev) => ({ ...prev, [doc.id]: e.target.value }))}
                      placeholder="管理員備注..."
                      className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs min-w-32 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  {doc.file_path && (
                    <button
                      onClick={() => getDocumentUrl(doc.file_path!)}
                      className="text-xs text-blue-600 hover:text-blue-700 border border-blue-200 px-2 py-1 rounded"
                    >
                      檢視
                    </button>
                  )}
                  <button
                    onClick={() => saveDocumentStatus(doc.id)}
                    className="text-xs bg-amber-500 text-white px-2 py-1 rounded hover:bg-amber-600 transition"
                  >
                    儲存
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
