import { useState } from 'react'
import { X, Upload, FileText, Check, Loader } from 'lucide-react'
import { apiFetch } from '../lib/api'

interface AddClientModalProps {
  isOpen: boolean
  onClose: () => void
  onClientAdded: () => void | Promise<void>
}

type Step = 'upload' | 'processing' | 'complete'

interface UploadedFile {
  id: string
  name: string
  size: string
}

// Mock organisations data - in production this would come from a database
const organisations = [
  { id: '1', name: 'Acme Corporation' },
  { id: '2', name: 'TechStart Inc' },
  { id: '3', name: 'GreenLife Foods' },
  { id: '4', name: 'Volvo' },
  { id: '5', name: 'Geely' },
  { id: '6', name: 'Tower Insurance' },
  { id: '7', name: 'Healthy Paws Veterinary' },
  { id: '8', name: 'Urban Eats' },
  { id: '9', name: 'FitTech Solutions' },
]

export default function AddClientModal({ isOpen, onClose, onClientAdded }: AddClientModalProps) {
  const [step, setStep] = useState<Step>('upload')
  const [selectedOrganisation, setSelectedOrganisation] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleClose = () => {
    setStep('upload')
    setSelectedOrganisation('')
    setUploadedFiles([])
    setSubmitError(null)
    onClose()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }

  const handleFiles = (files: File[]) => {
    // Filter only PDF files
    const pdfFiles = files.filter((file) => file.type === 'application/pdf')

    if (pdfFiles.length !== files.length) {
      alert('Only PDF files are allowed. Non-PDF files have been excluded.')
    }

    const newFiles = pdfFiles.map((file) => ({
      id: Math.random().toString(36),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
    }))

    setUploadedFiles([...uploadedFiles, ...newFiles])
  }

  const removeFile = (id: string) => {
    setUploadedFiles(uploadedFiles.filter((f) => f.id !== id))
  }

  const handleProcessDocuments = async () => {
    if (!selectedOrganisation) {
      alert('Please select an organisation')
      return
    }

    const organisationName = organisations.find((org) => org.id === selectedOrganisation)?.name
    if (!organisationName) {
      alert('Please select a valid organisation')
      return
    }

    setSubmitError(null)
    setIsProcessing(true)
    setStep('processing')

    try {
      await apiFetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: organisationName }),
      })

      await onClientAdded()
      setStep('complete')
      setTimeout(() => {
        handleClose()
      }, 1200)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to create client')
      setStep('upload')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-bold">
            {step === 'upload' && 'Add New Client'}
            {step === 'processing' && 'Processing Documents'}
            {step === 'complete' && 'Client Added Successfully'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isProcessing}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Upload Step */}
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Organisation *</label>
                  <select
                    value={selectedOrganisation}
                    onChange={(e) => setSelectedOrganisation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="">Select an organisation</option>
                    {organisations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}

              {/* Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                  isDragging
                    ? 'border-yellow-400 bg-yellow-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium mb-1">Drop PDF files here or click to browse</p>
                    <p className="text-sm text-gray-600">
                      Only PDF files are accepted (Max 10MB each)
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-input"
                    accept=".pdf,application/pdf"
                  />
                  <label
                    htmlFor="file-input"
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    Select PDF Files
                  </label>
                </div>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Uploaded Files ({uploadedFiles.length})</h4>
                  <div className="space-y-2">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group"
                      >
                        <FileText className="w-5 h-5 text-red-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-gray-600">{file.size}</p>
                        </div>
                        <Check className="w-5 h-5 text-green-600" />
                        <button
                          onClick={() => removeFile(file.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                <Loader className="w-10 h-10 text-yellow-600 animate-spin" />
              </div>
              <h3 className="font-bold text-xl mb-2">Processing Documents</h3>
              <p className="text-gray-600 text-center mb-4">
                Creating knowledge base for{' '}
                {organisations.find((org) => org.id === selectedOrganisation)?.name}...
              </p>
              <p className="text-sm text-gray-500">
                Processing {uploadedFiles.length} PDF{' '}
                {uploadedFiles.length === 1 ? 'document' : 'documents'}
              </p>
            </div>
          )}

          {/* Complete Step */}
          {step === 'complete' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="font-bold text-xl mb-2">Knowledge Base Created!</h3>
              <p className="text-gray-600 text-center">
                {organisations.find((org) => org.id === selectedOrganisation)?.name} has been added
                to your knowledge base with {uploadedFiles.length}{' '}
                {uploadedFiles.length === 1 ? 'document' : 'documents'}.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'upload' && (
          <div className="p-6 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleProcessDocuments}
              disabled={isProcessing || uploadedFiles.length === 0 || !selectedOrganisation}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Create Knowledge Base
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
