"""
Basic tests for AEAD encryption and key exchange modules.
"""

import pytest
from core.aead import encrypt_aead, decrypt_aead
from core.key_exchange import (
    generate_x25519_keypair,
    perform_key_exchange,
    derive_session_key,
    serialize_x25519_public_key,
    deserialize_x25519_public_key,
    serialize_x25519_private_key,
    deserialize_x25519_private_key
)
from core.crypto_math import secure_random_bytes
from core.exceptions import DecryptionError, InvalidInputError


class TestAEAD:
    """Tests for AEAD encryption/decryption."""
    
    def test_encrypt_decrypt_roundtrip(self):
        """Test that encryption and decryption are inverses."""
        key = secure_random_bytes(32)
        plaintext = b"Secret command data"
        associated_data = b"drone_id=DRONE_07"
        
        ciphertext, nonce = encrypt_aead(key, plaintext, associated_data)
        decrypted = decrypt_aead(key, ciphertext, nonce, associated_data)
        
        assert decrypted == plaintext
    
    def test_encrypt_produces_different_ciphertext(self):
        """Test that encrypting the same plaintext twice produces different ciphertext."""
        key = secure_random_bytes(32)
        plaintext = b"Same message"
        associated_data = b"metadata"
        
        ciphertext1, nonce1 = encrypt_aead(key, plaintext, associated_data)
        ciphertext2, nonce2 = encrypt_aead(key, plaintext, associated_data)
        
        # Different nonces should produce different ciphertexts
        assert nonce1 != nonce2
        assert ciphertext1 != ciphertext2
    
    def test_decrypt_with_wrong_key_fails(self):
        """Test that decryption with wrong key fails."""
        key1 = secure_random_bytes(32)
        key2 = secure_random_bytes(32)
        plaintext = b"Secret data"
        associated_data = b"metadata"
        
        ciphertext, nonce = encrypt_aead(key1, plaintext, associated_data)
        
        with pytest.raises(DecryptionError):
            decrypt_aead(key2, ciphertext, nonce, associated_data)
    
    def test_decrypt_with_wrong_associated_data_fails(self):
        """Test that decryption with wrong associated data fails."""
        key = secure_random_bytes(32)
        plaintext = b"Secret data"
        associated_data1 = b"metadata1"
        associated_data2 = b"metadata2"
        
        ciphertext, nonce = encrypt_aead(key, plaintext, associated_data1)
        
        with pytest.raises(DecryptionError):
            decrypt_aead(key, ciphertext, nonce, associated_data2)
    
    def test_encrypt_with_invalid_key_size(self):
        """Test that encryption with invalid key size raises InvalidInputError."""
        key = secure_random_bytes(16)  # Wrong size
        plaintext = b"data"
        associated_data = b"metadata"
        
        with pytest.raises(InvalidInputError, match="Key must be 32 bytes"):
            encrypt_aead(key, plaintext, associated_data)
    
    def test_decrypt_with_invalid_nonce_size(self):
        """Test that decryption with invalid nonce size raises InvalidInputError."""
        key = secure_random_bytes(32)
        ciphertext = b"fake_ciphertext"
        nonce = secure_random_bytes(16)  # Wrong size
        associated_data = b"metadata"
        
        with pytest.raises(InvalidInputError, match="Nonce must be 12 bytes"):
            decrypt_aead(key, ciphertext, nonce, associated_data)


class TestKeyExchange:
    """Tests for X25519 key exchange."""
    
    def test_key_exchange_produces_same_secret(self):
        """Test that both parties derive the same shared secret."""
        # Party A generates keypair
        priv_a, pub_a = generate_x25519_keypair()
        
        # Party B generates keypair
        priv_b, pub_b = generate_x25519_keypair()
        
        # Both parties perform key exchange
        secret_a = perform_key_exchange(priv_a, pub_b)
        secret_b = perform_key_exchange(priv_b, pub_a)
        
        # Shared secrets should match
        assert secret_a == secret_b
        assert len(secret_a) == 32
    
    def test_derive_session_key(self):
        """Test session key derivation from shared secret."""
        priv_a, pub_a = generate_x25519_keypair()
        priv_b, pub_b = generate_x25519_keypair()
        
        shared_secret = perform_key_exchange(priv_a, pub_b)
        
        # Derive session key with context
        session_key = derive_session_key(shared_secret, b"command-encryption")
        
        assert len(session_key) == 32
    
    def test_different_contexts_produce_different_keys(self):
        """Test that different contexts produce different derived keys."""
        priv_a, pub_a = generate_x25519_keypair()
        priv_b, pub_b = generate_x25519_keypair()
        
        shared_secret = perform_key_exchange(priv_a, pub_b)
        
        key1 = derive_session_key(shared_secret, b"context1")
        key2 = derive_session_key(shared_secret, b"context2")
        
        assert key1 != key2
    
    def test_public_key_serialization_roundtrip(self):
        """Test that public key serialization and deserialization work."""
        _, public_key = generate_x25519_keypair()
        
        serialized = serialize_x25519_public_key(public_key)
        deserialized = deserialize_x25519_public_key(serialized)
        
        # Verify by serializing again
        assert serialize_x25519_public_key(deserialized) == serialized
    
    def test_private_key_serialization_roundtrip(self):
        """Test that private key serialization and deserialization work."""
        private_key, _ = generate_x25519_keypair()
        
        serialized = serialize_x25519_private_key(private_key)
        deserialized = deserialize_x25519_private_key(serialized)
        
        # Verify by serializing again
        assert serialize_x25519_private_key(deserialized) == serialized
    
    def test_deserialize_invalid_public_key_size(self):
        """Test that deserializing invalid public key size raises InvalidInputError."""
        invalid_key = secure_random_bytes(16)  # Wrong size
        
        with pytest.raises(InvalidInputError, match="X25519 public key must be 32 bytes"):
            deserialize_x25519_public_key(invalid_key)
    
    def test_deserialize_invalid_private_key_size(self):
        """Test that deserializing invalid private key size raises InvalidInputError."""
        invalid_key = secure_random_bytes(16)  # Wrong size
        
        with pytest.raises(InvalidInputError, match="X25519 private key must be 32 bytes"):
            deserialize_x25519_private_key(invalid_key)


class TestIntegration:
    """Integration tests combining AEAD and key exchange."""
    
    def test_secure_channel_simulation(self):
        """Simulate establishing a secure channel between two parties."""
        # Party A (CAS) and Party B (Drone) generate keypairs
        cas_priv, cas_pub = generate_x25519_keypair()
        drone_priv, drone_pub = generate_x25519_keypair()
        
        # Both parties perform key exchange
        cas_shared = perform_key_exchange(cas_priv, drone_pub)
        drone_shared = perform_key_exchange(drone_priv, cas_pub)
        
        assert cas_shared == drone_shared
        
        # Derive session keys
        cas_key = derive_session_key(cas_shared, b"cas-to-drone")
        drone_key = derive_session_key(drone_shared, b"cas-to-drone")
        
        assert cas_key == drone_key
        
        # CAS encrypts a command
        command = b"MOVE coordinates=[33.6844, 73.0479]"
        metadata = b"drone_id=DRONE_07"
        
        ciphertext, nonce = encrypt_aead(cas_key, command, metadata)
        
        # Drone decrypts the command
        decrypted_command = decrypt_aead(drone_key, ciphertext, nonce, metadata)
        
        assert decrypted_command == command
