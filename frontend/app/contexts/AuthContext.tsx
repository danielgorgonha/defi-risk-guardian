'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '../components/common/ToastProvider'
import { 
  AuthState, 
  AuthContextValue, 
  WalletType, 
  AuthStatus,
  DEFAULT_AUTH_STATE,
  STORAGE_KEYS,
  DEMO_WALLET_CONFIG
} from '../types/auth'

// Action types for reducer
type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CONNECTING'; payload: boolean }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'CONNECT_WALLET'; payload: { address: string; type: WalletType } }
  | { type: 'DISCONNECT_WALLET' }
  | { type: 'ENABLE_DEMO_MODE' }
  | { type: 'DISABLE_DEMO_MODE' }
  | { type: 'SET_NAVIGATION'; payload: boolean }
  | { type: 'RESTORE_FROM_STORAGE'; payload: Partial<AuthState> }

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_CONNECTING':
      return { ...state, isConnecting: action.payload }
    
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload }
    
    case 'CONNECT_WALLET':
      return {
        ...state,
        isAuthenticated: true,
        isDemoMode: false,
        status: 'connected',
        wallet: {
          address: action.payload.address,
          type: action.payload.type,
          network: 'mainnet',
          isConnected: true,
          isDemoMode: false
        },
        showNavigation: true,
        isConnecting: false
      }
    
    case 'DISCONNECT_WALLET':
      return {
        ...DEFAULT_AUTH_STATE,
        isInitialized: true
      }
    
    case 'ENABLE_DEMO_MODE':
      return {
        ...state,
        isAuthenticated: true,
        isDemoMode: true,
        status: 'demo',
        wallet: {
          address: DEMO_WALLET_CONFIG.address,
          type: DEMO_WALLET_CONFIG.type,
          network: DEMO_WALLET_CONFIG.network,
          isConnected: true,
          isDemoMode: true
        },
        showNavigation: true,
        isConnecting: false
      }
    
    case 'DISABLE_DEMO_MODE':
      return {
        ...DEFAULT_AUTH_STATE,
        isInitialized: true
      }
    
    case 'SET_NAVIGATION':
      return { ...state, showNavigation: action.payload }
    
    case 'RESTORE_FROM_STORAGE':
      return { ...state, ...action.payload }
    
    default:
      return state
  }
}

// Create context
const AuthContext = createContext<AuthContextValue | null>(null)

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, DEFAULT_AUTH_STATE)
  const router = useRouter()
  const toast = useToast()

  // Initialize from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const savedIsDemoMode = localStorage.getItem(STORAGE_KEYS.IS_DEMO_MODE) === 'true'
        const savedWalletAddress = localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS)
        const savedWalletType = localStorage.getItem(STORAGE_KEYS.WALLET_TYPE) as WalletType
        const savedShowNavigation = localStorage.getItem(STORAGE_KEYS.SHOW_NAVIGATION) === 'true'

        if (savedIsDemoMode) {
          // Restore demo mode
          dispatch({ type: 'ENABLE_DEMO_MODE' })
          console.log('🎭 Auth: Restored demo mode from localStorage')
        } else if (savedWalletAddress && savedWalletType) {
          // Restore wallet connection
          dispatch({ 
            type: 'CONNECT_WALLET', 
            payload: { address: savedWalletAddress, type: savedWalletType }
          })
          console.log('🔗 Auth: Restored wallet connection from localStorage')
        }

        if (savedShowNavigation) {
          dispatch({ type: 'SET_NAVIGATION', payload: true })
        }

        dispatch({ type: 'SET_INITIALIZED', payload: true })
      } catch (error) {
        console.error('❌ Auth: Failed to initialize from localStorage:', error)
        dispatch({ type: 'SET_INITIALIZED', payload: true })
      }
    }

    initializeAuth()
  }, [])

  // Persist to localStorage whenever state changes
  useEffect(() => {
    if (!state.isInitialized) return

    try {
      if (state.isDemoMode) {
        localStorage.setItem(STORAGE_KEYS.IS_DEMO_MODE, 'true')
        localStorage.setItem(STORAGE_KEYS.WALLET_MODE, 'demo')
        localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS)
        localStorage.removeItem(STORAGE_KEYS.WALLET_TYPE)
      } else if (state.isAuthenticated && state.wallet.address) {
        localStorage.setItem(STORAGE_KEYS.IS_DEMO_MODE, 'false')
        localStorage.setItem(STORAGE_KEYS.WALLET_MODE, 'connected')
        localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, state.wallet.address)
        localStorage.setItem(STORAGE_KEYS.WALLET_TYPE, state.wallet.type || 'manual')
      } else {
        // Clear all auth data
        Object.values(STORAGE_KEYS).forEach(key => {
          localStorage.removeItem(key)
        })
      }

      localStorage.setItem(STORAGE_KEYS.SHOW_NAVIGATION, state.showNavigation.toString())
    } catch (error) {
      console.error('❌ Auth: Failed to persist to localStorage:', error)
    }
  }, [state.isAuthenticated, state.isDemoMode, state.wallet.address, state.wallet.type, state.showNavigation, state.isInitialized])

  // Auth actions
  const connectWallet = async (type: WalletType, address?: string) => {
    dispatch({ type: 'SET_CONNECTING', payload: true })
    
    try {
      let walletAddress = address

      if (!walletAddress) {
        // Implement wallet connection logic based on type
        switch (type) {
          case 'freighter':
            // TODO: Implement Freighter connection
            throw new Error('Freighter connection not implemented yet')
          case 'xbull':
            // TODO: Implement xBull connection
            throw new Error('xBull connection not implemented yet')
          case 'ledger':
            // TODO: Implement Ledger connection
            throw new Error('Ledger connection not implemented yet')
          case 'manual':
            // Manual address entry - address should be provided
            if (!address) throw new Error('Address required for manual connection')
            walletAddress = address
            break
          case 'soroban_domain':
            // TODO: Implement Soroban Domain resolution
            throw new Error('Soroban Domain connection not implemented yet')
          default:
            throw new Error(`Unsupported wallet type: ${type}`)
        }
      }

      if (!walletAddress) {
        throw new Error('Failed to get wallet address')
      }

      dispatch({ 
        type: 'CONNECT_WALLET', 
        payload: { address: walletAddress, type }
      })

      toast.showSuccess('Wallet Connected', `Successfully connected ${type} wallet`)
      console.log(`🔗 Auth: Connected ${type} wallet: ${walletAddress}`)
      
    } catch (error: any) {
      console.error('❌ Auth: Wallet connection failed:', error)
      toast.showError('Connection Failed', error.message || 'Failed to connect wallet')
      dispatch({ type: 'SET_CONNECTING', payload: false })
      throw error
    }
  }

  const disconnectWallet = () => {
    dispatch({ type: 'DISCONNECT_WALLET' })
    toast.showSuccess('Disconnected', 'Wallet disconnected successfully')
    console.log('🔌 Auth: Wallet disconnected')
    router.push('/')
  }

  const enableDemoMode = () => {
    dispatch({ type: 'ENABLE_DEMO_MODE' })
    toast.showSuccess('Demo Mode', 'Demo mode activated with sample data')
    console.log('🎭 Auth: Demo mode enabled')
  }

  const disableDemoMode = () => {
    dispatch({ type: 'DISABLE_DEMO_MODE' })
    toast.showSuccess('Demo Ended', 'Demo mode deactivated')
    console.log('🎭 Auth: Demo mode disabled')
    router.push('/')
  }

  // Utility functions
  const getWalletDisplayName = (): string => {
    if (state.isDemoMode) return DEMO_WALLET_CONFIG.displayName
    if (state.wallet.type) return state.wallet.type.charAt(0).toUpperCase() + state.wallet.type.slice(1)
    return 'Connected Wallet'
  }

  const isWalletConnected = (): boolean => {
    return state.isAuthenticated && !state.isDemoMode
  }

  const isDemoModeActive = (): boolean => {
    return state.isDemoMode
  }

  const canAccessProtectedRoutes = (): boolean => {
    return state.isAuthenticated
  }

  const contextValue: AuthContextValue = {
    ...state,
    connectWallet,
    disconnectWallet,
    enableDemoMode,
    disableDemoMode,
    getWalletDisplayName,
    isWalletConnected,
    isDemoModeActive,
    canAccessProtectedRoutes
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Export for convenience
export { AuthContext }

