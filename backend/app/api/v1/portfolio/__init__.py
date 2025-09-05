"""
Portfolio domain module.

This module contains all portfolio-related functionality organized by domain:
- models: Pydantic models for validation
- endpoints: FastAPI endpoints
- services: Business logic
- validators: Custom validations
- utils: Utility functions
"""

from .endpoints import router

__all__ = ["router"]
