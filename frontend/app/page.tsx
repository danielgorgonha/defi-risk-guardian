'use client'

import { useState, useEffect } from 'react'
import { 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  BarChart3,
  ArrowRight,
  Star,
  Zap,
  Twitter,
  MessageCircle,
  Github
} from 'lucide-react'
import { PortfolioCard } from './components/dashboard/PortfolioCard'
import { RiskMetrics } from './components/dashboard/RiskMetrics'
import { AlertTimeline } from './components/dashboard/AlertTimeline'
import { AIDedicatedSection } from './components/dashboard/AIDedicatedSection'
import { LoadingSpinner } from './components/common/LoadingSpinner'
import { useToast } from './components/common/ToastProvider'
import { useNavigation } from './contexts/NavigationContext'
import { useWalletStatus } from './hooks/useWalletStatus'
import { useWallet } from './contexts/WalletContext'
import { DemoModeBanner } from './components/common/DemoModeBanner'
import { api, Portfolio, RiskAnalysis, Alert } from './utils/api'

// Mock data for demo
const mockPortfolio = {
  id: 1,
  wallet_address: 'GDEMO1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  risk_tolerance: 0.5,
  total_value: 125000,
  risk_score: 35.2,
  assets: [
    {
      id: 1,
      asset_code: 'XLM',
      balance: 50000,
      price_usd: 0.12,
      value_usd: 6000,
      target_allocation: 40,
      current_allocation: 48
    },
    {
      id: 2,
      asset_code: 'USDC',
      balance: 25000,
      price_usd: 1.0,
      value_usd: 25000,
      target_allocation: 20,
      current_allocation: 20
    },
    {
      id: 3,
      asset_code: 'BTC',
      balance: 0.5,
      price_usd: 45000,
      value_usd: 22500,
      target_allocation: 30,
      current_allocation: 18
    }
  ]
}

const mockRiskAnalysis = {
  portfolio_value: 125000,
  var_95: 2500,
  var_99: 3750,
  volatility: 18.5,
  sharpe_ratio: 1.2,
  beta: 0.8,
  max_drawdown: 12.3,
  risk_score: 35.2,
  recommendations: [
    'Consider reducing XLM allocation to target 40%',
    'Monitor BTC volatility closely',
    'Diversify with additional stable assets'
  ]
}

const mockAlerts = [
  {
    id: 1,
    alert_type: 'rebalance',
    severity: 'medium',
    message: 'XLM allocation is 8% above target. Consider rebalancing.',
    triggered_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    is_active: true
  },
  {
    id: 2,
    alert_type: 'volatility',
    severity: 'low',
    message: 'BTC volatility increased by 15% in the last 24h.',
    triggered_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    is_active: true
  }
]

export default function Home() {
  const [walletAddress, setWalletAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [showWalletConnect, setShowWalletConnect] = useState(false)
  const toast = useToast()
  const { showNavigation, setShowNavigation, isDemoMode, setIsDemoMode, walletMode, setWalletMode } = useNavigation()
  const { canLoadData, walletAddress: currentWalletAddress } = useWalletStatus()
  const { wallet } = useWallet()

  // Demo data
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
        localStorage.setItem('walletAddress', demoWalletAddress)
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
    }
  }, [isDemoMode])

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
      setShowWalletConnect(false)
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

  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!walletAddress.trim()) {
      toast.showError('Validation Error', 'Please enter a wallet address')
      return
    }
    
    setIsLoading(true)
    try {
      // Create user/portfolio via API
      await api.createUser(walletAddress)
      
      // Save wallet address and enable navigation
      localStorage.setItem('walletAddress', walletAddress)
      setShowNavigation(true)
      setWalletMode('tracked') // Mark as manually tracked wallet
      
      toast.showSuccess('Wallet Tracked', 'Your Stellar wallet is now being tracked! Loading portfolio data...')
      
      // Load portfolio data after connection
      setTimeout(async () => {
        await loadPortfolioData()
      }, 100)
      
    } catch (error: any) {
      console.error('Error tracking wallet:', error)
      toast.showError('Tracking Error', error.response?.data?.detail || 'Failed to track wallet')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoMode = async () => {
    setIsLoading(true)
    try {
      // Create demo portfolio in backend
      await api.createDemoPortfolio()
      
      setWalletAddress(demoWalletAddress)
      localStorage.setItem('walletAddress', demoWalletAddress)
      setIsDemoMode(true) // Enable demo mode
      setShowNavigation(true) // Show navigation menus
      setWalletMode('demo') // Mark as demo mode
      toast.showSuccess('Demo Portfolio Created', 'Demo portfolio created successfully! Loading data...')
      
      // Wait a bit for state to update, then load the demo data from backend
      setTimeout(async () => {
        await loadPortfolioData()
      }, 100)
      
    } catch (error: any) {
      console.error('Error creating demo portfolio:', error)
      
      // Fallback to mock data if backend fails
      setWalletAddress(demoWalletAddress)
      localStorage.setItem('walletAddress', demoWalletAddress)
      setIsDemoMode(true)
      setShowNavigation(true) // Show navigation even with mock data
      setWalletMode('demo') // Mark as demo mode
      setPortfolio(mockPortfolio as Portfolio)
      setRiskAnalysis(mockRiskAnalysis as RiskAnalysis)
      setAlerts(mockAlerts as Alert[])
      toast.showInfo('Demo Mode (Offline)', 'Using offline demo data. Backend demo creation failed.')
    } finally {
      setIsLoading(false)
    }
  }


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

  const loadPortfolioData = async () => {
    if (!walletAddress) return
    
    // Don't load data if we can't load data (not in demo mode and no valid wallet)
    if (!canLoadData) {
      setPortfolio(null)
      setRiskAnalysis(null)
      setAlerts([])
      return
    }
    
    setIsLoadingData(true)
    try {
      // Load portfolio data for both demo and real wallets
      try {
        const portfolioData = await api.getPortfolio(walletAddress)
        setPortfolio(portfolioData)
      } catch (portfolioError) {
        console.warn('Portfolio loading failed:', portfolioError)
        // If portfolio doesn't exist but wallet is valid, show message but continue with other data
        if (!isDemoMode) {
          toast.showInfo('Portfolio Empty', 'No assets found in your portfolio. Start by adding some assets.')
        }
        setPortfolio(null)
      }
      
      // Load risk analysis - use demo endpoint if in demo mode, real API for real wallets
      try {
        const riskData = isDemoMode 
          ? await api.getDemoRiskAnalysis()
          : await api.analyzeRisk(walletAddress)
        setRiskAnalysis(riskData)
      } catch (riskError) {
        console.warn('Risk analysis failed:', riskError)
        // For real wallets with no data, don't show mock data
        if (isDemoMode) {
          setRiskAnalysis(mockRiskAnalysis as RiskAnalysis)
        } else {
          setRiskAnalysis(null)
          toast.showInfo('Risk Analysis', 'Unable to calculate risk metrics. Portfolio may be empty or invalid.')
        }
      }
      
      // Load alerts - use demo endpoint if in demo mode, real API for real wallets
      try {
        const alertsData = isDemoMode 
          ? await api.getDemoAlerts()
          : await api.getActiveAlerts(walletAddress)
        setAlerts(alertsData.alerts || alertsData)
      } catch (alertError) {
        console.warn('Alerts loading failed:', alertError)
        // For real wallets with no alerts, just set empty array
        if (isDemoMode) {
          setAlerts(mockAlerts as Alert[])
        } else {
          setAlerts([])
        }
      }
      
    } catch (error: any) {
      console.error('Error loading portfolio data:', error)
      
      // If portfolio doesn't exist, show demo data instead
      if (error.response?.status === 404 || error.response?.status === 400) {
        toast.showInfo('Portfolio Not Found', 'Using demo data. Create a portfolio first.')
        setPortfolio(mockPortfolio as Portfolio)
        setRiskAnalysis(mockRiskAnalysis as RiskAnalysis)
        setAlerts(mockAlerts as Alert[])
      } else {
        toast.showError('Data Loading Error', error.response?.data?.detail || 'Failed to load portfolio data')
      }
    } finally {
      setIsLoadingData(false)
    }
  }

  const features = [
    {
      icon: Shield,
      title: 'Intelligent Risk Analysis',
      description: 'Advanced AI to detect anomalies and calculate real-time risk metrics',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverGlow: 'hover:shadow-lg hover:border-cyan-500'
    },
    {
      icon: TrendingUp,
      title: 'Auto-Rebalancing',
      description: 'Automatic rebalancing based on customizable thresholds',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverGlow: 'hover:shadow-lg hover:border-cyan-500'
    },
    {
      icon: AlertTriangle,
      title: 'Proactive Alerts',
      description: 'Instant notifications about risk changes and opportunities',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hoverGlow: 'hover:shadow-lg hover:border-cyan-500'
    },
    {
      icon: BarChart3,
      title: 'Intuitive Dashboard',
      description: 'Modern and responsive interface for portfolio management',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverGlow: 'hover:shadow-lg hover:border-cyan-500'
    }
  ]

  // Remove hydration check to fix white page issue

  return (
    <div className="min-h-screen bg-white">

      {!showNavigation || walletMode === 'disconnected' ? (
        // Landing Page
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center py-20 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-stellar/10 via-stellar-800/10 to-dark-gray/10"></div>
            
            <div className="relative z-10">
              <div className="flex justify-center mb-8">
                <div className="p-8 bg-gradient-to-br from-blue-900 to-cyan-500 rounded-full shadow-2xl animate-float border-4 border-white">
                  <Shield className="h-24 w-24 text-white drop-shadow-lg" />
                </div>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 animate-fade-in">
                Risk Guardian
              </h1>
              
              <div className="text-lg md:text-xl text-gray-600 mb-2 font-bold">
                Powered by Reflector Oracle & Stellar
              </div>
              <div className="text-lg md:text-xl text-gray-600 mb-12 max-w-4xl mx-auto font-bold">
                AI-powered DeFi Risk Management
              </div>
              
              {/* Trust Badge */}
              <div className="flex justify-center mb-2">
                <div className="px-3 py-1 bg-gray-100 rounded-full border border-gray-200">
                  <span className="text-gray-700 font-medium text-xs">
                    🛡️ Data verified by Reflector Oracle
                  </span>
                </div>
              </div>
              
            </div>
          </div>

          {/* Why Reflector Section */}
          <div className="pt-2 pb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
                Why Reflector Matters for DeFi Risk Management
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Reliable data is the foundation of trust. Risk Guardian leverages Reflector Oracle to deliver accurate, decentralized and tamper-proof price feeds, ensuring smarter and safer DeFi decisions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {/* Trusted Data Feeds Card */}
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-4xl mb-4">🔗</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Trusted Data Feeds
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Reflector provides real-time, decentralized price oracles for fiat, crypto and Stellar assets.
                </p>
              </div>

              {/* Tamper-Proof & Reliable Card */}
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-4xl mb-4">🛡️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Tamper-Proof & Reliable
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Data integrity is guaranteed by Stellar infrastructure, making manipulation nearly impossible.
                </p>
              </div>

              {/* AI + Reflector Card */}
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  AI + Reflector
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Risk Guardian's AI combines Reflector feeds with predictive models to detect anomalies and rebalance portfolios.
                </p>
              </div>
            </div>

          </div>

          {/* Features Section */}
          <div className="pt-12 pb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-black mb-6">
                Why choose Risk Guardian?
              </h2>
              <p className="text-xl text-gray-800 max-w-3xl mx-auto font-semibold">
                We combine artificial intelligence, reliable data and automation 
                to protect your DeFi investments
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div key={index} className={`bg-white p-6 lg:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${feature.hoverGlow} group`}>
                  <div className={`p-3 lg:p-4 ${feature.bgColor} rounded-xl w-fit mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`h-6 w-6 lg:h-8 lg:w-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-black mb-3 group-hover:text-blue-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-800 leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-600 rounded-3xl text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-cyan-500/50"></div>
            <div className="relative z-10">
              <div className="p-6 bg-white/20 rounded-full w-fit mx-auto mb-8 animate-pulse shadow-lg border-2 border-white/30">
                <Zap className="h-20 w-20 text-white drop-shadow-lg" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white drop-shadow-lg">
                Ready to protect your portfolio?
              </h2>
              <p className="text-xl md:text-2xl mb-10 text-white max-w-3xl mx-auto font-semibold drop-shadow-lg">
                Connect your Stellar wallet and start using the most advanced risk management system
              </p>
                              <button
                  onClick={() => {
                    setShowWalletConnect(true)
                    if (typeof window !== 'undefined') {
                      setTimeout(() => {
                        const element = document.getElementById('wallet-connect-section')
                        element?.scrollIntoView({ behavior: 'smooth' })
                      }, 100)
                    }
                  }}
                  className="px-10 py-5 bg-white text-blue-900 rounded-xl hover:bg-gray-100 hover:shadow-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
                >
                  Get Started Now
                </button>
            </div>
          </div>

          {/* Wallet Connect Section */}
          {showWalletConnect && (
            <div id="wallet-connect-section" className="py-20 bg-gray-50">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Connect Your Stellar Wallet
                  </h2>
                  <p className="text-lg text-gray-600">
                    Enter your Stellar wallet address or try our demo to get started
                  </p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <form onSubmit={handleWalletSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stellar Wallet Address
                      </label>
                      <input
                        type="text"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        disabled={isLoading}
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Enter your Stellar public key to analyze your portfolio
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        type="submit"
                        disabled={isLoading || !walletAddress.trim()}
                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                      >
                        {isLoading ? 'Connecting...' : 'Connect Wallet'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleDemoMode}
                        disabled={isLoading}
                        className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                      >
                        {isLoading ? 'Loading...' : 'Try Demo Mode'}
                      </button>
                    </div>
                  </form>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-4">
                        Don't have a Stellar wallet? Get started with these options:
                      </p>
                      <div className="flex justify-center space-x-4">
                        <a
                          href="https://www.freighter.app/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          Freighter Wallet
                        </a>
                        <a
                          href="https://albedo.link/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          Albedo
                        </a>
                        <a
                          href="https://laboratory.stellar.org/#account-creator"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          Stellar Laboratory
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className="mt-20 py-12 bg-gray-50 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-2">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-blue-900 to-cyan-500 rounded-lg">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Risk Guardian</h3>
                  </div>
                  <p className="text-gray-600 mb-4 max-w-md">
                    AI-powered DeFi risk management system using Reflector Oracle and Stellar infrastructure to protect your investments.
                  </p>
                  <div className="flex space-x-4">
                    <a 
                      href="https://twitter.com/riskguardian" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-8 h-8 bg-gray-200 hover:bg-blue-100 rounded-full flex items-center justify-center transition-colors duration-200"
                    >
                      <Twitter className="h-4 w-4 text-gray-600 hover:text-blue-600" />
                    </a>
                    <a 
                      href="https://discord.gg/riskguardian" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-8 h-8 bg-gray-200 hover:bg-indigo-100 rounded-full flex items-center justify-center transition-colors duration-200"
                    >
                      <MessageCircle className="h-4 w-4 text-gray-600 hover:text-indigo-600" />
                    </a>
                    <a 
                      href="https://github.com/riskguardian" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-8 h-8 bg-gray-200 hover:bg-gray-800 rounded-full flex items-center justify-center transition-colors duration-200"
                    >
                      <Github className="h-4 w-4 text-gray-600 hover:text-white" />
                    </a>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Product</h4>
                  <ul className="space-y-2">
                    <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">API</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Documentation</a></li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Support</h4>
                  <ul className="space-y-2">
                    <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Help Center</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Contact Us</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Status</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Community</a></li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <p className="text-gray-500 text-sm">
                    © 2024 Risk Guardian. All rights reserved.
                  </p>
                  <div className="flex space-x-6 mt-4 md:mt-0">
                    <a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">Privacy Policy</a>
                    <a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">Terms of Service</a>
                    <a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">Cookie Policy</a>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      ) : (
        // Dashboard - Added extra top padding to prevent header overlap
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
          <DemoModeBanner />

          {isLoadingData ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
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
      )}
    </div>
  )
}
