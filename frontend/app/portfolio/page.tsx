'use client'

import { useState, useEffect } from 'react'
import { PortfolioCard } from '../components/dashboard/PortfolioCard'
import { api, Portfolio } from '../utils/api'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { useToast } from '../components/common/ToastProvider'
import { useNavigation } from '../contexts/NavigationContext'
import { useWalletStatus } from '../hooks/useWalletStatus'

// Mock data - following Portfolio interface
const mockPortfolio = {
  id: 1,
  wallet_address: 'GDEMO1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  risk_tolerance: 7,
  total_value: 125430.50,
  risk_score: 6.5,
  assets: [
    {
      id: 1,
      asset_code: 'XLM',
      asset_issuer: undefined,
      balance: 50000,
      price_usd: 0.25,
      value_usd: 12500.00,
      target_allocation: 10.0,
      current_allocation: 9.97
    },
    {
      id: 2,
      asset_code: 'USDC',
      asset_issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
      balance: 25000,
      price_usd: 1.00,
      value_usd: 25000.00,
      target_allocation: 20.0,
      current_allocation: 19.94
    },
    {
      id: 3,
      asset_code: 'ETH',
      asset_issuer: undefined,
      balance: 15.5,
      price_usd: 2258.06,
      value_usd: 35000.00,
      target_allocation: 30.0,
      current_allocation: 27.91
    },
    {
      id: 4,
      asset_code: 'BTC',
      asset_issuer: undefined,
      balance: 0.8,
      price_usd: 66163.13,
      value_usd: 52930.50,
      target_allocation: 40.0,
      current_allocation: 42.18
    }
  ]
}

export default function PortfolioPage() {
  const [walletAddress, setWalletAddress] = useState('')
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const { isDemoMode, showNavigation } = useNavigation()
  const { canLoadData } = useWalletStatus()

  // Demo wallet address
  const demoWalletAddress = 'GDEMO1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ'

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
        setPortfolio(mockPortfolio as Portfolio)
      }
    }
  }, [])

  // Sync demo mode when it changes
  useEffect(() => {
    if (isDemoMode && !walletAddress) {
      setWalletAddress(demoWalletAddress)
      localStorage.setItem('walletAddress', demoWalletAddress)
    } else if (!isDemoMode && walletAddress) {
      // Clear wallet address when exiting demo mode
      setWalletAddress('')
      setPortfolio(null)
    }
  }, [isDemoMode])

  // Load portfolio data when wallet is connected
  useEffect(() => {
    if (walletAddress && (isDemoMode || walletAddress.startsWith('GDEMO'))) {
      loadPortfolio()
    } else if (!walletAddress) {
      // Clear data when no wallet address
      setPortfolio(null)
    }
  }, [walletAddress, isDemoMode])

  const loadPortfolio = async () => {
    if (!walletAddress) return
    
    // Don't load data if we can't load data (not in demo mode and no valid wallet)
    if (!canLoadData) {
      setPortfolio(null)
      return
    }
    
    setIsLoading(true)
    try {
      // Only try to load from API if in demo mode
      if (isDemoMode && walletAddress.startsWith('GDEMO')) {
        const portfolioData = await api.getPortfolio(walletAddress)
        setPortfolio(portfolioData)
      } else {
        // For non-demo wallets, show message to connect wallet
        setPortfolio(null)
        toast.showInfo('Connect Wallet', 'Please connect your wallet to view portfolio data.')
      }
    } catch (error: any) {
      console.error('Error loading portfolio:', error)
      
      if (error.response?.status === 404 || error.response?.status === 400) {
        toast.showInfo('Portfolio Not Found', 'Using demo data. Create a portfolio first.')
        setPortfolio(mockPortfolio as Portfolio)
      } else {
        toast.showError('Portfolio Error', error.response?.data?.detail || 'Failed to load portfolio')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio Overview</h1>
          <p className="text-gray-600">Monitor your DeFi investments and performance</p>
          {isDemoMode && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">Demo Mode - Using sample data</p>
            </div>
          )}
        </div>

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
                    <p>No portfolio data available</p>
                    <p className="text-sm mt-2">Connect a wallet to view your portfolio</p>
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
