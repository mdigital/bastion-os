import { X, Menu, Home, FileText, BookOpen, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../contexts/useAppState'

interface HamburgerProps {
  userEmail: string
  handleLogout: () => void
}

export default function Hamburger({ userEmail, handleLogout }: HamburgerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const { currentView, setCurrentView } = useAppState()

  const situationItems = [
    { id: 'briefs', label: 'Client Briefs', icon: FileText, view: 'listing' as const },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen, view: 'knowledgeBase' as const },
  ]

  return (
    <>
      <button
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        type="button"
        aria-label="Open menu"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
            style={{ top: '64px' }}
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-linear-to-r from-yellow-50 to-white">
              <h3 className="font-semibold">Menu</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                type="button"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Menu content */}
            <div className="flex-1 p-6 flex flex-col gap-2">
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all bg-yellow-400 text-black font-medium hover:bg-yellow-500"
                onClick={() => {
                  setIsOpen(false)
                  navigate('/home')
                  setCurrentView('home')
                }}
                type="button"
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </button>
              <div className="border-t border-gray-200 my-4"></div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-4 mb-2 px-1">
                Situation
              </p>
              {situationItems.map((item) => {
                const Icon = item.icon
                const isActive = currentView === item.view

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setIsOpen(false)
                      setCurrentView(item.view)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-yellow-400 text-black font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Log Out</span>
              </button>

              <div className="mt-4 px-4 py-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Logged in as</p>
                <p className="text-sm font-medium text-gray-900">{userEmail}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
