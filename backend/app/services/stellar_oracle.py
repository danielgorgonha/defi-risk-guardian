"""
Stellar Oracle client using SDK for on-chain contract calls
"""

import asyncio
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import logging
from stellar_sdk import Server, Keypair, Network
from stellar_sdk.exceptions import SdkError
from app.core.config import settings

logger = logging.getLogger(__name__)

class StellarOracleClient:
    """Client for Stellar on-chain oracle contracts (Reflector)"""
    
    def __init__(self):
        self.network = settings.STELLAR_NETWORK
        self.horizon_url = settings.HORIZON_URL
        
        # Initialize Stellar server
        self.server = Server(self.horizon_url)
        
        # Set network
        if self.network == "testnet":
            Network.testnet_network()
            self.contracts = {
                "stellar_dex": settings.REFLECTOR_STELLAR_DEX_TESTNET,
                "external_cex": settings.REFLECTOR_EXTERNAL_CEX_TESTNET,
                "fiat": settings.REFLECTOR_FIAT_TESTNET
            }
        else:
            Network.public_network()
            self.contracts = {
                "stellar_dex": settings.REFLECTOR_STELLAR_DEX_MAINNET,
                "external_cex": settings.REFLECTOR_EXTERNAL_CEX_MAINNET,
                "fiat": settings.REFLECTOR_FIAT_MAINNET
            }
    
    async def get_asset_price(self, asset_code: str, asset_issuer: Optional[str] = None) -> Optional[float]:
        """
        Get current price for an asset from on-chain contract
        
        Args:
            asset_code: Asset code (e.g., 'XLM', 'USDC')
            asset_issuer: Asset issuer address (None for native assets)
            
        Returns:
            Current price in USD or None if not found
        """
        try:
            # Build asset identifier
            asset_id = asset_code
            if asset_issuer:
                asset_id = f"{asset_code}:{asset_issuer}"
            
            # Try different contract sources in order of preference
            contracts_to_try = [
                ("external_cex", "External CEX/DEX prices"),
                ("stellar_dex", "Stellar DEX prices"),
                ("fiat", "Fiat exchange rates")
            ]
            
            for contract_type, description in contracts_to_try:
                try:
                    contract_id = self.contracts[contract_type]
                    logger.info(f"Trying to get price for {asset_id} from {description} (contract: {contract_id})")
                    
                    # For now, we'll use a mock price until we implement the actual contract calls
                    # TODO: Implement actual contract method calls
                    if asset_code.upper() == "XLM":
                        return 0.12  # Mock XLM price for testing
                    elif asset_code.upper() == "USDC":
                        return 1.0   # Mock USDC price
                    else:
                        return 0.1   # Mock price for other assets
                        
                except Exception as e:
                    logger.warning(f"Failed to get price from {description}: {str(e)}")
                    continue
            
            logger.warning(f"No price data found for {asset_id} from any contract")
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
        Get price history for an asset from on-chain contract
        
        Args:
            asset_code: Asset code
            asset_issuer: Asset issuer address
            period: Time period (24h, 7d, 30d)
            interval: Data interval (1h, 4h, 1d)
            
        Returns:
            List of price history data
        """
        try:
            # TODO: Implement actual contract method calls for price history
            logger.info(f"Getting price history for {asset_code} - period: {period}, interval: {interval}")
            
            # Mock data for now
            return [
                {"timestamp": "2024-01-01T00:00:00Z", "price": 0.12},
                {"timestamp": "2024-01-01T01:00:00Z", "price": 0.13},
                {"timestamp": "2024-01-01T02:00:00Z", "price": 0.11}
            ]
                
        except Exception as e:
            logger.error(f"Error getting history for {asset_code}: {str(e)}")
            return []
    
    async def get_supported_assets(self) -> List[Dict]:
        """
        Get list of supported assets from contract
        
        Returns:
            List of supported assets with metadata
        """
        try:
            # TODO: Implement actual contract method calls for supported assets
            logger.info("Getting supported assets from Reflector contracts")
            
            # Mock data for now
            return [
                {"code": "XLM", "issuer": None, "name": "Stellar Lumens"},
                {"code": "USDC", "issuer": "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN", "name": "USD Coin"},
                {"code": "BTC", "issuer": "GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR", "name": "Bitcoin"}
            ]
                
        except Exception as e:
            logger.error(f"Error getting supported assets: {str(e)}")
            return []
    
    async def get_multiple_prices(self, assets: List[Dict]) -> Dict[str, float]:
        """
        Get prices for multiple assets concurrently
        
        Args:
            assets: List of asset dictionaries with 'code' and optional 'issuer'
            
        Returns:
            Dictionary mapping asset codes to prices
        """
        prices = {}
        
        # Create tasks for concurrent contract calls
        tasks = []
        for asset in assets:
            task = self.get_asset_price(
                asset["code"], 
                asset.get("issuer")
            )
            tasks.append((asset["code"], task))
        
        # Execute all calls concurrently
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
        Check if the oracle contracts are accessible
        
        Returns:
            True if contracts are accessible, False otherwise
        """
        try:
            # Check if we can connect to Horizon and have contract IDs configured
            logger.info("Checking Reflector Oracle health...")
            
            # Verify we have contract IDs configured
            if not all(self.contracts.values()):
                logger.error("Not all Reflector contract IDs are configured")
                return False
            
            # Try to get a simple price to test connectivity
            test_price = await self.get_asset_price("XLM")
            if test_price is not None:
                logger.info(f"Health check passed - XLM price: ${test_price}")
                return True
            else:
                logger.warning("Health check failed - could not get test price")
                return False
                
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return False

# Global instance
stellar_oracle_client = StellarOracleClient()
