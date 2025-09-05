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
    
    def test_health_check_database_disconnected(self, client, mock_reflector_client, mock_cache_service):
        """Test health check when database is disconnected"""
        with patch('app.core.database.get_db') as mock_get_db:
            mock_session = Mock()
            mock_session.execute.side_effect = Exception("Database connection failed")
            mock_get_db.return_value = mock_session
            
            response = client.get("/health")
            
            assert response.status_code == 200
            data = response.json()
            
            assert data["services"]["database"]["status"] == "disconnected"
            assert data["status"] == "degraded"
    
    def test_health_check_redis_disconnected(self, client, mock_reflector_client):
        """Test health check when Redis is disconnected"""
        with patch('app.services.cache.cache_service') as mock_cache:
            mock_cache.is_connected.return_value = False
            mock_cache.get_stats.return_value = {"status": "disconnected"}
            
            response = client.get("/health")
            
            assert response.status_code == 200
            data = response.json()
            
            assert data["services"]["redis"]["status"] == "disconnected"
            assert data["status"] == "degraded"
    
    def test_health_check_reflector_disconnected(self, client, mock_cache_service):
        """Test health check when Reflector is disconnected"""
        with patch('app.services.reflector.ReflectorClient') as mock_reflector:
            mock_instance = Mock()
            mock_instance.is_connected.return_value = False
            mock_reflector.return_value = mock_instance
            
            response = client.get("/health")
            
            assert response.status_code == 200
            data = response.json()
            
            assert data["services"]["reflector"] == "disconnected"
            assert data["status"] == "degraded"
    
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
    
    def test_health_check_overall_status_degraded(self, client, mock_reflector_client):
        """Test overall status when some services are unhealthy"""
        with patch('app.services.cache.cache_service') as mock_cache:
            mock_cache.is_connected.return_value = False
            mock_cache.get_stats.return_value = {"status": "disconnected"}
            
            response = client.get("/health")
            
            assert response.status_code == 200
            data = response.json()
            
            assert data["status"] == "degraded"
