import { ArrowLeft, CheckCircle2, Users } from 'lucide-react'

interface DepartmentTriageStepProps {
  leadDepartment: string
  rationale: string
  onLeadDepartmentChange: (dept: string) => void
  onSupportingDepartmentsChange: (depts: string[]) => void
  onNext: () => void
  onBack: () => void
}

// prettier-ignore
const practices = ['Creative', 'Design', 'Social', 'Influencer', 'Earned PR', 'Crisis and Corporate Communications', 'Partnership', 'Experiential', 'Insights', 'Media Planning and Buying', 'Advisory (Digital)', 'Analytics (Digital)', 'Automation (Digital)', 'Activation (Digital)'];

export default function DepartmentTriageStep({
  leadDepartment,
  rationale,
  onLeadDepartmentChange,
  onSupportingDepartmentsChange,
  onNext,
  onBack,
}: DepartmentTriageStepProps) {
  const handlePracticeSelect = (dept: string) => {
    onLeadDepartmentChange(dept)
    onSupportingDepartmentsChange([])
  }

  return (
    <div className="mx-auto px-10 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="mb-4">AI Practice Area Triage</h2>
          <p className="text-gray-700 flex items-center justify-center gap-2">
            Based on the brief analysis, here's our recommended practice area structure
          </p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Practice Area Selection */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
          <h3 className="mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-yellow-400" />
            Practice Area Assignment
          </h3>
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>Click a practice</strong> to assign this brief to that area
            </p>
          </div>
          <div className="space-y-3">
            {practices.map((dept) => {
              const isSelected = dept === leadDepartment
              return (
                <div
                  key={dept}
                  onClick={() => handlePracticeSelect(dept)}
                  className={`rounded-lg border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
                    isSelected
                      ? 'bg-yellow-400 border-yellow-400'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={isSelected ? 'font-semibold text-lg' : 'text-gray-700'}>
                      {dept}
                    </span>
                    {isSelected && <CheckCircle2 className="w-6 h-6 text-black" />}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        {/* AI Rationale */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
          <h3 className="mb-6">AI Analysis & Recommendation</h3>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm font-semibold text-yellow-900 mb-2">
                Recommended Practice Area
              </p>
              <p className="text-2xl font-bold text-black mb-2">{leadDepartment}</p>
              <p className="text-sm text-gray-700">
                Based on brief analysis and campaign requirements
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold mb-2">Rationale</p>
              <p className="text-sm text-gray-700 leading-relaxed">{rationale}</p>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                <strong>Note:</strong> You can change the practice assignment at any time by
                selecting a different option from the list.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Navigation */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={onBack}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={onNext}
          className="bg-yellow-400 text-black px-8 py-3 rounded-lg hover:bg-yellow-500 transition-colors font-medium"
        >
          Continue to Enhancement
        </button>
      </div>
    </div>
  )
}
