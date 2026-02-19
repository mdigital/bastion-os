import { useState } from 'react'
import ClientBriefCard from '../components/ClientBriefCard'
import KnowledgeBaseCard from '../components/KnowledgeBaseCard'
import Layout from '../components/Layout'
import type { KeyInfo } from '../types/KeyInfo'
import type { SectionData } from '../types/SectionData'
import { defaultSections } from '../data/defaultSection'
import UploadStep from '../components/UploadStep'

type Step = 'upload' | 'keyInfo' | 'triage' | 'sections'

export default function HomePage() {
  const [, setKeyInfo] = useState<KeyInfo>()
  const [sections, setSections] = useState<SectionData[]>(defaultSections)
  const [currentView, setCurrentView] = useState<
    'home' | 'listing' | 'brief' | 'knowledgeBase' | 'admin' | 'approval'
  >('home')
  const [, setCurrentStep] = useState<Step>('upload')

  const handleNewBrief = () => {
    console.log('handle new brief')
    setKeyInfo({
      client: 'Acme Corporation',
      jobToBeDone:
        'Launch integrated multi-channel campaign for new sustainable product line targeting environmentally conscious millennials and Gen Z consumers',
      budget: '$250,000',
      dueDate: '2025-03-15',
      liveDate: '2025-04-01',
      campaignDuration: '6 months',
      briefLevel: 'New Project Brief',
    })
    setSections(sections)
    setCurrentStep('upload')
    setCurrentView('brief')
  }

  const handleFileUpload = () => {
    console.log('file upload')
  }
  return (
    <Layout>
      <div className="bg-bone relative overflow-hidden -mx-8 -my-12 px-8 py-12 min-h-screen">
        <div className="relative z-10 grid grid-cols-12 gap-6 auto-rows-auto max-w-screen-2xl mx-auto">
          {currentView === 'home' && (
            <>
              <KnowledgeBaseCard />
              <ClientBriefCard onNewBrief={handleNewBrief} />
            </>
          )}
          {currentView === 'brief' && (
            <>
              <UploadStep onUpload={handleFileUpload} />
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
