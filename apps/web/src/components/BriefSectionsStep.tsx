import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  Edit2,
  FileDown,
  Radio,
  Users,
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
}: BriefSectionsStepProps) {
  const [, setShowKeyInfoEditor] = useState(false)
  const [, setShowDepartmentEditor] = useState(false)
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
    </div>
  )
}

// 1472
// 1280
