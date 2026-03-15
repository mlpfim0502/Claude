import type { Application, ApplicationStage } from '@/lib/supabase/types'

interface ApplicationStatusProps {
  application: Application
}

const STAGES: { key: ApplicationStage; label: string; labelZh: string }[] = [
  { key: 'intake', label: 'Intake', labelZh: '資料收集' },
  { key: 'attestation', label: 'Attestation', labelZh: '文件認證' },
  { key: 'submission', label: 'Submission', labelZh: '提交申請' },
  { key: 'medical', label: 'Medical', labelZh: '體檢' },
  { key: 'emirates_id', label: 'Emirates ID', labelZh: 'Emirates ID' },
  { key: 'completed', label: 'Completed', labelZh: '完成' },
]

const STAGE_INDEX: Record<ApplicationStage, number> = {
  intake: 0,
  attestation: 1,
  submission: 2,
  medical: 3,
  emirates_id: 4,
  completed: 5,
}

export default function ApplicationStatus({ application }: ApplicationStatusProps) {
  const currentIndex = STAGE_INDEX[application.stage]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="font-semibold text-gray-900 mb-5">申請進度 / Application Progress</h2>

      {/* Progress bar */}
      <div className="relative">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-amber-500 transition-all duration-500"
          style={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
        />

        <div className="relative flex justify-between">
          {STAGES.map((stage, index) => {
            const isDone = index < currentIndex
            const isCurrent = index === currentIndex
            return (
              <div key={stage.key} className="flex flex-col items-center gap-2 w-16">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 ${
                    isDone
                      ? 'bg-amber-500 text-white'
                      : isCurrent
                      ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                      : 'bg-white border-2 border-gray-300 text-gray-400'
                  }`}
                >
                  {isDone ? '✓' : index + 1}
                </div>
                <div className="text-center">
                  <div className={`text-xs font-medium ${isCurrent ? 'text-amber-600' : 'text-gray-500'}`}>
                    {stage.labelZh}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Current stage info */}
      <div className="mt-6 bg-amber-50 rounded-lg px-4 py-3">
        <p className="text-sm text-amber-800">
          <span className="font-medium">目前階段：</span>
          {STAGES[currentIndex]?.labelZh} / {STAGES[currentIndex]?.label}
        </p>
        {application.notes && (
          <p className="text-sm text-amber-700 mt-1">{application.notes}</p>
        )}
      </div>
    </div>
  )
}
