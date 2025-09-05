"""
Unit tests for portfolio CRUD operations
"""
import pytest
from unittest.mock import patch, Mock, AsyncMock
from fastapi.testclient import TestClient

from app.main import app
from app.models.database import User, Portfolio

@pytest.mark.unit
class TestPortfolioCRUD:
    """Test portfolio CRUD operations"""
    
    def test_create_user_success(self, client, sample_user_data):
        """Test successful user creation"""
        response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        assert "user_id" in data
        assert data["message"] == "User created successfully"
        assert data["user_id"] is not None
        assert isinstance(data["user_id"], str)
    
    def test_create_user_duplicate(self, client, sample_user_data):
        """Test creating user with existing wallet address"""
        # Create first user
        client.post("/api/v1/portfolio/users", json=sample_user_data)
        
        # Try to create duplicate
        response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["message"] == "User already exists"
        assert "user_id" in data
        assert isinstance(data["user_id"], str)
    
    def test_create_user_invalid_data(self, client):
        """Test user creation with invalid data"""
        invalid_data = {
            "wallet_address": "INVALID123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ123456",  # Invalid format
            "risk_tolerance": 0.5
        }
        
        response = client.post("/api/v1/portfolio/users", json=invalid_data)
        
        # Should fail validation due to invalid wallet address
        assert response.status_code == 422
    
    def test_get_portfolio_success(self, client, sample_user_data, sample_portfolio_data, mock_stellar_oracle_client):
        """Test successful portfolio retrieval"""
        # Create user first
        user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        user_data = user_response.json()
        user_id = user_data["user_id"]
        assert isinstance(user_id, str)
        
        # Add portfolio asset
        portfolio_data = sample_portfolio_data
        client.post(f"/api/v1/portfolio/{sample_user_data['wallet_address']}/assets", json=portfolio_data)
        
        # Get portfolio
        response = client.get(f"/api/v1/portfolio/{sample_user_data['wallet_address']}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "wallet_address" in data
        assert "total_value_usd" in data
        assert "assets" in data
        assert "risk_score" in data
        assert data["wallet_address"] == sample_user_data["wallet_address"]
        assert len(data["assets"]) > 0
    
    def test_get_portfolio_user_not_found(self, client, sample_wallet_address):
        """Test portfolio retrieval for non-existent user"""
        response = client.get(f"/api/v1/portfolio/{sample_wallet_address}")
        
        assert response.status_code == 404
        data = response.json()
        
        assert "error" in data
        assert "User not found" in data["error"]
    
    def test_add_asset_success(self, client, sample_user_data, sample_portfolio_data):
        """Test successful asset addition to portfolio"""
        # Create user first
        user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        user_data = user_response.json()
        user_id = user_data["user_id"]
        assert isinstance(user_id, str)
        
        # Add asset
        asset_data = sample_portfolio_data
        response = client.post(f"/api/v1/portfolio/{sample_user_data['wallet_address']}/assets", json=asset_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        assert "asset_id" in data
        assert data["message"] == "Asset added successfully"
    
    def test_add_asset_user_not_found(self, client, sample_portfolio_data, sample_wallet_address):
        """Test adding asset for non-existent user"""
        asset_data = sample_portfolio_data
        
        response = client.post(f"/api/v1/portfolio/{sample_wallet_address}/assets", json=asset_data)
        
        assert response.status_code == 404
        data = response.json()
        
        assert "error" in data
        assert "User not found" in data["error"]
    
    def test_get_asset_price_success(self, client, sample_user_data, sample_portfolio_data, mock_stellar_oracle_client):
        """Test successful asset price retrieval"""
        # Create user and add asset
        user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        user_data = user_response.json()
        user_id = user_data["user_id"]
        assert isinstance(user_id, str)
        
        asset_data = sample_portfolio_data
        client.post(f"/api/v1/portfolio/{sample_user_data['wallet_address']}/assets", json=asset_data)
        
        # Get asset price
        response = client.get(f"/api/v1/portfolio/{sample_user_data['wallet_address']}/assets/{sample_portfolio_data['asset_code']}/price")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "asset_code" in data
        assert "price_usd" in data
        assert "timestamp" in data
        assert data["asset_code"] == sample_portfolio_data["asset_code"]
        assert data["price_usd"] == 0.12  # Mock price
    
    def test_get_asset_price_asset_not_found(self, client, sample_user_data, sample_wallet_address, mock_stellar_oracle_client):
        """Test price retrieval for non-existent asset"""
        # Configure mock to return None for non-existent asset
        mock_stellar_oracle_client.get_asset_price = AsyncMock(return_value=None)
        
        response = client.get(f"/api/v1/portfolio/{sample_user_data['wallet_address']}/assets/NONEXISTENT/price")
        
        assert response.status_code == 404
        data = response.json()
        
        assert "error" in data
        assert "Asset not found or price unavailable" in data["error"]
    
    def test_get_asset_price_stellar_oracle_error(self, client, sample_user_data, sample_portfolio_data, mock_stellar_oracle_client):
        """Test price retrieval when Stellar Oracle fails"""
        # Configure mock to raise exception
        mock_stellar_oracle_client.get_asset_price.side_effect = Exception("Stellar Oracle error")
        
        # Create user and add asset
        user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        user_data = user_response.json()
        user_id = user_data["user_id"]
        assert isinstance(user_id, str)
        
        asset_data = sample_portfolio_data
        client.post(f"/api/v1/portfolio/{sample_user_data['wallet_address']}/assets", json=asset_data)
        
        # Try to get price
        response = client.get(f"/api/v1/portfolio/{sample_user_data['wallet_address']}/assets/{sample_portfolio_data['asset_code']}/price")
        
        assert response.status_code == 500
        data = response.json()
        
        assert "error" in data
        assert "Error getting asset price" in data["error"]
