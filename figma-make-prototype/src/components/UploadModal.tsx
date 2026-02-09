import { X, Upload, FileText } from 'lucide-react';

interface UploadModalProps {
  onClose: () => void;
  onUpload: (file: File) => void;
}

export function UploadModal({ onClose, onUpload }: UploadModalProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      onClose();
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onUpload(file);
      onClose();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="mb-4">Upload Further Information</h2>
        <p className="text-gray-700 mb-8">
          Upload additional client information to update and enhance your brief sections
        </p>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-4 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-yellow-400 transition-colors cursor-pointer bg-gray-50"
        >
          <input
            type="file"
            id="additional-upload"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt,.eml,.msg"
          />
          <label htmlFor="additional-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2">Drop your file here or click to browse</h3>
            <p className="text-gray-600">Supports PDF, Word, Text, and Email formats</p>
          </label>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {['PDF', 'Word', 'Email'].map((format, idx) => (
            <div key={idx} className="bg-gray-50 p-3 rounded-lg text-center border border-gray-200">
              <FileText className="w-6 h-6 mx-auto mb-1 text-yellow-400" />
              <p className="text-xs text-gray-600">{format}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
