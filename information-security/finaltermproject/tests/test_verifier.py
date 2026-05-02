"""
Tests for drone command verification module.
Tests signature, target, freshness, and nonce verification.
"""

import pytest
import time
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

from core.command_token import CommandToken, create_command_token, serialize_token
from core.authentication import generate_keypair, sign
from core.time_utils import get_current_timestamp
from core.crypto_math import generate_nonce
from drone.verifier import (
    verify_command_signature,
    verify_command_target,
    verify_command_freshness,
    verify_nonce_unused,
    verify_command_complete,
    clear_nonce_store
)


@pytest.fixture
def cas_keypair():
    """Generate a CAS keypair for testing."""
    return generate_keypair()


@pytest.fixture
def sample_token():
    """Create a sample command token for testing."""
    return create_command_token(
        command_type="MOVE",
        target_drone_id="DRONE_01",
        parameters={"coordinates": [33.6844, 73.0479], "altitude": 100},
        issuer="OPERATOR_123",
        validity_duration=5
    )


@pytest.fixture(autouse=True)
def clear_nonces():
    """Clear nonce store before each test."""
    clear_nonce_store()
    yield
    clear_nonce_store()


class TestVerifyCommandSignature:
    """Tests for signature verification."""
    
    def test_valid_signature(self, cas_keypair, sample_token):
        """Test that a valid signature is accepted."""
        cas_private_key, cas_public_key = cas_keypair
        
        # Sign the token
        message = serialize_token(sample_token)
        signature = sign(cas_private_key, message)
        
        # Verify the signature
        assert verify_command_signature(sample_token, signature, cas_public_key)
    
    def test_invalid_signature(self, cas_keypair, sample_token):
        """Test that an invalid signature is rejected."""
        _, cas_public_key = cas_keypair
        
        # Create a fake signature
        fake_signature = b"invalid_signature_bytes_here_1234567890123456789012345678901234567890123456"
        
        # Verify should fail
        assert not verify_command_signature(sample_token, fake_signature, cas_public_key)
    
    def test_wrong_key_signature(self, sample_token):
        """Test that a signature from a different key is rejected."""
        # Generate two different keypairs
        cas_private_key1, _ = generate_keypair()
        _, cas_public_key2 = generate_keypair()
        
        # Sign with key 1
        message = serialize_token(sample_token)
        signature = sign(cas_private_key1, message)
        
        # Verify with key 2 should fail
        assert not verify_command_signature(sample_token, signature, cas_public_key2)
    
    def test_modified_token(self, cas_keypair, sample_token):
        """Test that modifying the token after signing invalidates the signature."""
        cas_private_key, cas_public_key = cas_keypair
        
        # Sign the original token
        message = serialize_token(sample_token)
        signature = sign(cas_private_key, message)
        
        # Modify the token
        sample_token.command_type = "LAND"
        
        # Verification should fail
        assert not verify_command_signature(sample_token, signature, cas_public_key)


class TestVerifyCommandTarget:
    """Tests for target drone ID verification."""
    
    def test_correct_target(self, sample_token):
        """Test that a command for the correct drone is accepted."""
        assert verify_command_target(sample_token, "DRONE_01")
    
    def test_wrong_target(self, sample_token):
        """Test that a command for a different drone is rejected."""
        assert not verify_command_target(sample_token, "DRONE_02")
    
    def test_empty_drone_id(self, sample_token):
        """Test that an empty drone ID is rejected."""
        assert not verify_command_target(sample_token, "")


class TestVerifyCommandFreshness:
    """Tests for timestamp freshness verification."""
    
    def test_fresh_command(self, sample_token):
        """Test that a fresh command is accepted."""
        assert verify_command_freshness(sample_token)
    
    def test_expired_command(self):
        """Test that an expired command is rejected."""
        # Create a token that expired 10 seconds ago
        current_time = get_current_timestamp()
        expired_token = create_command_token(
            command_type="MOVE",
            target_drone_id="DRONE_01",
            parameters={},
            issuer="OPERATOR_123",
            validity_duration=5,
            issued_at=current_time - 20  # Issued 20 seconds ago, expired 15 seconds ago
        )
        
        assert not verify_command_freshness(expired_token)
    
    def test_future_command(self):
        """Test that a command with future timestamp is rejected."""
        # Create a token issued in the future (beyond tolerance)
        current_time = get_current_timestamp()
        future_token = create_command_token(
            command_type="MOVE",
            target_drone_id="DRONE_01",
            parameters={},
            issuer="OPERATOR_123",
            validity_duration=5,
            issued_at=current_time + 100  # Issued 100 seconds in the future
        )
        
        assert not verify_command_freshness(future_token)
    
    def test_command_within_tolerance(self):
        """Test that a command within clock skew tolerance is accepted."""
        # Create a token issued slightly in the past (within tolerance)
        current_time = get_current_timestamp()
        token = create_command_token(
            command_type="MOVE",
            target_drone_id="DRONE_01",
            parameters={},
            issuer="OPERATOR_123",
            validity_duration=5,
            issued_at=current_time - 2  # Issued 2 seconds ago
        )
        
        assert verify_command_freshness(token)


class TestVerifyNonceUnused:
    """Tests for nonce replay protection."""
    
    def test_unused_nonce(self):
        """Test that an unused nonce is accepted."""
        nonce = generate_nonce()
        assert verify_nonce_unused(nonce)
    
    def test_used_nonce(self):
        """Test that a used nonce is rejected."""
        nonce = generate_nonce()
        
        # First use should succeed
        assert verify_nonce_unused(nonce)
        
        # Second use should fail (replay attack)
        assert not verify_nonce_unused(nonce)
    
    def test_different_nonces(self):
        """Test that different nonces are both accepted."""
        nonce1 = generate_nonce()
        nonce2 = generate_nonce()
        
        assert verify_nonce_unused(nonce1)
        assert verify_nonce_unused(nonce2)


class TestVerifyCommandComplete:
    """Tests for complete command verification."""
    
    def test_valid_command(self, cas_keypair, sample_token):
        """Test that a fully valid command passes all checks."""
        cas_private_key, cas_public_key = cas_keypair
        
        # Sign the token
        message = serialize_token(sample_token)
        signature = sign(cas_private_key, message)
        
        # Verify complete
        is_valid, reason = verify_command_complete(
            sample_token,
            signature,
            "DRONE_01",
            cas_public_key
        )
        
        assert is_valid
        assert "successful" in reason.lower()
    
    def test_invalid_signature_fails(self, cas_keypair, sample_token):
        """Test that invalid signature causes verification to fail."""
        _, cas_public_key = cas_keypair
        fake_signature = b"x" * 64
        
        is_valid, reason = verify_command_complete(
            sample_token,
            fake_signature,
            "DRONE_01",
            cas_public_key
        )
        
        assert not is_valid
        assert "signature" in reason.lower()
    
    def test_wrong_target_fails(self, cas_keypair, sample_token):
        """Test that wrong target drone ID causes verification to fail."""
        cas_private_key, cas_public_key = cas_keypair
        
        # Sign the token
        message = serialize_token(sample_token)
        signature = sign(cas_private_key, message)
        
        # Verify with wrong drone ID
        is_valid, reason = verify_command_complete(
            sample_token,
            signature,
            "DRONE_02",  # Wrong drone
            cas_public_key
        )
        
        assert not is_valid
        assert "not addressed" in reason.lower() or "target" in reason.lower()
    
    def test_expired_command_fails(self, cas_keypair):
        """Test that expired command causes verification to fail."""
        cas_private_key, cas_public_key = cas_keypair
        
        # Create an expired token
        current_time = get_current_timestamp()
        expired_token = create_command_token(
            command_type="MOVE",
            target_drone_id="DRONE_01",
            parameters={},
            issuer="OPERATOR_123",
            validity_duration=5,
            issued_at=current_time - 20
        )
        
        # Sign the token
        message = serialize_token(expired_token)
        signature = sign(cas_private_key, message)
        
        # Verify should fail
        is_valid, reason = verify_command_complete(
            expired_token,
            signature,
            "DRONE_01",
            cas_public_key
        )
        
        assert not is_valid
        assert "fresh" in reason.lower() or "expired" in reason.lower()
    
    def test_replay_attack_fails(self, cas_keypair, sample_token):
        """Test that replaying a command is detected and rejected."""
        cas_private_key, cas_public_key = cas_keypair
        
        # Sign the token
        message = serialize_token(sample_token)
        signature = sign(cas_private_key, message)
        
        # First verification should succeed
        is_valid1, reason1 = verify_command_complete(
            sample_token,
            signature,
            "DRONE_01",
            cas_public_key
        )
        assert is_valid1
        
        # Second verification should fail (replay attack)
        is_valid2, reason2 = verify_command_complete(
            sample_token,
            signature,
            "DRONE_01",
            cas_public_key
        )
        assert not is_valid2
        assert "nonce" in reason2.lower() or "replay" in reason2.lower()
    
    def test_verification_order_matters(self, cas_keypair):
        """Test that verification checks are performed in the correct order."""
        _, cas_public_key = cas_keypair
        
        # Create an expired token with invalid signature
        current_time = get_current_timestamp()
        expired_token = create_command_token(
            command_type="MOVE",
            target_drone_id="DRONE_01",
            parameters={},
            issuer="OPERATOR_123",
            validity_duration=5,
            issued_at=current_time - 20
        )
        
        fake_signature = b"x" * 64
        
        # Should fail on signature check first (before checking expiration)
        is_valid, reason = verify_command_complete(
            expired_token,
            fake_signature,
            "DRONE_01",
            cas_public_key
        )
        
        assert not is_valid
        assert "signature" in reason.lower()
