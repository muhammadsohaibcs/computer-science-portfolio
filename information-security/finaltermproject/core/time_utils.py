"""
Time utilities for SDRCAS.
Provides timestamp generation, freshness validation, and time remaining calculations.
Handles timezone and clock skew considerations.
"""

import time
from typing import Optional

from .constants import TIMESTAMP_TOLERANCE, DEFAULT_COMMAND_VALIDITY


def get_current_timestamp() -> int:
    """
    Get the current Unix timestamp in seconds (UTC).
    
    Returns:
        Current timestamp as integer seconds since epoch
    """
    return int(time.time())


def is_timestamp_fresh(timestamp: int, tolerance: Optional[int] = None) -> bool:
    """
    Check if a timestamp is within the acceptable time window.
    Accounts for clock skew by allowing a tolerance window.
    
    Args:
        timestamp: The timestamp to validate
        tolerance: Maximum allowed clock skew in seconds (default: TIMESTAMP_TOLERANCE)
        
    Returns:
        True if the timestamp is fresh (within tolerance), False otherwise
    """
    if tolerance is None:
        tolerance = TIMESTAMP_TOLERANCE
    
    current_time = get_current_timestamp()
    time_diff = abs(current_time - timestamp)
    
    return time_diff <= tolerance


def time_remaining(expires_at: int) -> int:
    """
    Calculate the time remaining until expiration.
    
    Args:
        expires_at: The expiration timestamp
        
    Returns:
        Seconds remaining until expiration (negative if already expired)
    """
    current_time = get_current_timestamp()
    return expires_at - current_time


def is_expired(expires_at: int) -> bool:
    """
    Check if a timestamp has expired.
    
    Args:
        expires_at: The expiration timestamp
        
    Returns:
        True if expired, False otherwise
    """
    return time_remaining(expires_at) <= 0


def calculate_expiration(validity_duration: Optional[int] = None) -> int:
    """
    Calculate an expiration timestamp based on current time and validity duration.
    
    Args:
        validity_duration: Duration in seconds (default: DEFAULT_COMMAND_VALIDITY)
        
    Returns:
        Expiration timestamp
    """
    if validity_duration is None:
        validity_duration = DEFAULT_COMMAND_VALIDITY
    
    return get_current_timestamp() + validity_duration
