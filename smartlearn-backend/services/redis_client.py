import os
import json
import logging
from typing import Any, Optional
import redis

logger = logging.getLogger(__name__)

# Fallback in-memory cache if Redis is not available
_FALLBACK_CACHE = {}

# Initialize Redis client
REDIS_URL = os.getenv("REDIS_URL")
_redis_client = None

if REDIS_URL:
    try:
        _redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
        # Test connection
        _redis_client.ping()
        logger.info("✅ Redis connected successfully.")
    except Exception as e:
        logger.warning(f"⚠️ Redis connection failed: {e}. Falling back to in-memory cache.")
        _redis_client = None
else:
    logger.info("ℹ️ No REDIS_URL found. Using fast in-memory fallback cache.")

def get_cache(key: str) -> Optional[Any]:
    """Retrieve data from cache."""
    try:
        if _redis_client:
            data = _redis_client.get(key)
            if data:
                return json.loads(data)
            return None
        else:
            return _FALLBACK_CACHE.get(key)
    except Exception as e:
        logger.error(f"Cache GET error: {e}")
        return None

def set_cache(key: str, value: Any, expire_seconds: int = 3600) -> bool:
    """Store data in cache with an expiration time (default 1 hour)."""
    try:
        if _redis_client:
            _redis_client.setex(key, expire_seconds, json.dumps(value))
            return True
        else:
            # Simple in-memory storage (does not handle auto-expiration for simplicity, 
            # but speeds up reads indefinitely until restart/cleared)
            _FALLBACK_CACHE[key] = value
            return True
    except Exception as e:
        logger.error(f"Cache SET error: {e}")
        return False

def delete_cache(key: str) -> bool:
    """Delete a specific key from cache."""
    try:
        if _redis_client:
            _redis_client.delete(key)
            return True
        else:
            if key in _FALLBACK_CACHE:
                del _FALLBACK_CACHE[key]
            return True
    except Exception as e:
        logger.error(f"Cache DELETE error: {e}")
        return False

def delete_cache_pattern(pattern: str) -> bool:
    """Delete all keys matching a pattern (e.g., 'user_chats:*')."""
    try:
        if _redis_client:
            # Scan for keys matching pattern and delete them
            cursor = 0
            while True:
                cursor, keys = _redis_client.scan(cursor=cursor, match=pattern, count=100)
                if keys:
                    _redis_client.delete(*keys)
                if cursor == 0:
                    break
            return True
        else:
            # Fallback pattern matching
            if pattern.endswith('*'):
                prefix = pattern[:-1]
                keys_to_delete = [k for k in _FALLBACK_CACHE.keys() if k.startswith(prefix)]
                for k in keys_to_delete:
                    del _FALLBACK_CACHE[k]
            else:
                delete_cache(pattern)
            return True
    except Exception as e:
        logger.error(f"Cache DELETE PATTERN error: {e}")
        return False

import time

def check_rate_limit(key: str, max_requests: int, window_seconds: int) -> bool:
    """
    Rate limiter: Returns True if allowed, False if exceeded.
    Falls back to in-memory dict if Redis is unavailable.
    """
    try:
        if _redis_client:
            current = _redis_client.incr(key)
            if current == 1:
                _redis_client.expire(key, window_seconds)
            if current > max_requests:
                return False
            return True
        else:
            now = time.time()
            if key not in _FALLBACK_CACHE:
                _FALLBACK_CACHE[key] = {"count": 1, "start_time": now}
                return True
            
            record = _FALLBACK_CACHE[key]
            if now - record["start_time"] > window_seconds:
                _FALLBACK_CACHE[key] = {"count": 1, "start_time": now}
                return True
            
            record["count"] += 1
            if record["count"] > max_requests:
                return False
            return True
    except Exception as e:
        logger.error(f"Rate limit error: {e}")
        return True # Fail open so we don't break the app if cache is down
