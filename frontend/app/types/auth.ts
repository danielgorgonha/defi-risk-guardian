// Authentication Types for Risk Guardian
// Defines all authentication-related interfaces and types

export type WalletType = 'freighter' | 'xbull' | 'ledger' | 'manual' | 'soroban_domain'
export type NetworkType = 'mainnet' | 'testnet'
export type AuthStatus = 'disconnected' | 'connecting' | 'connected' | 'demo' | 'tracked'

export interface WalletInfo {
  address?: string
  type?: WalletType
  network: NetworkType
  isConnected: boolean
  isDemoMode: boolean
}

export interface AuthState {
  // Core authentication status
  isAuthenticated: boolean
  isDemoMode: boolean
  status: AuthStatus
  
  // Wallet information
  wallet: WalletInfo
  
  // UI state
  showNavigation: boolean
  isInitialized: boolean
  
  // Loading states
  isConnecting: boolean
  isLoading: boolean
}

export interface AuthContextValue extends AuthState {
  // Authentication actions
  connectWallet: (type: WalletType, address?: string) => Promise<void>
  disconnectWallet: () => void
  enableDemoMode: () => void
  disableDemoMode: () => void
  
  // Utility functions
  getWalletDisplayName: () => string
  isWalletConnected: () => boolean
  isDemoModeActive: () => boolean
  canAccessProtectedRoutes: () => boolean
}

// Local storage keys
export const STORAGE_KEYS = {
  IS_DEMO_MODE: 'isDemoMode',
  WALLET_MODE: 'walletMode',
  WALLET_ADDRESS: 'walletAddress',
  WALLET_TYPE: 'walletType',
  SHOW_NAVIGATION: 'showNavigation',
  NETWORK: 'network'
} as const

// Default auth state
export const DEFAULT_AUTH_STATE: AuthState = {
  isAuthenticated: false,
  isDemoMode: false,
  status: 'disconnected',
  wallet: {
    address: undefined,
    type: undefined,
    network: 'mainnet',
    isConnected: false,
    isDemoMode: false
  },
  showNavigation: false,
  isInitialized: false,
  isConnecting: false,
  isLoading: false
}

// Request headers for backend communication
export interface ApiHeaders {
  'X-Wallet-Address': string
  'X-Wallet-Type': string
  'X-Network': string
}

// Demo wallet configuration
export const DEMO_WALLET_CONFIG = {
  address: 'GDEMOWALLETADDRESS1234567890ABCDEF',
  type: 'manual' as WalletType,
  network: 'mainnet' as NetworkType,
  displayName: 'Demo User'
} as const

