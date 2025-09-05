"""
Integration tests for rebalancing endpoints
"""
import pytest
from unittest.mock import patch, Mock, AsyncMock
from fastapi.testclient import TestClient

from app.main import app
from tests.fixtures.mock_data import MOCK_PORTFOLIO_ASSETS, MOCK_REBALANCE_SUGGESTIONS

@pytest.mark.integration
class TestRebalance:
    """Test rebalancing functionality"""
    
    def test_suggest_rebalance_success(self, client, sample_user_data, mock_stellar_oracle_client):
        """Test successful rebalance suggestion"""
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
        
        # Request rebalance suggestion
        rebalance_request = {
            "wallet_address": sample_user_data["wallet_address"],
            "target_allocation": {
                "XLM": 0.3,
                "USDC": 0.4,
                "BTC": 0.3
            },
            "rebalance_threshold": 0.1
        }
        
        response = client.post("/api/v1/rebalance/suggest", json=rebalance_request)
        
        assert response.status_code == 200
        data = response.json()
        
        # Check response structure
        assert "wallet_address" in data
        assert "current_allocation" in data
        assert "target_allocation" in data
        assert "suggested_trades" in data
        assert "expected_improvement" in data
        
        # Check allocation data
        assert isinstance(data["current_allocation"], dict)
        assert isinstance(data["target_allocation"], dict)
        
        # Check suggested trades
        assert isinstance(data["suggested_trades"], list)
        if len(data["suggested_trades"]) > 0:
            trade = data["suggested_trades"][0]
            assert "asset_code" in trade
            assert "action" in trade
            assert "amount" in trade
            assert "reason" in trade
        
        # Check expected improvement
        assert isinstance(data["expected_improvement"], dict)
    
    def test_suggest_rebalance_user_not_found(self, client, sample_wallet_address):
        """Test rebalance suggestion for non-existent user"""
        rebalance_request = {
            "wallet_address": sample_wallet_address,
            "target_allocation": {"XLM": 0.5, "USDC": 0.5},
            "rebalance_threshold": 0.1
        }
        
        response = client.post("/api/v1/rebalance/suggest", json=rebalance_request)
        
        assert response.status_code == 404
        data = response.json()
        
        assert "detail" in data
        assert "User not found" in data["detail"]
    
    def test_suggest_rebalance_no_portfolio(self, client, sample_user_data):
        """Test rebalance suggestion for user with no portfolio"""
        # Create user but no portfolio
        client.post("/api/v1/portfolio/users", json=sample_user_data)
        
        rebalance_request = {
            "wallet_address": sample_user_data["wallet_address"],
            "target_allocation": {"XLM": 0.5, "USDC": 0.5},
            "rebalance_threshold": 0.1
        }
        
        response = client.post("/api/v1/rebalance/suggest", json=rebalance_request)
        
        assert response.status_code == 404
        data = response.json()
        
        assert "detail" in data
        assert "No portfolio found" in data["detail"]
    
    def test_suggest_rebalance_invalid_allocation(self, client, sample_user_data, mock_stellar_oracle_client):
        """Test rebalance suggestion with invalid target allocation"""
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
        
        # Invalid allocation (doesn't sum to 1.0)
        rebalance_request = {
            "wallet_address": sample_user_data["wallet_address"],
            "target_allocation": {
                "XLM": 0.8,
                "USDC": 0.5  # Total > 1.0
            },
            "rebalance_threshold": 0.1
        }
        
        response = client.post("/api/v1/rebalance/suggest", json=rebalance_request)
        
        # Should still work (validation happens at business logic level)
        assert response.status_code == 200
    
    def test_execute_rebalance_success(self, client, sample_user_data, mock_stellar_oracle_client):
        """Test successful rebalance execution"""
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
        
        # Execute rebalance
        rebalance_request = {
            "wallet_address": sample_user_data["wallet_address"],
            "target_allocation": {
                "XLM": 0.3,
                "USDC": 0.4,
                "BTC": 0.3
            },
            "execute_trades": True
        }
        
        response = client.post("/api/v1/rebalance/execute", json=rebalance_request)
        
        assert response.status_code == 200
        data = response.json()
        
        # Check response structure
        assert "wallet_address" in data
        assert "rebalance_id" in data
        assert "executed_trades" in data
        assert "new_allocation" in data
        assert "execution_timestamp" in data
        
        # Check executed trades
        assert isinstance(data["executed_trades"], list)
        
        # Check new allocation
        assert isinstance(data["new_allocation"], dict)
    
    def test_execute_rebalance_user_not_found(self, client, sample_wallet_address):
        """Test rebalance execution for non-existent user"""
        rebalance_request = {
            "wallet_address": sample_wallet_address,
            "target_allocation": {"XLM": 0.5, "USDC": 0.5},
            "execute_trades": True
        }
        
        response = client.post("/api/v1/rebalance/execute", json=rebalance_request)
        
        assert response.status_code == 404
        data = response.json()
        
        assert "detail" in data
        assert "User not found" in data["detail"]
    
    def test_execute_rebalance_no_portfolio(self, client, sample_user_data):
        """Test rebalance execution for user with no portfolio"""
        # Create user but no portfolio
        client.post("/api/v1/portfolio/users", json=sample_user_data)
        
        rebalance_request = {
            "wallet_address": sample_user_data["wallet_address"],
            "target_allocation": {"XLM": 0.5, "USDC": 0.5},
            "execute_trades": True
        }
        
        response = client.post("/api/v1/rebalance/execute", json=rebalance_request)
        
        assert response.status_code == 404
        data = response.json()
        
        assert "detail" in data
        assert "No portfolio found" in data["detail"]
    
    def test_rebalance_simulation_mode(self, client, sample_user_data, mock_stellar_oracle_client):
        """Test rebalance in simulation mode (no actual trades)"""
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
        
        # Execute rebalance in simulation mode
        rebalance_request = {
            "wallet_address": sample_user_data["wallet_address"],
            "target_allocation": {"XLM": 0.5, "USDC": 0.5},
            "execute_trades": False  # Simulation mode
        }
        
        response = client.post("/api/v1/rebalance/execute", json=rebalance_request)
        
        assert response.status_code == 200
        data = response.json()
        
        # Check response structure
        assert "wallet_address" in data
        assert "simulation_mode" in data
        assert "proposed_trades" in data
        assert "projected_allocation" in data
        
        # In simulation mode, no actual trades should be executed
        assert data["simulation_mode"] is True
        assert isinstance(data["proposed_trades"], list)
        assert isinstance(data["projected_allocation"], dict)
    
    def test_rebalance_with_different_thresholds(self, client, sample_user_data, mock_stellar_oracle_client):
        """Test rebalance suggestions with different thresholds"""
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
        
        # Test different thresholds
        thresholds = [0.05, 0.1, 0.2, 0.5]
        
        for threshold in thresholds:
            rebalance_request = {
                "wallet_address": sample_user_data["wallet_address"],
                "target_allocation": {"XLM": 0.5, "USDC": 0.5},
                "rebalance_threshold": threshold
            }
            
            response = client.post("/api/v1/rebalance/suggest", json=rebalance_request)
            
            assert response.status_code == 200
            data = response.json()
            
            assert "rebalance_threshold" in data
            assert data["rebalance_threshold"] == threshold
    
    def test_rebalance_trade_validation(self, client, sample_user_data, mock_stellar_oracle_client):
        """Test that rebalance trades are properly validated"""
        # Create user and portfolio
        user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        user_id = user_response.json()["user_id"]
        
        # Add asset with small balance
        asset_data = {
            "asset_code": "XLM",
            "asset_issuer": "native",
            "balance": 10.0,  # Small balance
            "user_id": user_id
        }
        client.post(f"/api/v1/portfolio/{sample_user_data['wallet_address']}/assets", json=asset_data)
        
        # Request rebalance that would require selling more than available
        rebalance_request = {
            "wallet_address": sample_user_data["wallet_address"],
            "target_allocation": {"XLM": 0.0, "USDC": 1.0},  # Sell all XLM
            "execute_trades": True
        }
        
        response = client.post("/api/v1/rebalance/execute", json=rebalance_request)
        
        assert response.status_code == 200
        data = response.json()
        
        # Check that trades are within available balance
        executed_trades = data["executed_trades"]
        for trade in executed_trades:
            if trade["action"] == "sell":
                assert trade["amount"] <= 10.0  # Should not exceed available balance
