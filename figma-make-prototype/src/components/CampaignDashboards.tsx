import { useState } from 'react';
import { 
  TrendingUp, Users, MousePointerClick, Eye, Share2, FileText, 
  Activity, ArrowUpRight, ArrowDownRight, ArrowLeft, Calendar,
  Target, DollarSign, BarChart3, Filter, Download
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

interface Campaign {
  id: string;
  name: string;
  client: string;
  type: 'digital' | 'pr' | 'social';
  status: 'live' | 'paused';
  startDate: string;
  budget: number;
  spent: number;
  metrics: {
    views?: number;
    clicks?: number;
    engagement?: number;
    conversions?: number;
    mediaOutreach?: number;
    storiesPickedUp?: number;
    reach?: number;
    impressions?: number;
    ctr?: number;
    cpc?: number;
    cpa?: number;
  };
  trends: {
    views?: number;
    clicks?: number;
    engagement?: number;
    conversions?: number;
  };
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Sustainable Product Launch',
    client: 'Acme Corporation',
    type: 'digital',
    status: 'live',
    startDate: '2025-11-15',
    budget: 150000,
    spent: 89450,
    metrics: {
      views: 245680,
      clicks: 12450,
      engagement: 8.2,
      conversions: 1842,
      impressions: 892340,
      ctr: 5.07,
      cpc: 7.19,
      cpa: 48.58
    },
    trends: {
      views: 12.5,
      clicks: 18.3,
      engagement: -2.1,
      conversions: 24.7
    }
  },
  {
    id: '2',
    name: 'SaaS Platform Awareness',
    client: 'TechStart Inc',
    type: 'social',
    status: 'live',
    startDate: '2025-10-01',
    budget: 85000,
    spent: 72340,
    metrics: {
      views: 892340,
      clicks: 45230,
      engagement: 12.4,
      impressions: 1250000,
      conversions: 3421,
      ctr: 3.62,
      cpc: 1.60,
      cpa: 21.15
    },
    trends: {
      views: 8.7,
      clicks: 15.2,
      engagement: 4.3,
      conversions: 9.1
    }
  },
  {
    id: '3',
    name: 'Organic Snack Line PR',
    client: 'GreenLife Foods',
    type: 'pr',
    status: 'live',
    startDate: '2025-11-20',
    budget: 45000,
    spent: 28900,
    metrics: {
      mediaOutreach: 87,
      storiesPickedUp: 23,
      reach: 3450000,
      views: 456780
    },
    trends: {
      views: 31.2,
      clicks: 22.8
    }
  }
];

// Mock time series data
const generateTimeSeriesData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, idx) => ({
    name: day,
    views: Math.floor(35000 + Math.random() * 15000),
    clicks: Math.floor(1500 + Math.random() * 800),
    conversions: Math.floor(200 + Math.random() * 150),
    engagement: 6 + Math.random() * 4
  }));
};

const deviceData = [
  { name: 'Mobile', value: 58, color: '#FFCA05' },
  { name: 'Desktop', value: 32, color: '#000000' },
  { name: 'Tablet', value: 10, color: '#999999' }
];

const channelPerformanceData = [
  { channel: 'Paid Search', impressions: 342000, clicks: 8520, conversions: 456 },
  { channel: 'Social Media', impressions: 298000, clicks: 12340, conversions: 678 },
  { channel: 'Display Ads', impressions: 186000, clicks: 3280, conversions: 234 },
  { channel: 'Email', impressions: 66340, clicks: 4230, conversions: 474 }
];

const geographicData = [
  { location: 'London', users: 12340, conversions: 456 },
  { location: 'Manchester', users: 8920, conversions: 342 },
  { location: 'Birmingham', users: 6780, conversions: 289 },
  { location: 'Leeds', users: 5430, conversions: 234 },
  { location: 'Glasgow', users: 4560, conversions: 198 }
];

interface CampaignDashboardsProps {
  onBack: () => void;
}

export function CampaignDashboards({ onBack }: CampaignDashboardsProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [dateRange, setDateRange] = useState('7d');
  const timeSeriesData = generateTimeSeriesData();

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatCurrency = (num: number) => {
    return `£${formatNumber(num)}`;
  };

  const renderMetricCard = (
    label: string, 
    value: number | undefined, 
    trend: number | undefined, 
    icon: React.ReactNode, 
    isPercentage = false,
    isCurrency = false
  ) => {
    if (value === undefined) return null;

    return (
      <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="text-gray-600 text-xs uppercase tracking-wide font-medium">{label}</div>
          <div className="text-gray-300">{icon}</div>
        </div>
        <div className="flex items-end justify-between">
          <div className="font-bold text-3xl text-gray-900">
            {isCurrency ? formatCurrency(value) : isPercentage ? `${value}%` : formatNumber(value)}
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {Math.abs(trend).toFixed(1)}%
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="pb-8">
      {/* Page Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2">Campaign Dashboards</h1>
            <p className="text-gray-600">Live performance tracking and analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {selectedCampaign ? (
        <div className="space-y-6">
          {/* Campaign Header */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">{selectedCampaign.name}</h2>
                <p className="text-gray-600 mb-3">{selectedCampaign.client}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Started: {new Date(selectedCampaign.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Budget: {formatCurrency(selectedCampaign.budget)}
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Spent: {formatCurrency(selectedCampaign.spent)} ({((selectedCampaign.spent / selectedCampaign.budget) * 100).toFixed(1)}%)
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  selectedCampaign.status === 'live' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-gray-50 text-gray-700 border border-gray-200'
                }`}>
                  {selectedCampaign.status === 'live' ? '● Live' : '⏸ Paused'}
                </span>
                <span className="px-4 py-2 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg text-sm font-medium capitalize">
                  {selectedCampaign.type}
                </span>
              </div>
            </div>

            {/* Budget Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>Budget Utilisation</span>
                <span>{((selectedCampaign.spent / selectedCampaign.budget) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div 
                  className="bg-yellow-400 h-2.5 rounded-full transition-all" 
                  style={{ width: `${(selectedCampaign.spent / selectedCampaign.budget) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Date Range Selector */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700 mr-3">Date Range:</span>
              <div className="flex gap-2">
                {['7d', '14d', '30d', '90d'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
                      dateRange === range
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {range === '7d' ? 'Last 7 Days' : range === '14d' ? 'Last 14 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {selectedCampaign.type === 'pr' ? (
              <>
                {renderMetricCard('Media Outreach', selectedCampaign.metrics.mediaOutreach, undefined, <FileText className="w-5 h-5" />)}
                {renderMetricCard('Stories Picked Up', selectedCampaign.metrics.storiesPickedUp, undefined, <Activity className="w-5 h-5" />)}
                {renderMetricCard('Total Reach', selectedCampaign.metrics.reach, selectedCampaign.trends.clicks, <Users className="w-5 h-5" />)}
                {renderMetricCard('Views', selectedCampaign.metrics.views, selectedCampaign.trends.views, <Eye className="w-5 h-5" />)}
              </>
            ) : (
              <>
                {renderMetricCard('Impressions', selectedCampaign.metrics.impressions, selectedCampaign.trends.views, <Eye className="w-5 h-5" />)}
                {renderMetricCard('Clicks', selectedCampaign.metrics.clicks, selectedCampaign.trends.clicks, <MousePointerClick className="w-5 h-5" />)}
                {renderMetricCard('Conversions', selectedCampaign.metrics.conversions, selectedCampaign.trends.conversions, <Share2 className="w-5 h-5" />)}
                {renderMetricCard('Engagement Rate', selectedCampaign.metrics.engagement, selectedCampaign.trends.engagement, <TrendingUp className="w-5 h-5" />, true)}
              </>
            )}
          </div>

          {/* Secondary Metrics */}
          {selectedCampaign.type !== 'pr' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderMetricCard('CTR', selectedCampaign.metrics.ctr, undefined, <BarChart3 className="w-5 h-5" />, true)}
              {renderMetricCard('CPC', selectedCampaign.metrics.cpc, undefined, <DollarSign className="w-5 h-5" />, false, true)}
              {renderMetricCard('CPA', selectedCampaign.metrics.cpa, undefined, <Target className="w-5 h-5" />, false, true)}
            </div>
          )}

          {/* Performance Over Time Chart */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Performance Over Time</h3>
              <div className="flex gap-2">
                <span className="text-xs px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-md flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                  Views
                </span>
                <span className="text-xs px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md flex items-center gap-2">
                  <div className="w-3 h-3 bg-black rounded-full" />
                  Clicks
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFCA05" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FFCA05" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000000" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#999" style={{ fontSize: '12px' }} />
                <YAxis stroke="#999" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Area type="monotone" dataKey="views" stroke="#FFCA05" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                <Area type="monotone" dataKey="clicks" stroke="#000000" strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Two Column Layout for Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Channel Performance */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg mb-6">Channel Performance</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={channelPerformanceData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" stroke="#999" style={{ fontSize: '12px' }} />
                  <YAxis type="category" dataKey="channel" stroke="#999" style={{ fontSize: '12px' }} width={100} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }} 
                  />
                  <Bar dataKey="clicks" fill="#FFCA05" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Device Breakdown */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg mb-6">Device Breakdown</h3>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {deviceData.map((device) => (
                  <div key={device.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: device.color }} />
                    <span className="text-sm text-gray-700">{device.name}: {device.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Geographic Performance */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h3 className="font-bold text-lg mb-6">Geographic Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wide font-medium text-gray-600">Location</th>
                    <th className="text-right py-3 px-4 text-xs uppercase tracking-wide font-medium text-gray-600">Users</th>
                    <th className="text-right py-3 px-4 text-xs uppercase tracking-wide font-medium text-gray-600">Conversions</th>
                    <th className="text-right py-3 px-4 text-xs uppercase tracking-wide font-medium text-gray-600">Conversion Rate</th>
                    <th className="py-3 px-4 text-xs uppercase tracking-wide font-medium text-gray-600">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {geographicData.map((location, idx) => {
                    const convRate = ((location.conversions / location.users) * 100).toFixed(2);
                    return (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{location.location}</td>
                        <td className="py-3 px-4 text-right text-gray-700">{formatNumber(location.users)}</td>
                        <td className="py-3 px-4 text-right text-gray-700">{location.conversions}</td>
                        <td className="py-3 px-4 text-right text-gray-700">{convRate}%</td>
                        <td className="py-3 px-4">
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div 
                              className="bg-yellow-400 h-2 rounded-full" 
                              style={{ width: `${parseFloat(convRate) * 10}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h3 className="font-bold text-lg mb-6">Conversion Funnel</h3>
            <div className="space-y-4">
              {[
                { stage: 'Impressions', value: selectedCampaign.metrics.impressions || 0, percentage: 100 },
                { stage: 'Clicks', value: selectedCampaign.metrics.clicks || 0, percentage: 5.07 },
                { stage: 'Engaged Users', value: Math.floor((selectedCampaign.metrics.clicks || 0) * 0.42), percentage: 2.13 },
                { stage: 'Conversions', value: selectedCampaign.metrics.conversions || 0, percentage: 0.75 }
              ].map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.stage}</span>
                    <span className="text-sm text-gray-600">{formatNumber(item.value)} ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-10 relative overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-10 rounded-full flex items-center justify-end pr-4 transition-all" 
                      style={{ width: `${item.percentage * 10}%` }}
                    >
                      <span className="text-xs font-medium text-gray-900">{item.percentage}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setSelectedCampaign(null)}
            className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            ← Back to All Campaigns
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {mockCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              onClick={() => setSelectedCampaign(campaign)}
              className="bg-white rounded-lg p-6 border border-gray-200 cursor-pointer hover:shadow-lg transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg mb-1 group-hover:text-yellow-600 transition-colors">
                    {campaign.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{campaign.client}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                  campaign.status === 'live' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-gray-50 text-gray-700 border border-gray-200'
                }`}>
                  {campaign.status === 'live' ? '● Live' : '⏸'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {campaign.type === 'pr' ? (
                  <>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <div className="text-xs text-gray-600 mb-1">Media Outreach</div>
                      <div className="font-bold text-lg">{campaign.metrics.mediaOutreach}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <div className="text-xs text-gray-600 mb-1">Stories</div>
                      <div className="font-bold text-lg">{campaign.metrics.storiesPickedUp}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <div className="text-xs text-gray-600 mb-1">Impressions</div>
                      <div className="font-bold text-lg">{formatNumber(campaign.metrics.impressions || 0)}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <div className="text-xs text-gray-600 mb-1">Conversions</div>
                      <div className="font-bold text-lg">{formatNumber(campaign.metrics.conversions || 0)}</div>
                    </div>
                  </>
                )}
              </div>

              {/* Mini sparkline or trend indicator */}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Budget: {formatCurrency(campaign.budget)}</span>
                  <span className="text-gray-600">{((campaign.spent / campaign.budget) * 100).toFixed(0)}% spent</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                  <div 
                    className="bg-yellow-400 h-1.5 rounded-full" 
                    style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
