"""
Rate limiting module for SDRCAS communication layer.
Implements token bucket algorithm for rate limiting requests.
"""

import time
from typing import Dict, Tuple
from threading import Lock


class RateLimiter:
    """
    Token bucket rate limiter for controlling request rates.
    
    The token bucket algorithm allows bursts up to the bucket capacity
    while maintaining an average rate over time.
    
    Attributes:
        rate: Maximum requests per second
        capacity: Maximum burst size (bucket capacity)
        
    Requirements: 6.3
    """
    
    def __init__(self, rate: float = 10.0, capacity: int = 20):
        """
        Initialize rate limiter with token bucket parameters.
        
        Args:
            rate: Maximum requests per second (tokens added per second)
            capacity: Maximum burst size (maximum tokens in bucket)
            
        Raises:
            ValueError: If rate or capacity is not positive
        """
        if rate <= 0:
            raise ValueError("Rate must be positive")
        if capacity <= 0:
            raise ValueError("Capacity must be positive")
        
        self.rate = rate
        self.capacity = capacity
        
        # Track buckets per source: {source_id: (tokens, last_update_time)}
        self._buckets: Dict[str, Tuple[float, float]] = {}
        self._lock = Lock()
    
    def check_rate(self, source: str) -> bool:
        """
        Check if a request from the source is allowed under rate limits.
        
        This method checks if there are tokens available in the bucket
        for the given source. If allowed, it does NOT consume a token.
        Use record_request() to actually consume a token.
        
        Args:
            source: Identifier of the request source
            
        Returns:
            True if request is allowed, False if rate limit exceeded
            
        Requirements: 6.3
        """
        with self._lock:
            tokens, _ = self._get_current_tokens(source)
            return tokens >= 1.0
    
    def record_request(self, source: str) -> bool:
        """
        Record a request from the source and consume a token.
        
        This method updates the token bucket for the source and
        consumes one token if available.
        
        Args:
            source: Identifier of the request source
            
        Returns:
            True if request was allowed and recorded, False if rate limit exceeded
            
        Requirements: 6.3
        """
        with self._lock:
            tokens, last_update = self._get_current_tokens(source)
            
            # Check if we have tokens available
            if tokens >= 1.0:
                # Consume one token
                self._buckets[source] = (tokens - 1.0, time.time())
                return True
            else:
                # Rate limit exceeded
                return False
    
    def _get_current_tokens(self, source: str) -> Tuple[float, float]:
        """
        Get the current number of tokens for a source.
        
        This method refills the bucket based on elapsed time since
        the last update.
        
        Args:
            source: Identifier of the request source
            
        Returns:
            Tuple of (current_tokens, last_update_time)
        """
        current_time = time.time()
        
        if source not in self._buckets:
            # New source, start with full bucket
            return (float(self.capacity), current_time)
        
        tokens, last_update = self._buckets[source]
        
        # Calculate tokens to add based on elapsed time
        elapsed = current_time - last_update
        tokens_to_add = elapsed * self.rate
        
        # Refill bucket, capped at capacity
        new_tokens = min(tokens + tokens_to_add, float(self.capacity))
        
        return (new_tokens, last_update)
    
    def reset(self, source: str) -> None:
        """
        Reset the rate limit for a specific source.
        
        Args:
            source: Identifier of the request source
        """
        with self._lock:
            if source in self._buckets:
                del self._buckets[source]
    
    def reset_all(self) -> None:
        """
        Reset rate limits for all sources.
        """
        with self._lock:
            self._buckets.clear()
    
    def get_wait_time(self, source: str) -> float:
        """
        Get the time in seconds until the next request would be allowed.
        
        Args:
            source: Identifier of the request source
            
        Returns:
            Time in seconds to wait (0.0 if request would be allowed now)
        """
        with self._lock:
            tokens, _ = self._get_current_tokens(source)
            
            if tokens >= 1.0:
                return 0.0
            
            # Calculate time needed to accumulate 1 token
            tokens_needed = 1.0 - tokens
            wait_time = tokens_needed / self.rate
            
            return wait_time
