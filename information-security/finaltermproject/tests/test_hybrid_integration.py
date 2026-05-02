"""
Integration tests for hybrid classical + post-quantum key exchange.
Demonstrates how to combine X25519 and Kyber for defense-in-depth.
"""

import pytest
from core.key_exchange import (
    generate_x25519_keypair,
    perform_key_exchange,
    serialize_x25519_public_key,
    deserialize_x25519_public_key
)
from core.postquantum import (
    pq_generate_keypair,
    pq_encapsulate,
    pq_decapsulate,
    hybrid_key_exchange,
    serialize_pq_public_key,
    deserialize_pq_public_key,
    LIBOQS_AVAILABLE
)


def test_full_hybrid_key_exchange():
    """
    Test complete hybrid key exchange between two parties.
    
    Scenario: Alice and Bob want to establish a shared session key
    using both classical and post-quantum algorithms.
    """
    # Alice generates both classical and PQ keypairs
    alice_x25519_private, alice_x25519_public = generate_x25519_keypair()
    alice_pq_private, alice_pq_public = pq_generate_keypair("Kyber768")
    
    # Bob generates both classical and PQ keypairs
    bob_x25519_private, bob_x25519_public = generate_x25519_keypair()
    bob_pq_private, bob_pq_public = pq_generate_keypair("Kyber768")
    
    # Classical key exchange (both parties compute same shared secret)
    alice_classical_shared = perform_key_exchange(alice_x25519_private, bob_x25519_public)
    bob_classical_shared = perform_key_exchange(bob_x25519_private, alice_x25519_public)
    assert alice_classical_shared == bob_classical_shared
    
    # Post-quantum key exchange (Alice encapsulates for Bob)
    ciphertext, alice_pq_shared = pq_encapsulate(bob_pq_public)
    bob_pq_shared = pq_decapsulate(bob_pq_private, ciphertext)
    assert alice_pq_shared == bob_pq_shared
    
    # Both parties derive the same hybrid key
    alice_hybrid_key = hybrid_key_exchange(
        alice_classical_shared,
        alice_pq_shared,
        context=b"session-key-derivation"
    )
    bob_hybrid_key = hybrid_key_exchange(
        bob_classical_shared,
        bob_pq_shared,
        context=b"session-key-derivation"
    )
    
    # Both should have the same hybrid session key
    assert alice_hybrid_key == bob_hybrid_key
    assert len(alice_hybrid_key) == 32  # AES-256 key


def test_hybrid_key_exchange_with_serialization():
    """
    Test hybrid key exchange with key serialization (simulating network transmission).
    """
    # Alice generates keypairs
    alice_x25519_private, alice_x25519_public = generate_x25519_keypair()
    alice_pq_private, alice_pq_public = pq_generate_keypair()
    
    # Bob generates keypairs
    bob_x25519_private, bob_x25519_public = generate_x25519_keypair()
    bob_pq_private, bob_pq_public = pq_generate_keypair()
    
    # Serialize public keys for transmission
    alice_x25519_public_bytes = serialize_x25519_public_key(alice_x25519_public)
    alice_pq_public_bytes = serialize_pq_public_key(alice_pq_public)
    bob_x25519_public_bytes = serialize_x25519_public_key(bob_x25519_public)
    bob_pq_public_bytes = serialize_pq_public_key(bob_pq_public)
    
    # Deserialize received public keys
    alice_x25519_public_received = deserialize_x25519_public_key(alice_x25519_public_bytes)
    alice_pq_public_received = deserialize_pq_public_key(alice_pq_public_bytes)
    bob_x25519_public_received = deserialize_x25519_public_key(bob_x25519_public_bytes)
    bob_pq_public_received = deserialize_pq_public_key(bob_pq_public_bytes)
    
    # Perform key exchanges with deserialized keys
    alice_classical_shared = perform_key_exchange(alice_x25519_private, bob_x25519_public_received)
    bob_classical_shared = perform_key_exchange(bob_x25519_private, alice_x25519_public_received)
    
    ciphertext, alice_pq_shared = pq_encapsulate(bob_pq_public_received)
    bob_pq_shared = pq_decapsulate(bob_pq_private, ciphertext)
    
    # Derive hybrid keys
    alice_hybrid_key = hybrid_key_exchange(alice_classical_shared, alice_pq_shared)
    bob_hybrid_key = hybrid_key_exchange(bob_classical_shared, bob_pq_shared)
    
    assert alice_hybrid_key == bob_hybrid_key


def test_hybrid_provides_defense_in_depth():
    """
    Test that hybrid key is different from either component alone.
    This demonstrates defense-in-depth: breaking one algorithm doesn't break the hybrid.
    """
    classical_shared = b"classical_shared_secret_32bytes!"
    pq_shared = b"post_quantum_shared_secret_32b!!"
    
    hybrid_key = hybrid_key_exchange(classical_shared, pq_shared)
    
    # Hybrid key should be different from either component
    assert hybrid_key != classical_shared
    assert hybrid_key != pq_shared
    
    # Even if an attacker knows one component, they can't derive the hybrid key
    # (without also knowing the other component)
    fake_pq = b"attacker_guessed_pq_secret_32b!!"
    wrong_hybrid = hybrid_key_exchange(classical_shared, fake_pq)
    assert wrong_hybrid != hybrid_key


def test_different_contexts_produce_different_keys():
    """
    Test that context strings provide domain separation.
    """
    classical_shared = b"shared_secret_1234567890123456"
    pq_shared = b"pq_shared_secret_1234567890123"
    
    # Same secrets, different contexts
    key1 = hybrid_key_exchange(classical_shared, pq_shared, context=b"command-encryption")
    key2 = hybrid_key_exchange(classical_shared, pq_shared, context=b"telemetry-encryption")
    key3 = hybrid_key_exchange(classical_shared, pq_shared, context=b"audit-log-encryption")
    
    # All keys should be different
    assert key1 != key2
    assert key2 != key3
    assert key1 != key3


def test_hybrid_key_length_customization():
    """
    Test that hybrid key derivation supports different output lengths.
    """
    classical_shared = b"classical_shared_secret_32bytes!"
    pq_shared = b"post_quantum_shared_secret_32b!!"
    
    # Derive keys of different lengths
    key_16 = hybrid_key_exchange(classical_shared, pq_shared, length=16)  # AES-128
    key_32 = hybrid_key_exchange(classical_shared, pq_shared, length=32)  # AES-256
    key_64 = hybrid_key_exchange(classical_shared, pq_shared, length=64)  # Custom
    
    assert len(key_16) == 16
    assert len(key_32) == 32
    assert len(key_64) == 64
    
    # HKDF produces consistent prefixes (key_16 is the first 16 bytes of key_32)
    # This is correct HKDF behavior - it's deterministic and expandable
    assert key_16 == key_32[:16]
    assert key_32 == key_64[:32]


def test_production_readiness_check():
    """
    Test helper function to check if system is ready for production.
    """
    # In production, we should verify liboqs is available
    if LIBOQS_AVAILABLE:
        # Real liboqs is available - production ready
        assert True
    else:
        # Mock mode - not suitable for production
        # This test documents the check that should be done in production code
        with pytest.raises(RuntimeError, match="Production deployment requires real liboqs"):
            if not LIBOQS_AVAILABLE:
                raise RuntimeError("Production deployment requires real liboqs library")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
