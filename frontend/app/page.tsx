'use client'

import { useState, useEffect } from 'react'
import { 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  BarChart3,
  ArrowRight,
  Star,
  Zap
} from 'lucide-react'
import { PortfolioCard } from './components/dashboard/PortfolioCard'
import { RiskMetrics } from './components/dashboard/RiskMetrics'
import { AlertTimeline } from './components/dashboard/AlertTimeline'
import { LoadingSpinner } from './components/common/LoadingSpinner'

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

  // Demo data
  const demoWalletAddress = 'GDEMO1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ'

  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!walletAddress.trim()) {
      alert('Please enter a wallet address')
      return
    }
    
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      alert('Wallet connected successfully!')
    }, 1000)
  }

  const handleDemoMode = () => {
    setWalletAddress(demoWalletAddress)
    setIsDemoMode(true)
    alert('Demo mode activated!')
  }

  const features = [
    {
      icon: Shield,
      title: 'Intelligent Risk Analysis',
      description: 'Advanced AI to detect anomalies and calculate real-time risk metrics',
      color: 'text-blue-600'
    },
    {
      icon: TrendingUp,
      title: 'Auto-Rebalancing',
      description: 'Automatic rebalancing based on customizable thresholds',
      color: 'text-green-600'
    },
    {
      icon: AlertTriangle,
      title: 'Proactive Alerts',
      description: 'Instant notifications about risk changes and opportunities',
      color: 'text-orange-600'
    },
    {
      icon: BarChart3,
      title: 'Intuitive Dashboard',
      description: 'Modern and responsive interface for portfolio management',
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      {!walletAddress ? (
        // Landing Page
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center py-20">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-blue-100 rounded-full">
                <Shield className="h-16 w-16 text-blue-600" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Risk Guardian
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Intelligent DeFi risk management system using AI, 
              Reflector Oracle data and Stellar infrastructure
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <form onSubmit={handleWalletSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="Enter your Stellar address..."
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-80"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? 'Connecting...' : 'Connect'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
              
              <button
                onClick={handleDemoMode}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
              >
                <Star className="h-4 w-4" />
                Demo Mode
              </button>
            </div>
          </div>

          {/* Features Section */}
          <div className="py-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why choose Risk Guardian?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We combine artificial intelligence, reliable data and automation 
                to protect your DeFi investments
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className={`p-3 bg-gray-100 rounded-lg w-fit mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="py-20 bg-blue-600 rounded-2xl text-center text-white">
            <Zap className="h-12 w-12 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">
              Ready to protect your portfolio?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Connect your Stellar wallet and start using the most advanced risk management system
            </p>
            <button
              onClick={() => document.querySelector('input')?.focus()}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-semibold"
            >
              Get Started Now
            </button>
          </div>
        </div>
      ) : (
        // Dashboard
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isDemoMode && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800 font-medium">Demo Mode Active</span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
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
