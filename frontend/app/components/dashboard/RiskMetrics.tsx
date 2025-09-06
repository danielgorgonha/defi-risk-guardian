import { 
  Shield, 
  TrendingDown, 
  AlertTriangle, 
  BarChart3,
  Target,
  Activity
} from 'lucide-react'
import { RiskAnalysis } from '../../utils/api'
import { formatCurrency, formatPercentage } from '../../utils/formatters'
import { AIRecommendations } from './AIRecommendations'

interface RiskMetricsProps {
  riskAnalysis: RiskAnalysis
}

export function RiskMetrics({ riskAnalysis }: RiskMetricsProps) {
  const {
    portfolio_value,
    var_95,
    var_99,
    volatility,
    sharpe_ratio,
    beta,
    max_drawdown,
    risk_score,
    recommendations
  } = riskAnalysis

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-700 bg-green/10 border-green/20'
    if (score < 60) return 'text-yellow-700 bg-yellow/10 border-yellow/20'
    if (score < 80) return 'text-red-700 bg-red/10 border-red/20'
    return 'text-red-700 bg-red/20 border-red/30'
  }

  const getRiskLabel = (score: number) => {
    if (score < 30) return 'Low'
    if (score < 60) return 'Medium'
    if (score < 80) return 'High'
    return 'Critical'
  }

  const metrics = [
    {
      title: 'Value at Risk (95%)',
      value: formatCurrency(var_95),
      description: 'Maximum expected loss in 95% of scenarios',
      icon: TrendingDown,
      color: 'text-red-700 bg-red-100',
      hoverGlow: 'hover:shadow-lg hover:shadow-red-200'
    },
    {
      title: 'Volatility',
      value: formatPercentage(volatility),
      description: 'Annual portfolio volatility',
      icon: Activity,
      color: 'text-yellow-700 bg-yellow-100',
      hoverGlow: 'hover:shadow-lg hover:shadow-yellow-200'
    },
    {
      title: 'Sharpe Ratio',
      value: sharpe_ratio.toFixed(2),
      description: 'Risk-adjusted return',
      icon: BarChart3,
      color: sharpe_ratio > 1 ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100',
      hoverGlow: sharpe_ratio > 1 ? 'hover:shadow-lg hover:shadow-green-200' : 'hover:shadow-lg hover:shadow-red-200'
    },
    {
      title: 'Beta',
      value: beta.toFixed(2),
      description: 'Market correlation (XLM)',
      icon: Target,
      color: beta > 1 ? 'text-yellow-700 bg-yellow-100' : 'text-blue-700 bg-blue-100',
      hoverGlow: beta > 1 ? 'hover:shadow-lg hover:shadow-yellow-200' : 'hover:shadow-lg hover:shadow-blue-200'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Risk Score Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-black flex items-center">
            <Shield className="h-6 w-6 mr-3 text-blue-600" />
            Risk Score
          </h3>
          <div className={`px-4 py-2 rounded-xl text-sm font-medium border ${getRiskColor(risk_score)}`}>
            {getRiskLabel(risk_score)}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-5xl font-bold text-black mb-3">
            {risk_score.toFixed(1)}%
          </div>
          <p className="text-sm text-gray-800 font-medium">
            Based on AI analysis and financial metrics
          </p>
        </div>

        {/* Risk Score Bar */}
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                risk_score < 30 ? 'bg-green-500' :
                risk_score < 60 ? 'bg-yellow-500' :
                risk_score < 80 ? 'bg-red-500' : 'bg-red-600'
              }`}
              style={{ width: `${Math.min(risk_score, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Risk Metrics Grid */}
      <div className="grid grid-cols-1 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className={`bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-all duration-300 ${metric.hoverGlow}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${metric.color}`}>
                  <metric.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-black">
                    {metric.title}
                  </p>
                  <p className="text-xs text-gray-700 font-medium">
                    {metric.description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-black">
                  {metric.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Metrics */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
        <h4 className="text-lg font-bold text-black mb-4">Additional Metrics</h4>
        <div className="grid grid-cols-2 gap-6">
          <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
            <p className="text-sm text-gray-700 font-medium mb-1">VaR 99%</p>
            <p className="text-lg font-bold text-black">
              {formatCurrency(var_99)}
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
            <p className="text-sm text-gray-700 font-medium mb-1">Max Drawdown</p>
            <p className="text-lg font-bold text-black">
              {formatPercentage(max_drawdown)}
            </p>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <AIRecommendations riskAnalysis={riskAnalysis} />
    </div>
  )
}
