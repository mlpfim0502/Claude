import Link from 'next/link'
import type { Document, DocumentType, DocumentStatus } from '@/lib/supabase/types'

interface DocumentChecklistProps {
  documents: Document[]
  applicationId: string
}

const REQUIRED_DOCS: { type: DocumentType; label: string; labelZh: string; hint: string }[] = [
  {
    type: 'passport',
    label: 'Passport Copy',
    labelZh: '護照影本',
    hint: '彩色掃描，有效期6個月以上',
  },
  {
    type: 'degree_certificate',
    label: 'Degree Certificate',
    labelZh: '學位證書',
    hint: '需經MOFA及UAE大使館認證',
  },
  {
    type: 'transcripts',
    label: 'Academic Transcripts',
    labelZh: '成績單',
    hint: 'GPA 3.5以上，須顯示成績',
  },
  {
    type: 'photo',
    label: 'Passport Photo',
    labelZh: '護照照片',
    hint: '白色背景，近期拍攝',
  },
  {
    type: 'medical_exam',
    label: 'Medical Exam',
    labelZh: '體檢報告',
    hint: '在UAE指定醫療中心完成',
  },
]

const STATUS_CONFIG: Record<DocumentStatus, { label: string; color: string; icon: string }> = {
  pending: { label: '待上傳', color: 'text-gray-500 bg-gray-100', icon: '○' },
  uploaded: { label: '已上傳', color: 'text-blue-700 bg-blue-100', icon: '↑' },
  received: { label: '已收到', color: 'text-yellow-700 bg-yellow-100', icon: '✓' },
  verified: { label: '已驗證', color: 'text-green-700 bg-green-100', icon: '✓✓' },
  rejected: { label: '需重傳', color: 'text-red-700 bg-red-100', icon: '✗' },
}

export default function DocumentChecklist({ documents, applicationId }: DocumentChecklistProps) {
  const docMap = new Map(documents.map((d) => [d.doc_type, d]))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-gray-900">文件清單 / Document Checklist</h2>
        <Link
          href="/documents"
          className="text-sm text-amber-600 hover:text-amber-700 font-medium"
        >
          上傳文件 →
        </Link>
      </div>

      <div className="space-y-3">
        {REQUIRED_DOCS.map((doc) => {
          const existing = docMap.get(doc.type)
          const status = existing?.status ?? 'pending'
          const config = STATUS_CONFIG[status]

          return (
            <div
              key={doc.type}
              className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition"
            >
              <div className={`text-xs font-bold px-2 py-1 rounded-full mt-0.5 ${config.color}`}>
                {config.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-gray-900">
                    {doc.labelZh}
                    <span className="text-gray-400 ml-1 font-normal">/ {doc.label}</span>
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${config.color}`}>
                    {config.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{doc.hint}</p>
                {existing?.admin_notes && status === 'rejected' && (
                  <p className="text-xs text-red-600 mt-1 bg-red-50 px-2 py-1 rounded">
                    備注：{existing.admin_notes}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          已完成：{documents.filter((d) => d.status === 'verified').length} / {REQUIRED_DOCS.length} 份
        </p>
        <div className="w-32 bg-gray-200 rounded-full h-2">
          <div
            className="bg-amber-500 h-2 rounded-full transition-all"
            style={{
              width: `${(documents.filter((d) => d.status === 'verified').length / REQUIRED_DOCS.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
