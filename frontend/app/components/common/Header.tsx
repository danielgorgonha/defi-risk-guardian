'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Shield, 
  Menu, 
  X, 
  Settings, 
  LogOut,
  User,
  Bell
} from 'lucide-react'
import { useNavigation } from '../../contexts/NavigationContext'
import { api } from '../../utils/api'
import { useToast } from '../common/ToastProvider'
import { WalletButton } from '../wallet/WalletButton'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { showNavigation, setShowNavigation, isDemoMode, setIsDemoMode } = useNavigation()
  const toast = useToast()

  const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'Alerts', href: '/alerts' },
    { name: 'Settings', href: '/settings' },
  ]

  // Removed handleConnectWallet - now handled by WalletButton component

  const handleTryDemo = async () => {
    setIsLoading(true)
    try {
      await api.createDemoPortfolio()
      setIsDemoMode(true)
      setShowNavigation(true)
      toast.showSuccess('Demo Portfolio Created', 'Demo portfolio created successfully!')
      
      // No need to redirect - the state changes will trigger the UI update
    } catch (error: any) {
      console.error('Error creating demo portfolio:', error)
      toast.showError('Demo Error', error.response?.data?.detail || 'Failed to create demo portfolio')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      // Clear demo data from backend if in demo mode
      if (isDemoMode) {
        await api.clearDemoData()
      }
    } catch (error) {
      console.warn('Failed to clear demo data:', error)
      // Continue with sign out even if clearing demo data fails
    }
    
    // Clear localStorage first
    localStorage.removeItem('showNavigation')
    localStorage.removeItem('isDemoMode')
    localStorage.removeItem('walletAddress')
    
    // Then reset all states
    setIsDemoMode(false)
    setShowNavigation(false)
    
    // Show success message
    toast.showSuccess('Signed Out', 'You have been signed out successfully!')
    
    // Redirect to home page
    router.push('/')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-blue-900 shadow-lg">
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
                <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 relative group">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-all duration-300 group"
                  >
                    <div className="h-8 w-8 bg-gradient-to-r from-blue-900 to-cyan-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-lg transition-all duration-300">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-white">
                      Demo User
                    </span>
                  </button>

                  {/* Profile dropdown menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[60] animate-slide-up">
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
