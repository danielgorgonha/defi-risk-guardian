"""
Pydantic models for portfolio domain.

This module contains all Pydantic models used for request/response validation
in the portfolio endpoints.
"""

from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime
from stellar_sdk import Keypair
from stellar_sdk.exceptions import Ed25519PublicKeyInvalidError
import re


class PortfolioCreate(BaseModel):
    """Model for creating a new portfolio/user"""
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
    """Model for adding an asset to portfolio"""
    asset_code: str
    asset_issuer: Optional[str] = None
    balance: float
    target_allocation: float
    status: str = 'owned'
    notes: Optional[str] = None
    target_date: Optional[str] = None

    @validator('target_date')
    def validate_target_date(cls, v):
        if v is not None:
            try:
                datetime.fromisoformat(v.replace('Z', '+00:00'))
            except ValueError:
                raise ValueError('target_date must be a valid ISO format datetime')
        return v


class AssetUpdate(BaseModel):
    """Model for updating an asset in portfolio"""
    status: Optional[str] = None
    notes: Optional[str] = None
    target_date: Optional[str] = None
    target_allocation: Optional[float] = None

    @validator('status')
    def validate_status(cls, v):
        if v is not None and v not in ['owned', 'planned', 'hidden']:
            raise ValueError('Status must be one of: owned, planned, hidden')
        return v

    @validator('target_date')
    def validate_target_date(cls, v):
        if v is not None:
            try:
                datetime.fromisoformat(v.replace('Z', '+00:00'))
            except ValueError:
                raise ValueError('target_date must be a valid ISO format datetime')
        return v


class SyncRequest(BaseModel):
    """Model for portfolio sync request"""
    force_refresh: bool = False
