'use client'

import React, { useState, useEffect } from 'react'
import { X, Wallet, ChevronRight, ChevronDown } from 'lucide-react'
import { useWallet } from '../../contexts/WalletContext'
import { WalletIcon } from './WalletIcons'

// Wallet icons are now handled by WalletIcon component

interface ConnectWalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ConnectWalletModal({ isOpen, onClose }: ConnectWalletModalProps) {
  const { connectWallet, switchNetwork, wallet, isLoading } = useWallet()
  const [manualAddress, setManualAddress] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)
  const [sorobanDomain, setSorobanDomain] = useState('')
  const [showSorobanInput, setShowSorobanInput] = useState(false)
  const [isConnecting, setIsConnecting] = useState<string | null>(null)
  const [isFreighterAvailable, setIsFreighterAvailable] = useState(false)
  const [isXBullAvailable, setIsXBullAvailable] = useState(false)

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [isOpen])

  // Update modal when wallet network changes
  useEffect(() => {
    // This ensures the modal re-renders when network changes
  }, [wallet.network])

  // Check for wallet availability when modal opens
  useEffect(() => {
    if (isOpen) {
      const checkWallets = async () => {
        if (typeof window !== 'undefined') {
          // Check Freighter - multiple possible names and locations
          const freighterChecks = [
            (window as any).freighterApi,
            (window as any).freighter,
            (window as any).stellar?.freighter,
            (window as any).__freighterApi
          ]
          
          const freighterApi = freighterChecks.find(api => 
            api && 
            (typeof api.isConnected === 'function' || 
             typeof api.getPublicKey === 'function' ||
             typeof api.connect === 'function')
          )
          
          // Also check if @stellar/freighter-api library is available
          let freighterLibraryAvailable = false
          try {
            const freighterApi = await import('@stellar/freighter-api')
            freighterLibraryAvailable = !!freighterApi
          } catch (error) {
            freighterLibraryAvailable = false
          }
          
          const freighterAvailable = !!freighterApi || freighterLibraryAvailable
          setIsFreighterAvailable(freighterAvailable)

          // Check xBull - multiple possible names
          const xBullChecks = [
            (window as any).xBull,
            (window as any).xbull,
            (window as any).stellar?.xBull,
            (window as any).__xBull
          ]
          
          const xBull = xBullChecks.find(bull => 
            bull && typeof bull === 'object'
          )
          
          const xBullAvailable = !!xBull
          setIsXBullAvailable(xBullAvailable)

        } else {
          setIsFreighterAvailable(false)
          setIsXBullAvailable(false)
        }
      }

      // Check immediately
      checkWallets()

      // Check multiple times with increasing delays
      const timeouts = [
        setTimeout(checkWallets, 100),
        setTimeout(checkWallets, 500),
        setTimeout(checkWallets, 1000),
        setTimeout(checkWallets, 2000),
        setTimeout(checkWallets, 5000)
      ]
      
      return () => timeouts.forEach(clearTimeout)
    }
  }, [isOpen])


  // Get the correct store URL based on browser
  const getStoreUrl = (extensionId: string) => {
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : ''
    
    if (userAgent.includes('Brave')) {
      return `https://chrome.google.com/webstore/detail/${extensionId}`
    } else if (userAgent.includes('Edg')) {
      return `https://microsoftedge.microsoft.com/addons/detail/${extensionId}`
    } else if (userAgent.includes('Firefox')) {
      return `https://addons.mozilla.org/en-US/firefox/addon/${extensionId}`
    } else {
      // Default to Chrome Web Store
      return `https://chrome.google.com/webstore/detail/${extensionId}`
    }
  }

  if (!isOpen) return null

  const handleConnect = async (type: 'freighter' | 'xbull' | 'ledger' | 'manual', address?: string) => {
    setIsConnecting(type)
    try {
      await connectWallet(type, address)
      onClose()
    } catch (error) {
      // Error is handled by the context
    } finally {
      setIsConnecting(null)
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (manualAddress.trim()) {
      await handleConnect('manual', manualAddress.trim())
    }
  }

  const handleSorobanSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sorobanDomain.trim()) {
      // TODO: Implement Soroban domain resolution
      console.log('Resolving Soroban domain:', sorobanDomain)
      // For now, just show a placeholder
      alert(`Domain resolution for "${sorobanDomain}" would be implemented here`)
    }
  }


  const walletOptions = [
    {
      id: 'freighter',
      name: 'Freighter',
      description: isFreighterAvailable ? 'Available' : 'Try Connect',
      icon: 'freighter',
      isAvailable: isFreighterAvailable,
      extensionId: 'fkgcfndcdfbhncdpmnhfmkacjkccpfjg'
    },
    {
      id: 'xbull',
      name: 'xBull',
      description: isXBullAvailable ? 'Available' : 'Try Connect',
      icon: 'xbull',
      isAvailable: isXBullAvailable,
      extensionId: 'xbull-wallet'
    },
    {
      id: 'ledger',
      name: 'Ledger',
      description: 'Hardware wallet',
      icon: 'ledger',
      isAvailable: false
    }
  ]

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-2xl shadow-2xl border border-blue-500/20 w-full max-w-md max-h-[90vh] overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
              <p className="text-sm text-blue-200">Connect your Stellar wallet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>



        {/* Network Selection */}
        <div className="p-6 border-b border-white/20">
          <div className="flex space-x-2 bg-white/10 backdrop-blur-sm p-1 rounded-lg border border-white/20">
            <button
              onClick={() => switchNetwork('mainnet')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                wallet.network === 'mainnet'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              Mainnet
            </button>
            <button
              onClick={() => switchNetwork('testnet')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                wallet.network === 'testnet'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              Testnet
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3 max-h-96 overflow-y-auto wallet-modal-scrollbar">
          {/* Manual Address Entry */}
          <button
            onClick={() => setShowManualInput(!showManualInput)}
            className="w-full flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm hover:bg-white/15 rounded-lg border border-white/20 transition-all duration-300"
          >
            <div className="flex items-center space-x-3">
              <div className="p-1.5 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-md border border-blue-400/30">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-blue-400" fill="currentColor">
                  <path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34c-.39-.39-1.02-.39-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z"/>
                </svg>
              </div>
              <div className="text-left">
                <div className="font-medium text-white text-sm">Enter address manually</div>
                <div className="text-xs text-blue-200">View any account by public key</div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-blue-300" />
          </button>

          {/* Stellar Public Key Section - Expandible */}
          {showManualInput && (
            <div className="space-y-3 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <div>
                <h3 className="text-white font-medium text-sm mb-1">Stellar Public Key</h3>
                <p className="text-xs text-blue-200">Enter a Stellar address to view account details (no signing required)</p>
              </div>
              <form onSubmit={handleManualSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="GABC...XYZ"
                  className="flex-1 px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-blue-200 text-sm"
                />
                <button
                  type="submit"
                  disabled={!manualAddress.trim() || isConnecting === 'manual'}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium text-sm flex items-center space-x-2 shadow-lg"
                >
                  <span>+</span>
                  <span>Connect</span>
                </button>
              </form>
            </div>
          )}

          {/* Soroban Domains */}
          <button
            onClick={() => setShowSorobanInput(!showSorobanInput)}
            className="w-full flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm hover:bg-white/15 rounded-lg border border-white/20 transition-all duration-300"
          >
            <div className="flex items-center space-x-3">
              <div className="p-1.5 bg-white/20 rounded-md">
                <WalletIcon wallet="soroban" className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="font-medium text-white text-sm">Soroban Domains</div>
                <div className="text-xs text-blue-200">Resolve domain to address</div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-blue-300" />
          </button>

          {/* Soroban Domain Section - Expandible */}
          {showSorobanInput && (
            <div className="space-y-3 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <div>
                <h3 className="text-white font-medium text-sm mb-1">Soroban Domain</h3>
                <p className="text-xs text-blue-200">Enter a domain name to resolve to Stellar address</p>
              </div>
              <form onSubmit={handleSorobanSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={sorobanDomain}
                  onChange={(e) => setSorobanDomain(e.target.value)}
                  placeholder="mydomain"
                  className="flex-1 px-3 py-2 bg-white/10 backdrop-blur-sm border border-yellow-400/50 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-blue-200 text-sm"
                />
                <button
                  type="submit"
                  disabled={!sorobanDomain.trim() || isConnecting === 'soroban'}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium text-sm flex items-center space-x-2 shadow-lg"
                >
                  <span>+</span>
                  <span>Resolve</span>
                </button>
              </form>
            </div>
          )}

          {/* Wallet Options */}
          {walletOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  if (option.isAvailable) {
                    handleConnect(option.id as any)
                  } else if (option.id === 'freighter' || option.id === 'xbull') {
                    // Try to connect even if not detected, then fallback to install
                    handleConnect(option.id as any).catch(() => {
                      // If connection fails, open installation page
                      const storeUrl = getStoreUrl(option.extensionId || '')
                      window.open(storeUrl, '_blank')
                    })
                  }
                }}
                disabled={isConnecting === option.id}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                  option.isAvailable
                    ? 'bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 hover:shadow-lg'
                    : option.id === 'freighter' || option.id === 'xbull'
                    ? 'bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 hover:shadow-lg'
                    : 'bg-white/5 border-white/10 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-1.5 ${option.isAvailable ? 'bg-white/20' : 'bg-white/10'} rounded-md`}>
                    <WalletIcon wallet={option.icon as any} className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className={`font-medium text-sm ${option.isAvailable ? 'text-white' : 'text-gray-400'}`}>{option.name}</div>
                    <div className={`text-xs ${option.isAvailable ? 'text-blue-200' : 'text-gray-500'}`}>{option.description}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isConnecting === option.id && (
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-400 border-t-transparent"></div>
                  )}
                  {option.isAvailable && (
                    <ChevronRight className="h-4 w-4 text-blue-300" />
                  )}
                </div>
              </button>
            ))}

          {/* See More Wallets */}
          <div className="pt-2">
            <button className="w-full flex items-center justify-center space-x-2 text-sm text-yellow-400 hover:text-yellow-300 transition-colors">
              <span>See more wallets (3)</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
