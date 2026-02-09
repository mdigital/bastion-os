import { Check, X, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { HighlightedRichTextEditor } from './HighlightedRichTextEditor';

interface SectionComparison {
  title: string;
  original: string;
  updated: string;
  changes: { type: 'added' | 'removed'; content: string }[];
}

interface ComparisonViewProps {
  comparisons: SectionComparison[];
  onAcceptAll: (updatedSections: string[]) => void;
  onAcceptSection: (index: number, content: string) => void;
  onRejectSection: (index: number) => void;
  onCancel: () => void;
}

export function ComparisonView({ 
  comparisons, 
  onAcceptAll, 
  onAcceptSection,
  onRejectSection,
  onCancel 
}: ComparisonViewProps) {
  const [editedSections, setEditedSections] = useState<string[]>(
    comparisons.map(c => c.updated)
  );
  const [dismissedSections, setDismissedSections] = useState<Set<number>>(new Set());

  const handleSectionEdit = (index: number, content: string) => {
    const newSections = [...editedSections];
    newSections[index] = content;
    setEditedSections(newSections);
  };

  const handleAcceptSection = (index: number) => {
    // Accept the current edited version for this section
    onAcceptSection(index, editedSections[index]);
    // Dismiss this section from view
    setDismissedSections(new Set([...dismissedSections, index]));
  };

  const handleRejectSection = (index: number) => {
    // Reject changes and dismiss this section
    onRejectSection(index);
    setDismissedSections(new Set([...dismissedSections, index]));
  };

  // Get remaining sections count
  const remainingSections = comparisons.filter((_, index) => !dismissedSections.has(index));

  // If all sections are dismissed, go back automatically
  if (remainingSections.length === 0) {
    // Use a timeout to allow state updates to complete
    setTimeout(() => onCancel(), 100);
    return null;
  }

  const highlightDifferences = (original: string, updated: string) => {
    // Simple highlighting - wrap additions in yellow background
    // In production, you'd use a proper diff library
    const additions = updated.replace(original, '');
    if (additions) {
      return updated.replace(additions, `<span class="bg-yellow-200 px-1 rounded">${additions}</span>`);
    }
    return updated;
  };

  return (
    <div className="max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="mb-2">Review Changes from Additional Information</h2>
            <p className="text-gray-700">
              Compare the original content with AI-enhanced updates. Accept, reject, or modify each section.
              <span className="ml-2 px-3 py-1 bg-yellow-100 rounded-full text-sm">
                {remainingSections.length} section{remainingSections.length !== 1 ? 's' : ''} remaining
              </span>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={() => onAcceptAll(editedSections)}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Accept All Changes
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Sections */}
      <div className="space-y-6">
        {comparisons.map((comparison, index) => {
          // Skip dismissed sections
          if (dismissedSections.has(index)) return null;
          
          return (
            <div key={index} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3>{comparison.title}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRejectSection(index)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
                  >
                    <X className="w-4 h-4" />
                    Reject Changes
                  </button>
                  <button
                    onClick={() => handleAcceptSection(index)}
                    className="px-4 py-2 bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Check className="w-4 h-4" />
                    Accept Changes
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Original Content */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">Original Content</label>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">Before</span>
                  </div>
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[200px] max-h-[400px] overflow-y-auto">
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: comparison.original }}
                    />
                  </div>
                </div>

                {/* Updated Content with Changes Highlighted */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">Updated Content (Editable)</label>
                    <span className="text-xs bg-yellow-100 px-2 py-1 rounded">After</span>
                  </div>
                  <HighlightedRichTextEditor
                    value={editedSections[index]}
                    onChange={(content) => handleSectionEdit(index, content)}
                    placeholder="Updated content..."
                    highlightChanges={true}
                  />
                </div>
              </div>

              {/* Change Summary */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="text-sm mb-2">AI Analysis</h4>
                <p className="text-sm text-gray-700">
                  Content has been enhanced based on the additional information provided. 
                  <span className="bg-yellow-200 px-1 rounded ml-1">Highlighted sections</span> indicate new or modified content.
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="sticky bottom-0 bg-bone py-6 border-t border-gray-200 mt-8">
        <div className="flex gap-4 justify-center">
          <button
            onClick={onCancel}
            className="px-8 py-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel Changes
          </button>
          <button
            onClick={() => onAcceptAll(editedSections)}
            className="px-8 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            Accept All & Return to Brief
          </button>
        </div>
      </div>
    </div>
  );
}