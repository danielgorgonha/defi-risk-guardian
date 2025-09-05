"""
Mock data fixtures for testing
"""
from typing import Dict, List, Any

# Sample wallet addresses
MOCK_WALLET_ADDRESSES = [
    "GDEMO123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "GDEMO987654321ZYXWVUTSRQPONMLKJIHGFEDCBA",
    "GDEMO555666777888999000111222333444555666"
]

# Sample user data
MOCK_USERS = [
    {
        "wallet_address": "GDEMO123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        "risk_tolerance": 0.5,
        "created_at": "2024-01-01T00:00:00Z"
    },
    {
        "wallet_address": "GDEMO987654321ZYXWVUTSRQPONMLKJIHGFEDCBA", 
        "risk_tolerance": 0.7,
        "created_at": "2024-01-02T00:00:00Z"
    },
    {
        "wallet_address": "GDEMO555666777888999000111222333444555666",
        "risk_tolerance": 0.3,
        "created_at": "2024-01-03T00:00:00Z"
    }
]

# Sample portfolio assets
MOCK_PORTFOLIO_ASSETS = [
    {
        "asset_code": "XLM",
        "asset_issuer": "native",
        "balance": 1000.0,
        "price": 0.12,
        "value": 120.0
    },
    {
        "asset_code": "USDC",
        "asset_issuer": "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
        "balance": 500.0,
        "price": 1.0,
        "value": 500.0
    },
    {
        "asset_code": "BTC",
        "asset_issuer": "GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR",
        "balance": 0.1,
        "price": 45000.0,
        "value": 4500.0
    }
]

# Sample risk alerts
MOCK_ALERTS = [
    {
        "alert_type": "high_volatility",
        "severity": "warning",
        "message": "High volatility detected in XLM position",
        "threshold": 0.15,
        "current_value": 0.18,
        "is_active": True
    },
    {
        "alert_type": "rebalance_needed",
        "severity": "info",
        "message": "Portfolio rebalancing recommended",
        "threshold": 0.1,
        "current_value": 0.12,
        "is_active": True
    },
    {
        "alert_type": "liquidity_risk",
        "severity": "critical",
        "message": "Low liquidity detected in BTC position",
        "threshold": 0.05,
        "current_value": 0.02,
        "is_active": False
    }
]

# Sample risk metrics
MOCK_RISK_METRICS = {
    "portfolio_value": 5120.0,
    "volatility": 0.25,
    "sharpe_ratio": 1.2,
    "max_drawdown": 0.15,
    "risk_score": 0.65,
    "recommendations": [
        "Consider reducing XLM exposure",
        "Add more stable assets like USDC",
        "Monitor BTC position closely"
    ]
}

# Sample price history
MOCK_PRICE_HISTORY = [
    {"timestamp": "2024-01-01T00:00:00Z", "price": 0.11, "volume": 1000000},
    {"timestamp": "2024-01-01T01:00:00Z", "price": 0.115, "volume": 1200000},
    {"timestamp": "2024-01-01T02:00:00Z", "price": 0.12, "volume": 1100000},
    {"timestamp": "2024-01-01T03:00:00Z", "price": 0.118, "volume": 900000},
    {"timestamp": "2024-01-01T04:00:00Z", "price": 0.122, "volume": 1300000}
]

# Sample rebalance suggestions
MOCK_REBALANCE_SUGGESTIONS = {
    "current_allocation": {
        "XLM": 0.4,
        "USDC": 0.3,
        "BTC": 0.3
    },
    "target_allocation": {
        "XLM": 0.3,
        "USDC": 0.4,
        "BTC": 0.3
    },
    "suggested_trades": [
        {
            "asset_code": "XLM",
            "action": "sell",
            "amount": 100.0,
            "reason": "Reduce volatility exposure"
        },
        {
            "asset_code": "USDC",
            "action": "buy",
            "amount": 100.0,
            "reason": "Increase stability"
        }
    ],
    "expected_improvement": {
        "volatility_reduction": 0.05,
        "risk_score_improvement": 0.1
    }
}

# Reflector API mock responses
MOCK_REFLECTOR_RESPONSES = {
    "XLM": {
        "price": 0.12,
        "volume_24h": 1000000,
        "change_24h": 0.05,
        "last_updated": "2024-01-01T12:00:00Z"
    },
    "USDC": {
        "price": 1.0,
        "volume_24h": 5000000,
        "change_24h": 0.001,
        "last_updated": "2024-01-01T12:00:00Z"
    },
    "BTC": {
        "price": 45000.0,
        "volume_24h": 500000,
        "change_24h": -0.02,
        "last_updated": "2024-01-01T12:00:00Z"
    }
}

# Error scenarios for testing
MOCK_ERROR_SCENARIOS = {
    "user_not_found": {
        "error": "User not found",
        "status_code": 404
    },
    "invalid_wallet_address": {
        "error": "Invalid wallet address format",
        "status_code": 400
    },
    "insufficient_balance": {
        "error": "Insufficient balance for operation",
        "status_code": 400
    },
    "reflector_api_error": {
        "error": "Failed to fetch price data from Reflector",
        "status_code": 503
    },
    "database_error": {
        "error": "Database connection failed",
        "status_code": 500
    }
}
