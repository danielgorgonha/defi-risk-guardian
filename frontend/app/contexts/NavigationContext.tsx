'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface NavigationContextType {
  showNavigation: boolean
  setShowNavigation: (show: boolean) => void
  isDemoMode: boolean
  setIsDemoMode: (isDemo: boolean) => void
  walletMode: 'disconnected' | 'connected' | 'tracked' | 'demo'
  setWalletMode: (mode: 'disconnected' | 'connected' | 'tracked' | 'demo') => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [showNavigation, setShowNavigation] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [walletMode, setWalletMode] = useState<'disconnected' | 'connected' | 'tracked' | 'demo'>('disconnected')

  // Load state from localStorage on mount
  useEffect(() => {
    const savedShowNavigation = localStorage.getItem('showNavigation')
    const savedIsDemoMode = localStorage.getItem('isDemoMode')
    const savedWalletMode = localStorage.getItem('walletMode')
    
    if (savedShowNavigation !== null) {
      setShowNavigation(JSON.parse(savedShowNavigation))
    }
    if (savedIsDemoMode !== null) {
      // Handle both string 'true' and boolean true
      const isDemo = savedIsDemoMode === 'true' || savedIsDemoMode === 'true'
      setIsDemoMode(isDemo)
    }
    if (savedWalletMode !== null) {
      setWalletMode(savedWalletMode as 'disconnected' | 'connected' | 'demo' | 'tracked')
    }
  }, [])

  // Save state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('showNavigation', JSON.stringify(showNavigation))
  }, [showNavigation])

  useEffect(() => {
    localStorage.setItem('isDemoMode', JSON.stringify(isDemoMode))
  }, [isDemoMode])

  useEffect(() => {
    localStorage.setItem('walletMode', JSON.stringify(walletMode))
  }, [walletMode])

  return (
    <NavigationContext.Provider value={{
      showNavigation,
      setShowNavigation,
      isDemoMode,
      setIsDemoMode,
      walletMode,
      setWalletMode
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
