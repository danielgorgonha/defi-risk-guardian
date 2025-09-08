'use client'

import { useState, useEffect } from 'react'
import { PortfolioCard } from '../components/dashboard/PortfolioCard'
import { RiskMetrics } from '../components/dashboard/RiskMetrics'
import { AlertTimeline } from '../components/dashboard/AlertTimeline'
import { AIDedicatedSection } from '../components/dashboard/AIDedicatedSection'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { useToast } from '../components/common/ToastProvider'
import { useNavigation } from '../contexts/NavigationContext'
import { useWalletStatus } from '../hooks/useWalletStatus'
import { useWallet } from '../contexts/WalletContext'
import { DemoModeBanner } from '../components/common/DemoModeBanner'
import { api, Portfolio, RiskAnalysis, Alert } from '../utils/api'

// Type for consolidated demo response from backend
interface ConsolidatedDemoResponse {
  demo_mode: boolean
  portfolio: Portfolio
  risk_analysis: RiskAnalysis
  alerts: {
    alerts: Alert[]
    total_active: number
    total_resolved: number
  }
  rebalance_suggestions: any
  timestamp: string
}

export default function Dashboard() {
  const [walletAddress, setWalletAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const toast = useToast()
  const { showNavigation, setShowNavigation, isDemoMode, setIsDemoMode, walletMode, setWalletMode } = useNavigation()
  const { canLoadData, walletAddress: currentWalletAddress } = useWalletStatus()
  const { wallet, connectDemoWallet } = useWallet()

  // Demo data
  const demoWalletAddress = 'GDEMOTEST1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJK'

  // Load saved state on mount and sync demo mode
  useEffect(() => {
    const savedWalletAddress = localStorage.getItem('walletAddress')
    const savedIsDemoMode = localStorage.getItem('isDemoMode')
    
    if (savedIsDemoMode === 'true' && savedWalletAddress) {
      setWalletAddress(savedWalletAddress)
    } else if (!savedWalletAddress) {
      // Only set demo wallet if no saved wallet and we're in demo mode
      if (isDemoMode) {
        setWalletAddress(demoWalletAddress)
        localStorage.setItem('walletAddress', demoWalletAddress)
      }
    }
  }, [])

  // Sync demo mode when it changes
  useEffect(() => {
    if (isDemoMode && !walletAddress) {
      setWalletAddress(demoWalletAddress)
      localStorage.setItem('walletAddress', demoWalletAddress)
    } else if (!isDemoMode && walletAddress === demoWalletAddress) {
      // Clear demo wallet address when exiting demo mode
      setWalletAddress('')
      localStorage.removeItem('walletAddress')
    }
  }, [isDemoMode])

  // Restore demo mode state on page refresh
  useEffect(() => {
    // Check localStorage directly for demo state
    const savedIsDemoMode = localStorage.getItem('isDemoMode') === 'true'
    const savedWalletMode = localStorage.getItem('walletMode')
    
    if (savedIsDemoMode && savedWalletMode === 'demo' && !showNavigation) {
      console.log('🔄 Restoring demo mode state after page refresh')
      setShowNavigation(true)
      setWalletAddress(demoWalletAddress)
      localStorage.setItem('walletAddress', demoWalletAddress)
      // Load demo portfolio data
      setTimeout(async () => {
        await loadPortfolioData()
      }, 100)
    }
  }, [isDemoMode, walletMode, showNavigation])

  // Additional check for demo state restoration
  useEffect(() => {
    const savedIsDemoMode = localStorage.getItem('isDemoMode') === 'true'
    const savedWalletMode = localStorage.getItem('walletMode')
    
    // If demo mode is saved but not active in state, force restoration
    if (savedIsDemoMode && !isDemoMode) {
      console.log('🔄 Force restoring demo mode state')
      setIsDemoMode(true)
      setWalletMode('demo')
      setShowNavigation(true)
      setWalletAddress(demoWalletAddress)
      localStorage.setItem('walletAddress', demoWalletAddress)
      localStorage.setItem('walletMode', JSON.stringify('demo'))
      
      // Load demo portfolio data
      setTimeout(async () => {
        await loadPortfolioData()
      }, 200)
    }
  }, [])

  // Auto-activate navigation when wallet connects via WalletContext
  useEffect(() => {
    if (wallet.isConnected && wallet.address && !showNavigation && !isDemoMode) {
      console.log('🚀 Wallet connected via WalletContext, activating navigation')
      setShowNavigation(true)
      setWalletMode('connected') // Mark as truly connected wallet
      // Sync wallet address for consistency
      const walletAddr = typeof wallet.address === 'string' ? wallet.address : (wallet.address as any)?.address || wallet.address
      setWalletAddress(walletAddr)
      localStorage.setItem('walletAddress', walletAddr)
      // Show success message
      toast.showSuccess('Wallet Connected', 'Welcome to Risk Guardian! Loading your portfolio...')
      // Load portfolio data
      setTimeout(async () => {
        await loadPortfolioData()
      }, 100)
    } else if (!wallet.isConnected && !isDemoMode && showNavigation && walletMode === 'connected') {
      console.log('🔌 Wallet disconnected, deactivating navigation')
      setShowNavigation(false)
      setWalletMode('disconnected')
      setWalletAddress('')
      localStorage.removeItem('walletAddress')
      // Clear portfolio data
      setPortfolio(null)
      setRiskAnalysis(null)
      setAlerts([])
    }
  }, [wallet.isConnected, wallet.address, showNavigation, isDemoMode, walletMode])

  // Handle signout - clear data when walletMode becomes 'disconnected'
  useEffect(() => {
    if (walletMode === 'disconnected' && !showNavigation) {
      console.log('🔄 Handling signout - clearing all data')
      setWalletAddress('')
      setPortfolio(null)
      setRiskAnalysis(null)
      setAlerts([])
      setIsLoadingData(false)
    }
  }, [walletMode, showNavigation])

  // Ensure walletAddress is synced when we have an active wallet
  useEffect(() => {
    if (showNavigation && walletMode !== 'disconnected') {
      const savedWalletAddress = localStorage.getItem('walletAddress')
      
      if (walletMode === 'connected' && wallet.isConnected && wallet.address) {
        // For connected wallets, use the address from WalletContext
        const walletAddr = typeof wallet.address === 'string' ? wallet.address : (wallet.address as any)?.address || wallet.address
        if (walletAddr && walletAddr !== walletAddress) {
          setWalletAddress(walletAddr)
        }
      } else if ((walletMode === 'demo' || walletMode === 'tracked') && savedWalletAddress && !walletAddress) {
        // For demo/tracked wallets, use saved address
        setWalletAddress(savedWalletAddress)
      }
    }
  }, [showNavigation, walletMode, wallet.isConnected, wallet.address, walletAddress])

  // Load portfolio data when wallet is connected
  useEffect(() => {
    if (walletAddress && canLoadData) {
      loadPortfolioData()
    } else if (!walletAddress) {
      // Clear data when no wallet address
      setPortfolio(null)
      setRiskAnalysis(null)
      setAlerts([])
    }
  }, [walletAddress, isDemoMode])

  // Handle initial loading state
  useEffect(() => {
    // Set initial loading to false after a short delay to allow state restoration
    const timer = setTimeout(() => {
      setIsInitialLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const loadPortfolioData = async () => {
    if (!walletAddress) return
    
    // Don't load data if we can't load data (not in demo mode and no valid wallet)
    if (!canLoadData) {
      setPortfolio(null)
      setRiskAnalysis(null)
      setAlerts([])
      return
    }
    
    // Additional check: don't load if demo mode was just disabled
    if (!isDemoMode && walletAddress === demoWalletAddress) {
      console.log('🚫 Skipping data load - demo wallet address but not in demo mode')
      return
    }
    
    setIsLoadingData(true)
    try {
      // Load portfolio data - backend now returns consolidated data for demo mode
      const portfolioResponse = await api.getPortfolio(walletAddress)
      
      // Check if this is consolidated demo data from backend fixtures
      if ('demo_mode' in portfolioResponse && (portfolioResponse as any).demo_mode) {
        // ✨ Demo mode: use consolidated data from single response
        const demoResponse = portfolioResponse as any
        setPortfolio(demoResponse.portfolio)
        setRiskAnalysis(demoResponse.risk_analysis)
        setAlerts(demoResponse.alerts?.alerts || demoResponse.alerts || [])
        console.log('🎭 Demo mode: Using consolidated fixture data from backend')
        return // Early return - no need for additional API calls
      }
      
      // Regular mode: set portfolio and load other data separately
      setPortfolio(portfolioResponse)
      
      // Load risk analysis separately for real wallets
      try {
        const riskData = await api.analyzeRisk(walletAddress)
        setRiskAnalysis(riskData)
      } catch (riskError) {
        console.warn('Risk analysis failed:', riskError)
        setRiskAnalysis(null)
        toast.showInfo('Risk Analysis', 'Unable to calculate risk metrics. Portfolio may be empty or invalid.')
      }
      
      // Load alerts separately for real wallets  
      try {
        const alertsData = await api.getActiveAlerts(walletAddress)
        setAlerts(Array.isArray(alertsData) ? alertsData : (alertsData as any)?.alerts || [])
      } catch (alertError) {
        console.warn('Alerts loading failed:', alertError)
        setAlerts([])
      }
      
    } catch (error: any) {
      console.error('Error loading portfolio data:', error)
      
      // Show error message for all cases
      if (error.response?.status === 404) {
        toast.showInfo('Portfolio Not Found', 'No portfolio found for this wallet. Create a portfolio first.')
      } else {
        toast.showError('Data Loading Error', error.response?.data?.detail || 'Failed to load portfolio data')
      }
    } finally {
      setIsLoadingData(false)
      setIsInitialLoading(false) // Also set initial loading to false when data loading completes
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Dashboard - Added extra top padding to prevent header overlap */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
        <DemoModeBanner />

        {isInitialLoading || isLoadingData ? (
          <div className="flex flex-col justify-center items-center h-96">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600 text-lg font-medium">
              {isInitialLoading ? 'Loading Dashboard...' : 'Loading Portfolio Data...'}
            </p>
            <p className="mt-2 text-gray-500 text-sm">
              {isInitialLoading ? 'Setting up your risk management dashboard' : 'Fetching your latest portfolio information'}
            </p>
          </div>
        ) : (
          <>
            {/* AI Dedicated Section - Full Width */}
            {riskAnalysis && (
              <AIDedicatedSection riskAnalysis={riskAnalysis} />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Portfolio Overview */}
              <div className="lg:col-span-2">
                {portfolio ? (
                  <PortfolioCard portfolio={portfolio} onAssetAdded={loadPortfolioData} />
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <div className="text-center text-gray-500">
                      <p>No portfolio data available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Risk Metrics */}
              <div>
                {riskAnalysis ? (
                  <RiskMetrics riskAnalysis={riskAnalysis} />
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <div className="text-center text-gray-500">
                      <p>No risk analysis available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Alerts */}
            <div className="mt-8">
              <AlertTimeline alerts={alerts} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
