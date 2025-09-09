'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  Github,
  LogOut
} from 'lucide-react'
import { useToast } from './components/common/ToastProvider'
import { useNavigation } from './contexts/NavigationContext'
import { useWallet } from './contexts/WalletContext'
import { ConnectWalletModal } from './components/wallet/ConnectWalletModal'
import { api } from './utils/api'
import { DemoModeBanner } from './components/common/DemoModeBanner'

export default function Home() {
  const [walletAddress, setWalletAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const toast = useToast()
  const { showNavigation, setShowNavigation, isDemoMode, setIsDemoMode, walletMode, setWalletMode } = useNavigation()
  const { wallet, connectDemoWallet, disconnectWallet } = useWallet()
  const router = useRouter()

  // Demo data
  const demoWalletAddress = 'GDEMOTEST1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJK'

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
      
      toast.showSuccess('Wallet Tracked', 'Your Stellar wallet is now being tracked! Redirecting to dashboard...')
      
      // Redirect to dashboard
      router.push('/dashboard')
      
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
      // Connect demo wallet to enable AI features
      await connectDemoWallet()
      
      // Set demo mode states
      setWalletAddress(demoWalletAddress)
      localStorage.setItem('walletAddress', demoWalletAddress)
      setIsDemoMode(true) // Enable demo mode
      setShowNavigation(true) // Show navigation menus
      setWalletMode('demo') // Mark as demo mode
      // Note: Demo notification is handled by WalletContext.connectDemoWallet()
      
      toast.showSuccess('Demo Mode Activated', 'Welcome to Risk Guardian Demo! Redirecting to dashboard...')
      
      // Redirect to dashboard
      router.push('/dashboard')
      
    } catch (error: any) {
      console.error('Error activating demo mode:', error)
      
      // Fallback - just show error if backend fails
      toast.showError('Demo Mode Error', 'Failed to activate demo mode. Please try again.')
    } finally {
      setIsLoading(false)
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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="py-15">
          <DemoModeBanner />
        </div>
        {/* Hero Section */}
        <div className="text-center relative overflow-hidden">

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
        <div className="pt-10 pb-20">
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
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="px-10 py-5 bg-white text-blue-900 rounded-xl hover:bg-gray-100 hover:shadow-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
              >
                Get Started Now
              </button>
              {/* <button
                onClick={handleDemoMode}
                disabled={isLoading}
                className="px-10 py-5 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white hover:text-blue-900 hover:shadow-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Loading...' : 'Try Demo'}
              </button> */}
            </div>
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
      
      {/* Connect Wallet Modal */}
      <ConnectWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </div>
  )
}