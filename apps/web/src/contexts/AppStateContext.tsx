import { useState } from 'react'
import { AppStateContext } from './useAppState'

type CurrentView = 'home' | 'listing' | 'brief' | 'knowledgeBase' | 'admin' | 'approval'

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [currentView, setCurrentView] = useState<CurrentView>('home')

  return (
    <AppStateContext.Provider value={{ currentView, setCurrentView }}>
      {children}
    </AppStateContext.Provider>
  )
}
