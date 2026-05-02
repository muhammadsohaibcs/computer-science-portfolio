"""
Key exchange module for SDRCAS.
Implements X25519 key exchange and HKDF key derivation.
"""

import logging
from cryptography.hazmat.primitives.asymmetric.x25519 import X25519PrivateKey, X25519PublicKey
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from typing import Tuple

from .constants import SYMMETRIC_KEY_SIZE
from .exceptions import (
    KeyGenerationError,
    KeyExchangeError,
    KeySerializationError,
    InvalidInputError
)

# Configure logging
logger = logging.getLogger(__name__)


def generate_x25519_keypair() -> Tuple[X25519PrivateKey, X25519PublicKey]:
    """
    Generate an X25519 key pair for key exchange.
    
    Returns:
        Tuple of (private_key, public_key)
        
    Raises:
        KeyGenerationError: If key generation fails
        
    Requirements: 6.2, 13.1
    """
    try:
        private_key = X25519PrivateKey.generate()
        public_key = private_key.public_key()
        logger.debug("X25519 keypair generated successfully")
        return private_key, public_key
    except Exception as e:
        logger.error(f"X25519 key generation failed: {type(e).__name__}")
        raise KeyGenerationError(
            "Failed to generate X25519 keypair",
            operation="generate_x25519_keypair"
        ) from e


def perform_key_exchange(private_key: X25519PrivateKey, peer_public_key: X25519PublicKey) -> bytes:
    """
    Perform X25519 key exchange to derive a shared secret.
    
    Args:
        private_key: Our X25519 private key
        peer_public_key: Peer's X25519 public key
        
    Returns:
        Shared secret (32 bytes)
        
    Raises:
        InvalidInputError: If inputs are invalid
        KeyExchangeError: If key exchange fails
        
    Requirements: 6.2, 13.1, 13.4
    """
    try:
        if not isinstance(private_key, X25519PrivateKey):
            raise InvalidInputError(
                "Invalid private key type",
                operation="perform_key_exchange"
            )
        
        if not isinstance(peer_public_key, X25519PublicKey):
            raise InvalidInputError(
                "Invalid peer public key type",
                operation="perform_key_exchange"
            )
        
        # Perform ECDH key exchange
        shared_secret = private_key.exchange(peer_public_key)
        logger.debug("X25519 key exchange successful")
        return shared_secret
        
    except InvalidInputError:
        raise
    except Exception as e:
        logger.error(f"Key exchange failed: {type(e).__name__}")
        raise KeyExchangeError(
            "Failed to perform X25519 key exchange",
            operation="perform_key_exchange"
        ) from e


def derive_session_key(shared_secret: bytes, context: bytes, length: int = SYMMETRIC_KEY_SIZE) -> bytes:
    """
    Derive a session key from a shared secret using HKDF.
    
    Args:
        shared_secret: Shared secret from key exchange
        context: Context information for key derivation (e.g., "command-encryption")
        length: Desired key length in bytes (default: 32 for AES-256)
        
    Returns:
        Derived session key
        
    Raises:
        InvalidInputError: If inputs are invalid
        KeyExchangeError: If key derivation fails
        
    Requirements: 6.2, 13.1, 13.4
    """
    try:
        if not isinstance(shared_secret, bytes):
            raise InvalidInputError(
                "Shared secret must be bytes",
                operation="derive_session_key"
            )
        
        if not isinstance(context, bytes):
            raise InvalidInputError(
                "Context must be bytes",
                operation="derive_session_key"
            )
        
        if not isinstance(length, int) or length <= 0:
            raise InvalidInputError(
                "Length must be a positive integer",
                operation="derive_session_key"
            )
        
        # Use HKDF (HMAC-based Key Derivation Function) with SHA-256
        hkdf = HKDF(
            algorithm=hashes.SHA256(),
            length=length,
            salt=None,  # Optional salt, None means all-zeros salt
            info=context,  # Context/application-specific info
        )
        
        derived_key = hkdf.derive(shared_secret)
        logger.debug(f"Session key derived successfully (length: {length} bytes)")
        return derived_key
        
    except InvalidInputError:
        raise
    except Exception as e:
        logger.error(f"Key derivation failed: {type(e).__name__}")
        raise KeyExchangeError(
            "Failed to derive session key with HKDF",
            operation="derive_session_key"
        ) from e


def serialize_x25519_public_key(public_key: X25519PublicKey) -> bytes:
    """
    Serialize an X25519 public key to bytes.
    
    Args:
        public_key: X25519 public key to serialize
        
    Returns:
        Serialized public key (32 bytes)
        
    Raises:
        InvalidInputError: If input is invalid
        KeySerializationError: If serialization fails
        
    Requirements: 6.2, 13.1
    """
    try:
        if not isinstance(public_key, X25519PublicKey):
            raise InvalidInputError(
                "Invalid public key type",
                operation="serialize_x25519_public_key"
            )
        
        serialized = public_key.public_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PublicFormat.Raw
        )
        logger.debug("X25519 public key serialized successfully")
        return serialized
        
    except InvalidInputError:
        raise
    except Exception as e:
        logger.error(f"X25519 public key serialization failed: {type(e).__name__}")
        raise KeySerializationError(
            "Failed to serialize X25519 public key",
            operation="serialize_x25519_public_key"
        ) from e


def deserialize_x25519_public_key(key_bytes: bytes) -> X25519PublicKey:
    """
    Deserialize an X25519 public key from bytes.
    
    Args:
        key_bytes: Serialized public key (32 bytes)
        
    Returns:
        X25519 public key object
        
    Raises:
        InvalidInputError: If input is invalid
        KeySerializationError: If deserialization fails
        
    Requirements: 6.2, 13.1
    """
    try:
        if not isinstance(key_bytes, bytes):
            raise InvalidInputError(
                "Key bytes must be bytes",
                operation="deserialize_x25519_public_key"
            )
        
        if len(key_bytes) != 32:
            raise InvalidInputError(
                f"X25519 public key must be 32 bytes, got {len(key_bytes)}",
                operation="deserialize_x25519_public_key"
            )
        
        public_key = X25519PublicKey.from_public_bytes(key_bytes)
        logger.debug("X25519 public key deserialized successfully")
        return public_key
        
    except InvalidInputError:
        raise
    except Exception as e:
        logger.error(f"X25519 public key deserialization failed: {type(e).__name__}")
        raise KeySerializationError(
            "Failed to deserialize X25519 public key",
            operation="deserialize_x25519_public_key"
        ) from e


def serialize_x25519_private_key(private_key: X25519PrivateKey) -> bytes:
    """
    Serialize an X25519 private key to bytes.
    
    Args:
        private_key: X25519 private key to serialize
        
    Returns:
        Serialized private key (32 bytes)
        
    Raises:
        InvalidInputError: If input is invalid
        KeySerializationError: If serialization fails
        
    Requirements: 6.2, 13.1, 13.4
    """
    try:
        if not isinstance(private_key, X25519PrivateKey):
            raise InvalidInputError(
                "Invalid private key type",
                operation="serialize_x25519_private_key"
            )
        
        serialized = private_key.private_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PrivateFormat.Raw,
            encryption_algorithm=serialization.NoEncryption()
        )
        logger.debug("X25519 private key serialized successfully")
        return serialized
        
    except InvalidInputError:
        raise
    except Exception as e:
        logger.error(f"X25519 private key serialization failed: {type(e).__name__}")
        raise KeySerializationError(
            "Failed to serialize X25519 private key",
            operation="serialize_x25519_private_key"
        ) from e


def deserialize_x25519_private_key(key_bytes: bytes) -> X25519PrivateKey:
    """
    Deserialize an X25519 private key from bytes.
    
    Args:
        key_bytes: Serialized private key (32 bytes)
        
    Returns:
        X25519 private key object
        
    Raises:
        InvalidInputError: If input is invalid
        KeySerializationError: If deserialization fails
        
    Requirements: 6.2, 13.1, 13.4
    """
    try:
        if not isinstance(key_bytes, bytes):
            raise InvalidInputError(
                "Key bytes must be bytes",
                operation="deserialize_x25519_private_key"
            )
        
        if len(key_bytes) != 32:
            raise InvalidInputError(
                f"X25519 private key must be 32 bytes, got {len(key_bytes)}",
                operation="deserialize_x25519_private_key"
            )
        
        private_key = X25519PrivateKey.from_private_bytes(key_bytes)
        logger.debug("X25519 private key deserialized successfully")
        return private_key
        
    except InvalidInputError:
        raise
    except Exception as e:
        logger.error(f"X25519 private key deserialization failed: {type(e).__name__}")
        raise KeySerializationError(
            "Failed to deserialize X25519 private key",
            operation="deserialize_x25519_private_key"
        ) from e
