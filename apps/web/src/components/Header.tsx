import { LogOut, Settings } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Hamburger from '../components/Hamburger'
import { useNavigate } from 'react-router-dom'

export default function Header() {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const { signOut } = useAuth()
  const navigate = useNavigate()

  // Todo : replace with SB user
  const userName = 'Julian Leahy'
  const userEmail = 'leahyjulian@gmail.com'
  const userInitials = 'JL'

  const handleLogout = () => {
    signOut()
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 w-full">
      <div className="px-8 py-4 flex items-center justify-between">
        <button
          className="text-lg text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
          type="button"
          onClick={() => {
            navigate('/home')
          }}
        >
          Bastion IO
        </button>

        <div className="flex items-center gap-2 relative">
          <Hamburger userEmail={userEmail} handleLogout={handleLogout} />

          <div className="relative">
            <button
              className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center hover:bg-yellow-500 transition-colors"
              type="button"
              onClick={() => setIsUserDropdownOpen((open) => !open)}
            >
              <span className="text-sm font-bold">{userInitials}</span>
            </button>

            {isUserDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsUserDropdownOpen(false)} />
                <div className="absolute right-0 top-12 bg-white border border-gray-200 shadow-lg rounded-lg z-50 w-64">
                  <div className="p-4 border-b border-gray-200">
                    <p className="font-medium text-sm">{userName}</p>
                    <p className="text-sm text-gray-500 mt-1">{userEmail}</p>
                  </div>
                  <div className="py-2">
                    <button
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left"
                      onClick={() => {
                        setIsUserDropdownOpen(false)
                        // TODO: Handle Personal Settings navigation
                      }}
                      type="button"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Personal Settings</span>
                    </button>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                      onClick={handleLogout}
                      type="button"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
