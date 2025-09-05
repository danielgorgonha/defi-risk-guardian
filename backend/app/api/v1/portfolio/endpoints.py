"""
FastAPI endpoints for portfolio domain.

This module contains all the FastAPI endpoints for portfolio operations,
organized and separated from business logic for better maintainability.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.core.database import get_db
from app.services.stellar_oracle import stellar_oracle_client
from .models import PortfolioCreate, AssetCreate, AssetUpdate, SyncRequest
from .services import PortfolioService

router = APIRouter()


@router.post("/users", response_model=Dict[str, str])
async def create_user(portfolio_data: PortfolioCreate, db: Session = Depends(get_db)):
    """Create a new user/portfolio with automatic asset discovery"""
    try:
        service = PortfolioService(db)
        result = await service.create_user(portfolio_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/supported-assets")
async def get_supported_assets():
    """Get list of supported assets from Stellar network"""
    try:
        assets = await stellar_oracle_client.get_supported_assets()
        return {
            "supported_assets": assets,
            "total_count": len(assets)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error getting supported assets")


@router.get("/{wallet_address}")
async def get_portfolio(wallet_address: str, db: Session = Depends(get_db)):
    """Get portfolio data for a user"""
    try:
        service = PortfolioService(db)
        result = await service.get_portfolio(wallet_address)
        return result
    except ValueError as e:
        if "Invalid wallet address" in str(e):
            raise HTTPException(status_code=400, detail=str(e))
        elif "User not found" in str(e):
            raise HTTPException(status_code=404, detail=str(e))
        else:
            raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/{wallet_address}/assets")
async def add_asset(
    wallet_address: str,
    asset_data: AssetCreate,
    db: Session = Depends(get_db)
):
    """Add an asset to user's portfolio"""
    try:
        service = PortfolioService(db)
        result = await service.add_asset(wallet_address, asset_data)
        return result
    except ValueError as e:
        if "Invalid wallet address" in str(e):
            raise HTTPException(status_code=400, detail=str(e))
        elif "User not found" in str(e):
            raise HTTPException(status_code=404, detail=str(e))
        elif "Invalid asset" in str(e):
            raise HTTPException(status_code=400, detail=str(e))
        else:
            raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{wallet_address}/assets/{asset_code}/price")
async def get_asset_price(
    wallet_address: str,
    asset_code: str,
    asset_issuer: str = None,
    db: Session = Depends(get_db)
):
    """Get current price for a specific asset"""
    try:
        # Validate wallet address
        from .validators import validate_stellar_address
        if not validate_stellar_address(wallet_address):
            raise HTTPException(status_code=400, detail="Invalid wallet address format")
        
        # Get price from oracle
        price = await stellar_oracle_client.get_asset_price(asset_code, asset_issuer)
        
        if price is None:
            raise HTTPException(status_code=404, detail="Asset not found or price unavailable")
        
        from datetime import datetime
        return {
            "asset_code": asset_code,
            "asset_issuer": asset_issuer,
            "price_usd": price,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error getting asset price")


@router.put("/{wallet_address}/assets/{asset_id}")
async def update_asset(
    wallet_address: str,
    asset_id: int,
    update_data: AssetUpdate,
    db: Session = Depends(get_db)
):
    """Update an asset in user's portfolio"""
    try:
        service = PortfolioService(db)
        result = await service.update_asset(wallet_address, asset_id, update_data)
        return result
    except ValueError as e:
        if "Invalid wallet address" in str(e):
            raise HTTPException(status_code=400, detail=str(e))
        elif "User not found" in str(e):
            raise HTTPException(status_code=404, detail=str(e))
        elif "Asset not found" in str(e):
            raise HTTPException(status_code=404, detail=str(e))
        else:
            raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/{wallet_address}/assets/{asset_id}")
async def delete_asset(
    wallet_address: str,
    asset_id: int,
    db: Session = Depends(get_db)
):
    """Delete an asset from user's portfolio"""
    try:
        service = PortfolioService(db)
        result = await service.delete_asset(wallet_address, asset_id)
        return result
    except ValueError as e:
        if "Invalid wallet address" in str(e):
            raise HTTPException(status_code=400, detail=str(e))
        elif "User not found" in str(e):
            raise HTTPException(status_code=404, detail=str(e))
        elif "Asset not found" in str(e):
            raise HTTPException(status_code=404, detail=str(e))
        else:
            raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/{wallet_address}/sync")
async def sync_portfolio(
    wallet_address: str,
    sync_request: SyncRequest,
    db: Session = Depends(get_db)
):
    """Sync portfolio with current wallet state"""
    try:
        service = PortfolioService(db)
        result = await service.sync_portfolio(wallet_address, sync_request)
        return result
    except ValueError as e:
        if "Invalid wallet address" in str(e):
            raise HTTPException(status_code=400, detail=str(e))
        elif "User not found" in str(e):
            raise HTTPException(status_code=404, detail=str(e))
        else:
            raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{wallet_address}/assets/{asset_id}")
async def get_asset_details(
    wallet_address: str,
    asset_id: int,
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific asset"""
    try:
        service = PortfolioService(db)
        result = await service.get_asset_details(wallet_address, asset_id)
        return result
    except ValueError as e:
        if "Invalid wallet address" in str(e):
            raise HTTPException(status_code=400, detail=str(e))
        elif "User not found" in str(e):
            raise HTTPException(status_code=404, detail=str(e))
        elif "Asset not found" in str(e):
            raise HTTPException(status_code=404, detail=str(e))
        else:
            raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{wallet_address}/assets/{asset_code}/history")
async def get_asset_price_history(
    wallet_address: str,
    asset_code: str,
    asset_issuer: str = None,
    days: int = 30,
    db: Session = Depends(get_db)
):
    """Get price history for a specific asset"""
    try:
        # Validate wallet address
        from .validators import validate_stellar_address
        if not validate_stellar_address(wallet_address):
            raise HTTPException(status_code=400, detail="Invalid wallet address format")
        
        # Get price history from oracle
        history = await stellar_oracle_client.get_price_history(asset_code, asset_issuer, days)
        
        if not history:
            raise HTTPException(status_code=404, detail="Price history not available for this asset")
        
        return {
            "asset_code": asset_code,
            "asset_issuer": asset_issuer,
            "price_history": history,
            "period_days": days
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error getting price history")
