import { ArrowLeft, Briefcase, Building2, Calendar, Clock, DollarSign, Radio, Sparkles } from 'lucide-react'

interface KeyInfo {
  client: string
  jobToBeDone: string
  budget: string
  dueDate: string
  liveDate: string
  campaignDuration: string
}

interface KeyInformationStepProps {
  keyInfo: KeyInfo
  onNext: () => void
  onEdit: (field: keyof KeyInfo, value: string) => void
  onBack: () => void
  clients?: Array<{ id: string; name: string }>
  clientId?: string | null
  onClientChange?: (clientId: string | null) => void
}

export default function KeyInformationStep({
  keyInfo,
  onNext,
  onEdit,
  onBack,
  clients,
  clientId,
  onClientChange,
}: KeyInformationStepProps) {
  const fields = [
    {
      key: 'jobToBeDone' as const,
      label: 'Job to be Done',
      icon: Briefcase,
      placeholder: 'Description of work',
    },
    {
      key: 'budget' as const,
      label: 'Budget',
      icon: DollarSign,
      placeholder: 'Total campaign budget',
    },
    {
      key: 'dueDate' as const,
      label: 'Due Date',
      icon: Calendar,
      placeholder: 'YYYY-MM-DD',
      type: 'date',
    },
    {
      key: 'liveDate' as const,
      label: 'Live Date',
      icon: Radio,
      placeholder: 'YYYY-MM-DD',
      type: 'date',
    },
    {
      key: 'campaignDuration' as const,
      label: 'Campaign Duration',
      icon: Clock,
      placeholder: 'e.g. 6 weeks',
    },
  ]

  const handleClientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value || null
    onClientChange?.(selectedId)
    // Keep display state in sync
    const selectedClient = clients?.find((c) => c.id === selectedId)
    onEdit('client', selectedClient?.name ?? '')
  }

  return (
    <div className="mx-auto px-10 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="mb-4">Key Information Extracted</h2>
          <p className="text-gray-700 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            Review and edit the AI-extracted details from your brief
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client dropdown */}
            <div>
              <label className="block mb-2 items-center gap-2">
                <Building2 className="w-4 h-4 text-yellow-400" />
                <span>Client</span>
              </label>
              {clients && onClientChange ? (
                <select
                  value={clientId ?? ''}
                  onChange={handleClientSelect}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-yellow-50"
                >
                  <option value="">— Select client —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={keyInfo.client}
                  onChange={(e) => onEdit('client', e.target.value)}
                  placeholder="Client name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-yellow-50"
                />
              )}
            </div>

            {/* Other fields */}
            {fields.map((field) => (
              <div key={field.key} className={field.key === 'jobToBeDone' ? 'md:col-span-2' : ''}>
                <label className="block mb-2 items-center gap-2">
                  <field.icon className="w-4 h-4 text-yellow-400" />
                  <span>{field.label}</span>
                </label>
                {field.key === 'jobToBeDone' ? (
                  <textarea
                    value={keyInfo[field.key]}
                    onChange={(e) => onEdit(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-yellow-50"
                    rows={3}
                  />
                ) : (
                  <input
                    type={field.type || 'text'}
                    value={keyInfo[field.key]}
                    onChange={(e) => onEdit(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-yellow-50"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={onBack}
              className="px-8 bg-white text-gray-700 py-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <button
              onClick={onNext}
              className="flex-1 bg-black text-white py-4 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Continue to Practice Area Triage
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
