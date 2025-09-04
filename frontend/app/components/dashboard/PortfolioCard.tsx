'use client'

import { useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart,
  Plus,
  Settings
} from 'lucide-react'
import { Portfolio, Asset } from '../../utils/api'
import { formatCurrency, formatPercentage } from '../../utils/formatters'

interface PortfolioCardProps {
  portfolio: Portfolio
}

export function PortfolioCard({ portfolio }: PortfolioCardProps) {
  const [showAllAssets, setShowAllAssets] = useState(false)

  const totalValue = portfolio.total_value
  const riskScore = portfolio.risk_score
  const assets = portfolio.assets

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-risk-green bg-risk-green/10 border-risk-green/20'
    if (score < 60) return 'text-risk-yellow bg-risk-yellow/10 border-risk-yellow/20'
    if (score < 80) return 'text-risk-red bg-risk-red/10 border-risk-red/20'
    return 'text-risk-red bg-risk-red/20 border-risk-red/30'
  }

  const getRiskLabel = (score: number) => {
    if (score < 30) return 'Baixo'
    if (score < 60) return 'Médio'
    if (score < 80) return 'Alto'
    return 'Crítico'
  }

  const displayedAssets = showAllAssets ? assets : assets.slice(0, 3)

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-dark-gray">Portfolio Overview</h2>
          <p className="text-sm text-gray-600 mt-1">
            {portfolio.wallet_address.slice(0, 8)}...{portfolio.wallet_address.slice(-8)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-3 text-gray-400 hover:text-stellar hover:bg-stellar/10 rounded-xl transition-all duration-300">
            <Plus className="h-5 w-5" />
          </button>
          <button className="p-3 text-gray-400 hover:text-stellar hover:bg-stellar/10 rounded-xl transition-all duration-300">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Portfolio Value */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
        <div className="bg-gradient-to-br from-stellar/10 to-stellar/5 p-4 lg:p-6 rounded-2xl border border-stellar/20 hover:shadow-glow-stellar transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-stellar">Valor Total</p>
              <p className="text-2xl lg:text-3xl font-bold text-dark-gray">
                {formatCurrency(totalValue)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 lg:h-10 lg:w-10 text-stellar" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-risk-green/10 to-risk-green/5 p-4 lg:p-6 rounded-2xl border border-risk-green/20 hover:shadow-glow-green transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-risk-green">Performance</p>
              <p className="text-2xl lg:text-3xl font-bold text-dark-gray flex items-center">
                <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 mr-2 text-risk-green" />
                +12.5%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 lg:h-10 lg:w-10 text-risk-green" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-risk-yellow/10 to-risk-yellow/5 p-4 lg:p-6 rounded-2xl border border-risk-yellow/20 hover:shadow-glow-yellow transition-all duration-300 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-risk-yellow">Score de Risco</p>
              <p className="text-2xl lg:text-3xl font-bold text-dark-gray">
                {riskScore.toFixed(1)}%
              </p>
            </div>
            <div className={`px-2 lg:px-3 py-1 lg:py-2 rounded-xl text-xs lg:text-sm font-medium border ${getRiskColor(riskScore)}`}>
              {getRiskLabel(riskScore)}
            </div>
          </div>
        </div>
      </div>

      {/* Assets List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-dark-gray flex items-center">
            <PieChart className="h-6 w-6 mr-3 text-stellar" />
            Ativos ({assets.length})
          </h3>
          {assets.length > 3 && (
            <button
              onClick={() => setShowAllAssets(!showAllAssets)}
              className="text-sm text-stellar hover:text-stellar-700 font-medium px-4 py-2 rounded-lg hover:bg-stellar/10 transition-all duration-300"
            >
              {showAllAssets ? 'Ver menos' : 'Ver todos'}
            </button>
          )}
        </div>

        <div className="space-y-4">
          {displayedAssets.map((asset) => (
            <AssetRow key={asset.id} asset={asset} />
          ))}
        </div>
      </div>

      {/* Allocation Chart Placeholder */}
      <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
        <h4 className="text-lg font-semibold text-dark-gray mb-4 flex items-center">
          <PieChart className="h-5 w-5 mr-2 text-stellar" />
          Distribuição de Ativos
        </h4>
        <div className="flex items-center justify-center h-40 text-gray-500">
          <div className="text-center">
            <div className="p-4 bg-white rounded-full shadow-lg mb-4">
              <PieChart className="h-12 w-12 text-stellar" />
            </div>
            <p className="text-lg font-medium">Gráfico de distribuição</p>
            <p className="text-sm text-gray-400">(Será implementado com Recharts)</p>
          </div>
        </div>
      </div>
    </div>
  )
}

interface AssetRowProps {
  asset: Asset
}

function AssetRow({ asset }: AssetRowProps) {
  const allocationDiff = asset.current_allocation - asset.target_allocation
  const isOverAllocated = allocationDiff > 0

  return (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300">
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 bg-gradient-stellar rounded-full flex items-center justify-center shadow-lg">
          <span className="text-sm font-bold text-white">
            {asset.asset_code.slice(0, 2)}
          </span>
        </div>
        <div>
          <p className="font-bold text-dark-gray text-lg">{asset.asset_code}</p>
          <p className="text-sm text-gray-600">
            {formatCurrency(asset.balance)} tokens
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="font-bold text-dark-gray text-lg">
          {formatCurrency(asset.value_usd)}
        </p>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600 font-medium">
            {formatPercentage(asset.current_allocation)}
          </span>
          {Math.abs(allocationDiff) > 1 && (
            <span className={`text-xs px-3 py-1 rounded-full font-medium border ${
              isOverAllocated 
                ? 'bg-risk-yellow/10 text-risk-yellow border-risk-yellow/20' 
                : 'bg-risk-green/10 text-risk-green border-risk-green/20'
            }`}>
              {isOverAllocated ? '+' : ''}{formatPercentage(allocationDiff)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
