"""
Demo data endpoints for testing and demonstration
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.core.database import get_db
from app.models.database import User, Portfolio, RiskAlert, RiskMetrics
from app.api.v1.alerts import create_sample_alerts
from app.api.v1.portfolio.services import PortfolioService
from app.api.v1.portfolio.models import PortfolioCreate
from datetime import datetime, timedelta
import json

router = APIRouter()

@router.post("/portfolio")
async def create_demo_portfolio(db: Session = Depends(get_db)):
    """Create a demo portfolio with sample data for testing"""
    try:
        # Demo wallet address
        demo_wallet = "GDEMO1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        
        # Check if demo user already exists
        existing_user = db.query(User).filter(User.wallet_address == demo_wallet).first()
        if existing_user:
            return {
                "message": "Demo portfolio already exists",
                "wallet_address": demo_wallet,
                "user_id": existing_user.id
            }
        
        # Create demo user
        demo_user = User(
            wallet_address=demo_wallet,
            risk_tolerance=0.5,
            created_at=datetime.utcnow()
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
        
        # Create demo portfolio assets
        demo_assets = [
            {
                "asset_code": "XLM",
                "asset_issuer": None,
                "balance": 50000.0,
                "target_allocation": 40.0
            },
            {
                "asset_code": "USDC",
                "asset_issuer": "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
                "balance": 25000.0,
                "target_allocation": 20.0
            },
            {
                "asset_code": "BTC",
                "asset_issuer": None,
                "balance": 0.5,
                "target_allocation": 30.0
            },
            {
                "asset_code": "ETH",
                "asset_issuer": None,
                "balance": 15.5,
                "target_allocation": 10.0
            }
        ]
        
        # Add assets to portfolio
        for asset_data in demo_assets:
            portfolio_asset = Portfolio(
                user_id=demo_user.id,
                asset_code=asset_data["asset_code"],
                asset_issuer=asset_data["asset_issuer"],
                balance=asset_data["balance"],
                target_allocation=asset_data["target_allocation"]
            )
            db.add(portfolio_asset)
        
        # Create sample risk metrics
        risk_metrics = RiskMetrics(
            user_id=demo_user.id,
            portfolio_value=125430.50,
            var_95=2500.0,
            var_99=3750.0,
            volatility=18.5,
            sharpe_ratio=1.2,
            beta=0.8,
            max_drawdown=12.3,
            calculated_at=datetime.utcnow()
        )
        db.add(risk_metrics)
        
        # Create sample alerts
        await create_sample_alerts(demo_wallet, db)
        
        db.commit()
        
        return {
            "message": "Demo portfolio created successfully",
            "wallet_address": demo_wallet,
            "user_id": demo_user.id,
            "assets_count": len(demo_assets),
            "created_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating demo portfolio: {str(e)}")

@router.delete("/portfolio")
async def clear_demo_data(db: Session = Depends(get_db)):
    """Clear all demo data from the database"""
    try:
        demo_wallet = "GDEMO1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        
        # Find demo user
        demo_user = db.query(User).filter(User.wallet_address == demo_wallet).first()
        if not demo_user:
            return {"message": "No demo data found to clear"}
        
        # Delete related data
        db.query(RiskAlert).filter(RiskAlert.user_id == demo_user.id).delete()
        db.query(RiskMetrics).filter(RiskMetrics.user_id == demo_user.id).delete()
        db.query(Portfolio).filter(Portfolio.user_id == demo_user.id).delete()
        db.query(User).filter(User.id == demo_user.id).delete()
        
        db.commit()
        
        return {
            "message": "Demo data cleared successfully",
            "cleared_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error clearing demo data: {str(e)}")

@router.get("/status")
async def get_demo_status(db: Session = Depends(get_db)):
    """Check if demo data exists"""
    try:
        demo_wallet = "GDEMO1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        
        demo_user = db.query(User).filter(User.wallet_address == demo_wallet).first()
        if not demo_user:
            return {
                "exists": False,
                "message": "Demo data not found"
            }
        
        # Get portfolio info
        portfolio_count = db.query(Portfolio).filter(Portfolio.user_id == demo_user.id).count()
        alerts_count = db.query(RiskAlert).filter(RiskAlert.user_id == demo_user.id).count()
        metrics_count = db.query(RiskMetrics).filter(RiskMetrics.user_id == demo_user.id).count()
        
        return {
            "exists": True,
            "wallet_address": demo_wallet,
            "user_id": demo_user.id,
            "portfolio_assets": portfolio_count,
            "alerts": alerts_count,
            "risk_metrics": metrics_count,
            "created_at": demo_user.created_at.isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking demo status: {str(e)}")

@router.get("/risk")
async def get_demo_risk_analysis(db: Session = Depends(get_db)):
    """Get demo risk analysis data"""
    try:
        demo_wallet = "GDEMO1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        
        # Check if demo user exists
        demo_user = db.query(User).filter(User.wallet_address == demo_wallet).first()
        if not demo_user:
            raise HTTPException(status_code=404, detail="Demo data not found. Please create demo portfolio first.")
        
        # Get latest risk metrics
        latest_metrics = db.query(RiskMetrics).filter(
            RiskMetrics.user_id == demo_user.id
        ).order_by(RiskMetrics.calculated_at.desc()).first()
        
        if not latest_metrics:
            # Create mock risk metrics if none exist
            mock_metrics = RiskMetrics(
                user_id=demo_user.id,
                portfolio_value=100000.0,
                var_95=2500.0,
                var_99=3750.0,
                volatility=18.5,
                sharpe_ratio=1.2,
                beta=0.8,
                max_drawdown=12.3,
                calculated_at=datetime.utcnow()
            )
            db.add(mock_metrics)
            db.commit()
            db.refresh(mock_metrics)
            latest_metrics = mock_metrics
        
        # Generate recommendations
        recommendations = [
            {
                "type": "diversification",
                "priority": "high",
                "title": "Improve Portfolio Diversification",
                "description": "Consider adding more stable assets like USDC to reduce volatility",
                "impact": "Reduce risk by 15-20%"
            },
            {
                "type": "rebalancing",
                "priority": "medium", 
                "title": "Rebalance Portfolio",
                "description": "Current allocation deviates from target. Consider rebalancing XLM position",
                "impact": "Align with target allocation"
            },
            {
                "type": "monitoring",
                "priority": "low",
                "title": "Monitor Market Conditions",
                "description": "Keep an eye on crypto market volatility and adjust accordingly",
                "impact": "Stay informed of market changes"
            }
        ]
        
        return {
            "portfolio_value": latest_metrics.portfolio_value,
            "risk_score": 39.9,
            "var_95": latest_metrics.var_95,
            "var_99": latest_metrics.var_99,
            "volatility": latest_metrics.volatility,
            "sharpe_ratio": latest_metrics.sharpe_ratio,
            "beta": latest_metrics.beta,
            "max_drawdown": latest_metrics.max_drawdown,
            "recommendations": recommendations,
            "calculated_at": latest_metrics.calculated_at.isoformat() + "Z"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting demo risk analysis: {str(e)}")

@router.get("/alerts")
async def get_demo_alerts(db: Session = Depends(get_db)):
    """Get demo alerts data"""
    try:
        demo_wallet = "GDEMO1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        
        # Check if demo user exists
        demo_user = db.query(User).filter(User.wallet_address == demo_wallet).first()
        if not demo_user:
            raise HTTPException(status_code=404, detail="Demo data not found. Please create demo portfolio first.")
        
        # Get active alerts
        alerts = db.query(RiskAlert).filter(
            RiskAlert.user_id == demo_user.id,
            RiskAlert.is_active == True
        ).order_by(RiskAlert.triggered_at.desc()).all()
        
        alerts_data = []
        for alert in alerts:
            alerts_data.append({
                "id": alert.id,
                "alert_type": alert.alert_type,
                "severity": alert.severity,
                "message": alert.message,
                "triggered_at": alert.triggered_at.isoformat() + "Z",
                "is_active": alert.is_active
            })
        
        return {
            "alerts": alerts_data,
            "total_count": len(alerts_data),
            "active_count": len(alerts_data)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting demo alerts: {str(e)}")
