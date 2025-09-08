'use client'

import { useState, useEffect } from 'react'
import { AlertTimeline } from '../components/dashboard/AlertTimeline'
import { useNavigation } from '../contexts/NavigationContext'
import { useWalletStatus } from '../hooks/useWalletStatus'
import { DemoModeBanner } from '../components/common/DemoModeBanner'


export default function AlertsPage() {
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [alerts, setAlerts] = useState([])
  const { isDemoMode, showNavigation } = useNavigation()
  const { canLoadData } = useWalletStatus()

  // Clear alerts when exiting demo mode or when can't load data
  useEffect(() => {
    if (!canLoadData) {
      setAlerts([])
    }
  }, [canLoadData])


  return (
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
            {alerts.length > 0 ? (
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
  )
}
