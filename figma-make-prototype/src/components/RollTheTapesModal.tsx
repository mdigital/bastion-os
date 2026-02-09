import { X, Clock, DollarSign, Users, Lightbulb, BarChart3, ThumbsUp, ThumbsDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RollTheTapesModalProps {
  onClose: () => void;
  clientName: string;
  jobToBeDone: string;
}

export function RollTheTapesModal({ onClose, clientName, jobToBeDone }: RollTheTapesModalProps) {
  // Mock data for previous campaigns
  const budgetComparisonData = [
    { name: 'Product Launch\nQ1 2024', budget: 145000, actual: 138000 },
    { name: 'Sustainability\nQ3 2023', budget: 120000, actual: 125000 },
    { name: 'Rebrand\nQ2 2023', budget: 180000, actual: 195000 },
    { name: 'Holiday Campaign\nQ4 2022', budget: 95000, actual: 92000 },
    { name: 'Current\nProject', budget: 150000, actual: 0 },
  ];

  const timelineComparisonData = [
    { name: 'Product Launch\nQ1 2024', planned: 12, actual: 14 },
    { name: 'Sustainability\nQ3 2023', planned: 10, actual: 11 },
    { name: 'Rebrand\nQ2 2023', planned: 16, actual: 20 },
    { name: 'Holiday Campaign\nQ4 2022', planned: 8, actual: 8 },
  ];

  const clientFeedback = [
    {
      campaign: 'Sustainable Product Launch Q1 2024',
      accountManager: 'Sarah Chen, Senior Account Manager',
      whatWentWell: "Client loved the creative approach to telling their sustainability story. The AR packaging feature was a huge hit with stakeholders and generated significant buzz. Strong collaboration between our design and strategy teams. Jane (Head of Marketing) was very responsive and gave clear feedback at each stage.",
      whatDidntGoWell: "We underestimated the time needed for legal review of sustainability claims - this added 3 weeks to the timeline. Some internal miscommunication early on about deliverable formats caused rework. Would have benefited from bringing the legal team in earlier for consultation.",
      date: 'March 2024'
    },
    {
      campaign: 'Sustainability Campaign Q3 2023',
      accountManager: 'Mike Thompson, Account Director',
      whatWentWell: "Strategic direction was solid and the client bought into our recommendations immediately. Creative execution exceeded expectations. Great chemistry between our team and theirs. Budget came in 2% under target.",
      whatDidntGoWell: "Stakeholder approval process was more complex than anticipated - we should have mapped this out better during discovery. The messaging took multiple rounds to get approved, which created bottlenecks. Next time, we need to build in more buffer time for internal approvals and get clarity on decision-makers upfront.",
      date: 'September 2023'
    },
    {
      campaign: 'Brand Refresh Q2 2023',
      accountManager: 'Sarah Chen, Senior Account Manager',
      whatWentWell: "The rebrand work was excellent quality and the client was thrilled with the final brand guidelines. Our workshop facilitation was particularly strong - got great engagement from their entire leadership team. Research phase was thorough and well-received.",
      whatDidntGoWell: "Coordination across multiple client departments (Marketing, Product, Legal, C-Suite) was challenging. We should have established clearer communication protocols and a RACI matrix from day one. Project went 8% over budget due to scope creep - we needed better change request procedures. Timeline slipped by 4 weeks mainly due to waiting for feedback from various stakeholders.",
      date: 'June 2023'
    }
  ];

  const keyLearnings = [
    {
      category: 'Timeline Management',
      insight: 'Product launches for this client typically require 14-16 weeks, not the standard 12. Their legal and compliance review adds 2-3 weeks.',
      impact: 'High',
      campaigns: 3
    },
    {
      category: 'Budget Allocation',
      insight: 'Social media consistently outperforms other channels for this client by 40%. Consider allocating 35-40% of paid budget here.',
      impact: 'High',
      campaigns: 4
    },
    {
      category: 'Stakeholder Approval',
      insight: 'Sustainability claims require sign-off from Legal, Product, and C-Suite. Build in multiple review cycles and maintain detailed documentation.',
      impact: 'Medium',
      campaigns: 2
    },
    {
      category: 'Creative Preferences',
      insight: 'Client responds well to data-driven storytelling with clear ROI metrics. Avoid overly abstract concepts.',
      impact: 'Medium',
      campaigns: 5
    },
    {
      category: 'Communication Style',
      insight: 'Jane (Head of Marketing) prefers weekly email updates over meetings. David (CMO) wants monthly face-to-face strategy reviews.',
      impact: 'Low',
      campaigns: 6
    }
  ];

  const similarProjectsData = [
    {
      client: 'GreenTech Solutions',
      job: 'Sustainable tech product launch',
      duration: '15 weeks',
      budget: '£165,000',
      outcome: 'Exceeded awareness targets by 45%',
      keyTactic: 'Influencer partnerships with sustainability advocates'
    },
    {
      client: 'EcoHome Products',
      job: 'Eco-friendly product line introduction',
      duration: '13 weeks',
      budget: '£140,000',
      outcome: '2.3x ROI in first quarter',
      keyTactic: 'AR product visualisation in-home'
    },
    {
      client: 'Sustainable Apparel Co',
      job: 'Green product launch campaign',
      duration: '12 weeks',
      budget: '£128,000',
      outcome: 'Generated 15K pre-orders before launch',
      keyTactic: 'Behind-the-scenes sustainability storytelling'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 className="mb-1">Roll the Tapes</h2>
              <p className="text-sm text-gray-600">Historical insights for {clientName} and similar campaigns</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            
            {/* Budget Analysis */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3>Budget Performance History</h3>
                  <p className="text-sm text-gray-600">Planned vs. actual spend on previous {clientName} campaigns</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number) => `£${value.toLocaleString()}`}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
                  />
                  <Legend />
                  <Bar dataKey="budget" fill="#FFCA05" name="Planned Budget" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="actual" fill="#000000" name="Actual Spend" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Insight:</strong> {clientName} campaigns typically come in within 5% of budget. The Q2 2023 rebrand went 8% over due to additional stakeholder revisions. Current project budget of £150,000 aligns with historical spending for product launches.
                </p>
              </div>
            </div>

            {/* Timeline Analysis */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3>Timeline Accuracy</h3>
                  <p className="text-sm text-gray-600">Planned vs. actual project duration (weeks)</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timelineComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number) => `${value} weeks`}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
                  />
                  <Legend />
                  <Bar dataKey="planned" fill="#FFCA05" name="Planned Duration" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="actual" fill="#000000" name="Actual Duration" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Insight:</strong> Product launches average 14 weeks actual vs. 12 weeks planned. Key delay factor: compliance and legal reviews add 2-3 weeks. Recommend building this buffer into timeline from the start.
                </p>
              </div>
            </div>

            {/* Account Manager Feedback */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3>Account Manager Insights</h3>
                  <p className="text-sm text-gray-600">Learnings from previous {clientName} campaigns</p>
                </div>
              </div>
              <div className="space-y-4">
                {clientFeedback.map((feedback, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="mb-4">
                      <p className="font-medium text-gray-900 mb-1">{feedback.campaign}</p>
                      <p className="text-xs text-gray-600">{feedback.accountManager} • {feedback.date}</p>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                        <div className="flex items-start gap-3">
                          <ThumbsUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-green-900 mb-1">What Went Well</p>
                            <p className="text-sm text-gray-700">{feedback.whatWentWell}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                        <div className="flex items-start gap-3">
                          <ThumbsDown className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-red-900 mb-1">What Didn't Go Well</p>
                            <p className="text-sm text-gray-700">{feedback.whatDidntGoWell}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Learnings */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h3>Key Learnings & Patterns</h3>
                  <p className="text-sm text-gray-600">Insights from {clientName} campaign history</p>
                </div>
              </div>
              <div className="space-y-3">
                {keyLearnings.map((learning, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-yellow-400 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-sm">{learning.category}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            learning.impact === 'High' 
                              ? 'bg-red-100 text-red-700' 
                              : learning.impact === 'Medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {learning.impact} Impact
                          </span>
                          <span className="text-xs text-gray-500">
                            From {learning.campaigns} campaign{learning.campaigns > 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{learning.insight}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Similar Projects */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3>Similar Projects Across Other Clients</h3>
                  <p className="text-sm text-gray-600">Campaigns with similar job to be done: "{jobToBeDone}"</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {similarProjectsData.map((project, index) => (
                  <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all">
                    <p className="font-medium text-gray-900 mb-1">{project.client}</p>
                    <p className="text-sm text-gray-600 mb-4">{project.job}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{project.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{project.budget}</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-600 mb-2">Outcome:</p>
                      <p className="text-sm font-medium text-green-700 mb-3">{project.outcome}</p>
                      <p className="text-xs text-gray-600 mb-1">Key Tactic:</p>
                      <p className="text-sm text-gray-800">{project.keyTactic}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> Historical data is updated automatically from completed campaigns and client feedback surveys.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
