"""
Risk analysis API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.database import User, Portfolio, RiskMetrics
from app.services.stellar_oracle import stellar_oracle_client
from app.services.ai_portfolio_analyzer import ai_analyzer
# Demo utils removed - now handled in frontend
from pydantic import BaseModel, Field
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models
class RiskAnalysisRequest(BaseModel):
    wallet_address: str
    confidence_level: float = Field(default=0.95, ge=0.0, le=1.0)

class RiskAnalysisResponse(BaseModel):
    portfolio_value: float
    var_95: float
    var_99: float
    cvar_95: float
    volatility: float
    sharpe_ratio: float
    sortino_ratio: float
    beta: float
    max_drawdown: float
    risk_score: float
    diversification_ratio: float
    tail_risk: float
    recommendations: List[str]

class PricePredictionPoint(BaseModel):
    timestamp: str
    predicted_price: float
    confidence_interval: float

class AssetPrediction(BaseModel):
    asset_code: str
    current_price: float
    trend: str
    confidence: float
    support_level: float
    resistance_level: float
    predictions: List[PricePredictionPoint]

class AIRecommendation(BaseModel):
    type: str
    priority: str
    asset_code: str
    current_allocation: float
    recommended_allocation: float
    reason: str
    expected_impact: Dict[str, float]

class AIAnalysisResponse(BaseModel):
    risk_metrics: RiskAnalysisResponse
    price_predictions: List[AssetPrediction]
    ai_recommendations: List[AIRecommendation]

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
            raise HTTPException(status_code=404, detail="No portfolio found for user")
        
        # Prepare asset data for AI analysis
        portfolio_assets = []
        for portfolio in portfolios:
            portfolio_assets.append({
                "asset_code": portfolio.asset_code,
                "asset_issuer": portfolio.asset_issuer,
                "balance": portfolio.balance
            })
        
        # Use AI analyzer for comprehensive analysis
        risk_metrics, _, _ = await ai_analyzer.analyze_portfolio(portfolio_assets)
        
        # Convert to legacy format recommendations
        recommendations = []
        if risk_metrics.risk_score > 80:
            recommendations.append("High risk detected. Consider portfolio rebalancing.")
        if risk_metrics.diversification_ratio < 1.2:
            recommendations.append("Portfolio lacks diversification. Consider adding different asset classes.")
        if risk_metrics.volatility > 0.4:
            recommendations.append("High volatility detected. Consider adding stable assets.")
        if not recommendations:
            recommendations.append("Portfolio risk profile appears balanced.")
        
        # Save enhanced metrics to database
        enhanced_risk_metrics = {
            "portfolio_value": risk_metrics.portfolio_value,
            "var_95": risk_metrics.var_95,
            "var_99": risk_metrics.var_99,
            "volatility": risk_metrics.volatility,
            "sharpe_ratio": risk_metrics.sharpe_ratio,
            "beta": risk_metrics.beta,
            "max_drawdown": risk_metrics.max_drawdown
        }
        save_risk_metrics(db, user.id, enhanced_risk_metrics)
        
        return RiskAnalysisResponse(
            portfolio_value=risk_metrics.portfolio_value,
            var_95=risk_metrics.var_95,
            var_99=risk_metrics.var_99,
            cvar_95=risk_metrics.cvar_95,
            volatility=risk_metrics.volatility,
            sharpe_ratio=risk_metrics.sharpe_ratio,
            sortino_ratio=risk_metrics.sortino_ratio,
            beta=risk_metrics.beta,
            max_drawdown=risk_metrics.max_drawdown,
            risk_score=risk_metrics.risk_score,
            diversification_ratio=risk_metrics.diversification_ratio,
            tail_risk=risk_metrics.tail_risk,
            recommendations=recommendations
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing risk: {str(e)}")

@router.post("/ai-analysis", response_model=AIAnalysisResponse)
async def comprehensive_ai_analysis(
    request_data: RiskAnalysisRequest,
    db: Session = Depends(get_db)
):
    """Perform comprehensive AI analysis including risk, predictions, and recommendations"""
    try:
        # Debug logging
        logger.info(f"AI Analysis endpoint called with wallet: {request_data.wallet_address}")
        
        # Get user and portfolio
        user = db.query(User).filter(User.wallet_address == request_data.wallet_address).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        portfolios = db.query(Portfolio).filter(Portfolio.user_id == user.id).all()
        
        if not portfolios:
            raise HTTPException(status_code=404, detail="No portfolio found for user")
        
        # Prepare asset data for AI analysis
        portfolio_assets = []
        for portfolio in portfolios:
            portfolio_assets.append({
                "asset_code": portfolio.asset_code,
                "asset_issuer": portfolio.asset_issuer,
                "balance": portfolio.balance
            })
        
        # Perform comprehensive AI analysis
        risk_metrics, price_predictions, ai_recommendations = await ai_analyzer.analyze_portfolio(portfolio_assets)
        
        # Convert risk metrics to response format
        recommendations = []
        if risk_metrics.risk_score > 80:
            recommendations.append("High risk detected. Consider portfolio rebalancing.")
        if risk_metrics.diversification_ratio < 1.2:
            recommendations.append("Portfolio lacks diversification. Consider adding different asset classes.")
        if risk_metrics.volatility > 0.4:
            recommendations.append("High volatility detected. Consider adding stable assets.")
        if not recommendations:
            recommendations.append("Portfolio risk profile appears balanced.")
        
        risk_response = RiskAnalysisResponse(
            portfolio_value=risk_metrics.portfolio_value,
            var_95=risk_metrics.var_95,
            var_99=risk_metrics.var_99,
            cvar_95=risk_metrics.cvar_95,
            volatility=risk_metrics.volatility,
            sharpe_ratio=risk_metrics.sharpe_ratio,
            sortino_ratio=risk_metrics.sortino_ratio,
            beta=risk_metrics.beta,
            max_drawdown=risk_metrics.max_drawdown,
            risk_score=risk_metrics.risk_score,
            diversification_ratio=risk_metrics.diversification_ratio,
            tail_risk=risk_metrics.tail_risk,
            recommendations=recommendations
        )
        
        # Convert price predictions
        prediction_responses = []
        for prediction in price_predictions:
            prediction_points = []
            for timestamp, price, confidence in prediction.predicted_prices:
                prediction_points.append(PricePredictionPoint(
                    timestamp=timestamp.isoformat(),
                    predicted_price=price,
                    confidence_interval=confidence
                ))
            
            prediction_responses.append(AssetPrediction(
                asset_code=prediction.asset_code,
                current_price=prediction.current_price,
                trend=prediction.trend,
                confidence=prediction.confidence,
                support_level=prediction.support_level,
                resistance_level=prediction.resistance_level,
                predictions=prediction_points
            ))
        
        # Convert AI recommendations
        recommendation_responses = []
        for rec in ai_recommendations:
            recommendation_responses.append(AIRecommendation(
                type=rec.type,
                priority=rec.priority,
                asset_code=rec.asset_code,
                current_allocation=rec.current_allocation,
                recommended_allocation=rec.recommended_allocation,
                reason=rec.reason,
                expected_impact=rec.expected_impact
            ))
        
        # Save enhanced metrics to database
        enhanced_risk_metrics = {
            "portfolio_value": risk_metrics.portfolio_value,
            "var_95": risk_metrics.var_95,
            "var_99": risk_metrics.var_99,
            "volatility": risk_metrics.volatility,
            "sharpe_ratio": risk_metrics.sharpe_ratio,
            "beta": risk_metrics.beta,
            "max_drawdown": risk_metrics.max_drawdown
        }
        save_risk_metrics(db, user.id, enhanced_risk_metrics)
        
        return AIAnalysisResponse(
            risk_metrics=risk_response,
            price_predictions=prediction_responses,
            ai_recommendations=recommendation_responses
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in AI analysis: {str(e)}")

@router.post("/anomaly-detection")
async def detect_anomalies(asset_codes: List[str]):
    """Detect price anomalies for specific assets using AI"""
    try:
        if not asset_codes:
            raise HTTPException(status_code=400, detail="Asset codes list cannot be empty")
        
        # Limit to max 10 assets to prevent abuse
        if len(asset_codes) > 10:
            raise HTTPException(status_code=400, detail="Maximum 10 assets allowed per request")
        
        # Run anomaly detection
        anomaly_results = await ai_analyzer.detect_market_anomalies(asset_codes)
        
        return {
            "anomaly_detection_results": anomaly_results,
            "total_assets_analyzed": len(asset_codes),
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in anomaly detection: {str(e)}")

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
        # Convert numpy types to Python float to avoid database serialization issues
        def convert_to_float(value):
            if hasattr(value, 'item'):  # numpy scalar
                return float(value.item())
            return float(value)
        
        risk_metrics = RiskMetrics(
            user_id=user_id,
            portfolio_value=convert_to_float(metrics.get("portfolio_value", 0)),
            var_95=convert_to_float(metrics["var_95"]),
            var_99=convert_to_float(metrics["var_99"]),
            volatility=convert_to_float(metrics["volatility"]),
            sharpe_ratio=convert_to_float(metrics["sharpe_ratio"]),
            beta=convert_to_float(metrics["beta"]),
            max_drawdown=convert_to_float(metrics["max_drawdown"])
        )
        
        db.add(risk_metrics)
        db.commit()
        
    except Exception as e:
        db.rollback()
        # Log error but don't fail the request
        print(f"Error saving risk metrics: {str(e)}")
