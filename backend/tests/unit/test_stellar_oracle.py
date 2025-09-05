"""
Unit tests for Stellar Oracle Client
"""
import pytest
from unittest.mock import Mock, patch, AsyncMock
from datetime import datetime, timedelta
from app.services.stellar_oracle import StellarOracleClient


@pytest.mark.unit
class TestStellarOracleClient:
    """Test Stellar Oracle Client functionality"""

    def setup_method(self):
        """Set up test fixtures"""
        self.client = StellarOracleClient()
        
        # Mock server and cache
        self.mock_server = Mock()
        self.client.server = self.mock_server

    @pytest.mark.asyncio
    async def test_get_asset_price_cache_hit(self):
        """Test price retrieval with cache hit"""
        with patch('app.services.stellar_oracle.cache_service') as mock_cache:
            mock_cache.get.return_value = 0.12
            
            price = await self.client.get_asset_price('XLM')
            
            assert price == 0.12
            mock_cache.get.assert_called_once_with('price:XLM')

    @pytest.mark.asyncio
    async def test_get_asset_price_contract_success(self):
        """Test price retrieval from contract"""
        with patch('app.services.stellar_oracle.cache_service') as mock_cache:
            mock_cache.get.return_value = None
            mock_cache.set.return_value = None
            
            with patch.object(self.client, '_call_contract_price', return_value=0.15):
                price = await self.client.get_asset_price('XLM')
                
                assert price == 0.15
                mock_cache.set.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_asset_price_dex_fallback(self):
        """Test price retrieval from DEX fallback"""
        with patch('app.services.stellar_oracle.cache_service') as mock_cache:
            mock_cache.get.return_value = None
            mock_cache.set.return_value = None
            
            with patch.object(self.client, '_call_contract_price', return_value=None):
                with patch.object(self.client, '_get_price_from_dex_trades', return_value=0.18):
                    price = await self.client.get_asset_price('XLM')
                    
                    assert price == 0.18

    @pytest.mark.asyncio
    async def test_get_asset_price_no_data(self):
        """Test price retrieval when no data is available"""
        with patch('app.services.stellar_oracle.cache_service') as mock_cache:
            mock_cache.get.return_value = None
            
            with patch.object(self.client, '_call_contract_price', return_value=None):
                with patch.object(self.client, '_get_price_from_dex_trades', return_value=None):
                    price = await self.client.get_asset_price('XLM')
                    
                    assert price is None

    @pytest.mark.asyncio
    async def test_get_price_from_dex_trades_success(self):
        """Test DEX price calculation from trades"""
        # Mock trade data
        mock_trade1 = Mock()
        mock_trade1.base_amount = "1000"
        mock_trade1.price = "0.12"
        
        mock_trade2 = Mock()
        mock_trade2.base_amount = "2000"
        mock_trade2.price = "0.13"
        
        mock_trades = Mock()
        mock_trades.records = [mock_trade1, mock_trade2]
        
        self.mock_server.trades.return_value.for_asset_pair.return_value.order.return_value.limit.return_value.call.return_value = mock_trades
        
        with patch.object(self.client, '_get_xlm_usd_price', return_value=1.0):
            price = await self.client._get_price_from_dex_trades('XLM')
            
            # Expected: (1000*0.12 + 2000*0.13) / (1000+2000) * 1.0 = 0.1267
            assert price == pytest.approx(0.1267, rel=1e-3)

    @pytest.mark.asyncio
    async def test_get_price_from_dex_trades_no_trades(self):
        """Test DEX price when no trades are found"""
        mock_trades = Mock()
        mock_trades.records = []
        
        self.mock_server.trades.return_value.for_asset_pair.return_value.order.return_value.limit.return_value.call.return_value = mock_trades
        
        price = await self.client._get_price_from_dex_trades('XLM')
        
        assert price is None

    @pytest.mark.asyncio
    async def test_get_price_from_dex_trades_dict_response(self):
        """Test DEX price with dictionary response format"""
        # Mock dictionary response
        mock_trades = {
            '_embedded': {
                'records': [
                    {'base_amount': '1000', 'price': '0.12'},
                    {'base_amount': '2000', 'price': '0.13'}
                ]
            }
        }
        
        self.mock_server.trades.return_value.for_asset_pair.return_value.order.return_value.limit.return_value.call.return_value = mock_trades
        
        with patch.object(self.client, '_get_xlm_usd_price', return_value=1.0):
            price = await self.client._get_price_from_dex_trades('XLM')
            
            # Should handle dict response gracefully
            assert price is not None

    @pytest.mark.asyncio
    async def test_get_xlm_usd_price_fallback(self):
        """Test XLM/USD price fallback"""
        price = await self.client._get_xlm_usd_price()
        
        assert price == 0.12  # Fallback price

    @pytest.mark.asyncio
    async def test_get_supported_assets_cache_hit(self):
        """Test supported assets with cache hit"""
        cached_assets = [
            {"code": "XLM", "issuer": None, "name": "Stellar Lumens"},
            {"code": "USDC", "issuer": "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN", "name": "USD Coin"}
        ]
        
        with patch('app.services.stellar_oracle.cache_service') as mock_cache:
            mock_cache.get.return_value = cached_assets
            
            assets = await self.client.get_supported_assets()
            
            assert assets == cached_assets
            mock_cache.get.assert_called_once_with('supported_assets')

    @pytest.mark.asyncio
    async def test_get_supported_assets_dex_fallback(self):
        """Test supported assets from DEX"""
        with patch('app.services.stellar_oracle.cache_service') as mock_cache:
            mock_cache.get.return_value = None
            
            with patch.object(self.client, '_get_assets_from_dex', return_value=[
                {"code": "XLM", "issuer": None, "name": "Stellar Lumens"}
            ]):
                assets = await self.client.get_supported_assets()
                
                assert len(assets) == 1
                assert assets[0]["code"] == "XLM"

    @pytest.mark.asyncio
    async def test_get_supported_assets_final_fallback(self):
        """Test supported assets final fallback"""
        with patch('app.services.stellar_oracle.cache_service') as mock_cache:
            mock_cache.get.return_value = None
            
            with patch.object(self.client, '_get_assets_from_dex', return_value=[]):
                assets = await self.client.get_supported_assets()
                
                assert len(assets) == 3
                assert assets[0]["code"] == "XLM"
                assert assets[1]["code"] == "USDC"
                assert assets[2]["code"] == "BTC"

    @pytest.mark.asyncio
    async def test_get_assets_from_dex_success(self):
        """Test asset discovery from DEX trades"""
        # Mock trade data
        mock_trade1 = Mock()
        mock_trade1.base_asset_type = "native"
        mock_trade1.counter_asset_type = "credit_alphanum4"
        mock_trade1.counter_asset_code = "USDC"
        mock_trade1.counter_asset_issuer = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
        
        mock_trade2 = Mock()
        mock_trade2.base_asset_type = "credit_alphanum4"
        mock_trade2.base_asset_code = "BTC"
        mock_trade2.base_asset_issuer = "GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR"
        mock_trade2.counter_asset_type = "native"
        
        mock_trades = Mock()
        mock_trades.records = [mock_trade1, mock_trade2]
        
        self.mock_server.trades.return_value.order.return_value.limit.return_value.call.return_value = mock_trades
        
        assets = await self.client._get_assets_from_dex()
        
        assert len(assets) >= 2
        asset_codes = [asset["code"] for asset in assets]
        assert "XLM" in asset_codes
        assert "USDC" in asset_codes
        assert "BTC" in asset_codes

    @pytest.mark.asyncio
    async def test_get_assets_from_dex_dict_response(self):
        """Test asset discovery with dictionary response"""
        mock_trades = {
            '_embedded': {
                'records': [
                    {
                        'base_asset_type': 'native',
                        'counter_asset_type': 'credit_alphanum4',
                        'counter_asset_code': 'USDC',
                        'counter_asset_issuer': 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN'
                    }
                ]
            }
        }
        
        self.mock_server.trades.return_value.order.return_value.limit.return_value.call.return_value = mock_trades
        
        assets = await self.client._get_assets_from_dex()
        
        assert len(assets) >= 1
        asset_codes = [asset["code"] for asset in assets]
        assert "XLM" in asset_codes
        assert "USDC" in asset_codes

    @pytest.mark.asyncio
    async def test_health_check_success(self):
        """Test health check when all components are healthy"""
        self.mock_server.ledgers.return_value.order.return_value.limit.return_value.call.return_value = Mock()
        
        with patch('app.services.stellar_oracle.cache_service') as mock_cache:
            mock_cache.is_connected.return_value = True
            
            with patch.object(self.client, 'get_asset_price', return_value=0.12):
                health = await self.client.health_check()
                
                assert isinstance(health, dict)
                assert health['status'] == 'healthy'
                assert health['horizon_connection'] is True
                assert health['cache_service'] is True
                assert health['end_to_end_test'] is True

    @pytest.mark.asyncio
    async def test_health_check_horizon_failure(self):
        """Test health check when Horizon connection fails"""
        self.mock_server.ledgers.return_value.order.return_value.limit.return_value.call.side_effect = Exception("Connection failed")
        
        health = await self.client.health_check()
        
        assert isinstance(health, dict)
        assert health['status'] == 'unhealthy'
        assert health['horizon_connection'] is False

    @pytest.mark.asyncio
    async def test_health_check_end_to_end_failure(self):
        """Test health check when end-to-end test fails"""
        self.mock_server.ledgers.return_value.order.return_value.limit.return_value.call.return_value = Mock()
        
        with patch('app.services.stellar_oracle.cache_service') as mock_cache:
            mock_cache.is_connected.return_value = True
            
            with patch.object(self.client, 'get_asset_price', return_value=None):
                health = await self.client.health_check()
                
                assert isinstance(health, dict)
                assert health['status'] == 'degraded'
                assert health['end_to_end_test'] is False

    @pytest.mark.asyncio
    async def test_call_contract_price_not_implemented(self):
        """Test contract price call (not yet implemented)"""
        price = await self.client._call_contract_price("test_contract", "XLM")
        
        assert price is None  # Should return None as contracts are not implemented yet

    @pytest.mark.asyncio
    async def test_get_price_history_cache_hit(self):
        """Test price history with cache hit"""
        cached_history = [
            {"timestamp": "2024-01-01T00:00:00Z", "price": 0.12},
            {"timestamp": "2024-01-01T01:00:00Z", "price": 0.13}
        ]
        
        with patch('app.services.stellar_oracle.cache_service') as mock_cache:
            mock_cache.get.return_value = cached_history
            
            history = await self.client.get_price_history('XLM')
            
            assert history == cached_history
            mock_cache.get.assert_called_once_with('history:XLM:24h:1h')

    @pytest.mark.asyncio
    async def test_get_price_history_dex_fallback(self):
        """Test price history from DEX trades"""
        with patch('app.services.stellar_oracle.cache_service') as mock_cache:
            mock_cache.get.return_value = None
            
            with patch.object(self.client, '_get_history_from_dex_trades', return_value=[
                {"timestamp": "2024-01-01T00:00:00Z", "price": 0.12}
            ]):
                history = await self.client.get_price_history('XLM')
                
                assert len(history) == 1
                assert history[0]["price"] == 0.12

    @pytest.mark.asyncio
    async def test_get_price_history_final_fallback(self):
        """Test price history final fallback"""
        with patch('app.services.stellar_oracle.cache_service') as mock_cache:
            mock_cache.get.return_value = None
            
            with patch.object(self.client, '_get_history_from_dex_trades', return_value=[]):
                history = await self.client.get_price_history('XLM')
                
                assert len(history) == 3
                assert history[0]["price"] == 0.12
                assert history[1]["price"] == 0.13
                assert history[2]["price"] == 0.11
