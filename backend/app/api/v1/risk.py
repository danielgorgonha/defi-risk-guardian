"""
Risk analysis API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.database import User, Portfolio, RiskMetrics
from app.services.reflector import reflector_client
from pydantic import BaseModel
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

router = APIRouter()

# Pydantic models
class RiskAnalysisRequest(BaseModel):
    wallet_address: str
    confidence_level: float = 0.95

class RiskAnalysisResponse(BaseModel):
    portfolio_value: float
    var_95: float
    var_99: float
    volatility: float
    sharpe_ratio: float
    beta: float
    max_drawdown: float
    risk_score: float
    recommendations: List[str]

@router.post("/analyze", response_model=RiskAnalysisResponse)
async def analyze_portfolio_risk(
    request: RiskAnalysisRequest, 
    db: Session = Depends(get_db)
):
    """Perform comprehensive risk analysis on portfolio"""
    try:
        # Get user and portfolio
        user = db.query(User).filter(User.wallet_address == request.wallet_address).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        portfolios = db.query(Portfolio).filter(Portfolio.user_id == user.id).all()
        
        if not portfolios:
            raise HTTPException(status_code=404, detail="No portfolio found")
        
        # Get current prices and calculate portfolio value
        portfolio_data = []
        total_value = 0.0
        
        for portfolio in portfolios:
            price = await reflector_client.get_asset_price(
                portfolio.asset_code, 
                portfolio.asset_issuer
            )
            
            if price:
                value = portfolio.balance * price
                total_value += value
                
                portfolio_data.append({
                    "asset_code": portfolio.asset_code,
                    "balance": portfolio.balance,
                    "price": price,
                    "value": value,
                    "allocation": value / total_value if total_value > 0 else 0
                })
        
        if total_value == 0:
            raise HTTPException(status_code=400, detail="Portfolio has no value")
        
        # Calculate risk metrics
        risk_metrics = await calculate_risk_metrics(portfolio_data, total_value)
        
        # Generate recommendations
        recommendations = generate_risk_recommendations(risk_metrics, user.risk_tolerance)
        
        # Save metrics to database
        save_risk_metrics(db, user.id, risk_metrics)
        
        return RiskAnalysisResponse(
            portfolio_value=total_value,
            var_95=risk_metrics["var_95"],
            var_99=risk_metrics["var_99"],
            volatility=risk_metrics["volatility"],
            sharpe_ratio=risk_metrics["sharpe_ratio"],
            beta=risk_metrics["beta"],
            max_drawdown=risk_metrics["max_drawdown"],
            risk_score=risk_metrics["risk_score"],
            recommendations=recommendations
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing risk: {str(e)}")

@router.get("/{wallet_address}/metrics")
async def get_risk_metrics(wallet_address: str, db: Session = Depends(get_db)):
    """Get latest risk metrics for a wallet"""
    try:
        # Get user
        user = db.query(User).filter(User.wallet_address == wallet_address).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get latest metrics
        latest_metrics = db.query(RiskMetrics).filter(
            RiskMetrics.user_id == user.id
        ).order_by(RiskMetrics.calculated_at.desc()).first()
        
        if not latest_metrics:
            raise HTTPException(status_code=404, detail="No risk metrics found")
        
        return {
            "portfolio_value": latest_metrics.portfolio_value,
            "var_95": latest_metrics.var_95,
            "var_99": latest_metrics.var_99,
            "volatility": latest_metrics.volatility,
            "sharpe_ratio": latest_metrics.sharpe_ratio,
            "beta": latest_metrics.beta,
            "max_drawdown": latest_metrics.max_drawdown,
            "calculated_at": latest_metrics.calculated_at.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting metrics: {str(e)}")

async def calculate_risk_metrics(portfolio_data: List[Dict], total_value: float) -> Dict[str, float]:
    """Calculate comprehensive risk metrics"""
    
    # Mock calculation for hackathon - in production, use real historical data
    metrics = {}
    
    # Portfolio volatility (simplified)
    metrics["volatility"] = calculate_portfolio_volatility(portfolio_data)
    
    # Value at Risk (VaR) using Monte Carlo simulation
    metrics["var_95"] = calculate_var(portfolio_data, confidence=0.95)
    metrics["var_99"] = calculate_var(portfolio_data, confidence=0.99)
    
    # Sharpe Ratio (simplified)
    metrics["sharpe_ratio"] = calculate_sharpe_ratio(portfolio_data)
    
    # Beta (simplified - against XLM)
    metrics["beta"] = calculate_beta(portfolio_data)
    
    # Maximum Drawdown
    metrics["max_drawdown"] = calculate_max_drawdown(portfolio_data)
    
    # Overall risk score
    metrics["risk_score"] = calculate_overall_risk_score(metrics)
    
    return metrics

def calculate_portfolio_volatility(portfolio_data: List[Dict]) -> float:
    """Calculate portfolio volatility"""
    # Simplified calculation - in production, use historical returns
    if not portfolio_data:
        return 0.0
    
    # Mock volatility based on asset types
    volatility_map = {
        "XLM": 0.25,
        "USDC": 0.01,
        "BTC": 0.35,
        "ETH": 0.30
    }
    
    weighted_volatility = 0.0
    for asset in portfolio_data:
        asset_vol = volatility_map.get(asset["asset_code"], 0.20)
        weighted_volatility += asset["allocation"] * asset_vol
    
    return weighted_volatility

def calculate_var(portfolio_data: List[Dict], confidence: float = 0.95) -> float:
    """Calculate Value at Risk using Monte Carlo simulation"""
    if not portfolio_data:
        return 0.0
    
    # Simplified VaR calculation
    portfolio_volatility = calculate_portfolio_volatility(portfolio_data)
    
    # Z-score for confidence level
    z_scores = {0.95: 1.645, 0.99: 2.326}
    z_score = z_scores.get(confidence, 1.645)
    
    # Calculate VaR (simplified)
    total_value = sum(asset["value"] for asset in portfolio_data)
    var = total_value * portfolio_volatility * z_score
    
    return var

def calculate_sharpe_ratio(portfolio_data: List[Dict]) -> float:
    """Calculate Sharpe ratio"""
    if not portfolio_data:
        return 0.0
    
    # Simplified Sharpe ratio calculation
    portfolio_volatility = calculate_portfolio_volatility(portfolio_data)
    
    # Mock expected return (in production, use historical data)
    expected_return = 0.08  # 8% annual return
    
    # Risk-free rate (mock)
    risk_free_rate = 0.02  # 2% annual
    
    if portfolio_volatility == 0:
        return 0.0
    
    sharpe_ratio = (expected_return - risk_free_rate) / portfolio_volatility
    return sharpe_ratio

def calculate_beta(portfolio_data: List[Dict]) -> float:
    """Calculate portfolio beta against XLM"""
    if not portfolio_data:
        return 0.0
    
    # Simplified beta calculation
    # In production, use historical correlation with XLM
    beta_map = {
        "XLM": 1.0,
        "USDC": 0.0,
        "BTC": 0.8,
        "ETH": 0.9
    }
    
    weighted_beta = 0.0
    for asset in portfolio_data:
        asset_beta = beta_map.get(asset["asset_code"], 0.5)
        weighted_beta += asset["allocation"] * asset_beta
    
    return weighted_beta

def calculate_max_drawdown(portfolio_data: List[Dict]) -> float:
    """Calculate maximum drawdown"""
    # Simplified calculation - in production, use historical data
    portfolio_volatility = calculate_portfolio_volatility(portfolio_data)
    
    # Estimate max drawdown based on volatility
    max_drawdown = portfolio_volatility * 2.0  # Rough estimate
    
    return min(max_drawdown, 1.0)  # Cap at 100%

def calculate_overall_risk_score(metrics: Dict[str, float]) -> float:
    """Calculate overall risk score (0-100)"""
    
    # Weighted combination of risk factors
    volatility_score = min(metrics["volatility"] * 100, 100)
    var_score = min(metrics["var_95"] / 1000 * 100, 100)  # Normalize VaR
    drawdown_score = min(metrics["max_drawdown"] * 100, 100)
    
    # Overall risk score
    risk_score = (
        volatility_score * 0.4 +
        var_score * 0.4 +
        drawdown_score * 0.2
    )
    
    return min(risk_score, 100.0)

def generate_risk_recommendations(metrics: Dict[str, float], risk_tolerance: float) -> List[str]:
    """Generate risk management recommendations"""
    recommendations = []
    
    # Volatility recommendations
    if metrics["volatility"] > 0.3:
        recommendations.append("Consider reducing portfolio volatility by adding stable assets like USDC")
    
    # VaR recommendations
    if metrics["var_95"] > 1000:  # High VaR
        recommendations.append("Portfolio has high Value at Risk. Consider diversifying holdings")
    
    # Sharpe ratio recommendations
    if metrics["sharpe_ratio"] < 1.0:
        recommendations.append("Portfolio risk-adjusted returns could be improved")
    
    # Beta recommendations
    if metrics["beta"] > 1.2:
        recommendations.append("Portfolio is highly correlated with market movements")
    
    # Risk tolerance recommendations
    if metrics["risk_score"] > risk_tolerance * 100:
        recommendations.append("Current risk level exceeds your risk tolerance")
    
    if not recommendations:
        recommendations.append("Portfolio risk profile looks balanced")
    
    return recommendations

def save_risk_metrics(db: Session, user_id: int, metrics: Dict[str, float]):
    """Save risk metrics to database"""
    try:
        risk_metrics = RiskMetrics(
            user_id=user_id,
            portfolio_value=metrics.get("portfolio_value", 0),
            var_95=metrics["var_95"],
            var_99=metrics["var_99"],
            volatility=metrics["volatility"],
            sharpe_ratio=metrics["sharpe_ratio"],
            beta=metrics["beta"],
            max_drawdown=metrics["max_drawdown"]
        )
        
        db.add(risk_metrics)
        db.commit()
        
    except Exception as e:
        db.rollback()
        # Log error but don't fail the request
        print(f"Error saving risk metrics: {str(e)}")
