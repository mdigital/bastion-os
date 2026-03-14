import { NavLink, Outlet, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.tsx'

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
    isActive ? 'bg-yellow-400 text-black' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
  }`

export default function AdminPage() {
  const { userRole, signOut } = useAuth()

  if (userRole !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <p className="text-gray-700">Not authorised</p>
        <Link to="/" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
          Back to home
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
        <div className="flex items-center gap-3">
          <a href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Home
          </a>
          <button
            type="button"
            onClick={signOut}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      <nav className="flex gap-2 border-b border-gray-200 pb-3 mb-6">
        <NavLink to="/admin/prompts" className={tabClass}>
          Prompts
        </NavLink>
        <NavLink to="/admin/practice-areas" className={tabClass}>
          Practice Areas
        </NavLink>
        <NavLink to="/admin/settings" className={tabClass}>
          Settings
        </NavLink>
      </nav>

      <Outlet />
    </div>
  )
}
