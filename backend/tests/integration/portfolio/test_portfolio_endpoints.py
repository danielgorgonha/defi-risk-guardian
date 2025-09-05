"""
Integration tests for portfolio CRUD operations
"""
import pytest
from unittest.mock import patch, Mock, AsyncMock
from fastapi.testclient import TestClient

from app.main import app
from app.models.database import User, Portfolio

@pytest.mark.integration
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

    # New endpoints tests
    def test_update_asset_success(self, client, sample_user_data, sample_portfolio_data, mock_stellar_oracle_client):
        """Test successful asset update"""
        # Create user and add asset first
        user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        user_data = user_response.json()
        user_id = user_data["user_id"]
        assert isinstance(user_id, str)
        
        asset_data = sample_portfolio_data
        asset_response = client.post(f"/api/v1/portfolio/{sample_user_data['wallet_address']}/assets", json=asset_data)
        asset_data_response = asset_response.json()
        asset_id = asset_data_response["asset_id"]
        
        # Update asset
        update_data = {
            "status": "planned",
            "notes": "Updated notes",
            "target_date": "2024-12-31T00:00:00Z"
        }
        
        response = client.put(
            f"/api/v1/portfolio/{sample_user_data['wallet_address']}/assets/{asset_id}",
            json=update_data
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        assert "Asset updated successfully" in data["message"]

    def test_update_asset_user_not_found(self, client, sample_wallet_address):
        """Test asset update with non-existent user"""
        update_data = {
            "status": "planned",
            "notes": "Updated notes"
        }
        
        response = client.put(
            f"/api/v1/portfolio/{sample_wallet_address}/assets/1",
            json=update_data
        )
        
        assert response.status_code == 404
        data = response.json()
        
        assert "error" in data
        assert "User not found" in data["error"]

    def test_update_asset_asset_not_found(self, client, sample_user_data, mock_stellar_oracle_client):
        """Test asset update with non-existent asset"""
        # Create user first
        user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        
        update_data = {
            "status": "planned",
            "notes": "Updated notes"
        }
        
        response = client.put(
            f"/api/v1/portfolio/{sample_user_data['wallet_address']}/assets/999",
            json=update_data
        )
        
        assert response.status_code == 404
        data = response.json()
        
        assert "error" in data
        assert "Asset not found" in data["error"]

    def test_update_asset_invalid_wallet(self, client):
        """Test asset update with invalid wallet address"""
        update_data = {
            "status": "planned",
            "notes": "Updated notes"
        }
        
        response = client.put(
            "/api/v1/portfolio/invalid_wallet/assets/1",
            json=update_data
        )
        
        assert response.status_code == 400
        data = response.json()
        
        assert "error" in data
        assert "Invalid wallet address" in data["error"]

    def test_delete_asset_success(self, client, sample_user_data, sample_portfolio_data, mock_stellar_oracle_client):
        """Test successful asset deletion"""
        # Create user and add asset first
        user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        user_data = user_response.json()
        user_id = user_data["user_id"]
        assert isinstance(user_id, str)
        
        asset_data = sample_portfolio_data
        asset_response = client.post(f"/api/v1/portfolio/{sample_user_data['wallet_address']}/assets", json=asset_data)
        asset_data_response = asset_response.json()
        asset_id = asset_data_response["asset_id"]
        
        # Delete asset
        response = client.delete(
            f"/api/v1/portfolio/{sample_user_data['wallet_address']}/assets/{asset_id}"
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        assert "Asset hidden successfully" in data["message"]

    def test_delete_asset_user_not_found(self, client, sample_wallet_address):
        """Test asset deletion with non-existent user"""
        response = client.delete(
            f"/api/v1/portfolio/{sample_wallet_address}/assets/1"
        )
        
        assert response.status_code == 404
        data = response.json()
        
        assert "error" in data
        assert "User not found" in data["error"]

    def test_delete_asset_asset_not_found(self, client, sample_user_data, mock_stellar_oracle_client):
        """Test asset deletion with non-existent asset"""
        # Create user first
        user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        
        response = client.delete(
            f"/api/v1/portfolio/{sample_user_data['wallet_address']}/assets/999"
        )
        
        assert response.status_code == 404
        data = response.json()
        
        assert "error" in data
        assert "Asset not found" in data["error"]

    def test_delete_asset_invalid_wallet(self, client):
        """Test asset deletion with invalid wallet address"""
        response = client.delete(
            "/api/v1/portfolio/invalid_wallet/assets/1"
        )
        
        assert response.status_code == 400
        data = response.json()
        
        assert "error" in data
        assert "Invalid wallet address" in data["error"]

    def test_sync_portfolio_success(self, client, sample_user_data, mock_stellar_oracle_client):
        """Test successful portfolio sync"""
        # Create user first
        user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        
        sync_data = {
            "force_refresh": True
        }
        
        response = client.post(
            f"/api/v1/portfolio/{sample_user_data['wallet_address']}/sync",
            json=sync_data
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        assert "Portfolio synced successfully" in data["message"]
        assert "assets_updated" in data
        assert "assets_added" in data

    def test_sync_portfolio_user_not_found(self, client, sample_wallet_address):
        """Test portfolio sync with non-existent user"""
        sync_data = {
            "force_refresh": True
        }
        
        response = client.post(
            f"/api/v1/portfolio/{sample_wallet_address}/sync",
            json=sync_data
        )
        
        assert response.status_code == 404
        data = response.json()
        
        assert "error" in data
        assert "User not found" in data["error"]

    def test_sync_portfolio_invalid_wallet(self, client):
        """Test portfolio sync with invalid wallet address"""
        sync_data = {
            "force_refresh": True
        }
        
        response = client.post(
            "/api/v1/portfolio/invalid_wallet/sync",
            json=sync_data
        )
        
        assert response.status_code == 400
        data = response.json()
        
        assert "error" in data
        assert "Invalid wallet address" in data["error"]

    def test_get_asset_details_success(self, client, sample_user_data, sample_portfolio_data, mock_stellar_oracle_client):
        """Test successful asset details retrieval"""
        # Create user and add asset first
        user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        user_data = user_response.json()
        user_id = user_data["user_id"]
        assert isinstance(user_id, str)
        
        asset_data = sample_portfolio_data
        asset_response = client.post(f"/api/v1/portfolio/{sample_user_data['wallet_address']}/assets", json=asset_data)
        asset_data_response = asset_response.json()
        asset_id = asset_data_response["asset_id"]
        
        # Get asset details
        response = client.get(
            f"/api/v1/portfolio/{sample_user_data['wallet_address']}/assets/{asset_id}"
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "asset_id" in data
        assert "asset_code" in data
        assert "asset_issuer" in data
        assert "balance" in data
        assert "target_allocation" in data
        assert "status" in data
        assert "price_usd" in data
        assert "value_usd" in data
        assert "created_at" in data
        assert "updated_at" in data

    def test_get_asset_details_user_not_found(self, client, sample_wallet_address):
        """Test asset details retrieval with non-existent user"""
        response = client.get(
            f"/api/v1/portfolio/{sample_wallet_address}/assets/1"
        )
        
        assert response.status_code == 404
        data = response.json()
        
        assert "error" in data
        assert "User not found" in data["error"]

    def test_get_asset_details_asset_not_found(self, client, sample_user_data, mock_stellar_oracle_client):
        """Test asset details retrieval with non-existent asset"""
        # Create user first
        user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        
        response = client.get(
            f"/api/v1/portfolio/{sample_user_data['wallet_address']}/assets/999"
        )
        
        assert response.status_code == 404
        data = response.json()
        
        assert "error" in data
        assert "Asset not found" in data["error"]

    def test_get_asset_details_invalid_wallet(self, client):
        """Test asset details retrieval with invalid wallet address"""
        response = client.get(
            "/api/v1/portfolio/invalid_wallet/assets/1"
        )
        
        assert response.status_code == 400
        data = response.json()
        
        assert "error" in data
        assert "Invalid wallet address" in data["error"]

    # New endpoints tests for Stellar Oracle integration
    def test_get_asset_price_history_success(self, client, sample_user_data, mock_stellar_oracle_client):
        """Test successful retrieval of asset price history"""
        # Mock price history data
        mock_history = [
            {
                "timestamp": "2024-01-01T00:00:00Z",
                "price_usd": 0.12
            },
            {
                "timestamp": "2024-01-02T00:00:00Z", 
                "price_usd": 0.13
            }
        ]
        
        mock_stellar_oracle_client.get_price_history = AsyncMock(return_value=mock_history)
        
        response = client.get(
            f"/api/v1/portfolio/{sample_user_data['wallet_address']}/assets/XLM/history?days=7"
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["asset_code"] == "XLM"
        assert data["asset_issuer"] is None
        assert data["period_days"] == 7
        assert len(data["price_history"]) == 2
        assert data["price_history"][0]["price_usd"] == 0.12
    
    def test_get_asset_price_history_with_issuer(self, client, sample_user_data, mock_stellar_oracle_client):
        """Test price history retrieval with asset issuer"""
        mock_history = [
            {
                "timestamp": "2024-01-01T00:00:00Z",
                "price_usd": 1.0
            }
        ]
        
        mock_stellar_oracle_client.get_price_history = AsyncMock(return_value=mock_history)
        
        response = client.get(
            f"/api/v1/portfolio/{sample_user_data['wallet_address']}/assets/USDC/history",
            params={"asset_issuer": "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["asset_code"] == "USDC"
        assert data["asset_issuer"] == "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
    
    def test_get_asset_price_history_no_data(self, client, sample_user_data, mock_stellar_oracle_client):
        """Test price history when no data is available"""
        mock_stellar_oracle_client.get_price_history = AsyncMock(return_value=[])
        
        response = client.get(
            f"/api/v1/portfolio/{sample_user_data['wallet_address']}/assets/UNKNOWN/history"
        )
        
        assert response.status_code == 404
        error_data = response.json()
        assert "Price history not available" in error_data.get("detail", error_data.get("error", ""))
    
    def test_get_asset_price_history_invalid_wallet(self, client):
        """Test price history with invalid wallet address"""
        invalid_wallet = "INVALID_WALLET"
        
        response = client.get(
            f"/api/v1/portfolio/{invalid_wallet}/assets/XLM/history"
        )
        
        assert response.status_code == 400
        error_data = response.json()
        assert "Invalid wallet address format" in error_data.get("detail", error_data.get("error", ""))
    
    def test_get_asset_price_history_oracle_error(self, client, sample_user_data, mock_stellar_oracle_client):
        """Test price history when oracle throws an error"""
        mock_stellar_oracle_client.get_price_history = AsyncMock(side_effect=Exception("Oracle error"))
        
        response = client.get(
            f"/api/v1/portfolio/{sample_user_data['wallet_address']}/assets/XLM/history"
        )
        
        assert response.status_code == 500
        error_data = response.json()
        assert "Error getting price history" in error_data.get("detail", error_data.get("error", ""))
    
    def test_get_supported_assets_success(self, client, mock_stellar_oracle_client):
        """Test successful retrieval of supported assets"""
        mock_assets = [
            {
                "code": "XLM",
                "issuer": None,
                "name": "Stellar Lumens"
            },
            {
                "code": "USDC",
                "issuer": "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
                "name": "USD Coin"
            },
            {
                "code": "KALE",
                "issuer": "GABC1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890",
                "name": "KALE Token"
            }
        ]
        
        mock_stellar_oracle_client.get_supported_assets = AsyncMock(return_value=mock_assets)
        
        response = client.get("/api/v1/portfolio/supported-assets")
        
        # Debug: print response if it fails
        if response.status_code != 200:
            print(f"Response status: {response.status_code}")
            print(f"Response body: {response.text}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["total_count"] == 3
        assert len(data["supported_assets"]) == 3
        assert data["supported_assets"][0]["code"] == "XLM"
        assert data["supported_assets"][1]["code"] == "USDC"
        assert data["supported_assets"][2]["code"] == "KALE"
    
    def test_get_supported_assets_empty_list(self, client, mock_stellar_oracle_client):
        """Test supported assets when no assets are available"""
        mock_stellar_oracle_client.get_supported_assets = AsyncMock(return_value=[])
        
        response = client.get("/api/v1/portfolio/supported-assets")
        
        assert response.status_code == 200
        data = response.json()
        assert data["total_count"] == 0
        assert len(data["supported_assets"]) == 0
    
    def test_get_supported_assets_oracle_error(self, client, mock_stellar_oracle_client):
        """Test supported assets when oracle throws an error"""
        mock_stellar_oracle_client.get_supported_assets = AsyncMock(side_effect=Exception("Oracle error"))
        
        response = client.get("/api/v1/portfolio/supported-assets")
        
        assert response.status_code == 500
        error_data = response.json()
        error_message = error_data.get("detail", error_data.get("error", ""))
        assert "Error getting supported assets" in error_message
