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
    if (score < 30) return 'text-green-600 bg-green-100'
    if (score < 60) return 'text-orange-600 bg-orange-100'
    if (score < 80) return 'text-red-600 bg-red-100'
    return 'text-red-800 bg-red-200'
  }

  const getRiskLabel = (score: number) => {
    if (score < 30) return 'Baixo'
    if (score < 60) return 'Médio'
    if (score < 80) return 'Alto'
    return 'Crítico'
  }

  const displayedAssets = showAllAssets ? assets : assets.slice(0, 3)

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Portfolio Overview</h2>
          <p className="text-sm text-gray-600">
            {portfolio.wallet_address.slice(0, 8)}...{portfolio.wallet_address.slice(-8)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Plus className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Portfolio Value */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Valor Total</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(totalValue)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Performance</p>
              <p className="text-2xl font-bold text-green-900 flex items-center">
                <TrendingUp className="h-5 w-5 mr-1" />
                +12.5%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Score de Risco</p>
              <p className="text-2xl font-bold text-orange-900">
                {riskScore.toFixed(1)}%
              </p>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(riskScore)}`}>
              {getRiskLabel(riskScore)}
            </div>
          </div>
        </div>
      </div>

      {/* Assets List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            Ativos ({assets.length})
          </h3>
          {assets.length > 3 && (
            <button
              onClick={() => setShowAllAssets(!showAllAssets)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showAllAssets ? 'Ver menos' : 'Ver todos'}
            </button>
          )}
        </div>

        <div className="space-y-3">
          {displayedAssets.map((asset) => (
            <AssetRow key={asset.id} asset={asset} />
          ))}
        </div>
      </div>

      {/* Allocation Chart Placeholder */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Distribuição de Ativos</h4>
        <div className="flex items-center justify-center h-32 text-gray-500">
          <div className="text-center">
            <PieChart className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Gráfico de distribuição</p>
            <p className="text-xs">(Será implementado com Recharts)</p>
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
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-sm font-bold text-blue-600">
            {asset.asset_code.slice(0, 2)}
          </span>
        </div>
        <div>
          <p className="font-medium text-gray-900">{asset.asset_code}</p>
          <p className="text-sm text-gray-600">
            {formatCurrency(asset.balance)} tokens
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="font-medium text-gray-900">
          {formatCurrency(asset.value_usd)}
        </p>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {formatPercentage(asset.current_allocation)}
          </span>
          {Math.abs(allocationDiff) > 1 && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              isOverAllocated 
                ? 'bg-orange-100 text-orange-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {isOverAllocated ? '+' : ''}{formatPercentage(allocationDiff)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
