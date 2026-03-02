"""
Caching & Fallback Response System
Massive speed boost + resilient error handling
"""

from functools import lru_cache
from typing import Dict, List, Any, Optional, Callable
from datetime import datetime, timedelta
import json


class CacheManager:
    """
    Simple in-memory cache with TTL support.
    For scaling: replace with Redis.
    """
    
    def __init__(self, ttl_seconds: int = 3600):
        """
        Initialize cache manager.
        
        Args:
            ttl_seconds: Time-to-live for cached items (default 1 hour)
        """
        self._cache: Dict[str, Dict[str, Any]] = {}
        self.ttl_seconds = ttl_seconds
        self.hits = 0
        self.misses = 0
    
    def get(self, key: str) -> Optional[Any]:
        """Retrieve value from cache."""
        if key not in self._cache:
            self.misses += 1
            return None
        
        cache_entry = self._cache[key]
        
        # Check if expired
        if cache_entry["expires_at"] < datetime.now():
            del self._cache[key]
            self.misses += 1
            return None
        
        self.hits += 1
        return cache_entry["value"]
    
    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        """Store value in cache."""
        ttl = ttl_seconds or self.ttl_seconds
        self._cache[key] = {
            "value": value,
            "expires_at": datetime.now() + timedelta(seconds=ttl),
            "created_at": datetime.now()
        }
    
    def delete(self, key: str) -> bool:
        """Remove value from cache."""
        if key in self._cache:
            del self._cache[key]
            return True
        return False
    
    def clear(self) -> int:
        """Clear entire cache. Returns count of items cleared."""
        count = len(self._cache)
        self._cache.clear()
        return count
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache performance stats."""
        total = self.hits + self.misses
        hit_rate = (self.hits / total * 100) if total > 0 else 0
        
        return {
            "hits": self.hits,
            "misses": self.misses,
            "total_requests": total,
            "hit_rate": f"{hit_rate:.1f}%",
            "cached_items": len(self._cache),
            "ttl_seconds": self.ttl_seconds
        }
    
    def cleanup_expired(self) -> int:
        """Remove expired entries. Returns count removed."""
        now = datetime.now()
        expired_keys = [
            k for k, v in self._cache.items()
            if v["expires_at"] < now
        ]
        for key in expired_keys:
            del self._cache[key]
        return len(expired_keys)


class CachedDataLoader:
    """
    Caches expensive data operations.
    """
    
    def __init__(self, cache_manager: CacheManager):
        self.cache = cache_manager
    
    def get_streams(self, load_func: Callable) -> List[Dict[str, Any]]:
        """Cache streams data."""
        cache_key = "streams:all"
        
        cached = self.cache.get(cache_key)
        if cached is not None:
            return cached
        
        data = load_func()
        self.cache.set(cache_key, data, ttl_seconds=3600)  # Cache for 1 hour
        return data
    
    def get_careers(self, load_func: Callable) -> List[Dict[str, Any]]:
        """Cache careers data."""
        cache_key = "careers:all"
        
        cached = self.cache.get(cache_key)
        if cached is not None:
            return cached
        
        data = load_func()
        self.cache.set(cache_key, data, ttl_seconds=3600)
        return data
    
    def get_career_detail(self, career_id: str, load_func: Callable) -> Optional[Dict[str, Any]]:
        """Cache individual career details."""
        cache_key = f"career:detail:{career_id}"
        
        cached = self.cache.get(cache_key)
        if cached is not None:
            return cached
        
        data = load_func(career_id)
        if data:
            self.cache.set(cache_key, data, ttl_seconds=3600)
        return data
    
    def get_exam_info(self, exam_id: str, load_func: Callable) -> Optional[Dict[str, Any]]:
        """Cache exam information."""
        cache_key = f"exam:info:{exam_id}"
        
        cached = self.cache.get(cache_key)
        if cached is not None:
            return cached
        
        data = load_func(exam_id)
        if data:
            self.cache.set(cache_key, data, ttl_seconds=7200)  # Cache for 2 hours
        return data
    
    def get_chatbot_response(self, intent: str, entity: str, load_func: Callable) -> Optional[str]:
        """
        Cache chatbot responses per intent+entity combination.
        Cheap cache invalidation: clear on data updates.
        """
        cache_key = f"chatbot:response:{intent}:{entity}"
        
        cached = self.cache.get(cache_key)
        if cached is not None:
            return cached
        
        response = load_func(intent, entity)
        if response:
            self.cache.set(cache_key, response, ttl_seconds=7200)
        return response
    
    def invalidate_career_cache(self, career_id: Optional[str] = None) -> int:
        """
        Invalidate career-related cache on data update.
        If career_id is None, invalidates ALL career caches.
        """
        if career_id is None:
            # Clear all career caches
            count = 0
            count += self.cache.delete("careers:all")
            # Clear individual career caches (brute force - OK for small datasets)
            for key in list(self.cache._cache.keys()):
                if key.startswith("career:"):
                    count += self.cache.delete(key)
            return count
        else:
            return self.cache.delete(f"career:detail:{career_id}")


class FallbackResponses:
    """
    User-friendly fallback messages when data unavailable.
    Never expose raw errors to frontend.
    """
    
    @staticmethod
    def get_generic_error() -> Dict[str, Any]:
        """Generic error message."""
        return {
            "success": False,
            "message": "I'm having trouble retrieving that information right now. Please try again in a moment.",
            "fallback": True,
            "suggestion": "Try asking about a different career or topic."
        }
    
    @staticmethod
    def get_not_found_message(entity_type: str) -> Dict[str, Any]:
        """Message when specific entity not found."""
        messages = {
            "career": "I don't have information about that career yet. Try asking about Software Engineer, Doctor, or Chartered Accountant.",
            "exam": "I don't have details about that exam. Try asking about NEET, JEE, CA Foundation, or UPSC.",
            "stream": "I don't recognize that stream. Try Science, Commerce, or Arts.",
            "course": "I don't have information about that course. Try asking about B.Tech, MBBS, or B.Com."
        }
        return {
            "success": False,
            "message": messages.get(entity_type, "I don't have information about that."),
            "fallback": True
        }
    
    @staticmethod
    def get_temporary_unavailable() -> Dict[str, Any]:
        """Message for temporary service issues."""
        return {
            "success": False,
            "message": "Career data is temporarily unavailable. Please try again.",
            "fallback": True,
            "retry_after_seconds": 60
        }
    
    @staticmethod
    def get_clarification_unavailable(intent: str) -> Dict[str, Any]:
        """Fallback when clarification system unavailable."""
        return {
            "success": False,
            "message": "Could you provide more details? I'm having trouble understanding your question.",
            "fallback": True,
            "alternative": "Try asking about eligibility, exams, or career roadmap."
        }
    
    @staticmethod
    def wrap_with_fallback(func: Callable, *args, **kwargs) -> Dict[str, Any]:
        """
        Safely execute function with fallback.
        
        Usage:
            result = FallbackResponses.wrap_with_fallback(
                some_function, arg1, arg2, kwarg1=value
            )
        """
        try:
            result = func(*args, **kwargs)
            if result is None:
                return FallbackResponses.get_generic_error()
            return {"success": True, "data": result, "fallback": False}
        except KeyError as e:
            return FallbackResponses.get_not_found_message("unknown")
        except Exception as e:
            # Log actual error server-side, never expose to frontend
            print(f"ERROR in {func.__name__}: {str(e)}")
            return FallbackResponses.get_generic_error()


class ResponseCacheDecorator:
    """
    Decorator for caching API responses.
    
    Usage:
        @response_cache(ttl_seconds=3600)
        def get_career_info(career_id):
            ...
    """
    
    _cache = CacheManager()
    
    @classmethod
    def cache_endpoint(cls, ttl_seconds: int = 3600):
        """Decorator for caching function results."""
        def decorator(func):
            def wrapper(*args, **kwargs):
                # Create cache key from function name and arguments
                key_parts = [func.__name__]
                key_parts.extend(str(arg) for arg in args if arg is not None)
                key_parts.extend(f"{k}={v}" for k, v in kwargs.items())
                cache_key = ":".join(key_parts)
                
                # Check cache
                cached = cls._cache.get(cache_key)
                if cached is not None:
                    return cached
                
                # Execute and cache
                result = func(*args, **kwargs)
                cls._cache.set(cache_key, result, ttl_seconds)
                return result
            
            return wrapper
        return decorator
