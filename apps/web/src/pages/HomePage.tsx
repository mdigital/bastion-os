import ClientBriefCard from '../components/ClientBriefCard'
import KnowledgeBaseCard from '../components/KnowledgeBaseCard'
import Layout from '../components/Layout'

export default function HomePage() {
  return (
    <Layout>
      <div className="bg-bone relative overflow-hidden -mx-8 -my-12 px-8 py-12 min-h-screen">
        <div className="relative z-10 grid grid-cols-12 gap-6 auto-rows-auto max-w-screen-2xl mx-auto">
          <KnowledgeBaseCard />
          <ClientBriefCard />
        </div>
      </div>
    </Layout>
  )
}
