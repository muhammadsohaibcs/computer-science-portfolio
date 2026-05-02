"""
Hashing module for SDRCAS.
Provides hash_data, verify_hash, and hash_chain functions using SHA-256.
Implements constant-time hash comparison to prevent timing attacks.
"""

import hashlib
import hmac
import logging

from .constants import HASH_SIZE
from .exceptions import HashingError, InvalidInputError

# Configure logging
logger = logging.getLogger(__name__)


def hash_data(data: bytes) -> bytes:
    """
    Hash data using SHA-256.
    
    Args:
        data: The data to hash
        
    Returns:
        The SHA-256 hash of the data (32 bytes)
        
    Raises:
        InvalidInputError: If input is invalid
        HashingError: If hashing operation fails
        
    Requirements: 9.4, 13.1, 13.4
    """
    try:
        if not isinstance(data, bytes):
            raise InvalidInputError(
                "Data must be bytes",
                operation="hash_data"
            )
        
        hash_result = hashlib.sha256(data).digest()
        logger.debug(f"Data hashed successfully (input: {len(data)} bytes)")
        return hash_result
        
    except InvalidInputError:
        raise
    except Exception as e:
        # Log error without leaking data content
        logger.error(f"Hashing failed: {type(e).__name__}")
        raise HashingError(
            "Failed to hash data with SHA-256",
            operation="hash_data"
        ) from e


def verify_hash(data: bytes, expected_hash: bytes) -> bool:
    """
    Verify that data matches the expected hash using constant-time comparison.
    
    Args:
        data: The data to verify
        expected_hash: The expected hash value
        
    Returns:
        True if the hash matches, False otherwise
        
    Raises:
        InvalidInputError: If inputs are invalid
        HashingError: If verification operation fails
        
    Requirements: 9.4, 13.1, 13.4
    """
    try:
        if not isinstance(data, bytes):
            raise InvalidInputError(
                "Data must be bytes",
                operation="verify_hash"
            )
        
        if not isinstance(expected_hash, bytes):
            raise InvalidInputError(
                "Expected hash must be bytes",
                operation="verify_hash"
            )
        
        computed_hash = hash_data(data)
        
        # Use constant-time comparison to prevent timing attacks
        result = hmac.compare_digest(computed_hash, expected_hash)
        logger.debug(f"Hash verification: {'match' if result else 'mismatch'}")
        return result
        
    except InvalidInputError:
        raise
    except Exception as e:
        logger.error(f"Hash verification failed: {type(e).__name__}")
        raise HashingError(
            "Failed to verify hash",
            operation="verify_hash"
        ) from e


def hash_chain(previous_hash: bytes, new_data: bytes) -> bytes:
    """
    Create a hash chain by combining the previous hash with new data.
    This is used for audit log integrity.
    
    Args:
        previous_hash: The hash from the previous entry in the chain
        new_data: The new data to add to the chain
        
    Returns:
        The hash of (previous_hash || new_data)
        
    Raises:
        InvalidInputError: If inputs are invalid
        HashingError: If hash chain operation fails
        
    Requirements: 9.4, 13.1, 13.4
    """
    try:
        if not isinstance(previous_hash, bytes):
            raise InvalidInputError(
                "Previous hash must be bytes",
                operation="hash_chain"
            )
        
        if not isinstance(new_data, bytes):
            raise InvalidInputError(
                "New data must be bytes",
                operation="hash_chain"
            )
        
        combined = previous_hash + new_data
        result = hash_data(combined)
        logger.debug("Hash chain computed successfully")
        return result
        
    except InvalidInputError:
        raise
    except Exception as e:
        logger.error(f"Hash chain computation failed: {type(e).__name__}")
        raise HashingError(
            "Failed to compute hash chain",
            operation="hash_chain"
        ) from e
