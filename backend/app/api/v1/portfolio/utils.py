"""
Utility functions for portfolio domain.

This module contains utility functions used throughout the portfolio domain.
"""

from typing import List, Dict, Any
from stellar_sdk import Server
from app.core.config import settings


def get_mock_price(asset_code: str) -> float:
    """Get mock price for demo purposes when real prices are not available"""
    mock_prices = {
        'XLM': 0.12,
        'USDC': 1.0,
        'BTC': 45000.0,
        'ETH': 3000.0,
        'ADA': 0.45,
        'DOT': 6.5,
        'LINK': 14.2,
        'UNI': 8.7,
        'AAVE': 95.0,
        'COMP': 45.0
    }
    return mock_prices.get(asset_code.upper(), 1.0)  # Default to $1 if not found


async def discover_wallet_assets(wallet_address: str) -> List[Dict[str, Any]]:
    """Discover assets in a Stellar wallet using Horizon API"""
    try:
        # Use the same Horizon server as configured
        server = Server(settings.HORIZON_URL)
        
        # Get account data
        account = server.accounts().account_id(wallet_address).call()
        
        assets = []
        for balance in account.get('balances', []):
            if balance['asset_type'] == 'native':
                # XLM (native asset)
                assets.append({
                    'asset_code': 'XLM',
                    'asset_issuer': None,
                    'balance': float(balance['balance']),
                    'target_allocation': 0.0,  # Will be set by user later
                    'status': 'owned'  # Auto-discovered assets are owned
                })
            else:
                # Custom assets
                assets.append({
                    'asset_code': balance['asset_code'],
                    'asset_issuer': balance['asset_issuer'],
                    'balance': float(balance['balance']),
                    'target_allocation': 0.0,  # Will be set by user later
                    'status': 'owned'  # Auto-discovered assets are owned
                })
        
        return assets
        
    except Exception as e:
        # If discovery fails, return empty list (user can add assets manually)
        print(f"Warning: Could not discover assets for {wallet_address}: {str(e)}")
        return []


def calculate_simple_risk_score(assets: List[Dict[str, Any]]) -> float:
    """Calculate a simple risk score for the portfolio"""
    if not assets:
        return 0.0
    
    # Simple risk calculation based on volatility and concentration
    total_value = sum(asset["value_usd"] for asset in assets)
    
    if total_value == 0:
        return 0.0
    
    # Calculate concentration risk (higher if portfolio is concentrated)
    # Use target_allocation if current_allocation is 0
    allocations = [asset.get("current_allocation", 0.0) or asset.get("target_allocation", 0.0) for asset in assets]
    max_allocation = max(allocations) if allocations else 0.0
    concentration_risk = max_allocation / 100.0
    
    # Simple volatility estimate (mock for now)
    volatility_risk = 0.3  # This would be calculated from historical data
    
    # Combine risks
    risk_score = (concentration_risk * 0.6 + volatility_risk * 0.4) * 100
    
    return min(risk_score, 100.0)  # Cap at 100


def format_asset_data(asset, price_usd: float = 0.0) -> Dict[str, Any]:
    """Format asset data for API response"""
    return {
        "id": asset.id,
        "asset_code": asset.asset_code,
        "asset_issuer": asset.asset_issuer,
        "balance": asset.balance,
        "target_allocation": asset.target_allocation,
        "current_allocation": 0.0,  # Will be calculated
        "value_usd": asset.balance * price_usd,
        "price_usd": price_usd,
        "status": getattr(asset, 'status', 'owned'),
        "notes": getattr(asset, 'notes', None),
        "target_date": asset.target_date.isoformat() if hasattr(asset, 'target_date') and asset.target_date else None,
        "created_at": asset.created_at.isoformat() if hasattr(asset, 'created_at') and asset.created_at else None,
        "updated_at": asset.updated_at.isoformat() if hasattr(asset, 'updated_at') and asset.updated_at else None
    }
