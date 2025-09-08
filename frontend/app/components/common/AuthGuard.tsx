'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '../../contexts/WalletContext'
import { useNavigation } from '../../contexts/NavigationContext'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter()
  const { wallet, isDemoMode } = useWallet()
  const { walletMode } = useNavigation()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [hasCheckedOnce, setHasCheckedOnce] = useState(false)

  useEffect(() => {
    // Give time for state restoration on page refresh
    const checkAuth = () => {
      // Check localStorage directly for demo mode
      const savedIsDemoMode = typeof window !== 'undefined' ? localStorage.getItem('isDemoMode') === 'true' : false
      const savedWalletMode = typeof window !== 'undefined' ? localStorage.getItem('walletMode') : null
      
      // Check if user is authenticated (connected wallet or demo mode)
      const isAuthenticated = wallet.isConnected || 
                             isDemoMode || 
                             walletMode === 'demo' || 
                             savedIsDemoMode || 
                             savedWalletMode === 'demo'
      
      if (isAuthenticated) {
        setIsCheckingAuth(false)
        setHasCheckedOnce(true)
      } else if (hasCheckedOnce) {
        // Only redirect if we've checked at least once and still not authenticated
        console.log('🔒 AuthGuard: User not authenticated, redirecting to login')
        router.push('/')
      }
    }

    // Initial check
    checkAuth()
    
    // Set a timeout to allow state restoration
    const timeout = setTimeout(() => {
      if (!hasCheckedOnce) {
        setHasCheckedOnce(true)
        checkAuth()
      }
    }, 1000) // Wait 1 second for state restoration

    return () => clearTimeout(timeout)
  }, [wallet.isConnected, isDemoMode, walletMode, router, hasCheckedOnce])

  // Show loading while checking authentication
  if (isCheckingAuth || !hasCheckedOnce) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Check final authentication status
  const savedIsDemoMode = typeof window !== 'undefined' ? localStorage.getItem('isDemoMode') === 'true' : false
  const savedWalletMode = typeof window !== 'undefined' ? localStorage.getItem('walletMode') : null
  const isAuthenticated = wallet.isConnected || 
                         isDemoMode || 
                         walletMode === 'demo' || 
                         savedIsDemoMode || 
                         savedWalletMode === 'demo'

  // Show fallback if still not authenticated after checking
  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // Render protected content
  return <>{children}</>
}
