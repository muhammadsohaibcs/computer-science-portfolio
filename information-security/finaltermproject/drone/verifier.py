"""
Drone command verification module for SDRCAS.
Implements all verification checks for received commands:
- Signature verification
- Target drone ID verification
- Timestamp freshness validation
- Nonce replay protection

Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
"""

from typing import Tuple, Set, Optional
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey

from core.command_token import CommandToken, serialize_token
from core.authentication import verify_signature
from core.time_utils import get_current_timestamp, is_expired
from core.constants import TIMESTAMP_TOLERANCE


# In-memory nonce store for replay protection
# In production, this should be persistent storage
_nonce_store: Set[bytes] = set()


def verify_command_signature(
    token: CommandToken,
    signature: bytes,
    cas_public_key: Ed25519PublicKey
) -> bool:
    """
    Verify the digital signature of a command token using the CAS public key.
    
    Args:
        token: The CommandToken to verify
        signature: The signature bytes to verify
        cas_public_key: The CAS public key for verification
        
    Returns:
        True if signature is valid, False otherwise
        
    Requirements: 7.1
    """
    try:
        # Serialize the token to get the signed message
        message = serialize_token(token)
        
        # Verify the signature
        return verify_signature(cas_public_key, message, signature)
    except Exception:
        # Any exception during verification means invalid signature
        return False


def verify_command_target(token: CommandToken, drone_id: str) -> bool:
    """
    Verify that the command is addressed to this specific drone.
    
    Args:
        token: The CommandToken to verify
        drone_id: The ID of this drone
        
    Returns:
        True if the command is for this drone, False otherwise
        
    Requirements: 7.2
    """
    return token.target_drone_id == drone_id


def verify_command_freshness(
    token: CommandToken,
    tolerance: Optional[int] = None
) -> bool:
    """
    Verify that the command timestamp is within the acceptable time window.
    Checks both that the command is not expired and that the issued_at time
    is not too far in the past or future (accounting for clock skew).
    
    Args:
        token: The CommandToken to verify
        tolerance: Maximum allowed clock skew in seconds (default: TIMESTAMP_TOLERANCE)
        
    Returns:
        True if the command is fresh, False otherwise
        
    Requirements: 7.3
    """
    if tolerance is None:
        tolerance = TIMESTAMP_TOLERANCE
    
    current_time = get_current_timestamp()
    
    # Check if the command has expired
    if is_expired(token.expires_at):
        return False
    
    # Check if issued_at is too far in the past
    # (more than tolerance + validity duration)
    max_age = tolerance + (token.expires_at - token.issued_at)
    if current_time - token.issued_at > max_age:
        return False
    
    # Check if issued_at is too far in the future (clock skew)
    if token.issued_at > current_time + tolerance:
        return False
    
    return True


def verify_nonce_unused(nonce: bytes) -> bool:
    """
    Verify that the nonce has not been used previously.
    This prevents replay attacks within the command validity window.
    
    Args:
        nonce: The nonce bytes to check
        
    Returns:
        True if the nonce is unused, False if it has been seen before
        
    Requirements: 7.4
    
    Note:
        This implementation uses an in-memory store. In production,
        this should use persistent storage (e.g., drone/secure_storage.py)
        with automatic cleanup of expired nonces.
    """
    if nonce in _nonce_store:
        return False
    
    # Mark the nonce as used
    _nonce_store.add(nonce)
    return True


def verify_command_complete(
    token: CommandToken,
    signature: bytes,
    drone_id: str,
    cas_public_key: Ed25519PublicKey,
    tolerance: Optional[int] = None
) -> Tuple[bool, str]:
    """
    Orchestrate all verification checks for a command.
    Performs signature, target, freshness, and nonce verification.
    
    Args:
        token: The CommandToken to verify
        signature: The signature bytes to verify
        drone_id: The ID of this drone
        cas_public_key: The CAS public key for signature verification
        tolerance: Maximum allowed clock skew in seconds (default: TIMESTAMP_TOLERANCE)
        
    Returns:
        Tuple of (is_valid, reason) where:
        - is_valid: True if all checks pass, False otherwise
        - reason: Description of the verification result or failure reason
        
    Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
    """
    # Check 1: Verify signature
    if not verify_command_signature(token, signature, cas_public_key):
        return False, "Signature verification failed"
    
    # Check 2: Verify target drone ID
    if not verify_command_target(token, drone_id):
        return False, f"Command not addressed to this drone (target: {token.target_drone_id}, this: {drone_id})"
    
    # Check 3: Verify freshness
    if not verify_command_freshness(token, tolerance):
        return False, "Command is not fresh (expired or timestamp out of acceptable window)"
    
    # Check 4: Verify nonce is unused (replay protection)
    if not verify_nonce_unused(token.nonce):
        return False, "Nonce has been used previously (replay attack detected)"
    
    # All checks passed
    return True, "Command verification successful"


def clear_nonce_store():
    """
    Clear the nonce store. Useful for testing and cleanup.
    
    Note:
        In production, nonces should be cleaned up based on expiration time
        rather than clearing the entire store.
    """
    global _nonce_store
    _nonce_store.clear()
