"""
Configuration settings for DeFi Risk Guardian
"""

from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    """Application settings"""
    
    # App settings
    APP_NAME: str = "DeFi Risk Guardian"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/defi_risk"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # Stellar
    STELLAR_NETWORK: str = "testnet"  # testnet or mainnet
    HORIZON_URL: str = "https://horizon-testnet.stellar.org"
    
    # Reflector Oracle
    REFLECTOR_API_URL: str = "https://reflector-api.stellar.org"
    REFLECTOR_API_KEY: str = ""
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://defi-risk-guardian.vercel.app"
    ]
    
    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # ML Models
    ANOMALY_CONTAMINATION: float = 0.1
    VAR_CONFIDENCE_LEVEL: float = 0.95
    REBALANCE_THRESHOLD: float = 0.05
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Global settings instance
settings = Settings()
