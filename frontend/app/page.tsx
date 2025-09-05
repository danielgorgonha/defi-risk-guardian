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
import { LoadingSpinner } from './components/common/LoadingSpinner'
import { useToast } from './components/common/ToastProvider'

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
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  // Demo data
  const demoWalletAddress = 'GDEMO1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ'

  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!walletAddress.trim()) {
      toast.showError('Validation Error', 'Please enter a wallet address')
      return
    }
    
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast.showSuccess('Wallet Connected', 'Your Stellar wallet has been connected successfully!')
    }, 1000)
  }

  const handleDemoMode = () => {
    setWalletAddress(demoWalletAddress)
    setIsDemoMode(true)
    toast.showInfo('Demo Mode Activated', 'You are now viewing demo data. Connect a real wallet for live data.')
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

      {!walletAddress ? (
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
              
              <div className="max-w-4xl mx-auto mb-8">
                <label className="block text-sm font-bold text-black mb-3 text-left">
                  Connect your wallet
                </label>
                <form onSubmit={handleWalletSubmit} className="flex flex-col lg:flex-row gap-3">
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Enter your Stellar address..."
                    className="flex-1 px-6 py-4 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-reflector focus:border-reflector transition-all duration-300 text-lg bg-white shadow-sm placeholder:text-gray-600 placeholder:font-medium"
                  />
                  <div className="flex flex-col sm:flex-row gap-3 lg:flex-col xl:flex-row">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-8 py-4 bg-gradient-to-r from-blue-900 to-cyan-500 text-white rounded-xl hover:shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 transition-all duration-300 font-semibold text-lg min-w-[140px]"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          Connect
                          <span className="text-lg">🔗</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleDemoMode}
                      className="px-8 py-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 hover:shadow-lg flex items-center justify-center gap-3 transition-all duration-300 font-semibold text-lg min-w-[140px]"
                    >
                      <span className="text-lg">▶️</span>
                      Try Demo
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Trust Badge */}
              <div className="flex justify-center mb-4">
                <div className="px-6 py-3 bg-gray-100 rounded-full border border-gray-200">
                  <span className="text-gray-700 font-medium text-sm">
                    🛡️ Data verified by Reflector Oracle
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Why Reflector Section */}
          <div className="pt-12 pb-20">
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
                    if (typeof window !== 'undefined') {
                      document.querySelector('input')?.focus()
                    }
                  }}
                  className="px-10 py-5 bg-white text-blue-900 rounded-xl hover:bg-gray-100 hover:shadow-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
                >
                  Get Started Now
                </button>
            </div>
          </div>

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
        // Dashboard
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isDemoMode && (
            <div className="mb-6 p-4 bg-gradient-to-r from-reflector/10 to-reflector/5 border border-reflector/20 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-cyan-700" />
                  <span className="text-cyan-700 font-bold">Demo Mode Active</span>
                </div>
                <button
                  onClick={() => {
                    setWalletAddress('')
                    setIsDemoMode(false)
                  }}
                  className="px-4 py-2 text-sm bg-white text-cyan-700 border border-cyan-300 rounded-lg hover:bg-cyan-50 transition-all duration-300 font-medium"
                >
                  Reset
                </button>
              </div>
              <p className="text-gray-800 text-sm mt-2 font-medium">
                You are viewing demo data. Connect a real wallet to use the complete system.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Portfolio Overview */}
            <div className="lg:col-span-2">
              <PortfolioCard portfolio={mockPortfolio} />
            </div>

            {/* Risk Metrics */}
            <div>
              <RiskMetrics riskAnalysis={mockRiskAnalysis} />
            </div>
          </div>

          {/* Alerts */}
          <div className="mt-8">
            <AlertTimeline alerts={mockAlerts} />
          </div>
        </div>
      )}
    </div>
  )
}
