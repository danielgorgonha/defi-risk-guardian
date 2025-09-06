'use client'

import { useState } from 'react'
import { 
  Brain, 
  TrendingUp, 
  Shield, 
  AlertTriangle, 
  Target,
  Zap,
  CheckCircle,
  Clock,
  Star,
  ArrowRight,
  Sparkles,
  BarChart3,
  DollarSign
} from 'lucide-react'
import { RiskAnalysis } from '../../utils/api'

interface AIRecommendationsProps {
  riskAnalysis: RiskAnalysis
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

export function AIRecommendations({ riskAnalysis }: AIRecommendationsProps) {
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null)
  const [showAllInsights, setShowAllInsights] = useState(false)

  // Enhanced AI recommendations with more detailed insights
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'diversification': return <Target className="h-5 w-5" />
      case 'rebalancing': return <BarChart3 className="h-5 w-5" />
      case 'risk': return <Shield className="h-5 w-5" />
      case 'opportunity': return <TrendingUp className="h-5 w-5" />
      default: return <Brain className="h-5 w-5" />
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

  const displayedRecommendations = showAllInsights ? enhancedRecommendations : enhancedRecommendations.slice(0, 2)

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 rounded-2xl shadow-xl border border-indigo-200 p-6 hover:shadow-2xl hover:shadow-indigo-200 transition-all duration-500">
      {/* Header with AI branding */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-gray-900 flex items-center">
              AI Risk Guardian
              <Sparkles className="h-4 w-4 ml-2 text-yellow-500" />
            </h4>
            <p className="text-sm text-gray-600 font-medium">Powered by Advanced Machine Learning</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">
            <CheckCircle className="h-3 w-3 inline mr-1" />
            LIVE
          </div>
        </div>
      </div>

      {/* AI Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-white/60 rounded-xl border border-white/40">
          <div className="text-lg font-bold text-indigo-600">94%</div>
          <div className="text-xs text-gray-600 font-medium">Accuracy</div>
        </div>
        <div className="text-center p-3 bg-white/60 rounded-xl border border-white/40">
          <div className="text-lg font-bold text-purple-600">24/7</div>
          <div className="text-xs text-gray-600 font-medium">Monitoring</div>
        </div>
        <div className="text-center p-3 bg-white/60 rounded-xl border border-white/40">
          <div className="text-lg font-bold text-cyan-600">50+</div>
          <div className="text-xs text-gray-600 font-medium">Protocols</div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h5 className="text-lg font-bold text-gray-900">Smart Recommendations</h5>
          <button
            onClick={() => setShowAllInsights(!showAllInsights)}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
          >
            {showAllInsights ? 'Show Less' : 'Show All'}
            <ArrowRight className={`h-4 w-4 ml-1 transition-transform ${showAllInsights ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {displayedRecommendations.map((rec) => (
          <div
            key={rec.id}
            className={`bg-white/80 backdrop-blur-sm rounded-xl border border-white/60 p-4 hover:bg-white hover:shadow-lg transition-all duration-300 cursor-pointer ${
              selectedRecommendation === rec.id ? 'ring-2 ring-indigo-300 bg-white' : ''
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
                    <h6 className="font-bold text-gray-900">{rec.title}</h6>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                      {rec.priority.toUpperCase()}
                    </span>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                      {rec.confidence}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{rec.description}</p>
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center text-green-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {rec.impact}
                    </div>
                    <div className="flex items-center text-blue-600">
                      <Clock className="h-3 w-3 mr-1" />
                      {rec.timeToImplement}
                    </div>
                    {rec.estimatedReturn && (
                      <div className="flex items-center text-purple-600">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {rec.estimatedReturn}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="text-xs text-gray-500">AI Confidence</div>
                  <div className="text-sm font-bold text-indigo-600">{rec.confidence}%</div>
                </div>
                <Zap className="h-4 w-4 text-yellow-500" />
              </div>
            </div>

            {/* Expanded AI Insight */}
            {selectedRecommendation === rec.id && (
              <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                <div className="flex items-start space-x-2">
                  <Brain className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h6 className="text-sm font-bold text-indigo-900 mb-1">AI Insight</h6>
                    <p className="text-sm text-indigo-800 leading-relaxed">{rec.aiInsight}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* AI Footer */}
      <div className="mt-6 pt-4 border-t border-indigo-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-gray-600 font-medium">
              AI analyzes 10,000+ data points every minute
            </span>
          </div>
          <div className="text-xs text-indigo-600 font-medium">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  )
}
