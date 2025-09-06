'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface NavigationContextType {
  showNavigation: boolean
  setShowNavigation: (show: boolean) => void
  isDemoMode: boolean
  setIsDemoMode: (isDemo: boolean) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [showNavigation, setShowNavigation] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)

  return (
    <NavigationContext.Provider value={{
      showNavigation,
      setShowNavigation,
      isDemoMode,
      setIsDemoMode
    }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}
