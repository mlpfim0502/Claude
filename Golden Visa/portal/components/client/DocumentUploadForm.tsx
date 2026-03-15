'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Document, DocumentType } from '@/lib/supabase/types'

interface DocumentUploadFormProps {
  applicationId: string
  existingDocuments: Document[]
}

const REQUIRED_DOCS: { type: DocumentType; label: string; labelZh: string; hint: string; accept: string }[] = [
  {
    type: 'passport',
    label: 'Passport Copy',
    labelZh: '護照影本',
    hint: '彩色掃描PDF或JPG，有效期6個月以上',
    accept: 'image/*,.pdf',
  },
  {
    type: 'degree_certificate',
    label: 'Degree Certificate',
    labelZh: '學位證書',
    hint: '需經MOFA及UAE大使館認證後掃描上傳',
    accept: 'image/*,.pdf',
  },
  {
    type: 'transcripts',
    label: 'Academic Transcripts',
    labelZh: '成績單',
    hint: '顯示GPA 3.5以上，PDF或JPG',
    accept: 'image/*,.pdf',
  },
  {
    type: 'photo',
    label: 'Passport Photo',
    labelZh: '護照照片',
    hint: '白色背景，JPG格式，近期拍攝',
    accept: 'image/*',
  },
  {
    type: 'medical_exam',
    label: 'Medical Exam Result',
    labelZh: '體檢報告',
    hint: '在UAE指定醫療中心完成後上傳PDF',
    accept: 'image/*,.pdf',
  },
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export default function DocumentUploadForm({ applicationId, existingDocuments }: DocumentUploadFormProps) {
  const [uploading, setUploading] = useState<DocumentType | null>(null)
  const [messages, setMessages] = useState<Record<DocumentType, string>>({} as Record<DocumentType, string>)
  const supabase = createClient()

  const docMap = new Map(existingDocuments.map((d) => [d.doc_type, d]))

  function setMsg(type: DocumentType, msg: string) {
    setMessages((prev) => ({ ...prev, [type]: msg }))
  }

  async function handleUpload(type: DocumentType, file: File) {
    if (file.size > MAX_FILE_SIZE) {
      setMsg(type, '檔案過大，請上傳10MB以下的檔案')
      return
    }

    setUploading(type)
    setMsg(type, '')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setMsg(type, '請重新登入'); setUploading(null); return }

    const ext = file.name.split('.').pop()
    const path = `${user.id}/${type}/${Date.now()}.${ext}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setMsg(type, `上傳失敗: ${uploadError.message}`)
      setUploading(null)
      return
    }

    // Upsert document record
    const existing = docMap.get(type)
    if (existing) {
      const { error } = await supabase
        .from('documents')
        .update({
          file_path: path,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          status: 'uploaded',
          uploaded_at: new Date().toISOString(),
        })
        .eq('id', existing.id)

      if (error) { setMsg(type, `更新失敗: ${error.message}`); setUploading(null); return }
    } else {
      const { error } = await supabase
        .from('documents')
        .insert({
          application_id: applicationId,
          client_id: user.id,
          doc_type: type,
          file_path: path,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          status: 'uploaded',
          uploaded_at: new Date().toISOString(),
        })

      if (error) { setMsg(type, `新增失敗: ${error.message}`); setUploading(null); return }
    }

    setMsg(type, '✓ 上傳成功！我們將盡快審核您的文件。')
    setUploading(null)

    // Refresh document list
    window.location.reload()
  }

  return (
    <div className="space-y-4">
      {REQUIRED_DOCS.map((doc) => {
        const existing = docMap.get(doc.type)
        const isUploading = uploading === doc.type
        const msg = messages[doc.type]

        return (
          <div key={doc.type} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  {doc.labelZh}
                  <span className="text-gray-400 ml-1 text-sm font-normal">/ {doc.label}</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{doc.hint}</p>

                {existing && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      existing.status === 'verified' ? 'bg-green-100 text-green-700' :
                      existing.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {existing.status === 'verified' ? '✓ 已驗證' :
                       existing.status === 'rejected' ? '✗ 需重傳' :
                       '↑ 審核中'}
                    </span>
                    {existing.file_name && (
                      <span className="text-xs text-gray-400 truncate max-w-48">{existing.file_name}</span>
                    )}
                  </div>
                )}

                {msg && (
                  <p className={`text-xs mt-2 ${msg.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
                    {msg}
                  </p>
                )}
              </div>

              <label className={`cursor-pointer shrink-0 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input
                  type="file"
                  accept={doc.accept}
                  disabled={isUploading || existing?.status === 'verified'}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleUpload(doc.type, file)
                    e.target.value = ''
                  }}
                />
                <span className={`inline-block px-4 py-2 rounded-lg text-sm font-medium transition ${
                  existing?.status === 'verified'
                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}>
                  {isUploading ? '上傳中...' :
                   existing?.status === 'verified' ? '已完成' :
                   existing ? '重新上傳' : '選擇檔案'}
                </span>
              </label>
            </div>
          </div>
        )
      })}
    </div>
  )
}
