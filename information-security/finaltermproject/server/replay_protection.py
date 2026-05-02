"""
Replay protection module for SDRCAS.
Provides nonce storage and duplicate detection to prevent replay attacks.
Implements cleanup of expired nonces for maintenance.

Requirements: 5.2, 7.4
"""

import threading
from typing import Dict, Set
from dataclasses import dataclass

from core.time_utils import get_current_timestamp


@dataclass
class NonceEntry:
    """
    Represents a stored nonce with its expiration time.
    
    Attributes:
        nonce: The unique nonce value (32 bytes)
        expires_at: Unix timestamp when this nonce expires
    """
    nonce: bytes
    expires_at: int


class NonceStore:
    """
    Thread-safe in-memory nonce store for replay attack prevention.
    
    Stores nonces with expiration tracking and provides duplicate detection.
    Nonces are automatically cleaned up after expiration.
    """
    
    def __init__(self):
        """Initialize the NonceStore with an empty set and lock for thread safety."""
        self._nonces: Dict[bytes, int] = {}  # Maps nonce -> expires_at
        self._lock = threading.Lock()
    
    def check_and_store(self, nonce: bytes, expires_at: int) -> bool:
        """
        Check if a nonce has been used before, and store it if not.
        
        This is an atomic operation that checks for duplicates and stores
        the nonce in a single thread-safe operation.
        
        Args:
            nonce: The nonce to check and store (32 bytes)
            expires_at: Unix timestamp when this nonce expires
            
        Returns:
            True if the nonce was new and successfully stored
            False if the nonce was already present (replay detected)
            
        Raises:
            ValueError: If nonce is not bytes or expires_at is invalid
        """
        # Validate inputs
        if not isinstance(nonce, bytes):
            raise ValueError("nonce must be bytes")
        
        if len(nonce) != 32:
            raise ValueError("nonce must be exactly 32 bytes")
        
        if not isinstance(expires_at, int) or expires_at < 0:
            raise ValueError("expires_at must be a non-negative integer")
        
        with self._lock:
            # Check if nonce already exists
            if nonce in self._nonces:
                # Replay detected
                return False
            
            # Store the nonce with its expiration time
            self._nonces[nonce] = expires_at
            return True
    
    def cleanup_expired(self) -> int:
        """
        Remove all expired nonces from the store.
        
        This should be called periodically to prevent unbounded memory growth.
        
        Returns:
            Number of expired nonces removed
        """
        current_time = get_current_timestamp()
        
        with self._lock:
            # Find all expired nonces
            expired_nonces = [
                nonce for nonce, expires_at in self._nonces.items()
                if expires_at <= current_time
            ]
            
            # Remove expired nonces
            for nonce in expired_nonces:
                del self._nonces[nonce]
            
            return len(expired_nonces)
    
    def contains(self, nonce: bytes) -> bool:
        """
        Check if a nonce exists in the store (without storing it).
        
        Args:
            nonce: The nonce to check
            
        Returns:
            True if the nonce exists, False otherwise
        """
        with self._lock:
            return nonce in self._nonces
    
    def size(self) -> int:
        """
        Get the current number of stored nonces.
        
        Returns:
            Number of nonces currently in the store
        """
        with self._lock:
            return len(self._nonces)
    
    def clear(self) -> None:
        """
        Remove all nonces from the store.
        
        This is primarily useful for testing or emergency reset.
        """
        with self._lock:
            self._nonces.clear()
