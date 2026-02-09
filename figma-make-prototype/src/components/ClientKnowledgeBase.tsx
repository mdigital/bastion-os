import { useState } from 'react';
import { ArrowLeft, Plus, MoreVertical, Check, Send, Sparkles, FileText, Zap, BarChart3, PieChart, Presentation, Network, X, Download } from 'lucide-react';

interface ClientKnowledgeBaseProps {
  clientId: string;
  clientName: string;
  onBack: () => void;
}

interface Source {
  id: string;
  name: string;
  type: 'pdf' | 'doc';
  selected: boolean;
}

export function ClientKnowledgeBase({ clientId, clientName, onBack }: ClientKnowledgeBaseProps) {
  const [sources, setSources] = useState<Source[]>([
    { id: '1', name: '79yv1V_NEW ZEALAND_GiLAi.pdf', type: 'pdf', selected: true },
    { id: '2', name: 'Advertising Services Agreement - Bastion S...', type: 'pdf', selected: true },
    { id: '3', name: 'GEELY HOLDING (2).pdf', type: 'pdf', selected: true },
    { id: '4', name: 'NordEast Workshop 19NOV25.pdf', type: 'pdf', selected: true },
    { id: '5', name: 'NordEast_Contact Report.pdf', type: 'pdf', selected: true },
    { id: '6', name: 'Polestar-Brand-Presentation.pdf', type: 'pdf', selected: true },
    { id: '7', name: 'Review of advertisement.pdf', type: 'pdf', selected: true },
    { id: '8', name: 'VCNZ Strategic Framework.pdf', type: 'pdf', selected: true },
    { id: '9', name: 'Volvo Brand Study Report N2 2024_Q4_press...', type: 'pdf', selected: true }
  ]);

  const [activeTab, setActiveTab] = useState<'chat' | 'sources'>('chat');
  const [chatInput, setChatInput] = useState('');
  const [selectAllSources, setSelectAllSources] = useState(true);

  const promptSuggestions = [
    { 
      id: 'summary', 
      label: 'Summarise key goals', 
      prompt: 'Can you summarise the key goals and objectives for this client based on the selected sources?',
      icon: FileText, 
      color: 'text-purple-600' 
    },
    { 
      id: 'competitors', 
      label: 'Competitor analysis', 
      prompt: 'Provide a detailed competitor analysis for this client, including market positioning and key differentiators based on the available documents.',
      icon: BarChart3, 
      color: 'text-green-600' 
    },
    { 
      id: 'target', 
      label: 'Target audience', 
      prompt: 'What are the target audience insights and demographics for this client? Include psychographic and behavioural characteristics.',
      icon: Network, 
      color: 'text-pink-600' 
    },
    { 
      id: 'timeline', 
      label: 'Campaign timeline', 
      prompt: 'Extract and organise all key dates, milestones, and campaign timelines mentioned in the client documents.',
      icon: Presentation, 
      color: 'text-yellow-600' 
    },
    { 
      id: 'challenges', 
      label: 'Key challenges', 
      prompt: 'What are the main challenges and pain points facing this client based on the available information?',
      icon: Zap, 
      color: 'text-red-600' 
    },
    { 
      id: 'recommendations', 
      label: 'Strategy ideas', 
      prompt: 'Based on the client documents, provide strategic recommendations for campaign approaches and creative directions.',
      icon: Sparkles, 
      color: 'text-blue-600' 
    },
    { 
      id: 'brand', 
      label: 'Brand positioning', 
      prompt: 'Analyse the brand positioning, tone of voice, and brand guidelines from the selected sources.',
      icon: PieChart, 
      color: 'text-purple-600' 
    },
    { 
      id: 'budget', 
      label: 'Budget info', 
      prompt: 'Extract budget information, resource allocations, and financial constraints mentioned in the client materials.',
      icon: FileText, 
      color: 'text-orange-600' 
    }
  ];

  const handlePromptClick = (prompt: string) => {
    setChatInput(prompt);
  };

  const toggleSource = (id: string) => {
    setSources(sources.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
  };

  const toggleSelectAll = () => {
    const newValue = !selectAllSources;
    setSelectAllSources(newValue);
    setSources(sources.map(s => ({ ...s, selected: newValue })));
  };

  const removeSource = (id: string) => {
    setSources(sources.filter(s => s.id !== id));
  };

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      // Handle sending message
      console.log('Sending message:', chatInput);
      setChatInput('');
    }
  };

  const handleExportResponse = () => {
    // Get the AI response content
    const responseContent = `AI Response - ${clientName}
Generated: ${new Date().toLocaleString('en-NZ', { dateStyle: 'medium', timeStyle: 'short' })}
Sources: ${sources.filter(s => s.selected).length} documents

---

To achieve this, the focus needs to be on:

• Exclusivity and Elite Status: The brand world should make customers feel Elite ("I'm in an exclusive club/league") 🏆 

a. Concede proposed to reinforce this feeling include exclusive access, designing a state-of-the-art car wash for prized supercars (free for Polestar drivers), or a Michelin Star/fine dining drive-through experience designed for supercars 🍽️

• Performance and Precision: Polestar is defined as an electric performance brand driven by pure, progressive design 📐 🚗 ✨

3. Tactical and Operational Actions

The repositioning effort is supported by planned actions:

• Model-Based Relaunch: The Polestar 5 model is intended to be used as a "reset moment" or relaunch point, with attention towards the Polestar 4 🔄 📅. The launch is scheduled for February 2026 🗓️

---

Sources Used:
${sources.filter(s => s.selected).map(s => `• ${s.name}`).join('\n')}`;

    // Create a blob and download
    const blob = new Blob([responseContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${clientName.replace(/\s+/g, '_')}_AI_Response_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Client Overview Header Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Clients</span>
            </button>
            <div className="w-px h-6 bg-gray-300"></div>
            <div>
              <h2 className="font-bold text-xl">{clientName}</h2>
              <p className="text-sm text-gray-600">Automotive Industry</p>
            </div>
          </div>
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="flex min-h-[600px] max-h-[calc(100vh-500px)] gap-4 mb-8">
        {/* Left Sidebar - Sources */}
        <div className="w-64 bg-white rounded-xl border border-gray-200 flex flex-col">
          {/* Sources Section */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-sm mb-2">Sources</h3>
            <p className="text-xs text-gray-600 mb-3">{sources.length} documents</p>
            <button className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" />
              Add sources
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <button
              onClick={toggleSelectAll}
              className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between mb-2"
            >
              <span>Select all sources</span>
              <Check className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              {sources.map(source => (
                <div
                  key={source.id}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <div 
                    className="w-4 h-4 flex items-center justify-center cursor-pointer"
                    onClick={() => toggleSource(source.id)}
                  >
                    {source.selected && <Check className="w-4 h-4 text-black" />}
                  </div>
                  <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="truncate text-xs flex-1">{source.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSource(source.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
                  >
                    <X className="w-3 h-3 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Section - Chat */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col">
          {/* Chat Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'chat' && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 mb-4">
                    To achieve this, the focus needs to be on:
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>• Exclusivity and Elite Status:</strong> The brand world should make customers feel <strong>Elite</strong> ("I'm in an exclusive club/league") 🏆 
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>a. Concede proposed</strong> to reinforce this feeling include exclusive access, designing a state-of-the-art car wash for prized supercars (free for Polestar drivers), or a Michelin Star/fine dining drive-through experience designed for supercars 🍽️
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>• Performance and Precision:</strong> Polestar is defined as an electric performance brand driven by pure, progressive design 📐 🚗 ✨
                  </p>
                  <p className="text-gray-700">
                    <strong>3. Tactical and Operational Actions</strong>
                  </p>
                  <p className="text-gray-700 mt-4">
                    The repositioning effort is supported by planned actions:
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>• Model-Based Relaunch:</strong> The Polestar 5 model is intended to be used as a "reset moment" or relaunch point, with attention towards the Polestar 4 🔄 📅. The launch is scheduled for February 2026 🗓️
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Today • 10:43 AM</span>
                  <button
                    onClick={handleExportResponse}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Response</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'sources' && (
              <div className="space-y-4">
                {sources.filter(s => s.selected).map(source => (
                  <div key={source.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium">{source.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Document content preview would appear here...
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Start typing..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {sources.filter(s => s.selected).length} sources
            </p>
          </div>
        </div>

        {/* Right Sidebar - Prompt Suggestions */}
        <div className="w-80">
          {/* Prompt Suggestions Panel */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-bold mb-4">Prompt Suggestions</h3>
            <div className="grid grid-cols-2 gap-2">
              {promptSuggestions.map(suggestion => {
                const Icon = suggestion.icon;
                return (
                  <button
                    key={suggestion.id}
                    onClick={() => handlePromptClick(suggestion.prompt)}
                    className="flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-400 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-100 transition-colors">
                      <Icon className={`w-4 h-4 ${suggestion.color}`} />
                    </div>
                    <span className="text-xs text-center leading-tight">{suggestion.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}