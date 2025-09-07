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
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, Pie, Tooltip, Legend } from 'recharts'
import { Portfolio, Asset } from '../../utils/api'
import { formatCurrency, formatPercentage } from '../../utils/formatters'
import { AddAssetModal } from '../portfolio/AddAssetModal'

interface PortfolioCardProps {
  portfolio: Portfolio
  onAssetAdded?: () => void
}

export function PortfolioCard({ portfolio, onAssetAdded }: PortfolioCardProps) {
  const [showAllAssets, setShowAllAssets] = useState(false)
  const [showAddAssetModal, setShowAddAssetModal] = useState(false)

  const totalValue = portfolio.total_value
  const riskScore = portfolio.risk_score
  const assets = portfolio.assets

  // Prepare data for the pie chart
  const chartData = assets.map((asset) => ({
    name: asset.asset_code,
    value: asset.current_allocation,
    valueUSD: asset.value_usd,
    balance: asset.balance
  }))

  // Define colors for the pie chart
  const COLORS = [
    '#3B82F6', // blue-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#EF4444', // red-500
    '#8B5CF6', // violet-500
    '#F97316', // orange-500
    '#06B6D4', // cyan-500
    '#84CC16', // lime-500
    '#EC4899', // pink-500
    '#6366F1'  // indigo-500
  ]

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-700 bg-green-100 border-green-200'
    if (score < 60) return 'text-yellow-700 bg-yellow-100 border-yellow-200'
    if (score < 80) return 'text-red-700 bg-red-100 border-red-200'
    return 'text-red-800 bg-red-200 border-red-300'
  }

  const getRiskLabel = (score: number) => {
    if (score < 30) return 'Low'
    if (score < 60) return 'Medium'
    if (score < 80) return 'High'
    return 'Critical'
  }

  const displayedAssets = showAllAssets ? assets : assets.slice(0, 3)

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-black">Portfolio Overview</h2>
          <p className="text-sm text-gray-800 mt-1 font-medium">
            {portfolio.wallet_address.slice(0, 8)}...{portfolio.wallet_address.slice(-8)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowAddAssetModal(true)}
            className="p-3 text-gray-600 hover:text-stellar hover:bg-stellar/10 rounded-xl transition-all duration-300 border border-gray-300 hover:border-stellar/30"
            title="Add Asset"
          >
            <Plus className="h-5 w-5" />
          </button>
          <button className="p-3 text-gray-600 hover:text-stellar hover:bg-stellar/10 rounded-xl transition-all duration-300 border border-gray-300 hover:border-stellar/30" title="Settings">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Portfolio Value */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-4 lg:p-6 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-bold text-blue-700">Total Value</p>
              <p className="text-xl lg:text-2xl font-bold text-black break-words">
                {formatCurrency(totalValue)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 lg:h-10 lg:w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-100 to-green-50 p-4 lg:p-6 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-green-600">Performance</p>
              <p className="text-2xl lg:text-3xl font-bold text-black flex items-center">
                <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 mr-2 text-green-600" />
                +12.5%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 lg:h-10 lg:w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-100 to-orange-50 p-4 lg:p-6 rounded-2xl border border-orange-200 hover:shadow-lg transition-all duration-300 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-orange-600">Risk Score</p>
              <p className="text-2xl lg:text-3xl font-bold text-black">
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
          <h3 className="text-xl font-bold text-black flex items-center">
            <PieChart className="h-6 w-6 mr-3 text-blue-600" />
            Assets ({assets.length})
          </h3>
          {assets.length > 3 && (
            <button
              onClick={() => setShowAllAssets(!showAllAssets)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-300"
            >
              {showAllAssets ? 'Show less' : 'Show all'}
            </button>
          )}
        </div>

        <div className="space-y-4">
          {displayedAssets.map((asset) => (
            <AssetRow key={asset.id} asset={asset} />
          ))}
        </div>
      </div>

      {/* Asset Distribution Chart */}
      <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
        <h4 className="text-lg font-semibold text-black mb-6 flex items-center">
          <PieChart className="h-5 w-5 mr-2 text-blue-600" />
          Asset Distribution
        </h4>
        
        {assets.length > 0 ? (
          <div className="flex flex-col lg:flex-row items-center gap-6">
            {/* Pie Chart */}
            <div className="flex-1 h-64 w-full max-w-sm">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={30}
                    paddingAngle={2}
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                    labelLine={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white p-3 rounded-lg shadow-lg border">
                            <p className="font-semibold">{data.name}</p>
                            <p className="text-sm text-gray-600">
                              {formatPercentage(data.value)} ({formatCurrency(data.valueUSD)})
                            </p>
                            <p className="text-xs text-gray-500">
                              Balance: {data.balance.toLocaleString()} tokens
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-1 gap-3">
                {chartData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.balance.toLocaleString()} tokens</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatPercentage(item.value)}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(item.valueUSD)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-40 text-gray-500">
            <div className="text-center">
              <PieChart className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="font-medium">No assets to display</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Asset Modal */}
      <AddAssetModal
        isOpen={showAddAssetModal}
        onClose={() => setShowAddAssetModal(false)}
        walletAddress={portfolio.wallet_address}
        onAssetAdded={() => {
          onAssetAdded?.()
          setShowAddAssetModal(false)
        }}
      />
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
        <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-sm font-bold text-white">
            {asset.asset_code.slice(0, 2)}
          </span>
        </div>
        <div>
          <p className="font-bold text-black text-lg">{asset.asset_code}</p>
          <p className="text-sm text-gray-700 font-medium">
            {formatCurrency(asset.balance)} tokens
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="font-bold text-black text-lg">
          {formatCurrency(asset.value_usd)}
        </p>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-700 font-medium">
            {formatPercentage(asset.current_allocation)}
          </span>
          {Math.abs(allocationDiff) > 1 && (
            <span className={`text-xs px-3 py-1 rounded-full font-medium border ${
              isOverAllocated 
                ? 'bg-orange-100 text-orange-600 border-orange-200' 
                : 'bg-green-100 text-green-600 border-green-200'
            }`}>
              {isOverAllocated ? '+' : ''}{formatPercentage(allocationDiff)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
