import { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Link as LinkIcon, 
  Image as ImageIcon,
  List,
  ListOrdered
} from 'lucide-react';

interface HighlightedRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  highlightChanges?: boolean;
}

export function HighlightedRichTextEditor({ value, onChange, placeholder, highlightChanges = false }: HighlightedRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  useEffect(() => {
    // Set initial content if editor is empty and value exists
    if (editorRef.current && !editorRef.current.innerHTML && value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const execCommand = (command: string, commandValue?: string) => {
    document.execCommand(command, false, commandValue);
    editorRef.current?.focus();
  };

  const handleLinkInsert = () => {
    if (linkUrl) {
      execCommand('createLink', linkUrl);
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const handleImageInsert = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex items-center gap-1 flex-wrap">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => setShowLinkInput(!showLinkInput)}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Insert Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleImageInsert}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        {highlightChanges && (
          <>
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            <button
              type="button"
              onClick={() => execCommand('hiliteColor', '#fef08a')}
              className="p-2 hover:bg-gray-200 rounded transition-colors bg-yellow-200"
              title="Highlight"
            >
              <span className="text-xs font-semibold">H</span>
            </button>
          </>
        )}
      </div>

      {/* Link Input */}
      {showLinkInput && (
        <div className="bg-yellow-50 border-b border-gray-300 p-3 flex items-center gap-2">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Enter URL..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded"
            onKeyDown={(e) => e.key === 'Enter' && handleLinkInsert()}
          />
          <button
            type="button"
            onClick={handleLinkInsert}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Insert
          </button>
          <button
            type="button"
            onClick={() => setShowLinkInput(false)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[256px] max-h-[400px] overflow-y-auto px-4 py-3 focus:outline-none prose prose-sm max-w-none"
        style={{ 
          wordBreak: 'break-word',
          lineHeight: '1.6'
        }}
      />
      
      {/* Placeholder */}
      {!value && placeholder && (
        <div className="absolute top-14 left-4 text-gray-400 pointer-events-none">
          {placeholder}
        </div>
      )}

      {/* Styling for highlights */}
      <style>{`
        .prose mark,
        .prose [style*="background-color: rgb(254, 240, 138)"],
        .prose [style*="background-color:#fef08a"] {
          background-color: #fef08a !important;
          padding: 2px 4px;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}
