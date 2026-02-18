import { X, Menu, Home } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Hamburger() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

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
            {/* TODO: Add menu content here */}
            <div className="flex-1 p-6">
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all bg-yellow-400 text-black font-medium hover:bg-yellow-500"
                onClick={() => {
                  setIsOpen(false)
                  navigate('/home')
                }}
                type="button"
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
