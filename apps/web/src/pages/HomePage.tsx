import type { Step } from '@bastion-os/shared'
import { useState } from 'react'
import ClientBriefCard from '../components/ClientBriefCard'
import KnowledgeBaseCard from '../components/KnowledgeBaseCard'
import Layout from '../components/Layout'
import ProgressSteps from '../components/ProgressSteps'
import UploadStep from '../components/UploadStep'
import { useAppState } from '../contexts/useAppState'
import { defaultSections } from '../data/defaultSection'
import type { KeyInfo } from '../types/KeyInfo'
import type { SectionData } from '../types/SectionData'
import { KeyInformationStep } from '../components/KeyInformationStep'

export default function HomePage() {
  const [keyInfo, setKeyInfo] = useState<KeyInfo>()
  const [sections, setSections] = useState<SectionData[]>(defaultSections)
  const [currentStep, setCurrentStep] = useState<Step>('upload')
  const { currentView, setCurrentView } = useAppState()
  const [, setUploadedFile] = useState<File | null>(null)

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

  const handleFileUpload = (file: File) => {
    console.log('file upload', file)
    setUploadedFile(file)
    // Simulate
    setTimeout(() => {
      setCurrentStep('keyInfo')
    }, 1500)
  }

  const handleKeyInfoEdit = (field: keyof KeyInfo, value: string) => {
    console.log(`field: ${field} value: ${value}`)
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
            <ProgressSteps currentStep={currentStep} setCurrentStep={setCurrentStep} />
            {currentStep === 'upload' && <UploadStep onUpload={handleFileUpload} />}
            {currentStep === 'keyInfo' && keyInfo && (
              <KeyInformationStep
                keyInfo={keyInfo}
                onNext={() => setCurrentStep('triage')}
                onEdit={handleKeyInfoEdit}
                onBack={() => setCurrentStep('upload')}
              />
            )}
          </>
        )}
      </>
    </Layout>
  )
}
