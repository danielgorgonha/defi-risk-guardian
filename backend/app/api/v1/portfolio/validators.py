"""
Custom validators for portfolio domain.

This module contains validation functions used throughout the portfolio domain.
"""

import re
from stellar_sdk import Keypair
from stellar_sdk.exceptions import Ed25519PublicKeyInvalidError


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


def validate_asset_exists(asset_code: str, asset_issuer: str = None) -> bool:
    """
    Validate if an asset exists in the Stellar network.
    
    TODO: Implement actual network validation via Horizon API
    For now, returns True for basic validation
    """
    if not asset_code or not isinstance(asset_code, str):
        return False
    
    # Basic validation - asset code should not be empty
    if len(asset_code.strip()) == 0:
        return False
    
    # For custom assets, issuer should be provided
    if asset_code != 'XLM' and not asset_issuer:
        return False
    
    # TODO: Add actual network validation
    # This would involve querying Horizon API to check if the asset exists
    
    return True

