import type { BriefAnalysisStatus } from '@bastion-os/shared'
import { Upload, FileSearch, Building2, LayoutList, Check, X, Loader2, RotateCcw } from 'lucide-react'

interface AnalysisProgressProps {
  analysisStatus: BriefAnalysisStatus | null
  isUploading: boolean
  error: string | null
  onRetry: () => void
}

type PhaseStatus = 'pending' | 'active' | 'complete' | 'failed'

interface Phase {
  label: string
  icon: typeof Upload
}

const PHASES: Phase[] = [
  { label: 'Uploading brief', icon: Upload },
  { label: 'Extracting text', icon: FileSearch },
  { label: 'Analysing practice area', icon: Building2 },
  { label: 'Generating sections', icon: LayoutList },
]

function getPhaseStatuses(
  analysisStatus: BriefAnalysisStatus | null,
  isUploading: boolean,
): PhaseStatus[] {
  if (isUploading) return ['active', 'pending', 'pending', 'pending']
  if (!analysisStatus) return ['pending', 'pending', 'pending', 'pending']

  switch (analysisStatus) {
    case 'pending':
    case 'extracting':
      return ['complete', 'active', 'pending', 'pending']
    case 'extracted':
    case 'triaging':
      return ['complete', 'complete', 'active', 'pending']
    case 'triaged':
    case 'generating':
      return ['complete', 'complete', 'complete', 'active']
    case 'ready':
      return ['complete', 'complete', 'complete', 'complete']
    case 'extract_failed':
      return ['complete', 'failed', 'pending', 'pending']
    case 'triage_failed':
      return ['complete', 'complete', 'failed', 'pending']
    case 'sections_failed':
      return ['complete', 'complete', 'complete', 'failed']
    default:
      return ['pending', 'pending', 'pending', 'pending']
  }
}

function PhaseIcon({ phase, status }: { phase: Phase; status: PhaseStatus }) {
  const Icon = phase.icon
  if (status === 'complete') return <Check className="w-5 h-5 text-green-600" />
  if (status === 'failed') return <X className="w-5 h-5 text-red-600" />
  if (status === 'active') return <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
  return <Icon className="w-5 h-5 text-gray-300" />
}

export default function AnalysisProgress({
  analysisStatus,
  isUploading,
  error,
  onRetry,
}: AnalysisProgressProps) {
  const statuses = getPhaseStatuses(analysisStatus, isUploading)
  const hasFailed = statuses.includes('failed')

  return (
    <div className="max-w-md mx-auto px-8 py-12">
      <div className="text-center mb-10">
        <h2 className="mb-2">Analysing your brief</h2>
        <p className="text-gray-600 text-sm">This usually takes about 30 seconds</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <div className="space-y-1">
          {PHASES.map((phase, i) => {
            const status = statuses[i]
            const isLast = i === PHASES.length - 1
            return (
              <div key={phase.label}>
                <div className="flex items-center gap-4 py-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${
                      status === 'complete'
                        ? 'bg-green-50 border-2 border-green-200'
                        : status === 'active'
                          ? 'bg-yellow-50 border-2 border-yellow-300'
                          : status === 'failed'
                            ? 'bg-red-50 border-2 border-red-200'
                            : 'bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    <PhaseIcon phase={phase} status={status} />
                  </div>
                  <span
                    className={`text-sm font-medium transition-colors duration-300 ${
                      status === 'complete'
                        ? 'text-green-700'
                        : status === 'active'
                          ? 'text-gray-900'
                          : status === 'failed'
                            ? 'text-red-700'
                            : 'text-gray-400'
                    }`}
                  >
                    {phase.label}
                  </span>
                </div>
                {!isLast && (
                  <div className="ml-5 w-px h-4 bg-gray-200" />
                )}
              </div>
            )
          })}
        </div>

        {hasFailed && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-red-700 mb-3">{error ?? 'Analysis failed'}</p>
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
