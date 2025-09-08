'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useToast } from '../components/common/ToastProvider'
import { api } from '../utils/api'

// Types
export interface WalletInfo {
  address: string
  network: 'mainnet' | 'testnet'
  isConnected: boolean
  walletType: 'freighter' | 'xbull' | 'ledger' | 'manual' | 'demo' | null
  isDemoMode?: boolean
}

export interface WalletContextType {
  wallet: WalletInfo
  connectWallet: (addressOrType: string | 'freighter' | 'xbull' | 'ledger' | 'manual', network?: 'mainnet' | 'testnet') => Promise<void>
  connectDemoWallet: () => Promise<void>
  disconnectWallet: (silent?: boolean) => void
  switchNetwork: (network: 'mainnet' | 'testnet') => Promise<void>
  isLoading: boolean
  error: string | null
  clearCorruptedWalletData: () => void
  debugWalletData: () => void
  // Demo mode helpers
  enableDemoMode: () => void
  disableDemoMode: () => void
  isDemoMode: boolean
}

// Context
const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Provider
export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletInfo>({
    address: '',
    network: 'mainnet',
    isConnected: false,
    walletType: null,
    isDemoMode: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const toast = useToast()

  // Load wallet state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedWallet = localStorage.getItem('walletInfo')
        if (savedWallet) {
          const parsedWallet = JSON.parse(savedWallet)
          
          // Ensure address is always a string
          if (parsedWallet.address && typeof parsedWallet.address === 'object') {
            console.log('🔧 Found corrupted wallet data, fixing...', parsedWallet.address)
            // Extract address from object, or use empty string if invalid
            const extractedAddress = parsedWallet.address.address || ''
            if (extractedAddress && typeof extractedAddress === 'string' && extractedAddress.length > 0) {
              parsedWallet.address = extractedAddress
              console.log('✅ Fixed wallet address:', parsedWallet.address)
            } else {
              console.log('⚠️ Invalid address in object, auto-clearing wallet data')
              autoClearCorruptedData()
              return // Don't set the wallet state
            }
          }
          
          setWallet(parsedWallet)
        }
      } catch (error) {
        console.error('Error loading wallet from localStorage:', error)
        // Clear corrupted data
        localStorage.removeItem('walletInfo')
        localStorage.removeItem('walletAddress')
      }
    }

    // Add global debug functions
    if (typeof window !== 'undefined') {
      (window as any).clearWalletData = () => {
        localStorage.removeItem('walletInfo')
        localStorage.removeItem('walletAddress')
        console.log('✅ Cleared wallet data via global function')
        window.location.reload()
      }
      
      (window as any).testFreighterLibrary = async () => {
        try {
          console.log('📚 Testing Freighter Library...')
          const freighterApi = await import('@stellar/freighter-api')
          
          console.log('1️⃣ isConnected:', await freighterApi.isConnected())
          console.log('2️⃣ getAddress:', await freighterApi.getAddress())
          
          const addressResult = await freighterApi.getAddress()
          const address = typeof addressResult === 'string' ? addressResult : addressResult.address
          
          if (address && address.length > 0) {
            console.log('✅ Library working! Address:', address)
          } else {
            console.log('❌ Library connected but no address. Try requestAccess()')
            const accessResult = await freighterApi.requestAccess()
            console.log('3️⃣ requestAccess result:', accessResult)
          }
        } catch (error) {
          console.error('❌ Library test error:', error)
        }
      }
      
    }
  }, [])

  // Load demo mode state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedDemoMode = localStorage.getItem('isDemoMode') === 'true'
      setIsDemoMode(storedDemoMode)
      
      // If demo mode is stored, also restore wallet state
      if (storedDemoMode) {
        const savedWallet = localStorage.getItem('walletInfo')
        if (savedWallet) {
          try {
            const parsedWallet = JSON.parse(savedWallet)
            if (parsedWallet.isDemoMode) {
              setWallet(parsedWallet)
              console.log('🔄 Restored demo wallet state from localStorage')
            }
          } catch (error) {
            console.error('Error restoring demo wallet state:', error)
          }
        }
      }
    }
  }, [])

  // Save wallet state to localStorage
  const saveWalletToStorage = (walletInfo: WalletInfo) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('walletInfo', JSON.stringify(walletInfo))
        localStorage.setItem('walletAddress', walletInfo.address)
      } catch (error) {
        console.error('Error saving wallet to localStorage:', error)
      }
    }
  }

  // Clear corrupted wallet data
  const clearCorruptedWalletData = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('walletInfo')
        localStorage.removeItem('walletAddress')
        setWallet({
          address: '',
          network: 'mainnet',
          isConnected: false,
          walletType: null
        })
        console.log('✅ Cleared corrupted wallet data')
        console.log('🔄 Please refresh the page to see changes')
      } catch (error) {
        console.error('Error clearing wallet data:', error)
      }
    }
  }

  // Auto-clear corrupted data when detected
  const autoClearCorruptedData = () => {
    console.log('🚨 Auto-clearing corrupted wallet data...')
    clearCorruptedWalletData()
    // Show a toast notification
    toast.showWarning('Wallet Data Reset', 'Corrupted wallet data has been cleared. Please reconnect your wallet.')
  }

  // Debug function to check wallet data
  const debugWalletData = () => {
    if (typeof window !== 'undefined') {
      const savedWallet = localStorage.getItem('walletInfo')
      const savedAddress = localStorage.getItem('walletAddress')
      console.log('🔍 Debug Wallet Data:')
      console.log('walletInfo:', savedWallet)
      console.log('walletAddress:', savedAddress)
      console.log('current wallet state:', wallet)
    }
  }

  // Clear wallet from localStorage
  const clearWalletFromStorage = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('walletInfo')
        localStorage.removeItem('walletAddress')
      } catch (error) {
        console.error('Error clearing wallet from localStorage:', error)
      }
    }
  }

  // Check if Freighter is installed
  const isFreighterInstalled = (): boolean => {
    if (typeof window === 'undefined') return false
    return !!(window as any).freighterApi
  }

  // Verify we're using the correct Freighter API (not MetaMask)
  const verifyFreighterAPI = (): boolean => {
    if (typeof window === 'undefined') return false
    const freighterApi = (window as any).freighterApi
    if (!freighterApi) return false
    
    // Check if it has Freighter-specific methods
    return typeof freighterApi.isConnected === 'function' && 
           typeof freighterApi.getPublicKey === 'function'
  }

  // Check if Freighter has an account selected
  const checkFreighterAccount = async (): Promise<boolean> => {
    try {
      const freighterApi = await import('@stellar/freighter-api')
      const addressResult = await freighterApi.getAddress()
      const address = typeof addressResult === 'string' ? addressResult : addressResult.address
      return !!(address && address.length > 0)
    } catch (error) {
      return false
    }
  }

  // Helper function to validate network for an address
  const validateNetworkForAddress = async (address: string, expectedNetwork: 'mainnet' | 'testnet') => {
    try {
      const horizonUrl = expectedNetwork === 'mainnet' 
        ? 'https://horizon.stellar.org' 
        : 'https://horizon-testnet.stellar.org'
      
      const response = await fetch(`${horizonUrl}/accounts/${address}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            `Account ${address} not found on ${expectedNetwork} network. ` +
            `Please switch your Freighter wallet to ${expectedNetwork} network.`
          )
        }
        throw new Error(`Failed to validate network: ${response.statusText}`)
      }
      
      // If we get here, the account exists on the expected network
      return true
    } catch (error: any) {
      if (error.message.includes('not found on')) {
        throw error
      }
      // If it's a network error, we'll assume it's valid and let the user proceed
      console.warn('Network validation failed, proceeding anyway:', error.message)
      return true
    }
  }

  // Connect to Freighter wallet
  const connectFreighter = async (): Promise<string> => {
    if (typeof window === 'undefined') {
      throw new Error('Window is not available')
    }

    try {
      // Try to use the @stellar/freighter-api library first
      const freighterApi = await import('@stellar/freighter-api')
      
      // Note: Freighter API doesn't have setAllowedNetworks method
      // The network is controlled by the user in the Freighter extension
      // We'll validate the network after connection
      
      // Check if Freighter is available
      const isAvailable = await freighterApi.isConnected()
      
      if (!isAvailable) {
        // Try to request connection
        const connectionResult = await freighterApi.requestAccess()
        
        if (!connectionResult) {
          throw new Error('Failed to connect to Freighter wallet. Please approve the connection request.')
        }
      } else {
        // Even if connected, check if we have an address
        const testAddress = await freighterApi.getAddress()
        const testAddr = typeof testAddress === 'string' ? testAddress : testAddress.address
        if (!testAddr || testAddr.length === 0) {
          const connectionResult = await freighterApi.requestAccess()
        }
      }

      // Request address after ensuring connection
      const addressResult = await freighterApi.getAddress()
      
      if (!addressResult) {
        throw new Error('Failed to get public key from Freighter')
      }

      // Handle different return formats
      const address = typeof addressResult === 'string' ? addressResult : addressResult.address
      if (!address || typeof address !== 'string' || address.length === 0) {
        throw new Error('Freighter wallet is not connected or no account is selected. Please connect your wallet and select an account.')
      }

      // Validate network by checking if the address exists on the expected network
      await validateNetworkForAddress(address, wallet.network)

      return address
    } catch (error: any) {
      
      // Fallback to window.freighterApi
      try {
        // Check if Freighter is installed
        if (!isFreighterInstalled()) {
          throw new Error('Freighter wallet is not installed. Please install it from the Chrome Web Store.')
        }

        // Verify we're using the correct Freighter API (not MetaMask)
        if (!verifyFreighterAPI()) {
          throw new Error('Freighter API is not properly configured. Please ensure Freighter is the active wallet.')
        }

        // Ensure we're using the correct Freighter API
        const freighterApi = (window as any).freighterApi
        if (!freighterApi) {
          throw new Error('Freighter API is not available')
        }

        // Note: Freighter API doesn't have setAllowedNetworks method
        // The network is controlled by the user in the Freighter extension

        // Check if Freighter is available
        const isAvailable = await freighterApi.isConnected()
        
        if (!isAvailable) {
          // Try to request connection
          const connectionResult = await freighterApi.requestAccess()
          
          if (!connectionResult) {
            throw new Error('Failed to connect to Freighter wallet. Please approve the connection request.')
          }
        }

        // Request public key after ensuring connection
        const publicKey = await freighterApi.getPublicKey()
        
        if (!publicKey) {
          throw new Error('Failed to get public key from Freighter')
        }

        // Validate network by checking if the address exists on the expected network
        await validateNetworkForAddress(publicKey, wallet.network)

        return publicKey
      } catch (fallbackError: any) {
        if (fallbackError.message.includes('not installed')) {
          throw new Error('Freighter wallet is not installed. Please install it from the Chrome Web Store.')
        }
        throw fallbackError
      }
    }
  }

  // Connect to xBull wallet
  const connectXBull = async (): Promise<string> => {
    if (typeof window === 'undefined') {
      throw new Error('Window is not available')
    }

    // Check if xBull is available
    if (!window.xBull) {
      throw new Error('xBull wallet is not installed. Please install it from the Chrome Web Store.')
    }

    try {
      // Request connection
      const result = await window.xBull.connect()
      if (!result || !result.publicKey) {
        throw new Error('Failed to connect to xBull wallet')
      }
      return result.publicKey
    } catch (error: any) {
      throw new Error(`xBull connection failed: ${error.message}`)
    }
  }

  // Connect to Ledger wallet
  const connectLedger = async (): Promise<string> => {
    // For now, we'll show a message that Ledger support is coming soon
    throw new Error('Ledger wallet support is coming soon. Please use Freighter or xBull for now.')
  }

  // Validate Stellar address
  const validateStellarAddress = (address: string): boolean => {
    // Basic Stellar address validation (starts with G and is 56 characters)
    return /^G[A-Z0-9]{55}$/.test(address)
  }

  // Create user in backend
  const createUserInBackend = async (walletAddress: string) => {
    try {
      console.log('🔄 Creating user in backend for address:', walletAddress)
      await api.createUser(walletAddress)
      console.log('✅ User created successfully in backend')
      toast.showSuccess('Account Setup', 'Your portfolio has been initialized!')
    } catch (error: any) {
      console.warn('⚠️ User creation failed, might already exist:', error)
      // Don't show error toast since user might already exist
      // The important thing is that the wallet is connected
    }
  }

  // Connect wallet function
  const connectWallet = async (addressOrType: string | 'freighter' | 'xbull' | 'ledger' | 'manual', network: 'mainnet' | 'testnet' = 'mainnet') => {
    setIsLoading(true)
    setError(null)

    try {
      // Disable demo mode when connecting real wallet
      disableDemoMode()
      
      let publicKey: string
      const type = addressOrType as 'freighter' | 'xbull' | 'ledger' | 'manual'
      
      switch (type) {
        case 'freighter':
          publicKey = await connectFreighter()
          break
        case 'xbull':
          publicKey = await connectXBull()
          break
        case 'ledger':
          publicKey = await connectLedger()
          break
        case 'manual':
          if (typeof addressOrType !== 'string' || !validateStellarAddress(addressOrType)) {
            throw new Error('Invalid Stellar address provided')
          }
          publicKey = addressOrType
          break
        default:
          throw new Error('Unsupported wallet type')
      }

      // Ensure publicKey is a string and valid
      let addressString = ''
      if (typeof publicKey === 'string' && publicKey.length > 0) {
        addressString = publicKey
      } else if (publicKey && typeof publicKey === 'object' && (publicKey as any).address) {
        const extractedAddress = (publicKey as any).address
        if (typeof extractedAddress === 'string' && extractedAddress.length > 0) {
          addressString = extractedAddress
        }
      }
      
      // Validate address format (Stellar addresses start with 'G' and are 56 characters)
      if (!addressString || addressString.length < 10) {
        throw new Error('Invalid wallet address received')
      }
      

      const newWallet: WalletInfo = {
        address: addressString,
        network: network,
        isConnected: true,
        walletType: type,
        isDemoMode: false
      }

      setWallet(newWallet)
      saveWalletToStorage(newWallet)

      toast.showSuccess('Wallet Connected', `Successfully connected to ${type} wallet!`)

      // Create user in backend
      await createUserInBackend(addressString)
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to connect wallet'
      setError(errorMessage)
      toast.showError('Connection Failed', errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Disconnect wallet
  const disconnectWallet = (silent = false) => {
    // Disable demo mode when disconnecting (silently)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isDemoMode')
      setIsDemoMode(false)
      // No toast notification for demo mode disable during disconnect
    }
    
    setWallet({
      address: '',
      network: 'mainnet',
      isConnected: false,
      walletType: null,
      isDemoMode: false
    })
    clearWalletFromStorage()
    
    // Only show notification if not called silently (e.g., from Header sign out)
    if (!silent) {
      toast.showInfo('Wallet Disconnected', 'You have been disconnected from your wallet.')
    }
  }

  // Switch network
  const switchNetwork = async (network: 'mainnet' | 'testnet') => {
    setIsLoading(true)
    try {
      // If wallet is connected, disconnect it when switching networks
      if (wallet.isConnected) {
        disconnectWallet()
        toast.showInfo('Wallet Disconnected', 'Wallet disconnected due to network change')
      }
      
      const updatedWallet = { 
        address: '',
        network,
        isConnected: false,
        walletType: null,
        isDemoMode: false
      }
      setWallet(updatedWallet)
      saveWalletToStorage(updatedWallet)
      toast.showSuccess('Network Switched', `Switched to ${network} network`)
    } catch (error: any) {
      toast.showError('Network Switch Failed', error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Connect demo wallet function
  const connectDemoWallet = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const demoWalletAddress = "GDEMO1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ"

      const newWallet: WalletInfo = {
        address: demoWalletAddress,
        network: 'mainnet', // Demo always uses mainnet
        isConnected: true,
        walletType: 'demo',
        isDemoMode: true
      }

      setWallet(newWallet)
      saveWalletToStorage(newWallet)
      enableDemoMode()

      toast.showSuccess('Demo Mode Activated', 'Demo portfolio connected! All features are now available with sample data.')
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to connect demo wallet'
      setError(errorMessage)
      toast.showError('Demo Connection Failed', errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Demo mode functions
  const enableDemoMode = () => {
    if (typeof window !== 'undefined') {
      const wasAlreadyInDemo = localStorage.getItem('isDemoMode') === 'true'
      if (!wasAlreadyInDemo) {
        localStorage.setItem('isDemoMode', 'true')
        setIsDemoMode(true)
        // Note: Demo notification is handled by connectDemoWallet() to avoid duplicates
      } else {
        // Just update state without notification
        setIsDemoMode(true)
      }
    }
  }

  const disableDemoMode = () => {
    if (typeof window !== 'undefined') {
      const wasInDemo = localStorage.getItem('isDemoMode') === 'true'
      if (wasInDemo) {
        localStorage.removeItem('isDemoMode')
        setIsDemoMode(false)
        toast.showInfo('Demo Mode', 'Demo mode disabled. Returning to normal operation.')
      } else {
        // Just update state without notification
        setIsDemoMode(false)
      }
    }
  }

  const value: WalletContextType = {
    wallet,
    connectWallet,
    connectDemoWallet,
    disconnectWallet,
    switchNetwork,
    isLoading,
    error,
    clearCorruptedWalletData,
    debugWalletData,
    enableDemoMode,
    disableDemoMode,
    isDemoMode
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

// Hook to use wallet context
export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

// Extend Window interface for wallet APIs
declare global {
  interface Window {
    freighterApi?: {
      isConnected: () => Promise<boolean>
      getPublicKey: () => Promise<string>
      signTransaction: (transaction: any) => Promise<any>
    }
    xBull?: {
      connect: () => Promise<{ publicKey: string }>
      signTransaction: (transaction: any) => Promise<any>
    }
  }
}
