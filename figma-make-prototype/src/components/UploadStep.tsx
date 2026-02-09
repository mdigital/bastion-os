import { Upload, FileText, Image, Type } from 'lucide-react';
import { useState } from 'react';

interface UploadStepProps {
  onUpload: (file: File) => void;
}

export function UploadStep({ onUpload }: UploadStepProps) {
  const [pastedText, setPastedText] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'text'>('file');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (validTypes.includes(file.type)) {
        onUpload(file);
      } else {
        alert('Please upload only PDF or image files (JPG, PNG, GIF)');
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (validTypes.includes(file.type)) {
        onUpload(file);
      } else {
        alert('Please upload only PDF or image files (JPG, PNG, GIF)');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleTextSubmit = () => {
    if (pastedText.trim()) {
      // Create a text file from the pasted content
      const blob = new Blob([pastedText], { type: 'text/plain' });
      const file = new File([blob], 'pasted-brief.txt', { type: 'text/plain' });
      onUpload(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="mb-4">Upload Client Brief</h2>
        <p className="text-gray-700">
          Upload a PDF or image, or paste your brief text below
        </p>
      </div>

      {/* Method Toggle */}
      <div className="flex gap-2 mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setUploadMethod('file')}
          className={`flex-1 px-4 py-2 rounded-md transition-colors ${
            uploadMethod === 'file'
              ? 'bg-white shadow-sm font-medium'
              : 'text-gray-600 hover:text-black'
          }`}
        >
          Upload File
        </button>
        <button
          onClick={() => setUploadMethod('text')}
          className={`flex-1 px-4 py-2 rounded-md transition-colors ${
            uploadMethod === 'text'
              ? 'bg-white shadow-sm font-medium'
              : 'text-gray-600 hover:text-black'
          }`}
        >
          Paste Text
        </button>
      </div>

      {uploadMethod === 'file' ? (
        <>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-4 border-dashed border-gray-300 rounded-2xl p-16 text-center hover:border-yellow-400 transition-colors cursor-pointer bg-white"
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.gif,application/pdf,image/*"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-16 h-16 mx-auto mb-6 text-gray-400" />
              <h3 className="mb-2">Drop your file here or click to browse</h3>
              <p className="text-gray-600">Supports PDF and image formats (JPG, PNG, GIF)</p>
            </label>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              { icon: FileText, label: 'PDF Documents' },
              { icon: Image, label: 'Images (JPG, PNG)' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg text-center border border-gray-200">
                <item.icon className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                <p className="text-sm text-gray-600">{item.label}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-300 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Type className="w-5 h-5 text-gray-400" />
            <h3 className="font-medium">Paste Your Brief Text</h3>
          </div>
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste your client brief text here... Include all relevant details such as objectives, target audience, budget, timeline, etc."
            className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleTextSubmit}
              disabled={!pastedText.trim()}
              className="px-6 py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue with Text
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Tip: Copy the brief text from emails, documents, or messages and paste it here.
          </p>
        </div>
      )}
    </div>
  );
}
