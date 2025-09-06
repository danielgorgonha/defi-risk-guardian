'use client'

import { useState, useEffect } from 'react'
import { 
  Brain, 
  Activity, 
  Zap, 
  Shield, 
  TrendingUp, 
  Eye,
  Cpu,
  Database,
  Network,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react'

interface AIStatus {
  status: 'active' | 'analyzing' | 'learning'
  confidence: number
  dataPoints: number
  protocols: number
  lastUpdate: Date
  insights: number
  accuracy: number
}

export function AIStatusDashboard() {
  const [aiStatus, setAiStatus] = useState<AIStatus>({
    status: 'active',
    confidence: 94,
    dataPoints: 125430,
    protocols: 52,
    lastUpdate: new Date(),
    insights: 8,
    accuracy: 96
  })

  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setAiStatus(prev => ({
        ...prev,
        dataPoints: prev.dataPoints + Math.floor(Math.random() * 1000),
        lastUpdate: new Date(),
        confidence: Math.min(99, prev.confidence + (Math.random() - 0.5) * 2)
      }))
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 1000)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 border-green-200'
      case 'analyzing': return 'text-blue-600 bg-blue-100 border-blue-200'
      case 'learning': return 'text-purple-600 bg-purple-100 border-purple-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />
      case 'analyzing': return <Activity className="h-4 w-4" />
      case 'learning': return <Brain className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl shadow-2xl border border-purple-500/20 p-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center">
              AI Risk Guardian
              <Sparkles className="h-4 w-4 ml-2 text-yellow-400" />
            </h3>
            <p className="text-sm text-purple-200">Advanced DeFi Risk Analysis Engine</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center space-x-1 ${getStatusColor(aiStatus.status)}`}>
          {getStatusIcon(aiStatus.status)}
          <span className="text-white">{aiStatus.status.toUpperCase()}</span>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <Database className="h-5 w-5 text-blue-400" />
            <span className="text-xs text-gray-300">Data Points</span>
          </div>
          <div className={`text-2xl font-bold text-white ${isAnimating ? 'animate-pulse' : ''}`}>
            {aiStatus.dataPoints.toLocaleString()}
          </div>
          <div className="text-xs text-green-400">+1,247/min</div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <Network className="h-5 w-5 text-green-400" />
            <span className="text-xs text-gray-300">Protocols</span>
          </div>
          <div className="text-2xl font-bold text-white">{aiStatus.protocols}</div>
          <div className="text-xs text-blue-400">Monitored</div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <Eye className="h-5 w-5 text-yellow-400" />
            <span className="text-xs text-gray-300">Insights</span>
          </div>
          <div className="text-2xl font-bold text-white">{aiStatus.insights}</div>
          <div className="text-xs text-purple-400">Active</div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <Shield className="h-5 w-5 text-red-400" />
            <span className="text-xs text-gray-300">Accuracy</span>
          </div>
          <div className="text-2xl font-bold text-white">{aiStatus.accuracy}%</div>
          <div className="text-xs text-green-400">ML Model</div>
        </div>
      </div>

      {/* AI Capabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <h4 className="text-sm font-bold text-white mb-3 flex items-center">
            <Cpu className="h-4 w-4 mr-2 text-blue-400" />
            AI Capabilities
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300">Risk Prediction</span>
              <span className="text-green-400 font-bold">94%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300">Market Analysis</span>
              <span className="text-blue-400 font-bold">89%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300">Portfolio Optimization</span>
              <span className="text-purple-400 font-bold">92%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300">Anomaly Detection</span>
              <span className="text-yellow-400 font-bold">97%</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <h4 className="text-sm font-bold text-white mb-3 flex items-center">
            <Zap className="h-4 w-4 mr-2 text-yellow-400" />
            Real-time Monitoring
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300">Price Feeds</span>
              <span className="text-green-400 font-bold">Live</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300">Liquidity Pools</span>
              <span className="text-green-400 font-bold">Live</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300">Smart Contracts</span>
              <span className="text-green-400 font-bold">Live</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300">Social Sentiment</span>
              <span className="text-green-400 font-bold">Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Confidence Meter */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-white flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-green-400" />
            AI Confidence Level
          </h4>
          <span className="text-lg font-bold text-white">{aiStatus.confidence.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
            style={{ width: `${aiStatus.confidence}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <Clock className="h-3 w-3" />
            <span>Last updated: {aiStatus.lastUpdate.toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>AI Engine Active</span>
          </div>
        </div>
      </div>
    </div>
  )
}
