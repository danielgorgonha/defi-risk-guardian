"""
Unit tests for portfolio validators
"""
import pytest
from unittest.mock import patch, Mock
from app.api.v1.portfolio.validators import validate_stellar_address, validate_asset_exists, validate_asset_exists_sync


class TestValidators:
    """Test portfolio validators"""
    
    def test_validate_stellar_address_valid(self):
        """Test valid Stellar address validation"""
        valid_address = "GDVKVA22NDD3M5TBUHX7LPOQLPDRH6GVB63WXLRGDVWJDIERA5EYT25O"
        assert validate_stellar_address(valid_address) is True
    
    def test_validate_stellar_address_invalid_format(self):
        """Test invalid Stellar address format"""
        invalid_addresses = [
            "invalid_address",
            "GDVKVA22NDD3M5TBUHX7LPOQLPDRH6GVB63WXLRGDVWJDIERA5EYT25",  # Too short
            "GDVKVA22NDD3M5TBUHX7LPOQLPDRH6GVB63WXLRGDVWJDIERA5EYT25O1",  # Too long
            "",
            None,
            123
        ]
        
        for address in invalid_addresses:
            assert validate_stellar_address(address) is False
    
    def test_validate_stellar_address_invalid_characters(self):
        """Test Stellar address with invalid characters"""
        invalid_address = "GDVKVA22NDD3M5TBUHX7LPOQLPDRH6GVB63WXLRGDVWJDIERA5EYT25O!"
        assert validate_stellar_address(invalid_address) is False
    
    @pytest.mark.asyncio
    async def test_validate_asset_exists_xlm(self):
        """Test XLM asset validation (always valid)"""
        assert await validate_asset_exists("XLM") is True
        assert await validate_asset_exists("XLM", None) is True
    
    @pytest.mark.asyncio
    async def test_validate_asset_exists_invalid_input(self):
        """Test asset validation with invalid input"""
        invalid_inputs = [
            ("", None),
            (None, None),
            ("USDC", None),  # Custom asset without issuer
            ("", "GDVKVA22NDD3M5TBUHX7LPOQLPDRH6GVB63WXLRGDVWJDIERA5EYT25O"),
            ("USDC", "invalid_issuer")
        ]
        
        for asset_code, asset_issuer in invalid_inputs:
            assert await validate_asset_exists(asset_code, asset_issuer) is False
    
    @pytest.mark.asyncio
    @patch('app.api.v1.portfolio.validators.Server')
    async def test_validate_asset_exists_network_success(self, mock_server):
        """Test asset validation with successful network response"""
        # Mock successful response
        mock_asset = {"asset_code": "USDC", "asset_issuer": "GDVKVA22NDD3M5TBUHX7LPOQLPDRH6GVB63WXLRGDVWJDIERA5EYT25O"}
        mock_server_instance = Mock()
        mock_server_instance.assets.return_value.for_code.return_value.for_issuer.return_value.call.return_value = mock_asset
        mock_server.return_value = mock_server_instance
        
        result = await validate_asset_exists("USDC", "GDVKVA22NDD3M5TBUHX7LPOQLPDRH6GVB63WXLRGDVWJDIERA5EYT25O")
        assert result is True
    
    @pytest.mark.asyncio
    @patch('app.api.v1.portfolio.validators.Server')
    async def test_validate_asset_exists_network_not_found(self, mock_server):
        """Test asset validation with asset not found"""
        from stellar_sdk.exceptions import NotFoundError
        from unittest.mock import Mock as MockResponse
        
        # Mock NotFoundError with proper Response object
        mock_response = MockResponse()
        mock_response.text = "Asset not found"
        mock_response.status_code = 404
        
        mock_server_instance = Mock()
        mock_server_instance.assets.return_value.for_code.return_value.for_issuer.return_value.call.side_effect = NotFoundError(mock_response)
        mock_server.return_value = mock_server_instance
        
        result = await validate_asset_exists("NONEXISTENT", "GDVKVA22NDD3M5TBUHX7LPOQLPDRH6GVB63WXLRGDVWJDIERA5EYT25O")
        assert result is False
    
    @pytest.mark.asyncio
    @patch('app.api.v1.portfolio.validators.Server')
    async def test_validate_asset_exists_network_error(self, mock_server):
        """Test asset validation with network error"""
        # Mock network error
        mock_server_instance = Mock()
        mock_server_instance.assets.return_value.for_code.return_value.for_issuer.return_value.call.side_effect = Exception("Network error")
        mock_server.return_value = mock_server_instance
        
        result = await validate_asset_exists("USDC", "GDVKVA22NDD3M5TBUHX7LPOQLPDRH6GVB63WXLRGDVWJDIERA5EYT25O")
        assert result is False
    
    def test_validate_asset_exists_sync_wrapper(self):
        """Test synchronous wrapper function"""
        # Test with XLM (should always return True)
        result = validate_asset_exists_sync("XLM")
        assert result is True
        
        # Test with invalid input
        result = validate_asset_exists_sync("", None)
        assert result is False
