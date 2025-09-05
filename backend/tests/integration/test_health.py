"""
Integration tests for health check endpoint
"""
import pytest
from unittest.mock import patch, Mock
from fastapi.testclient import TestClient

from app.main import app

@pytest.mark.integration
class TestHealthEndpoint:
    """Test health check endpoint functionality"""
    
    def test_health_check_success(self, client, mock_stellar_oracle_client, mock_cache_service):
        """Test successful health check response"""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        
        # Check response structure
        assert "status" in data
        assert "timestamp" in data
        assert "services" in data
        
        # Check services status
        services = data["services"]
        assert "database" in services
        assert "redis" in services
        assert "stellar_oracle" in services
        
        # Check database status
        assert services["database"]["status"] == "connected"
        assert "version" in services["database"]
        assert "database" in services["database"]  # database name field
        
        # Check Redis status
        assert services["redis"]["status"] == "connected"
        assert "version" in services["redis"]
        
        # Check Stellar Oracle status (returned as object with details)
        stellar_oracle = services["stellar_oracle"]
        assert stellar_oracle["status"] == "connected"
        assert "network" in stellar_oracle
        assert "horizon_url" in stellar_oracle
        assert "contracts_configured" in stellar_oracle
        assert "contracts" in stellar_oracle
        assert "native_token_price_usd" in stellar_oracle
        assert "functionality" in stellar_oracle
    
    def test_health_check_timestamp_format(self, client, mock_stellar_oracle_client, mock_cache_service):
        """Test that timestamp is in correct ISO format"""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        
        # Check timestamp format (ISO 8601 with Z suffix)
        timestamp = data["timestamp"]
        assert timestamp.endswith("Z")
        assert "T" in timestamp
        
        # Try to parse the timestamp (basic validation)
        import datetime
        try:
            datetime.datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
        except ValueError:
            pytest.fail("Invalid timestamp format")
    
    def test_health_check_overall_status_healthy(self, client, mock_stellar_oracle_client, mock_cache_service):
        """Test overall status when all services are healthy"""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "healthy"
    
