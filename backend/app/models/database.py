"""
Database models for DeFi Risk Guardian
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    wallet_address = Column(String(56), unique=True, index=True, nullable=False)
    risk_tolerance = Column(Float, default=0.5)  # 0.0 to 1.0
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    portfolios = relationship("Portfolio", back_populates="user")
    alerts = relationship("RiskAlert", back_populates="user")

class Portfolio(Base):
    """Portfolio model - Hybrid approach supporting both owned and planned assets"""
    __tablename__ = "portfolios"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    asset_code = Column(String(12), nullable=False)
    asset_issuer = Column(String(56), nullable=True)  # None for native assets
    balance = Column(Float, nullable=False, default=0.0)
    target_allocation = Column(Float, nullable=False, default=0.0)
    
    # Hybrid portfolio fields
    status = Column(String(20), default='owned')  # 'owned', 'planned', 'target'
    notes = Column(Text, nullable=True)  # User notes about the asset
    target_date = Column(DateTime(timezone=True), nullable=True)  # When to acquire planned assets
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="portfolios")
    alerts = relationship("RiskAlert", back_populates="portfolio")

class PriceHistory(Base):
    """Price history model"""
    __tablename__ = "price_history"
    
    id = Column(Integer, primary_key=True, index=True)
    asset_code = Column(String(12), nullable=False, index=True)
    asset_issuer = Column(String(56), nullable=True, index=True)
    price_usd = Column(Float, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    source = Column(String(50), default="reflector")
    
    # Index for efficient queries
    __table_args__ = (
        {"extend_existing": True}
    )

class RiskAlert(Base):
    """Risk alert model"""
    __tablename__ = "risk_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), nullable=True)
    alert_type = Column(String(50), nullable=False)  # volatility, anomaly, liquidation, etc.
    severity = Column(String(20), nullable=False)  # low, medium, high, critical
    message = Column(Text, nullable=False)
    triggered_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    user = relationship("User", back_populates="alerts")
    portfolio = relationship("Portfolio", back_populates="alerts")

class RiskMetrics(Base):
    """Risk metrics model"""
    __tablename__ = "risk_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    portfolio_value = Column(Float, nullable=False)
    var_95 = Column(Float, nullable=False)  # Value at Risk 95%
    var_99 = Column(Float, nullable=False)  # Value at Risk 99%
    volatility = Column(Float, nullable=False)
    sharpe_ratio = Column(Float, nullable=True)
    beta = Column(Float, nullable=True)
    max_drawdown = Column(Float, nullable=True)
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")

class RebalanceHistory(Base):
    """Rebalance history model"""
    __tablename__ = "rebalance_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    old_allocation = Column(Text, nullable=False)  # JSON string
    new_allocation = Column(Text, nullable=False)  # JSON string
    rebalance_type = Column(String(20), nullable=False)  # manual, automatic, suggested
    executed_at = Column(DateTime(timezone=True), server_default=func.now())
    success = Column(Boolean, default=True)
    error_message = Column(Text, nullable=True)
    
    # Relationships
    user = relationship("User")
