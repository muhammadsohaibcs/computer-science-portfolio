"""
Authentication module for SDRCAS.
Implements asymmetric cryptography using Ed25519 for digital signatures.
Provides key generation, signing, and signature verification functions.
"""

import logging
from cryptography.hazmat.primitives.asymmetric.ed25519 import (
    Ed25519PrivateKey,
    Ed25519PublicKey
)
from cryptography.hazmat.primitives import serialization
from cryptography.exceptions import InvalidSignature
from typing import Tuple

from .exceptions import (
    KeyGenerationError,
    SignatureError,
    KeySerializationError,
    InvalidInputError
)

# Configure logging
logger = logging.getLogger(__name__)


def generate_keypair() -> Tuple[Ed25519PrivateKey, Ed25519PublicKey]:
    """
    Generate a new Ed25519 keypair.
    
    Returns:
        Tuple of (private_key, public_key)
        
    Raises:
        KeyGenerationError: If key generation fails
        
    Requirements: 1.1, 5.3, 7.1, 13.1
    """
    try:
        private_key = Ed25519PrivateKey.generate()
        public_key = private_key.public_key()
        logger.debug("Ed25519 keypair generated successfully")
        return private_key, public_key
    except Exception as e:
        logger.error(f"Key generation failed: {type(e).__name__}")
        raise KeyGenerationError(
            "Failed to generate Ed25519 keypair",
            operation="generate_keypair"
        ) from e


def sign(private_key: Ed25519PrivateKey, message: bytes) -> bytes:
    """
    Sign a message using Ed25519 private key.
    
    Args:
        private_key: Ed25519 private key for signing
        message: Message bytes to sign
        
    Returns:
        Signature bytes
        
    Raises:
        InvalidInputError: If inputs are invalid
        SignatureError: If signing operation fails
        
    Requirements: 5.3, 7.1, 13.1, 13.4
    """
    try:
        if not isinstance(message, bytes):
            raise InvalidInputError(
                "Message must be bytes",
                operation="sign"
            )
        
        if not isinstance(private_key, Ed25519PrivateKey):
            raise InvalidInputError(
                "Invalid private key type",
                operation="sign"
            )
        
        signature = private_key.sign(message)
        logger.debug(f"Message signed successfully (length: {len(message)} bytes)")
        return signature
        
    except InvalidInputError:
        # Re-raise validation errors
        raise
    except Exception as e:
        # Log error without leaking message content
        logger.error(f"Signing failed: {type(e).__name__}")
        raise SignatureError(
            "Failed to sign message",
            operation="sign"
        ) from e


def verify_signature(public_key: Ed25519PublicKey, message: bytes, signature: bytes) -> bool:
    """
    Verify a signature using Ed25519 public key.
    
    Args:
        public_key: Ed25519 public key for verification
        message: Original message bytes
        signature: Signature bytes to verify
        
    Returns:
        True if signature is valid, False otherwise
        
    Raises:
        InvalidInputError: If inputs are invalid
        SignatureError: If verification operation fails (not invalid signature)
        
    Requirements: 7.1, 13.1, 13.4
    """
    try:
        if not isinstance(message, bytes):
            raise InvalidInputError(
                "Message must be bytes",
                operation="verify_signature"
            )
        if not isinstance(signature, bytes):
            raise InvalidInputError(
                "Signature must be bytes",
                operation="verify_signature"
            )
        if not isinstance(public_key, Ed25519PublicKey):
            raise InvalidInputError(
                "Invalid public key type",
                operation="verify_signature"
            )
        
        public_key.verify(signature, message)
        logger.debug("Signature verified successfully")
        return True
        
    except InvalidInputError:
        # Re-raise validation errors
        raise
    except InvalidSignature:
        # Invalid signature is expected behavior, not an error
        logger.debug("Signature verification failed: invalid signature")
        return False
    except Exception as e:
        # Unexpected error during verification
        logger.error(f"Signature verification error: {type(e).__name__}")
        raise SignatureError(
            "Signature verification operation failed",
            operation="verify_signature"
        ) from e


def serialize_private_key(private_key: Ed25519PrivateKey, password: bytes = None) -> bytes:
    """
    Serialize private key to PEM format.
    
    Args:
        private_key: Ed25519 private key to serialize
        password: Optional password for encryption (bytes)
        
    Returns:
        PEM-encoded private key bytes
        
    Raises:
        InvalidInputError: If inputs are invalid
        KeySerializationError: If serialization fails
        
    Requirements: 1.1, 13.1, 13.4
    """
    try:
        if not isinstance(private_key, Ed25519PrivateKey):
            raise InvalidInputError(
                "Invalid private key type",
                operation="serialize_private_key"
            )
        
        if password is not None and not isinstance(password, bytes):
            raise InvalidInputError(
                "Password must be bytes or None",
                operation="serialize_private_key"
            )
        
        if password is not None:
            encryption_algorithm = serialization.BestAvailableEncryption(password)
            logger.debug("Serializing private key with encryption")
        else:
            encryption_algorithm = serialization.NoEncryption()
            logger.debug("Serializing private key without encryption")
        
        pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=encryption_algorithm
        )
        logger.debug("Private key serialized successfully")
        return pem
        
    except InvalidInputError:
        raise
    except Exception as e:
        logger.error(f"Private key serialization failed: {type(e).__name__}")
        raise KeySerializationError(
            "Failed to serialize private key",
            operation="serialize_private_key"
        ) from e


def deserialize_private_key(pem_data: bytes, password: bytes = None) -> Ed25519PrivateKey:
    """
    Deserialize private key from PEM format.
    
    Args:
        pem_data: PEM-encoded private key bytes
        password: Optional password for decryption (bytes)
        
    Returns:
        Ed25519 private key
        
    Raises:
        InvalidInputError: If inputs are invalid
        KeySerializationError: If deserialization fails
        
    Requirements: 1.1, 13.1, 13.4
    """
    try:
        if not isinstance(pem_data, bytes):
            raise InvalidInputError(
                "PEM data must be bytes",
                operation="deserialize_private_key"
            )
        
        if password is not None and not isinstance(password, bytes):
            raise InvalidInputError(
                "Password must be bytes or None",
                operation="deserialize_private_key"
            )
        
        private_key = serialization.load_pem_private_key(
            pem_data,
            password=password
        )
        
        if not isinstance(private_key, Ed25519PrivateKey):
            raise InvalidInputError(
                "Key is not an Ed25519 private key",
                operation="deserialize_private_key"
            )
        
        logger.debug("Private key deserialized successfully")
        return private_key
        
    except InvalidInputError:
        raise
    except Exception as e:
        # Don't log the actual error details to avoid leaking key material
        logger.error(f"Private key deserialization failed: {type(e).__name__}")
        raise KeySerializationError(
            "Failed to deserialize private key",
            operation="deserialize_private_key"
        ) from e


def serialize_public_key(public_key: Ed25519PublicKey) -> bytes:
    """
    Serialize public key to PEM format.
    
    Args:
        public_key: Ed25519 public key to serialize
        
    Returns:
        PEM-encoded public key bytes
        
    Raises:
        InvalidInputError: If input is invalid
        KeySerializationError: If serialization fails
        
    Requirements: 1.1, 1.2, 13.1
    """
    try:
        if not isinstance(public_key, Ed25519PublicKey):
            raise InvalidInputError(
                "Invalid public key type",
                operation="serialize_public_key"
            )
        
        pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        logger.debug("Public key serialized successfully")
        return pem
        
    except InvalidInputError:
        raise
    except Exception as e:
        logger.error(f"Public key serialization failed: {type(e).__name__}")
        raise KeySerializationError(
            "Failed to serialize public key",
            operation="serialize_public_key"
        ) from e


def deserialize_public_key(pem_data: bytes) -> Ed25519PublicKey:
    """
    Deserialize public key from PEM format.
    
    Args:
        pem_data: PEM-encoded public key bytes
        
    Returns:
        Ed25519 public key
        
    Raises:
        InvalidInputError: If input is invalid
        KeySerializationError: If deserialization fails
        
    Requirements: 1.1, 1.2, 13.1
    """
    try:
        if not isinstance(pem_data, bytes):
            raise InvalidInputError(
                "PEM data must be bytes",
                operation="deserialize_public_key"
            )
        
        public_key = serialization.load_pem_public_key(pem_data)
        
        if not isinstance(public_key, Ed25519PublicKey):
            raise InvalidInputError(
                "Key is not an Ed25519 public key",
                operation="deserialize_public_key"
            )
        
        logger.debug("Public key deserialized successfully")
        return public_key
        
    except InvalidInputError:
        raise
    except Exception as e:
        logger.error(f"Public key deserialization failed: {type(e).__name__}")
        raise KeySerializationError(
            "Failed to deserialize public key",
            operation="deserialize_public_key"
        ) from e
