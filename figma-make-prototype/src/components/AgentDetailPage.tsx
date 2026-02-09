import { useState } from 'react';
import { ArrowLeft, Activity, Target, BarChart3, Globe, Users, TrendingUp, Zap, CheckCircle2, Clock, Settings, Play, Pause, AlertCircle, Calendar, LineChart, Download } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  type: 'competitor' | 'client-data' | 'media' | 'social' | 'market';
  client: string;
  status: 'active' | 'paused' | 'complete';
  lastRun: string;
  signalsGenerated: number;
  description: string;
  configuration: {
    frequency: string;
    dataSource: string;
    parameters: Record<string, string>;
  };
  performance: {
    totalRuns: number;
    successRate: number;
    avgConfidence: number;
    avgProcessingTime: string;
  };
  recentActivity: {
    date: string;
    action: string;
    result: string;
    signalsFound: number;
  }[];
  generatedSignals: {
    id: string;
    title: string;
    priority: 'high' | 'medium' | 'low';
    confidence: number;
    date: string;
    status: 'new' | 'reviewed' | 'converted';
  }[];
}

interface AgentDetailPageProps {
  agentId: string;
  onBack: () => void;
  onViewSignal?: (signalId: string) => void;
}

const mockAgentData: Record<string, Agent> = {
  '1': {
    id: '1',
    name: 'Tower Competitor Pricing Monitor',
    type: 'competitor',
    client: 'Tower Insurance',
    status: 'active',
    lastRun: '2025-12-04T08:30:00',
    signalsGenerated: 12,
    description: 'Daily monitoring of competitor insurance quotes across multiple product lines and customer profiles. Tracks pricing changes, promotional campaigns, and market positioning strategies from 15 major insurance competitors in the New Zealand market.',
    configuration: {
      frequency: 'Daily at 08:00 NZST',
      dataSource: 'Competitor Websites, Price Comparison APIs',
      parameters: {
        'Competitors Monitored': '15 (AA, State, AMI, Vero, etc.)',
        'Products Tracked': 'Home, Contents, Vehicle, Life Insurance',
        'Customer Profiles': '12 demographic segments',
        'Pricing Variables': 'Base premium, discounts, bundling offers',
        'Alert Threshold': 'Price changes > 5% or new promotions'
      }
    },
    performance: {
      totalRuns: 847,
      successRate: 99.4,
      avgConfidence: 91,
      avgProcessingTime: '3m 24s'
    },
    recentActivity: [
      {
        date: '2025-12-04T08:30:00',
        action: 'Daily pricing scan completed',
        result: 'Detected AA Insurance 8% premium reduction',
        signalsFound: 3
      },
      {
        date: '2025-12-03T08:30:00',
        action: 'Daily pricing scan completed',
        result: 'State Insurance new Price Match campaign detected',
        signalsFound: 2
      },
      {
        date: '2025-12-02T08:30:00',
        action: 'Daily pricing scan completed',
        result: 'AMI increased digital ad spend',
        signalsFound: 1
      },
      {
        date: '2025-12-01T08:30:00',
        action: 'Daily pricing scan completed',
        result: 'No significant changes detected',
        signalsFound: 0
      },
      {
        date: '2025-11-30T08:30:00',
        action: 'Daily pricing scan completed',
        result: 'Vero launched new customer referral programme',
        signalsFound: 2
      }
    ],
    generatedSignals: [
      {
        id: '1',
        title: 'Competitor pricing drop creates retention opportunity',
        priority: 'high',
        confidence: 94,
        date: '2025-12-04T08:45:00',
        status: 'new'
      },
      {
        id: 'sig-2',
        title: 'State Insurance price match campaign gaining traction',
        priority: 'high',
        confidence: 88,
        date: '2025-12-03T09:15:00',
        status: 'reviewed'
      },
      {
        id: 'sig-3',
        title: 'Competitor bundling offers increasing market share',
        priority: 'medium',
        confidence: 82,
        date: '2025-12-01T08:50:00',
        status: 'reviewed'
      },
      {
        id: 'sig-4',
        title: 'AMI referral programme shows strong early adoption',
        priority: 'medium',
        confidence: 79,
        date: '2025-11-28T09:20:00',
        status: 'converted'
      }
    ]
  },
  '2': {
    id: '2',
    name: 'Tower Customer Data Analysis',
    type: 'client-data',
    client: 'Tower Insurance',
    status: 'active',
    lastRun: '2025-12-04T07:15:00',
    signalsGenerated: 8,
    description: 'Analysis of Tower customer data for emerging trends, behaviour patterns, and market opportunities. Processes customer interactions, claims data, policy changes, and satisfaction metrics to identify actionable insights.',
    configuration: {
      frequency: 'Daily at 07:00 NZST',
      dataSource: 'Tower CRM, Claims Database, Customer Surveys',
      parameters: {
        'Data Sources': 'CRM, Claims, NPS, Support Tickets',
        'Analysis Types': 'Churn prediction, satisfaction trends, product uptake',
        'Customer Segments': '8 segments by demographics and value',
        'Metrics Tracked': 'NPS, churn rate, lifetime value, satisfaction',
        'Alert Threshold': 'Trend changes > 10% or NPS drops > 5 points'
      }
    },
    performance: {
      totalRuns: 723,
      successRate: 98.9,
      avgConfidence: 87,
      avgProcessingTime: '5m 12s'
    },
    recentActivity: [
      {
        date: '2025-12-04T07:15:00',
        action: 'Customer data analysis completed',
        result: 'Churn increase detected in 35-50 age segment',
        signalsFound: 2
      },
      {
        date: '2025-12-03T07:15:00',
        action: 'Customer data analysis completed',
        result: 'NPS score drop in renewal customers',
        signalsFound: 1
      },
      {
        date: '2025-12-02T07:15:00',
        action: 'Customer data analysis completed',
        result: 'Increased support enquiries about pricing',
        signalsFound: 2
      },
      {
        date: '2025-12-01T07:15:00',
        action: 'Customer data analysis completed',
        result: 'No significant anomalies detected',
        signalsFound: 0
      }
    ],
    generatedSignals: [
      {
        id: 'sig-5',
        title: 'Renewal customer satisfaction declining',
        priority: 'high',
        confidence: 89,
        date: '2025-12-04T07:30:00',
        status: 'new'
      },
      {
        id: 'sig-6',
        title: 'Young driver segment shows pricing sensitivity',
        priority: 'medium',
        confidence: 85,
        date: '2025-12-02T07:45:00',
        status: 'reviewed'
      }
    ]
  }
};

export function AgentDetailPage({ agentId, onBack, onViewSignal }: AgentDetailPageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'configuration' | 'performance' | 'signals'>('overview');
  const [isEditingConfig, setIsEditingConfig] = useState(false);

  const agent = mockAgentData[agentId] || mockAgentData['1'];

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

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getStatusColor = (status: 'new' | 'reviewed' | 'converted') => {
    switch (status) {
      case 'new': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'converted': return 'bg-green-100 text-green-800';
    }
  };

  const Icon = getAgentIcon(agent.type);

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
            <div className="flex items-start gap-4 flex-1">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{agent.name}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    agent.status === 'active' ? 'bg-green-100 text-green-700' :
                    agent.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {agent.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{agent.client}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{agent.description}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configure
              </button>
              {agent.status === 'active' ? (
                <button className="px-4 py-2 bg-yellow-100 border border-yellow-300 rounded-lg hover:bg-yellow-200 transition-colors font-medium flex items-center gap-2 text-yellow-800">
                  <Pause className="w-4 h-4" />
                  Pause Agent
                </button>
              ) : (
                <button className="px-4 py-2 bg-green-100 border border-green-300 rounded-lg hover:bg-green-200 transition-colors font-medium flex items-center gap-2 text-green-800">
                  <Play className="w-4 h-4" />
                  Resume Agent
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-700">{agent.signalsGenerated}</p>
              <p className="text-sm text-gray-600">Signals Generated</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-700">{agent.performance.successRate}%</p>
              <p className="text-sm text-gray-600">Success Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-700">{agent.performance.avgConfidence}%</p>
              <p className="text-sm text-gray-600">Avg. Confidence</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-700">{agent.performance.totalRuns}</p>
              <p className="text-sm text-gray-600">Total Runs</p>
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
          onClick={() => setActiveTab('configuration')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'configuration'
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Configuration
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'performance'
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Performance
        </button>
        <button
          onClick={() => setActiveTab('signals')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'signals'
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Generated Signals
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Last Run Info */}
          <div className="bg-gradient-to-br from-green-50 to-white/80 backdrop-blur-xl rounded-2xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold mb-1">Last Run</h3>
                <p className="text-sm text-gray-600">
                  {new Date(agent.lastRun).toLocaleString('en-GB', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <span className="font-medium text-green-700">Completed Successfully</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                Recent Activity
              </h3>
              <button className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
                <Download className="w-4 h-4" />
                Export Activity Log
              </button>
            </div>
            <div className="space-y-3">
              {agent.recentActivity.map((activity, idx) => (
                <div key={idx} className="p-4 bg-gradient-to-r from-purple-50 to-white rounded-xl border border-purple-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      <span className="font-medium text-sm">{activity.action}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(activity.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{activity.result}</p>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <span className="text-xs text-purple-700 font-medium">
                      {activity.signalsFound} {activity.signalsFound === 1 ? 'signal' : 'signals'} found
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Signals */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              Recent Signals Generated
            </h3>
            <div className="space-y-3">
              {agent.generatedSignals.slice(0, 3).map((signal) => (
                <button
                  key={signal.id}
                  onClick={() => onViewSignal?.(signal.id)}
                  className="w-full text-left p-4 bg-gradient-to-r from-yellow-50 to-white rounded-xl border border-yellow-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(signal.priority)}`}>
                          {signal.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(signal.status)}`}>
                          {signal.status}
                        </span>
                      </div>
                      <p className="font-medium text-sm mb-1">{signal.title}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(signal.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      {signal.confidence}% confidence
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Configuration Tab */}
      {activeTab === 'configuration' && (
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                Agent Configuration
              </h3>
              <button
                onClick={() => setIsEditingConfig(!isEditingConfig)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                {isEditingConfig ? 'Save Changes' : 'Edit Configuration'}
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">Run Frequency</label>
                <input
                  type="text"
                  value={agent.configuration.frequency}
                  disabled={!isEditingConfig}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-50"
                />
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Source</label>
                <input
                  type="text"
                  value={agent.configuration.dataSource}
                  disabled={!isEditingConfig}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-50"
                />
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-200">
                <h4 className="font-bold text-sm mb-3">Parameters</h4>
                <div className="space-y-3">
                  {Object.entries(agent.configuration.parameters).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{key}</label>
                      <input
                        type="text"
                        value={value}
                        disabled={!isEditingConfig}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-50"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {isEditingConfig && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-sm text-yellow-900">
                  <strong>⚠️ Warning:</strong> Changes to agent configuration will take effect on the next scheduled run. Modifying data sources or parameters may temporarily affect signal quality.
                </p>
              </div>
            )}
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
            <h3 className="font-bold mb-4">Schedule Next Run</h3>
            <div className="flex items-center gap-4">
              <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2">
                <Play className="w-5 h-5" />
                Run Now
              </button>
              <p className="text-sm text-gray-600">
                Next scheduled run: {new Date(new Date(agent.lastRun).getTime() + 24 * 60 * 60 * 1000).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <LineChart className="w-5 h-5 text-purple-600" />
                Performance Metrics
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Total Runs</span>
                    <span className="text-2xl font-bold text-purple-700">{agent.performance.totalRuns}</span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <span className="text-2xl font-bold text-green-700">{agent.performance.successRate}%</span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${agent.performance.successRate}%` }}></div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Avg. Confidence</span>
                    <span className="text-2xl font-bold text-blue-700">{agent.performance.avgConfidence}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${agent.performance.avgConfidence}%` }}></div>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg. Processing Time</span>
                    <span className="text-xl font-bold text-orange-700">{agent.performance.avgProcessingTime}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Signal Output
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-gradient-to-r from-red-50 to-white rounded-xl border border-red-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">High Priority Signals</span>
                    <span className="text-2xl font-bold text-red-700">
                      {agent.generatedSignals.filter(s => s.priority === 'high').length}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-yellow-50 to-white rounded-xl border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Medium Priority Signals</span>
                    <span className="text-2xl font-bold text-yellow-700">
                      {agent.generatedSignals.filter(s => s.priority === 'medium').length}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Low Priority Signals</span>
                    <span className="text-2xl font-bold text-blue-700">
                      {agent.generatedSignals.filter(s => s.priority === 'low').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
            <h3 className="font-bold mb-4">Performance Trends</h3>
            <div className="h-64 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-200 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                <p className="text-gray-500">Performance chart visualization would appear here</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signals Tab */}
      {activeTab === 'signals' && (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
          <h3 className="font-bold mb-6">All Generated Signals ({agent.generatedSignals.length})</h3>
          <div className="space-y-3">
            {agent.generatedSignals.map((signal) => (
              <button
                key={signal.id}
                onClick={() => onViewSignal?.(signal.id)}
                className="w-full text-left p-5 bg-gradient-to-r from-purple-50 to-white rounded-xl border border-purple-200 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
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
                    <p className="font-bold text-gray-900 mb-1">{signal.title}</p>
                    <p className="text-sm text-gray-600">
                      Generated {new Date(signal.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
