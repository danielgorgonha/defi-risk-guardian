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
  Sparkles,
  Target,
  BarChart3,
  DollarSign,
  ArrowRight,
  Star
} from 'lucide-react'
import { RiskAnalysis } from '../../utils/api'

interface AIStatus {
  status: 'active' | 'analyzing' | 'learning'
  confidence: number
  dataPoints: number
  protocols: number
  lastUpdate: Date
  insights: number
  accuracy: number
}

interface Recommendation {
  id: string
  type: 'diversification' | 'rebalancing' | 'risk' | 'opportunity'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: string
  confidence: number
  estimatedReturn?: string
  timeToImplement: string
  aiInsight: string
}

interface AIDedicatedSectionProps {
  riskAnalysis: RiskAnalysis
}

export function AIDedicatedSection({ riskAnalysis }: AIDedicatedSectionProps) {
  const [aiStatus, setAiStatus] = useState<AIStatus>({
    status: 'active',
    confidence: 94,
    dataPoints: 125430,
    protocols: 52,
    lastUpdate: new Date(),
    insights: 8,
    accuracy: 96
  })

  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null)
  const [showAllInsights, setShowAllInsights] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Enhanced AI recommendations
  const enhancedRecommendations: Recommendation[] = [
    {
      id: 'diversification-001',
      type: 'diversification',
      priority: 'high',
      title: 'Improve Portfolio Diversification',
      description: 'Your portfolio is heavily concentrated in volatile assets. Adding stable assets like USDC and AAVE can reduce overall risk.',
      impact: 'Reduce risk by 15-20%',
      confidence: 94,
      estimatedReturn: '+8.5%',
      timeToImplement: '2-3 days',
      aiInsight: 'AI detected that 70% of your portfolio is in high-volatility assets. Historical data shows portfolios with 30% stable assets perform 15% better during market downturns.'
    },
    {
      id: 'rebalancing-002',
      type: 'rebalancing',
      priority: 'high',
      title: 'Rebalance XLM Position',
      description: 'XLM allocation is 12% above target. Consider reducing position size to align with your risk tolerance.',
      impact: 'Align with target allocation',
      confidence: 89,
      estimatedReturn: '+3.2%',
      timeToImplement: '1 day',
      aiInsight: 'Machine learning models predict XLM will face increased volatility in the next 30 days. Rebalancing now could prevent potential losses of 8-12%.'
    },
    {
      id: 'opportunity-003',
      type: 'opportunity',
      priority: 'medium',
      title: 'DeFi Yield Opportunity',
      description: 'AI identified a high-yield opportunity in AAVE lending pools with 12.5% APY and low risk.',
      impact: 'Increase yield by 12.5%',
      confidence: 76,
      estimatedReturn: '+12.5%',
      timeToImplement: '1-2 days',
      aiInsight: 'Our AI analyzed 50+ DeFi protocols and found AAVE currently offers the best risk-adjusted returns. The algorithm considers liquidity, smart contract risk, and historical performance.'
    },
    {
      id: 'risk-004',
      type: 'risk',
      priority: 'medium',
      title: 'Monitor Market Conditions',
      description: 'Crypto market volatility is increasing. Consider setting stop-loss orders on high-risk positions.',
      impact: 'Protect against 15% downside',
      confidence: 82,
      estimatedReturn: 'Risk mitigation',
      timeToImplement: 'Immediate',
      aiInsight: 'AI sentiment analysis of 10,000+ social media posts and news articles indicates bearish sentiment is growing. Our model suggests implementing protective measures.'
    }
  ]

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'diversification': return <Target className="h-4 w-4" />
      case 'rebalancing': return <BarChart3 className="h-4 w-4" />
      case 'risk': return <Shield className="h-4 w-4" />
      case 'opportunity': return <TrendingUp className="h-4 w-4" />
      default: return <Brain className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'diversification': return 'text-blue-600 bg-blue-100 border-blue-200'
      case 'rebalancing': return 'text-purple-600 bg-purple-100 border-purple-200'
      case 'risk': return 'text-red-600 bg-red-100 border-red-200'
      case 'opportunity': return 'text-green-600 bg-green-100 border-green-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

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

  const displayedRecommendations = showAllInsights ? enhancedRecommendations : enhancedRecommendations.slice(0, 2)

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl shadow-2xl border border-purple-500/20 p-6 text-white mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center">
              AI Risk Guardian
              <Sparkles className="h-5 w-5 ml-2 text-yellow-400" />
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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <Zap className="h-5 w-5 text-cyan-400" />
            <span className="text-xs text-gray-300">Confidence</span>
          </div>
          <div className="text-2xl font-bold text-white">{aiStatus.confidence.toFixed(1)}%</div>
          <div className="text-xs text-cyan-400">Real-time</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Smart Recommendations */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-white flex items-center">
              <Brain className="h-5 w-5 mr-2 text-purple-400" />
              Smart Recommendations
            </h4>
            <button
              onClick={() => setShowAllInsights(!showAllInsights)}
              className="text-sm text-purple-400 hover:text-purple-300 font-medium flex items-center"
            >
              {showAllInsights ? 'Show Less' : 'Show All'}
              <ArrowRight className={`h-4 w-4 ml-1 transition-transform ${showAllInsights ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="space-y-3">
            {displayedRecommendations.map((rec) => (
              <div
                key={rec.id}
                className={`bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-3 hover:bg-white/15 transition-all duration-300 cursor-pointer ${
                  selectedRecommendation === rec.id ? 'ring-2 ring-purple-300 bg-white/15' : ''
                }`}
                onClick={() => setSelectedRecommendation(selectedRecommendation === rec.id ? null : rec.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`p-2 rounded-lg ${getTypeColor(rec.type)}`}>
                      {getTypeIcon(rec.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h6 className="font-bold text-white text-sm">{rec.title}</h6>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                          {rec.priority.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          {rec.confidence}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 mb-2">{rec.description}</p>
                      <div className="flex items-center space-x-3 text-xs">
                        <div className="flex items-center text-green-400">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {rec.impact}
                        </div>
                        <div className="flex items-center text-blue-400">
                          <Clock className="h-3 w-3 mr-1" />
                          {rec.timeToImplement}
                        </div>
                        {rec.estimatedReturn && (
                          <div className="flex items-center text-purple-400">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {rec.estimatedReturn}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded AI Insight */}
                {selectedRecommendation === rec.id && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-purple-50/20 to-indigo-50/20 rounded-lg border border-purple-200/20">
                    <div className="flex items-start space-x-2">
                      <Brain className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h6 className="text-sm font-bold text-purple-200 mb-1">AI Insight</h6>
                        <p className="text-xs text-purple-100 leading-relaxed">{rec.aiInsight}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AI Analytics & Future Recharts Space */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-cyan-400" />
            AI Analytics
          </h4>
          
          {/* AI Capabilities */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">Risk Prediction</span>
                  <span className="text-green-400 font-bold">94%</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">Market Analysis</span>
                  <span className="text-blue-400 font-bold">89%</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">Portfolio Optimization</span>
                  <span className="text-purple-400 font-bold">92%</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">Anomaly Detection</span>
                  <span className="text-yellow-400 font-bold">97%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recharts Placeholder */}
          <div className="bg-white/10 rounded-lg p-6 border-2 border-dashed border-white/20">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-white/40 mx-auto mb-3" />
              <h5 className="text-white font-bold mb-2">AI Analytics Dashboard</h5>
              <p className="text-gray-400 text-sm mb-4">
                Advanced visualizations powered by Recharts
              </p>
              <div className="space-y-2 text-xs text-gray-500">
                <div>• Risk prediction confidence over time</div>
                <div>• Portfolio performance vs AI recommendations</div>
                <div>• Market sentiment analysis</div>
                <div>• Anomaly detection patterns</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Confidence Meter */}
      <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
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
            <Star className="h-3 w-3 text-yellow-400" />
            <span>AI analyzes 10,000+ data points every minute</span>
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
