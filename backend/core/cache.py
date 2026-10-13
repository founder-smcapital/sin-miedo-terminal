"""
Asynchronous In-Memory Cache with TTL & Stale-While-Revalidate semantics.
Protects terminal backend against upstream regulatory rate limits and API quotas.
"""
import time
import asyncio
from typing import Any, Optional, Dict, Tuple
from backend.core.config import settings

class InMemoryTTLCache:
    """Thread-safe and async-friendly in-memory cache."""
    def __init__(self, default_ttl: int = 300):
        self._cache: Dict[str, Tuple[Any, float, float]] = {}  # key -> (value, expires_at, created_at)
        self._default_ttl = default_ttl
        self._lock = asyncio.Lock()

    async def get(self, key: str, allow_stale: bool = False) -> Optional[Any]:
        now = time.time()
        async with self._lock:
            item = self._cache.get(key)
            if not item:
                return None
            value, expires_at, _ = item
            if now <= expires_at or allow_stale:
                return value
            # Expired and stale not allowed
            return None

    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        effective_ttl = ttl if ttl is not None else self._default_ttl
        now = time.time()
        expires_at = now + effective_ttl
        async with self._lock:
            self._cache[key] = (value, expires_at, now)

    async def invalidate(self, key: str) -> None:
        async with self._lock:
            self._cache.pop(key, None)

    async def clear(self) -> None:
        async with self._lock:
            self._cache.clear()

# Global cache instance
market_data_cache = InMemoryTTLCache(default_ttl=settings.CACHE_TTL_SECONDS)
