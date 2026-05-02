"""
Unit tests for secure storage module.
Tests secure key storage and nonce storage for replay protection.
"""

import pytest
import os
import tempfile
import shutil
from pathlib import Path

from drone.secure_storage import SecureKeyStorage, NonceStorage
from core.authentication import generate_keypair
from core.time_utils import get_current_timestamp
from core.constants import NONCE_SIZE


class TestSecureKeyStorage:
    """Tests for SecureKeyStorage class."""
    
    @pytest.fixture
    def temp_storage(self):
        """Create a temporary storage directory for testing."""
        temp_dir = tempfile.mkdtemp()
        yield temp_dir
        # Cleanup after test
        shutil.rmtree(temp_dir, ignore_errors=True)
    
    @pytest.fixture
    def key_storage(self, temp_storage):
        """Create a SecureKeyStorage instance with temporary storage."""
        return SecureKeyStorage(storage_path=temp_storage)
    
    def test_store_and_load_private_key(self, key_storage):
        """Test storing and loading a private key with encryption."""
        # Generate a test key
        private_key, _ = generate_keypair()
        drone_id = "DRONE_TEST_01"
        password = "test_password_123"
        
        # Store the key
        key_storage.store_private_key(drone_id, private_key, password)
        
        # Verify file was created
        assert key_storage.key_exists(drone_id)
        
        # Load the key back
        loaded_key = key_storage.load_private_key(drone_id, password)
        
        # Verify the loaded key works correctly
        from core.authentication import sign, verify_signature
        message = b"Test message"
        signature = sign(loaded_key, message)
        public_key = private_key.public_key()
        assert verify_signature(public_key, message, signature)
    
    def test_load_with_wrong_password_fails(self, key_storage):
        """Test that loading with wrong password fails."""
        private_key, _ = generate_keypair()
        drone_id = "DRONE_TEST_02"
        password = "correct_password"
        wrong_password = "wrong_password"
        
        # Store the key
        key_storage.store_private_key(drone_id, private_key, password)
        
        # Try to load with wrong password
        with pytest.raises(Exception) as exc_info:
            key_storage.load_private_key(drone_id, wrong_password)
        
        assert "Failed to load private key" in str(exc_info.value)
    
    def test_load_nonexistent_key_fails(self, key_storage):
        """Test that loading a non-existent key fails."""
        with pytest.raises(ValueError) as exc_info:
            key_storage.load_private_key("NONEXISTENT_DRONE", "password")
        
        assert "Private key file not found" in str(exc_info.value)
    
    def test_key_exists(self, key_storage):
        """Test key_exists method."""
        private_key, _ = generate_keypair()
        drone_id = "DRONE_TEST_03"
        password = "password"
        
        # Initially should not exist
        assert not key_storage.key_exists(drone_id)
        
        # Store key
        key_storage.store_private_key(drone_id, private_key, password)
        
        # Now should exist
        assert key_storage.key_exists(drone_id)
    
    def test_delete_private_key(self, key_storage):
        """Test deleting a stored private key."""
        private_key, _ = generate_keypair()
        drone_id = "DRONE_TEST_04"
        password = "password"
        
        # Store key
        key_storage.store_private_key(drone_id, private_key, password)
        assert key_storage.key_exists(drone_id)
        
        # Delete key
        result = key_storage.delete_private_key(drone_id)
        assert result is True
        assert not key_storage.key_exists(drone_id)
        
        # Delete again should return False
        result = key_storage.delete_private_key(drone_id)
        assert result is False
    
    def test_store_empty_drone_id_fails(self, key_storage):
        """Test that storing with empty drone_id fails."""
        private_key, _ = generate_keypair()
        
        with pytest.raises(ValueError) as exc_info:
            key_storage.store_private_key("", private_key, "password")
        
        assert "drone_id cannot be empty" in str(exc_info.value)
    
    def test_store_empty_password_fails(self, key_storage):
        """Test that storing with empty password fails."""
        private_key, _ = generate_keypair()
        
        with pytest.raises(ValueError) as exc_info:
            key_storage.store_private_key("DRONE_01", private_key, "")
        
        assert "password cannot be empty" in str(exc_info.value)
    
    def test_store_invalid_key_type_fails(self, key_storage):
        """Test that storing invalid key type fails."""
        with pytest.raises(TypeError) as exc_info:
            key_storage.store_private_key("DRONE_01", "not_a_key", "password")
        
        assert "must be an Ed25519PrivateKey" in str(exc_info.value)


class TestNonceStorage:
    """Tests for NonceStorage class."""
    
    @pytest.fixture
    def temp_storage(self):
        """Create a temporary storage directory for testing."""
        temp_dir = tempfile.mkdtemp()
        yield temp_dir
        # Cleanup after test
        shutil.rmtree(temp_dir, ignore_errors=True)
    
    @pytest.fixture
    def nonce_storage(self, temp_storage):
        """Create a NonceStorage instance with temporary storage."""
        return NonceStorage(storage_path=temp_storage)
    
    def test_store_and_check_nonce(self, nonce_storage):
        """Test storing and checking a nonce."""
        drone_id = "DRONE_TEST_01"
        nonce = os.urandom(NONCE_SIZE)
        expires_at = get_current_timestamp() + 300  # 5 minutes from now
        
        # Initially nonce should not exist
        assert not nonce_storage.check_nonce_exists(drone_id, nonce)
        
        # Store nonce
        nonce_storage.store_nonce(drone_id, nonce, expires_at)
        
        # Now nonce should exist
        assert nonce_storage.check_nonce_exists(drone_id, nonce)
    
    def test_different_nonces_are_independent(self, nonce_storage):
        """Test that different nonces are stored independently."""
        drone_id = "DRONE_TEST_02"
        nonce1 = os.urandom(NONCE_SIZE)
        nonce2 = os.urandom(NONCE_SIZE)
        expires_at = get_current_timestamp() + 300
        
        # Store first nonce
        nonce_storage.store_nonce(drone_id, nonce1, expires_at)
        
        # First should exist, second should not
        assert nonce_storage.check_nonce_exists(drone_id, nonce1)
        assert not nonce_storage.check_nonce_exists(drone_id, nonce2)
        
        # Store second nonce
        nonce_storage.store_nonce(drone_id, nonce2, expires_at)
        
        # Both should exist
        assert nonce_storage.check_nonce_exists(drone_id, nonce1)
        assert nonce_storage.check_nonce_exists(drone_id, nonce2)
    
    def test_cleanup_expired_nonces(self, nonce_storage):
        """Test cleanup of expired nonces."""
        drone_id = "DRONE_TEST_03"
        current_time = get_current_timestamp()
        
        # Store expired nonce
        expired_nonce = os.urandom(NONCE_SIZE)
        nonce_storage.store_nonce(drone_id, expired_nonce, current_time - 100)
        
        # Store valid nonce
        valid_nonce = os.urandom(NONCE_SIZE)
        nonce_storage.store_nonce(drone_id, valid_nonce, current_time + 300)
        
        # Both should exist initially
        assert nonce_storage.check_nonce_exists(drone_id, expired_nonce)
        assert nonce_storage.check_nonce_exists(drone_id, valid_nonce)
        
        # Cleanup expired
        removed_count = nonce_storage.cleanup_expired(drone_id)
        assert removed_count == 1
        
        # Expired should be gone, valid should remain
        assert not nonce_storage.check_nonce_exists(drone_id, expired_nonce)
        assert nonce_storage.check_nonce_exists(drone_id, valid_nonce)
    
    def test_count_nonces(self, nonce_storage):
        """Test counting stored nonces."""
        drone_id = "DRONE_TEST_04"
        expires_at = get_current_timestamp() + 300
        
        # Initially should be 0
        assert nonce_storage.count_nonces(drone_id) == 0
        
        # Store some nonces
        for i in range(5):
            nonce = os.urandom(NONCE_SIZE)
            nonce_storage.store_nonce(drone_id, nonce, expires_at)
        
        # Should have 5 nonces
        assert nonce_storage.count_nonces(drone_id) == 5
    
    def test_clear_all_nonces(self, nonce_storage):
        """Test clearing all nonces for a drone."""
        drone_id = "DRONE_TEST_05"
        expires_at = get_current_timestamp() + 300
        
        # Store some nonces
        nonces = [os.urandom(NONCE_SIZE) for _ in range(3)]
        for nonce in nonces:
            nonce_storage.store_nonce(drone_id, nonce, expires_at)
        
        assert nonce_storage.count_nonces(drone_id) == 3
        
        # Clear all
        nonce_storage.clear_all_nonces(drone_id)
        
        # Should be empty
        assert nonce_storage.count_nonces(drone_id) == 0
        for nonce in nonces:
            assert not nonce_storage.check_nonce_exists(drone_id, nonce)
    
    def test_store_invalid_nonce_size_fails(self, nonce_storage):
        """Test that storing nonce with wrong size fails."""
        drone_id = "DRONE_TEST_06"
        expires_at = get_current_timestamp() + 300
        
        # Too short
        with pytest.raises(ValueError) as exc_info:
            nonce_storage.store_nonce(drone_id, b"short", expires_at)
        
        assert "must be exactly" in str(exc_info.value)
        
        # Too long
        with pytest.raises(ValueError) as exc_info:
            nonce_storage.store_nonce(drone_id, os.urandom(64), expires_at)
        
        assert "must be exactly" in str(exc_info.value)
    
    def test_store_invalid_expires_at_fails(self, nonce_storage):
        """Test that storing with invalid expires_at fails."""
        drone_id = "DRONE_TEST_07"
        nonce = os.urandom(NONCE_SIZE)
        
        # Negative timestamp
        with pytest.raises(ValueError) as exc_info:
            nonce_storage.store_nonce(drone_id, nonce, -100)
        
        assert "must be a non-negative integer" in str(exc_info.value)
    
    def test_check_invalid_nonce_size_fails(self, nonce_storage):
        """Test that checking nonce with wrong size fails."""
        drone_id = "DRONE_TEST_08"
        
        with pytest.raises(ValueError) as exc_info:
            nonce_storage.check_nonce_exists(drone_id, b"short")
        
        assert "must be exactly" in str(exc_info.value)
    
    def test_nonces_persist_across_instances(self, temp_storage):
        """Test that nonces persist when storage is reloaded."""
        drone_id = "DRONE_TEST_09"
        nonce = os.urandom(NONCE_SIZE)
        expires_at = get_current_timestamp() + 300
        
        # Store nonce with first instance
        storage1 = NonceStorage(storage_path=temp_storage)
        storage1.store_nonce(drone_id, nonce, expires_at)
        
        # Create new instance and check nonce exists
        storage2 = NonceStorage(storage_path=temp_storage)
        assert storage2.check_nonce_exists(drone_id, nonce)
    
    def test_different_drones_have_separate_nonces(self, nonce_storage):
        """Test that different drones have separate nonce storage."""
        drone1 = "DRONE_TEST_10"
        drone2 = "DRONE_TEST_11"
        nonce = os.urandom(NONCE_SIZE)
        expires_at = get_current_timestamp() + 300
        
        # Store nonce for drone1
        nonce_storage.store_nonce(drone1, nonce, expires_at)
        
        # Should exist for drone1 but not drone2
        assert nonce_storage.check_nonce_exists(drone1, nonce)
        assert not nonce_storage.check_nonce_exists(drone2, nonce)
