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
        return 'text-blue-600 bg-blue-100'
      case 'medium':
        return 'text-orange-600 bg-orange-100'
      case 'high':
        return 'text-red-600 bg-red-100'
      case 'critical':
        return 'text-red-800 bg-red-200'
      default:
        return 'text-gray-600 bg-gray-100'
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
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Bell className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Alertas</h3>
            <p className="text-sm text-gray-600">
              {activeAlertsCount} ativos • {criticalAlertsCount} críticos
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-sm border-2 border-gray-400 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black font-medium"
          >
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="resolved">Resolvidos</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="text-sm border-2 border-gray-400 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black font-medium"
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
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
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
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700 font-medium">
              {activeAlertsCount} alertas ativos precisam de atenção
            </p>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Resolver Todos
              </button>
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-200 hover:border-gray-400 font-medium">
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
        return 'text-blue-600 bg-blue-100'
      case 'medium':
        return 'text-orange-600 bg-orange-100'
      case 'high':
        return 'text-red-600 bg-red-100'
      case 'critical':
        return 'text-red-800 bg-red-200'
      default:
        return 'text-gray-600 bg-gray-100'
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
    <div className={`p-4 rounded-lg border-l-4 ${
      alert.is_active 
        ? 'bg-white border-l-orange-500 shadow-sm' 
        : 'bg-gray-50 border-l-gray-300'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="text-lg">
            {getAlertTypeIcon(alert.alert_type)}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                {getSeverityIcon(alert.severity)} {alert.severity}
              </span>
              <span className="text-xs text-gray-500 uppercase tracking-wide">
                {alert.alert_type}
              </span>
            </div>
            
            <p className="text-sm text-gray-900 mb-2">
              {alert.message}
            </p>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>
                  {formatDistanceToNow(new Date(alert.triggered_at), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </span>
              </div>
              
              {alert.is_active ? (
                <div className="flex items-center space-x-1 text-orange-600">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Ativo</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  <span>Resolvido</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {alert.is_active && (
            <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-300 border border-gray-300 hover:border-green-300">
              <CheckCircle className="h-5 w-5" />
            </button>
          )}
          <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 border border-gray-300 hover:border-red-300">
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
