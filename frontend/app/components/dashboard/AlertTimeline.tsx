'use client'

import { useState } from 'react'
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Bell,
  Filter
} from 'lucide-react'
import { Alert } from '../../utils/api'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface AlertTimelineProps {
  alerts: Alert[]
}

export function AlertTimeline({ alerts }: AlertTimelineProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all')
  const [severityFilter, setSeverityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all')

  const filteredAlerts = alerts.filter(alert => {
    const statusMatch = filter === 'all' || 
      (filter === 'active' && alert.is_active) ||
      (filter === 'resolved' && !alert.is_active)
    
    const severityMatch = severityFilter === 'all' || 
      alert.severity === severityFilter

    return statusMatch && severityMatch
  })

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low':
        return 'text-stellar bg-stellar/10 border-stellar/20'
      case 'medium':
        return 'text-risk-yellow bg-risk-yellow/10 border-risk-yellow/20'
      case 'high':
        return 'text-risk-red bg-risk-red/10 border-risk-red/20'
      case 'critical':
        return 'text-risk-red bg-risk-red/20 border-risk-red/30'
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low':
        return 'ℹ️'
      case 'medium':
        return '⚠️'
      case 'high':
        return '🚨'
      case 'critical':
        return '🔥'
      default:
        return '📢'
    }
  }

  const getAlertTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'volatility':
        return '📈'
      case 'liquidation':
        return '💥'
      case 'anomaly':
        return '🔍'
      case 'rebalance':
        return '⚖️'
      default:
        return '📢'
    }
  }

  const activeAlertsCount = alerts.filter(alert => alert.is_active).length
  const criticalAlertsCount = alerts.filter(alert => 
    alert.is_active && alert.severity === 'critical'
  ).length

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-risk-yellow/10 to-risk-yellow/5 rounded-xl">
            <Bell className="h-6 w-6 text-risk-yellow" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-dark-gray">Alertas</h3>
            <p className="text-sm text-gray-600">
              {activeAlertsCount} ativos • {criticalAlertsCount} críticos
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-sm border-2 border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-stellar focus:border-stellar transition-all duration-300"
          >
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="resolved">Resolvidos</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="text-sm border-2 border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-stellar focus:border-stellar transition-all duration-300"
          >
            <option value="all">Todas severidades</option>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
            <option value="critical">Crítica</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="text-center py-12">
          <div className="p-4 bg-risk-green/10 rounded-full w-fit mx-auto mb-6">
            <CheckCircle className="h-16 w-16 text-risk-green" />
          </div>
          <h4 className="text-xl font-bold text-dark-gray mb-3">
            Nenhum alerta encontrado
          </h4>
          <p className="text-gray-600">
            {filter === 'active' 
              ? 'Não há alertas ativos no momento'
              : 'Não há alertas com os filtros selecionados'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} />
          ))}
        </div>
      )}

      {/* Quick Actions */}
      {activeAlertsCount > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 font-medium">
              {activeAlertsCount} alertas ativos precisam de atenção
            </p>
            <div className="flex space-x-3">
              <button className="px-6 py-2 text-sm bg-gradient-stellar text-white rounded-xl hover:shadow-glow-stellar transition-all duration-300 font-medium">
                Resolver Todos
              </button>
              <button className="px-6 py-2 text-sm bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 font-medium">
                Configurar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface AlertItemProps {
  alert: Alert
}

function AlertItem({ alert }: AlertItemProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low':
        return 'text-stellar bg-stellar/10 border-stellar/20'
      case 'medium':
        return 'text-risk-yellow bg-risk-yellow/10 border-risk-yellow/20'
      case 'high':
        return 'text-risk-red bg-risk-red/10 border-risk-red/20'
      case 'critical':
        return 'text-risk-red bg-risk-red/20 border-risk-red/30'
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low':
        return 'ℹ️'
      case 'medium':
        return '⚠️'
      case 'high':
        return '🚨'
      case 'critical':
        return '🔥'
      default:
        return '📢'
    }
  }

  const getAlertTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'volatility':
        return '📈'
      case 'liquidation':
        return '💥'
      case 'anomaly':
        return '🔍'
      case 'rebalance':
        return '⚖️'
      default:
        return '📢'
    }
  }

  return (
    <div className={`p-6 rounded-2xl border-l-4 transition-all duration-300 ${
      alert.is_active 
        ? 'bg-white border-l-risk-yellow shadow-lg hover:shadow-xl' 
        : 'bg-gray-50 border-l-gray-300'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="text-2xl">
            {getAlertTypeIcon(alert.alert_type)}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <span className={`px-3 py-2 rounded-xl text-sm font-medium border ${getSeverityColor(alert.severity)}`}>
                {getSeverityIcon(alert.severity)} {alert.severity}
              </span>
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                {alert.alert_type}
              </span>
            </div>
            
            <p className="text-base text-dark-gray mb-3 leading-relaxed">
              {alert.message}
            </p>
            
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>
                  {formatDistanceToNow(new Date(alert.triggered_at), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </span>
              </div>
              
              {alert.is_active ? (
                <div className="flex items-center space-x-2 text-risk-yellow">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Ativo</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-risk-green">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Resolvido</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {alert.is_active && (
            <button className="p-2 text-gray-400 hover:text-risk-green hover:bg-risk-green/10 rounded-lg transition-all duration-300">
              <CheckCircle className="h-5 w-5" />
            </button>
          )}
          <button className="p-2 text-gray-400 hover:text-risk-red hover:bg-risk-red/10 rounded-lg transition-all duration-300">
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
