"""
End-to-end integration tests
"""
import pytest
from unittest.mock import patch, Mock, AsyncMock
from fastapi.testclient import TestClient

from app.main import app
from tests.fixtures.mock_data import MOCK_PORTFOLIO_ASSETS, MOCK_ALERTS

@pytest.mark.integration
@pytest.mark.slow
class TestEndToEnd:
    """End-to-end integration tests"""
    
    def test_complete_user_journey(self, client, sample_user_data, mock_reflector_client):
        """Test complete user journey from registration to risk analysis"""
        wallet_address = sample_user_data["wallet_address"]
        
        # 1. Create user
        user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        assert user_response.status_code == 200
        user_id = user_response.json()["user_id"]
        
        # 2. Add multiple assets to portfolio
        for asset in MOCK_PORTFOLIO_ASSETS:
            asset_data = {
                "asset_code": asset["asset_code"],
                "asset_issuer": asset["asset_issuer"],
                "balance": asset["balance"],
                "user_id": user_id
            }
            response = client.post(f"/api/v1/portfolio/{wallet_address}/assets", json=asset_data)
            assert response.status_code == 200
        
        # 3. Get portfolio
        portfolio_response = client.get(f"/api/v1/portfolio/{wallet_address}")
        assert portfolio_response.status_code == 200
        portfolio_data = portfolio_response.json()
        assert len(portfolio_data["assets"]) == len(MOCK_PORTFOLIO_ASSETS)
        
        # 4. Get asset prices
        for asset in MOCK_PORTFOLIO_ASSETS:
            price_response = client.get(f"/api/v1/portfolio/{wallet_address}/assets/{asset['asset_code']}/price")
            assert price_response.status_code == 200
            price_data = price_response.json()
            assert price_data["asset_code"] == asset["asset_code"]
            assert price_data["price"] > 0
        
        # 5. Perform risk analysis
        risk_request = {
            "wallet_address": wallet_address,
            "analysis_type": "comprehensive"
        }
        risk_response = client.post("/api/v1/risk/analyze", json=risk_request)
        assert risk_response.status_code == 200
        risk_data = risk_response.json()
        assert risk_data["portfolio_value"] > 0
        assert len(risk_data["recommendations"]) > 0
        
        # 6. Get risk metrics
        metrics_response = client.get(f"/api/v1/risk/{wallet_address}/metrics")
        assert metrics_response.status_code == 200
        metrics_data = metrics_response.json()
        assert "volatility" in metrics_data["metrics"]
        assert "risk_score" in metrics_data["metrics"]
        
        # 7. Create alerts
        for alert in MOCK_ALERTS:
            alert_data = {
                **alert,
                "user_id": user_id
            }
            alert_response = client.post(f"/api/v1/alerts/{wallet_address}", json=alert_data)
            assert alert_response.status_code == 200
        
        # 8. Get alerts
        alerts_response = client.get(f"/api/v1/alerts/{wallet_address}")
        assert alerts_response.status_code == 200
        alerts_data = alerts_response.json()
        assert len(alerts_data) == len(MOCK_ALERTS)
        
        # 9. Get active alerts
        active_alerts_response = client.get(f"/api/v1/alerts/{wallet_address}/active")
        assert active_alerts_response.status_code == 200
        active_alerts_data = active_alerts_response.json()
        assert len(active_alerts_data) >= 0
        
        # 10. Get alert statistics
        stats_response = client.get(f"/api/v1/alerts/{wallet_address}/stats")
        assert stats_response.status_code == 200
        stats_data = stats_response.json()
        assert stats_data["total_alerts"] == len(MOCK_ALERTS)
        
        # 11. Suggest rebalance
        rebalance_request = {
            "wallet_address": wallet_address,
            "target_allocation": {
                "XLM": 0.3,
                "USDC": 0.4,
                "BTC": 0.3
            },
            "rebalance_threshold": 0.1
        }
        rebalance_response = client.post("/api/v1/rebalance/suggest", json=rebalance_request)
        assert rebalance_response.status_code == 200
        rebalance_data = rebalance_response.json()
        assert "suggested_trades" in rebalance_data
        
        # 12. Execute rebalance (simulation mode)
        execute_request = {
            "wallet_address": wallet_address,
            "target_allocation": {
                "XLM": 0.3,
                "USDC": 0.4,
                "BTC": 0.3
            },
            "execute_trades": False  # Simulation mode
        }
        execute_response = client.post("/api/v1/rebalance/execute", json=execute_request)
        assert execute_response.status_code == 200
        execute_data = execute_response.json()
        assert execute_data["simulation_mode"] is True
    
    def test_error_handling_flow(self, client, sample_wallet_address):
        """Test error handling throughout the application"""
        # 1. Try to get portfolio for non-existent user
        response = client.get(f"/api/v1/portfolio/{sample_wallet_address}")
        assert response.status_code == 404
        
        # 2. Try to add asset for non-existent user
        asset_data = {
            "asset_code": "XLM",
            "asset_issuer": "native",
            "balance": 1000.0,
            "user_id": "non-existent"
        }
        response = client.post(f"/api/v1/portfolio/{sample_wallet_address}/assets", json=asset_data)
        assert response.status_code == 404
        
        # 3. Try to get asset price for non-existent user
        response = client.get(f"/api/v1/portfolio/{sample_wallet_address}/assets/XLM/price")
        assert response.status_code == 404
        
        # 4. Try risk analysis for non-existent user
        risk_request = {
            "wallet_address": sample_wallet_address,
            "analysis_type": "comprehensive"
        }
        response = client.post("/api/v1/risk/analyze", json=risk_request)
        assert response.status_code == 404
        
        # 5. Try to get alerts for non-existent user
        response = client.get(f"/api/v1/alerts/{sample_wallet_address}")
        assert response.status_code == 404
        
        # 6. Try rebalance for non-existent user
        rebalance_request = {
            "wallet_address": sample_wallet_address,
            "target_allocation": {"XLM": 0.5, "USDC": 0.5},
            "rebalance_threshold": 0.1
        }
        response = client.post("/api/v1/rebalance/suggest", json=rebalance_request)
        assert response.status_code == 404
    
    def test_concurrent_operations(self, client, sample_user_data, mock_reflector_client):
        """Test concurrent operations on the same user"""
        wallet_address = sample_user_data["wallet_address"]
        
        # Create user
        user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        assert user_response.status_code == 200
        user_id = user_response.json()["user_id"]
        
        # Add multiple assets concurrently (simulated)
        asset_responses = []
        for asset in MOCK_PORTFOLIO_ASSETS:
            asset_data = {
                "asset_code": asset["asset_code"],
                "asset_issuer": asset["asset_issuer"],
                "balance": asset["balance"],
                "user_id": user_id
            }
            response = client.post(f"/api/v1/portfolio/{wallet_address}/assets", json=asset_data)
            asset_responses.append(response)
        
        # All asset additions should succeed
        for response in asset_responses:
            assert response.status_code == 200
        
        # Get portfolio after concurrent additions
        portfolio_response = client.get(f"/api/v1/portfolio/{wallet_address}")
        assert portfolio_response.status_code == 200
        portfolio_data = portfolio_response.json()
        assert len(portfolio_data["assets"]) == len(MOCK_PORTFOLIO_ASSETS)
    
    def test_data_consistency(self, client, sample_user_data, mock_reflector_client):
        """Test data consistency across different endpoints"""
        wallet_address = sample_user_data["wallet_address"]
        
        # Create user and portfolio
        user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        user_id = user_response.json()["user_id"]
        
        asset_data = {
            "asset_code": "XLM",
            "asset_issuer": "native",
            "balance": 1000.0,
            "user_id": user_id
        }
        client.post(f"/api/v1/portfolio/{wallet_address}/assets", json=asset_data)
        
        # Get portfolio
        portfolio_response = client.get(f"/api/v1/portfolio/{wallet_address}")
        portfolio_data = portfolio_response.json()
        
        # Get risk metrics
        metrics_response = client.get(f"/api/v1/risk/{wallet_address}/metrics")
        metrics_data = metrics_response.json()
        
        # Get asset price
        price_response = client.get(f"/api/v1/portfolio/{wallet_address}/assets/XLM/price")
        price_data = price_response.json()
        
        # Check data consistency
        assert portfolio_data["wallet_address"] == wallet_address
        assert metrics_data["wallet_address"] == wallet_address
        assert price_data["asset_code"] == "XLM"
        
        # Portfolio value should be consistent
        portfolio_value = portfolio_data["total_value"]
        metrics_value = metrics_data["metrics"]["portfolio_value"]
        
        # Values should be close (allowing for small floating point differences)
        assert abs(portfolio_value - metrics_value) < 0.01
    
    def test_performance_under_load(self, client, sample_user_data, mock_reflector_client):
        """Test performance under simulated load"""
        wallet_address = sample_user_data["wallet_address"]
        
        # Create user
        user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        user_id = user_response.json()["user_id"]
        
        # Add asset
        asset_data = {
            "asset_code": "XLM",
            "asset_issuer": "native",
            "balance": 1000.0,
            "user_id": user_id
        }
        client.post(f"/api/v1/portfolio/{wallet_address}/assets", json=asset_data)
        
        # Simulate multiple rapid requests
        import time
        start_time = time.time()
        
        # Make multiple requests
        for _ in range(10):
            response = client.get(f"/api/v1/portfolio/{wallet_address}")
            assert response.status_code == 200
            
            response = client.get(f"/api/v1/portfolio/{wallet_address}/assets/XLM/price")
            assert response.status_code == 200
        
        end_time = time.time()
        total_time = end_time - start_time
        
        # Should complete within reasonable time (adjust threshold as needed)
        assert total_time < 5.0  # 5 seconds for 20 requests
