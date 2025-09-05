"""
Redis cache service for DeFi Risk Guardian
"""

import redis
import json
import logging
from typing import Any, Optional, Union
from datetime import timedelta
from app.core.config import settings

logger = logging.getLogger(__name__)

class CacheService:
    """Redis cache service with TTL support"""
    
    def __init__(self):
        try:
            self.redis_client = redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5
            )
            # Test connection
            self.redis_client.ping()
            self.connected = True
            logger.info("Redis connection established")
        except Exception as e:
            logger.error(f"Redis connection failed: {e}")
            self.redis_client = None
            self.connected = False
    
    def is_connected(self) -> bool:
        """Check if Redis is connected"""
        if not self.connected or not self.redis_client:
            return False
        try:
            self.redis_client.ping()
            return True
        except Exception:
            self.connected = False
            return False
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.is_connected():
            return None
        
        try:
            value = self.redis_client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {e}")
            return None
    
    def set(self, key: str, value: Any, ttl_seconds: int = 300) -> bool:
        """Set value in cache with TTL"""
        if not self.is_connected():
            return False
        
        try:
            serialized_value = json.dumps(value)
            return self.redis_client.setex(key, ttl_seconds, serialized_value)
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        if not self.is_connected():
            return False
        
        try:
            return bool(self.redis_client.delete(key))
        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {e}")
            return False
    
    def get_stats(self) -> dict:
        """Get Redis connection stats"""
        if not self.is_connected():
            return {"status": "disconnected"}
        
        try:
            info = self.redis_client.info()
            return {
                "status": "connected",
                "version": info.get("redis_version", "unknown"),
                "memory_used": info.get("used_memory_human", "unknown"),
                "connected_clients": info.get("connected_clients", 0),
                "total_commands_processed": info.get("total_commands_processed", 0)
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}

# Global cache instance
cache_service = CacheService()
