"""
Global test configuration and fixtures
"""
import pytest
import asyncio
from unittest.mock import Mock, AsyncMock, patch
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from httpx import AsyncClient

from app.main import app
from app.core.database import get_db, Base
from app.core.config import settings

# Test database URL (in-memory SQLite for speed)
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database dependency override."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
async def async_client(db_session):
    """Create an async test client."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()

@pytest.fixture
def mock_stellar_oracle_client():
    """Mock Stellar Oracle client for testing."""
    with patch('app.main.StellarOracleClient') as mock_class:
        # Create a mock instance
        mock_instance = Mock()
        mock_instance.get_asset_price = AsyncMock(return_value=0.12)
        mock_instance.get_supported_assets = AsyncMock(return_value=[
            {"code": "XLM", "issuer": None, "name": "Stellar Lumens"}
        ])
        # Mock properties for health check
        mock_instance.network = "testnet"
        mock_instance.horizon_url = "https://horizon-testnet.stellar.org"
        mock_instance.contracts = {
            "stellar_dex": "CAVLP2FY3AJX4Q3FKF2FBJCM2P2N3FWYY6WRT53NQOTBS7J5UQ4SD6HLP",
            "external_cex": "CCYOZX2H4Z3HUBXHAP5GLOAYQ73TGLMZB7O6FY7JFB7FUMW3ET5KMJRN6",
            "fiat": "CCSSMW2RJTT4T5CB77P4GM2O7IQP5URZ5ICUEN5Y53D2QDDNAGU5NV4WFI"
        }
        # Make the class return our mock instance
        mock_class.return_value = mock_instance
        yield mock_instance

@pytest.fixture
def mock_cache_service():
    """Mock cache service for testing."""
    with patch('app.services.cache.cache_service') as mock:
        mock.is_connected.return_value = True
        mock.get.return_value = None
        mock.set.return_value = True
        mock.delete.return_value = True
        mock.get_stats.return_value = {
            "status": "connected",
            "version": "7.0.0",
            "memory_used": "1.2M",
            "connected_clients": 1
        }
        yield mock

@pytest.fixture
def sample_wallet_address():
    """Sample wallet address for testing."""
    return "GDVKVA22NDD3M5TBUHX7LPOQLPDRH6GVB63WXLRGDVWJDIERA5EYT25O"

@pytest.fixture
def sample_user_data():
    """Sample user data for testing."""
    return {
        "wallet_address": "GDVKVA22NDD3M5TBUHX7LPOQLPDRH6GVB63WXLRGDVWJDIERA5EYT25O",
        "risk_tolerance": 0.5
    }

@pytest.fixture
def sample_portfolio_data():
    """Sample portfolio data for testing."""
    return {
        "asset_code": "XLM",
        "asset_issuer": "native",
        "balance": 1000.0,
        "target_allocation": 0.3
    }

@pytest.fixture
def sample_alert_data():
    """Sample alert data for testing."""
    return {
        "alert_type": "high_volatility",
        "severity": "warning",
        "message": "High volatility detected in portfolio",
        "threshold": 0.15
    }
