import { useState, useRef } from 'react';
import { X, Mic, Square, Loader, CheckCircle } from 'lucide-react';

interface TeamSubmission {
  challenge: string;
  solution: string;
  practiceAreaWork: string;
  interestingWork: string;
  results: string;
}

interface TeamSubmissionFormProps {
  campaignName: string;
  campaignClient: string;
  onSubmit: (submission: TeamSubmission & { name: string; role: string; practiceArea: string }) => void;
  onClose: () => void;
}

export function TeamSubmissionForm({ campaignName, campaignClient, onSubmit, onClose }: TeamSubmissionFormProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [practiceArea, setPracticeArea] = useState('');
  const [formData, setFormData] = useState<TeamSubmission>({
    challenge: '',
    solution: '',
    practiceAreaWork: '',
    interestingWork: '',
    results: ''
  });
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    // In production, start actual recording here
    console.log('Started recording...');
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Simulate AI transcription and categorization
    setIsTranscribing(true);
    setTimeout(() => {
      // Mock AI-generated content based on voice memo
      const mockTranscription = {
        challenge: 'The main challenge was creating an authentic sustainability narrative that would resonate with skeptical millennials who have seen too much greenwashing. We needed to break through the noise and establish genuine credibility.',
        solution: 'We developed a transparent, data-driven campaign that showed the actual environmental impact of each purchase. Instead of vague claims, we provided specific metrics and third-party certifications.',
        practiceAreaWork: 'Our creative team developed a visual identity system that balanced premium aesthetics with authentic sustainability storytelling. We created modular assets that could adapt across all touchpoints whilst maintaining consistency.',
        interestingWork: 'We pioneered an AR-enabled packaging experience that let consumers explore the product journey from raw materials to finished goods. This was a first in the category and drove significant engagement.',
        results: 'The campaign exceeded targets with 245K views and 8.2% engagement rate. We saw a 42% increase in brand consideration amongst the target demographic and the AR experience was shared organically 12,000 times.'
      };

      setFormData(mockTranscription);
      setIsTranscribing(false);
    }, 2500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      role,
      practiceArea,
      ...formData
    });
  };

  const isFormValid = name && role && practiceArea && formData.challenge && formData.solution;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="mb-1">Team Perspective Submission</h2>
            <p className="text-sm text-gray-600">{campaignName} • {campaignClient}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Voice Recording Section */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold mb-1">Quick Voice Submission</h3>
                  <p className="text-sm text-gray-600">
                    Record a voice memo and AI will automatically fill out the form below
                  </p>
                </div>
                {isRecording && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                    {formatTime(recordingTime)}
                  </div>
                )}
              </div>

              {isTranscribing ? (
                <div className="flex items-center justify-center gap-3 py-8">
                  <Loader className="w-6 h-6 animate-spin text-yellow-600" />
                  <span className="text-gray-600">AI is transcribing and categorising your response...</span>
                </div>
              ) : (
                <div className="flex justify-center">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={handleStartRecording}
                      className="flex items-center gap-3 px-6 py-4 bg-yellow-400 hover:bg-yellow-500 text-black rounded-xl transition-colors font-medium"
                    >
                      <Mic className="w-5 h-5" />
                      Start Recording
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStopRecording}
                      className="flex items-center gap-3 px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium"
                    >
                      <Square className="w-5 h-5" />
                      Stop Recording
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-bold">Your Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Your Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Sarah Johnson"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Your Role *</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g., Creative Director"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Practice Area *</label>
                  <select
                    value={practiceArea}
                    onChange={(e) => setPracticeArea(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="Digital">Digital</option>
                    <option value="Social">Social</option>
                    <option value="Creative">Creative</option>
                    <option value="PR">PR</option>
                    <option value="Strategy">Strategy</option>
                    <option value="Account Management">Account Management</option>
                    <option value="Production">Production</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Form Questions */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">What was the challenge? *</label>
                <textarea
                  value={formData.challenge}
                  onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
                  placeholder="Describe the main challenge this campaign needed to address"
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">What was the solution? *</label>
                <textarea
                  value={formData.solution}
                  onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                  placeholder="Explain the solution and approach taken"
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">What did your practice area do?</label>
                <textarea
                  value={formData.practiceAreaWork}
                  onChange={(e) => setFormData({ ...formData, practiceAreaWork: e.target.value })}
                  placeholder="Describe your practice area's specific contribution to the campaign"
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">What did you do that was interesting or you would like to tell people about?</label>
                <textarea
                  value={formData.interestingWork}
                  onChange={(e) => setFormData({ ...formData, interestingWork: e.target.value })}
                  placeholder="Share any innovative, unique, or noteworthy aspects of your work"
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">What results have you heard of?</label>
                <textarea
                  value={formData.results}
                  onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                  placeholder="Share any results, feedback, or outcomes you're aware of"
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">* Required fields</p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isFormValid}
                className={`px-6 py-3 rounded-lg transition-colors font-medium ${
                  isFormValid
                    ? 'bg-yellow-400 text-black hover:bg-yellow-500'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Submit Perspective
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
