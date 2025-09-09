import axios from 'axios'
import { mockData } from './mockData'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available (only on client side)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      
      // Demo mode is now handled locally in frontend - no need to send to backend
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (only on client side)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)

// Types
export interface Portfolio {
  id: number
  wallet_address: string
  risk_tolerance: number
  total_value: number
  assets: Asset[]
  risk_score: number
}

export interface Asset {
  id: number
  asset_code: string
  asset_issuer?: string
  balance: number
  price_usd: number
  value_usd: number
  target_allocation: number
  current_allocation: number
}

export interface RiskAnalysis {
  portfolio_value: number
  var_95: number
  var_99: number
  volatility: number
  sharpe_ratio: number
  beta: number
  max_drawdown: number
  risk_score: number
  recommendations: (string | {
    type: string
    priority: string
    title: string
    description: string
    impact: string
  })[]
}

export interface Alert {
  id: number
  alert_type: string
  severity: string
  message: string
  triggered_at: string
  is_active: boolean
}

export interface RebalanceSuggestion {
  should_rebalance: boolean
  current_allocation: Record<string, number>
  target_allocation: Record<string, number>
  suggested_orders: RebalanceOrder[]
  estimated_cost: number
  risk_improvement: number
}

export interface RebalanceOrder {
  asset_code: string
  order_type: 'buy' | 'sell'
  current_value: number
  target_value: number
  value_difference: number
  current_allocation: number
  target_allocation: number
}

// Helper function to check if demo mode is active
const isDemoMode = (): boolean => {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('isDemoMode') === 'true'
}

// API functions
export const api = {
  // Portfolio endpoints
  createUser: async (walletAddress: string) => {
    if (isDemoMode()) {
      console.log('🎭 Demo Mode: Returning mock user creation')
      return { success: true, message: 'Demo user created', user_id: 'demo' }
    }
    
    const response = await apiClient.post('/api/v1/portfolio/users', {
      wallet_address: walletAddress,
      risk_tolerance: 0.5
    })
    return response.data
  },

  getPortfolio: async (walletAddress: string): Promise<Portfolio> => {
    if (isDemoMode()) {
      console.log('🎭 Demo Mode: Returning mock portfolio data')
      return mockData.getPortfolio()
    }
    
    const response = await apiClient.get(`/api/v1/portfolio/${walletAddress}`)
    return response.data
  },

  addAsset: async (walletAddress: string, asset: {
    asset_code: string
    asset_issuer?: string
    balance: number
    target_allocation: number
  }) => {
    if (isDemoMode()) {
      console.log('🎭 Demo Mode: Returning mock asset addition')
      return { success: true, message: 'Demo asset added', asset_id: Math.floor(Math.random() * 1000) }
    }
    
    const response = await apiClient.post(`/api/v1/portfolio/${walletAddress}/assets`, asset)
    return response.data
  },

  getAssetPrice: async (walletAddress: string, assetCode: string, assetIssuer?: string) => {
    if (isDemoMode()) {
      console.log('🎭 Demo Mode: Returning mock asset price')
      const prices = mockData.getMockPrices()
      return { 
        asset_code: assetCode, 
        price_usd: prices[assetCode as keyof typeof prices] || 1.0,
        timestamp: new Date().toISOString()
      }
    }
    
    const response = await apiClient.get(`/api/v1/portfolio/${walletAddress}/assets/${assetCode}/price`, {
      params: { asset_issuer: assetIssuer }
    })
    return response.data
  },

  // Risk analysis endpoints
  analyzeRisk: async (walletAddress: string): Promise<RiskAnalysis> => {
    if (isDemoMode()) {
      console.log('🎭 Demo Mode: Returning mock risk analysis')
      return mockData.getRiskAnalysis()
    }
    
    const response = await apiClient.post('/api/v1/risk/ai-analysis', {
      wallet_address: walletAddress,
      confidence_level: 0.95
    })
    // The API returns { risk_metrics: {...} }, so we need to extract risk_metrics
    return response.data.risk_metrics
  },

  getRiskMetrics: async (walletAddress: string) => {
    if (isDemoMode()) {
      console.log('🎭 Demo Mode: Returning mock risk metrics')
      return mockData.getRiskAnalysis()
    }
    
    const response = await apiClient.get(`/api/v1/risk/${walletAddress}/metrics`)
    return response.data
  },

  // AI analysis endpoint
  aiAnalysis: async (walletAddress: string) => {
    if (isDemoMode()) {
      console.log('🎭 Demo Mode: Returning mock AI analysis')
      return mockData.getAIAnalysis()
    }
    
    const response = await apiClient.post('/api/v1/risk/ai-analysis', {
      wallet_address: walletAddress
    })
    return response.data
  },

  // Alerts endpoints
  getAlerts: async (walletAddress: string): Promise<Alert[]> => {
    if (isDemoMode()) {
      console.log('🎭 Demo Mode: Returning mock alerts')
      const alertsData = mockData.getAlerts()
      return alertsData.alerts
    }
    
    const response = await apiClient.get(`/api/v1/alerts/${walletAddress}`)
    return response.data
  },

  getActiveAlerts: async (walletAddress: string): Promise<Alert[]> => {
    if (isDemoMode()) {
      console.log('🎭 Demo Mode: Returning mock active alerts')
      const alertsData = mockData.getAlerts()
      return alertsData.alerts.filter(alert => alert.is_active)
    }
    
    const response = await apiClient.get(`/api/v1/alerts/${walletAddress}/active`)
    return response.data
  },

  createAlert: async (walletAddress: string, alert: {
    alert_type: string
    severity: string
    message: string
  }) => {
    if (isDemoMode()) {
      console.log('🎭 Demo Mode: Returning mock alert creation')
      return { success: true, message: 'Demo alert created', alert_id: Math.floor(Math.random() * 1000) }
    }
    
    const response = await apiClient.post(`/api/v1/alerts/${walletAddress}`, alert)
    return response.data
  },

  resolveAlert: async (alertId: number) => {
    if (isDemoMode()) {
      console.log('🎭 Demo Mode: Returning mock alert resolution')
      return { success: true, message: 'Demo alert resolved' }
    }
    
    const response = await apiClient.patch(`/api/v1/alerts/${alertId}/resolve`)
    return response.data
  },

  deleteAlert: async (alertId: number) => {
    if (isDemoMode()) {
      console.log('🎭 Demo Mode: Returning mock alert deletion')
      return { success: true, message: 'Demo alert deleted' }
    }
    
    const response = await apiClient.delete(`/api/v1/alerts/${alertId}`)
    return response.data
  },

  getAlertStats: async (walletAddress: string) => {
    if (isDemoMode()) {
      console.log('🎭 Demo Mode: Returning mock alert stats')
      const alertsData = mockData.getAlerts()
      return {
        total_alerts: alertsData.alerts.length,
        active_alerts: alertsData.total_active,
        resolved_alerts: alertsData.total_resolved,
        severity_breakdown: {
          high: alertsData.alerts.filter(a => a.severity === 'high').length,
          medium: alertsData.alerts.filter(a => a.severity === 'medium').length,
          low: alertsData.alerts.filter(a => a.severity === 'low').length
        }
      }
    }
    
    const response = await apiClient.get(`/api/v1/alerts/${walletAddress}/stats`)
    return response.data
  },

  // Rebalancing endpoints
  suggestRebalancing: async (walletAddress: string, options?: {
    threshold?: number
    max_slippage?: number
  }): Promise<RebalanceSuggestion> => {
    if (isDemoMode()) {
      console.log('🎭 Demo Mode: Returning mock rebalancing suggestions')
      return mockData.getRebalanceSuggestions()
    }
    
    const response = await apiClient.post('/api/v1/rebalance/suggest', {
      wallet_address: walletAddress,
      threshold: options?.threshold || 0.05,
      max_slippage: options?.max_slippage || 0.01
    })
    return response.data
  },

  executeRebalancing: async (walletAddress: string, orders: RebalanceOrder[]) => {
    if (isDemoMode()) {
      console.log('🎭 Demo Mode: Returning mock rebalancing execution')
      return { 
        success: true, 
        message: 'Demo rebalancing executed', 
        transaction_id: `demo_tx_${Math.floor(Math.random() * 10000)}`,
        orders_executed: orders.length
      }
    }
    
    const response = await apiClient.post('/api/v1/rebalance/execute', {
      wallet_address: walletAddress,
      orders
    })
    return response.data
  },

  getRebalanceHistory: async (walletAddress: string) => {
    if (isDemoMode()) {
      console.log('🎭 Demo Mode: Returning mock rebalancing history')
      return {
        rebalances: [
          {
            id: 1,
            executed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
            orders_count: 3,
            total_cost: 12.50,
            risk_improvement: 5.2,
            status: 'completed'
          },
          {
            id: 2,
            executed_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
            orders_count: 2,
            total_cost: 8.75,
            risk_improvement: 3.1,
            status: 'completed'
          }
        ],
        total_rebalances: 2
      }
    }
    
    const response = await apiClient.get(`/api/v1/rebalance/${walletAddress}/history`)
    return response.data
  },

  // Health check
  healthCheck: async () => {
    if (isDemoMode()) {
      console.log('🎭 Demo Mode: Returning mock health check')
      return { 
        status: 'healthy', 
        demo_mode: true, 
        timestamp: new Date().toISOString() 
      }
    }
    
    const response = await apiClient.get('/health')
    return response.data
  },

  // Additional utility functions for demo mode
  getSupportedAssets: async () => {
    if (isDemoMode()) {
      console.log('🎭 Demo Mode: Returning mock supported assets')
      return mockData.getSupportedAssets()
    }
    
    // This would be a real API call if not in demo mode
    const response = await apiClient.get('/api/v1/portfolio/supported-assets')
    return response.data
  },

  // Demo mode is now handled automatically via localStorage flag
  // All endpoints check isDemoMode() and return mock data when true
}

export default api
