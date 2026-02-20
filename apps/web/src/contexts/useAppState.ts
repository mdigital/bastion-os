import { createContext, useContext } from 'react'

type CurrentView = 'home' | 'listing' | 'brief' | 'knowledgeBase' | 'admin' | 'approval'

interface AppStateContextType {
  currentView: CurrentView
  setCurrentView: (view: CurrentView) => void
}

export const AppStateContext = createContext<AppStateContextType | undefined>(undefined)

export function useAppState() {
  const context = useContext(AppStateContext)
  if (context === undefined) {
    throw new Error('useAppState must be used within AppStateProvider')
  }
  return context
}
