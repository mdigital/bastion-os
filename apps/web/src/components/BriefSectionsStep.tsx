import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit2,
  FileDown,
  Radio,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { BriefSection } from './BriefSection'
import { ExportBriefModal } from './ExportBriefModal'

interface SectionData {
  title: string
  content: string
  missing: string[]
  enhancements: string[]
  questions: string[]
}

interface KeyInfo {
  client: string
  jobToBeDone: string
  budget: string
  dueDate: string
  liveDate: string
  campaignDuration: string
  briefLevel: string
}

interface BriefSectionsStepProps {
  onKeyInfoChange?: (field: keyof KeyInfo, value: string) => void
  keyInfo: KeyInfo
  onLeadDepartmentChange?: (dept: string) => void
  leadDepartment: string
  sections: SectionData[]
  onSectionUpdate: (index: number, content: string) => void
  approverComments?: { [key: number]: { comment: string; approverName: string; actioned: boolean } }
  onMarkCommentActioned?: (sectionIndex: number) => void
  supportingDepartments: string[]
  onSupportingDepartmentsChange?: (depts: string[]) => void
}

export default function BriefSectionsStep({
  onKeyInfoChange,
  keyInfo,
  onLeadDepartmentChange,
  leadDepartment,
  sections,
  onSectionUpdate,
  approverComments,
  onMarkCommentActioned,
  supportingDepartments,
  onSupportingDepartmentsChange,
}: BriefSectionsStepProps) {
  const [showKeyInfoEditor, setShowKeyInfoEditor] = useState(false)
  const [showDepartmentEditor, setShowDepartmentEditor] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  return (
    <div className="mx-auto py-12">
      <div className="max-w-368 mx-auto px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="mb-4">Enhanced Client Brief</h2>
            <p className="text-gray-700 flex items-center justify-center gap-2">
              Review all sections and use AI insights to enhance your brief
            </p>
          </div>
        </div>

        {/* Key Information Summary */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3>Key Information</h3>
            {onKeyInfoChange && (
              <button
                onClick={() => setShowKeyInfoEditor(true)}
                className="text-sm text-gray-600 hover:text-black transition-colors flex items-center gap-1"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-yellow-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Client</p>
                <p className="font-medium">{keyInfo.client}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-yellow-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Budget</p>
                <p className="font-medium">{keyInfo.budget}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-yellow-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Due Date</p>
                <p className="font-medium">{keyInfo.dueDate}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Radio className="w-5 h-5 text-yellow-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Live Date</p>
                <p className="font-medium">{keyInfo.liveDate}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-yellow-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Campaign Duration</p>
                <p className="font-medium">{keyInfo.campaignDuration}</p>
              </div>
            </div>
            <div className="md:col-span-3 flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-yellow-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Job to be Done</p>
                <p className="font-medium">{keyInfo.jobToBeDone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Practice Assignment Summary */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-8">
          {/* Practice Assignment */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2">
              <Users className="w-5 h-5 text-yellow-400" />
              Assigned Practice
            </h3>
            {onLeadDepartmentChange && (
              <button
                onClick={() => setShowDepartmentEditor(true)}
                className="text-sm text-gray-600 hover:text-black transition-colors flex items-center gap-1"
              >
                <Edit2 className="w-4 h-4" />
                Change Practice
              </button>
            )}
          </div>
          <div className="inline-block">
            <div className="px-6 py-3 bg-yellow-400 rounded-lg border-2 border-yellow-400">
              <span className="font-semibold text-lg">{leadDepartment}</span>
            </div>
          </div>
        </div>

        {/* Brief Sections */}
        <div className="space-y-6">
          {/* AI Feedback Overview */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="mb-3">AI Feedback Overview</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    <strong>Overall Assessment: Strong Foundation with Key Opportunities</strong> —
                    This brief demonstrates a comprehensive understanding of the campaign objectives
                    and target market. The sustainable product positioning is well-articulated with
                    clear business goals and authentic brand values. However, several critical areas
                    require additional detail to ensure successful execution: specific timeline
                    milestones and deliverable quantities need definition, measurement KPIs should
                    include baseline metrics for comparison, and the competitive differentiation
                    strategy would benefit from more concrete proof points. The budget allocation
                    across channels is currently unspecified, which may impact resource planning.
                    Key strength areas include the thorough target market psychographics, innovative
                    AR packaging concept, and well-defined product line architecture. Recommended
                    priority actions:{' '}
                    <span className="text-yellow-600">
                      1) Establish detailed project timeline with phase gates, 2) Define specific
                      KPI targets by channel with current baselines, 3) Secure sustainability
                      certification documentation for credibility.
                    </span>{' '}
                    With these enhancements, this brief is well-positioned to drive a compelling
                    market launch.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Existing Brief Sections */}
          {sections.map((section, index) => (
            <BriefSection
              key={index}
              title={section.title}
              content={section.content}
              missing={section.missing}
              enhancements={section.enhancements}
              questions={section.questions}
              onContentChange={(content) => onSectionUpdate(index, content)}
              approverComment={approverComments ? approverComments[index] : undefined}
              onMarkCommentActioned={
                onMarkCommentActioned ? () => onMarkCommentActioned(index) : undefined
              }
            />
          ))}
        </div>

        <div className="sticky bottom-0 bg-bone py-6 border-t border-gray-200 mt-8">
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setShowExportModal(true)}
              className="bg-yellow-400 text-black px-8 py-4 rounded-lg hover:bg-yellow-500 transition-colors flex items-center gap-2 font-medium"
            >
              <FileDown className="w-5 h-5" />
              Export Brief
            </button>
          </div>
        </div>
        {/* Export Brief Modal */}
        {showExportModal && (
          <ExportBriefModal
            onClose={() => setShowExportModal(false)}
            sections={sections}
            keyInfo={keyInfo}
            leadDepartment={leadDepartment}
            supportingDepartments={supportingDepartments}
          />
        )}
      </div>
      {/* Key Information Editor Modal */}
      {showKeyInfoEditor && onKeyInfoChange && (
        <KeyInfoEditorModal
          keyInfo={keyInfo}
          onClose={() => setShowKeyInfoEditor(false)}
          onKeyInfoChange={onKeyInfoChange}
        />
      )}

      {/* Department Editor Modal */}
      {showDepartmentEditor && onLeadDepartmentChange && onSupportingDepartmentsChange && (
        <DepartmentEditorModal
          leadDepartment={leadDepartment}
          supportingDepartments={supportingDepartments}
          onClose={() => setShowDepartmentEditor(false)}
          onLeadDepartmentChange={onLeadDepartmentChange}
          onSupportingDepartmentsChange={onSupportingDepartmentsChange}
        />
      )}
    </div>
  )
}

function KeyInfoEditorModal({
  keyInfo,
  onClose,
  onKeyInfoChange,
}: {
  keyInfo: KeyInfo
  onClose: () => void
  onKeyInfoChange: (field: keyof KeyInfo, value: string) => void
}) {
  const [tempKeyInfo, setTempKeyInfo] = useState(keyInfo)

  const handleSave = () => {
    Object.keys(tempKeyInfo).forEach((key) => {
      onKeyInfoChange(key as keyof KeyInfo, tempKeyInfo[key as keyof KeyInfo])
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="mb-1">Edit Key Information</h2>
            <p className="text-sm text-gray-600">Update key details of the brief</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Key Information Form */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-yellow-400 mt-1" />
            <div>
              <p className="text-sm text-gray-600 mb-1">Client</p>
              <input
                type="text"
                value={tempKeyInfo.client}
                onChange={(e) => setTempKeyInfo({ ...tempKeyInfo, client: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-yellow-400 mt-1" />
            <div>
              <p className="text-sm text-gray-600 mb-1">Budget</p>
              <input
                type="text"
                value={tempKeyInfo.budget}
                onChange={(e) => setTempKeyInfo({ ...tempKeyInfo, budget: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-yellow-400 mt-1" />
            <div>
              <p className="text-sm text-gray-600 mb-1">Due Date</p>
              <input
                type="text"
                value={tempKeyInfo.dueDate}
                onChange={(e) => setTempKeyInfo({ ...tempKeyInfo, dueDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Radio className="w-5 h-5 text-yellow-400 mt-1" />
            <div>
              <p className="text-sm text-gray-600 mb-1">Live Date</p>
              <input
                type="text"
                value={tempKeyInfo.liveDate}
                onChange={(e) => setTempKeyInfo({ ...tempKeyInfo, liveDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-yellow-400 mt-1" />
            <div>
              <p className="text-sm text-gray-600 mb-1">Campaign Duration</p>
              <input
                type="text"
                value={tempKeyInfo.campaignDuration}
                onChange={(e) =>
                  setTempKeyInfo({ ...tempKeyInfo, campaignDuration: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>
          <div className="md:col-span-3 flex items-start gap-3">
            <Briefcase className="w-5 h-5 text-yellow-400 mt-1" />
            <div>
              <p className="text-sm text-gray-600 mb-1">Job to be Done</p>
              <input
                type="text"
                value={tempKeyInfo.jobToBeDone}
                onChange={(e) => setTempKeyInfo({ ...tempKeyInfo, jobToBeDone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

function DepartmentEditorModal({
  leadDepartment,
  onClose,
  onLeadDepartmentChange,
  onSupportingDepartmentsChange,
}: {
  leadDepartment: string
  supportingDepartments: string[]
  onClose: () => void
  onLeadDepartmentChange: (dept: string) => void
  onSupportingDepartmentsChange: (depts: string[]) => void
}) {
  const practices = [
    'Creative',
    'Design',
    'Social',
    'Influencer',
    'Earned PR',
    'Crisis and Corporate Communications',
    'Partnership',
    'Experiential',
    'Insights',
    'Media Planning and Buying',
    'Advisory (Digital)',
    'Analytics (Digital)',
    'Automation (Digital)',
    'Activation (Digital)',
  ]
  const [selectedPractice, setSelectedPractice] = useState(leadDepartment)

  const handleSave = () => {
    onLeadDepartmentChange(selectedPractice)
    onSupportingDepartmentsChange([])
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="mb-1">Change Practice Assignment</h2>
            <p className="text-sm text-gray-600">Select which practice this brief belongs to</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Department List */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {practices.map((dept) => {
            const isSelected = dept === selectedPractice

            return (
              <button
                key={dept}
                onClick={() => setSelectedPractice(dept)}
                className={`w-full rounded-lg border-2 p-4 transition-all text-left ${
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
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
