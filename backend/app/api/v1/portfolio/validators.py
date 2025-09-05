"""
Custom validators for portfolio domain.

This module contains validation functions used throughout the portfolio domain.
"""

import re
import asyncio
from typing import Optional
from stellar_sdk import Keypair, Server
from stellar_sdk.exceptions import Ed25519PublicKeyInvalidError, NotFoundError
from app.core.config import settings


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


async def validate_asset_exists(asset_code: str, asset_issuer: Optional[str] = None) -> bool:
    """
    Validate if an asset exists in the Stellar network.
    
    Args:
        asset_code: The asset code (e.g., 'XLM', 'USDC')
        asset_issuer: The asset issuer public key (required for custom assets)
    
    Returns:
        bool: True if asset exists and is valid, False otherwise
    """
    if not asset_code or not isinstance(asset_code, str):
        return False
    
    # Basic validation - asset code should not be empty
    if len(asset_code.strip()) == 0:
        return False
    
    # For custom assets, issuer should be provided
    if asset_code != 'XLM' and not asset_issuer:
        return False
    
    # XLM (native asset) always exists
    if asset_code == 'XLM':
        return True
    
    # Validate issuer address format if provided
    if asset_issuer and not validate_stellar_address(asset_issuer):
        return False
    
    # Query Horizon API to check if the asset exists
    try:
        server = Server(settings.HORIZON_URL)
        
        # Get asset details from Horizon API
        asset = server.assets().for_code(asset_code).for_issuer(asset_issuer).call()
        
        # If we get here, the asset exists
        return True
        
    except NotFoundError:
        # Asset not found in the network
        return False
    except Exception:
        # Any other error (network issues, etc.) - be conservative and return False
        return False


def validate_asset_exists_sync(asset_code: str, asset_issuer: Optional[str] = None) -> bool:
    """
    Synchronous wrapper for validate_asset_exists.
    
    This is useful when you need to call the async function from a sync context.
    """
    try:
        loop = asyncio.get_event_loop()
        return loop.run_until_complete(validate_asset_exists(asset_code, asset_issuer))
    except RuntimeError:
        # If no event loop is running, create a new one
        return asyncio.run(validate_asset_exists(asset_code, asset_issuer))

