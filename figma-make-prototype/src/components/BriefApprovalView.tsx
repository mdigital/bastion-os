import { ArrowLeft, CheckCircle2, Edit2, Save, Building2, DollarSign, Calendar, Radio, Clock, Briefcase, User, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { BriefSection } from './BriefSection';

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

interface BriefApprovalViewProps {
  sections: SectionData[];
  keyInfo: KeyInfo;
  leadDepartment: string;
  supportingDepartments: string[];
  approverName: string;
  onBack: () => void;
  onApprove: () => void;
  comments?: { [key: number]: { comment: string; approverName: string; actioned: boolean } };
  onCommentsChange?: (comments: { [key: number]: { comment: string; approverName: string; actioned: boolean } }) => void;
}

export function BriefApprovalView({
  sections: initialSections,
  keyInfo,
  leadDepartment,
  supportingDepartments,
  approverName,
  onBack,
  onApprove,
  comments: initialComments = {},
  onCommentsChange
}: BriefApprovalViewProps) {
  const [sections, setSections] = useState(initialSections);
  const [isEditing, setIsEditing] = useState(false);
  const [hasEdits, setHasEdits] = useState(false);
  const [comments, setComments] = useState<{ [key: number]: { comment: string; approverName: string; actioned: boolean } }>(initialComments);
  const [showCommentBox, setShowCommentBox] = useState<{ [key: number]: boolean }>({});
  const [tempComments, setTempComments] = useState<{ [key: number]: string }>({});

  const handleSectionUpdate = (index: number, content: string) => {
    const newSections = [...sections];
    newSections[index].content = content;
    setSections(newSections);
    setHasEdits(true);
  };

  const handleCommentSave = (index: number) => {
    const comment = tempComments[index] || '';
    if (comment.trim()) {
      const updatedComments = {
        ...comments,
        [index]: {
          comment: comment.trim(),
          approverName: approverName,
          actioned: false
        }
      };
      setComments(updatedComments);
      if (onCommentsChange) {
        onCommentsChange(updatedComments);
      }
      setTempComments(prev => ({ ...prev, [index]: '' }));
      setShowCommentBox(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleCommentClear = (index: number) => {
    setTempComments(prev => ({ ...prev, [index]: '' }));
    setShowCommentBox(prev => ({ ...prev, [index]: false }));
  };

  const handleCommentChange = (index: number, comment: string) => {
    setTempComments(prev => ({ ...prev, [index]: comment }));
  };

  const toggleCommentBox = (index: number) => {
    setShowCommentBox(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleSaveEdits = () => {
    setIsEditing(false);
    // In a real app, this would save to backend
    alert('Changes saved successfully!');
  };

  const handleApprove = () => {
    if (isEditing) {
      alert('Please save or discard your edits before approving.');
      return;
    }
    onApprove();
  };

  return (
    <div className="max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="mb-1">Review & Approve Brief</h2>
              <p className="text-gray-700">
                Review the brief, make any necessary edits, and approve when ready
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setSections(initialSections);
                    setHasEdits(false);
                  }}
                  className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdits}
                  className="px-6 py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Edit2 className="w-5 h-5" />
                  Edit Brief
                </button>
                <button
                  onClick={handleApprove}
                  className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Approve Brief
                </button>
              </>
            )}
          </div>
        </div>

        {/* Approver Info */}
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <User className="w-5 h-5 text-yellow-600" />
          <p className="text-sm">
            <span className="font-medium">Approver:</span> {approverName}
          </p>
          {hasEdits && !isEditing && (
            <span className="ml-auto px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Edited
            </span>
          )}
        </div>
      </div>

      {/* Key Information Summary */}
      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-6">
        <h3 className="mb-6">Key Information</h3>
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

      {/* Department Summary */}
      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-8">
        <h3 className="mb-6">Practice Area Triage</h3>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black rounded-lg">
            <span className="font-medium">{leadDepartment}</span>
            <span className="px-2 py-0.5 bg-black text-white text-xs rounded-full">Lead</span>
          </div>
          {supportingDepartments.map((dept, idx) => (
            <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg">
              <span>{dept}</span>
              <span className="px-2 py-0.5 bg-gray-600 text-white text-xs rounded-full">Supporting</span>
            </div>
          ))}
        </div>
      </div>

      {/* Brief Sections */}
      <div className="mb-8">
        <h3 className="mb-6">Brief Sections</h3>
        {sections.map((section, index) => (
          <div key={index}>
            <div className={isEditing ? '' : 'pointer-events-none opacity-90'}>
              <BriefSection
                title={section.title}
                content={section.content}
                missing={section.missing}
                enhancements={section.enhancements}
                questions={section.questions}
                onContentChange={(content) => handleSectionUpdate(index, content)}
              />
            </div>
            
            {/* Comment Section */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-6 -mt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-yellow-400" />
                  <h4 className="text-sm">Approver Feedback</h4>
                </div>
                <button
                  onClick={() => toggleCommentBox(index)}
                  className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    showCommentBox[index]
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-yellow-400 text-black hover:bg-yellow-500'
                  }`}
                >
                  {showCommentBox[index] ? 'Hide' : comments[index] ? 'Edit Comment' : 'Add Comment'}
                </button>
              </div>
              
              {/* Display existing comment if not editing */}
              {comments[index] && !showCommentBox[index] && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{comments[index].comment}</p>
                </div>
              )}
              
              {/* Comment input box */}
              {showCommentBox[index] && (
                <div className="space-y-3">
                  <textarea
                    value={tempComments[index] || ''}
                    onChange={(e) => handleCommentChange(index, e.target.value)}
                    className="w-full min-h-[120px] p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
                    placeholder="Add your feedback or comments for this section..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCommentSave(index)}
                      className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors text-sm"
                    >
                      Save Comment
                    </button>
                    {comments[index] && (
                      <button
                        onClick={() => handleCommentClear(index)}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        Clear Comment
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Empty state when no comment */}
              {!comments[index] && !showCommentBox[index] && (
                <p className="text-sm text-gray-400 italic">No feedback added yet</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="sticky bottom-0 bg-bone py-6 border-t border-gray-200">
        <div className="flex gap-4 justify-center">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSections(initialSections);
                  setHasEdits(false);
                }}
                className="px-8 py-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel Editing
              </button>
              <button
                onClick={handleSaveEdits}
                className="px-8 py-4 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onBack}
                className="px-8 py-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleApprove}
                className="px-8 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Approve Brief
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}