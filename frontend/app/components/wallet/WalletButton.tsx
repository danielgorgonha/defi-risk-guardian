'use client'

import React, { useState } from 'react'
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, ArrowRight } from 'lucide-react'
import { useWallet } from '../../contexts/WalletContext'
import { useNavigation } from '../../contexts/NavigationContext'
import { useToast } from '../common/ToastProvider'
import { ConnectWalletModal } from './ConnectWalletModal'

export function WalletButton() {
  const { wallet, disconnectWallet } = useWallet()
  const { showNavigation, setShowNavigation } = useNavigation()
  const toast = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const formatAddress = (address: string | undefined | null | any) => {
    // Handle object format {address: "..."}
    if (address && typeof address === 'object' && 'address' in address) {
      address = (address as any).address
    }
    
    if (!address || typeof address !== 'string') return 'Unknown'
    if (address.length <= 12) return address
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  const copyAddress = async () => {
    try {
      // Handle object format {address: "..."}
      let address = wallet.address
      if (address && typeof address === 'object' && 'address' in address) {
        address = (address as any).address
      }
      
      await navigator.clipboard.writeText(address || '')
      toast.showSuccess('Address Copied', 'Wallet address copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy address:', error)
      toast.showError('Copy Failed', 'Failed to copy address to clipboard')
    }
  }

  const openInStellarExpert = () => {
    // Handle object format {address: "..."}
    let address = wallet.address
    if (address && typeof address === 'object' && 'address' in address) {
      address = (address as any).address
    }
    
    // Use mainnet for real wallets, testnet for demo
    const network = wallet.isDemoMode ? 'testnet' : 'public'
    const url = `https://stellar.expert/explorer/${network}/account/${address}`
    window.open(url, '_blank')
  }

  const handleGoToDashboard = () => {
    setShowNavigation(true)
    setShowDropdown(false)
  }

  if (!wallet.isConnected) {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-700 hover:via-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium text-sm"
        >
          <Wallet className="h-4 w-4" />
          <span>Connect Wallet</span>
        </button>
        <ConnectWalletModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Wallet className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {wallet.isDemoMode ? 'Demo Wallet' : 'Connected Wallet'}
          </span>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* Wallet Info */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="text-sm font-medium text-gray-900">
              {wallet.walletType?.charAt(0).toUpperCase()}{wallet.walletType?.slice(1)} Wallet
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {wallet.network.charAt(0).toUpperCase()}{wallet.network.slice(1)} Network
            </div>
          </div>

          {/* Address */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Address</div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono text-gray-900 break-all">
                {wallet.address}
              </span>
              <button
                onClick={copyAddress}
                className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                title="Copy address"
              >
                <Copy className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="py-2">
            {!showNavigation && (
              <button
                onClick={handleGoToDashboard}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors"
              >
                <ArrowRight className="h-4 w-4" />
                <span>Go to Dashboard</span>
              </button>
            )}
            <button
              onClick={openInStellarExpert}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>View on Stellar Expert</span>
            </button>
            <button
              onClick={() => {
                disconnectWallet()
                setShowDropdown(false)
              }}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}
