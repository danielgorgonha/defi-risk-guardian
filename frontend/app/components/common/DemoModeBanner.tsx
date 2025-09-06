'use client'

import { Star, RotateCcw } from 'lucide-react'
import { useNavigation } from '../../contexts/NavigationContext'
import { useWalletStatus } from '../../hooks/useWalletStatus'
import { api } from '../../utils/api'
import { useToast } from './ToastProvider'

export function DemoModeBanner() {
  const { isDemoMode, setIsDemoMode, setShowNavigation } = useNavigation()
  const { canLoadData } = useWalletStatus()
  const toast = useToast()

  if (!isDemoMode || !canLoadData) {
    return null
  }

  const handleResetDemo = async () => {
    try {
      // Clear demo data from backend if in demo mode
      if (isDemoMode) {
        await api.clearDemoData()
      }
    } catch (error) {
      console.warn('Failed to clear demo data:', error)
      // Continue with reset even if clearing demo data fails
    }
    
    // Clear localStorage first
    localStorage.removeItem('showNavigation')
    localStorage.removeItem('isDemoMode')
    localStorage.removeItem('walletAddress')
    
    // Then reset all states
    setIsDemoMode(false)
    setShowNavigation(false)
    
    // Show success message
    toast.showSuccess('Demo Reset', 'Demo data has been cleared successfully!')
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
          onClick={handleResetDemo}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors duration-200 font-medium"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  )
}
