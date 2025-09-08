'use client'

import React, { useState } from 'react'
import { useWallet } from '../../contexts/WalletContext'
import { useToast } from '../common/ToastProvider'
import { api } from '../../utils/api'
import { Play, Eye, Loader2 } from 'lucide-react'

interface TryDemoButtonProps {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function TryDemoButton({ 
  variant = 'primary', 
  size = 'md',
  className = '' 
}: TryDemoButtonProps) {
  const { enableDemoMode, disableDemoMode, isDemoMode } = useWallet()
  const [isLoading, setIsLoading] = useState(false)

  const handleTryDemo = async () => {
    setIsLoading(true)
    try {
      if (isDemoMode) {
        // Exit demo mode
        disableDemoMode()
      } else {
        // Enter demo mode
        enableDemoMode()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl'
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700 text-white shadow-md hover:shadow-lg'
      case 'outline':
        return 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
      default:
        return 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl'
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-sm'
      case 'md':
        return 'px-6 py-3 text-base'
      case 'lg':
        return 'px-8 py-4 text-lg'
      default:
        return 'px-6 py-3 text-base'
    }
  }

  return (
    <button
      onClick={handleTryDemo}
      disabled={isLoading}
      className={`
        inline-flex items-center space-x-2 font-semibold rounded-xl
        transition-all duration-200 transform hover:scale-105
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : isDemoMode ? (
        <>
          <Eye className="h-4 w-4" />
          <span>Exit Demo</span>
        </>
      ) : (
        <>
          <Play className="h-4 w-4" />
          <span>Try Demo</span>
        </>
      )}
    </button>
  )
}

// Demo Mode Indicator Component
export function DemoModeIndicator() {
  const { isDemoMode, disableDemoMode } = useWallet()

  if (!isDemoMode) return null

  return (
    <div className="fixed top-20 right-4 z-50 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <span className="text-sm font-medium">Demo Mode</span>
      </div>
      <button
        onClick={disableDemoMode}
        className="text-white/80 hover:text-white text-xs underline"
      >
        Exit
      </button>
    </div>
  )
}
