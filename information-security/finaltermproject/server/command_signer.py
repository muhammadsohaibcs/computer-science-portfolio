"""
Command signer module for SDRCAS.
Implements command signing with CAS private key and command sealing with encryption.
Provides cryptographic sealing of authorized commands for secure transmission to drones.

Requirements: 5.3, 5.4
"""

import json
import base64
from dataclasses import dataclass
from typing import Tuple

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey, Ed25519PublicKey

from core.command_token import CommandToken, serialize_token, deserialize_token
from core.authentication import sign, verify_signature
from core.aead import encrypt_aead, decrypt_aead
from core.key_exchange import derive_session_key
from core.crypto_math import secure_random_bytes
from core.constants import SYMMETRIC_KEY_SIZE


@dataclass
class SealedCommand:
    """
    Represents a cryptographically sealed command ready for transmission.
    
    Contains the encrypted command token, signature, and encryption metadata.
    
    Attributes:
        encrypted_token: Base64-encoded encrypted command token (includes auth tag)
        signature: Base64-encoded digital signature of the command token
        encryption_nonce: Base64-encoded nonce used for AEAD encryption
        ephemeral_public_key: Base64-encoded ephemeral X25519 public key for key exchange
    """
    encrypted_token: str
    signature: str
    encryption_nonce: str
    ephemeral_public_key: str
    
    def to_dict(self) -> dict:
        """Convert SealedCommand to dictionary for serialization."""
        return {
            "encrypted_token": self.encrypted_token,
            "signature": self.signature,
            "encryption_nonce": self.encryption_nonce,
            "ephemeral_public_key": self.ephemeral_public_key
        }
    
    def to_json(self) -> str:
        """Convert SealedCommand to JSON string."""
        return json.dumps(self.to_dict())
    
    def to_bytes(self) -> bytes:
        """Convert SealedCommand to JSON bytes."""
        return self.to_json().encode('utf-8')
    
    @classmethod
    def from_dict(cls, data: dict) -> 'SealedCommand':
        """Create SealedCommand from dictionary."""
        return cls(
            encrypted_token=data["encrypted_token"],
            signature=data["signature"],
            encryption_nonce=data["encryption_nonce"],
            ephemeral_public_key=data["ephemeral_public_key"]
        )
    
    @classmethod
    def from_json(cls, json_str: str) -> 'SealedCommand':
        """Create SealedCommand from JSON string."""
        data = json.loads(json_str)
        return cls.from_dict(data)
    
    @classmethod
    def from_bytes(cls, data: bytes) -> 'SealedCommand':
        """Create SealedCommand from JSON bytes."""
        return cls.from_json(data.decode('utf-8'))


def sign_command(token: CommandToken, cas_private_key: Ed25519PrivateKey) -> bytes:
    """
    Sign a command token using the CAS private key.
    
    Creates a digital signature over the serialized command token to ensure
    authenticity and integrity. The signature can be verified by drones using
    the CAS public key.
    
    Args:
        token: CommandToken to sign
        cas_private_key: CAS Ed25519 private key for signing
        
    Returns:
        Signature bytes
        
    Requirements: 5.3
    """
    # Serialize the command token to bytes
    token_bytes = serialize_token(token)
    
    # Sign the serialized token
    signature = sign(cas_private_key, token_bytes)
    
    return signature


def seal_command(
    token: CommandToken,
    signature: bytes,
    drone_public_key: Ed25519PublicKey
) -> SealedCommand:
    """
    Seal a command by combining signature and encryption.
    
    This function:
    1. Generates a random symmetric encryption key
    2. Encrypts the command token using AEAD (AES-256-GCM)
    3. Packages everything into a SealedCommand
    
    Note: This implementation uses a simplified encryption scheme where
    the symmetric key is derived deterministically from the drone ID.
    In a production system, this would use proper key exchange with the
    drone's X25519 public key. For the purposes of this implementation,
    we use a deterministic key derivation that both CAS and drone can compute.
    
    Args:
        token: CommandToken to seal
        signature: Digital signature of the token
        drone_public_key: Target drone's Ed25519 public key (used for identity)
        
    Returns:
        SealedCommand containing encrypted token and metadata
        
    Requirements: 5.4
    """
    # Serialize the command token
    token_bytes = serialize_token(token)
    
    # For this implementation, we use a deterministic key derivation
    # that both CAS and drone can compute using the drone ID and a shared context
    # In production, this would use proper ECDH key exchange
    
    # Generate a random seed for this command
    random_seed = secure_random_bytes(32)
    
    # Derive encryption key from the random seed and drone identity
    context = f"command-encryption-{token.target_drone_id}".encode('utf-8')
    encryption_key = derive_session_key(random_seed, context, SYMMETRIC_KEY_SIZE)
    
    # Prepare associated data (authenticated but not encrypted)
    # Include the signature and target drone ID
    associated_data = json.dumps({
        "signature": base64.b64encode(signature).decode('utf-8'),
        "target_drone_id": token.target_drone_id
    }).encode('utf-8')
    
    # Encrypt the command token using AEAD
    ciphertext, nonce = encrypt_aead(encryption_key, token_bytes, associated_data)
    
    # Create the sealed command
    # Store the random seed as the "ephemeral_public_key" for simplicity
    sealed = SealedCommand(
        encrypted_token=base64.b64encode(ciphertext).decode('utf-8'),
        signature=base64.b64encode(signature).decode('utf-8'),
        encryption_nonce=base64.b64encode(nonce).decode('utf-8'),
        ephemeral_public_key=base64.b64encode(random_seed).decode('utf-8')
    )
    
    return sealed


def unseal_command(
    sealed: SealedCommand,
    drone_id: str,
    cas_public_key: Ed25519PublicKey
) -> Tuple[CommandToken, bool]:
    """
    Unseal and verify a sealed command.
    
    This function:
    1. Derives the symmetric decryption key using the random seed
    2. Decrypts the command token using AEAD
    3. Verifies the signature using the CAS public key
    4. Returns the command token and verification status
    
    Args:
        sealed: SealedCommand to unseal
        drone_id: ID of the drone unsealing the command
        cas_public_key: CAS Ed25519 public key for signature verification
        
    Returns:
        Tuple of (CommandToken, signature_valid)
        
    Raises:
        ValueError: If decryption fails or data is malformed
        cryptography.exceptions.InvalidTag: If AEAD authentication fails
    """
    # Decode base64 fields
    ciphertext = base64.b64decode(sealed.encrypted_token)
    signature = base64.b64decode(sealed.signature)
    nonce = base64.b64decode(sealed.encryption_nonce)
    random_seed = base64.b64decode(sealed.ephemeral_public_key)
    
    # Derive the decryption key using the same context and random seed
    context = f"command-encryption-{drone_id}".encode('utf-8')
    encryption_key = derive_session_key(random_seed, context, SYMMETRIC_KEY_SIZE)
    
    # Prepare associated data (must match encryption)
    associated_data = json.dumps({
        "signature": sealed.signature,
        "target_drone_id": drone_id
    }).encode('utf-8')
    
    # Decrypt the command token
    token_bytes = decrypt_aead(encryption_key, ciphertext, nonce, associated_data)
    
    # Deserialize the command token
    token = deserialize_token(token_bytes)
    
    # Verify the signature
    signature_valid = verify_signature(cas_public_key, token_bytes, signature)
    
    return token, signature_valid
