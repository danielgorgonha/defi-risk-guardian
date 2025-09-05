"""
Integration tests for risk analysis endpoints
"""
import pytest
from unittest.mock import patch, Mock, AsyncMock
from fastapi.testclient import TestClient

from app.main import app
from tests.fixtures.mock_data import MOCK_PORTFOLIO_ASSETS, MOCK_RISK_METRICS

@pytest.mark.integration
class TestRiskAnalysis:
    """Test risk analysis functionality"""
    
    def test_analyze_portfolio_risk_success(self, client, sample_user_data, mock_reflector_client):
        """Test successful portfolio risk analysis"""
        # Create user and portfolio
        user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        user_id = user_response.json()["user_id"]
        
        # Add multiple assets to portfolio
        for asset in MOCK_PORTFOLIO_ASSETS:
            asset_data = {
                "asset_code": asset["asset_code"],
                "asset_issuer": asset["asset_issuer"],
                "balance": asset["balance"],
                "user_id": user_id
            }
            client.post(f"/api/v1/portfolio/{sample_user_data['wallet_address']}/assets", json=asset_data)
        
        # Perform risk analysis
        risk_request = {
            "wallet_address": sample_user_data["wallet_address"],
            "analysis_type": "comprehensive"
        }
        
        response = client.post("/api/v1/risk/analyze", json=risk_request)
        
        assert response.status_code == 200
        data = response.json()
        
        # Check response structure
        assert "wallet_address" in data
        assert "analysis_timestamp" in data
        assert "portfolio_value" in data
        assert "risk_metrics" in data
        assert "recommendations" in data
        
        # Check risk metrics
        risk_metrics = data["risk_metrics"]
        assert "volatility" in risk_metrics
        assert "sharpe_ratio" in risk_metrics
        assert "max_drawdown" in risk_metrics
        assert "risk_score" in risk_metrics
        
        # Check recommendations
        assert isinstance(data["recommendations"], list)
        assert len(data["recommendations"]) > 0
    
    def test_analyze_portfolio_risk_user_not_found(self, client, sample_wallet_address):
        """Test risk analysis for non-existent user"""
        risk_request = {
            "wallet_address": sample_wallet_address,
            "analysis_type": "comprehensive"
        }
        
        response = client.post("/api/v1/risk/analyze", json=risk_request)
        
        assert response.status_code == 404
        data = response.json()
        
        assert "detail" in data
        assert "User not found" in data["detail"]
    
    def test_analyze_portfolio_risk_no_portfolio(self, client, sample_user_data):
        """Test risk analysis for user with no portfolio"""
        # Create user but no portfolio
        client.post("/api/v1/portfolio/users", json=sample_user_data)
        
        risk_request = {
            "wallet_address": sample_user_data["wallet_address"],
            "analysis_type": "comprehensive"
        }
        
        response = client.post("/api/v1/risk/analyze", json=risk_request)
        
        assert response.status_code == 404
        data = response.json()
        
        assert "detail" in data
        assert "No portfolio found" in data["detail"]
    
    def test_analyze_portfolio_risk_reflector_error(self, client, sample_user_data):
        """Test risk analysis when Reflector API fails"""
        # Mock Reflector client to raise exception
        with patch('app.services.reflector.ReflectorClient') as mock_reflector:
            mock_instance = Mock()
            mock_instance.get_asset_price.side_effect = Exception("Reflector API error")
            mock_reflector.return_value = mock_instance
            
            # Create user and portfolio
            user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
            user_id = user_response.json()["user_id"]
            
            asset_data = {
                "asset_code": "XLM",
                "asset_issuer": "native",
                "balance": 1000.0,
                "user_id": user_id
            }
            client.post(f"/api/v1/portfolio/{sample_user_data['wallet_address']}/assets", json=asset_data)
            
            # Try risk analysis
            risk_request = {
                "wallet_address": sample_user_data["wallet_address"],
                "analysis_type": "comprehensive"
            }
            
            response = client.post("/api/v1/risk/analyze", json=risk_request)
            
            assert response.status_code == 503
            data = response.json()
            
            assert "detail" in data
            assert "Error fetching price data" in data["detail"]
    
    def test_get_risk_metrics_success(self, client, sample_user_data, mock_reflector_client):
        """Test successful risk metrics retrieval"""
        # Create user and portfolio
        user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        user_id = user_response.json()["user_id"]
        
        # Add assets to portfolio
        for asset in MOCK_PORTFOLIO_ASSETS:
            asset_data = {
                "asset_code": asset["asset_code"],
                "asset_issuer": asset["asset_issuer"],
                "balance": asset["balance"],
                "user_id": user_id
            }
            client.post(f"/api/v1/portfolio/{sample_user_data['wallet_address']}/assets", json=asset_data)
        
        # Get risk metrics
        response = client.get(f"/api/v1/risk/{sample_user_data['wallet_address']}/metrics")
        
        assert response.status_code == 200
        data = response.json()
        
        # Check response structure
        assert "wallet_address" in data
        assert "timestamp" in data
        assert "metrics" in data
        
        # Check metrics structure
        metrics = data["metrics"]
        assert "portfolio_value" in metrics
        assert "volatility" in metrics
        assert "sharpe_ratio" in metrics
        assert "max_drawdown" in metrics
        assert "risk_score" in metrics
        
        # Check metric values are reasonable
        assert metrics["portfolio_value"] > 0
        assert 0 <= metrics["volatility"] <= 1
        assert 0 <= metrics["risk_score"] <= 1
    
    def test_get_risk_metrics_user_not_found(self, client, sample_wallet_address):
        """Test risk metrics retrieval for non-existent user"""
        response = client.get(f"/api/v1/risk/{sample_wallet_address}/metrics")
        
        assert response.status_code == 404
        data = response.json()
        
        assert "detail" in data
        assert "User not found" in data["detail"]
    
    def test_get_risk_metrics_no_portfolio(self, client, sample_user_data):
        """Test risk metrics for user with no portfolio"""
        # Create user but no portfolio
        client.post("/api/v1/portfolio/users", json=sample_user_data)
        
        response = client.get(f"/api/v1/risk/{sample_user_data['wallet_address']}/metrics")
        
        assert response.status_code == 404
        data = response.json()
        
        assert "detail" in data
        assert "No portfolio found" in data["detail"]
    
    def test_risk_analysis_with_different_analysis_types(self, client, sample_user_data, mock_reflector_client):
        """Test risk analysis with different analysis types"""
        # Create user and portfolio
        user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        user_id = user_response.json()["user_id"]
        
        asset_data = {
            "asset_code": "XLM",
            "asset_issuer": "native",
            "balance": 1000.0,
            "user_id": user_id
        }
        client.post(f"/api/v1/portfolio/{sample_user_data['wallet_address']}/assets", json=asset_data)
        
        # Test different analysis types
        analysis_types = ["comprehensive", "quick", "detailed"]
        
        for analysis_type in analysis_types:
            risk_request = {
                "wallet_address": sample_user_data["wallet_address"],
                "analysis_type": analysis_type
            }
            
            response = client.post("/api/v1/risk/analyze", json=risk_request)
            
            assert response.status_code == 200
            data = response.json()
            
            assert "analysis_type" in data
            assert data["analysis_type"] == analysis_type
    
    def test_risk_analysis_recommendations_quality(self, client, sample_user_data, mock_reflector_client):
        """Test that risk analysis provides meaningful recommendations"""
        # Create user and portfolio
        user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        user_id = user_response.json()["user_id"]
        
        # Add high-risk portfolio (mostly volatile assets)
        high_risk_assets = [
            {"asset_code": "XLM", "asset_issuer": "native", "balance": 1000.0},
            {"asset_code": "BTC", "asset_issuer": "GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR", "balance": 0.1}
        ]
        
        for asset in high_risk_assets:
            asset_data = {**asset, "user_id": user_id}
            client.post(f"/api/v1/portfolio/{sample_user_data['wallet_address']}/assets", json=asset_data)
        
        # Perform risk analysis
        risk_request = {
            "wallet_address": sample_user_data["wallet_address"],
            "analysis_type": "comprehensive"
        }
        
        response = client.post("/api/v1/risk/analyze", json=risk_request)
        
        assert response.status_code == 200
        data = response.json()
        
        # Check that recommendations are provided
        recommendations = data["recommendations"]
        assert len(recommendations) > 0
        
        # Check that recommendations contain relevant keywords
        recommendation_text = " ".join(recommendations).lower()
        risk_keywords = ["volatility", "diversification", "risk", "balance", "stable"]
        
        # At least one risk-related keyword should be present
        assert any(keyword in recommendation_text for keyword in risk_keywords)
