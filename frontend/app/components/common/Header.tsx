'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Shield, 
  Menu, 
  X, 
  Settings, 
  LogOut,
  User,
  Bell,
  Wallet,
  Eye,
  Star,
  ArrowRight
} from 'lucide-react'
import { useNavigation } from '../../contexts/NavigationContext'
import { useWallet } from '../../contexts/WalletContext'
import { api } from '../../utils/api'
import { useToast } from '../common/ToastProvider'
import { WalletButton } from '../wallet/WalletButton'
import { NotificationsDropdown } from './NotificationsDropdown'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { showNavigation, setShowNavigation, isDemoMode, setIsDemoMode, walletMode, setWalletMode } = useNavigation()
  const { wallet, connectWallet, disconnectWallet, connectDemoWallet } = useWallet()

  // Fix hydration mismatch by ensuring client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Determine actual user status based on multiple sources
  const getActualUserStatus = () => {
    // Check localStorage directly for demo mode (only in browser)
    if (typeof window !== 'undefined') {
      const savedIsDemoMode = localStorage.getItem('isDemoMode') === 'true'
      const savedWalletMode = localStorage.getItem('walletMode')
      
      if (savedIsDemoMode || isDemoMode) {
        return 'demo'
      }
    }
    
    if (isDemoMode) {
      return 'demo'
    }
    
    if (wallet.isConnected) {
      return 'connected'
    }
    
    return walletMode || 'disconnected'
  }
  
  const actualUserStatus = getActualUserStatus()
  const toast = useToast()
  
  // Force sync walletMode when demo mode is detected
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedIsDemoMode = localStorage.getItem('isDemoMode') === 'true'
      if (savedIsDemoMode && walletMode !== 'demo') {
        console.log('🔄 Header: Syncing walletMode to demo')
        setWalletMode('demo')
      }
    }
  }, [walletMode, setWalletMode])

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'Alerts', href: '/alerts' },
    { name: 'Settings', href: '/settings' },
  ]

  // Removed handleConnectWallet - now handled by WalletButton component

  const handleTryDemo = async () => {
    setIsLoading(true)
    try {
      // Connect demo wallet to enable AI features
      await connectDemoWallet()
      
      // Set demo mode and show navigation
      setIsDemoMode(true)
      setWalletMode('demo')
      setShowNavigation(true)
      
      // Redirect to dashboard
      router.push('/dashboard')
      
      // Note: Demo notification is handled by WalletContext.connectDemoWallet() to avoid duplicates
    } catch (error: any) {
      console.error('Demo activation failed:', error)
      toast.showError('Demo Error', 'Failed to activate demo mode')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    // Clear localStorage
    localStorage.removeItem('showNavigation')
    localStorage.removeItem('isDemoMode')
    localStorage.removeItem('walletAddress')
    localStorage.removeItem('walletMode')
    
    // Reset all states
    setIsDemoMode(false)
    setShowNavigation(false)
    
    // Disconnect wallet silently (no duplicate notifications)
    disconnectWallet(true)
    setWalletMode('disconnected')
    
    // Show single success message based on wallet mode
    const messages = {
      demo: 'Demo session ended successfully!',
      connected: 'Wallet disconnected successfully!', 
      tracked: 'Wallet tracking stopped successfully!',
      disconnected: 'Signed out successfully!'
    }
    
    toast.showSuccess('Signed Out', messages[walletMode] || messages.disconnected)
    
    // Immediate redirect for better UX
    router.push('/')
  }

  // Header should be fixed only on landing page (pathname === '/')
  // On all other pages, header should be normal (not fixed)
  const isLandingPage = pathname === '/'
  const headerClasses = isLandingPage 
    ? "fixed top-0 left-0 right-0 z-50 bg-blue-900 shadow-lg" 
    : "relative bg-blue-900 shadow-lg"

  return (
    <header className={headerClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-all duration-300">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white">
                  Risk Guardian
                </h1>
                <p className="text-xs text-white/70">Powered by Reflector Oracle & Stellar</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {showNavigation && (
            <nav className="hidden lg:flex space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    pathname === item.href
                      ? 'text-white bg-white/20 shadow-lg'
                      : 'text-white hover:text-cyan-400 hover:bg-white/10 hover:shadow-md'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center space-x-3">
            {showNavigation ? (
              <>
                {/* Notifications */}
                <NotificationsDropdown />

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-all duration-300 group"
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-lg transition-all duration-300 ${
                      actualUserStatus === 'demo' ? 'bg-gradient-to-r from-orange-500 to-yellow-500' :
                      actualUserStatus === 'connected' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      actualUserStatus === 'tracked' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                      'bg-gradient-to-r from-gray-500 to-gray-600'
                    }`}>
                      {actualUserStatus === 'demo' ? <Star className="h-4 w-4 text-white" /> :
                       actualUserStatus === 'connected' ? <Wallet className="h-4 w-4 text-white" /> :
                       actualUserStatus === 'tracked' ? <Eye className="h-4 w-4 text-white" /> :
                       <User className="h-4 w-4 text-white" />}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-white">
                      {actualUserStatus === 'demo' ? 'Demo User' : 
                       actualUserStatus === 'connected' ? 'Connected Wallet' :
                       actualUserStatus === 'tracked' ? 'Tracked Wallet' : 'User'}
                    </span>
                  </button>

                  {/* Profile dropdown menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[60] animate-slide-up">
                      {/* Wallet Status Badge */}
                      <div className="px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Status</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            actualUserStatus === 'demo' ? 'bg-orange-100 text-orange-600' :
                            actualUserStatus === 'connected' ? 'bg-green-100 text-green-600' :
                            actualUserStatus === 'tracked' ? 'bg-blue-100 text-blue-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {actualUserStatus === 'demo' ? '✨ Demo Mode' :
                             actualUserStatus === 'connected' ? '🔗 Connected' :
                             actualUserStatus === 'tracked' ? '👁️ Tracking' : 'Disconnected'}
                          </span>
                        </div>
                      </div>
                      
                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </Link>
                              <button
                                onClick={() => {
                                  setIsProfileOpen(false)
                                  handleSignOut()
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors duration-200"
                              >
                                <LogOut className="h-4 w-4 mr-3" />
                                Sign out
                              </button>
                    </div>
                  )}
                </div>

                {/* Mobile menu button */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="lg:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                >
                  {isMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </>
            ) : (
              <>
                {/* Only render client-side to avoid hydration mismatch */}
                {isClient && (wallet.isConnected || isDemoMode) && pathname === '/' ? (
                  <>
                    {/* Show connected wallet with integrated Go to Dashboard button */}
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="flex items-center space-x-3 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-all duration-300 group"
                    >
                      <div className="flex items-center space-x-2 text-white">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                          actualUserStatus === 'demo' ? 'bg-gradient-to-r from-orange-500 to-yellow-500' :
                          actualUserStatus === 'connected' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                          actualUserStatus === 'tracked' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                          'bg-gradient-to-r from-gray-500 to-gray-600'
                        }`}>
                          {actualUserStatus === 'demo' ? <Star className="h-3 w-3 text-white" /> :
                           actualUserStatus === 'connected' ? <Wallet className="h-3 w-3 text-white" /> :
                           actualUserStatus === 'tracked' ? <Eye className="h-3 w-3 text-white" /> :
                           <User className="h-3 w-3 text-white" />}
                        </div>
                        <span className="text-sm font-medium">
                          {actualUserStatus === 'demo' ? 'Demo Mode' : 
                           actualUserStatus === 'connected' ? 'Connected' :
                           actualUserStatus === 'tracked' ? 'Tracking' : 'User'}
                        </span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-white group-hover:translate-x-1 transition-transform duration-200" />
                    </button>
                  </>
                ) : (
                  <>
                    {/* Connect Wallet and Try Demo buttons */}
                    <WalletButton />
                    <button 
                      onClick={handleTryDemo}
                      disabled={isLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-300"
                    >
                      {isLoading ? 'Loading...' : 'Try Demo'}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation - Positioned absolutely to avoid expanding header */}
        {showNavigation && isMenuOpen && (
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-blue-900 shadow-lg border-t border-white/20 animate-slide-up z-40">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 ${
                    pathname === item.href
                      ? 'text-white bg-white/20 shadow-lg'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
