import { X, Home, FileText, BookOpen, LogOut, Shield } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onNavigate: (view: 'home' | 'listing' | 'knowledgeBase' | 'admin') => void;
  onLogout?: () => void;
}

export function HamburgerMenu({ isOpen, onClose, currentView, onNavigate, onLogout }: HamburgerMenuProps) {
  if (!isOpen) return null;

  const mainItems = [
    { id: 'home', label: 'Home', icon: Home, view: 'home' as const },
  ];

  const situationItems = [
    { id: 'briefs', label: 'Client Briefs', icon: FileText, view: 'listing' as const },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen, view: 'knowledgeBase' as const },
  ];

  const handleNavigation = (view: 'home' | 'listing' | 'knowledgeBase' | 'admin') => {
    onNavigate(view);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-white">
          <h3 className="font-semibold">Menu</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-4">
            {mainItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.view;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.view)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-yellow-400 text-black font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-gray-200 my-4"></div>

          {/* Situation Section */}
          <div className="px-4 mb-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Situation</p>
          </div>
          <div className="space-y-1 px-4">
            {situationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.view;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.view)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-yellow-400 text-black font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-gray-200 my-4"></div>

          {/* Additional Options */}
          <div className="space-y-1 px-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    disabled
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-gray-400 cursor-not-allowed opacity-50"
                  >
                    <Shield className="w-5 h-5" />
                    <span>Settings</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Out of scope feature</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
          
          <div className="mt-4 px-4 py-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Logged in as</p>
            <p className="text-sm font-medium text-gray-900">sarah.chen@strength.agency</p>
          </div>
        </div>
      </div>
    </>
  );
}