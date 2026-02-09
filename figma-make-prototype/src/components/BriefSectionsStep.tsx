import { BriefSection } from './BriefSection';
import { Download, Upload, Building2, Briefcase, DollarSign, Calendar, Radio, Clock, Users, Award, UserCheck, Plus, X, CheckCircle2, FileDown, Star, Edit2, Circle, ArrowLeft, FileText, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ApprovalModal } from './ApprovalModal';
import { ExportBriefModal } from './ExportBriefModal';
import { practiceAreas, type BriefTemplate, type PracticeArea } from '../data/practiceTemplates';

interface SectionData {
  title: string;
  content: string;
  missing: string[];
  enhancements: Array<{ text: string; source: string }>;
  questions: string[];
}

interface KeyInfo {
  client: string;
  jobToBeDone: string;
  budget: string;
  dueDate: string;
  liveDate: string;
  campaignDuration: string;
  briefLevel: string;
}

interface BriefSectionsStepProps {
  sections: SectionData[];
  keyInfo: KeyInfo;
  leadDepartment: string;
  supportingDepartments: string[];
  onSectionUpdate: (index: number, content: string) => void;
  onFinalize: () => void;
  onUploadMore: () => void;
  onSaveDraft?: () => void;
  onBriefLevelChange?: (level: 'New Project Brief' | 'Fast Forward Brief') => void;
  onLeadDepartmentChange?: (dept: string) => void;
  onSupportingDepartmentsChange?: (depts: string[]) => void;
  onKeyInfoChange?: (field: keyof KeyInfo, value: string) => void;
  onViewAsApprover?: () => void;
  approverComments?: { [key: number]: { comment: string; approverName: string; actioned: boolean } };
  onMarkCommentActioned?: (sectionIndex: number) => void;
}

export function BriefSectionsStep({ 
  sections, 
  keyInfo,
  leadDepartment,
  supportingDepartments,
  onSectionUpdate, 
  onFinalize, 
  onUploadMore, 
  onSaveDraft,
  onBriefLevelChange,
  onLeadDepartmentChange,
  onSupportingDepartmentsChange,
  onKeyInfoChange,
  onViewAsApprover,
  approverComments,
  onMarkCommentActioned
}: BriefSectionsStepProps) {
  const practices = ['Creative', 'Design', 'Social', 'Influencer', 'Earned PR', 'Crisis and Corporate Communications', 'Partnership', 'Experiential', 'Insights', 'Media Planning and Buying', 'Advisory (Digital)', 'Analytics (Digital)', 'Automation (Digital)', 'Activation (Digital)'];
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showSectionCatalog, setShowSectionCatalog] = useState(false);
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>('All');
  const [isApprovedByStrategists, setIsApprovedByStrategists] = useState(true); // Mock state - set to true to show approved state
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDepartmentEditor, setShowDepartmentEditor] = useState(false);
  const [showBriefLevelEditor, setShowBriefLevelEditor] = useState(false);
  const [showKeyInfoEditor, setShowKeyInfoEditor] = useState(false);

  // Available section templates organized by department
  const sectionCatalog = {
    'Social': [
      { title: 'Social Media Strategy', description: 'Platform selection, content pillars, and posting cadence' },
      { title: 'Influencer Requirements', description: 'Influencer criteria, partnership structure, and deliverables' },
      { title: 'Community Management', description: 'Response protocols, engagement guidelines, and moderation policies' },
      { title: 'Social Listening', description: 'Monitoring requirements, sentiment tracking, and reporting needs' },
      { title: 'User-Generated Content', description: 'UGC campaign mechanics, rights management, and curation' },
      { title: 'Paid Social', description: 'Ad formats, targeting parameters, and budget allocation by platform' },
    ],
    'PR': [
      { title: 'Media Relations Strategy', description: 'Target outlets, key messages, and pitch angles' },
      { title: 'Spokesperson Requirements', description: 'Media training needs, availability, and approval process' },
      { title: 'Crisis Communication Plan', description: 'Risk scenarios, holding statements, and escalation procedures' },
      { title: 'Press Release Details', description: 'Announcement timing, news hook, and distribution strategy' },
      { title: 'Media Event Planning', description: 'Event format, guest list, venue requirements, and logistics' },
      { title: 'Thought Leadership', description: 'Byline articles, speaking opportunities, and expert positioning' },
    ],
    'Creative': [
      { title: 'Creative Concept Direction', description: 'Campaign big idea, tone, and creative territories to explore' },
      { title: 'Copy Requirements', description: 'Messaging hierarchy, tone of voice, and required copy lengths' },
      { title: 'Brand Guidelines', description: 'Visual identity, brand standards, and usage restrictions' },
      { title: 'Production Requirements', description: 'Shoot details, talent needs, location requirements, and production timeline' },
      { title: 'Asset Deliverables', description: 'Required formats, versions, and specifications for all assets' },
      { title: 'Localization Needs', description: 'Markets requiring adaptation, translation requirements, and cultural considerations' },
    ],
    'Design': [
      { title: 'Design System', description: 'Visual language, typography, colour palette, and design principles' },
      { title: 'UX/UI Requirements', description: 'User flows, wireframes, prototyping needs, and accessibility standards' },
      { title: 'Brand Identity', description: 'Logo usage, brand marks, and visual identity elements' },
      { title: 'Print Specifications', description: 'Print materials, sizes, quantities, and finishing requirements' },
      { title: 'Packaging Design', description: 'Packaging requirements, materials, structural design, and regulatory compliance' },
      { title: 'Environmental Design', description: 'Physical space design, signage, wayfinding, and installation requirements' },
    ],
    'Digital': [
      { title: 'Website Requirements', description: 'Site structure, functionality, CMS needs, and technical specifications' },
      { title: 'SEO Strategy', description: 'Keyword targets, technical SEO requirements, and content optimisation' },
      { title: 'Email Marketing', description: 'Campaign types, audience segments, automation flows, and performance benchmarks' },
      { title: 'Programmatic Advertising', description: 'Display strategy, retargeting parameters, and programmatic buying approach' },
      { title: 'Analytics & Tracking', description: 'Tracking implementation, conversion goals, and reporting dashboards' },
      { title: 'Digital Campaign Mechanics', description: 'Interactive elements, user journeys, and engagement mechanics' },
    ],
    'Experiential': [
      { title: 'Event Concept', description: 'Event theme, attendee experience, and activation format' },
      { title: 'Venue Requirements', description: 'Space specifications, capacity, location criteria, and technical needs' },
      { title: 'Sponsorship Activation', description: 'Brand integration, sponsorship deliverables, and activation zones' },
      { title: 'Experiential Production', description: 'Build requirements, fabrication specs, and installation timeline' },
      { title: 'Attendee Journey', description: 'Registration process, onsite flow, touchpoints, and post-event follow-up' },
      { title: 'Experiential Measurement', description: 'Attendance tracking, engagement metrics, and experience feedback collection' },
    ],
  };

  const handleAddSection = (department: string, sectionTemplate: { title: string; description: string }) => {
    // In production, this would add a new section to the brief
    console.log('Adding section:', sectionTemplate.title, 'from', department);
    alert(`Added "${sectionTemplate.title}" section. AI will extract relevant information from your uploaded documents.`);
    setShowSectionCatalog(false);
  };

  const getDepartmentIcon = (dept: string) => {
    const icons: { [key: string]: JSX.Element } = {
      'Social': <Users className="w-4 h-4" />,
      'PR': <Radio className="w-4 h-4" />,
      'Creative': <Briefcase className="w-4 h-4" />,
      'Design': <Award className="w-4 h-4" />,
      'Digital': <Calendar className="w-4 h-4" />,
      'Experiential': <Building2 className="w-4 h-4" />,
    };
    return icons[dept] || <Users className="w-4 h-4" />;
  };

  const filteredDepartments = selectedDepartmentFilter === 'All' 
    ? practices 
    : [selectedDepartmentFilter];

  // Filter to only show departments that have section catalogs defined
  const availableDepartments = filteredDepartments.filter(dept => 
    dept in sectionCatalog
  );

  const handleApprovalShare = (selectedStrategists: string[], note: string) => {
    // In production, this would send the brief to the selected strategists
    console.log('Sharing brief with:', selectedStrategists);
    console.log('Note:', note);
    alert(`Brief shared with ${selectedStrategists.length} strategist(s) for approval!`);
  };
  
  return (
    <div className="max-w-screen-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="mb-4">Enhanced Client Brief</h2>
        <p className="text-gray-700">
          Review all sections and use AI insights to enhance your brief
        </p>
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
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="mb-3">AI Feedback Overview</h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  <strong>Overall Assessment: Strong Foundation with Key Opportunities</strong> — This brief demonstrates a comprehensive understanding of the campaign objectives and target market. The sustainable product positioning is well-articulated with clear business goals and authentic brand values. However, several critical areas require additional detail to ensure successful execution: specific timeline milestones and deliverable quantities need definition, measurement KPIs should include baseline metrics for comparison, and the competitive differentiation strategy would benefit from more concrete proof points. The budget allocation across channels is currently unspecified, which may impact resource planning. Key strength areas include the thorough target market psychographics, innovative AR packaging concept, and well-defined product line architecture. Recommended priority actions: <span className="text-yellow-600">1) Establish detailed project timeline with phase gates, 2) Define specific KPI targets by channel with current baselines, 3) Secure sustainability certification documentation for credibility.</span> With these enhancements, this brief is well-positioned to drive a compelling market launch.
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
            onMarkCommentActioned={onMarkCommentActioned ? () => onMarkCommentActioned(index) : undefined}
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

      {/* Approval Modal */}
      {showApprovalModal && (
        <ApprovalModal
          onClose={() => setShowApprovalModal(false)}
          onShare={handleApprovalShare}
          onViewAsApprover={onViewAsApprover}
          leadDepartment={leadDepartment}
          supportingDepartments={supportingDepartments}
        />
      )}

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

      {/* Section Catalog Modal */}
      {showSectionCatalog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="mb-1">Add Section to Brief</h2>
                <p className="text-sm text-gray-600">Choose additional sections for AI to extract information into</p>
              </div>
              <button
                onClick={() => setShowSectionCatalog(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Filter */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedDepartmentFilter('All')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedDepartmentFilter === 'All'
                      ? 'bg-yellow-400 text-black'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  All Departments
                </button>
                {practices.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setSelectedDepartmentFilter(dept)}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      selectedDepartmentFilter === dept
                        ? 'bg-yellow-400 text-black'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {getDepartmentIcon(dept)}
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            {/* Sections Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {availableDepartments.map((dept) => (
                  <div key={dept}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                        {getDepartmentIcon(dept)}
                      </div>
                      <h3>{dept}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {sectionCatalog[dept as keyof typeof sectionCatalog].map((sectionTemplate) => (
                        <div
                          key={sectionTemplate.title}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:border-yellow-400 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 mb-1">{sectionTemplate.title}</p>
                              <p className="text-sm text-gray-600">{sectionTemplate.description}</p>
                            </div>
                            <button
                              onClick={() => handleAddSection(dept, sectionTemplate)}
                              className="bg-yellow-400 text-black px-3 py-1.5 rounded-lg hover:bg-yellow-500 transition-colors flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100"
                            >
                              <Plus className="w-4 h-4" />
                              Add
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600">
                <strong>Tip:</strong> When you add a section, our AI will automatically extract relevant information from your uploaded documents and populate it with key details.
              </p>
            </div>
          </div>
        </div>
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

      {/* Brief Level Editor Modal */}
      {showBriefLevelEditor && onBriefLevelChange && (
        <BriefLevelEditorModal
          briefLevel={keyInfo.briefLevel as 'New Project Brief' | 'Fast Forward Brief'}
          onClose={() => setShowBriefLevelEditor(false)}
          onBriefLevelChange={onBriefLevelChange}
        />
      )}

      {/* Key Information Editor Modal */}
      {showKeyInfoEditor && onKeyInfoChange && (
        <KeyInfoEditorModal
          keyInfo={keyInfo}
          onClose={() => setShowKeyInfoEditor(false)}
          onKeyInfoChange={onKeyInfoChange}
        />
      )}
    </div>
  );
}

// Department Editor Modal Component
function DepartmentEditorModal({
  leadDepartment,
  supportingDepartments,
  onClose,
  onLeadDepartmentChange,
  onSupportingDepartmentsChange
}: {
  leadDepartment: string;
  supportingDepartments: string[];
  onClose: () => void;
  onLeadDepartmentChange: (dept: string) => void;
  onSupportingDepartmentsChange: (depts: string[]) => void;
}) {
  const practices = ['Creative', 'Design', 'Social', 'Influencer', 'Earned PR', 'Crisis and Corporate Communications', 'Partnership', 'Experiential', 'Insights', 'Media Planning and Buying', 'Advisory (Digital)', 'Analytics (Digital)', 'Automation (Digital)', 'Activation (Digital)'];
  const [selectedPractice, setSelectedPractice] = useState(leadDepartment);

  const handleSave = () => {
    onLeadDepartmentChange(selectedPractice);
    onSupportingDepartmentsChange([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="mb-1">Change Practice Assignment</h2>
            <p className="text-sm text-gray-600">Select which practice this brief belongs to</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Department List */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {practices.map((dept) => {
            const isSelected = dept === selectedPractice;

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
                  <span className={isSelected ? 'font-semibold text-lg' : 'text-gray-700'}>{dept}</span>
                  {isSelected && (
                    <CheckCircle2 className="w-6 h-6 text-black" />
                  )}
                </div>
              </button>
            );
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
  );
}

// Brief Level Editor Modal Component
function BriefLevelEditorModal({
  briefLevel,
  onClose,
  onBriefLevelChange
}: {
  briefLevel: 'New Project Brief' | 'Fast Forward Brief';
  onClose: () => void;
  onBriefLevelChange: (level: 'New Project Brief' | 'Fast Forward Brief') => void;
}) {
  const [tempLevel, setTempLevel] = useState(briefLevel);

  const handleSave = () => {
    onBriefLevelChange(tempLevel);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="mb-1">Change Brief Type</h2>
            <p className="text-sm text-gray-600">Update the brief classification</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Brief Level Options */}
        <div className="p-6">
          <div className="space-y-4">
            {/* New Project Brief */}
            <div
              className={`p-6 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                tempLevel === 'New Project Brief'
                  ? 'border-yellow-400 bg-yellow-400'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
              onClick={() => setTempLevel('New Project Brief')}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-4 h-4 rounded-full ${tempLevel === 'New Project Brief' ? 'bg-black' : 'bg-gray-400'}`}></div>
                <h3>New Project Brief</h3>
              </div>
              <p className="text-sm">
                Full client to Agency Brief with all 23 fields. Comprehensive format for major campaigns and new projects with complete strategic requirements.
              </p>
            </div>

            {/* Fast Forward Brief */}
            <div
              className={`p-6 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                tempLevel === 'Fast Forward Brief'
                  ? 'border-yellow-400 bg-yellow-400'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
              onClick={() => setTempLevel('Fast Forward Brief')}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-4 h-4 rounded-full ${tempLevel === 'Fast Forward Brief' ? 'bg-black' : 'bg-gray-400'}`}></div>
                <h3>Fast Forward Brief</h3>
              </div>
              <p className="text-sm">
                Simpler, quicker format with only 8 key sections. Ideal for task briefs, quick turnarounds, and tactical executions.
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> Changing the brief type will update the available sections. Any content in sections that don't exist in the new format will be preserved.
            </p>
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
  );
}

// Key Information Editor Modal Component
function KeyInfoEditorModal({
  keyInfo,
  onClose,
  onKeyInfoChange
}: {
  keyInfo: KeyInfo;
  onClose: () => void;
  onKeyInfoChange: (field: keyof KeyInfo, value: string) => void;
}) {
  const [tempKeyInfo, setTempKeyInfo] = useState(keyInfo);

  const handleSave = () => {
    Object.keys(tempKeyInfo).forEach(key => {
      onKeyInfoChange(key as keyof KeyInfo, tempKeyInfo[key as keyof KeyInfo]);
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="mb-1">Edit Key Information</h2>
            <p className="text-sm text-gray-600">Update key details of the brief</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
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
                onChange={(e) => setTempKeyInfo({ ...tempKeyInfo, campaignDuration: e.target.value })}
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
  );
}