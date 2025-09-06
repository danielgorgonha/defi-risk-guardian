'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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

  // Load state from localStorage on mount
  useEffect(() => {
    const savedShowNavigation = localStorage.getItem('showNavigation')
    const savedIsDemoMode = localStorage.getItem('isDemoMode')
    
    if (savedShowNavigation !== null) {
      setShowNavigation(JSON.parse(savedShowNavigation))
    }
    if (savedIsDemoMode !== null) {
      setIsDemoMode(JSON.parse(savedIsDemoMode))
    }
  }, [])

  // Save state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('showNavigation', JSON.stringify(showNavigation))
  }, [showNavigation])

  useEffect(() => {
    localStorage.setItem('isDemoMode', JSON.stringify(isDemoMode))
  }, [isDemoMode])

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
