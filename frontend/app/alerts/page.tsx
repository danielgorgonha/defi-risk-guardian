'use client'

import { useState } from 'react'
import { AlertTimeline } from '../components/dashboard/AlertTimeline'

// Mock data - following Alert interface
const mockAlerts = [
  {
    id: 1,
    alert_type: 'volatility',
    severity: 'medium',
    message: 'High volatility detected in XLM/USDC pair. Price volatility increased by 15% in the last hour. Consider reducing position size.',
    triggered_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    is_active: true
  },
  {
    id: 2,
    alert_type: 'liquidation',
    severity: 'high',
    message: 'Liquidation risk approaching for ETH position. Your ETH position is at 85% of liquidation threshold. Consider adding collateral.',
    triggered_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    is_active: true
  },
  {
    id: 3,
    alert_type: 'rebalance',
    severity: 'low',
    message: 'Portfolio rebalancing completed. Automated rebalancing executed successfully. Portfolio now optimized for current market conditions.',
    triggered_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    is_active: false
  },
  {
    id: 4,
    alert_type: 'anomaly',
    severity: 'low',
    message: 'Arbitrage opportunity detected. Price difference of 2.3% found between exchanges. Potential profit: $125.',
    triggered_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    is_active: true
  }
]

export default function AlertsPage() {
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Risk Alerts</h1>
          <p className="text-gray-600">Stay informed about your portfolio risks and opportunities</p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Alerts Timeline */}
          <div>
            <AlertTimeline alerts={mockAlerts} />
          </div>
        </div>
      </div>
    </div>
  )
}
