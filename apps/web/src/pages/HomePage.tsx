import Layout from '../components/Layout'
import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const navigate = useNavigate()
  return (
    <Layout>
      <div>Knowledge Base Card</div>
      <div>Client Briefs Card</div>
      <button
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => navigate('/')}
      >
        Go to All Clients
      </button>
    </Layout>
  )
}
