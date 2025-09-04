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

  const metrics = [
    {
      title: 'Value at Risk (95%)',
      value: formatCurrency(var_95),
      description: 'Perda máxima esperada em 95% dos cenários',
      icon: TrendingDown,
      color: 'text-red-600 bg-red-100'
    },
    {
      title: 'Volatilidade',
      value: formatPercentage(volatility),
      description: 'Volatilidade anual do portfólio',
      icon: Activity,
      color: 'text-orange-600 bg-orange-100'
    },
    {
      title: 'Sharpe Ratio',
      value: sharpe_ratio.toFixed(2),
      description: 'Retorno ajustado ao risco',
      icon: BarChart3,
      color: sharpe_ratio > 1 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
    },
    {
      title: 'Beta',
      value: beta.toFixed(2),
      description: 'Correlação com o mercado (XLM)',
      icon: Target,
      color: beta > 1 ? 'text-orange-600 bg-orange-100' : 'text-blue-600 bg-blue-100'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Risk Score Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Score de Risco
          </h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(risk_score)}`}>
            {getRiskLabel(risk_score)}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {risk_score.toFixed(1)}%
          </div>
          <p className="text-sm text-gray-600">
            Baseado em análise de IA e métricas financeiras
          </p>
        </div>

        {/* Risk Score Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                risk_score < 30 ? 'bg-green-500' :
                risk_score < 60 ? 'bg-orange-500' :
                risk_score < 80 ? 'bg-red-500' : 'bg-red-700'
              }`}
              style={{ width: `${Math.min(risk_score, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Risk Metrics Grid */}
      <div className="grid grid-cols-1 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${metric.color}`}>
                  <metric.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {metric.title}
                  </p>
                  <p className="text-xs text-gray-600">
                    {metric.description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  {metric.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Metrics */}
      <div className="card">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Métricas Adicionais</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600">VaR 99%</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatCurrency(var_99)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Max Drawdown</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatPercentage(max_drawdown)}
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="card">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Recomendações de IA
          </h4>
          <div className="space-y-2">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
