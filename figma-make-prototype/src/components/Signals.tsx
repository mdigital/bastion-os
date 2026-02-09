import { useState } from 'react';
import { ArrowLeft, Zap, TrendingUp, DollarSign, Target, ChevronRight, AlertCircle, Eye, FileText, Activity, Globe, BarChart3, Users, Clock, CheckCircle2, Play, Pause } from 'lucide-react';
import { SignalDetailPage } from './SignalDetailPage';
import { AgentDetailPage } from './AgentDetailPage';

interface Agent {
  id: string;
  name: string;
  type: 'competitor' | 'client-data' | 'media' | 'social' | 'market';
  client: string;
  status: 'active' | 'paused' | 'complete';
  lastRun: string;
  signalsGenerated: number;
  description: string;
}

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
}

const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Tower Competitor Pricing Monitor',
    type: 'competitor',
    client: 'Tower Insurance',
    status: 'active',
    lastRun: '2025-12-04T08:30:00',
    signalsGenerated: 12,
    description: 'Daily monitoring of competitor insurance quotes across multiple product lines and customer profiles'
  },
  {
    id: '2',
    name: 'Tower Customer Data Analysis',
    type: 'client-data',
    client: 'Tower Insurance',
    status: 'active',
    lastRun: '2025-12-04T07:15:00',
    signalsGenerated: 8,
    description: 'Analysis of Tower customer data for emerging trends, behaviour patterns, and market opportunities'
  },
  {
    id: '3',
    name: 'Insurance Media Scanner',
    type: 'media',
    client: 'Tower Insurance',
    status: 'active',
    lastRun: '2025-12-04T09:00:00',
    signalsGenerated: 15,
    description: 'Monitoring news, press releases, and media coverage related to insurance industry and competitors'
  },
  {
    id: '4',
    name: 'Geely Market Intelligence',
    type: 'market',
    client: 'Geely Group',
    status: 'active',
    lastRun: '2025-12-04T06:45:00',
    signalsGenerated: 6,
    description: 'Tracking automotive market trends, EV adoption rates, and competitor movements in APAC region'
  },
  {
    id: '5',
    name: 'Volvo Social Listening',
    type: 'social',
    client: 'Volvo',
    status: 'paused',
    lastRun: '2025-12-03T14:20:00',
    signalsGenerated: 22,
    description: 'Social media monitoring for brand sentiment, competitor campaigns, and emerging customer needs'
  }
];

const mockSignals: BriefSignal[] = [
  {
    id: '1',
    title: 'Competitor pricing drop creates retention opportunity',
    client: 'Tower Insurance',
    priority: 'high',
    signalsFound: [
      'AA Insurance reduced home insurance premiums by 8% for new customers',
      'State Insurance launched "Price Match Promise" campaign',
      'Tower customer churn increased 12% in renewal segment aged 35-50',
      'Social media shows 340% increase in mentions comparing Tower vs AA pricing'
    ],
    opportunity: 'Launch a proactive retention campaign targeting renewal customers with personalised pricing review and loyalty rewards. Create "We Value You" campaign emphasising Tower\'s superior claim service and customer care beyond just price.',
    sizeOfPrize: 'Estimated $1.2M revenue protection from preventing 450 policy cancellations + $380K from upsell opportunities',
    leadDepartments: ['Digital', 'CRM', 'Creative'],
    generatedDate: '2025-12-04T08:45:00',
    status: 'new',
    confidence: 94
  },
  {
    id: '2',
    title: 'EV charging anxiety creates content opportunity',
    client: 'Volvo',
    priority: 'high',
    signalsFound: [
      'Google search volume for "EV charging near me" up 156% in Q4',
      'Volvo customer survey shows 68% cite charging infrastructure as top concern',
      'Tesla launched charging network partnership campaign in NZ',
      'Media coverage of EV adoption barriers increased 89% month-over-month'
    ],
    opportunity: 'Create an educational content series "The Complete EV Charging Guide" positioning Volvo as the trusted advisor for EV ownership. Include interactive charging station map, cost calculators, and real customer stories.',
    sizeOfPrize: 'Estimated 18% increase in EV consideration among Volvo prospects (approx. 2,400 additional qualified leads worth $4.8M potential revenue)',
    leadDepartments: ['Content', 'Digital', 'Social'],
    generatedDate: '2025-12-04T07:30:00',
    status: 'new',
    confidence: 87
  },
  {
    id: '3',
    title: 'Young drivers seeking telematics discounts',
    client: 'Tower Insurance',
    priority: 'medium',
    signalsFound: [
      'Search volume for "telematics insurance NZ" increased 203% among 18-25 age group',
      'AMI launched driver behaviour app with up to 25% discount',
      'Tower data shows 89% of young driver quotes abandoned at premium stage',
      'TikTok trends show young drivers sharing insurance cost complaints'
    ],
    opportunity: 'Develop "Tower Drive" app-based telematics product specifically for young drivers with gamification, social sharing, and progressive discounts based on safe driving behaviour.',
    sizeOfPrize: '$680K from capturing 15% of young driver market segment currently going to competitors',
    leadDepartments: ['Digital', 'Product', 'Social'],
    generatedDate: '2025-12-03T16:20:00',
    status: 'reviewed',
    confidence: 82
  },
  {
    id: '4',
    title: 'Geely brand awareness gap in sustainability',
    client: 'Geely Group',
    priority: 'high',
    signalsFound: [
      'Geely achieved 45% reduction in manufacturing emissions but only 12% consumer awareness',
      'BYD sustainability campaign reached 18M impressions in APAC last month',
      'Search intent data shows "sustainable cars" searches up 178% but Geely appears in only 3% of results',
      'Industry report: 73% of car buyers now consider environmental impact in purchase decision'
    ],
    opportunity: 'Launch "Geely Green Future" integrated campaign showcasing tangible sustainability achievements, manufacturing innovation, and commitment to carbon neutrality. Position Geely as the accessible sustainable automotive choice.',
    sizeOfPrize: '$2.8M in additional brand value + estimated 8% market share growth in eco-conscious segment',
    leadDepartments: ['PR', 'Creative', 'Digital'],
    generatedDate: '2025-12-04T06:50:00',
    status: 'new',
    confidence: 91
  },
  {
    id: '5',
    title: 'Home insurance claims satisfaction opportunity',
    client: 'Tower Insurance',
    priority: 'low',
    signalsFound: [
      'Tower claims satisfaction rating 4.2/5 vs industry average 3.1/5',
      'Customer testimonials mention claims process 340 times positively',
      'No competitor currently promoting claims service quality in advertising',
      'Consumer Affairs data shows claims experience is #1 factor in insurance recommendations'
    ],
    opportunity: 'Create "Claims Stories" campaign featuring real Tower customers sharing their positive claims experiences. Build trust through authentic testimonials and transparent claims process showcase.',
    sizeOfPrize: '$420K from 8% improvement in conversion rate + estimated 15% increase in referrals',
    leadDepartments: ['Creative', 'Content', 'PR'],
    generatedDate: '2025-12-02T11:30:00',
    status: 'converted',
    confidence: 76
  }
];

interface SignalsProps {
  onBack: () => void;
}

export function Signals({ onBack }: SignalsProps) {
  const [selectedView, setSelectedView] = useState<'overview' | 'agents' | 'signals' | 'signalDetail' | 'agentDetail'>('overview');
  const [selectedSignal, setSelectedSignal] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [filterClient, setFilterClient] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const clients = ['all', ...Array.from(new Set(mockSignals.map(s => s.client)))];

  const filteredSignals = mockSignals.filter(signal => {
    if (filterClient !== 'all' && signal.client !== filterClient) return false;
    if (filterPriority !== 'all' && signal.priority !== filterPriority) return false;
    return true;
  });

  const getAgentIcon = (type: Agent['type']) => {
    switch (type) {
      case 'competitor': return Target;
      case 'client-data': return BarChart3;
      case 'media': return Globe;
      case 'social': return Users;
      case 'market': return TrendingUp;
      default: return Activity;
    }
  };

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
      {/* Signal Detail View */}
      {selectedView === 'signalDetail' && selectedSignal && (
        <SignalDetailPage
          signalId={selectedSignal}
          onBack={() => setSelectedView('signals')}
          onConvertToBrief={() => {
            // Handle conversion to brief
            console.log('Converting signal to brief...');
          }}
        />
      )}

      {/* Agent Detail View */}
      {selectedView === 'agentDetail' && selectedAgent && (
        <AgentDetailPage
          agentId={selectedAgent}
          onBack={() => setSelectedView('agents')}
          onViewSignal={(signalId) => {
            setSelectedSignal(signalId);
            setSelectedView('signalDetail');
          }}
        />
      )}

      {/* Show main UI only when not in detail views */}
      {selectedView !== 'signalDetail' && selectedView !== 'agentDetail' && (
        <>
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
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1>Signals</h1>
          </div>
          <p className="text-gray-600">
            AI-powered competitive intelligence and opportunity detection
          </p>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-white/80 rounded-xl border border-gray-200 w-fit">
        <button
          onClick={() => setSelectedView('overview')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            selectedView === 'overview'
              ? 'bg-yellow-400 text-black'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setSelectedView('signals')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            selectedView === 'signals'
              ? 'bg-yellow-400 text-black'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Brief Signals
        </button>
        <button
          onClick={() => setSelectedView('agents')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            selectedView === 'agents'
              ? 'bg-yellow-400 text-black'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Active Agents
        </button>
      </div>

      {/* Overview View */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-5 h-5 text-green-600" />
                <p className="text-sm text-gray-600">Active Agents</p>
              </div>
              <p className="text-3xl font-bold">{mockAgents.filter(a => a.status === 'active').length}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-purple-600" />
                <p className="text-sm text-gray-600">New Signals</p>
              </div>
              <p className="text-3xl font-bold">{mockSignals.filter(s => s.status === 'new').length}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-yellow-600" />
                <p className="text-sm text-gray-600">Total Opportunity Value</p>
              </div>
              <p className="text-3xl font-bold">$10.3M</p>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-gray-600">Avg. Confidence</p>
              </div>
              <p className="text-3xl font-bold">86%</p>
            </div>
          </div>

          {/* Recent High Priority Signals */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold">High Priority Signals</h3>
              <button
                onClick={() => setSelectedView('signals')}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {mockSignals.filter(s => s.priority === 'high' && s.status === 'new').map(signal => (
                <button
                  key={signal.id}
                  onClick={() => {
                    setSelectedSignal(signal.id);
                    setSelectedView('signalDetail');
                  }}
                  className="w-full text-left p-4 bg-gradient-to-r from-red-50 to-white rounded-xl border border-red-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-bold mb-1">{signal.title}</p>
                      <p className="text-sm text-gray-600 mb-2">{signal.client}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        {signal.confidence}% confidence
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{signal.opportunity}</p>
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-medium">{signal.sizeOfPrize}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Agents Summary */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold">Recently Active Agents</h3>
              <button
                onClick={() => setSelectedView('agents')}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mockAgents.slice(0, 4).map(agent => {
                const Icon = getAgentIcon(agent.type);
                return (
                  <div
                    key={agent.id}
                    className="p-4 bg-white/60 rounded-xl border border-gray-200"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm mb-1 truncate">{agent.name}</p>
                        <p className="text-xs text-gray-600">{agent.client}</p>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{agent.signalsGenerated} signals</span>
                      <span>{new Date(agent.lastRun).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Signals View */}
      {selectedView === 'signals' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-gray-200">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Client</label>
                <select
                  value={filterClient}
                  onChange={(e) => setFilterClient(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  {clients.map(client => (
                    <option key={client} value={client}>
                      {client === 'all' ? 'All Clients' : client}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Signals List */}
          <div className="space-y-4">
            {filteredSignals.map(signal => (
              <div
                key={signal.id}
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => {
                  setSelectedSignal(signal.id);
                  setSelectedView('signalDetail');
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold">{signal.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(signal.priority)}`}>
                        {signal.priority} priority
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(signal.status)}`}>
                        {signal.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <span className="font-medium">{signal.client}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(signal.generatedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="flex items-center gap-1 text-purple-600 font-medium">
                        <Zap className="w-4 h-4" />
                        {signal.confidence}% confidence
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-400 flex-shrink-0" />
                </div>

                {/* Signals Found */}
                <div className="mb-4">
                  <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Signals Detected
                  </h4>
                  <ul className="space-y-2">
                    {signal.signalsFound.map((sig, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        <span>{sig}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Opportunity */}
                <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    Marketing Opportunity
                  </h4>
                  <p className="text-sm text-gray-700">{signal.opportunity}</p>
                </div>

                {/* Size of Prize */}
                <div className="mb-4 p-4 bg-green-50 rounded-xl border border-green-200">
                  <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    Size of Prize
                  </h4>
                  <p className="text-sm text-gray-700 font-medium">{signal.sizeOfPrize}</p>
                </div>

                {/* Lead Departments */}
                <div className="mb-4">
                  <h4 className="font-bold text-sm mb-2">Recommended Lead Departments</h4>
                  <div className="flex flex-wrap gap-2">
                    {signal.leadDepartments.map((dept, idx) => (
                      <span key={idx} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button className="flex-1 px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors font-medium flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    Convert to Brief
                  </button>
                  <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Mark as Reviewed
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agents View */}
      {selectedView === 'agents' && (
        <div className="space-y-4">
          {mockAgents.map(agent => {
            const Icon = getAgentIcon(agent.type);
            return (
              <div
                key={agent.id}
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => {
                  setSelectedAgent(agent.id);
                  setSelectedView('agentDetail');
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold">{agent.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          agent.status === 'active' ? 'bg-green-100 text-green-700' :
                          agent.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {agent.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{agent.client}</p>
                      <p className="text-sm text-gray-700">{agent.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-400 flex-shrink-0" />
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-600 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Last run: {new Date(agent.lastRun).toLocaleString('en-GB', { 
                      day: 'numeric', 
                      month: 'short', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <span className="font-medium">{agent.signalsGenerated} signals generated</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add New Agent */}
          <button className="w-full p-6 bg-white/80 backdrop-blur-xl rounded-2xl border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50/30 transition-all">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <span className="font-medium text-gray-700">Configure New Agent</span>
            </div>
          </button>
        </div>
      )}
        </>
      )}
    </div>
  );
}