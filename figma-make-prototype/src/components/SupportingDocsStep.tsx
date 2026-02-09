import { Upload, FileText, X, File, Plus, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface SupportingFile {
  id: string;
  name: string;
  size: string;
  type: string;
}

interface SupportingDocsStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function SupportingDocsStep({ onNext, onBack }: SupportingDocsStepProps) {
  const [supportingFiles, setSupportingFiles] = useState<SupportingFile[]>([
    {
      id: '1',
      name: 'Brand Guidelines 2024.pdf',
      size: '2.4 MB',
      type: 'PDF'
    },
    {
      id: '2',
      name: 'Previous Campaign Results.xlsx',
      size: '856 KB',
      type: 'Excel'
    },
    {
      id: '3',
      name: 'Market Research Summary.docx',
      size: '1.2 MB',
      type: 'Word'
    }
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: SupportingFile[] = Array.from(files).map((file, index) => ({
        id: Date.now().toString() + index,
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        type: file.name.split('.').pop()?.toUpperCase() || 'File'
      }));
      setSupportingFiles([...supportingFiles, ...newFiles]);
    }
  };

  const removeFile = (id: string) => {
    setSupportingFiles(supportingFiles.filter(file => file.id !== id));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files) {
      const newFiles: SupportingFile[] = Array.from(files).map((file, index) => ({
        id: Date.now().toString() + index,
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        type: file.name.split('.').pop()?.toUpperCase() || 'File'
      }));
      setSupportingFiles([...supportingFiles, ...newFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="mb-4">Supporting Documents</h2>
        <p className="text-gray-700">
          Upload additional context documents to enhance the AI's understanding of your brief
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Examples: Brand guidelines, previous campaign reports, market research, customer data
        </p>
      </div>

      {/* Uploaded Files */}
      {supportingFiles.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-6">
          <h3 className="mb-4">Uploaded Documents ({supportingFiles.length})</h3>
          <div className="space-y-3">
            {supportingFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-yellow-400 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {file.type} • {file.size}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-4 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-yellow-400 transition-colors cursor-pointer bg-white mb-6"
      >
        <input
          type="file"
          id="supporting-docs-upload"
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx"
          multiple
        />
        <label htmlFor="supporting-docs-upload" className="cursor-pointer">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="mb-2">Add More Documents</h3>
          <p className="text-gray-600">Drop files here or click to browse</p>
          <p className="text-sm text-gray-500 mt-2">
            Supports PDF, Word, Excel, PowerPoint, and Text files
          </p>
        </label>
      </div>

      {/* Info Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <File className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="mb-1">How this helps</h4>
            <p className="text-sm text-gray-700">
              These documents will be analysed to provide more accurate suggestions, identify gaps in your brief, 
              and generate contextually relevant questions for your client. The AI will reference these documents 
              when enhancing each section.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
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
          Analyse Brief
        </button>
        <button
          onClick={onNext}
          className="px-8 bg-white text-gray-700 py-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Skip for Now
        </button>
      </div>
    </div>
  );
}