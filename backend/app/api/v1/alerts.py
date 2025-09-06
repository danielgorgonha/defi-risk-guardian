"""
Alerts API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.database import User, RiskAlert
from pydantic import BaseModel
from datetime import datetime, timedelta

router = APIRouter()

# Pydantic models
class AlertResponse(BaseModel):
    id: int
    alert_type: str
    severity: str
    message: str
    triggered_at: datetime
    is_active: bool

class AlertCreate(BaseModel):
    alert_type: str
    severity: str
    message: str

@router.get("/{wallet_address}", response_model=List[AlertResponse])
async def get_alerts(wallet_address: str, db: Session = Depends(get_db)):
    """Get all alerts for a wallet"""
    try:
        # Get user
        user = db.query(User).filter(User.wallet_address == wallet_address).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get alerts
        alerts = db.query(RiskAlert).filter(
            RiskAlert.user_id == user.id
        ).order_by(RiskAlert.triggered_at.desc()).limit(50).all()
        
        return [
            AlertResponse(
                id=alert.id,
                alert_type=alert.alert_type,
                severity=alert.severity,
                message=alert.message,
                triggered_at=alert.triggered_at,
                is_active=alert.is_active
            )
            for alert in alerts
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting alerts: {str(e)}")

@router.get("/{wallet_address}/active", response_model=List[AlertResponse])
async def get_active_alerts(wallet_address: str, db: Session = Depends(get_db)):
    """Get only active alerts for a wallet"""
    try:
        # Get user
        user = db.query(User).filter(User.wallet_address == wallet_address).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get active alerts
        alerts = db.query(RiskAlert).filter(
            RiskAlert.user_id == user.id,
            RiskAlert.is_active == True
        ).order_by(RiskAlert.triggered_at.desc()).all()
        
        return [
            AlertResponse(
                id=alert.id,
                alert_type=alert.alert_type,
                severity=alert.severity,
                message=alert.message,
                triggered_at=alert.triggered_at,
                is_active=alert.is_active
            )
            for alert in alerts
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting active alerts: {str(e)}")

@router.post("/{wallet_address}")
async def create_alert(
    wallet_address: str, 
    alert_data: AlertCreate, 
    db: Session = Depends(get_db)
):
    """Create a new alert"""
    try:
        # Get user
        user = db.query(User).filter(User.wallet_address == wallet_address).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Create alert
        new_alert = RiskAlert(
            user_id=user.id,
            alert_type=alert_data.alert_type,
            severity=alert_data.severity,
            message=alert_data.message
        )
        
        db.add(new_alert)
        db.commit()
        db.refresh(new_alert)
        
        return {
            "message": "Alert created successfully",
            "alert_id": new_alert.id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating alert: {str(e)}")

@router.patch("/{alert_id}/resolve")
async def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    """Mark an alert as resolved"""
    try:
        # Get alert
        alert = db.query(RiskAlert).filter(RiskAlert.id == alert_id).first()
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        # Mark as resolved
        alert.is_active = False
        alert.resolved_at = datetime.utcnow()
        
        db.commit()
        
        return {"message": "Alert resolved successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error resolving alert: {str(e)}")

@router.delete("/{alert_id}")
async def delete_alert(alert_id: int, db: Session = Depends(get_db)):
    """Delete an alert"""
    try:
        # Get alert
        alert = db.query(RiskAlert).filter(RiskAlert.id == alert_id).first()
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        # Delete alert
        db.delete(alert)
        db.commit()
        
        return {"message": "Alert deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting alert: {str(e)}")

@router.get("/{wallet_address}/stats")
async def get_alert_stats(wallet_address: str, db: Session = Depends(get_db)):
    """Get alert statistics for a wallet"""
    try:
        # Get user
        user = db.query(User).filter(User.wallet_address == wallet_address).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get alert counts by type and severity
        alerts = db.query(RiskAlert).filter(RiskAlert.user_id == user.id).all()
        
        stats = {
            "total_alerts": len(alerts),
            "active_alerts": len([a for a in alerts if a.is_active]),
            "resolved_alerts": len([a for a in alerts if not a.is_active]),
            "by_type": {},
            "by_severity": {}
        }
        
        # Count by type
        for alert in alerts:
            alert_type = alert.alert_type
            if alert_type not in stats["by_type"]:
                stats["by_type"][alert_type] = 0
            stats["by_type"][alert_type] += 1
        
        # Count by severity
        for alert in alerts:
            severity = alert.severity
            if severity not in stats["by_severity"]:
                stats["by_severity"][severity] = 0
            stats["by_severity"][severity] += 1
        
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting alert stats: {str(e)}")

# Mock function to create sample alerts for demo
async def create_sample_alerts(wallet_address: str, db: Session):
    """Create sample alerts for demonstration"""
    try:
        # Get user
        user = db.query(User).filter(User.wallet_address == wallet_address).first()
        if not user:
            return
        
        # Sample alerts
        sample_alerts = [
            {
                "alert_type": "volatility",
                "severity": "medium",
                "message": "High volatility detected in XLM (15% in 1 hour)"
            },
            {
                "alert_type": "liquidation",
                "severity": "high",
                "message": "Risk of liquidation detected. Consider adding collateral"
            },
            {
                "alert_type": "anomaly",
                "severity": "low",
                "message": "Unusual price movement detected in BTC"
            },
            {
                "alert_type": "rebalance",
                "severity": "medium",
                "message": "Portfolio allocation deviates from target by 12%"
            }
        ]
        
        for alert_data in sample_alerts:
            alert = RiskAlert(
                user_id=user.id,
                alert_type=alert_data["alert_type"],
                severity=alert_data["severity"],
                message=alert_data["message"],
                triggered_at=datetime.utcnow() - timedelta(hours=1, minutes=30)
            )
            db.add(alert)
        
        db.commit()
        
    except Exception as e:
        db.rollback()
        print(f"Error creating sample alerts: {str(e)}")
