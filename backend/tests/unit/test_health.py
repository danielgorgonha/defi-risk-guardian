"""
Unit tests for health check endpoint
"""
import pytest
from unittest.mock import patch, Mock
from fastapi.testclient import TestClient

from app.main import app

@pytest.mark.unit
class TestHealthEndpoint:
    """Test health check endpoint functionality"""
    
    def test_health_check_success(self, client, mock_reflector_client, mock_cache_service):
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
        assert "reflector" in services
        
        # Check database status
        assert services["database"]["status"] == "connected"
        assert "version" in services["database"]
        assert "database" in services["database"]  # database name field
        
        # Check Redis status
        assert services["redis"]["status"] == "connected"
        assert "version" in services["redis"]
        
        # Check Reflector status (returned as string, not object)
        assert services["reflector"] == "connected"
    
    def test_health_check_timestamp_format(self, client, mock_reflector_client, mock_cache_service):
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
    
    def test_health_check_overall_status_healthy(self, client, mock_reflector_client, mock_cache_service):
        """Test overall status when all services are healthy"""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "healthy"
    
