import { useState } from 'react';
import { ArrowLeft, Zap, AlertCircle, Target, DollarSign, Users, Calendar, TrendingUp, FileText, Download, Share2, CheckCircle2, XCircle, Clock, BarChart3, MessageSquare } from 'lucide-react';

interface BriefSignal {
  id: string;
  title: string;
  client: string;
  priority: 'high' | 'medium' | 'low';
  signalsFound: string[];
  opportunity: string;
  sizeOfPrize: string;
  leadDepartments: string[];
  generatedDate: string;
  status: 'new' | 'reviewed' | 'converted';
  confidence: number;
  relatedAgents: string[];
  dataPoints: number;
  timeline: string;
  recommendations: string[];
  risks: string[];
  competitorActivity: {
    competitor: string;
    action: string;
    date: string;
  }[];
}

interface SignalDetailPageProps {
  signalId: string;
  onBack: () => void;
  onConvertToBrief: () => void;
}

const mockSignalData: Record<string, BriefSignal> = {
  '1': {
    id: '1',
    title: 'Competitor pricing drop creates retention opportunity',
    client: 'Tower Insurance',
    priority: 'high',
    signalsFound: [
      'AA Insurance reduced home insurance premiums by 8% for new customers',
      'State Insurance launched "Price Match Promise" campaign',
      'Tower customer churn increased 12% in renewal segment aged 35-50',
      'Social media shows 340% increase in mentions comparing Tower vs AA pricing',
      'Customer service enquiries about competitive pricing up 89% this month',
      'Tower NPS score dropped 6 points among renewal customers',
      'AA Insurance increased marketing spend by $450K in Q4',
      'Price comparison site traffic for home insurance up 124%'
    ],
    opportunity: 'Launch a proactive retention campaign targeting renewal customers with personalised pricing review and loyalty rewards. Create "We Value You" campaign emphasising Tower\'s superior claim service and customer care beyond just price. Implement early renewal incentives and personalised communication highlighting value-adds like 24/7 claims support and faster claim processing.',
    sizeOfPrize: 'Estimated $1.2M revenue protection from preventing 450 policy cancellations + $380K from upsell opportunities to premium tiers',
    leadDepartments: ['Digital', 'CRM', 'Creative'],
    generatedDate: '2025-12-04T08:45:00',
    status: 'new',
    confidence: 94,
    relatedAgents: ['Tower Competitor Pricing Monitor', 'Tower Customer Data Analysis', 'Insurance Media Scanner'],
    dataPoints: 2847,
    timeline: 'Immediate action required - renewal period peaks in 6 weeks',
    recommendations: [
      'Launch retention campaign within 2 weeks to target December-January renewals',
      'Create personalised email sequence highlighting Tower\'s claim satisfaction ratings (4.2/5 vs industry 3.1/5)',
      'Develop "Loyalty Rewards" programme offering renewal discounts for long-term customers',
      'Implement proactive outreach call programme for high-value customers approaching renewal',
      'Create comparison content showing total cost of ownership vs competitors (claims experience, service quality)',
      'Partner with customer service to train team on retention messaging and empowerment to offer competitive pricing',
      'Deploy social media campaign featuring real customer claims stories and testimonials'
    ],
    risks: [
      'Competitor pricing may continue to decrease, requiring ongoing monitoring',
      'Customer expectations for price matching may create margin pressure',
      'Campaign execution delay could result in higher than projected churn',
      'Retention offers may impact profitability if not carefully structured'
    ],
    competitorActivity: [
      { competitor: 'AA Insurance', action: '8% premium reduction for new customers', date: '2025-11-28' },
      { competitor: 'State Insurance', action: 'Price Match Promise campaign launch', date: '2025-11-30' },
      { competitor: 'AMI Insurance', action: 'Increased digital advertising spend', date: '2025-12-01' },
      { competitor: 'AA Insurance', action: 'Partnership with Countdown for rewards programme', date: '2025-12-02' }
    ]
  },
  '2': {
    id: '2',
    title: 'EV charging anxiety creates content opportunity',
    client: 'Volvo',
    priority: 'high',
    signalsFound: [
      'Google search volume for "EV charging near me" up 156% in Q4',
      'Volvo customer survey shows 68% cite charging infrastructure as top concern',
      'Tesla launched charging network partnership campaign in NZ',
      'Media coverage of EV adoption barriers increased 89% month-over-month',
      'Volvo EV test drive conversion rate 23% lower than petrol models',
      'Social media sentiment analysis shows charging anxiety mentioned in 78% of EV hesitation posts',
      'ChargeNet NZ announced 40% network expansion in 2026'
    ],
    opportunity: 'Create an educational content series "The Complete EV Charging Guide" positioning Volvo as the trusted advisor for EV ownership. Include interactive charging station map, cost calculators, real customer stories, and partnerships with charging networks. Develop "EV Confidence Programme" with trial charging network access for prospects.',
    sizeOfPrize: 'Estimated 18% increase in EV consideration among Volvo prospects (approx. 2,400 additional qualified leads worth $4.8M potential revenue)',
    leadDepartments: ['Content', 'Digital', 'Social'],
    generatedDate: '2025-12-04T07:30:00',
    status: 'new',
    confidence: 87,
    relatedAgents: ['Volvo Social Listening', 'Geely Market Intelligence'],
    dataPoints: 1923,
    timeline: 'Launch before Q1 2026 EV purchase peak season',
    recommendations: [
      'Develop comprehensive EV Charging Guide microsite with interactive tools',
      'Create partnership programme with ChargeNet NZ for exclusive Volvo customer benefits',
      'Produce video content series featuring real Volvo EV owners discussing charging experiences',
      'Build interactive charging station map with real-time availability and route planning',
      'Develop "Charging Cost Calculator" comparing EV vs petrol costs over ownership period',
      'Implement "EV Trial Programme" offering week-long EV loans with charging network access',
      'Create social media campaign addressing common charging myths and concerns'
    ],
    risks: [
      'Charging infrastructure development may not meet customer expectations',
      'Competitor automotive brands may launch similar educational initiatives',
      'Content may become outdated quickly as charging infrastructure evolves',
      'Partnership negotiations with charging networks may be complex'
    ],
    competitorActivity: [
      { competitor: 'Tesla', action: 'Charging network partnership campaign in NZ', date: '2025-11-25' },
      { competitor: 'BYD', action: 'Free charging for first year promotion', date: '2025-11-29' },
      { competitor: 'Nissan', action: 'EV education roadshow launch', date: '2025-12-01' }
    ]
  }
};

export function SignalDetailPage({ signalId, onBack, onConvertToBrief }: SignalDetailPageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'recommendations' | 'competitors' | 'data'>('overview');
  const [notes, setNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  const signal = mockSignalData[signalId] || mockSignalData['1'];

  const getPriorityColor = (priority: BriefSignal['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getStatusColor = (status: BriefSignal['status']) => {
    switch (status) {
      case 'new': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'converted': return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Signals</span>
        </button>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-200">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(signal.priority)}`}>
                      {signal.priority} priority
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(signal.status)}`}>
                      {signal.status}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      {signal.confidence}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{signal.client}</p>
                </div>
              </div>
              <h1 className="mb-2">{signal.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Generated {new Date(signal.generatedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <BarChart3 className="w-4 h-4" />
                  {signal.dataPoints.toLocaleString()} data points
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export PDF
              </button>
              <button 
                onClick={onConvertToBrief}
                className="px-6 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors font-medium flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Convert to Brief
              </button>
            </div>
          </div>

          {/* Timeline Alert */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-orange-900 mb-1">Timeline</p>
              <p className="text-sm text-orange-800">{signal.timeline}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-white/80 rounded-xl border border-gray-200 w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'overview'
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'recommendations'
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Recommendations
        </button>
        <button
          onClick={() => setActiveTab('competitors')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'competitors'
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Competitor Activity
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'data'
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Data Sources
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Signals Detected */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-purple-600" />
                Signals Detected ({signal.signalsFound.length})
              </h3>
              <ul className="space-y-3">
                {signal.signalsFound.map((sig, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-purple-700">{idx + 1}</span>
                    </div>
                    <span className="text-gray-700">{sig}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Metrics */}
            <div className="space-y-6">
              {/* Opportunity */}
              <div className="bg-gradient-to-br from-blue-50 to-white/80 backdrop-blur-xl rounded-2xl p-6 border border-blue-200">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Marketing Opportunity
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">{signal.opportunity}</p>
              </div>

              {/* Size of Prize */}
              <div className="bg-gradient-to-br from-green-50 to-white/80 backdrop-blur-xl rounded-2xl p-6 border border-green-200">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Size of Prize
                </h3>
                <p className="text-sm text-gray-700 font-medium leading-relaxed">{signal.sizeOfPrize}</p>
              </div>

              {/* Lead Departments */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-700" />
                  Recommended Lead Departments
                </h3>
                <div className="flex flex-wrap gap-2">
                  {signal.leadDepartments.map((dept, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
                      {dept}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Related Agents */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
            <h3 className="font-bold mb-4">Related AI Agents</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {signal.relatedAgents.map((agent, idx) => (
                <div key={idx} className="p-4 bg-purple-50 rounded-xl border border-purple-200 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{agent}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Assignment & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
              <h3 className="font-bold mb-4">Assign to Team Member</h3>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="">Select team member...</option>
                <option value="sarah">Sarah Chen - Account Director</option>
                <option value="james">James Wong - Strategy Lead</option>
                <option value="emma">Emma Taylor - Creative Director</option>
                <option value="alex">Alex Morgan - Digital Lead</option>
              </select>
              {assignedTo && (
                <button className="w-full mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                  Send Assignment Notification
                </button>
              )}
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Internal Notes
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes for your team..."
                rows={3}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
              />
              <button className="w-full mt-3 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium">
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Recommended Actions ({signal.recommendations.length})
            </h3>
            <div className="space-y-4">
              {signal.recommendations.map((rec, idx) => (
                <div key={idx} className="p-5 bg-gradient-to-r from-green-50 to-white rounded-xl border border-green-200 hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">{idx + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700 flex-1 leading-relaxed">{rec}</p>
                    <button className="px-3 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium">
                      Add to Brief
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Risks & Considerations ({signal.risks.length})
            </h3>
            <div className="space-y-3">
              {signal.risks.map((risk, idx) => (
                <div key={idx} className="p-4 bg-red-50 rounded-xl border border-red-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">{risk}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Competitors Tab */}
      {activeTab === 'competitors' && (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
          <h3 className="font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Recent Competitor Activity
          </h3>
          <div className="space-y-4">
            {signal.competitorActivity.map((activity, idx) => (
              <div key={idx} className="p-5 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-gray-900">{activity.competitor}</h4>
                  <span className="text-xs text-gray-500">
                    {new Date(activity.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{activity.action}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-900">
              <strong>💡 Insight:</strong> Competitor activity has increased 45% in the past 30 days. This signal's urgency rating is influenced by the pace of competitive movement in this space.
            </p>
          </div>
        </div>
      )}

      {/* Data Sources Tab */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
            <h3 className="font-bold mb-6">Data Sources & Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Total Data Points</span>
                  <span className="text-2xl font-bold text-purple-700">{signal.dataPoints.toLocaleString()}</span>
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Confidence Score</span>
                  <span className="text-2xl font-bold text-green-700">{signal.confidence}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-5 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold">Competitor Pricing Data</h4>
                    <p className="text-sm text-gray-600">Daily price monitoring across 15 competitors</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Data Points</p>
                    <p className="font-bold">847</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Last Updated</p>
                    <p className="font-bold">2 hours ago</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Source Quality</p>
                    <p className="font-bold text-green-600">Excellent</p>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold">Customer Behaviour Analysis</h4>
                    <p className="text-sm text-gray-600">Internal customer data and churn patterns</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Data Points</p>
                    <p className="font-bold">1,234</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Last Updated</p>
                    <p className="font-bold">4 hours ago</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Source Quality</p>
                    <p className="font-bold text-green-600">Excellent</p>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold">Social Media Sentiment</h4>
                    <p className="text-sm text-gray-600">Social listening across platforms</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Data Points</p>
                    <p className="font-bold">766</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Last Updated</p>
                    <p className="font-bold">1 hour ago</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Source Quality</p>
                    <p className="font-bold text-yellow-600">Good</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}