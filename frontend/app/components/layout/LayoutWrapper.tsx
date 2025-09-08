'use client'

import { useNavigation } from '../../contexts/NavigationContext'
import { useWallet } from '../../contexts/WalletContext'

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { showNavigation, isDemoMode } = useNavigation()
  const { wallet } = useWallet()
  
  // Add padding-top only when header is fixed (not logged in)
  // Header is fixed only on main page (when not logged in)
  const isLoggedIn = showNavigation || isDemoMode || wallet.isConnected
  const wrapperClasses = isLoggedIn 
    ? "min-h-screen" 
    : "min-h-screen pt-16"

  return (
    <div className={wrapperClasses}>
      {children}
    </div>
  )
}
