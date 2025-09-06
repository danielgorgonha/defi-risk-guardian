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
    return isDemoMode || (isWalletConnected() && isDemoWallet())
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
