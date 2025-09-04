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
    if (score < 30) return 'text-risk-green-700 bg-risk-green/10 border-risk-green/20'
    if (score < 60) return 'text-risk-yellow-700 bg-risk-yellow/10 border-risk-yellow/20'
    if (score < 80) return 'text-risk-red-700 bg-risk-red/10 border-risk-red/20'
    return 'text-risk-red-700 bg-risk-red/20 border-risk-red/30'
  }

  const getRiskLabel = (score: number) => {
    if (score < 30) return 'Baixo'
    if (score < 60) return 'Médio'
    if (score < 80) return 'Alto'
    return 'Crítico'
  }

  const metrics = [
    {
      title: 'Value at Risk (95%)',
      value: formatCurrency(var_95),
      description: 'Perda máxima esperada em 95% dos cenários',
      icon: TrendingDown,
      color: 'text-risk-red bg-risk-red/10',
      hoverGlow: 'hover:shadow-glow-red'
    },
    {
      title: 'Volatilidade',
      value: formatPercentage(volatility),
      description: 'Volatilidade anual do portfólio',
      icon: Activity,
      color: 'text-risk-yellow bg-risk-yellow/10',
      hoverGlow: 'hover:shadow-glow-yellow'
    },
    {
      title: 'Sharpe Ratio',
      value: sharpe_ratio.toFixed(2),
      description: 'Retorno ajustado ao risco',
      icon: BarChart3,
      color: sharpe_ratio > 1 ? 'text-risk-green bg-risk-green/10' : 'text-risk-red bg-risk-red/10',
      hoverGlow: sharpe_ratio > 1 ? 'hover:shadow-glow-green' : 'hover:shadow-glow-red'
    },
    {
      title: 'Beta',
      value: beta.toFixed(2),
      description: 'Correlação com o mercado (XLM)',
      icon: Target,
      color: beta > 1 ? 'text-risk-yellow bg-risk-yellow/10' : 'text-stellar bg-stellar/10',
      hoverGlow: beta > 1 ? 'hover:shadow-glow-yellow' : 'hover:shadow-glow-stellar'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Risk Score Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-black flex items-center">
            <Shield className="h-6 w-6 mr-3 text-stellar" />
            Score de Risco
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
            Baseado em análise de IA e métricas financeiras
          </p>
        </div>

        {/* Risk Score Bar */}
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                risk_score < 30 ? 'bg-risk-green' :
                risk_score < 60 ? 'bg-risk-yellow' :
                risk_score < 80 ? 'bg-risk-red' : 'bg-risk-red'
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
        <h4 className="text-lg font-bold text-black mb-4">Métricas Adicionais</h4>
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

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-gradient-to-br from-reflector/10 to-reflector/5 rounded-2xl shadow-lg border border-reflector/20 p-6 hover:shadow-glow-reflector transition-all duration-300">
          <h4 className="text-lg font-bold text-black mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-3 text-reflector" />
            Recomendações de IA
          </h4>
          <div className="space-y-3">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-reflector rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-gray-800 leading-relaxed font-medium">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
