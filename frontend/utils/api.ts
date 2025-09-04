import axios from 'axios'

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
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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
      // Handle unauthorized access
      localStorage.removeItem('auth_token')
      window.location.href = '/'
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
  recommendations: string[]
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

// API functions
export const api = {
  // Portfolio endpoints
  createUser: async (walletAddress: string) => {
    const response = await apiClient.post('/api/v1/portfolio/users', {
      wallet_address: walletAddress,
      risk_tolerance: 0.5
    })
    return response.data
  },

  getPortfolio: async (walletAddress: string): Promise<Portfolio> => {
    const response = await apiClient.get(`/api/v1/portfolio/${walletAddress}`)
    return response.data
  },

  addAsset: async (walletAddress: string, asset: {
    asset_code: string
    asset_issuer?: string
    balance: number
    target_allocation: number
  }) => {
    const response = await apiClient.post(`/api/v1/portfolio/${walletAddress}/assets`, asset)
    return response.data
  },

  getAssetPrice: async (walletAddress: string, assetCode: string, assetIssuer?: string) => {
    const response = await apiClient.get(`/api/v1/portfolio/${walletAddress}/assets/${assetCode}/price`, {
      params: { asset_issuer: assetIssuer }
    })
    return response.data
  },

  // Risk analysis endpoints
  analyzeRisk: async (walletAddress: string): Promise<RiskAnalysis> => {
    const response = await apiClient.post('/api/v1/risk/analyze', {
      wallet_address: walletAddress,
      confidence_level: 0.95
    })
    return response.data
  },

  getRiskMetrics: async (walletAddress: string) => {
    const response = await apiClient.get(`/api/v1/risk/${walletAddress}/metrics`)
    return response.data
  },

  // Alerts endpoints
  getAlerts: async (walletAddress: string): Promise<Alert[]> => {
    const response = await apiClient.get(`/api/v1/alerts/${walletAddress}`)
    return response.data
  },

  getActiveAlerts: async (walletAddress: string): Promise<Alert[]> => {
    const response = await apiClient.get(`/api/v1/alerts/${walletAddress}/active`)
    return response.data
  },

  createAlert: async (walletAddress: string, alert: {
    alert_type: string
    severity: string
    message: string
  }) => {
    const response = await apiClient.post(`/api/v1/alerts/${walletAddress}`, alert)
    return response.data
  },

  resolveAlert: async (alertId: number) => {
    const response = await apiClient.patch(`/api/v1/alerts/${alertId}/resolve`)
    return response.data
  },

  deleteAlert: async (alertId: number) => {
    const response = await apiClient.delete(`/api/v1/alerts/${alertId}`)
    return response.data
  },

  getAlertStats: async (walletAddress: string) => {
    const response = await apiClient.get(`/api/v1/alerts/${walletAddress}/stats`)
    return response.data
  },

  // Rebalancing endpoints
  suggestRebalancing: async (walletAddress: string, options?: {
    threshold?: number
    max_slippage?: number
  }): Promise<RebalanceSuggestion> => {
    const response = await apiClient.post('/api/v1/rebalance/suggest', {
      wallet_address: walletAddress,
      threshold: options?.threshold || 0.05,
      max_slippage: options?.max_slippage || 0.01
    })
    return response.data
  },

  executeRebalancing: async (walletAddress: string, orders: RebalanceOrder[]) => {
    const response = await apiClient.post('/api/v1/rebalance/execute', {
      wallet_address: walletAddress,
      orders
    })
    return response.data
  },

  getRebalanceHistory: async (walletAddress: string) => {
    const response = await apiClient.get(`/api/v1/rebalance/${walletAddress}/history`)
    return response.data
  },

  // Health check
  healthCheck: async () => {
    const response = await apiClient.get('/health')
    return response.data
  }
}

export default api
