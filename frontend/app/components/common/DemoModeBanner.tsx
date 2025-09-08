'use client'

import { Star, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useNavigation } from '../../contexts/NavigationContext'
import { useWalletStatus } from '../../hooks/useWalletStatus'
import { useWallet } from '../../contexts/WalletContext'
import { useToast } from './ToastProvider'

export function DemoModeBanner() {
  const { isDemoMode, setIsDemoMode, setShowNavigation } = useNavigation()
  const { canLoadData } = useWalletStatus()
  const { disconnectWallet } = useWallet()
  const toast = useToast()
  const router = useRouter()

  if (!isDemoMode || !canLoadData) {
    return null
  }

  const handleExitDemo = () => {
    // Clear localStorage
    localStorage.removeItem('showNavigation')
    localStorage.removeItem('isDemoMode')
    localStorage.removeItem('walletAddress')
    localStorage.removeItem('walletMode')
    
    // Reset all states
    setIsDemoMode(false)
    setShowNavigation(false)
    
    // Disconnect wallet silently (no duplicate notifications)
    disconnectWallet(true)
    
    // Show success message
    toast.showSuccess('Demo Mode Exited', 'You have exited demo mode successfully!')
    
    // Redirect to landing page
    router.push('/')
  }

  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Star className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-orange-800">Demo Mode Active</h3>
            <p className="text-sm text-orange-700">
              You are viewing demo data. Connect a real wallet to use the complete system.
            </p>
          </div>
        </div>
        <button
          onClick={handleExitDemo}
          className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 text-sm font-medium"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Exit Demo
        </button>
      </div>
    </div>
  )
}
