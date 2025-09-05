"""
Integration tests for Risk Analysis API endpoints
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, Mock
from app.main import app

client = TestClient(app)

@pytest.mark.integration
class TestRiskAnalysis:
    """Test cases for Risk Analysis endpoints"""
    
    def test_analyze_portfolio_risk_success(self, client, sample_user_data, sample_portfolio_data):
        """Test successful portfolio risk analysis"""
        # Create user first
        user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        user_data = user_response.json()
        user_id = user_data["user_id"]
        assert isinstance(user_id, str)
        
        # Add asset to portfolio
        asset_data = sample_portfolio_data
        client.post(f"/api/v1/portfolio/{sample_user_data['wallet_address']}/assets", json=asset_data)
        
        # Mock Reflector client for price data
        with patch('app.api.v1.risk.stellar_oracle_client') as mock_reflector:
            from unittest.mock import AsyncMock
            mock_reflector.get_asset_price = AsyncMock(return_value=0.12)
            
            # Perform risk analysis
            risk_request = {
                "wallet_address": sample_user_data["wallet_address"],
                "confidence_level": 0.95
            }
            
            response = client.post("/api/v1/risk/analyze", json=risk_request)
            
            assert response.status_code == 200
            data = response.json()
            
            # Check response structure
            assert "portfolio_value" in data
            assert "var_95" in data
            assert "var_99" in data
            assert "volatility" in data
            assert "sharpe_ratio" in data
            assert "beta" in data
            assert "max_drawdown" in data
            assert "risk_score" in data
            assert "recommendations" in data
            
            # Check data types and ranges
            assert isinstance(data["portfolio_value"], (int, float))
            assert isinstance(data["var_95"], (int, float))
            assert isinstance(data["var_99"], (int, float))
            assert isinstance(data["volatility"], (int, float))
            assert isinstance(data["sharpe_ratio"], (int, float))
            assert isinstance(data["beta"], (int, float))
            assert isinstance(data["max_drawdown"], (int, float))
            assert isinstance(data["risk_score"], (int, float))
            assert isinstance(data["recommendations"], list)
            
            # Check reasonable ranges
            assert data["portfolio_value"] > 0
            assert 0 <= data["volatility"] <= 1
            assert 0 <= data["max_drawdown"] <= 1
            assert 0 <= data["risk_score"] <= 100
    
    def test_analyze_portfolio_risk_user_not_found(self, client, sample_wallet_address):
        """Test risk analysis for non-existent user"""
        risk_request = {
            "wallet_address": sample_wallet_address,
            "confidence_level": 0.95
        }
        
        response = client.post("/api/v1/risk/analyze", json=risk_request)
        
        assert response.status_code == 404
        data = response.json()
        
        assert "error" in data
        assert "User not found" in data["error"]
    
    def test_analyze_portfolio_risk_no_portfolio(self, client, sample_user_data, mock_stellar_oracle_client):
        """Test risk analysis for user with no portfolio"""
        # Create user but don't add any assets manually
        # Note: The system will automatically discover assets from the Stellar wallet
        client.post("/api/v1/portfolio/users", json=sample_user_data)
        
        risk_request = {
            "wallet_address": sample_user_data["wallet_address"],
            "confidence_level": 0.95
        }
        
        response = client.post("/api/v1/risk/analyze", json=risk_request)
        
        # Since the system automatically discovers assets, we expect success
        assert response.status_code == 200
        data = response.json()
        
        # Check response structure
        assert "beta" in data
        assert "max_drawdown" in data
        assert "portfolio_value" in data
        assert "recommendations" in data
    
    def test_analyze_portfolio_risk_invalid_confidence_level(self, client, sample_user_data, sample_portfolio_data):
        """Test risk analysis with invalid confidence level"""
        # Create user and portfolio
        user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        asset_data = sample_portfolio_data
        client.post(f"/api/v1/portfolio/{sample_user_data['wallet_address']}/assets", json=asset_data)
        
        # Test with invalid confidence level
        risk_request = {
            "wallet_address": sample_user_data["wallet_address"],
            "confidence_level": 1.5  # Invalid: should be between 0 and 1
        }
        
        response = client.post("/api/v1/risk/analyze", json=risk_request)
        
        # Should return 422 for validation error (invalid confidence level)
        assert response.status_code == 422
    
    def test_get_risk_metrics_success(self, client, sample_user_data, sample_portfolio_data):
        """Test successful risk metrics retrieval"""
        # Create user and portfolio
        user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        asset_data = sample_portfolio_data
        client.post(f"/api/v1/portfolio/{sample_user_data['wallet_address']}/assets", json=asset_data)
        
        # Mock Reflector client
        with patch('app.api.v1.risk.stellar_oracle_client') as mock_reflector:
            from unittest.mock import AsyncMock
            mock_reflector.get_asset_price = AsyncMock(return_value=0.12)
            
            # First perform risk analysis to create metrics
            risk_request = {
                "wallet_address": sample_user_data["wallet_address"],
                "confidence_level": 0.95
            }
            client.post("/api/v1/risk/analyze", json=risk_request)
            
            # Now get the metrics
            response = client.get(f"/api/v1/risk/{sample_user_data['wallet_address']}/metrics")
            
            assert response.status_code == 200
            data = response.json()
            
            # Check response structure
            assert "portfolio_value" in data
            assert "var_95" in data
            assert "var_99" in data
            assert "volatility" in data
            assert "sharpe_ratio" in data
            assert "beta" in data
            assert "max_drawdown" in data
            assert "calculated_at" in data
            
            # Check data types
            assert isinstance(data["portfolio_value"], (int, float))
            assert isinstance(data["var_95"], (int, float))
            assert isinstance(data["var_99"], (int, float))
            assert isinstance(data["volatility"], (int, float))
            assert isinstance(data["sharpe_ratio"], (int, float))
            assert isinstance(data["beta"], (int, float))
            assert isinstance(data["max_drawdown"], (int, float))
            assert isinstance(data["calculated_at"], str)
    
    def test_get_risk_metrics_user_not_found(self, client, sample_wallet_address):
        """Test risk metrics retrieval for non-existent user"""
        response = client.get(f"/api/v1/risk/{sample_wallet_address}/metrics")
        
        assert response.status_code == 404
        data = response.json()
        
        assert "error" in data
        assert "User not found" in data["error"]
    
    def test_get_risk_metrics_no_metrics(self, client, sample_user_data):
        """Test risk metrics retrieval when no metrics exist"""
        # Create user but don't perform risk analysis
        client.post("/api/v1/portfolio/users", json=sample_user_data)
        
        response = client.get(f"/api/v1/risk/{sample_user_data['wallet_address']}/metrics")
        
        assert response.status_code == 404
        data = response.json()
        
        assert "error" in data
        assert "No risk metrics found" in data["error"]
    
    def test_analyze_portfolio_risk_reflector_error(self, client, sample_user_data, sample_portfolio_data):
        """Test risk analysis when Reflector API fails"""
        # Create user and portfolio
        user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        asset_data = sample_portfolio_data
        client.post(f"/api/v1/portfolio/{sample_user_data['wallet_address']}/assets", json=asset_data)
        
        # Mock Reflector client to raise exception
        with patch('app.api.v1.risk.stellar_oracle_client') as mock_reflector:
            from unittest.mock import AsyncMock
            mock_reflector.get_asset_price = AsyncMock(side_effect=Exception("Reflector API error"))
            
            risk_request = {
                "wallet_address": sample_user_data["wallet_address"],
                "confidence_level": 0.95
            }
            
            response = client.post("/api/v1/risk/analyze", json=risk_request)
            
            assert response.status_code == 500
            data = response.json()
            
            assert "error" in data
            assert "Error analyzing risk" in data["error"]
