import { useState, useRef } from 'react';
import { ChevronRight, Check, AlertCircle, ArrowLeft, Link2, Users, CheckCircle2, Clock, Upload, File, ExternalLink } from 'lucide-react';
import { TeamSubmissionForm } from './TeamSubmissionForm';

interface Campaign {
  id: string;
  name: string;
  client: string;
  type: 'digital' | 'pr' | 'social';
  endDate: string;
  needsClosure: boolean;
}

interface TeamMember {
  name: string;
  role: string;
  practiceArea: string;
  hasSubmitted: boolean;
  submittedAt?: string;
  submission?: {
    challenge: string;
    solution: string;
    practiceAreaWork: string;
    interestingWork: string;
    results: string;
  };
}

interface CampaignClosure {
  campaignId: string;
  finalMetrics: {
    totalBudgetSpent: string;
    actualTimeline: string;
    deliveryOnTime: boolean;
    deliveryOnBudget: boolean;
  };
  performance: {
    overallSuccess: string;
    kpisMet: string;
    channelPerformance: string;
  };
  learnings: {
    whatWentWell: string;
    whatDidntGoWell: string;
    keyTakeaways: string;
    recommendations: string;
  };
  clientFeedback: {
    clientSatisfaction: string;
    testimonial: string;
  };
  finalAssets: {
    assetsPDF: File | null;
    serverLocation: string;
  };
  teamPerspectives: TeamMember[];
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Winter Product Campaign',
    client: 'Acme Corporation',
    type: 'digital',
    endDate: '2025-11-30',
    needsClosure: true
  },
  {
    id: '2',
    name: 'Brand Refresh Launch',
    client: 'TechStart Inc',
    type: 'social',
    endDate: '2025-11-15',
    needsClosure: true
  },
  {
    id: '3',
    name: 'New Store Opening PR',
    client: 'GreenLife Foods',
    type: 'pr',
    endDate: '2025-11-22',
    needsClosure: true
  }
];

interface FinishCampaignsProps {
  onBack: () => void;
}

export function FinishCampaigns({ onBack }: FinishCampaignsProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [currentStep, setCurrentStep] = useState<'list' | 'form' | 'complete'>('list');
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [shareableLinkCopied, setShareableLinkCopied] = useState(false);
  const [formData, setFormData] = useState<CampaignClosure>({
    campaignId: '',
    finalMetrics: {
      totalBudgetSpent: '',
      actualTimeline: '',
      deliveryOnTime: true,
      deliveryOnBudget: true
    },
    performance: {
      overallSuccess: '',
      kpisMet: '',
      channelPerformance: ''
    },
    learnings: {
      whatWentWell: '',
      whatDidntGoWell: '',
      keyTakeaways: '',
      recommendations: ''
    },
    clientFeedback: {
      clientSatisfaction: '',
      testimonial: ''
    },
    finalAssets: {
      assetsPDF: null,
      serverLocation: ''
    },
    teamPerspectives: [
      {
        name: 'Sarah Johnson',
        role: 'Creative Director',
        practiceArea: 'Creative',
        hasSubmitted: true,
        submittedAt: '2025-12-03T14:30:00',
        submission: {
          challenge: 'The main challenge was creating an authentic sustainability narrative that would resonate with skeptical millennials who have seen too much greenwashing.',
          solution: 'We developed a transparent, data-driven campaign that showed the actual environmental impact of each purchase with specific metrics.',
          practiceAreaWork: 'Our creative team developed a visual identity system that balanced premium aesthetics with authentic sustainability storytelling.',
          interestingWork: 'We pioneered an AR-enabled packaging experience that let consumers explore the product journey from raw materials to finished goods.',
          results: 'The campaign exceeded targets with 245K views and 8.2% engagement rate. AR experience was shared organically 12,000 times.'
        }
      },
      {
        name: 'Marcus Chen',
        role: 'Digital Strategist',
        practiceArea: 'Digital',
        hasSubmitted: true,
        submittedAt: '2025-12-03T16:15:00',
        submission: {
          challenge: 'Breaking through ad fatigue in a crowded sustainability market whilst maintaining cost-effective customer acquisition.',
          solution: 'Implemented a multi-touch attribution model focusing on micro-moments and created personalised user journeys based on engagement signals.',
          practiceAreaWork: 'Digital team architected the campaign infrastructure, managed programmatic buying, and optimised performance across channels.',
          interestingWork: 'Built a real-time impact dashboard showing collective environmental savings that became the most shared campaign element.',
          results: '12,450 clicks with 18.3% improvement over targets. CPA decreased 34% mid-campaign through optimization.'
        }
      },
      {
        name: 'Emily Rodriguez',
        role: 'Social Media Manager',
        practiceArea: 'Social',
        hasSubmitted: false
      },
      {
        name: 'James Patterson',
        role: 'Account Director',
        practiceArea: 'Account Management',
        hasSubmitted: false
      }
    ]
  });

  const handleStartClosure = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setFormData({
      ...formData,
      campaignId: campaign.id
    });
    setCurrentStep('form');
  };

  const handleCopyShareableLink = () => {
    // In production, this would generate a unique link
    const shareableLink = `${window.location.origin}/team-submission/${selectedCampaign?.id}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareableLink).catch(() => {
        fallbackCopyTextToClipboard(shareableLink);
      });
    } else {
      fallbackCopyTextToClipboard(shareableLink);
    }
    setShareableLinkCopied(true);
    setTimeout(() => setShareableLinkCopied(false), 2000);
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

  const handleTeamSubmission = (submission: any) => {
    const newMember: TeamMember = {
      name: submission.name,
      role: submission.role,
      practiceArea: submission.practiceArea,
      hasSubmitted: true,
      submittedAt: new Date().toISOString(),
      submission: {
        challenge: submission.challenge,
        solution: submission.solution,
        practiceAreaWork: submission.practiceAreaWork,
        interestingWork: submission.interestingWork,
        results: submission.results
      }
    };

    setFormData({
      ...formData,
      teamPerspectives: [...formData.teamPerspectives, newMember]
    });
    setShowTeamForm(false);
  };

  const handleSubmit = () => {
    // In production, this would save to database
    console.log('Campaign closure submitted:', formData);
    setCurrentStep('complete');
  };

  const handleComplete = () => {
    setCurrentStep('list');
    setSelectedCampaign(null);
    setFormData({
      campaignId: '',
      finalMetrics: {
        totalBudgetSpent: '',
        actualTimeline: '',
        deliveryOnTime: true,
        deliveryOnBudget: true
      },
      performance: {
        overallSuccess: '',
        kpisMet: '',
        channelPerformance: ''
      },
      learnings: {
        whatWentWell: '',
        whatDidntGoWell: '',
        keyTakeaways: '',
        recommendations: ''
      },
      clientFeedback: {
        clientSatisfaction: '',
        testimonial: ''
      },
      finalAssets: {
        assetsPDF: null,
        serverLocation: ''
      },
      teamPerspectives: []
    });
  };

  const renderFormSection = (title: string, description: string, children: React.ReactNode) => (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
      <h4 className="font-bold mb-1">{title}</h4>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      {children}
    </div>
  );

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
          <h1 className="mb-2">Finish Campaigns</h1>
          <p className="text-gray-600">
            {currentStep === 'list' && 'Enter final data and learnings for completed campaigns'}
            {currentStep === 'form' && selectedCampaign && `Closing: ${selectedCampaign.name}`}
            {currentStep === 'complete' && 'Campaign closure complete'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div>
        {currentStep === 'list' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                Complete campaign closures to help improve future brief enhancements and "Roll the Tapes" insights.
              </p>
            </div>

            {mockCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">{campaign.name}</h3>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium capitalize">
                        {campaign.type}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{campaign.client}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Ended: {new Date(campaign.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      {campaign.needsClosure && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          Needs Closure
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleStartClosure(campaign)}
                    className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors flex items-center gap-2 font-medium"
                  >
                    Start Closure
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentStep === 'form' && selectedCampaign && (
          <div className="space-y-6">
            {renderFormSection(
              'Final Metrics',
              'Record the actual budget and timeline outcomes',
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Total Budget Spent</label>
                  <input
                    type="text"
                    value={formData.finalMetrics.totalBudgetSpent}
                    onChange={(e) => setFormData({
                      ...formData,
                      finalMetrics: { ...formData.finalMetrics, totalBudgetSpent: e.target.value }
                    })}
                    placeholder="e.g., £145,000"
                    className="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Actual Timeline</label>
                  <input
                    type="text"
                    value={formData.finalMetrics.actualTimeline}
                    onChange={(e) => setFormData({
                      ...formData,
                      finalMetrics: { ...formData.finalMetrics, actualTimeline: e.target.value }
                    })}
                    placeholder="e.g., 14 weeks"
                    className="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.finalMetrics.deliveryOnTime}
                      onChange={(e) => setFormData({
                        ...formData,
                        finalMetrics: { ...formData.finalMetrics, deliveryOnTime: e.target.checked }
                      })}
                      className="w-4 h-4 text-yellow-400 rounded focus:ring-yellow-400"
                    />
                    <span className="text-sm">Delivered on time</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.finalMetrics.deliveryOnBudget}
                      onChange={(e) => setFormData({
                        ...formData,
                        finalMetrics: { ...formData.finalMetrics, deliveryOnBudget: e.target.checked }
                      })}
                      className="w-4 h-4 text-yellow-400 rounded focus:ring-yellow-400"
                    />
                    <span className="text-sm">Delivered on budget</span>
                  </label>
                </div>
              </div>
            )}

            {renderFormSection(
              'Performance Overview',
              'Summarise campaign performance and KPI achievement',
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Overall Success Rating (1-10)</label>
                  <input
                    type="text"
                    value={formData.performance.overallSuccess}
                    onChange={(e) => setFormData({
                      ...formData,
                      performance: { ...formData.performance, overallSuccess: e.target.value }
                    })}
                    placeholder="e.g., 8"
                    className="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">KPIs Met</label>
                  <textarea
                    value={formData.performance.kpisMet}
                    onChange={(e) => setFormData({
                      ...formData,
                      performance: { ...formData.performance, kpisMet: e.target.value }
                    })}
                    placeholder="List which KPIs were achieved and by how much"
                    rows={3}
                    className="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Channel Performance Summary</label>
                  <textarea
                    value={formData.performance.channelPerformance}
                    onChange={(e) => setFormData({
                      ...formData,
                      performance: { ...formData.performance, channelPerformance: e.target.value }
                    })}
                    placeholder="Describe how different channels performed"
                    rows={3}
                    className="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>
            )}

            {renderFormSection(
              'Account Manager Insights',
              'Share learnings to improve future campaigns',
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">What Went Well</label>
                  <textarea
                    value={formData.learnings.whatWentWell}
                    onChange={(e) => setFormData({
                      ...formData,
                      learnings: { ...formData.learnings, whatWentWell: e.target.value }
                    })}
                    placeholder="Describe successful aspects of the campaign"
                    rows={4}
                    className="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">What Didn't Go Well</label>
                  <textarea
                    value={formData.learnings.whatDidntGoWell}
                    onChange={(e) => setFormData({
                      ...formData,
                      learnings: { ...formData.learnings, whatDidntGoWell: e.target.value }
                    })}
                    placeholder="Describe challenges and areas for improvement"
                    rows={4}
                    className="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Key Takeaways</label>
                  <textarea
                    value={formData.learnings.keyTakeaways}
                    onChange={(e) => setFormData({
                      ...formData,
                      learnings: { ...formData.learnings, keyTakeaways: e.target.value }
                    })}
                    placeholder="Main learnings from this campaign"
                    rows={3}
                    className="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Recommendations for Future Campaigns</label>
                  <textarea
                    value={formData.learnings.recommendations}
                    onChange={(e) => setFormData({
                      ...formData,
                      learnings: { ...formData.learnings, recommendations: e.target.value }
                    })}
                    placeholder="What should we do differently next time?"
                    rows={3}
                    className="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>
            )}

            {renderFormSection(
              'Client Feedback',
              'Record client satisfaction and testimonials',
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Client Satisfaction (1-10)</label>
                  <input
                    type="text"
                    value={formData.clientFeedback.clientSatisfaction}
                    onChange={(e) => setFormData({
                      ...formData,
                      clientFeedback: { ...formData.clientFeedback, clientSatisfaction: e.target.value }
                    })}
                    placeholder="e.g., 9"
                    className="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Client Testimonial (Optional)</label>
                  <textarea
                    value={formData.clientFeedback.testimonial}
                    onChange={(e) => setFormData({
                      ...formData,
                      clientFeedback: { ...formData.clientFeedback, testimonial: e.target.value }
                    })}
                    placeholder="Any positive feedback or testimonial from the client"
                    rows={3}
                    className="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>
            )}

            {renderFormSection(
              'Final Campaign Assets',
              'Upload campaign deliverables and server locations for easy reference',
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Campaign Assets PDF</label>
                  <p className="text-xs text-gray-600 mb-2">Upload a PDF containing final campaign assets, creative work, and deliverables</p>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setFormData({
                          ...formData,
                          finalAssets: { ...formData.finalAssets, assetsPDF: file }
                        });
                      }}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <label
                      htmlFor="pdf-upload"
                      className="flex items-center justify-center gap-3 p-6 bg-white/60 border-2 border-dashed border-gray-300 rounded-lg hover:bg-white/80 hover:border-yellow-400 transition-all cursor-pointer"
                    >
                      {formData.finalAssets.assetsPDF ? (
                        <div className="flex items-center gap-3">
                          <File className="w-6 h-6 text-green-600" />
                          <div className="text-left">
                            <p className="font-medium text-green-700">{formData.finalAssets.assetsPDF.name}</p>
                            <p className="text-xs text-gray-600">
                              {(formData.finalAssets.assetsPDF.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-gray-400" />
                          <div className="text-center">
                            <p className="font-medium text-gray-700">Click to upload PDF</p>
                            <p className="text-xs text-gray-500">or drag and drop</p>
                          </div>
                        </>
                      )}
                    </label>
                    {formData.finalAssets.assetsPDF && (
                      <button
                        onClick={() => setFormData({
                          ...formData,
                          finalAssets: { ...formData.finalAssets, assetsPDF: null }
                        })}
                        className="absolute top-2 right-2 px-3 py-1 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Server Location / Shared Drive Link</label>
                  <p className="text-xs text-gray-600 mb-2">Provide a link or path to where campaign assets are stored on the server</p>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={formData.finalAssets.serverLocation}
                        onChange={(e) => setFormData({
                          ...formData,
                          finalAssets: { ...formData.finalAssets, serverLocation: e.target.value }
                        })}
                        placeholder="e.g., /server/campaigns/2025/acme-winter or https://drive.google.com/..."
                        className="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 pr-10"
                      />
                      {formData.finalAssets.serverLocation && (
                        <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    {formData.finalAssets.serverLocation && (
                      <a
                        href={formData.finalAssets.serverLocation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open
                      </a>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> These assets will be easily accessible for future reference, case study development, and "Roll the Tapes" analysis.
                  </p>
                </div>
              </div>
            )}

            {renderFormSection(
              'Team Perspectives',
              'Gather insights from team members for case study development',
              <div className="space-y-4">
                {/* Shareable Link */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Link2 className="w-5 h-5 text-yellow-700" />
                    <h5 className="font-bold text-yellow-900">Shareable Submission Link</h5>
                  </div>
                  <p className="text-sm text-yellow-800 mb-3">
                    Share this link with team members to collect their perspectives
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`${window.location.origin}/team-submission/${selectedCampaign?.id}`}
                      readOnly
                      className="flex-1 px-4 py-2 bg-white border border-yellow-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={handleCopyShareableLink}
                      className="px-6 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors font-medium"
                    >
                      {shareableLinkCopied ? '✓ Copied!' : 'Copy Link'}
                    </button>
                  </div>
                </div>

                {/* Team Member Submissions */}
                <div>
                  <h5 className="font-bold mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Team Member Submissions ({formData.teamPerspectives.filter(m => m.hasSubmitted).length}/{formData.teamPerspectives.length})
                  </h5>
                  
                  <div className="space-y-3">
                    {formData.teamPerspectives.map((member, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          member.hasSubmitted
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center ${
                              member.hasSubmitted ? 'bg-green-500' : 'bg-gray-300'
                            }`}>
                              {member.hasSubmitted ? (
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              ) : (
                                <Clock className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-bold">{member.name}</p>
                                <span className="px-2 py-0.5 bg-white border border-gray-300 rounded-full text-xs">
                                  {member.role}
                                </span>
                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                  {member.practiceArea}
                                </span>
                              </div>
                              {member.hasSubmitted && member.submittedAt && (
                                <p className="text-xs text-gray-600 mb-3">
                                  Submitted on {new Date(member.submittedAt).toLocaleDateString('en-GB', { 
                                    day: 'numeric', 
                                    month: 'long', 
                                    year: 'numeric', 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </p>
                              )}
                              {!member.hasSubmitted && (
                                <p className="text-xs text-gray-600">Awaiting submission</p>
                              )}
                              
                              {/* Show submission details if available */}
                              {member.hasSubmitted && member.submission && (
                                <div className="mt-3 space-y-2 text-sm">
                                  <div>
                                    <p className="font-medium text-gray-700 mb-1">Challenge:</p>
                                    <p className="text-gray-600 bg-white p-2 rounded">{member.submission.challenge}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-700 mb-1">Solution:</p>
                                    <p className="text-gray-600 bg-white p-2 rounded">{member.submission.solution}</p>
                                  </div>
                                  {member.submission.practiceAreaWork && (
                                    <div>
                                      <p className="font-medium text-gray-700 mb-1">Practice Area Work:</p>
                                      <p className="text-gray-600 bg-white p-2 rounded">{member.submission.practiceAreaWork}</p>
                                    </div>
                                  )}
                                  {member.submission.interestingWork && (
                                    <div>
                                      <p className="font-medium text-gray-700 mb-1">Interesting Work:</p>
                                      <p className="text-gray-600 bg-white p-2 rounded">{member.submission.interestingWork}</p>
                                    </div>
                                  )}
                                  {member.submission.results && (
                                    <div>
                                      <p className="font-medium text-gray-700 mb-1">Results:</p>
                                      <p className="text-gray-600 bg-white p-2 rounded">{member.submission.results}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Manual Submission Button */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">
                    Team members can also submit directly using the form below:
                  </p>
                  <button
                    onClick={() => setShowTeamForm(!showTeamForm)}
                    className="px-6 py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors font-medium flex items-center gap-2"
                  >
                    <Users className="w-5 h-5" />
                    {showTeamForm ? 'Hide Submission Form' : 'Open Submission Form'}
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setCurrentStep('list')}
                className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors font-medium"
              >
                Submit Campaign Closure
              </button>
            </div>
          </div>
        )}

        {currentStep === 'complete' && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Campaign Closure Complete!</h3>
            <p className="text-gray-600 mb-8 text-center max-w-md">
              Your insights have been saved and will be used to improve future brief enhancements and "Roll the Tapes" analysis.
            </p>
            <button
              onClick={handleComplete}
              className="px-6 py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors font-medium"
            >
              Close Another Campaign
            </button>
          </div>
        )}
      </div>

      {/* Team Submission Form Modal */}
      {showTeamForm && selectedCampaign && (
        <TeamSubmissionForm
          campaignName={selectedCampaign.name}
          campaignClient={selectedCampaign.client}
          onSubmit={handleTeamSubmission}
          onClose={() => setShowTeamForm(false)}
        />
      )}
    </div>
  );
}