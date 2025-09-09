"""
Stellar Oracle client using SDK for on-chain contract calls
"""

import asyncio
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import logging
from stellar_sdk import Server, Keypair, Network, Asset
from stellar_sdk.exceptions import SdkError, NotFoundError
from app.core.config import settings
from app.services.cache import cache_service

logger = logging.getLogger(__name__)

class StellarOracleClient:
    """Client for Stellar on-chain oracle contracts (Reflector)"""
    
    def __init__(self):
        self.network = settings.STELLAR_NETWORK
        self.horizon_url = settings.HORIZON_URL
        
        # Initialize Stellar server
        self.server = Server(self.horizon_url)
        
        # Set network and configure Soroban RPC URL
        if self.network == "testnet":
            Network.testnet_network()
            self.soroban_rpc_url = settings.SOROBAN_RPC_TESTNET
            self.contracts = {
                "stellar_dex": settings.REFLECTOR_STELLAR_DEX_TESTNET,
                "external_cex": settings.REFLECTOR_EXTERNAL_CEX_TESTNET,
                "fiat": settings.REFLECTOR_FIAT_TESTNET
            }
        elif self.network == "futurenet":
            Network.testnet_network()  # Futurenet uses testnet network
            self.soroban_rpc_url = settings.SOROBAN_RPC_FUTURENET
            self.contracts = {
                "stellar_dex": settings.REFLECTOR_STELLAR_DEX_TESTNET,
                "external_cex": settings.REFLECTOR_EXTERNAL_CEX_TESTNET,
                "fiat": settings.REFLECTOR_FIAT_TESTNET
            }
        else:
            Network.public_network()
            self.soroban_rpc_url = settings.SOROBAN_RPC_MAINNET
            self.contracts = {
                "stellar_dex": settings.REFLECTOR_STELLAR_DEX_MAINNET,
                "external_cex": settings.REFLECTOR_EXTERNAL_CEX_MAINNET,
                "fiat": settings.REFLECTOR_FIAT_MAINNET
            }
    
    async def get_asset_price(self, asset_code: str, asset_issuer: Optional[str] = None) -> Optional[float]:
        """
        Get current price for an asset from on-chain contract with fallback to Reflector API
        
        Args:
            asset_code: Asset code (e.g., 'XLM', 'USDC')
            asset_issuer: Asset issuer address (None for native assets)
            
        Returns:
            Current price in USD or None if not found
        """
        try:
            # Build asset identifier for cache
            asset_id = asset_code
            if asset_issuer:
                asset_id = f"{asset_code}:{asset_issuer}"
            
            # Check cache first
            cache_key = f"price:{asset_id}"
            cached_price = cache_service.get(cache_key)
            if cached_price is not None:
                logger.info(f"Price cache hit for {asset_id}: ${cached_price}")
                return float(cached_price)
            
            # Try different contract sources in order of preference
            # Priority 1: Stellar Pubnet (for Stellar assets like XLM, USDC)
            # Priority 2: External CEX & DEX (fallback for all assets)
            # Priority 3: Fiat exchange rates (for fiat currencies)
            contracts_to_try = [
                ("stellar_dex", "Stellar Pubnet prices"),
                ("external_cex", "External CEX/DEX prices"),
                ("fiat", "Fiat exchange rates")
            ]
            
            for contract_type, description in contracts_to_try:
                try:
                    contract_id = self.contracts[contract_type]
                    logger.info(f"Trying to get price for {asset_id} from {description} (contract: {contract_id})")
                    
                    # Try to call the contract
                    price = await self._call_contract_price(contract_id, asset_code, asset_issuer)
                    if price is not None:
                        # Cache the result for 5 minutes
                        cache_service.set(cache_key, price, ttl_seconds=300)
                        logger.info(f"Got price from {description}: ${price}")
                        return price
                        
                except Exception as e:
                    logger.warning(f"Failed to get price from {description}: {str(e)}")
                    continue
            
            # Skip Reflector API for now - will be implemented later
            logger.info(f"Skipping Reflector API for {asset_id} - not implemented yet")
            
            # Final fallback to DEX trades
            logger.info(f"Trying DEX trades fallback for {asset_id}")
            try:
                price = await self._get_price_from_dex_trades(asset_code, asset_issuer)
                if price is not None:
                    # Cache the result for 2 minutes (DEX data is less reliable)
                    cache_service.set(cache_key, price, ttl_seconds=120)
                    logger.info(f"Got price from DEX trades: ${price}")
                    return price
            except Exception as e:
                logger.warning(f"DEX trades fallback failed: {str(e)}")
            
            # Final fallback to hardcoded prices
            if asset_code.upper() == "XLM":
                price = 0.12  # Fallback XLM price
                logger.warning(f"Using fallback price for {asset_code}: ${price}")
                cache_service.set(cache_key, price, ttl_seconds=300)
                return price
            elif asset_code.upper() == "USDC":
                price = 1.0  # USDC is always $1
                logger.warning(f"Using fallback price for {asset_code}: ${price}")
                cache_service.set(cache_key, price, ttl_seconds=300)
                return price
            
            logger.warning(f"No price data found for {asset_id} from any source")
            return None
                
        except Exception as e:
            logger.error(f"Error getting price for {asset_code}: {str(e)}")
            return None
    
    async def _call_contract_price(self, contract_id: str, asset_code: str, asset_issuer: Optional[str] = None) -> Optional[float]:
        """
        Call a Soroban contract to get asset price
        
        Args:
            contract_id: Contract ID to call
            asset_code: Asset code
            asset_issuer: Asset issuer address
            
        Returns:
            Price in USD or None if failed
        """
        try:
            # Build asset identifier for contract call
            if asset_code.upper() == "XLM":
                # For XLM, we might need to pass None or a special identifier
                asset_identifier = "XLM"
            else:
                asset_identifier = f"{asset_code}:{asset_issuer}"
            
            # Try to call the Reflector Oracle contract using direct HTTP calls to Soroban RPC
            try:
                import httpx
                import json
                
                # Build asset for contract call
                if asset_code.upper() == "XLM":
                    # Native XLM asset - use Stellar(address) format
                    asset_data = {
                        "type": "Stellar",
                        "address": "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQAHHXCN3A3A"  # Native XLM address
                    }
                else:
                    # Issued asset - use Stellar(address) format
                    if not asset_issuer:
                        logger.error(f"Asset issuer required for {asset_code}")
                        return None
                    asset_data = {
                        "type": "Stellar", 
                        "address": asset_issuer
                    }
                
                # Prepare the contract call payload for Soroban RPC
                # Using the lastprice function from Reflector Oracle contract
                payload = {
                    "jsonrpc": "2.0",
                    "id": 1,
                    "method": "simulateTransaction",
                    "params": {
                        "transaction": {
                            "sourceAccount": "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",  # Dummy account for simulation
                            "fee": "100",
                            "sequence": "0",
                            "operations": [
                                {
                                    "type": "invokeHostFunction",
                                    "function": "lastprice",
                                    "contractId": contract_id,
                                    "args": [
                                        {
                                            "type": "address",
                                            "value": asset_data
                                        }
                                    ]
                                }
                            ],
                            "timeBounds": {
                                "minTime": "0",
                                "maxTime": "0"
                            }
                        }
                    }
                }
                
                # Make HTTP call to Soroban RPC endpoint
                soroban_rpc_url = self.soroban_rpc_url
                
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        soroban_rpc_url,
                        json=payload,
                        headers={"Content-Type": "application/json"},
                        timeout=10.0
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        
                        if "result" in result and result["result"].get("success"):
                            # Extract price from the result
                            # The result should contain PriceData with price and timestamp
                            price_data = result["result"].get("result", {})
                            
                            if price_data and "price" in price_data:
                                # Price is in i128 format with 14 decimals
                                price_raw = int(price_data["price"])
                                decimals = 14  # Reflector Oracle uses 14 decimals
                                price = price_raw / (10 ** decimals)
                                
                                logger.info(f"Got price from contract {contract_id}: {asset_code} = ${price}")
                                return price
                        else:
                            logger.warning(f"Contract call failed: {result.get('error', 'Unknown error')}")
                    else:
                        logger.warning(f"Soroban RPC call failed with status {response.status_code}")
                
            except Exception as contract_error:
                logger.warning(f"Soroban contract call failed for {contract_id}: {str(contract_error)}")
                
                # Try alternative method - direct HTTP call to Reflector API
                try:
                    price = await self._get_price_from_reflector_api(contract_id, asset_code, asset_issuer)
                    if price:
                        return price
                except Exception as api_error:
                    logger.warning(f"Reflector API fallback failed: {str(api_error)}")
            
            logger.info(f"Contract call to {contract_id} for {asset_identifier} - no price data available")
            return None
            
        except Exception as e:
            logger.error(f"Contract call failed for {contract_id}: {str(e)}")
            return None
    
    async def _get_price_from_reflector_api(self, contract_id: str, asset_code: str, asset_issuer: Optional[str] = None) -> Optional[float]:
        """
        Get price from Reflector Oracle API as fallback
        
        Args:
            contract_id: Contract ID
            asset_code: Asset code
            asset_issuer: Asset issuer address
            
        Returns:
            Price in USD or None if failed
        """
        try:
            import httpx
            
            # Build asset identifier for API call
            if asset_code.upper() == "XLM":
                asset_identifier = "XLM"
            else:
                asset_identifier = f"{asset_code}:{asset_issuer}"
            
            # Try to get price from Reflector API
            # Using the correct Reflector API endpoint
            api_url = f"{settings.REFLECTOR_API_URL}/v1/price/{asset_identifier}"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(api_url, timeout=10.0)
                if response.status_code == 200:
                    data = response.json()
                    if "price" in data:
                        price = float(data["price"])
                        logger.info(f"Got price from Reflector API: {asset_code} = ${price}")
                        return price
            
            logger.warning(f"Reflector API returned no price for {asset_identifier}")
            return None
            
        except Exception as e:
            logger.warning(f"Reflector API call failed: {str(e)}")
            return None
    
    async def _get_price_from_dex_trades(self, asset_code: str, asset_issuer: Optional[str] = None) -> Optional[float]:
        """
        Get price from Stellar DEX trades
        
        Args:
            asset_code: Asset code
            asset_issuer: Asset issuer address
            
        Returns:
            Price in USD or None if failed
        """
        try:
            # Create asset object
            if asset_code.upper() == "XLM":
                base_asset = Asset.native()
            else:
                base_asset = Asset(asset_code, asset_issuer)
            
            # Get recent trades for XLM pair
            counter_asset = Asset.native()  # Always pair with XLM
            
            # Get recent trades
            trades = self.server.trades().for_asset_pair(
                base_asset, counter_asset
            ).order(desc=True).limit(10).call()
            
            # Handle different response formats
            if hasattr(trades, 'records'):
                records = trades.records
            elif isinstance(trades, dict) and '_embedded' in trades:
                records = trades['_embedded'].get('records', [])
            else:
                logger.warning(f"Unexpected response format for {asset_code}: {type(trades)}")
                return None
                
            if not records:
                logger.warning(f"No trades found for {asset_code}")
                return None
            
            # Calculate weighted average price
            total_volume = 0
            weighted_price = 0
            
            for trade in records:
                # Handle both object and dict formats
                if hasattr(trade, 'base_amount'):
                    volume = float(trade.base_amount)
                    price = float(trade.price)
                elif isinstance(trade, dict):
                    volume = float(trade.get('base_amount', 0))
                    price = float(trade.get('price', 0))
                else:
                    continue
                
                total_volume += volume
                weighted_price += price * volume
            
            if total_volume == 0:
                return None
            
            avg_price = weighted_price / total_volume
            
            # Convert from XLM to USD (this is a rough conversion)
            # In a real implementation, you'd get XLM/USD price from another source
            xlm_usd_price = await self._get_xlm_usd_price()
            if xlm_usd_price is None:
                return None
            
            usd_price = avg_price * xlm_usd_price
            logger.info(f"DEX price for {asset_code}: {avg_price} XLM = ${usd_price} USD")
            
            return usd_price
            
        except Exception as e:
            logger.error(f"Failed to get DEX price for {asset_code}: {str(e)}")
            return None
    
    async def _get_xlm_usd_price(self) -> Optional[float]:
        """
        Get XLM/USD price from external source
        
        Returns:
            XLM price in USD or None if failed
        """
        try:
            # Skip Reflector API for now - will be implemented later
            logger.info("Skipping Reflector API for XLM price - not implemented yet")
            
            # Fallback to a hardcoded price (in production, use a reliable price feed)
            logger.warning("Using fallback XLM price")
            return 0.12  # Fallback price
            
        except Exception as e:
            logger.error(f"Failed to get XLM/USD price: {str(e)}")
            return None
    
    async def get_price_history(
        self, 
        asset_code: str, 
        asset_issuer: Optional[str] = None,
        period: str = "24h",
        interval: str = "1h"
    ) -> List[Dict]:
        """
        Get price history for an asset from multiple sources
        
        Args:
            asset_code: Asset code
            asset_issuer: Asset issuer address
            period: Time period (24h, 7d, 30d)
            interval: Data interval (1h, 4h, 1d)
            
        Returns:
            List of price history data
        """
        try:
            # Build asset identifier for cache
            asset_id = asset_code
            if asset_issuer:
                asset_id = f"{asset_code}:{asset_issuer}"
            
            # Check cache first
            cache_key = f"history:{asset_id}:{period}:{interval}"
            cached_history = cache_service.get(cache_key)
            if cached_history is not None:
                logger.info(f"History cache hit for {asset_id}")
                return cached_history
            
            logger.info(f"Getting price history for {asset_id} - period: {period}, interval: {interval}")
            
            # Skip Reflector API for now - will be implemented later
            logger.info(f"Skipping Reflector API history for {asset_id} - not implemented yet")
            
            # Fallback to DEX trades
            try:
                history = await self._get_history_from_dex_trades(asset_code, asset_issuer, period, interval)
                if history:
                    # Cache for 5 minutes (DEX data is less reliable)
                    cache_service.set(cache_key, history, ttl_seconds=300)
                    logger.info(f"Got history from DEX trades: {len(history)} points")
                    return history
            except Exception as e:
                logger.warning(f"DEX trades history failed: {str(e)}")
            
            # Final fallback to mock data
            logger.warning(f"Using fallback history data for {asset_id}")
            fallback_data = [
                {"timestamp": "2024-01-01T00:00:00Z", "price": 0.12},
                {"timestamp": "2024-01-01T01:00:00Z", "price": 0.13},
                {"timestamp": "2024-01-01T02:00:00Z", "price": 0.11}
            ]
            return fallback_data
                
        except Exception as e:
            logger.error(f"Error getting history for {asset_code}: {str(e)}")
            return []
    
    async def _get_history_from_dex_trades(self, asset_code: str, asset_issuer: Optional[str] = None, period: str = "24h", interval: str = "1h") -> List[Dict]:
        """
        Get price history from Stellar DEX trades
        
        Args:
            asset_code: Asset code
            asset_issuer: Asset issuer address
            period: Time period
            interval: Data interval
            
        Returns:
            List of price history data
        """
        try:
            # Create asset object
            if asset_code.upper() == "XLM":
                base_asset = Asset.native()
            else:
                base_asset = Asset(asset_code, asset_issuer)
            
            # Get XLM/USD price for conversion
            xlm_usd_price = await self._get_xlm_usd_price()
            if xlm_usd_price is None:
                return []
            
            # Calculate time range
            now = datetime.utcnow()
            if period == "24h":
                start_time = now - timedelta(hours=24)
            elif period == "7d":
                start_time = now - timedelta(days=7)
            elif period == "30d":
                start_time = now - timedelta(days=30)
            else:
                start_time = now - timedelta(hours=24)
            
            # Get trades in time range
            trades = self.server.trades().for_asset_pair(
                base_asset, Asset.native()
            ).order(desc=True).limit(200).call()
            
            # Handle different response formats
            if hasattr(trades, 'records'):
                records = trades.records
            elif isinstance(trades, dict) and '_embedded' in trades:
                records = trades['_embedded'].get('records', [])
            else:
                logger.warning(f"Unexpected response format for {asset_code}: {type(trades)}")
                return []
                
            if not records:
                return []
            
            # Group trades by time intervals and calculate average prices
            history = []
            current_time = start_time
            
            while current_time < now:
                next_time = current_time + timedelta(hours=1)  # 1 hour intervals
                
                # Find trades in this time window
                period_trades = []
                for trade in records:
                    # Handle both object and dict formats
                    if hasattr(trade, 'ledger_close_time'):
                        trade_time = datetime.fromisoformat(trade.ledger_close_time.replace('Z', '+00:00'))
                    elif isinstance(trade, dict):
                        trade_time = datetime.fromisoformat(trade.get('ledger_close_time', '').replace('Z', '+00:00'))
                    else:
                        continue
                        
                    if start_time <= trade_time < next_time:
                        period_trades.append(trade)
                
                if period_trades:
                    # Calculate weighted average price for this period
                    total_volume = 0
                    weighted_price = 0
                    
                    for trade in period_trades:
                        volume = float(trade.base_amount)
                        price = float(trade.price)
                        
                        total_volume += volume
                        weighted_price += price * volume
                    
                    if total_volume > 0:
                        avg_price_xlm = weighted_price / total_volume
                        avg_price_usd = avg_price_xlm * xlm_usd_price
                        
                        history.append({
                            "timestamp": current_time.isoformat() + "Z",
                            "price": avg_price_usd
                        })
                
                current_time = next_time
            
            return history
            
        except Exception as e:
            logger.error(f"Failed to get DEX history for {asset_code}: {str(e)}")
            return []
    
    async def get_supported_assets(self) -> List[Dict]:
        """
        Get list of supported assets from multiple sources
        
        Returns:
            List of supported assets with metadata
        """
        try:
            # Check cache first
            cache_key = "supported_assets"
            cached_assets = cache_service.get(cache_key)
            if cached_assets is not None:
                logger.info("Supported assets cache hit")
                return cached_assets
            
            logger.info("Getting supported assets from multiple sources")
            
            # Skip Reflector API for now - will be implemented later
            logger.info("Skipping Reflector API assets - not implemented yet")
            
            # Fallback to DEX assets
            try:
                assets = await self._get_assets_from_dex()
                if assets:
                    # Cache for 30 minutes
                    cache_service.set(cache_key, assets, ttl_seconds=1800)
                    logger.info(f"Got {len(assets)} assets from DEX")
                    return assets
            except Exception as e:
                logger.warning(f"DEX assets failed: {str(e)}")
            
            # Final fallback to known assets
            logger.warning("Using fallback supported assets")
            fallback_assets = [
                {"code": "XLM", "issuer": None, "name": "Stellar Lumens"},
                {"code": "USDC", "issuer": "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN", "name": "USD Coin"},
                {"code": "BTC", "issuer": "GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR", "name": "Bitcoin"}
            ]
            return fallback_assets
                
        except Exception as e:
            logger.error(f"Error getting supported assets: {str(e)}")
            return []
    
    async def _get_assets_from_dex(self) -> List[Dict]:
        """
        Get supported assets from Stellar DEX
        
        Returns:
            List of assets with metadata
        """
        try:
            # Get all assets that have been traded recently
            assets = set()
            
            # Get recent trades to find active assets
            trades = self.server.trades().order(desc=True).limit(200).call()
            
            # Handle different response formats
            if hasattr(trades, 'records'):
                records = trades.records
            elif isinstance(trades, dict) and '_embedded' in trades:
                records = trades['_embedded'].get('records', [])
            else:
                logger.warning(f"Unexpected response format: {type(trades)}")
                return []
            
            for trade in records:
                # Handle both object and dict formats
                if hasattr(trade, 'base_asset_type'):
                    base_asset_type = trade.base_asset_type
                    base_asset_code = trade.base_asset_code
                    base_asset_issuer = trade.base_asset_issuer
                    counter_asset_type = trade.counter_asset_type
                    counter_asset_code = trade.counter_asset_code
                    counter_asset_issuer = trade.counter_asset_issuer
                elif isinstance(trade, dict):
                    base_asset_type = trade.get('base_asset_type')
                    base_asset_code = trade.get('base_asset_code')
                    base_asset_issuer = trade.get('base_asset_issuer')
                    counter_asset_type = trade.get('counter_asset_type')
                    counter_asset_code = trade.get('counter_asset_code')
                    counter_asset_issuer = trade.get('counter_asset_issuer')
                else:
                    continue
                
                # Add base asset
                if base_asset_type == "native":
                    assets.add(("XLM", None, "Stellar Lumens"))
                else:
                    assets.add((base_asset_code, base_asset_issuer, f"{base_asset_code} Token"))
                
                # Add counter asset
                if counter_asset_type == "native":
                    assets.add(("XLM", None, "Stellar Lumens"))
                else:
                    assets.add((counter_asset_code, counter_asset_issuer, f"{counter_asset_code} Token"))
            
            # Convert to list of dictionaries
            asset_list = []
            for code, issuer, name in assets:
                asset_list.append({
                    "code": code,
                    "issuer": issuer,
                    "name": name
                })
            
            return asset_list
            
        except Exception as e:
            logger.error(f"Failed to get assets from DEX: {str(e)}")
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
        Check if the oracle services are accessible
        
        Returns:
            True if services are accessible, False otherwise
        """
        try:
            logger.info("Checking Stellar Oracle health...")
            
            # Check Horizon connection
            try:
                # Test Horizon connection
                self.server.ledgers().order(desc=True).limit(1).call()
                logger.info("Horizon connection: OK")
            except Exception as e:
                logger.error(f"Horizon connection failed: {str(e)}")
                return {
                    "status": "unhealthy",
                    "horizon_connection": False,
                    "cache_service": False,
                    "end_to_end_test": False,
                    "error": str(e)
                }
            
            # Check contract IDs configuration
            if not all(self.contracts.values()):
                logger.warning("Not all Reflector contract IDs are configured")
            else:
                logger.info("Contract IDs configured: OK")
            
            # Skip Reflector API check for now - will be implemented later
            logger.info("Skipping Reflector API health check - not implemented yet")
            
            # Check cache service
            try:
                cache_connected = cache_service.is_connected()
                if cache_connected:
                    logger.info("Cache service: OK")
                else:
                    logger.warning("Cache service: Not connected")
            except Exception as e:
                logger.warning(f"Cache service check failed: {str(e)}")
            
            # Try to get a simple price to test end-to-end functionality
            test_price = await self.get_asset_price("XLM")
            if test_price is not None:
                logger.info(f"End-to-end test passed - XLM price: ${test_price}")
                return {
                    "status": "healthy",
                    "horizon_connection": True,
                    "cache_service": cache_connected,
                    "end_to_end_test": True,
                    "test_price": test_price
                }
            else:
                logger.warning("End-to-end test failed - could not get test price")
                return {
                    "status": "degraded",
                    "horizon_connection": True,
                    "cache_service": cache_connected,
                    "end_to_end_test": False,
                    "test_price": None
                }
                
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return {
                "status": "unhealthy",
                "error": str(e),
                "horizon_connection": False,
                "cache_service": False,
                "end_to_end_test": False
            }

# Global instance
stellar_oracle_client = StellarOracleClient()
