/**
 * Utility functions for formatting data
 */

export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercentage(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100)
}

export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatLargeNumber(value: number): string {
  if (value >= 1e9) {
    return (value / 1e9).toFixed(1) + 'B'
  }
  if (value >= 1e6) {
    return (value / 1e6).toFixed(1) + 'M'
  }
  if (value >= 1e3) {
    return (value / 1e3).toFixed(1) + 'K'
  }
  return value.toFixed(2)
}

export function formatWalletAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (address.length <= startChars + endChars) {
    return address
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

export function formatDate(date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    case 'long':
      return dateObj.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    case 'relative':
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)
      
      if (diffInSeconds < 60) {
        return 'agora'
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60)
        return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600)
        return `há ${hours} hora${hours > 1 ? 's' : ''}`
      } else {
        const days = Math.floor(diffInSeconds / 86400)
        return `há ${days} dia${days > 1 ? 's' : ''}`
      }
    default:
      return dateObj.toLocaleDateString('pt-BR')
  }
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  } else {
    return `${remainingSeconds}s`
  }
}

export function formatRiskScore(score: number): string {
  if (score < 30) return 'Baixo'
  if (score < 60) return 'Médio'
  if (score < 80) return 'Alto'
  return 'Crítico'
}

export function getRiskColor(score: number): string {
  if (score < 30) return 'text-green-600 bg-green-100'
  if (score < 60) return 'text-orange-600 bg-orange-100'
  if (score < 80) return 'text-red-600 bg-red-100'
  return 'text-red-800 bg-red-200'
}

export function formatAssetCode(code: string): string {
  return code.toUpperCase()
}

export function formatAssetName(code: string): string {
  const assetNames: Record<string, string> = {
    'XLM': 'Stellar Lumens',
    'USDC': 'USD Coin',
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'USDT': 'Tether USD',
    'ADA': 'Cardano',
    'DOT': 'Polkadot',
    'LINK': 'Chainlink',
  }
  
  return assetNames[code.toUpperCase()] || code.toUpperCase()
}

export function formatOrderType(type: 'buy' | 'sell'): string {
  return type === 'buy' ? 'Comprar' : 'Vender'
}

export function formatSeverity(severity: string): string {
  const severityMap: Record<string, string> = {
    'low': 'Baixa',
    'medium': 'Média',
    'high': 'Alta',
    'critical': 'Crítica',
  }
  
  return severityMap[severity.toLowerCase()] || severity
}

export function formatAlertType(type: string): string {
  const typeMap: Record<string, string> = {
    'volatility': 'Volatilidade',
    'liquidation': 'Liquidação',
    'anomaly': 'Anomalia',
    'rebalance': 'Rebalanceamento',
    'price': 'Preço',
    'volume': 'Volume',
  }
  
  return typeMap[type.toLowerCase()] || type
}
