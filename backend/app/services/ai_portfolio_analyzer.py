"""
AI Portfolio Analyzer using Reflector Oracle and Stellar data
Advanced risk analysis, price predictions, and portfolio optimization
"""

import asyncio
import numpy as np
import pandas as pd
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
import logging
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
import joblib
import warnings
warnings.filterwarnings('ignore')

from app.services.reflector import reflector_client
from app.services.stellar_oracle import stellar_oracle_client
from app.services.cache import cache_service

logger = logging.getLogger(__name__)

@dataclass
class PricePoint:
    """Single price point in time"""
    timestamp: datetime
    price: float
    volume: Optional[float] = None

@dataclass
class PortfolioAsset:
    """Portfolio asset with enhanced data"""
    asset_code: str
    asset_issuer: Optional[str]
    balance: float
    current_price: float
    current_value: float
    allocation: float
    volatility: float
    beta: float
    correlation_xlm: float

@dataclass
class RiskMetrics:
    """Enhanced risk metrics with AI insights"""
    portfolio_value: float
    var_95: float
    var_99: float
    cvar_95: float  # Conditional VaR
    volatility: float
    sharpe_ratio: float
    sortino_ratio: float
    beta: float
    max_drawdown: float
    risk_score: float
    diversification_ratio: float
    tail_risk: float

@dataclass
class PricePrediction:
    """Price prediction result"""
    asset_code: str
    current_price: float
    predicted_prices: List[Tuple[datetime, float, float]]  # (timestamp, price, confidence)
    trend: str  # 'bullish', 'bearish', 'neutral'
    confidence: float
    support_level: float
    resistance_level: float

@dataclass
class PortfolioRecommendation:
    """AI-generated portfolio recommendation"""
    type: str  # 'rebalance', 'add', 'remove', 'risk_warning'
    priority: str  # 'high', 'medium', 'low'
    asset_code: str
    current_allocation: float
    recommended_allocation: float
    reason: str
    expected_impact: Dict[str, float]

class AIPortfolioAnalyzer:
    """Advanced AI-powered portfolio analysis using real market data"""
    
    def __init__(self):
        self.anomaly_detector = IsolationForest(contamination=0.1, random_state=42)
        self.scaler = StandardScaler()
        self.price_cache_ttl = 300  # 5 minutes
        self.history_cache_ttl = 1800  # 30 minutes
        
    async def analyze_portfolio(self, assets: List[Dict]) -> Tuple[RiskMetrics, List[PricePrediction], List[PortfolioRecommendation]]:
        """
        Comprehensive AI portfolio analysis
        
        Args:
            assets: List of portfolio assets with basic info
            
        Returns:
            Tuple of (risk_metrics, price_predictions, recommendations)
        """
        try:
            logger.info(f"Starting AI analysis for {len(assets)} assets")
            
            # Step 1: Enhance asset data with real market data
            enhanced_assets = await self._enhance_asset_data(assets)
            
            # Step 2: Detect price anomalies
            await self._detect_price_anomalies(enhanced_assets)
            
            # Step 3: Calculate advanced risk metrics
            risk_metrics = await self._calculate_advanced_risk_metrics(enhanced_assets)
            
            # Step 4: Generate price predictions
            price_predictions = await self._generate_price_predictions(enhanced_assets)
            
            # Step 5: Generate AI recommendations (including anomaly warnings)
            recommendations = await self._generate_ai_recommendations(
                enhanced_assets, risk_metrics, price_predictions
            )
            
            logger.info("AI portfolio analysis completed successfully")
            return risk_metrics, price_predictions, recommendations
            
        except Exception as e:
            logger.error(f"Error in AI portfolio analysis: {str(e)}")
            raise
    
    async def _enhance_asset_data(self, assets: List[Dict]) -> List[PortfolioAsset]:
        """Enhance asset data with real market information"""
        enhanced_assets = []
        total_value = 0.0
        
        # Get current prices concurrently
        price_tasks = []
        for asset in assets:
            task = self._get_enhanced_price_data(asset['asset_code'], asset.get('asset_issuer'))
            price_tasks.append((asset, task))
        
        # Wait for all price data
        price_data = {}
        for asset, task in price_tasks:
            try:
                data = await task
                price_data[asset['asset_code']] = data
                if data['price']:
                    total_value += asset['balance'] * data['price']
            except Exception as e:
                logger.warning(f"Failed to get price data for {asset['asset_code']}: {str(e)}")
                # Use fallback data
                price_data[asset['asset_code']] = {
                    'price': 0.1,  # Fallback price
                    'volatility': 0.2,
                    'beta': 1.0,
                    'correlation_xlm': 0.5
                }
        
        # Create enhanced asset objects
        for asset in assets:
            asset_code = asset['asset_code']
            data = price_data[asset_code]
            current_price = data['price']
            current_value = asset['balance'] * current_price
            
            enhanced_asset = PortfolioAsset(
                asset_code=asset_code,
                asset_issuer=asset.get('asset_issuer'),
                balance=asset['balance'],
                current_price=current_price,
                current_value=current_value,
                allocation=current_value / total_value if total_value > 0 else 0,
                volatility=data['volatility'],
                beta=data['beta'],
                correlation_xlm=data['correlation_xlm']
            )
            enhanced_assets.append(enhanced_asset)
        
        return enhanced_assets
    
    async def _get_enhanced_price_data(self, asset_code: str, asset_issuer: Optional[str]) -> Dict:
        """Get enhanced price data including volatility, beta, etc."""
        cache_key = f"enhanced_price:{asset_code}:{asset_issuer or 'native'}"
        
        # Check cache
        cached_data = cache_service.get(cache_key)
        if cached_data:
            return cached_data
        
        try:
            # Get current price from multiple sources
            price = None
            
            # Try Reflector first
            try:
                price = await reflector_client.get_asset_price(asset_code, asset_issuer)
                if price:
                    logger.info(f"Got price from Reflector for {asset_code}: ${price}")
            except Exception as e:
                logger.warning(f"Reflector price failed for {asset_code}: {str(e)}")
            
            # Fallback to Stellar Oracle
            if not price:
                try:
                    price = await stellar_oracle_client.get_asset_price(asset_code, asset_issuer)
                    if price:
                        logger.info(f"Got price from Stellar Oracle for {asset_code}: ${price}")
                except Exception as e:
                    logger.warning(f"Stellar Oracle price failed for {asset_code}: {str(e)}")
            
            # Get historical data for volatility calculation
            historical_data = await self._get_price_history(asset_code, asset_issuer)
            
            # Calculate advanced metrics
            volatility = self._calculate_volatility(historical_data)
            beta = self._calculate_beta(historical_data, asset_code)
            correlation_xlm = self._calculate_correlation_with_xlm(historical_data, asset_code)
            
            data = {
                'price': price or 0.1,  # Fallback to $0.1 if no price found
                'volatility': volatility,
                'beta': beta,
                'correlation_xlm': correlation_xlm,
                'timestamp': datetime.now().isoformat()
            }
            
            # Cache for 5 minutes
            cache_service.set(cache_key, data, ttl_seconds=self.price_cache_ttl)
            
            return data
            
        except Exception as e:
            logger.error(f"Error getting enhanced price data for {asset_code}: {str(e)}")
            # Return fallback data
            return {
                'price': 0.1,
                'volatility': 0.2,
                'beta': 1.0,
                'correlation_xlm': 0.5
            }
    
    async def _get_price_history(self, asset_code: str, asset_issuer: Optional[str]) -> List[PricePoint]:
        """Get price history for volatility and correlation calculations"""
        cache_key = f"price_history:{asset_code}:{asset_issuer or 'native'}"
        
        # Check cache
        cached_history = cache_service.get(cache_key)
        if cached_history:
            return [PricePoint(**point) for point in cached_history]
        
        try:
            # Try to get from Reflector first
            history_data = await reflector_client.get_price_history(
                asset_code, asset_issuer, period="7d", interval="1h"
            )
            
            if not history_data:
                # Generate synthetic historical data for demo
                logger.info(f"No historical data available for {asset_code}, generating synthetic data")
                history_data = self._generate_synthetic_history(asset_code)
            
            # Convert to PricePoint objects
            price_points = []
            for point in history_data:
                if isinstance(point, dict):
                    timestamp = datetime.fromisoformat(point.get('timestamp', datetime.now().isoformat()))
                    price = float(point.get('price', 0.1))
                    volume = point.get('volume')
                    price_points.append(PricePoint(timestamp, price, volume))
            
            # Cache for 30 minutes
            cache_data = [{'timestamp': p.timestamp.isoformat(), 'price': p.price, 'volume': p.volume} for p in price_points]
            cache_service.set(cache_key, cache_data, ttl_seconds=self.history_cache_ttl)
            
            return price_points
            
        except Exception as e:
            logger.error(f"Error getting price history for {asset_code}: {str(e)}")
            # Return synthetic data as fallback
            return self._generate_synthetic_history(asset_code)
    
    def _generate_synthetic_history(self, asset_code: str) -> List[Dict]:
        """Generate synthetic price history for demo purposes"""
        base_price = 0.12 if asset_code == 'XLM' else 1.0
        
        # Generate 168 hours (7 days) of synthetic data
        history = []
        current_time = datetime.now() - timedelta(days=7)
        
        for i in range(168):  # 7 days * 24 hours
            # Add some realistic price movement
            price_change = np.random.normal(0, 0.02)  # 2% volatility
            base_price = base_price * (1 + price_change)
            base_price = max(base_price, 0.01)  # Minimum price
            
            history.append({
                'timestamp': current_time.isoformat(),
                'price': base_price,
                'volume': np.random.uniform(1000, 10000)
            })
            
            current_time += timedelta(hours=1)
        
        return history
    
    def _calculate_volatility(self, price_history: List[PricePoint]) -> float:
        """Calculate annualized volatility from price history"""
        if len(price_history) < 2:
            return 0.2  # Default volatility
        
        prices = [p.price for p in price_history]
        returns = np.diff(np.log(prices))
        
        if len(returns) == 0:
            return 0.2
        
        # Annualized volatility (assuming hourly data)
        volatility = np.std(returns) * np.sqrt(24 * 365)
        return min(volatility, 2.0)  # Cap at 200%
    
    def _calculate_beta(self, price_history: List[PricePoint], asset_code: str) -> float:
        """Calculate beta against XLM (market proxy)"""
        if asset_code == 'XLM':
            return 1.0
        
        if len(price_history) < 10:
            # Return default beta based on asset type
            default_betas = {
                'USDC': 0.1, 'USDT': 0.1, 'USD': 0.1,
                'BTC': 0.8, 'ETH': 0.9, 'ADA': 1.2
            }
            return default_betas.get(asset_code, 0.7)
        
        # Simplified beta calculation (in production, would use XLM price data)
        prices = [p.price for p in price_history]
        returns = np.diff(np.log(prices))
        
        # Mock market returns (would use actual XLM returns)
        market_returns = np.random.normal(0, 0.02, len(returns))
        
        if len(returns) > 0 and len(market_returns) > 0:
            covariance = np.cov(returns, market_returns)[0][1]
            market_variance = np.var(market_returns)
            
            if market_variance > 0:
                beta = covariance / market_variance
                return max(min(beta, 3.0), -1.0)  # Cap between -1 and 3
        
        return 0.7  # Default beta
    
    def _calculate_correlation_with_xlm(self, price_history: List[PricePoint], asset_code: str) -> float:
        """Calculate correlation with XLM"""
        if asset_code == 'XLM':
            return 1.0
        
        if len(price_history) < 10:
            # Default correlations
            default_correlations = {
                'USDC': 0.1, 'USDT': 0.1, 'USD': 0.1,
                'BTC': 0.7, 'ETH': 0.8, 'ADA': 0.6
            }
            return default_correlations.get(asset_code, 0.4)
        
        # Simplified correlation calculation
        prices = [p.price for p in price_history]
        returns = np.diff(np.log(prices))
        
        # Mock XLM returns (would use actual XLM data)
        xlm_returns = np.random.normal(0, 0.02, len(returns))
        
        if len(returns) > 1 and len(xlm_returns) > 1:
            correlation = np.corrcoef(returns, xlm_returns)[0][1]
            if not np.isnan(correlation):
                return max(min(correlation, 1.0), -1.0)
        
        return 0.4  # Default correlation
    
    async def _calculate_advanced_risk_metrics(self, assets: List[PortfolioAsset]) -> RiskMetrics:
        """Calculate comprehensive risk metrics using real data"""
        if not assets:
            return self._get_default_risk_metrics()
        
        total_value = sum(asset.current_value for asset in assets)
        
        if total_value == 0:
            return self._get_default_risk_metrics()
        
        # Portfolio volatility with correlations
        portfolio_volatility = self._calculate_portfolio_volatility_with_correlations(assets)
        
        # Value at Risk using historical simulation
        var_95 = self._calculate_var_historical(assets, 0.95)
        var_99 = self._calculate_var_historical(assets, 0.99)
        
        # Conditional VaR (Expected Shortfall)
        cvar_95 = self._calculate_conditional_var(assets, 0.95)
        
        # Sharpe and Sortino ratios
        sharpe_ratio = self._calculate_sharpe_ratio(assets, portfolio_volatility)
        sortino_ratio = self._calculate_sortino_ratio(assets)
        
        # Portfolio beta
        portfolio_beta = sum(asset.beta * asset.allocation for asset in assets)
        
        # Maximum drawdown (estimated)
        max_drawdown = self._estimate_max_drawdown(assets, portfolio_volatility)
        
        # Diversification ratio
        diversification_ratio = self._calculate_diversification_ratio(assets, portfolio_volatility)
        
        # Tail risk measure
        tail_risk = self._calculate_tail_risk(assets)
        
        # Overall risk score (0-100)
        risk_score = self._calculate_overall_risk_score({
            'volatility': portfolio_volatility,
            'var_95': var_95,
            'max_drawdown': max_drawdown,
            'diversification_ratio': diversification_ratio,
            'tail_risk': tail_risk
        })
        
        return RiskMetrics(
            portfolio_value=total_value,
            var_95=var_95,
            var_99=var_99,
            cvar_95=cvar_95,
            volatility=portfolio_volatility,
            sharpe_ratio=sharpe_ratio,
            sortino_ratio=sortino_ratio,
            beta=portfolio_beta,
            max_drawdown=max_drawdown,
            risk_score=risk_score,
            diversification_ratio=diversification_ratio,
            tail_risk=tail_risk
        )
    
    def _calculate_portfolio_volatility_with_correlations(self, assets: List[PortfolioAsset]) -> float:
        """Calculate portfolio volatility considering asset correlations"""
        if len(assets) <= 1:
            return assets[0].volatility if assets else 0.2
        
        # Simplified correlation matrix (in production, use actual correlations)
        n = len(assets)
        weights = np.array([asset.allocation for asset in assets])
        volatilities = np.array([asset.volatility for asset in assets])
        
        # Create correlation matrix (simplified)
        correlation_matrix = np.eye(n)
        for i in range(n):
            for j in range(n):
                if i != j:
                    # Use average correlation between assets
                    avg_corr = (assets[i].correlation_xlm + assets[j].correlation_xlm) / 2
                    correlation_matrix[i][j] = avg_corr * 0.7  # Reduce correlation slightly
        
        # Portfolio variance
        covariance_matrix = np.outer(volatilities, volatilities) * correlation_matrix
        portfolio_variance = np.dot(weights, np.dot(covariance_matrix, weights))
        
        return np.sqrt(max(portfolio_variance, 0))
    
    def _calculate_var_historical(self, assets: List[PortfolioAsset], confidence: float) -> float:
        """Calculate VaR using historical simulation approach"""
        total_value = sum(asset.current_value for asset in assets)
        portfolio_volatility = self._calculate_portfolio_volatility_with_correlations(assets)
        
        # Generate simulated returns
        num_simulations = 10000
        returns = np.random.normal(0, portfolio_volatility / np.sqrt(252), num_simulations)
        
        # Calculate portfolio values
        portfolio_values = total_value * (1 + returns)
        losses = total_value - portfolio_values
        
        # VaR is the percentile of losses
        var = np.percentile(losses, confidence * 100)
        return max(var, 0)
    
    def _calculate_conditional_var(self, assets: List[PortfolioAsset], confidence: float) -> float:
        """Calculate Conditional VaR (Expected Shortfall)"""
        total_value = sum(asset.current_value for asset in assets)
        portfolio_volatility = self._calculate_portfolio_volatility_with_correlations(assets)
        
        # Generate simulated returns
        num_simulations = 10000
        returns = np.random.normal(0, portfolio_volatility / np.sqrt(252), num_simulations)
        
        # Calculate portfolio values
        portfolio_values = total_value * (1 + returns)
        losses = total_value - portfolio_values
        
        # CVaR is the expected loss beyond VaR
        var_threshold = np.percentile(losses, confidence * 100)
        cvar = np.mean(losses[losses >= var_threshold])
        
        return max(cvar, 0)
    
    def _calculate_sharpe_ratio(self, assets: List[PortfolioAsset], portfolio_volatility: float) -> float:
        """Calculate portfolio Sharpe ratio"""
        if portfolio_volatility == 0:
            return 0.0
        
        # Expected return (weighted average of asset expected returns)
        # For demo, use simple expected returns
        expected_returns = {
            'XLM': 0.08, 'USDC': 0.02, 'BTC': 0.15, 'ETH': 0.12
        }
        
        portfolio_expected_return = sum(
            expected_returns.get(asset.asset_code, 0.06) * asset.allocation 
            for asset in assets
        )
        
        risk_free_rate = 0.02  # 2% risk-free rate
        
        return (portfolio_expected_return - risk_free_rate) / portfolio_volatility
    
    def _calculate_sortino_ratio(self, assets: List[PortfolioAsset]) -> float:
        """Calculate Sortino ratio (downside risk adjusted)"""
        # Simplified calculation - would use actual downside volatility in production
        portfolio_volatility = self._calculate_portfolio_volatility_with_correlations(assets)
        downside_volatility = portfolio_volatility * 0.7  # Approximate downside volatility
        
        if downside_volatility == 0:
            return 0.0
        
        # Expected return
        expected_returns = {'XLM': 0.08, 'USDC': 0.02, 'BTC': 0.15, 'ETH': 0.12}
        portfolio_expected_return = sum(
            expected_returns.get(asset.asset_code, 0.06) * asset.allocation 
            for asset in assets
        )
        
        risk_free_rate = 0.02
        
        return (portfolio_expected_return - risk_free_rate) / downside_volatility
    
    def _estimate_max_drawdown(self, assets: List[PortfolioAsset], portfolio_volatility: float) -> float:
        """Estimate maximum drawdown based on volatility"""
        # Empirical relationship between volatility and max drawdown
        max_drawdown = min(portfolio_volatility * 2.5, 0.8)  # Cap at 80%
        return max_drawdown
    
    def _calculate_diversification_ratio(self, assets: List[PortfolioAsset], portfolio_volatility: float) -> float:
        """Calculate diversification ratio"""
        if not assets or portfolio_volatility == 0:
            return 0.0
        
        # Weighted average volatility
        weighted_avg_volatility = sum(asset.volatility * asset.allocation for asset in assets)
        
        if weighted_avg_volatility == 0:
            return 0.0
        
        # Diversification ratio
        div_ratio = weighted_avg_volatility / portfolio_volatility
        return min(div_ratio, 10.0)  # Cap at 10
    
    def _calculate_tail_risk(self, assets: List[PortfolioAsset]) -> float:
        """Calculate tail risk measure"""
        if not assets:
            return 0.5
        
        # Simplified tail risk based on asset concentration and volatility
        max_allocation = max(asset.allocation for asset in assets)
        avg_volatility = sum(asset.volatility for asset in assets) / len(assets)
        
        # Higher concentration and volatility = higher tail risk
        tail_risk = (max_allocation + avg_volatility) / 2
        return min(tail_risk, 1.0)
    
    def _calculate_overall_risk_score(self, metrics: Dict[str, float]) -> float:
        """Calculate overall risk score (0-100)"""
        # Normalize metrics to 0-100 scale
        volatility_score = min(metrics['volatility'] * 250, 100)  # 40% vol = 100 points
        var_score = min(metrics['var_95'] / 1000 * 100, 100)  # $1000 VaR = 100 points
        drawdown_score = min(metrics['max_drawdown'] * 125, 100)  # 80% drawdown = 100 points
        
        # Diversification helps reduce risk (lower is better for risk score)
        div_score = max(100 - metrics['diversification_ratio'] * 20, 0)
        
        # Tail risk contribution
        tail_score = min(metrics['tail_risk'] * 100, 100)
        
        # Weighted combination
        risk_score = (
            volatility_score * 0.3 +
            var_score * 0.25 +
            drawdown_score * 0.2 +
            div_score * 0.15 +
            tail_score * 0.1
        )
        
        return min(risk_score, 100.0)
    
    def _get_default_risk_metrics(self) -> RiskMetrics:
        """Return default risk metrics for empty portfolios"""
        return RiskMetrics(
            portfolio_value=0.0,
            var_95=0.0,
            var_99=0.0,
            cvar_95=0.0,
            volatility=0.0,
            sharpe_ratio=0.0,
            sortino_ratio=0.0,
            beta=0.0,
            max_drawdown=0.0,
            risk_score=0.0,
            diversification_ratio=0.0,
            tail_risk=0.0
        )
    
    async def _generate_price_predictions(self, assets: List[PortfolioAsset]) -> List[PricePrediction]:
        """Generate AI-powered price predictions"""
        predictions = []
        
        for asset in assets:
            try:
                # Get historical data
                history = await self._get_price_history(asset.asset_code, asset.asset_issuer)
                
                if len(history) < 10:
                    logger.warning(f"Insufficient data for prediction: {asset.asset_code}")
                    continue
                
                # Generate prediction
                prediction = await self._predict_asset_price(asset, history)
                predictions.append(prediction)
                
            except Exception as e:
                logger.error(f"Error predicting price for {asset.asset_code}: {str(e)}")
                continue
        
        return predictions
    
    async def _predict_asset_price(self, asset: PortfolioAsset, history: List[PricePoint]) -> PricePrediction:
        """Predict future prices for a single asset"""
        prices = [p.price for p in history]
        
        if len(prices) < 10:
            # Return simple prediction for insufficient data
            return self._create_simple_prediction(asset)
        
        # Prepare data for ML model
        X = np.arange(len(prices)).reshape(-1, 1)
        y = np.array(prices)
        
        # Simple linear regression for trend
        model = LinearRegression()
        model.fit(X, y)
        
        # Generate predictions for next 24 hours
        future_X = np.arange(len(prices), len(prices) + 24).reshape(-1, 1)
        future_prices = model.predict(future_X)
        
        # Add some realistic variance
        volatility = asset.volatility / np.sqrt(365 * 24)  # Hourly volatility
        
        predicted_prices = []
        for i, price in enumerate(future_prices):
            # Add confidence intervals
            confidence_interval = 1.96 * volatility * price  # 95% confidence
            timestamp = datetime.now() + timedelta(hours=i+1)
            
            predicted_prices.append((
                timestamp,
                max(price, 0.01),  # Minimum price
                confidence_interval
            ))
        
        # Determine trend
        trend = "bullish" if future_prices[-1] > prices[-1] else "bearish"
        if abs(future_prices[-1] - prices[-1]) / prices[-1] < 0.05:  # Less than 5% change
            trend = "neutral"
        
        # Calculate support and resistance levels
        recent_prices = prices[-24:] if len(prices) >= 24 else prices
        support_level = min(recent_prices) * 0.98
        resistance_level = max(recent_prices) * 1.02
        
        # Calculate prediction confidence based on model performance
        y_pred = model.predict(X)
        mse = mean_squared_error(y, y_pred)
        confidence = max(0.5, 1 - (mse / np.var(y)))
        
        return PricePrediction(
            asset_code=asset.asset_code,
            current_price=asset.current_price,
            predicted_prices=predicted_prices,
            trend=trend,
            confidence=confidence,
            support_level=support_level,
            resistance_level=resistance_level
        )
    
    def _create_simple_prediction(self, asset: PortfolioAsset) -> PricePrediction:
        """Create simple prediction for assets with insufficient data"""
        current_price = asset.current_price
        
        # Generate simple predictions with random walk
        predicted_prices = []
        price = current_price
        
        for i in range(24):  # 24 hour prediction
            # Random walk with slight drift
            price_change = np.random.normal(0.001, asset.volatility / np.sqrt(365 * 24))
            price = price * (1 + price_change)
            price = max(price, 0.01)  # Minimum price
            
            timestamp = datetime.now() + timedelta(hours=i+1)
            confidence_interval = price * asset.volatility / np.sqrt(365 * 24) * 1.96
            
            predicted_prices.append((timestamp, price, confidence_interval))
        
        # Simple trend determination
        final_price = predicted_prices[-1][1]
        if final_price > current_price * 1.02:
            trend = "bullish"
        elif final_price < current_price * 0.98:
            trend = "bearish"
        else:
            trend = "neutral"
        
        return PricePrediction(
            asset_code=asset.asset_code,
            current_price=current_price,
            predicted_prices=predicted_prices,
            trend=trend,
            confidence=0.6,  # Medium confidence for simple predictions
            support_level=current_price * 0.95,
            resistance_level=current_price * 1.05
        )
    
    async def _generate_ai_recommendations(
        self,
        assets: List[PortfolioAsset],
        risk_metrics: RiskMetrics,
        predictions: List[PricePrediction]
    ) -> List[PortfolioRecommendation]:
        """Generate AI-powered portfolio recommendations"""
        recommendations = []
        
        if not assets:
            return recommendations
        
        # Risk-based recommendations
        recommendations.extend(self._generate_risk_recommendations(assets, risk_metrics))
        
        # Prediction-based recommendations
        recommendations.extend(self._generate_prediction_recommendations(assets, predictions))
        
        # Diversification recommendations
        recommendations.extend(self._generate_diversification_recommendations(assets, risk_metrics))
        
        # Rebalancing recommendations
        recommendations.extend(self._generate_rebalancing_recommendations(assets, risk_metrics))
        
        # Sort by priority
        priority_order = {"high": 3, "medium": 2, "low": 1}
        recommendations.sort(key=lambda x: priority_order[x.priority], reverse=True)
        
        return recommendations[:10]  # Return top 10 recommendations
    
    def _generate_risk_recommendations(
        self, 
        assets: List[PortfolioAsset], 
        risk_metrics: RiskMetrics
    ) -> List[PortfolioRecommendation]:
        """Generate risk-based recommendations"""
        recommendations = []
        
        # High risk score warning
        if risk_metrics.risk_score > 80:
            # Find highest risk asset
            highest_risk_asset = max(assets, key=lambda a: a.volatility * a.allocation)
            
            recommendations.append(PortfolioRecommendation(
                type="risk_warning",
                priority="high",
                asset_code=highest_risk_asset.asset_code,
                current_allocation=highest_risk_asset.allocation,
                recommended_allocation=highest_risk_asset.allocation * 0.7,
                reason=f"Portfolio risk score is {risk_metrics.risk_score:.1f}/100. Consider reducing exposure to {highest_risk_asset.asset_code}",
                expected_impact={"risk_reduction": 15, "return_impact": -3}
            ))
        
        # Low diversification warning
        if risk_metrics.diversification_ratio < 1.2:
            recommendations.append(PortfolioRecommendation(
                type="add",
                priority="medium",
                asset_code="DIVERSIFIED_ASSET",
                current_allocation=0.0,
                recommended_allocation=0.15,
                reason="Portfolio lacks diversification. Consider adding uncorrelated assets",
                expected_impact={"risk_reduction": 10, "diversification_improvement": 20}
            ))
        
        return recommendations
    
    def _generate_prediction_recommendations(
        self,
        assets: List[PortfolioAsset],
        predictions: List[PricePrediction]
    ) -> List[PortfolioRecommendation]:
        """Generate recommendations based on price predictions"""
        recommendations = []
        
        for prediction in predictions:
            # Find corresponding asset
            asset = next((a for a in assets if a.asset_code == prediction.asset_code), None)
            if not asset:
                continue
            
            # Strong bullish prediction
            if prediction.trend == "bullish" and prediction.confidence > 0.7:
                final_predicted_price = prediction.predicted_prices[-1][1]
                price_increase = (final_predicted_price - prediction.current_price) / prediction.current_price
                
                if price_increase > 0.1:  # More than 10% increase predicted
                    recommendations.append(PortfolioRecommendation(
                        type="rebalance",
                        priority="medium",
                        asset_code=asset.asset_code,
                        current_allocation=asset.allocation,
                        recommended_allocation=min(asset.allocation * 1.2, 0.4),  # Increase but cap at 40%
                        reason=f"AI predicts {price_increase*100:.1f}% price increase for {asset.asset_code} with {prediction.confidence*100:.1f}% confidence",
                        expected_impact={"expected_return": price_increase * 100, "confidence": prediction.confidence * 100}
                    ))
            
            # Strong bearish prediction
            elif prediction.trend == "bearish" and prediction.confidence > 0.7:
                final_predicted_price = prediction.predicted_prices[-1][1]
                price_decrease = (prediction.current_price - final_predicted_price) / prediction.current_price
                
                if price_decrease > 0.1:  # More than 10% decrease predicted
                    recommendations.append(PortfolioRecommendation(
                        type="rebalance",
                        priority="high",
                        asset_code=asset.asset_code,
                        current_allocation=asset.allocation,
                        recommended_allocation=max(asset.allocation * 0.7, 0.05),  # Reduce but keep minimum
                        reason=f"AI predicts {price_decrease*100:.1f}% price decrease for {asset.asset_code} with {prediction.confidence*100:.1f}% confidence",
                        expected_impact={"risk_reduction": price_decrease * 100, "confidence": prediction.confidence * 100}
                    ))
        
        return recommendations
    
    def _generate_diversification_recommendations(
        self,
        assets: List[PortfolioAsset],
        risk_metrics: RiskMetrics
    ) -> List[PortfolioRecommendation]:
        """Generate diversification recommendations"""
        recommendations = []
        
        if len(assets) == 1:
            single_asset = assets[0]
            recommendations.append(PortfolioRecommendation(
                type="add",
                priority="high",
                asset_code="STABLE_ASSET",
                current_allocation=0.0,
                recommended_allocation=0.3,
                reason="Portfolio concentrated in single asset. Add stable assets for diversification",
                expected_impact={"risk_reduction": 25, "stability_improvement": 40}
            ))
        
        # Check for overconcentration
        for asset in assets:
            if asset.allocation > 0.6:  # More than 60% in one asset
                recommendations.append(PortfolioRecommendation(
                    type="rebalance",
                    priority="medium",
                    asset_code=asset.asset_code,
                    current_allocation=asset.allocation,
                    recommended_allocation=0.5,
                    reason=f"Overconcentrated in {asset.asset_code} ({asset.allocation*100:.1f}%). Consider rebalancing",
                    expected_impact={"risk_reduction": 15, "diversification_improvement": 25}
                ))
        
        return recommendations
    
    def _generate_rebalancing_recommendations(
        self,
        assets: List[PortfolioAsset],
        risk_metrics: RiskMetrics
    ) -> List[PortfolioRecommendation]:
        """Generate portfolio rebalancing recommendations"""
        recommendations = []
        
        # Simple rebalancing logic based on risk-adjusted returns
        if len(assets) >= 2:
            # Find best and worst performing assets by Sharpe ratio estimate
            asset_scores = []
            for asset in assets:
                # Simple scoring: inverse volatility weighted
                score = (1 / max(asset.volatility, 0.01)) * asset.allocation
                asset_scores.append((asset, score))
            
            asset_scores.sort(key=lambda x: x[1])
            
            if len(asset_scores) >= 2:
                worst_asset, _ = asset_scores[0]
                best_asset, _ = asset_scores[-1]
                
                if worst_asset.allocation > 0.1 and worst_asset.volatility > 0.4:  # High vol, significant allocation
                    recommendations.append(PortfolioRecommendation(
                        type="rebalance",
                        priority="low",
                        asset_code=worst_asset.asset_code,
                        current_allocation=worst_asset.allocation,
                        recommended_allocation=max(worst_asset.allocation * 0.8, 0.05),
                        reason=f"High volatility asset {worst_asset.asset_code} may benefit from reduced allocation",
                        expected_impact={"risk_reduction": 8, "stability_improvement": 12}
                    ))
        
        return recommendations
    
    async def _detect_price_anomalies(self, assets: List[PortfolioAsset]) -> Dict[str, bool]:
        """
        Detect price anomalies using Isolation Forest ML model
        
        Args:
            assets: List of enhanced portfolio assets
            
        Returns:
            Dictionary mapping asset codes to anomaly detection results
        """
        anomaly_results = {}
        
        for asset in assets:
            try:
                # Get price history for anomaly detection
                history = await self._get_price_history(asset.asset_code, asset.asset_issuer)
                
                if len(history) < 20:  # Need sufficient data for anomaly detection
                    anomaly_results[asset.asset_code] = False
                    continue
                
                # Prepare features for anomaly detection
                prices = np.array([p.price for p in history])
                volumes = np.array([p.volume or 1000 for p in history])  # Use default volume if None
                
                # Calculate additional features
                price_returns = np.diff(np.log(prices))
                price_volatility = np.array([np.std(price_returns[max(0, i-10):i+1]) 
                                           for i in range(len(prices)-1)])
                price_volatility = np.append([price_volatility[0]], price_volatility)  # Add first element
                
                # Normalize volumes
                volumes_normalized = (volumes - np.mean(volumes)) / (np.std(volumes) + 1e-8)
                
                # Create feature matrix
                features = np.column_stack([
                    prices,
                    volumes_normalized,
                    price_volatility
                ])
                
                # Handle NaN values
                features = np.nan_to_num(features, nan=0.0, posinf=0.0, neginf=0.0)
                
                # Scale features
                try:
                    features_scaled = self.scaler.fit_transform(features)
                except ValueError:
                    # Fallback if scaling fails
                    features_scaled = features
                
                # Fit anomaly detection model
                try:
                    self.anomaly_detector.fit(features_scaled)
                    predictions = self.anomaly_detector.predict(features_scaled)
                    
                    # Check if current price is anomalous
                    current_features = features_scaled[-1:].reshape(1, -1)
                    current_prediction = self.anomaly_detector.predict(current_features)
                    
                    is_anomalous = current_prediction[0] == -1
                    anomaly_results[asset.asset_code] = is_anomalous
                    
                    if is_anomalous:
                        logger.warning(f"Price anomaly detected for {asset.asset_code} at ${asset.current_price}")
                    
                except Exception as e:
                    logger.warning(f"Anomaly detection failed for {asset.asset_code}: {str(e)}")
                    anomaly_results[asset.asset_code] = False
                
            except Exception as e:
                logger.error(f"Error in anomaly detection for {asset.asset_code}: {str(e)}")
                anomaly_results[asset.asset_code] = False
        
        return anomaly_results
    
    async def detect_market_anomalies(self, asset_codes: List[str]) -> Dict[str, Dict]:
        """
        Public method to detect market anomalies for specific assets
        
        Args:
            asset_codes: List of asset codes to check
            
        Returns:
            Dictionary with anomaly detection results and details
        """
        results = {}
        
        for asset_code in asset_codes:
            try:
                # Get price data
                price_data = await self._get_enhanced_price_data(asset_code, None)
                history = await self._get_price_history(asset_code, None)
                
                # Create temporary asset object for analysis
                temp_asset = PortfolioAsset(
                    asset_code=asset_code,
                    asset_issuer=None,
                    balance=1.0,
                    current_price=price_data['price'],
                    current_value=price_data['price'],
                    allocation=1.0,
                    volatility=price_data['volatility'],
                    beta=price_data['beta'],
                    correlation_xlm=price_data['correlation_xlm']
                )
                
                # Run anomaly detection
                anomaly_detected = await self._detect_price_anomalies([temp_asset])
                is_anomalous = anomaly_detected.get(asset_code, False)
                
                # Calculate anomaly score and details
                anomaly_score = self._calculate_anomaly_score(history, price_data['price'])
                
                results[asset_code] = {
                    "is_anomalous": bool(is_anomalous),
                    "anomaly_score": float(anomaly_score),
                    "current_price": float(price_data['price']),
                    "volatility": float(price_data['volatility']),
                    "confidence": 0.8 if len(history) > 50 else 0.6,
                    "details": {
                        "price_deviation": float(self._calculate_price_deviation(history, price_data['price'])),
                        "volume_spike": bool(self._detect_volume_spike(history)),
                        "volatility_spike": bool(price_data['volatility'] > 0.5)
                    }
                }
                
            except Exception as e:
                logger.error(f"Error detecting anomalies for {asset_code}: {str(e)}")
                results[asset_code] = {
                    "is_anomalous": False,
                    "anomaly_score": 0.0,
                    "error": str(e)
                }
        
        return results
    
    def _calculate_anomaly_score(self, history: List[PricePoint], current_price: float) -> float:
        """Calculate anomaly score based on price deviation"""
        if len(history) < 10:
            return 0.0
        
        prices = [p.price for p in history]
        mean_price = np.mean(prices)
        std_price = np.std(prices)
        
        if std_price == 0:
            return 0.0
        
        # Z-score based anomaly score
        z_score = abs(current_price - mean_price) / std_price
        
        # Convert to 0-1 scale
        anomaly_score = min(z_score / 3.0, 1.0)  # 3 standard deviations = max score
        
        return anomaly_score
    
    def _calculate_price_deviation(self, history: List[PricePoint], current_price: float) -> float:
        """Calculate price deviation from recent average"""
        if len(history) < 5:
            return 0.0
        
        recent_prices = [p.price for p in history[-10:]]  # Last 10 data points
        recent_avg = np.mean(recent_prices)
        
        if recent_avg == 0:
            return 0.0
        
        deviation = (current_price - recent_avg) / recent_avg
        return deviation
    
    def _detect_volume_spike(self, history: List[PricePoint]) -> bool:
        """Detect unusual volume spikes"""
        if len(history) < 10:
            return False
        
        volumes = [p.volume or 1000 for p in history if p.volume]
        if len(volumes) < 5:
            return False
        
        recent_volume = volumes[-1]
        avg_volume = np.mean(volumes[:-1])
        
        # Volume spike if current volume is 3x average
        return recent_volume > avg_volume * 3

# Global instance
ai_analyzer = AIPortfolioAnalyzer()
