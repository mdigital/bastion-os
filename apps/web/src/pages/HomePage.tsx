import { useState } from 'react'
import ClientBriefCard from '../components/ClientBriefCard'
import KnowledgeBaseCard from '../components/KnowledgeBaseCard'
import Layout from '../components/Layout'
import type { KeyInfo } from '../types/KeyInfo'
import type { SectionData } from '../types/SectionData'
import { defaultSections } from '../data/defaultSection'
import UploadStep from '../components/UploadStep'
import ProgressSteps from '../components/ProgressSteps'

type Step = 'upload' | 'keyInfo' | 'triage' | 'sections'

export default function HomePage() {
  const [, setKeyInfo] = useState<KeyInfo>()
  const [sections, setSections] = useState<SectionData[]>(defaultSections)
  const [currentView, setCurrentView] = useState<
    'home' | 'listing' | 'brief' | 'knowledgeBase' | 'admin' | 'approval'
  >('home')
  const [, setCurrentStep] = useState<Step>('upload')

  const handleNewBrief = () => {
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
      <>
        {/* Home View */}
        {currentView === 'home' && (
          <div className="max-w-screen-2xl mx-auto px-8 py-12 grid grid-cols-12 gap-6 items-stretch">
            <div className="col-span-12 md:col-span-6 flex">
              <KnowledgeBaseCard />
            </div>
            <div className="col-span-12 md:col-span-6 flex">
              <ClientBriefCard onNewBrief={handleNewBrief} />
            </div>
          </div>
        )}

        {/* Brief View */}
        {currentView === 'brief' && (
          <>
            <div className="w-full">
              <div className="max-w-screen-2xl mx-auto px-8 py-6">
                <ProgressSteps />
              </div>
            </div>

            <div className="max-w-2xl mx-auto px-8 py-12">
              <UploadStep onUpload={handleFileUpload} />
            </div>
          </>
        )}
      </>
    </Layout>
  )
}
