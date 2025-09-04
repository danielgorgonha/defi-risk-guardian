"""
Reflector Oracle client for price feeds
"""

import httpx
import asyncio
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class ReflectorClient:
    """Client for Reflector Oracle API"""
    
    def __init__(self):
        self.base_url = settings.REFLECTOR_API_URL
        self.api_key = settings.REFLECTOR_API_KEY
        self.timeout = 30.0
        
    async def get_asset_price(self, asset_code: str, asset_issuer: Optional[str] = None) -> Optional[float]:
        """
        Get current price for an asset
        
        Args:
            asset_code: Asset code (e.g., 'XLM', 'USDC')
            asset_issuer: Asset issuer address (None for native assets)
            
        Returns:
            Current price in USD or None if not found
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # Build asset identifier
                asset_id = asset_code
                if asset_issuer:
                    asset_id = f"{asset_code}:{asset_issuer}"
                
                # Make API request
                response = await client.get(
                    f"{self.base_url}/price/{asset_id}",
                    headers={"Authorization": f"Bearer {self.api_key}"} if self.api_key else {}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return float(data.get("price_usd", 0))
                else:
                    logger.warning(f"Failed to get price for {asset_id}: {response.status_code}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error getting price for {asset_code}: {str(e)}")
            return None
    
    async def get_price_history(
        self, 
        asset_code: str, 
        asset_issuer: Optional[str] = None,
        period: str = "24h",
        interval: str = "1h"
    ) -> List[Dict]:
        """
        Get price history for an asset
        
        Args:
            asset_code: Asset code
            asset_issuer: Asset issuer address
            period: Time period (1h, 24h, 7d, 30d)
            interval: Data interval (1m, 5m, 1h, 1d)
            
        Returns:
            List of price data points
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # Build asset identifier
                asset_id = asset_code
                if asset_issuer:
                    asset_id = f"{asset_code}:{asset_issuer}"
                
                # Make API request
                response = await client.get(
                    f"{self.base_url}/history/{asset_id}",
                    params={
                        "period": period,
                        "interval": interval
                    },
                    headers={"Authorization": f"Bearer {self.api_key}"} if self.api_key else {}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get("history", [])
                else:
                    logger.warning(f"Failed to get history for {asset_id}: {response.status_code}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error getting history for {asset_code}: {str(e)}")
            return []
    
    async def get_supported_assets(self) -> List[Dict]:
        """
        Get list of supported assets
        
        Returns:
            List of supported assets with metadata
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/assets",
                    headers={"Authorization": f"Bearer {self.api_key}"} if self.api_key else {}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get("assets", [])
                else:
                    logger.warning(f"Failed to get supported assets: {response.status_code}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error getting supported assets: {str(e)}")
            return []
    
    async def get_multiple_prices(self, assets: List[Dict]) -> Dict[str, float]:
        """
        Get prices for multiple assets
        
        Args:
            assets: List of asset dictionaries with 'code' and optional 'issuer'
            
        Returns:
            Dictionary mapping asset codes to prices
        """
        prices = {}
        
        # Create tasks for concurrent requests
        tasks = []
        for asset in assets:
            task = self.get_asset_price(
                asset["code"], 
                asset.get("issuer")
            )
            tasks.append((asset["code"], task))
        
        # Execute all requests concurrently
        for asset_code, task in tasks:
            try:
                price = await task
                if price is not None:
                    prices[asset_code] = price
            except Exception as e:
                logger.error(f"Error getting price for {asset_code}: {str(e)}")
        
        return prices
    
    async def health_check(self) -> bool:
        """
        Check if Reflector API is healthy
        
        Returns:
            True if API is responding, False otherwise
        """
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/health")
                return response.status_code == 200
        except Exception as e:
            logger.error(f"Reflector health check failed: {str(e)}")
            return False

# Global instance
reflector_client = ReflectorClient()
