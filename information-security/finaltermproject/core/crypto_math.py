"""
Cryptographic math utilities for SDRCAS.
Provides constant-time comparison functions and secure random number generation.
"""

import hmac
import secrets
from typing import Optional

from .constants import NONCE_SIZE


def constant_time_compare(a: bytes, b: bytes) -> bool:
    """
    Compare two byte strings in constant time to prevent timing attacks.
    
    Args:
        a: First byte string
        b: Second byte string
        
    Returns:
        True if the byte strings are equal, False otherwise
    """
    return hmac.compare_digest(a, b)


def secure_random_bytes(num_bytes: Optional[int] = None) -> bytes:
    """
    Generate cryptographically secure random bytes.
    
    Args:
        num_bytes: Number of random bytes to generate (default: NONCE_SIZE)
        
    Returns:
        Cryptographically secure random bytes
    """
    if num_bytes is None:
        num_bytes = NONCE_SIZE
    
    return secrets.token_bytes(num_bytes)


def generate_nonce() -> bytes:
    """
    Generate a cryptographically secure nonce.
    
    Returns:
        A unique nonce (32 bytes)
    """
    return secure_random_bytes(NONCE_SIZE)


def secure_random_int(min_value: int, max_value: int) -> int:
    """
    Generate a cryptographically secure random integer in the range [min_value, max_value].
    
    Args:
        min_value: Minimum value (inclusive)
        max_value: Maximum value (inclusive)
        
    Returns:
        Cryptographically secure random integer
    """
    return secrets.randbelow(max_value - min_value + 1) + min_value
