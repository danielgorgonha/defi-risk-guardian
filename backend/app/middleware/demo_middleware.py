"""
Demo Mode Middleware
Automatically detects demo requests and configures endpoints to use fixture data
"""

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import logging
import json
import re

logger = logging.getLogger(__name__)

DEMO_WALLET_ADDRESS = "GDEMOTEST1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJK"

class DemoMiddleware(BaseHTTPMiddleware):
    """
    Middleware that detects demo wallet requests and sets demo context
    """
    
    async def dispatch(self, request: Request, call_next):
        # Debug logging
        logger.info(f"DemoMiddleware processing request: {request.method} {request.url.path}")
        
        # Check if this is a demo request
        is_demo_request = await self._is_demo_request(request)
        
        # Add demo flag to request state
        request.state.is_demo_mode = is_demo_request
        request.state.demo_wallet = DEMO_WALLET_ADDRESS if is_demo_request else None
        
        if is_demo_request:
            logger.info(f"✅ Demo request detected for path: {request.url.path}")
        else:
            logger.info(f"❌ Not a demo request for path: {request.url.path}")
        
        # Process the request
        response = await call_next(request)
        
        # Add demo header to response if in demo mode
        if is_demo_request:
            response.headers["X-Demo-Mode"] = "true"
            response.headers["X-Demo-Wallet"] = DEMO_WALLET_ADDRESS
        
        return response
    
    async def _is_demo_request(self, request: Request) -> bool:
        """
        Detect if this is a demo request by checking for isDemoMode flag
        """
        try:
            # Method 1: Check query parameters for isDemoMode=true
            if request.query_params.get("isDemoMode") == "true":
                logger.info(f"Demo mode detected via query param: {request.url}")
                return True
            
            # Method 2: Check custom header X-Demo-Mode
            if request.headers.get("X-Demo-Mode") == "true":
                logger.info(f"Demo mode detected via header")
                return True
            
            # Method 3: Check request body for isDemoMode flag
            if request.method in ["POST", "PUT", "PATCH"]:
                body = await self._get_request_body(request)
                if body:
                    try:
                        import json
                        body_data = json.loads(body)
                        if body_data.get("isDemoMode") is True:
                            logger.info(f"Demo mode detected via request body JSON")
                            return True
                    except json.JSONDecodeError:
                        # Check for string patterns in case body isn't valid JSON
                        if '"isDemoMode":true' in body or '"isDemoMode": true' in body:
                            logger.info(f"Demo mode detected via request body string")
                            return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error checking demo request: {str(e)}")
            return False
    
    async def _get_request_body(self, request: Request) -> str:
        """
        Safely get request body content
        """
        try:
            # Store original body for later use
            body = await request.body()
            
            # Create a new request with the same body for downstream processing
            async def receive():
                return {"type": "http.request", "body": body, "more_body": False}
            
            # Replace the receive function
            request._receive = receive
            
            return body.decode("utf-8") if body else ""
            
        except Exception as e:
            logger.error(f"Error reading request body: {str(e)}")
            return ""

def get_demo_context(request: Request) -> dict:
    """
    Helper function to get demo context from request
    """
    return {
        "is_demo_mode": getattr(request.state, "is_demo_mode", False),
        "demo_wallet": getattr(request.state, "demo_wallet", None)
    }
