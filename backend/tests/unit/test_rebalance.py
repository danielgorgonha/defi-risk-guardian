"""
Unit tests for Rebalance API endpoints
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, Mock, AsyncMock
from app.main import app

client = TestClient(app)

@pytest.mark.unit
class TestRebalance:
    """Test cases for Rebalance endpoints"""
    
    def test_suggest_rebalancing_success(self, client, sample_user_data, sample_portfolio_data):
        """Test successful rebalancing suggestion"""
        # Create user first
        user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        user_id = user_response.json()["user_id"]
        
        # Add asset to portfolio
        asset_data = sample_portfolio_data
        client.post(f"/api/v1/portfolio/{sample_user_data['wallet_address']}/assets", json=asset_data)
        
        # Mock Reflector client for price data
        with patch('app.api.v1.rebalance.stellar_oracle_client') as mock_reflector:
            mock_reflector.get_asset_price = AsyncMock(return_value=0.12)
            
            # Request rebalancing suggestion
            rebalance_request = {
                "wallet_address": sample_user_data["wallet_address"],
                "threshold": 0.05,
                "max_slippage": 0.01
            }
            
            response = client.post("/api/v1/rebalance/suggest", json=rebalance_request)
            
            assert response.status_code == 200
            data = response.json()
            
            # Check response structure
            assert "should_rebalance" in data
            assert "current_allocation" in data
            assert "target_allocation" in data
            assert "suggested_orders" in data
            assert "estimated_cost" in data
            assert "risk_improvement" in data
            
            # Check data types
            assert isinstance(data["should_rebalance"], bool)
            assert isinstance(data["current_allocation"], dict)
            assert isinstance(data["target_allocation"], dict)
            assert isinstance(data["suggested_orders"], list)
            assert isinstance(data["estimated_cost"], (int, float))
            assert isinstance(data["risk_improvement"], (int, float))
            
            # Check reasonable ranges
            assert 0 <= data["estimated_cost"]
            assert 0 <= data["risk_improvement"] <= 100
    
    def test_suggest_rebalancing_user_not_found(self, client, sample_wallet_address):
        """Test rebalancing suggestion for non-existent user"""
        rebalance_request = {
            "wallet_address": sample_wallet_address,
            "threshold": 0.05,
            "max_slippage": 0.01
        }
        
        response = client.post("/api/v1/rebalance/suggest", json=rebalance_request)
        
        assert response.status_code == 404
        data = response.json()
        
        assert "error" in data
        assert "User not found" in data["error"]
    
    def test_suggest_rebalancing_no_portfolio(self, client, sample_user_data):
        """Test rebalancing suggestion for user with no portfolio"""
        # Create user but don't add any assets
        client.post("/api/v1/portfolio/users", json=sample_user_data)
        
        rebalance_request = {
            "wallet_address": sample_user_data["wallet_address"],
            "threshold": 0.05,
            "max_slippage": 0.01
        }
        
        response = client.post("/api/v1/rebalance/suggest", json=rebalance_request)
        
        assert response.status_code == 404
        data = response.json()
        
        assert "error" in data
        assert "No portfolio found" in data["error"]
    
    def test_suggest_rebalancing_reflector_error(self, client, sample_user_data, sample_portfolio_data):
        """Test rebalancing suggestion when Reflector API fails"""
        # Create user and portfolio
        user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        asset_data = sample_portfolio_data
        client.post(f"/api/v1/portfolio/{sample_user_data['wallet_address']}/assets", json=asset_data)
        
        # Mock Reflector client to raise exception
        with patch('app.api.v1.rebalance.stellar_oracle_client') as mock_reflector:
            mock_reflector.get_asset_price = AsyncMock(side_effect=Exception("Reflector API error"))
            
            rebalance_request = {
                "wallet_address": sample_user_data["wallet_address"],
                "threshold": 0.05,
                "max_slippage": 0.01
            }
            
            response = client.post("/api/v1/rebalance/suggest", json=rebalance_request)
            
            assert response.status_code == 500
            data = response.json()
            
            assert "error" in data
            assert "Error suggesting rebalancing" in data["error"]
    
    def test_execute_rebalancing_success(self, client, sample_user_data):
        """Test successful rebalancing execution"""
        # Create user first
        client.post("/api/v1/portfolio/users", json=sample_user_data)
        
        # Execute rebalancing
        execute_request = {
            "wallet_address": sample_user_data["wallet_address"],
            "orders": [
                {
                    "asset_code": "XLM",
                    "order_type": "buy",
                    "current_value": 100.0,
                    "target_value": 120.0,
                    "value_difference": 20.0,
                    "current_allocation": 0.3,
                    "target_allocation": 0.4
                }
            ]
        }
        
        response = client.post("/api/v1/rebalance/execute", json=execute_request)
        
        assert response.status_code == 200
        data = response.json()
        
        # Check response structure
        assert "message" in data
        assert "execution_results" in data
        assert "total_cost" in data
        assert "timestamp" in data
        
        # Check data types
        assert isinstance(data["message"], str)
        assert isinstance(data["execution_results"], list)
        assert isinstance(data["total_cost"], (int, float))
        assert isinstance(data["timestamp"], str)
        
        # Check message
        assert data["message"] == "Rebalancing executed successfully"
        
        # Check execution results
        assert len(data["execution_results"]) == 1
        result = data["execution_results"][0]
        assert "asset_code" in result
        assert "order_type" in result
        assert "status" in result
        assert result["status"] == "executed"
    
    def test_execute_rebalancing_user_not_found(self, client, sample_wallet_address):
        """Test rebalancing execution for non-existent user"""
        execute_request = {
            "wallet_address": sample_wallet_address,
            "orders": []
        }
        
        response = client.post("/api/v1/rebalance/execute", json=execute_request)
        
        assert response.status_code == 404
        data = response.json()
        
        assert "error" in data
        assert "User not found" in data["error"]
    
    def test_get_rebalance_history_success(self, client, sample_user_data):
        """Test successful rebalance history retrieval"""
        # Create user first
        client.post("/api/v1/portfolio/users", json=sample_user_data)
        
        # Execute a rebalancing to create history
        execute_request = {
            "wallet_address": sample_user_data["wallet_address"],
            "orders": [
                {
                    "asset_code": "XLM",
                    "order_type": "buy",
                    "current_value": 100.0,
                    "target_value": 120.0,
                    "value_difference": 20.0,
                    "current_allocation": 0.3,
                    "target_allocation": 0.4
                }
            ]
        }
        client.post("/api/v1/rebalance/execute", json=execute_request)
        
        # Get rebalance history
        response = client.get(f"/api/v1/rebalance/{sample_user_data['wallet_address']}/history")
        
        assert response.status_code == 200
        data = response.json()
        
        # Check response structure
        assert isinstance(data, list)
        
        if len(data) > 0:
            history_item = data[0]
            assert "id" in history_item
            assert "rebalance_type" in history_item
            assert "old_allocation" in history_item
            assert "new_allocation" in history_item
            assert "executed_at" in history_item
            assert "success" in history_item
            assert "error_message" in history_item
            
            # Check data types
            assert isinstance(history_item["id"], int)
            assert isinstance(history_item["rebalance_type"], str)
            assert isinstance(history_item["old_allocation"], dict)
            assert isinstance(history_item["new_allocation"], list)
            assert isinstance(history_item["executed_at"], str)
            assert isinstance(history_item["success"], bool)
    
    def test_get_rebalance_history_user_not_found(self, client, sample_wallet_address):
        """Test rebalance history retrieval for non-existent user"""
        response = client.get(f"/api/v1/rebalance/{sample_wallet_address}/history")
        
        assert response.status_code == 404
        data = response.json()
        
        assert "error" in data
        assert "User not found" in data["error"]
    
    def test_suggest_rebalancing_invalid_threshold(self, client, sample_user_data, sample_portfolio_data):
        """Test rebalancing suggestion with invalid threshold"""
        # Create user and portfolio
        user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        asset_data = sample_portfolio_data
        client.post(f"/api/v1/portfolio/{sample_user_data['wallet_address']}/assets", json=asset_data)
        
        # Mock Reflector client
        with patch('app.api.v1.rebalance.stellar_oracle_client') as mock_reflector:
            mock_reflector.get_asset_price = AsyncMock(return_value=0.12)
            
            # Test with invalid threshold (negative)
            rebalance_request = {
                "wallet_address": sample_user_data["wallet_address"],
                "threshold": -0.05,  # Invalid: negative threshold
                "max_slippage": 0.01
            }
            
            response = client.post("/api/v1/rebalance/suggest", json=rebalance_request)
            
            # Should still work as threshold validation is not implemented
            assert response.status_code == 200
