"""
Demo fixtures for DeFi Risk Guardian
Contains all mock data needed by frontend in demo mode
"""

from datetime import datetime, timedelta
from typing import Dict, Any, List

DEMO_WALLET_ADDRESS = "GDEMOTEST1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJK"

class DemoFixtures:
    """
    Centralized demo fixtures for all frontend screens
    """
    
    @staticmethod
    def get_portfolio_data() -> Dict[str, Any]:
        """
        Portfolio data for dashboard and portfolio pages
        Matches Frontend Portfolio interface
        """
        return {
            "user_id": "demo",
            "wallet_address": DEMO_WALLET_ADDRESS,
            "risk_tolerance": 0.6,  # 60% risk tolerance
            "total_value": 128750.0,
            "risk_score": 42.5,
            "assets": [
                {
                    "id": 1,
                    "asset_code": "XLM",
                    "asset_issuer": None,
                    "balance": 50000.0,
                    "target_allocation": 10.0,
                    "current_allocation": 9.73,
                    "value_usd": 12500.0,
                    "price_usd": 0.25,
                    "status": "owned",
                    "notes": "Native Stellar asset",
                    "target_date": None,
                    "created_at": (datetime.now() - timedelta(days=30)).isoformat(),
                    "updated_at": None
                },
                {
                    "id": 2,
                    "asset_code": "USDC",
                    "asset_issuer": "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
                    "balance": 25000.0,
                    "target_allocation": 20.0,
                    "current_allocation": 19.42,
                    "value_usd": 25000.0,
                    "price_usd": 1.0,
                    "status": "owned",
                    "notes": "Circle USD Coin",
                    "target_date": None,
                    "created_at": (datetime.now() - timedelta(days=25)).isoformat(),
                    "updated_at": None
                },
                {
                    "id": 3,
                    "asset_code": "ETH",
                    "asset_issuer": "GDVKVA22NDD3M5TBUHX7LPOQLPDRH6GVB63WXLRGDVWJDIERA5EYT25O",
                    "balance": 15.5,
                    "target_allocation": 30.0,
                    "current_allocation": 27.18,
                    "value_usd": 35000.0,
                    "price_usd": 2258.06,
                    "status": "owned", 
                    "notes": "Ethereum wrapped on Stellar",
                    "target_date": None,
                    "created_at": (datetime.now() - timedelta(days=20)).isoformat(),
                    "updated_at": None
                },
                {
                    "id": 4,
                    "asset_code": "BTC",
                    "asset_issuer": "GBVOL67TMUQBGL4TZYNMY3ZQ5WGQYFPFD5VJRWXR72VA33VFNL225PL5",
                    "balance": 0.8,
                    "target_allocation": 40.0,
                    "current_allocation": 43.67,
                    "value_usd": 56250.0,
                    "price_usd": 70312.50,
                    "status": "owned",
                    "notes": "Bitcoin wrapped on Stellar",
                    "target_date": None,
                    "created_at": (datetime.now() - timedelta(days=15)).isoformat(),
                    "updated_at": None
                }
            ],
            "timestamp": datetime.now().isoformat()
        }
    
    @staticmethod
    def get_risk_analysis() -> Dict[str, Any]:
        """
        Risk analysis data for dashboard
        Matches Frontend RiskAnalysis interface
        """
        return {
            "portfolio_value": 128750.0,
            "var_95": 3862.5,  # 3% at 95% confidence
            "var_99": 6437.5,  # 5% at 99% confidence
            "volatility": 22.3,  # 22.3% annualized volatility
            "sharpe_ratio": 1.35,
            "beta": 0.89,  # Relative to crypto market
            "max_drawdown": 15.2,
            "risk_score": 42.5,
            "recommendations": [
                {
                    "type": "rebalance",
                    "priority": "medium",
                    "action": "Consider reducing BTC allocation from 43.67% to target 40%",
                    "impact": "Lower portfolio concentration risk"
                },
                {
                    "type": "diversification", 
                    "priority": "low",
                    "action": "Add more stablecoins or DeFi tokens for better diversification",
                    "impact": "Reduce overall portfolio volatility"
                },
                {
                    "type": "risk_management",
                    "priority": "high", 
                    "action": "Set stop-loss orders at 20% below current prices",
                    "impact": "Limit potential downside losses"
                }
            ],
            "risk_factors": {
                "concentration_risk": 43.67,  # High BTC allocation
                "volatility_risk": 22.3,
                "liquidity_risk": 5.2,  # Low liquidity risk
                "correlation_risk": 67.8  # High correlation between crypto assets
            },
            "timestamp": datetime.now().isoformat()
        }
    
    @staticmethod
    def get_alerts() -> Dict[str, Any]:
        """
        Alerts data for dashboard and alerts pages
        Matches Frontend Alert interface
        """
        return {
            "alerts": [
                {
                    "id": 1,
                    "alert_type": "rebalance",
                    "severity": "medium", 
                    "message": "BTC allocation is 3.67% above target. Consider rebalancing to optimize risk-adjusted returns.",
                    "triggered_at": (datetime.now() - timedelta(hours=2)).isoformat(),
                    "resolved_at": None,
                    "is_active": True,
                    "portfolio_id": 1,
                    "user_id": "demo"
                },
                {
                    "id": 2,
                    "alert_type": "volatility",
                    "severity": "high",
                    "message": "High volatility detected across crypto assets. Portfolio volatility increased to 22.3%. Consider reducing risk exposure.",
                    "triggered_at": (datetime.now() - timedelta(hours=4)).isoformat(),
                    "resolved_at": None,
                    "is_active": True,
                    "portfolio_id": 1,
                    "user_id": "demo"
                },
                {
                    "id": 3,
                    "alert_type": "anomaly",
                    "severity": "low",
                    "message": "Price anomaly detected in XLM/USDC pair. Potential arbitrage opportunity with 1.2% price difference.",
                    "triggered_at": (datetime.now() - timedelta(hours=6)).isoformat(),
                    "resolved_at": None,
                    "is_active": True,
                    "portfolio_id": 1,
                    "user_id": "demo"
                },
                {
                    "id": 4,
                    "alert_type": "liquidation",
                    "severity": "low",
                    "message": "Liquidation risk assessment: Current portfolio is healthy with low liquidation risk (5.2%).",
                    "triggered_at": (datetime.now() - timedelta(hours=8)).isoformat(),
                    "resolved_at": (datetime.now() - timedelta(hours=6)).isoformat(),
                    "is_active": False,
                    "portfolio_id": 1,
                    "user_id": "demo"
                },
                {
                    "id": 5,
                    "alert_type": "market_update",
                    "severity": "low",
                    "message": "Market sentiment update: Crypto market showing bullish signals. Consider increasing exposure if aligned with your risk tolerance.",
                    "triggered_at": (datetime.now() - timedelta(hours=12)).isoformat(),
                    "resolved_at": None,
                    "is_active": True,
                    "portfolio_id": 1,
                    "user_id": "demo"
                }
            ],
            "total_active": 4,
            "total_resolved": 1,
            "timestamp": datetime.now().isoformat()
        }
    
    @staticmethod
    def get_rebalance_suggestions() -> Dict[str, Any]:
        """
        Rebalancing suggestions data
        """
        return {
            "should_rebalance": True,
            "confidence_score": 78.5,
            "current_allocation": {
                "XLM": 9.73,
                "USDC": 19.42, 
                "ETH": 27.18,
                "BTC": 43.67
            },
            "target_allocation": {
                "XLM": 10.0,
                "USDC": 20.0,
                "ETH": 30.0,
                "BTC": 40.0
            },
            "suggested_orders": [
                {
                    "asset_code": "BTC",
                    "order_type": "sell",
                    "current_value": 56250.0,
                    "target_value": 51500.0,
                    "value_difference": -4750.0,
                    "current_allocation": 43.67,
                    "target_allocation": 40.0
                },
                {
                    "asset_code": "ETH", 
                    "order_type": "buy",
                    "current_value": 35000.0,
                    "target_value": 38625.0,
                    "value_difference": 3625.0,
                    "current_allocation": 27.18,
                    "target_allocation": 30.0
                },
                {
                    "asset_code": "USDC",
                    "order_type": "buy",
                    "current_value": 25000.0,
                    "target_value": 25750.0,
                    "value_difference": 750.0,
                    "current_allocation": 19.42,
                    "target_allocation": 20.0
                },
                {
                    "asset_code": "XLM",
                    "order_type": "buy", 
                    "current_value": 12500.0,
                    "target_value": 12875.0,
                    "value_difference": 375.0,
                    "current_allocation": 9.73,
                    "target_allocation": 10.0
                }
            ],
            "estimated_cost": 15.75,  # Trading fees
            "risk_improvement": 8.2,  # % improvement in risk score
            "expected_return_improvement": 3.1,  # % improvement in expected return
            "timestamp": datetime.now().isoformat()
        }
    
    @staticmethod
    def get_price_history(asset_code: str = "XLM", days: int = 30) -> List[Dict[str, Any]]:
        """
        Generate mock price history for assets
        """
        base_prices = {
            "XLM": 0.25,
            "USDC": 1.0,
            "ETH": 2258.06,
            "BTC": 70312.50
        }
        
        base_price = base_prices.get(asset_code, 1.0)
        history = []
        
        for i in range(days):
            date = datetime.now() - timedelta(days=days-i)
            # Add some realistic price variation
            import random
            variation = random.uniform(-0.05, 0.05)  # ±5% daily variation
            price = base_price * (1 + variation * (i / days))  # Trend over time
            
            history.append({
                "date": date.date().isoformat(),
                "price_usd": round(price, 6),
                "volume_24h": random.uniform(1000000, 10000000),  # Random volume
                "market_cap": price * random.uniform(1000000000, 100000000000)  # Random market cap
            })
        
        return history
    
    @staticmethod
    def get_ai_analysis_data() -> Dict[str, Any]:
        """
        Get AI analysis data for demo mode
        Format matches AIAnalysisResponse model: risk_metrics, price_predictions, ai_recommendations
        """
        return {
            "risk_metrics": {
                "portfolio_value": 128750.0,
                "var_95": 11925.85,
                "var_99": 16440.70,
                "cvar_95": 13683.27,
                "volatility": 1.14,
                "sharpe_ratio": 0.696,
                "sortino_ratio": 0.825,
                "beta": 0.924,
                "max_drawdown": 0.087,
                "risk_score": 42.5,
                "diversification_ratio": 0.73,
                "tail_risk": 0.156,
                "recommendations": [
                    "Consider increasing allocation to USDC for stability",
                    "Portfolio shows good diversification across asset classes",
                    "Monitor volatility levels during market downturns"
                ]
            },
            "price_predictions": [
                {
                    "asset_code": "XLM",
                    "current_price": 0.25,
                    "trend": "bullish",
                    "confidence": 0.78,
                    "support_level": 0.22,
                    "resistance_level": 0.32,
                    "predictions": [
                        {"timestamp": "2024-12-08T00:00:00", "predicted_price": 0.26, "confidence_interval": 0.03},
                        {"timestamp": "2024-12-09T00:00:00", "predicted_price": 0.27, "confidence_interval": 0.04},
                        {"timestamp": "2024-12-10T00:00:00", "predicted_price": 0.28, "confidence_interval": 0.05}
                    ]
                },
                {
                    "asset_code": "USDC",
                    "current_price": 1.0,
                    "trend": "stable",
                    "confidence": 0.95,
                    "support_level": 0.999,
                    "resistance_level": 1.001,
                    "predictions": [
                        {"timestamp": "2024-12-08T00:00:00", "predicted_price": 1.0, "confidence_interval": 0.001},
                        {"timestamp": "2024-12-09T00:00:00", "predicted_price": 1.0, "confidence_interval": 0.001},
                        {"timestamp": "2024-12-10T00:00:00", "predicted_price": 1.0, "confidence_interval": 0.001}
                    ]
                }
            ],
            "ai_recommendations": [
                {
                    "type": "rebalancing",
                    "priority": "high",
                    "asset_code": "XLM",
                    "current_allocation": 9.73,
                    "recommended_allocation": 7.50,
                    "reason": "Reduce concentration risk in volatile assets",
                    "expected_impact": {
                        "risk_reduction": 0.15,
                        "return_impact": -0.02,
                        "sharpe_improvement": 0.08
                    }
                },
                {
                    "type": "risk_management",
                    "priority": "medium",
                    "asset_code": "USDC",
                    "current_allocation": 23.30,
                    "recommended_allocation": 25.80,
                    "reason": "Increase stability allocation for better risk management",
                    "expected_impact": {
                        "risk_reduction": 0.10,
                        "return_impact": -0.01,
                        "volatility_reduction": 0.12
                    }
                }
            ]
        }
    
    @staticmethod
    def get_consolidated_data() -> Dict[str, Any]:
        """
        Get all data needed by frontend in a single response
        This is what the portfolio endpoint will return in demo mode
        """
        return {
            "demo_mode": True,
            "portfolio": DemoFixtures.get_portfolio_data(),
            "risk_analysis": DemoFixtures.get_risk_analysis(), 
            "alerts": DemoFixtures.get_alerts(),
            "rebalance_suggestions": DemoFixtures.get_rebalance_suggestions(),
            "price_history": {
                "XLM": DemoFixtures.get_price_history("XLM", 30),
                "USDC": DemoFixtures.get_price_history("USDC", 30),
                "ETH": DemoFixtures.get_price_history("ETH", 30),
                "BTC": DemoFixtures.get_price_history("BTC", 30)
            },
            "timestamp": datetime.now().isoformat()
        }

# Singleton instance for easy access
demo_fixtures = DemoFixtures()
