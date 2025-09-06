'use client'

import Image from 'next/image'

interface WalletIconProps {
  wallet: 'freighter' | 'xbull' | 'ledger' | 'key' | 'soroban'
  className?: string
}

export const WalletIcon = ({ wallet, className = "h-4 w-4" }: WalletIconProps) => {
  const iconMap = {
    freighter: '/assets/icons/wallets/freighter.png',
    xbull: '/assets/icons/wallets/xbull.png',
    ledger: '/assets/icons/wallets/ledger.png',
    key: '/assets/icons/wallets/key.png',
    soroban: '/assets/icons/wallets/soroban.png'
  }

  return (
    <Image
      src={iconMap[wallet]}
      alt={`${wallet} wallet icon`}
      width={16}
      height={16}
      className={className}
    />
  )
}
