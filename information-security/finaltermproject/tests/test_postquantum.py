"""
Unit tests for post-quantum cryptography module.
"""

import pytest
from core.postquantum import (
    pq_generate_keypair,
    pq_encapsulate,
    pq_decapsulate,
    hybrid_key_exchange,
    serialize_pq_public_key,
    deserialize_pq_public_key,
    serialize_pq_private_key,
    deserialize_pq_private_key,
    PQPublicKey,
    PQPrivateKey
)
from core.exceptions import InvalidInputError


def test_pq_keypair_generation():
    """Test that PQ keypair generation produces valid keys."""
    private_key, public_key = pq_generate_keypair()
    
    assert isinstance(private_key, PQPrivateKey)
    assert isinstance(public_key, PQPublicKey)
    assert len(bytes(private_key)) > 0
    assert len(bytes(public_key)) > 0
    assert private_key.algorithm == "Kyber512"
    assert public_key.algorithm == "Kyber512"


def test_pq_encapsulation_decapsulation():
    """Test that encapsulation and decapsulation work correctly."""
    # Generate keypair
    private_key, public_key = pq_generate_keypair()
    
    # Encapsulate a shared secret
    ciphertext, shared_secret_sender = pq_encapsulate(public_key)
    
    assert len(ciphertext) > 0
    assert len(shared_secret_sender) > 0
    
    # Decapsulate to recover the shared secret
    shared_secret_receiver = pq_decapsulate(private_key, ciphertext)
    
    # Both parties should have the same shared secret
    assert shared_secret_sender == shared_secret_receiver


def test_hybrid_key_exchange():
    """Test that hybrid key exchange combines classical and PQ secrets."""
    classical_secret = b"classical_shared_secret_32bytes!"
    pq_secret = b"post_quantum_shared_secret_32b!!"
    
    # Derive hybrid key
    hybrid_key = hybrid_key_exchange(classical_secret, pq_secret)
    
    assert len(hybrid_key) == 32  # Default AES-256 key size
    assert hybrid_key != classical_secret
    assert hybrid_key != pq_secret
    
    # Same inputs should produce same output
    hybrid_key2 = hybrid_key_exchange(classical_secret, pq_secret)
    assert hybrid_key == hybrid_key2
    
    # Different inputs should produce different output
    different_classical = b"different_classical_secret_32b!!"
    hybrid_key3 = hybrid_key_exchange(different_classical, pq_secret)
    assert hybrid_key != hybrid_key3


def test_hybrid_key_exchange_with_context():
    """Test that context affects hybrid key derivation."""
    classical_secret = b"classical_shared_secret_32bytes!"
    pq_secret = b"post_quantum_shared_secret_32b!!"
    
    key1 = hybrid_key_exchange(classical_secret, pq_secret, context=b"context1")
    key2 = hybrid_key_exchange(classical_secret, pq_secret, context=b"context2")
    
    # Different contexts should produce different keys
    assert key1 != key2


def test_hybrid_key_exchange_empty_secrets():
    """Test that hybrid key exchange rejects empty secrets."""
    with pytest.raises(InvalidInputError, match="Both classical and PQ shared secrets must be non-empty"):
        hybrid_key_exchange(b"", b"pq_secret")
    
    with pytest.raises(InvalidInputError, match="Both classical and PQ shared secrets must be non-empty"):
        hybrid_key_exchange(b"classical_secret", b"")


def test_pq_public_key_serialization():
    """Test PQ public key serialization and deserialization."""
    _, public_key = pq_generate_keypair()
    
    # Serialize
    serialized = serialize_pq_public_key(public_key)
    assert len(serialized) > 0
    
    # Deserialize
    deserialized = deserialize_pq_public_key(serialized)
    
    # Should be equal
    assert deserialized == public_key
    assert deserialized.algorithm == public_key.algorithm
    assert bytes(deserialized) == bytes(public_key)


def test_pq_private_key_serialization():
    """Test PQ private key serialization and deserialization."""
    private_key, _ = pq_generate_keypair()
    
    # Serialize
    serialized = serialize_pq_private_key(private_key)
    assert len(serialized) > 0
    
    # Deserialize
    deserialized = deserialize_pq_private_key(serialized)
    
    # Should have same algorithm and key bytes
    assert deserialized.algorithm == private_key.algorithm
    assert bytes(deserialized) == bytes(private_key)


def test_pq_key_serialization_malformed():
    """Test that malformed serialized keys are rejected."""
    with pytest.raises(ValueError, match="too short"):
        deserialize_pq_public_key(b"x")
    
    with pytest.raises(ValueError, match="too short"):
        deserialize_pq_private_key(b"x")
    
    with pytest.raises(ValueError, match="truncated"):
        deserialize_pq_public_key(b"\x10short")


def test_different_keypairs_produce_different_secrets():
    """Test that different keypairs produce different shared secrets."""
    # Generate two different keypairs
    private_key1, public_key1 = pq_generate_keypair()
    private_key2, public_key2 = pq_generate_keypair()
    
    # Encapsulate with first public key
    ciphertext1, secret1 = pq_encapsulate(public_key1)
    
    # Encapsulate with second public key
    ciphertext2, secret2 = pq_encapsulate(public_key2)
    
    # Secrets should be different (with very high probability)
    assert secret1 != secret2
    assert ciphertext1 != ciphertext2


def test_wrong_private_key_fails_decapsulation():
    """Test that using wrong private key produces different secret."""
    # Note: This test only works with real liboqs, not the mock implementation
    # The mock implementation doesn't encrypt the shared secret, so any key works
    from core.postquantum import LIBOQS_AVAILABLE
    
    if not LIBOQS_AVAILABLE:
        pytest.skip("This test requires real liboqs library (not available in mock mode)")
    
    # Generate two keypairs
    private_key1, public_key1 = pq_generate_keypair()
    private_key2, public_key2 = pq_generate_keypair()
    
    # Encapsulate with first public key
    ciphertext, secret_sender = pq_encapsulate(public_key1)
    
    # Try to decapsulate with wrong private key
    secret_wrong = pq_decapsulate(private_key2, ciphertext)
    
    # Should get different secret (decapsulation won't fail but produces wrong result)
    assert secret_sender != secret_wrong


def test_pq_keypair_generation_with_different_algorithms():
    """Test keypair generation with different Kyber variants."""
    for algorithm in ["Kyber512", "Kyber768", "Kyber1024"]:
        private_key, public_key = pq_generate_keypair(algorithm)
        
        assert private_key.algorithm == algorithm
        assert public_key.algorithm == algorithm
        
        # Test that encapsulation/decapsulation works
        ciphertext, secret_sender = pq_encapsulate(public_key)
        secret_receiver = pq_decapsulate(private_key, ciphertext)
        assert secret_sender == secret_receiver


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
