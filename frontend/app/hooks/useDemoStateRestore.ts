'use client'

import { useEffect } from 'react'
import { useNavigation } from '../contexts/NavigationContext'
import { useWallet } from '../contexts/WalletContext'

export function useDemoStateRestore() {
  const { isDemoMode, walletMode, setShowNavigation, setWalletMode } = useNavigation()
  const { wallet, isDemoMode: walletDemoMode } = useWallet()

  useEffect(() => {
    // Check if we need to restore demo state after page refresh
    if (typeof window !== 'undefined') {
      const savedIsDemoMode = localStorage.getItem('isDemoMode') === 'true'
      const savedWalletMode = localStorage.getItem('walletMode')
      const savedWalletInfo = localStorage.getItem('walletInfo')
      
      // If demo mode is saved but not active in state, restore it
      if (savedIsDemoMode && savedWalletMode === 'demo' && !isDemoMode) {
        console.log('🔄 Restoring demo mode state after page refresh')
        
        // Restore navigation state
        setShowNavigation(true)
        setWalletMode('demo')
        
        // Restore wallet state if available
        if (savedWalletInfo) {
          try {
            const parsedWallet = JSON.parse(savedWalletInfo)
            if (parsedWallet.isDemoMode) {
              // Wallet state will be restored by WalletContext
              console.log('✅ Demo wallet state will be restored by WalletContext')
            }
          } catch (error) {
            console.error('Error parsing saved wallet info:', error)
          }
        }
      }
    }
  }, [isDemoMode, walletMode, setShowNavigation, setWalletMode])

  // Return current demo state for components to use
  return {
    isDemoActive: isDemoMode || walletDemoMode,
    walletMode,
    isWalletConnected: wallet.isConnected
  }
}
