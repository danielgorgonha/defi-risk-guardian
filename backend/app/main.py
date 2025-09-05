"""
DeFi Risk Guardian - Main FastAPI Application
Hackathon Stellar Hacks: KALE x Reflector 2025
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from datetime import datetime
from sqlalchemy import text
from dotenv import load_dotenv

from app.core.config import settings
from app.api.v1 import portfolio, risk, alerts, rebalance
from app.core.database import engine, Base
from app.services.reflector import ReflectorClient
from app.services.cache import cache_service

# Load environment variables
load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="DeFi Risk Guardian API",
    description="Intelligent risk management system in DeFi",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(portfolio.router, prefix="/api/v1/portfolio", tags=["portfolio"])
app.include_router(risk.router, prefix="/api/v1/risk", tags=["risk"])
app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["alerts"])
app.include_router(rebalance.router, prefix="/api/v1/rebalance", tags=["rebalance"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "DeFi Risk Guardian API",
        "version": "1.0.0",
        "status": "running",
        "hackathon": "Stellar Hacks: KALE x Reflector 2025"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    # Check database connection and get stats
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            
            # Get database stats
            db_info = conn.execute(text("""
                SELECT 
                    version() as version,
                    current_database() as database_name,
                    current_user as user,
                    inet_server_addr() as host,
                    inet_server_port() as port
            """)).fetchone()
            
            db_stats = {
                "status": "connected",
                "version": db_info[0].split()[1] if db_info[0] else "unknown",
                "database": db_info[1] if db_info[1] else "unknown",
                "user": db_info[2] if db_info[2] else "unknown",
                "host": db_info[3] if db_info[3] else "localhost",
                "port": db_info[4] if db_info[4] else "5432"
            }
    except Exception as e:
        db_stats = {
            "status": "disconnected",
            "error": str(e)[:50]
        }
    
    # Check Redis connection
    redis_stats = cache_service.get_stats()
    redis_status = redis_stats.get("status", "disconnected")
    
    # Check Reflector service
    try:
        reflector = ReflectorClient()
        # Simple test - just check if service can be instantiated
        reflector_status = "connected"
    except Exception:
        reflector_status = "disconnected"
    
    overall_status = "healthy" if all([
        db_stats.get("status") == "connected",
        redis_status == "connected", 
        reflector_status == "connected"
    ]) else "unhealthy"
    
    return {
        "status": overall_status,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "services": {
            "database": db_stats,
            "redis": redis_stats,
            "reflector": reflector_status
        }
    }

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Global HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "path": str(request.url)
        }
    )

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
