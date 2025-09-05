"""
Portfolio API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.core.database import get_db
from app.models.database import User, Portfolio, PriceHistory
from app.services.stellar_oracle import stellar_oracle_client
from pydantic import BaseModel, validator
from stellar_sdk import Keypair
from stellar_sdk.exceptions import Ed25519PublicKeyInvalidError
import re

router = APIRouter()

# Pydantic models
class PortfolioCreate(BaseModel):
    wallet_address: str
    risk_tolerance: float = 0.5
    
    @validator('wallet_address')
    def validate_wallet_address(cls, v):
        """Validate Stellar wallet address format"""
        if not v or not isinstance(v, str):
            raise ValueError('Wallet address is required')
        
        # Remove any whitespace
        v = v.strip()
        
        # Check if it's a valid Stellar public key (56 characters, base32)
        if len(v) != 56:
            raise ValueError('Stellar wallet address must be 56 characters long')
        
        # Check if it contains only valid base32 characters
        if not re.match(r'^[A-Z2-7]+$', v):
            raise ValueError('Invalid Stellar wallet address format')
        
        # Try to create a Keypair to validate the address
        try:
            Keypair.from_public_key(v)
        except Ed25519PublicKeyInvalidError:
            raise ValueError('Invalid Stellar wallet address')
        
        return v

class AssetCreate(BaseModel):
    asset_code: str
    asset_issuer: Optional[str] = None
    balance: float
    target_allocation: float
    status: str = 'owned'  # 'owned', 'planned', 'target'
    notes: Optional[str] = None
    target_date: Optional[str] = None  # ISO format date string

class PortfolioResponse(BaseModel):
    id: int
    wallet_address: str
    risk_tolerance: float
    total_value: float
    assets: List[Dict[str, Any]]
    risk_score: float

async def discover_wallet_assets(wallet_address: str) -> List[Dict[str, Any]]:
    """Discover assets in a Stellar wallet using Horizon API"""
    try:
        from stellar_sdk import Server
        from app.core.config import settings
        
        # Use the same Horizon server as configured
        server = Server(settings.HORIZON_URL)
        
        # Get account data
        account = server.accounts().account_id(wallet_address).call()
        
        assets = []
        for balance in account.get('balances', []):
            if balance['asset_type'] == 'native':
                # XLM (native asset)
                assets.append({
                    'asset_code': 'XLM',
                    'asset_issuer': None,
                    'balance': float(balance['balance']),
                    'target_allocation': 0.0,  # Will be set by user later
                    'status': 'owned'  # Auto-discovered assets are owned
                })
            else:
                # Custom assets
                assets.append({
                    'asset_code': balance['asset_code'],
                    'asset_issuer': balance['asset_issuer'],
                    'balance': float(balance['balance']),
                    'target_allocation': 0.0,  # Will be set by user later
                    'status': 'owned'  # Auto-discovered assets are owned
                })
        
        return assets
        
    except Exception as e:
        # If discovery fails, return empty list (user can add assets manually)
        print(f"Warning: Could not discover assets for {wallet_address}: {str(e)}")
        return []

@router.post("/users", response_model=Dict[str, str])
async def create_user(portfolio_data: PortfolioCreate, db: Session = Depends(get_db)):
    """Create a new user/portfolio with automatic asset discovery"""
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(
            User.wallet_address == portfolio_data.wallet_address
        ).first()
        
        if existing_user:
            return {"message": "User already exists", "user_id": str(existing_user.id)}
        
        # Create new user
        new_user = User(
            wallet_address=portfolio_data.wallet_address,
            risk_tolerance=portfolio_data.risk_tolerance
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Auto-discover assets from wallet
        discovered_assets = await discover_wallet_assets(portfolio_data.wallet_address)
        
        # Add discovered assets to portfolio
        assets_added = 0
        for asset_data in discovered_assets:
            if asset_data['balance'] > 0:  # Only add assets with balance
                new_asset = Portfolio(
                    user_id=new_user.id,
                    asset_code=asset_data['asset_code'],
                    asset_issuer=asset_data['asset_issuer'],
                    balance=asset_data['balance'],
                    target_allocation=asset_data['target_allocation'],
                    status=asset_data['status']
                )
                db.add(new_asset)
                assets_added += 1
        
        db.commit()
        
        return {
            "message": "User created successfully", 
            "user_id": str(new_user.id),
            "assets_discovered": str(assets_added)
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")

@router.get("/{wallet_address}", response_model=PortfolioResponse)
async def get_portfolio(wallet_address: str, db: Session = Depends(get_db)):
    """Get portfolio for a wallet address"""
    try:
        # Validate wallet address
        if not validate_stellar_address(wallet_address):
            raise HTTPException(
                status_code=400, 
                detail="Invalid Stellar wallet address format"
            )
        
        # Get user
        user = db.query(User).filter(User.wallet_address == wallet_address).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get portfolio assets
        portfolios = db.query(Portfolio).filter(Portfolio.user_id == user.id).all()
        
        # Get current prices
        assets_data = []
        total_value = 0.0
        
        for portfolio in portfolios:
            # Get current price
            price = await stellar_oracle_client.get_asset_price(
                portfolio.asset_code, 
                portfolio.asset_issuer
            )
            
            # Use price 0 if not available (for testing purposes)
            if price is None:
                price = 0.0
            
            value_usd = portfolio.balance * price
            total_value += value_usd
            
            assets_data.append({
                "id": portfolio.id,
                "asset_code": portfolio.asset_code,
                "asset_issuer": portfolio.asset_issuer,
                "balance": portfolio.balance,
                "price_usd": price,
                "value_usd": value_usd,
                "target_allocation": portfolio.target_allocation,
                "current_allocation": (value_usd / total_value * 100) if total_value > 0 else 0,
                "status": portfolio.status,
                "notes": portfolio.notes,
                "target_date": portfolio.target_date.isoformat() if portfolio.target_date else None
            })
        
        # Calculate risk score (simplified)
        risk_score = calculate_simple_risk_score(assets_data)
        
        return PortfolioResponse(
            id=user.id,
            wallet_address=user.wallet_address,
            risk_tolerance=user.risk_tolerance,
            total_value=total_value,
            assets=assets_data,
            risk_score=risk_score
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting portfolio: {str(e)}")

def validate_stellar_address(address: str) -> bool:
    """Validate if a string is a valid Stellar wallet address"""
    if not address or not isinstance(address, str):
        return False
    
    address = address.strip()
    
    # Check length and format
    if len(address) != 56 or not re.match(r'^[A-Z2-7]+$', address):
        return False
    
    # Try to create a Keypair to validate
    try:
        Keypair.from_public_key(address)
        return True
    except Ed25519PublicKeyInvalidError:
        return False

@router.post("/{wallet_address}/assets")
async def add_asset(
    wallet_address: str, 
    asset_data: AssetCreate, 
    db: Session = Depends(get_db)
):
    """Add an asset to portfolio"""
    try:
        # Validate wallet address
        if not validate_stellar_address(wallet_address):
            raise HTTPException(
                status_code=400, 
                detail="Invalid Stellar wallet address format"
            )
        
        # Get user
        user = db.query(User).filter(User.wallet_address == wallet_address).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if asset already exists
        existing_asset = db.query(Portfolio).filter(
            Portfolio.user_id == user.id,
            Portfolio.asset_code == asset_data.asset_code,
            Portfolio.asset_issuer == asset_data.asset_issuer
        ).first()
        
        # Parse target_date if provided
        target_date = None
        if asset_data.target_date:
            from datetime import datetime
            try:
                target_date = datetime.fromisoformat(asset_data.target_date.replace('Z', '+00:00'))
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid target_date format. Use ISO format (YYYY-MM-DDTHH:MM:SSZ)")
        
        if existing_asset:
            # Update existing asset
            existing_asset.balance = asset_data.balance
            existing_asset.target_allocation = asset_data.target_allocation
            existing_asset.status = asset_data.status
            existing_asset.notes = asset_data.notes
            existing_asset.target_date = target_date
            asset_id = existing_asset.id
        else:
            # Create new asset
            new_asset = Portfolio(
                user_id=user.id,
                asset_code=asset_data.asset_code,
                asset_issuer=asset_data.asset_issuer,
                balance=asset_data.balance,
                target_allocation=asset_data.target_allocation,
                status=asset_data.status,
                notes=asset_data.notes,
                target_date=target_date
            )
            db.add(new_asset)
            db.flush()  # Flush to get the ID
            asset_id = new_asset.id
        
        db.commit()
        
        return {
            "asset_id": asset_id,
            "message": "Asset added/updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error adding asset: {str(e)}")

@router.get("/{wallet_address}/assets/{asset_code}/price")
async def get_asset_price(
    wallet_address: str, 
    asset_code: str, 
    asset_issuer: str = None
):
    """Get current price for a specific asset"""
    try:
        price = await stellar_oracle_client.get_asset_price(asset_code, asset_issuer)
        
        if price is None:
            raise HTTPException(status_code=404, detail="Price not found")
        
        return {
            "asset_code": asset_code,
            "asset_issuer": asset_issuer,
            "price_usd": price,
            "timestamp": "2024-01-01T00:00:00Z"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting price: {str(e)}")

def calculate_simple_risk_score(assets: List[Dict[str, Any]]) -> float:
    """Calculate a simple risk score for the portfolio"""
    if not assets:
        return 0.0
    
    # Simple risk calculation based on volatility and concentration
    total_value = sum(asset["value_usd"] for asset in assets)
    
    if total_value == 0:
        return 0.0
    
    # Calculate concentration risk (higher if portfolio is concentrated)
    max_allocation = max(asset["current_allocation"] for asset in assets)
    concentration_risk = max_allocation / 100.0
    
    # Simple volatility estimate (mock for now)
    volatility_risk = 0.3  # This would be calculated from historical data
    
    # Combine risks
    risk_score = (concentration_risk * 0.6 + volatility_risk * 0.4) * 100
    
    return min(risk_score, 100.0)  # Cap at 100
