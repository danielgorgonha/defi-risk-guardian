'use client'

import { Star } from 'lucide-react'
import { useNavigation } from '../../contexts/NavigationContext'
import { useWalletStatus } from '../../hooks/useWalletStatus'

export function DemoModeBanner() {
  const { isDemoMode } = useNavigation()
  const { canLoadData } = useWalletStatus()

  if (!isDemoMode || !canLoadData) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4 mb-6 shadow-sm">
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
    </div>
  )
}
