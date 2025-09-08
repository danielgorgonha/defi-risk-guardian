'use client'

import { useState, useEffect } from 'react'
import { AlertTimeline } from '../components/dashboard/AlertTimeline'
import { useNavigation } from '../contexts/NavigationContext'
import { useWalletStatus } from '../hooks/useWalletStatus'
import { DemoModeBanner } from '../components/common/DemoModeBanner'
import { api, Alert } from '../utils/api'
import { useToast } from '../components/common/ToastProvider'
import { AuthGuard } from '../components/common/AuthGuard'


export default function AlertsPage() {
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { isDemoMode, showNavigation, walletMode } = useNavigation()
  const { canLoadData } = useWalletStatus()
  const toast = useToast()

  // Demo wallet address
  const demoWalletAddress = 'GDEMOTEST1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJK'

  // Load alerts data
  useEffect(() => {
    if (canLoadData && (isDemoMode || walletMode === 'demo' || walletMode === 'connected' || walletMode === 'tracked')) {
      loadAlerts()
    } else {
      setAlerts([])
    }
  }, [canLoadData, isDemoMode, walletMode])

  const loadAlerts = async () => {
    if (!canLoadData) return

    setIsLoading(true)
    try {
      // Get wallet address from localStorage or use demo address
      const walletAddress = localStorage.getItem('walletAddress') || demoWalletAddress
      
      if (isDemoMode || walletMode === 'demo') {
        // For demo mode, get consolidated data from portfolio endpoint
        const portfolioResponse = await api.getPortfolio(walletAddress)
        
        if ('demo_mode' in portfolioResponse && (portfolioResponse as any).demo_mode) {
          // Demo mode: extract alerts from consolidated response
          const demoResponse = portfolioResponse as any
          setAlerts(demoResponse.alerts?.alerts || demoResponse.alerts || [])
          console.log('🎭 Demo mode: Loaded alerts from consolidated data')
          return
        }
      }
      
      // Regular mode: load alerts separately
      const alertsData = await api.getActiveAlerts(walletAddress)
      setAlerts(Array.isArray(alertsData) ? alertsData : (alertsData as any)?.alerts || [])
      
    } catch (error: any) {
      console.error('Error loading alerts:', error)
      setAlerts([])
      if (error.response?.status !== 404) {
        toast.showError('Alerts Error', error.response?.data?.detail || 'Failed to load alerts')
      }
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <AuthGuard>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DemoModeBanner />
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Risk Alerts</h1>
            <p className="text-gray-600">Stay informed about your portfolio risks and opportunities</p>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* Alerts Timeline */}
            <div>
              {isLoading ? (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                  <div className="text-center text-gray-500">
                    <p className="text-lg">Loading alerts...</p>
                  </div>
                </div>
              ) : alerts.length > 0 ? (
                <AlertTimeline alerts={alerts} />
              ) : (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                  <div className="text-center text-gray-500">
                    <p className="text-lg">No alerts available</p>
                    <p className="text-sm mt-2">Connect your wallet or try the demo to see risk alerts</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
