'use client'

import { useState, useEffect } from 'react'
import { useNavigation } from '../contexts/NavigationContext'
import { useWalletStatus } from '../hooks/useWalletStatus'
import { DemoModeBanner } from '../components/common/DemoModeBanner'
import { AuthGuard } from '../components/common/AuthGuard'
import { 
  User, 
  Bell, 
  Shield, 
  Settings as SettingsIcon, 
  Save,
  Eye,
  EyeOff,
  AlertTriangle,
  TrendingUp,
  Clock
} from 'lucide-react'

export default function SettingsPage() {
  const { isDemoMode, showNavigation } = useNavigation()
  const { canLoadData } = useWalletStatus()
  const [settings, setSettings] = useState({
    // User Preferences
    notifications: {
      email: true,
      push: true,
      sms: false,
      riskAlerts: true,
      rebalancing: true,
      opportunities: false
    },
    // Risk Management
    riskThresholds: {
      liquidation: 80,
      volatility: 15,
      rebalancing: 10
    },
    // Privacy
    privacy: {
      showPortfolioValue: true,
      shareAnalytics: false,
      publicProfile: false
    },
    // Trading
    trading: {
      autoRebalancing: true,
      maxSlippage: 0.5,
      gasPrice: 'standard'
    }
  })

  const [showAdvanced, setShowAdvanced] = useState(false)

  // Show message when can't load data
  useEffect(() => {
    if (!canLoadData) {
      // Could add a toast or redirect logic here if needed
    }
  }, [canLoadData])

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Settings saved:', settings)
  }


  return (
    <AuthGuard>
      <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DemoModeBanner />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and risk management settings</p>
        </div>

        {!canLoadData ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="text-center text-gray-500">
              <p className="text-lg">Settings not available</p>
              <p className="text-sm mt-2">Connect your wallet or try the demo to access settings</p>
            </div>
          </div>
        ) : (

        <div className="space-y-8">
          {/* User Profile */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">User Profile</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  defaultValue="Demo User"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue="demo@riskguardian.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black font-medium"
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <Bell className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-700 font-medium">Receive alerts via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.email}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, email: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Risk Alerts</h3>
                  <p className="text-sm text-gray-700 font-medium">High priority risk notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.riskAlerts}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, riskAlerts: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Auto-Rebalancing</h3>
                  <p className="text-sm text-gray-700 font-medium">Notifications when portfolio is rebalanced</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.rebalancing}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, rebalancing: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Risk Management */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Risk Management</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Liquidation Threshold (%)
                </label>
                <input
                  type="number"
                  value={settings.riskThresholds.liquidation}
                  onChange={(e) => setSettings({
                    ...settings,
                    riskThresholds: { ...settings.riskThresholds, liquidation: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volatility Alert (%)
                </label>
                <input
                  type="number"
                  value={settings.riskThresholds.volatility}
                  onChange={(e) => setSettings({
                    ...settings,
                    riskThresholds: { ...settings.riskThresholds, volatility: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rebalancing Trigger (%)
                </label>
                <input
                  type="number"
                  value={settings.riskThresholds.rebalancing}
                  onChange={(e) => setSettings({
                    ...settings,
                    riskThresholds: { ...settings.riskThresholds, rebalancing: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black font-medium"
                />
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Privacy & Security</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Show Portfolio Value</h3>
                  <p className="text-sm text-gray-700 font-medium">Display total portfolio value in dashboard</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.privacy.showPortfolioValue}
                    onChange={(e) => setSettings({
                      ...settings,
                      privacy: { ...settings.privacy, showPortfolioValue: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Share Analytics</h3>
                  <p className="text-sm text-gray-700 font-medium">Help improve Risk Guardian with anonymous usage data</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.privacy.shareAnalytics}
                    onChange={(e) => setSettings({
                      ...settings,
                      privacy: { ...settings.privacy, shareAnalytics: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-gradient-to-r from-blue-900 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-semibold"
            >
              <Save className="h-5 w-5" />
              Save Settings
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
    </AuthGuard>
  )
}
