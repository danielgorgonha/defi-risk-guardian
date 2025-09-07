'use client'

import { useNavigation } from '../contexts/NavigationContext'
import { useWallet } from '../contexts/WalletContext'

export function useWalletStatus() {
  const { isDemoMode } = useNavigation()
  const { wallet } = useWallet()
  
  const isWalletConnected = () => {
    return wallet.isConnected && !!wallet.address
  }
  
  const isDemoWallet = (walletAddress?: string) => {
    const address = walletAddress || wallet.address
    return !!(address && typeof address === 'string' && address.startsWith('GDEMO'))
  }
  
  const canLoadData = () => {
    // Allow loading data if:
    // 1. In demo mode, OR
    // 2. Wallet is connected (regardless of demo or real)
    return isDemoMode || isWalletConnected()
  }
  
  const getWalletAddress = () => {
    return wallet.address || ''
  }
  
  return {
    isWalletConnected: isWalletConnected(),
    isDemoMode,
    isDemoWallet: isDemoWallet(),
    canLoadData: canLoadData(),
    walletAddress: getWalletAddress()
  }
}
