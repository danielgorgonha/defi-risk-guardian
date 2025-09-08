/**
 * Mock Data for DeFi Risk Guardian Demo Mode
 * Contains all mock data needed by frontend in demo mode
 * Migrated from backend/app/fixtures/demo_fixtures.py
 */

export const DEMO_WALLET_ADDRESS = "GDEMOTEST1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJK"

// Helper function to generate timestamps
const getTimestamp = (daysAgo: number = 0) => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString()
}

// Helper function to generate price history
const generatePriceHistory = (assetCode: string, days: number = 30) => {
  const basePrices: Record<string, number> = {
    "XLM": 0.25,
    "USDC": 1.0,
    "ETH": 2258.06,
    "BTC": 70312.50
  }
  
  const basePrice = basePrices[assetCode] || 1.0
  const history = []
  
  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (days - i))
    
    // Add some realistic price variation
    const variation = (Math.random() - 0.5) * 0.1 // ±5% daily variation
    const price = basePrice * (1 + variation * (i / days)) // Trend over time
    
    history.push({
      date: date.toISOString().split('T')[0],
      price_usd: Number(price.toFixed(6)),
      volume_24h: Math.random() * 9000000 + 1000000, // Random volume
      market_cap: price * (Math.random() * 99000000000 + 1000000000) // Random market cap
    })
  }
  
  return history
}

export const mockData = {
  /**
   * Portfolio data for dashboard and portfolio pages
   */
  getPortfolio: () => ({
    id: 1,
    wallet_address: DEMO_WALLET_ADDRESS,
    risk_tolerance: 0.6, // 60% risk tolerance
    total_value: 128750.0,
    risk_score: 42.5,
    assets: [
      {
        id: 1,
        asset_code: "XLM",
        asset_issuer: undefined,
        balance: 50000.0,
        target_allocation: 10.0,
        current_allocation: 9.73,
        value_usd: 12500.0,
        price_usd: 0.25
      },
      {
        id: 2,
        asset_code: "USDC",
        asset_issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
        balance: 25000.0,
        target_allocation: 20.0,
        current_allocation: 19.42,
        value_usd: 25000.0,
        price_usd: 1.0
      },
      {
        id: 3,
        asset_code: "ETH",
        asset_issuer: "GDVKVA22NDD3M5TBUHX7LPOQLPDRH6GVB63WXLRGDVWJDIERA5EYT25O",
        balance: 15.5,
        target_allocation: 30.0,
        current_allocation: 27.18,
        value_usd: 35000.0,
        price_usd: 2258.06
      },
      {
        id: 4,
        asset_code: "BTC",
        asset_issuer: "GBVOL67TMUQBGL4TZYNMY3ZQ5WGQYFPFD5VJRWXR72VA33VFNL225PL5",
        balance: 0.8,
        target_allocation: 40.0,
        current_allocation: 43.67,
        value_usd: 56250.0,
        price_usd: 70312.50
      }
    ]
  }),

  /**
   * Risk analysis data for dashboard
   */
  getRiskAnalysis: () => ({
    portfolio_value: 128750.0,
    var_95: 3862.5, // 3% at 95% confidence
    var_99: 6437.5, // 5% at 99% confidence
    volatility: 22.3, // 22.3% annualized volatility
    sharpe_ratio: 1.35,
    beta: 0.89, // Relative to crypto market
    max_drawdown: 15.2,
    risk_score: 42.5,
    recommendations: [
      {
        type: "rebalance",
        priority: "medium",
        title: "Reduce BTC Allocation",
        description: "Consider reducing BTC allocation from 43.67% to target 40%",
        impact: "Lower portfolio concentration risk"
      },
      {
        type: "diversification",
        priority: "low",
        title: "Add Diversification",
        description: "Add more stablecoins or DeFi tokens for better diversification",
        impact: "Reduce overall portfolio volatility"
      },
      {
        type: "risk_management",
        priority: "high",
        title: "Set Stop-Loss Orders",
        description: "Set stop-loss orders at 20% below current prices",
        impact: "Limit potential downside losses"
      }
    ],
    risk_factors: {
      concentration_risk: 43.67, // High BTC allocation
      volatility_risk: 22.3,
      liquidity_risk: 5.2, // Low liquidity risk
      correlation_risk: 67.8 // High correlation between crypto assets
    },
    timestamp: new Date().toISOString()
  }),

  /**
   * Alerts data for dashboard and alerts pages
   */
  getAlerts: () => ({
    alerts: [
      {
        id: 1,
        alert_type: "rebalance",
        severity: "medium",
        message: "BTC allocation is 3.67% above target. Consider rebalancing to optimize risk-adjusted returns.",
        triggered_at: getTimestamp(0.08), // 2 hours ago
        resolved_at: null,
        is_active: true,
        portfolio_id: 1,
        user_id: "demo"
      },
      {
        id: 2,
        alert_type: "volatility",
        severity: "high",
        message: "High volatility detected across crypto assets. Portfolio volatility increased to 22.3%. Consider reducing risk exposure.",
        triggered_at: getTimestamp(0.17), // 4 hours ago
        resolved_at: null,
        is_active: true,
        portfolio_id: 1,
        user_id: "demo"
      },
      {
        id: 3,
        alert_type: "anomaly",
        severity: "low",
        message: "Price anomaly detected in XLM/USDC pair. Potential arbitrage opportunity with 1.2% price difference.",
        triggered_at: getTimestamp(0.25), // 6 hours ago
        resolved_at: null,
        is_active: true,
        portfolio_id: 1,
        user_id: "demo"
      },
      {
        id: 4,
        alert_type: "liquidation",
        severity: "low",
        message: "Liquidation risk assessment: Current portfolio is healthy with low liquidation risk (5.2%).",
        triggered_at: getTimestamp(0.33), // 8 hours ago
        resolved_at: getTimestamp(0.25), // 6 hours ago
        is_active: false,
        portfolio_id: 1,
        user_id: "demo"
      },
      {
        id: 5,
        alert_type: "market_update",
        severity: "low",
        message: "Market sentiment update: Crypto market showing bullish signals. Consider increasing exposure if aligned with your risk tolerance.",
        triggered_at: getTimestamp(0.5), // 12 hours ago
        resolved_at: null,
        is_active: true,
        portfolio_id: 1,
        user_id: "demo"
      }
    ],
    total_active: 4,
    total_resolved: 1,
    timestamp: new Date().toISOString()
  }),

  /**
   * Rebalancing suggestions data
   */
  getRebalanceSuggestions: () => ({
    should_rebalance: true,
    confidence_score: 78.5,
    current_allocation: {
      XLM: 9.73,
      USDC: 19.42,
      ETH: 27.18,
      BTC: 43.67
    },
    target_allocation: {
      XLM: 10.0,
      USDC: 20.0,
      ETH: 30.0,
      BTC: 40.0
    },
    suggested_orders: [
      {
        asset_code: "BTC",
        order_type: "sell" as const,
        current_value: 56250.0,
        target_value: 51500.0,
        value_difference: -4750.0,
        current_allocation: 43.67,
        target_allocation: 40.0
      },
      {
        asset_code: "ETH",
        order_type: "buy" as const,
        current_value: 35000.0,
        target_value: 38625.0,
        value_difference: 3625.0,
        current_allocation: 27.18,
        target_allocation: 30.0
      },
      {
        asset_code: "USDC",
        order_type: "buy" as const,
        current_value: 25000.0,
        target_value: 25750.0,
        value_difference: 750.0,
        current_allocation: 19.42,
        target_allocation: 20.0
      },
      {
        asset_code: "XLM",
        order_type: "buy" as const,
        current_value: 12500.0,
        target_value: 12875.0,
        value_difference: 375.0,
        current_allocation: 9.73,
        target_allocation: 10.0
      }
    ],
    estimated_cost: 15.75, // Trading fees
    risk_improvement: 8.2, // % improvement in risk score
    expected_return_improvement: 3.1, // % improvement in expected return
    timestamp: new Date().toISOString()
  }),

  /**
   * AI analysis data for demo mode
   */
  getAIAnalysis: () => ({
    risk_metrics: {
      portfolio_value: 128750.0,
      var_95: 11925.85,
      var_99: 16440.70,
      cvar_95: 13683.27,
      volatility: 1.14,
      sharpe_ratio: 0.696,
      sortino_ratio: 0.825,
      beta: 0.924,
      max_drawdown: 0.087,
      risk_score: 42.5,
      diversification_ratio: 0.73,
      tail_risk: 0.156,
      recommendations: [
        "Consider increasing allocation to USDC for stability",
        "Portfolio shows good diversification across asset classes",
        "Monitor volatility levels during market downturns"
      ]
    },
    price_predictions: [
      {
        asset_code: "XLM",
        current_price: 0.25,
        trend: "bullish",
        confidence: 0.78,
        support_level: 0.22,
        resistance_level: 0.32,
        predictions: [
          { timestamp: "2024-12-08T00:00:00", predicted_price: 0.26, confidence_interval: 0.03 },
          { timestamp: "2024-12-09T00:00:00", predicted_price: 0.27, confidence_interval: 0.04 },
          { timestamp: "2024-12-10T00:00:00", predicted_price: 0.28, confidence_interval: 0.05 }
        ]
      },
      {
        asset_code: "USDC",
        current_price: 1.0,
        trend: "stable",
        confidence: 0.95,
        support_level: 0.999,
        resistance_level: 1.001,
        predictions: [
          { timestamp: "2024-12-08T00:00:00", predicted_price: 1.0, confidence_interval: 0.001 },
          { timestamp: "2024-12-09T00:00:00", predicted_price: 1.0, confidence_interval: 0.001 },
          { timestamp: "2024-12-10T00:00:00", predicted_price: 1.0, confidence_interval: 0.001 }
        ]
      }
    ],
    ai_recommendations: [
      {
        type: "rebalancing",
        priority: "high",
        asset_code: "XLM",
        current_allocation: 9.73,
        recommended_allocation: 7.50,
        reason: "Reduce concentration risk in volatile assets",
        expected_impact: {
          risk_reduction: 0.15,
          return_impact: -0.02,
          sharpe_improvement: 0.08
        }
      },
      {
        type: "risk_management",
        priority: "medium",
        asset_code: "USDC",
        current_allocation: 23.30,
        recommended_allocation: 25.80,
        reason: "Increase stability allocation for better risk management",
        expected_impact: {
          risk_reduction: 0.10,
          return_impact: -0.01,
          volatility_reduction: 0.12
        }
      }
    ]
  }),

  /**
   * Price history for assets
   */
  getPriceHistory: (assetCode: string = "XLM", days: number = 30) => {
    return generatePriceHistory(assetCode, days)
  },

  /**
   * Consolidated data - all data needed by frontend in a single response
   */
  getConsolidatedData: () => ({
    demo_mode: true,
    portfolio: mockData.getPortfolio(),
    risk_analysis: mockData.getRiskAnalysis(),
    alerts: mockData.getAlerts(),
    rebalance_suggestions: mockData.getRebalanceSuggestions(),
    price_history: {
      XLM: mockData.getPriceHistory("XLM", 30),
      USDC: mockData.getPriceHistory("USDC", 30),
      ETH: mockData.getPriceHistory("ETH", 30),
      BTC: mockData.getPriceHistory("BTC", 30)
    },
    timestamp: new Date().toISOString()
  }),

  /**
   * Mock price data for quick access
   */
  getMockPrices: () => ({
    XLM: 0.25,
    USDC: 1.0,
    BTC: 70312.50,
    ETH: 2258.06
  }),

  /**
   * Supported assets list
   */
  getSupportedAssets: () => [
    {
      asset_code: "XLM",
      asset_issuer: null,
      name: "Stellar Lumens",
      description: "Native Stellar asset",
      decimals: 7,
      is_native: true
    },
    {
      asset_code: "USDC",
      asset_issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
      name: "USD Coin",
      description: "Circle USD Coin",
      decimals: 7,
      is_native: false
    },
    {
      asset_code: "ETH",
      asset_issuer: "GDVKVA22NDD3M5TBUHX7LPOQLPDRH6GVB63WXLRGDVWJDIERA5EYT25O",
      name: "Ethereum",
      description: "Ethereum wrapped on Stellar",
      decimals: 7,
      is_native: false
    },
    {
      asset_code: "BTC",
      asset_issuer: "GBVOL67TMUQBGL4TZYNMY3ZQ5WGQYFPFD5VJRWXR72VA33VFNL225PL5",
      name: "Bitcoin",
      description: "Bitcoin wrapped on Stellar",
      decimals: 7,
      is_native: false
    }
  ]
}

export default mockData
