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
    STELLAR_NETWORK: str = "mainnet"  # testnet or mainnet
    HORIZON_URL: str = "https://horizon-mainnet.stellar.org"
    # Reflector Oracle API
    REFLECTOR_API_URL: str = "https://reflector-api.stellar.org"
    REFLECTOR_API_KEY: str = ""        
    
    # Reflector Oracle Contracts
    REFLECTOR_STELLAR_DEX_MAINNET: str = "CALI2BYU2JE6WVRUFYTS6MSBNEHGJ35P4AVCZYF3B6QOE3QKOB2PLE6M"
    REFLECTOR_EXTERNAL_CEX_MAINNET: str = "CAFJZQW7UEDVNE4SP7EPMKSW56XDEKDX3FE2JS4HQ4OXP3ZCOW5LFTK6J"
    REFLECTOR_FIAT_MAINNET: str = "CBKGPWGKXW2G5ZZ5E5V3B5NVDG74J2NXLHTYWT5JLL4QIRDUXRDZMCJZCF"
    REFLECTOR_STELLAR_DEX_TESTNET: str = "CAVLP2FY3AJX4Q3FKF2FBJCM2P2N3FWYY6WRT53NQOTBS7J5UQ4SD6HLP"
    REFLECTOR_EXTERNAL_CEX_TESTNET: str = "CCYOZX2H4Z3HUBXHAP5GLOAYQ73TGLMZB7O6FY7JFB7FUMW3ET5KMJRN6"
    REFLECTOR_FIAT_TESTNET: str = "CCSSMW2RJTT4T5CB77P4GM2O7IQP5URZ5ICUEN5Y53D2QDDNAGU5NV4WFI"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://risk-guardian.vercel.app",
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
