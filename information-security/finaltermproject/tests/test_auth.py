"""
Unit tests for authentication module.
Tests key generation, signing, and signature verification.
"""

import pytest
from core.authentication import (
    generate_keypair,
    sign,
    verify_signature,
    serialize_private_key,
    deserialize_private_key,
    serialize_public_key,
    deserialize_public_key
)
from core.exceptions import InvalidInputError


def test_generate_keypair():
    """Test that keypair generation produces valid keys."""
    private_key, public_key = generate_keypair()
    
    assert private_key is not None
    assert public_key is not None


def test_sign_and_verify():
    """Test signing and verification round-trip."""
    private_key, public_key = generate_keypair()
    message = b"Test message for signing"
    
    signature = sign(private_key, message)
    assert signature is not None
    assert len(signature) > 0
    
    # Verify with correct key
    assert verify_signature(public_key, message, signature) is True


def test_verify_invalid_signature():
    """Test that invalid signatures are rejected."""
    private_key, public_key = generate_keypair()
    message = b"Test message"
    
    signature = sign(private_key, message)
    
    # Modify message
    wrong_message = b"Different message"
    assert verify_signature(public_key, wrong_message, signature) is False
    
    # Modify signature
    wrong_signature = signature[:-1] + bytes([signature[-1] ^ 0xFF])
    assert verify_signature(public_key, message, wrong_signature) is False


def test_serialize_deserialize_private_key():
    """Test private key serialization round-trip."""
    private_key, _ = generate_keypair()
    
    # Without password
    pem = serialize_private_key(private_key)
    restored_key = deserialize_private_key(pem)
    
    # Verify keys work the same
    message = b"Test message"
    sig1 = sign(private_key, message)
    sig2 = sign(restored_key, message)
    
    # Both signatures should verify with the same public key
    public_key = private_key.public_key()
    assert verify_signature(public_key, message, sig1) is True
    assert verify_signature(public_key, message, sig2) is True


def test_serialize_deserialize_private_key_with_password():
    """Test private key serialization with password."""
    private_key, _ = generate_keypair()
    password = b"secure_password_123"
    
    # With password
    pem = serialize_private_key(private_key, password)
    restored_key = deserialize_private_key(pem, password)
    
    # Verify keys work the same
    message = b"Test message"
    sig = sign(restored_key, message)
    public_key = private_key.public_key()
    assert verify_signature(public_key, message, sig) is True


def test_serialize_deserialize_public_key():
    """Test public key serialization round-trip."""
    _, public_key = generate_keypair()
    
    pem = serialize_public_key(public_key)
    restored_key = deserialize_public_key(pem)
    
    assert restored_key is not None


def test_sign_requires_bytes():
    """Test that sign function requires bytes input."""
    private_key, _ = generate_keypair()
    
    with pytest.raises(InvalidInputError):
        sign(private_key, "not bytes")


def test_verify_requires_bytes():
    """Test that verify_signature requires bytes input."""
    _, public_key = generate_keypair()
    
    with pytest.raises(InvalidInputError):
        verify_signature(public_key, "not bytes", b"signature")
    
    with pytest.raises(InvalidInputError):
        verify_signature(public_key, b"message", "not bytes")
