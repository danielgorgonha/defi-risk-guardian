# API Reference

## Enterprise API Documentation

Risk Guardian provides institutional-grade APIs designed for seamless integration with existing financial infrastructure, risk management systems, and trading platforms.

## Authentication

### API Key Management
```http
POST /api/v1/auth/api-keys
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Trading System Integration",
  "permissions": ["read:portfolios", "write:risk-alerts"],
  "rate_limit": 10000,
  "expires_at": "2025-12-31T23:59:59Z"
}
```

### Response
```json
{
  "api_key": "rg_live_sk_1234567890abcdef",
  "secret": "rg_live_sk_secret_fedcba0987654321",
  "created_at": "2025-01-20T10:00:00Z",
  "rate_limit": 10000
}
```

## Portfolio Management

### Get Portfolio Risk Analysis
```http
GET /api/v1/portfolios/{portfolio_id}/risk-analysis
Authorization: Bearer <api_key>
```

**Response:**
```json
{
  "portfolio_id": "portfolio_123",
  "timestamp": "2025-01-20T10:00:00Z",
  "total_value_usd": 2847392.50,
  "risk_metrics": {
    "var_95": 127431.67,
    "var_99": 203954.12,
    "volatility": 0.157,
    "beta": 1.23,
    "sharpe_ratio": 1.84,
    "max_drawdown": 0.089
  },
  "risk_score": {
    "overall": 67,
    "concentration": 45,
    "volatility": 78,
    "correlation": 89
  },
  "alerts": [
    {
      "type": "high_volatility",
      "severity": "medium",
      "message": "ETH volatility increased by 23% in last 4 hours",
      "confidence": 0.94
    }
  ]
}
```

### Real-time Portfolio Updates
```http
GET /api/v1/portfolios/{portfolio_id}/stream
Authorization: Bearer <api_key>
Connection: Upgrade
Upgrade: websocket
```

**WebSocket Messages:**
```json
{
  "event": "risk_alert",
  "data": {
    "alert_id": "alert_789",
    "type": "liquidation_risk",
    "severity": "high",
    "portfolio_id": "portfolio_123",
    "message": "Collateral ratio dropped to 135% on AAVE position",
    "action_required": true,
    "confidence": 0.97,
    "timestamp": "2025-01-20T10:15:30Z"
  }
}
```

## Risk Intelligence

### Predictive Risk Analysis
```http
POST /api/v1/risk/predict
Authorization: Bearer <api_key>
Content-Type: application/json

{
  "portfolio": {
    "assets": [
      {"symbol": "ETH", "balance": 100.5, "value_usd": 245678.90},
      {"symbol": "BTC", "balance": 5.2, "value_usd": 543210.15}
    ]
  },
  "prediction_horizon": "7d",
  "confidence_level": 0.95
}
```

**Response:**
```json
{
  "prediction_id": "pred_456",
  "horizon": "7d",
  "confidence": 0.95,
  "predictions": {
    "portfolio_value": {
      "expected": 2847392.50,
      "worst_case": 2419283.63,
      "best_case": 3275501.37,
      "confidence_interval": [2591053.25, 3103731.75]
    },
    "risk_events": [
      {
        "type": "market_crash",
        "probability": 0.12,
        "potential_loss": 427108.87,
        "trigger_conditions": ["spy_drop_10pct", "crypto_correlation_spike"]
      }
    ]
  }
}
```

### Market Anomaly Detection
```http
GET /api/v1/market/anomalies?assets=ETH,BTC&timeframe=24h
Authorization: Bearer <api_key>
```

**Response:**
```json
{
  "timestamp": "2025-01-20T10:00:00Z",
  "timeframe": "24h",
  "anomalies": [
    {
      "asset": "ETH",
      "anomaly_type": "volume_spike",
      "severity": "medium",
      "anomaly_score": 0.89,
      "description": "Trading volume 340% above 30-day average",
      "detected_at": "2025-01-20T09:45:00Z",
      "impact_assessment": {
        "price_impact": 0.067,
        "volatility_increase": 0.23,
        "correlation_change": 0.15
      }
    }
  ]
}
```

## Automated Rebalancing

### Portfolio Optimization
```http
POST /api/v1/portfolios/{portfolio_id}/optimize
Authorization: Bearer <api_key>
Content-Type: application/json

{
  "objective": "minimize_risk",
  "constraints": {
    "max_single_asset_weight": 0.40,
    "min_diversification_ratio": 0.70,
    "max_turnover": 0.25
  },
  "execution_mode": "simulate"
}
```

**Response:**
```json
{
  "optimization_id": "opt_789",
  "current_allocation": {
    "ETH": 0.35,
    "BTC": 0.45,
    "XLM": 0.20
  },
  "optimal_allocation": {
    "ETH": 0.30,
    "BTC": 0.40,
    "XLM": 0.30
  },
  "expected_improvements": {
    "risk_reduction": 0.087,
    "sharpe_improvement": 0.23,
    "expected_return": 0.156
  },
  "execution_plan": [
    {"action": "sell", "asset": "BTC", "amount": 0.52, "estimated_slippage": 0.002},
    {"action": "buy", "asset": "XLM", "amount": 15420.30, "estimated_slippage": 0.001}
  ]
}
```

## Enterprise Integration

### Compliance Reporting
```http
GET /api/v1/compliance/reports?type=risk_exposure&format=json&period=quarterly
Authorization: Bearer <api_key>
```

### Bulk Operations
```http
POST /api/v1/bulk/risk-analysis
Authorization: Bearer <api_key>
Content-Type: application/json

{
  "portfolio_ids": ["portfolio_123", "portfolio_456", "portfolio_789"],
  "analysis_types": ["var", "stress_test", "scenario_analysis"],
  "callback_url": "https://your-system.com/webhooks/risk-analysis"
}
```

## Rate Limits & Quotas

| Tier | Requests/Hour | WebSocket Connections | Historical Data |
|------|---------------|----------------------|-----------------|
| **Basic** | 1,000 | 5 | 30 days |
| **Professional** | 10,000 | 50 | 1 year |
| **Enterprise** | 100,000 | 500 | 5 years |
| **Custom** | Unlimited | Unlimited | Unlimited |

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "INSUFFICIENT_COLLATERAL",
    "message": "Portfolio collateral ratio below minimum threshold",
    "details": {
      "current_ratio": 1.23,
      "minimum_required": 1.50,
      "suggested_action": "increase_collateral"
    },
    "timestamp": "2025-01-20T10:00:00Z",
    "request_id": "req_123456789"
  }
}
```

### Error Codes
- `PORTFOLIO_NOT_FOUND` (404)
- `INSUFFICIENT_PERMISSIONS` (403)
- `RATE_LIMIT_EXCEEDED` (429)
- `INVALID_RISK_PARAMETERS` (400)
- `MARKET_DATA_UNAVAILABLE` (503)

## SDKs & Libraries

> **📋 Developer Roadmap**: Official SDKs are currently in development. Join our developer preview program at contato@dgservices.com.br

### Python SDK *(Coming Q2 2025)*
```python
# Planned implementation - Join beta program for early access
import risk_guardian

client = risk_guardian.Client(api_key="your_api_key")
portfolio = client.portfolios.get("portfolio_123")
risk_analysis = portfolio.analyze_risk()
print(f"VaR 95%: ${risk_analysis.var_95:,.2f}")
```

### JavaScript SDK *(Coming Q2 2025)*
```javascript
// Planned implementation - Register for beta access
import RiskGuardian from '@risk-guardian/sdk';

const client = new RiskGuardian({
  apiKey: process.env.RISK_GUARDIAN_API_KEY
});

const analysis = await client.portfolios.analyzeRisk('portfolio_123');
console.log(`Risk Score: ${analysis.riskScore.overall}/100`);
```

### Current Integration
For immediate integration, use our REST API directly:
```bash
curl -H "Authorization: Bearer your_api_key" \
     https://api.riskguardian.com/api/v1/portfolios/123/risk-analysis
```

---

*For additional support, contact our enterprise API team at contato@dgservices.com.br*
