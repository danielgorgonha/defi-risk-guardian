'use client'

import { useState, useEffect } from 'react'
import { PortfolioCard } from '../components/dashboard/PortfolioCard'
import { api, Portfolio } from '../utils/api'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { useToast } from '../components/common/ToastProvider'
import { useNavigation } from '../contexts/NavigationContext'
import { useWalletStatus } from '../hooks/useWalletStatus'
import { useWallet } from '../contexts/WalletContext'
import { DemoModeBanner } from '../components/common/DemoModeBanner'


export default function PortfolioPage() {
  const [walletAddress, setWalletAddress] = useState('')
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const { isDemoMode, showNavigation, setIsDemoMode, setShowNavigation, walletMode } = useNavigation()
  const { canLoadData } = useWalletStatus()
  const { wallet } = useWallet()

  // Demo wallet address
  const demoWalletAddress = 'GDEMOTEST1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJK'

  // Load wallet address based on walletMode and wallet status
  useEffect(() => {
    const savedWalletAddress = localStorage.getItem('walletAddress')
    
    if (walletMode === 'demo' && savedWalletAddress) {
      setWalletAddress(savedWalletAddress)
    } else if (walletMode === 'connected' && wallet.isConnected && wallet.address) {
      const addr = typeof wallet.address === 'string' ? wallet.address : (wallet.address as any)?.address || wallet.address
      setWalletAddress(addr)
    } else if (walletMode === 'tracked' && savedWalletAddress) {
      setWalletAddress(savedWalletAddress)
    } else {
      setWalletAddress('')
    }
  }, [walletMode, wallet.isConnected, wallet.address])

  // Load portfolio data when wallet address is available
  useEffect(() => {
    if (walletAddress && (walletMode === 'demo' || walletMode === 'connected' || walletMode === 'tracked')) {
      loadPortfolio()
    } else {
      // Clear data when no wallet address or disconnected
      setPortfolio(null)
    }
  }, [walletAddress, walletMode])

  const loadPortfolio = async () => {
    if (!walletAddress) return
    
    setIsLoading(true)
    try {
      console.log(`🔍 Loading portfolio for ${walletMode} wallet: ${walletAddress}`)
      
      // Try to load portfolio data for all wallet types
      // Load portfolio data - backend returns consolidated data for demo mode
      const portfolioResponse = await api.getPortfolio(walletAddress)
      
      if ('demo_mode' in portfolioResponse && portfolioResponse.demo_mode) {
        // ✨ Demo mode: use consolidated data (portfolio only here)
        const demoResponse = portfolioResponse as any // Type assertion for demo response
        setPortfolio(demoResponse.portfolio)
      } else {
        // Regular mode: use portfolio data directly
        setPortfolio(portfolioResponse)
        const modeText = walletMode === 'connected' ? 'connected' : 'tracked'
        toast.showSuccess('Portfolio Loaded', `Portfolio for ${modeText} wallet loaded successfully!`)
      }
    } catch (error: any) {
      console.error('Error loading portfolio:', error)
      
      if (error.response?.status === 404) {
        // Portfolio not found
        const messages = {
          demo: 'Demo portfolio not found.',
          connected: 'No portfolio found for your connected wallet. Create one first!',
          tracked: 'No portfolio found for this wallet address. Create one first!',
          disconnected: 'Please connect a wallet first.'
        }
        
        setPortfolio(null)
        toast.showInfo('Portfolio Not Found', messages[walletMode] || messages.disconnected)
      } else {
        // Other errors
        toast.showError('Portfolio Error', error.response?.data?.detail || 'Failed to load portfolio data')
        setPortfolio(null)
      }
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DemoModeBanner />

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Portfolio Overview - Full Width */}
            <div className="lg:col-span-3">
              {portfolio ? (
                <PortfolioCard portfolio={portfolio} onAssetAdded={loadPortfolio} />
              ) : (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                  <div className="text-center text-gray-500">
                    {walletMode === 'disconnected' ? (
                      <>
                        <p className="text-xl mb-2">No wallet connected</p>
                        <p className="text-sm">Connect a wallet or enter a wallet address to view portfolio data</p>
                      </>
                    ) : walletMode === 'demo' ? (
                      <>
                        <p className="text-xl mb-2">Demo Portfolio Loading...</p>
                        <p className="text-sm">If this persists, refresh the page</p>
                      </>
                    ) : (
                      <>
                        <p className="text-xl mb-2">No portfolio data found</p>
                        <p className="text-sm mb-4">
                          {walletMode === 'connected' 
                            ? 'No portfolio found for your connected wallet' 
                            : 'No portfolio found for this wallet address'}
                        </p>
                        <p className="text-xs text-gray-400">
                          Wallet: {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-6)}` : 'Unknown'}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

