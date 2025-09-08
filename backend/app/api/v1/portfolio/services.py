"""
Business logic services for portfolio domain.

This module contains the business logic for portfolio operations,
separated from the API endpoints for better organization and testability.
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.database import User, Portfolio, PriceHistory
from app.services.stellar_oracle import stellar_oracle_client
from .models import PortfolioCreate, AssetCreate, AssetUpdate, SyncRequest
from .validators import validate_stellar_address, validate_asset_exists
from .utils import discover_wallet_assets, calculate_simple_risk_score, format_asset_data
from datetime import datetime
from app.api.v1.alerts import create_sample_alerts


class PortfolioService:
    """Service class for portfolio business logic"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def create_user(self, portfolio_data: PortfolioCreate) -> Dict[str, Any]:
        """Create a new user/portfolio with automatic asset discovery"""
        try:
            # Check if user already exists
            existing_user = self.db.query(User).filter(
                User.wallet_address == portfolio_data.wallet_address
            ).first()            
            
            if existing_user:
                return {
                    "message": "User already exists",
                    "user_id": str(existing_user.id)
                }
            
            # Create new user
            new_user = User(
                wallet_address=portfolio_data.wallet_address,
                risk_tolerance=portfolio_data.risk_tolerance
            )
            self.db.add(new_user)
            self.db.commit()
            self.db.refresh(new_user)
            
            # Discover assets from wallet
            discovered_assets = await discover_wallet_assets(portfolio_data.wallet_address)
            assets_added = 0
            
            # If no assets discovered, add some mock assets for demonstration
            if not discovered_assets:
                print(f"INFO: No assets discovered for {portfolio_data.wallet_address}, adding mock assets")
                discovered_assets = [
                    {
                        'asset_code': 'XLM',
                        'asset_issuer': None,
                        'balance': 1000.0,
                        'target_allocation': 0.0,
                        'status': 'owned',
                        'price_usd': 0.12  # Set mock price directly
                    },
                    {
                        'asset_code': 'USDC',
                        'asset_issuer': 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
                        'balance': 500.0,
                        'target_allocation': 0.0,
                        'status': 'owned',
                        'price_usd': 1.0  # Set mock price directly
                    }
                ]
            
            # Get current prices for discovered assets (only if not already set)
            for asset_data in discovered_assets:
                if 'price_usd' not in asset_data or asset_data['price_usd'] is None:
                    try:
                        price_usd = await stellar_oracle_client.get_asset_price(
                            asset_data['asset_code'], 
                            asset_data['asset_issuer']
                        )
                        if price_usd:
                            asset_data['price_usd'] = price_usd
                        else:
                            asset_data['price_usd'] = 0.0
                    except Exception as e:
                        print(f"Warning: Could not get price for {asset_data['asset_code']}: {str(e)}")
                        asset_data['price_usd'] = 0.0
            
            for asset_data in discovered_assets:
                if asset_data['balance'] > 0:  # Only add assets with balance > 0
                    # Check if asset already exists (regardless of status)
                    existing_asset = self.db.query(Portfolio).filter(
                        Portfolio.user_id == new_user.id,
                        Portfolio.asset_code == asset_data['asset_code'],
                        Portfolio.asset_issuer == asset_data['asset_issuer']
                    ).first()
                    
                    if not existing_asset:
                        new_asset = Portfolio(
                            user_id=new_user.id,
                            asset_code=asset_data['asset_code'],
                            asset_issuer=asset_data['asset_issuer'],
                            balance=asset_data['balance'],
                            target_allocation=asset_data['target_allocation'],
                            status=asset_data['status']
                        )
                        self.db.add(new_asset)
                        assets_added += 1
                    else:
                        # Update existing asset if it was hidden and now has balance
                        if existing_asset.status == 'hidden' and asset_data['balance'] > 0:
                            existing_asset.balance = asset_data['balance']
                            existing_asset.status = 'owned'
                            existing_asset.updated_at = datetime.utcnow()
                            assets_added += 1
            
            self.db.commit()
            
            # Create sample alerts for the new user
            try:
                await create_sample_alerts(portfolio_data.wallet_address, self.db)
            except Exception as e:
                print(f"Warning: Could not create sample alerts: {str(e)}")
            
            return {
                "message": "User created successfully",
                "user_id": str(new_user.id),
                "assets_discovered": str(assets_added)
            }
            
        except Exception as e:
            self.db.rollback()
            raise e
    
    async def get_portfolio(self, wallet_address: str) -> Dict[str, Any]:
        """Get portfolio data for a user"""
        if not validate_stellar_address(wallet_address):
            raise ValueError("Invalid wallet address format")
        
        user = self.db.query(User).filter(User.wallet_address == wallet_address).first()
        if not user:
            # Log all users for debugging
            all_users = self.db.query(User).all()
            print(f"DEBUG: Looking for wallet {wallet_address}")
            print(f"DEBUG: Found {len(all_users)} users in database:")
            for u in all_users:
                print(f"  - {u.wallet_address} (ID: {u.id})")
            raise ValueError("User not found")
        
        assets = self.db.query(Portfolio).filter(Portfolio.user_id == user.id).all()
        
        assets_data = []
        for asset in assets:
            # Get current price
            try:
                price_usd = await stellar_oracle_client.get_asset_price(
                    asset.asset_code, asset.asset_issuer
                )
                # If no price available, set to 0
                if price_usd is None or price_usd == 0.0:
                    price_usd = 0.0
            except Exception:
                price_usd = 0.0
            
            asset_data = format_asset_data(asset, price_usd)
            assets_data.append(asset_data)
        
        # Calculate total portfolio value
        total_value = sum(asset["value_usd"] for asset in assets_data)
        
        # Calculate current allocations
        for asset in assets_data:
            if total_value > 0:
                asset["current_allocation"] = (asset["value_usd"] / total_value) * 100
            else:
                asset["current_allocation"] = 0.0
        
        # Calculate risk score
        risk_score = calculate_simple_risk_score(assets_data)
        
        return {
            "user_id": str(user.id),
            "wallet_address": user.wallet_address,
            "risk_tolerance": user.risk_tolerance,
            "total_value": total_value,
            "risk_score": risk_score,
            "assets": assets_data,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    
    async def add_asset(self, wallet_address: str, asset_data: AssetCreate) -> Dict[str, Any]:
        """Add an asset to user's portfolio"""
        if not validate_stellar_address(wallet_address):
            raise ValueError("Invalid wallet address format")
        
        # Validate asset exists in the Stellar network
        if not await validate_asset_exists(asset_data.asset_code, asset_data.asset_issuer):
            raise ValueError("Invalid asset")
        
        user = self.db.query(User).filter(User.wallet_address == wallet_address).first()
        if not user:
            raise ValueError("User not found")
        
        # Check if asset already exists
        existing_asset = self.db.query(Portfolio).filter(
            Portfolio.user_id == user.id,
            Portfolio.asset_code == asset_data.asset_code,
            Portfolio.asset_issuer == asset_data.asset_issuer
        ).first()
        
        if existing_asset:
            # Update existing asset
            existing_asset.balance = asset_data.balance
            existing_asset.target_allocation = asset_data.target_allocation
            existing_asset.status = asset_data.status
            existing_asset.notes = asset_data.notes
            if asset_data.target_date:
                existing_asset.target_date = datetime.fromisoformat(
                    asset_data.target_date.replace('Z', '+00:00')
                )
            existing_asset.updated_at = datetime.utcnow()
            asset_id = existing_asset.id
            message = "Asset updated successfully"
        else:
            # Create new asset
            new_asset = Portfolio(
                user_id=user.id,
                asset_code=asset_data.asset_code,
                asset_issuer=asset_data.asset_issuer,
                balance=asset_data.balance,
                target_allocation=asset_data.target_allocation,
                status=asset_data.status,
                notes=asset_data.notes
            )
            if asset_data.target_date:
                new_asset.target_date = datetime.fromisoformat(
                    asset_data.target_date.replace('Z', '+00:00')
                )
            
            self.db.add(new_asset)
            self.db.commit()
            self.db.refresh(new_asset)
            asset_id = new_asset.id
            message = "Asset added successfully"
        
        self.db.commit()
        
        return {
            "asset_id": asset_id,
            "message": message
        }
    
    async def update_asset(self, wallet_address: str, asset_id: int, update_data: AssetUpdate) -> Dict[str, Any]:
        """Update an asset in user's portfolio"""
        if not validate_stellar_address(wallet_address):
            raise ValueError("Invalid wallet address format")
        
        user = self.db.query(User).filter(User.wallet_address == wallet_address).first()
        if not user:
            raise ValueError("User not found")
        
        asset = self.db.query(Portfolio).filter(
            Portfolio.id == asset_id,
            Portfolio.user_id == user.id
        ).first()
        
        if not asset:
            raise ValueError("Asset not found")
        
        updated_fields = []
        
        if update_data.status is not None:
            asset.status = update_data.status
            updated_fields.append("status")
        
        if update_data.notes is not None:
            asset.notes = update_data.notes
            updated_fields.append("notes")
        
        if update_data.target_date is not None:
            asset.target_date = datetime.fromisoformat(
                update_data.target_date.replace('Z', '+00:00')
            )
            updated_fields.append("target_date")
        
        if update_data.target_allocation is not None:
            asset.target_allocation = update_data.target_allocation
            updated_fields.append("target_allocation")
        
        asset.updated_at = datetime.utcnow()
        self.db.commit()
        
        return {
            "message": "Asset updated successfully",
            "updated_fields": updated_fields
        }
    
    async def delete_asset(self, wallet_address: str, asset_id: int) -> Dict[str, Any]:
        """Delete an asset from user's portfolio"""
        if not validate_stellar_address(wallet_address):
            raise ValueError("Invalid wallet address format")
        
        user = self.db.query(User).filter(User.wallet_address == wallet_address).first()
        if not user:
            raise ValueError("User not found")
        
        asset = self.db.query(Portfolio).filter(
            Portfolio.id == asset_id,
            Portfolio.user_id == user.id
        ).first()
        
        if not asset:
            raise ValueError("Asset not found")
        
        # For owned assets, just hide them instead of deleting
        if asset.status == 'owned':
            asset.status = 'hidden'
            asset.updated_at = datetime.utcnow()
            self.db.commit()
            return {"message": "Asset hidden successfully"}
        else:
            # For planned assets, delete completely
            self.db.delete(asset)
            self.db.commit()
            return {"message": "Asset deleted successfully"}
    
    async def sync_portfolio(self, wallet_address: str, sync_request: SyncRequest) -> Dict[str, Any]:
        """Sync portfolio with current wallet state"""
        if not validate_stellar_address(wallet_address):
            raise ValueError("Invalid wallet address format")
        
        user = self.db.query(User).filter(User.wallet_address == wallet_address).first()
        if not user:
            raise ValueError("User not found")
        
        # Discover current assets in wallet
        discovered_assets = await discover_wallet_assets(wallet_address)
        
        # Get current portfolio assets
        current_assets = self.db.query(Portfolio).filter(
            Portfolio.user_id == user.id,
            Portfolio.status != 'hidden'
        ).all()
        
        # Create a map of current assets for quick lookup
        current_asset_map = {}
        for asset in current_assets:
            key = f"{asset.asset_code}:{asset.asset_issuer or 'XLM'}"
            current_asset_map[key] = asset
        
        # Track changes
        assets_added = 0
        assets_updated = 0
        
        # Process discovered assets
        for discovered_asset in discovered_assets:
            key = f"{discovered_asset['asset_code']}:{discovered_asset['asset_issuer'] or 'XLM'}"
            
            if key in current_asset_map:
                # Update existing asset
                existing_asset = current_asset_map[key]
                if existing_asset.balance != discovered_asset['balance']:
                    existing_asset.balance = discovered_asset['balance']
                    existing_asset.updated_at = datetime.utcnow()
                    assets_updated += 1
            else:
                # Add new asset
                if discovered_asset['balance'] > 0:
                    new_asset = Portfolio(
                        user_id=user.id,
                        asset_code=discovered_asset['asset_code'],
                        asset_issuer=discovered_asset['asset_issuer'],
                        balance=discovered_asset['balance'],
                        target_allocation=0.0,
                        status='owned'
                    )
                    self.db.add(new_asset)
                    assets_added += 1
        
        self.db.commit()
        
        return {
            "message": "Portfolio synced successfully",
            "assets_added": assets_added,
            "assets_updated": assets_updated,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    
    async def get_asset_details(self, wallet_address: str, asset_id: int) -> Dict[str, Any]:
        """Get detailed information about a specific asset"""
        if not validate_stellar_address(wallet_address):
            raise ValueError("Invalid wallet address format")
        
        user = self.db.query(User).filter(User.wallet_address == wallet_address).first()
        if not user:
            raise ValueError("User not found")
        
        asset = self.db.query(Portfolio).filter(
            Portfolio.id == asset_id,
            Portfolio.user_id == user.id
        ).first()
        
        if not asset:
            raise ValueError("Asset not found")
        
        # Get current price
        try:
            price_usd = await stellar_oracle_client.get_asset_price(
                asset.asset_code, asset.asset_issuer
            )
        except Exception:
            price_usd = 0.0
        
        # Get price history from oracle (last 30 days)
        try:
            history_data = await stellar_oracle_client.get_price_history(
                asset.asset_code, asset.asset_issuer, 30
            )
        except Exception as e:
            print(f"Warning: Could not get price history for {asset.asset_code}: {str(e)}")
            history_data = []
        
        asset_data = format_asset_data(asset, price_usd)
        asset_data["price_history"] = history_data
        
        return asset_data

