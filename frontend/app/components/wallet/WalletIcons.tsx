'use client'

import Image from 'next/image'

interface WalletIconProps {
  wallet: 'freighter' | 'xbull' | 'ledger' | 'key' | 'soroban' | 'lobstr' | 'atomic' | 'solar'
  className?: string
}

export const WalletIcon = ({ wallet, className = "h-4 w-4" }: WalletIconProps) => {
  // For wallets with existing PNG icons
  if (['freighter', 'xbull', 'ledger', 'key', 'soroban'].includes(wallet)) {
    const iconMap = {
      freighter: '/assets/icons/wallets/freighter.png',
      xbull: '/assets/icons/wallets/xbull.png',
      ledger: '/assets/icons/wallets/ledger.png',
      key: '/assets/icons/wallets/key.png',
      soroban: '/assets/icons/wallets/soroban.png'
    }

    return (
      <Image
        src={iconMap[wallet as keyof typeof iconMap]}
        alt={`${wallet} wallet icon`}
        width={16}
        height={16}
        className={className}
      />
    )
  }

  // For new wallets - use SVG icons
  const getSVGIcon = () => {
    switch (wallet) {
      case 'lobstr':
        return (
          <svg viewBox="0 0 16 16" className={className} fill="currentColor">
            <circle cx="8" cy="8" r="8" fill="#4B49F3"/>
            <path d="M6 4h4v2H6V4zm0 3h4v2H6V7zm0 3h4v2H6v-2z" fill="white"/>
          </svg>
        )
      case 'atomic':
        return (
          <svg viewBox="0 0 16 16" className={className} fill="currentColor">
            <circle cx="8" cy="8" r="8" fill="#3B82F6"/>
            <circle cx="8" cy="8" r="4" fill="white"/>
            <circle cx="8" cy="8" r="2" fill="#3B82F6"/>
          </svg>
        )
      case 'solar':
        return (
          <svg viewBox="0 0 16 16" className={className} fill="currentColor">
            <circle cx="8" cy="8" r="8" fill="#F59E0B"/>
            <path d="M8 2l1 3h3l-2.5 2L10 11l-2-1.5L6 11l1.5-4L5 5h3L8 2z" fill="white"/>
          </svg>
        )
      default:
        return (
          <svg viewBox="0 0 16 16" className={className} fill="currentColor">
            <circle cx="8" cy="8" r="8" fill="#6B7280"/>
            <path d="M8 4v8M4 8h8" stroke="white" strokeWidth="1.5" fill="none"/>
          </svg>
        )
    }
  }

  return getSVGIcon()
}
