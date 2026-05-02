"""
AEAD (Authenticated Encryption with Associated Data) module for SDRCAS.
Implements AES-256-GCM encryption and decryption.
"""

import logging
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.exceptions import InvalidTag
from typing import Tuple

from .constants import GCM_NONCE_SIZE, SYMMETRIC_KEY_SIZE
from .crypto_math import secure_random_bytes
from .exceptions import (
    EncryptionError,
    DecryptionError,
    InvalidInputError
)

# Configure logging
logger = logging.getLogger(__name__)


def encrypt_aead(key: bytes, plaintext: bytes, associated_data: bytes) -> Tuple[bytes, bytes]:
    """
    Encrypt data using AES-256-GCM with authenticated encryption.
    
    Args:
        key: 32-byte encryption key
        plaintext: Data to encrypt
        associated_data: Additional authenticated data (not encrypted, but authenticated)
        
    Returns:
        Tuple of (ciphertext, nonce) where ciphertext includes the authentication tag
        
    Raises:
        InvalidInputError: If inputs are invalid
        EncryptionError: If encryption operation fails
        
    Requirements: 5.4, 8.1, 13.1, 13.4
    """
    try:
        # Validate inputs
        if not isinstance(key, bytes):
            raise InvalidInputError(
                "Key must be bytes",
                operation="encrypt_aead"
            )
        
        if len(key) != SYMMETRIC_KEY_SIZE:
            raise InvalidInputError(
                f"Key must be {SYMMETRIC_KEY_SIZE} bytes, got {len(key)}",
                operation="encrypt_aead"
            )
        
        if not isinstance(plaintext, bytes):
            raise InvalidInputError(
                "Plaintext must be bytes",
                operation="encrypt_aead"
            )
        
        if not isinstance(associated_data, bytes):
            raise InvalidInputError(
                "Associated data must be bytes",
                operation="encrypt_aead"
            )
        
        # Generate a random nonce for this encryption
        nonce = secure_random_bytes(GCM_NONCE_SIZE)
        
        # Create AESGCM cipher
        aesgcm = AESGCM(key)
        
        # Encrypt and authenticate
        # The ciphertext includes the authentication tag appended
        ciphertext = aesgcm.encrypt(nonce, plaintext, associated_data)
        
        logger.debug(f"AEAD encryption successful (plaintext: {len(plaintext)} bytes, "
                    f"ciphertext: {len(ciphertext)} bytes)")
        
        return ciphertext, nonce
        
    except InvalidInputError:
        raise
    except Exception as e:
        # Log error without leaking plaintext
        logger.error(f"AEAD encryption failed: {type(e).__name__}")
        raise EncryptionError(
            "Failed to encrypt data with AES-256-GCM",
            operation="encrypt_aead"
        ) from e


def decrypt_aead(key: bytes, ciphertext: bytes, nonce: bytes, associated_data: bytes) -> bytes:
    """
    Decrypt data using AES-256-GCM with authenticated decryption.
    
    Args:
        key: 32-byte encryption key
        ciphertext: Encrypted data (includes authentication tag)
        nonce: 12-byte nonce used during encryption
        associated_data: Additional authenticated data (must match encryption)
        
    Returns:
        Decrypted plaintext
        
    Raises:
        InvalidInputError: If inputs are invalid
        DecryptionError: If decryption or authentication fails
        
    Requirements: 5.4, 8.1, 13.1, 13.4
    """
    try:
        # Validate inputs
        if not isinstance(key, bytes):
            raise InvalidInputError(
                "Key must be bytes",
                operation="decrypt_aead"
            )
        
        if len(key) != SYMMETRIC_KEY_SIZE:
            raise InvalidInputError(
                f"Key must be {SYMMETRIC_KEY_SIZE} bytes, got {len(key)}",
                operation="decrypt_aead"
            )
        
        if not isinstance(nonce, bytes):
            raise InvalidInputError(
                "Nonce must be bytes",
                operation="decrypt_aead"
            )
        
        if len(nonce) != GCM_NONCE_SIZE:
            raise InvalidInputError(
                f"Nonce must be {GCM_NONCE_SIZE} bytes, got {len(nonce)}",
                operation="decrypt_aead"
            )
        
        if not isinstance(ciphertext, bytes):
            raise InvalidInputError(
                "Ciphertext must be bytes",
                operation="decrypt_aead"
            )
        
        if not isinstance(associated_data, bytes):
            raise InvalidInputError(
                "Associated data must be bytes",
                operation="decrypt_aead"
            )
        
        # Create AESGCM cipher
        aesgcm = AESGCM(key)
        
        # Decrypt and verify authentication
        # This will raise InvalidTag if the ciphertext or associated_data has been tampered with
        plaintext = aesgcm.decrypt(nonce, ciphertext, associated_data)
        
        logger.debug(f"AEAD decryption successful (ciphertext: {len(ciphertext)} bytes, "
                    f"plaintext: {len(plaintext)} bytes)")
        
        return plaintext
        
    except InvalidInputError:
        raise
    except InvalidTag:
        # Authentication failure - tampering detected
        logger.warning("AEAD decryption failed: authentication tag invalid (tampering detected)")
        raise DecryptionError(
            "Authentication failed - data may have been tampered with",
            operation="decrypt_aead"
        )
    except Exception as e:
        # Other decryption errors
        logger.error(f"AEAD decryption failed: {type(e).__name__}")
        raise DecryptionError(
            "Failed to decrypt data with AES-256-GCM",
            operation="decrypt_aead"
        ) from e
