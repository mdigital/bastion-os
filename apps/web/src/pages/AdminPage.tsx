import { NavLink, Outlet } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.tsx'

export default function AdminPage() {
  const { userRole, signOut } = useAuth()

  if (userRole !== 'admin') {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 16px' }}>
        <p>Not authorised</p>
        <Link to="/">Back to home</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Admin</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/">Home</Link>
          <button type="button" onClick={signOut}>
            Sign out
          </button>
        </div>
      </div>

      <nav style={{ display: 'flex', gap: 16, borderBottom: '1px solid #ddd', paddingBottom: 8, marginBottom: 24 }}>
        <NavLink
          to="/admin/prompts"
          style={({ isActive }) => ({
            fontWeight: isActive ? 'bold' : 'normal',
            textDecoration: 'none',
            color: isActive ? '#000' : '#555',
          })}
        >
          Prompts
        </NavLink>
        <NavLink
          to="/admin/practices"
          style={({ isActive }) => ({
            fontWeight: isActive ? 'bold' : 'normal',
            textDecoration: 'none',
            color: isActive ? '#000' : '#555',
          })}
        >
          Practices
        </NavLink>
        <NavLink
          to="/admin/practice-templates"
          style={({ isActive }) => ({
            fontWeight: isActive ? 'bold' : 'normal',
            textDecoration: 'none',
            color: isActive ? '#000' : '#555',
          })}
        >
          Practice Templates
        </NavLink>
      </nav>

      <Outlet />
    </div>
  )
}
