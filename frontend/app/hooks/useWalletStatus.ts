'use client'

import { useNavigation } from '../contexts/NavigationContext'

export function useWalletStatus() {
  const { isDemoMode } = useNavigation()
  
  const isWalletConnected = () => {
    if (typeof window === 'undefined') return false
    const walletAddress = localStorage.getItem('walletAddress')
    return !!(walletAddress && walletAddress.length > 0)
  }
  
  const isDemoWallet = (walletAddress?: string) => {
    if (typeof window === 'undefined') return false
    const address = walletAddress || localStorage.getItem('walletAddress')
    return !!(address && address.startsWith('GDEMO'))
  }
  
  const canLoadData = () => {
    return isDemoMode || (isWalletConnected() && isDemoWallet())
  }
  
  const getWalletAddress = () => {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem('walletAddress') || ''
  }
  
  return {
    isWalletConnected: isWalletConnected(),
    isDemoMode,
    isDemoWallet: isDemoWallet(),
    canLoadData: canLoadData(),
    walletAddress: getWalletAddress()
  }
}
