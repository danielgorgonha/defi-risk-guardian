"""
Unit tests for alerts CRUD operations
"""
import pytest
from unittest.mock import patch, Mock
from fastapi.testclient import TestClient

from app.main import app
from app.models.database import User, RiskAlert

@pytest.mark.unit
class TestAlertsCRUD:
    """Test alerts CRUD operations"""
    
    def test_get_alerts_success(self, client, sample_user_data, sample_alert_data):
        """Test successful alerts retrieval"""
        # Create user first
        user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        user_id = user_response.json()["user_id"]
        
        # Create alert
        alert_data = {
            **sample_alert_data,
            "user_id": user_id
        }
        client.post(f"/api/v1/alerts/{sample_user_data['wallet_address']}", json=alert_data)
        
        # Get alerts
        response = client.get(f"/api/v1/alerts/{sample_user_data['wallet_address']}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) > 0
        
        alert = data[0]
        assert "id" in alert
        assert "alert_type" in alert
        assert "severity" in alert
        assert "message" in alert
        assert "triggered_at" in alert
        assert "is_active" in alert
    
    def test_get_alerts_user_not_found(self, client, sample_wallet_address):
        """Test alerts retrieval for non-existent user"""
        response = client.get(f"/api/v1/alerts/{sample_wallet_address}")
        
        assert response.status_code == 404
        data = response.json()
        
        assert "detail" in data
        assert "User not found" in data["detail"]
    
    def test_get_active_alerts_success(self, client, sample_user_data, sample_alert_data):
        """Test successful active alerts retrieval"""
        # Create user first
        user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        user_id = user_response.json()["user_id"]
        
        # Create active alert
        alert_data = {
            **sample_alert_data,
            "user_id": user_id,
            "is_active": True
        }
        client.post(f"/api/v1/alerts/{sample_user_data['wallet_address']}", json=alert_data)
        
        # Get active alerts
        response = client.get(f"/api/v1/alerts/{sample_user_data['wallet_address']}/active")
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) > 0
        
        # All returned alerts should be active
        for alert in data:
            assert alert["is_active"] is True
    
    def test_get_active_alerts_user_not_found(self, client, sample_wallet_address):
        """Test active alerts retrieval for non-existent user"""
        response = client.get(f"/api/v1/alerts/{sample_wallet_address}/active")
        
        assert response.status_code == 404
        data = response.json()
        
        assert "detail" in data
        assert "User not found" in data["detail"]
    
    def test_create_alert_success(self, client, sample_user_data, sample_alert_data):
        """Test successful alert creation"""
        # Create user first
        user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        user_id = user_response.json()["user_id"]
        
        # Create alert
        alert_data = {
            **sample_alert_data,
            "user_id": user_id
        }
        response = client.post(f"/api/v1/alerts/{sample_user_data['wallet_address']}", json=alert_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        assert "alert_id" in data
        assert data["message"] == "Alert created successfully"
    
    def test_create_alert_user_not_found(self, client, sample_alert_data, sample_wallet_address):
        """Test alert creation for non-existent user"""
        alert_data = {
            **sample_alert_data,
            "user_id": "non-existent-id"
        }
        
        response = client.post(f"/api/v1/alerts/{sample_wallet_address}", json=alert_data)
        
        assert response.status_code == 404
        data = response.json()
        
        assert "detail" in data
        assert "User not found" in data["detail"]
    
    def test_create_alert_invalid_data(self, client, sample_user_data):
        """Test alert creation with invalid data"""
        # Create user first
        user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        user_id = user_response.json()["user_id"]
        
        # Invalid alert data
        invalid_alert_data = {
            "user_id": user_id,
            "alert_type": "",  # Empty alert type
            "severity": "invalid_severity",  # Invalid severity
            "message": "",  # Empty message
            "threshold": -1  # Invalid threshold
        }
        
        response = client.post(f"/api/v1/alerts/{sample_user_data['wallet_address']}", json=invalid_alert_data)
        
        # Should still create alert (validation happens at model level)
        assert response.status_code == 200
    
    def test_delete_alert_success(self, client, sample_user_data, sample_alert_data):
        """Test successful alert deletion"""
        # Create user first
        user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        user_id = user_response.json()["user_id"]
        
        # Create alert
        alert_data = {
            **sample_alert_data,
            "user_id": user_id
        }
        alert_response = client.post(f"/api/v1/alerts/{sample_user_data['wallet_address']}", json=alert_data)
        alert_id = alert_response.json()["alert_id"]
        
        # Delete alert
        response = client.delete(f"/api/v1/alerts/{alert_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        assert data["message"] == "Alert deleted successfully"
    
    def test_delete_alert_not_found(self, client):
        """Test alert deletion for non-existent alert"""
        response = client.delete("/api/v1/alerts/non-existent-id")
        
        assert response.status_code == 404
        data = response.json()
        
        assert "detail" in data
        assert "Alert not found" in data["detail"]
    
    def test_get_alert_stats_success(self, client, sample_user_data, sample_alert_data):
        """Test successful alert statistics retrieval"""
        # Create user first
        user_response = client.post("/api/v1/portfolio/users", json=sample_user_data)
        user_id = user_response.json()["user_id"]
        
        # Create multiple alerts with different severities
        alert_types = ["high_volatility", "rebalance_needed", "liquidity_risk"]
        severities = ["warning", "info", "critical"]
        
        for alert_type, severity in zip(alert_types, severities):
            alert_data = {
                **sample_alert_data,
                "user_id": user_id,
                "alert_type": alert_type,
                "severity": severity
            }
            client.post(f"/api/v1/alerts/{sample_user_data['wallet_address']}", json=alert_data)
        
        # Get alert stats
        response = client.get(f"/api/v1/alerts/{sample_user_data['wallet_address']}/stats")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "total_alerts" in data
        assert "active_alerts" in data
        assert "severity_breakdown" in data
        assert "alert_type_breakdown" in data
        
        assert data["total_alerts"] >= 3
        assert data["active_alerts"] >= 0
        assert len(data["severity_breakdown"]) > 0
        assert len(data["alert_type_breakdown"]) > 0
    
    def test_get_alert_stats_user_not_found(self, client, sample_wallet_address):
        """Test alert statistics retrieval for non-existent user"""
        response = client.get(f"/api/v1/alerts/{sample_wallet_address}/stats")
        
        assert response.status_code == 404
        data = response.json()
        
        assert "detail" in data
        assert "User not found" in data["detail"]
