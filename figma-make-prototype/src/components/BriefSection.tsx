import { AlertCircle, Lightbulb, HelpCircle, Copy, ExternalLink, Check, MessageSquare, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { RichTextEditor } from './RichTextEditor';

interface BriefSectionProps {
  title: string;
  content: string;
  missing: string[];
  enhancements: Array<{ text: string; source: string }>;
  questions: string[];
  onContentChange: (content: string) => void;
  approverComment?: { comment: string; approverName: string; actioned: boolean };
  onMarkCommentActioned?: () => void;
}

export function BriefSection({
  title,
  content,
  missing,
  enhancements,
  questions,
  onContentChange,
  approverComment,
  onMarkCommentActioned
}: BriefSectionProps) {
  const [activeTab, setActiveTab] = useState<'missing' | 'enhancements' | 'questions'>('missing');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyQuestion = (question: string, index: number) => {
    // Try modern clipboard API first, fall back to legacy method
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(question).catch(() => {
        // Fallback method
        fallbackCopyTextToClipboard(question);
      });
    } else {
      fallbackCopyTextToClipboard(question);
    }
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }
    document.body.removeChild(textArea);
  };

  const tabs = [
    { id: 'missing' as const, label: 'What\'s Missing', icon: AlertCircle, count: missing.length, color: 'red' },
    { id: 'enhancements' as const, label: 'Enhancements', icon: Lightbulb, count: enhancements.length, color: 'yellow' },
    { id: 'questions' as const, label: 'Questions', icon: HelpCircle, count: questions.length, color: 'blue' }
  ];

  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-6">
      <h3 className="mb-6">{title}</h3>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Rich Text Area */}
        <div className="md:col-span-2">
          <label className="block mb-2 text-sm text-gray-600">Extracted Content</label>
          <RichTextEditor
            value={content}
            onChange={onContentChange}
            placeholder="Content extracted from the brief will appear here..."
          />
        </div>

        {/* Insight Boxes */}
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 p-2 rounded-lg text-xs transition-colors relative ${
                  activeTab === tab.id
                    ? 'bg-yellow-400 text-black'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <tab.icon className="w-3 h-3" />
                  <span className="hidden md:inline">{tab.label}</span>
                </div>
                {tab.count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Active Tab Content */}
          {/* Missing Tab */}
          <div className={`${activeTab === 'missing' ? 'block' : 'hidden'}`}>
            <div className="border border-gray-200 rounded-lg p-4 h-56 overflow-y-auto">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                <h4 className="text-sm">What's Missing</h4>
              </div>
              {missing.length > 0 ? (
                <ul className="space-y-2">
                  {missing.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-700 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-yellow-400">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 italic">No items</p>
              )}
            </div>
          </div>

          {/* Enhancements Tab */}
          <div className={`${activeTab === 'enhancements' ? 'block' : 'hidden'}`}>
            <div className="border border-gray-200 rounded-lg p-4 h-56 overflow-y-auto">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                <h4 className="text-sm">Suggested Enhancements</h4>
              </div>
              {enhancements.length > 0 ? (
                <ul className="space-y-3">
                  {enhancements.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-700">
                      <div className="pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-yellow-400">
                        {item.text}
                      </div>
                      <a
                        href="#"
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1 pl-4"
                        onClick={(e) => e.preventDefault()}
                      >
                        <ExternalLink className="w-3 h-3" />
                        Source: {item.source}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 italic">No items</p>
              )}
            </div>
          </div>

          {/* Questions Tab */}
          <div className={`${activeTab === 'questions' ? 'block' : 'hidden'}`}>
            <div className="border border-gray-200 rounded-lg p-4 h-56 overflow-y-auto">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="w-4 h-4 text-yellow-400" />
                <h4 className="text-sm">Questions for Client</h4>
              </div>
              {questions.length > 0 ? (
                <ul className="space-y-2">
                  {questions.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-700 group">
                      <div className="flex items-start gap-2">
                        <span className="flex-1 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-yellow-400">
                          {item}
                        </span>
                        <button
                          onClick={() => handleCopyQuestion(item, idx)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                          title="Copy to clipboard"
                        >
                          {copiedIndex === idx ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-gray-600" />
                          )}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 italic">No items</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Approver Comment */}
      {approverComment && (
        <div className="mt-6 bg-gray-100 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-gray-600" />
            <h4 className="text-sm font-bold">Approver Comment</h4>
          </div>
          <p className="text-sm text-gray-700 mt-2">{approverComment.comment}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-gray-500">By: {approverComment.approverName}</span>
            {approverComment.actioned ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <button
                onClick={onMarkCommentActioned}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark as Actioned
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}