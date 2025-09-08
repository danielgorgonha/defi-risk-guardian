"""
Demo mode utilities for endpoints
"""

from fastapi import Request
from typing import Optional, Dict, Any
import logging
from app.fixtures import demo_fixtures, DEMO_WALLET_ADDRESS

logger = logging.getLogger(__name__)

def is_demo_mode(request: Request) -> bool:
    """
    Check if the current request is in demo mode
    """
    return getattr(request.state, "is_demo_mode", False)

def get_demo_wallet(request: Request) -> Optional[str]:
    """
    Get demo wallet address if in demo mode
    """
    return getattr(request.state, "demo_wallet", None)

def should_use_mock_data(request: Request, wallet_address: Optional[str] = None) -> bool:
    """
    Determine if endpoints should use mock/database data instead of external APIs
    """
    # Check middleware detection
    if is_demo_mode(request):
        return True
    
    # Check wallet address directly
    if wallet_address == DEMO_WALLET_ADDRESS:
        return True
    
    return False

def log_demo_action(request: Request, action: str, details: Dict[str, Any] = None):
    """
    Log demo mode actions for debugging
    """
    if is_demo_mode(request):
        details_str = f" - {details}" if details else ""
        logger.info(f"DEMO MODE: {action} for {get_demo_wallet(request)}{details_str}")

class DemoDataProvider:
    """
    Provides demo data from fixtures instead of calling external APIs
    """
    
    @staticmethod
    def should_skip_external_api(request: Request, wallet_address: Optional[str] = None) -> bool:
        """
        Check if external API calls should be skipped in favor of fixture data
        """
        return should_use_mock_data(request, wallet_address)
    
    @staticmethod
    def get_consolidated_data() -> Dict[str, Any]:
        """
        Get all consolidated demo data for frontend
        """
        return demo_fixtures.get_consolidated_data()
    
    @staticmethod
    def get_portfolio_data() -> Dict[str, Any]:
        """
        Get demo portfolio data from fixtures
        """
        return demo_fixtures.get_portfolio_data()
    
    @staticmethod
    def get_risk_analysis() -> Dict[str, Any]:
        """
        Get demo risk analysis data from fixtures
        """
        return demo_fixtures.get_risk_analysis()
    
    @staticmethod
    def get_alerts_data() -> Dict[str, Any]:
        """
        Get demo alerts data from fixtures
        """
        return demo_fixtures.get_alerts()
    
    @staticmethod
    def get_rebalance_suggestions() -> Dict[str, Any]:
        """
        Get demo rebalancing suggestions from fixtures
        """
        return demo_fixtures.get_rebalance_suggestions()
    
    @staticmethod
    def get_price_history(asset_code: str = "XLM", days: int = 30) -> list:
        """
        Get mock price history from fixtures
        """
        return demo_fixtures.get_price_history(asset_code, days)
    
    @staticmethod
    def get_mock_price_data() -> Dict[str, float]:
        """
        Return mock price data for demo mode
        """
        return {
            "XLM": 0.25,
            "USDC": 1.0,
            "BTC": 70312.50,
            "ETH": 2258.06
        }
    
    @staticmethod
    def get_mock_stellar_data() -> Dict[str, Any]:
        """
        Return mock Stellar network data
        """
        return {
            "account_exists": True,
            "sequence_number": "12345678901234567890",
            "balances": [
                {"asset_type": "native", "balance": "50000.0000000"},
                {
                    "asset_type": "credit_alphanum4",
                    "asset_code": "USDC", 
                    "asset_issuer": "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
                    "balance": "25000.0000000"
                },
                {
                    "asset_type": "credit_alphanum4",
                    "asset_code": "ETH", 
                    "asset_issuer": "GDVKVA22NDD3M5TBUHX7LPOQLPDRH6GVB63WXLRGDVWJDIERA5EYT25O",
                    "balance": "15.5000000"
                },
                {
                    "asset_type": "credit_alphanum4",
                    "asset_code": "BTC", 
                    "asset_issuer": "GBVOL67TMUQBGL4TZYNMY3ZQ5WGQYFPFD5VJRWXR72VA33VFNL225PL5",
                    "balance": "0.8000000"
                }
            ]
        }
    
    @staticmethod
    def get_ai_analysis_data() -> Dict[str, Any]:
        """
        Return AI analysis data from fixtures
        """
        return demo_fixtures.get_ai_analysis_data()

# Global instance
demo_data_provider = DemoDataProvider()
