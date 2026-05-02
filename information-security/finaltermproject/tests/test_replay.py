"""
Tests for replay protection module.
Tests nonce storage, duplicate detection, and cleanup functionality.
"""

import pytest
import time
from server.replay_protection import NonceStore
from core.crypto_math import generate_nonce
from core.time_utils import get_current_timestamp


class TestNonceStore:
    """Test suite for NonceStore class."""
    
    def test_check_and_store_new_nonce(self):
        """Test that a new nonce is successfully stored."""
        store = NonceStore()
        nonce = generate_nonce()
        expires_at = get_current_timestamp() + 10
        
        result = store.check_and_store(nonce, expires_at)
        
        assert result is True
        assert store.contains(nonce)
        assert store.size() == 1
    
    def test_check_and_store_duplicate_nonce(self):
        """Test that a duplicate nonce is detected and rejected."""
        store = NonceStore()
        nonce = generate_nonce()
        expires_at = get_current_timestamp() + 10
        
        # Store the nonce first time
        result1 = store.check_and_store(nonce, expires_at)
        assert result1 is True
        
        # Try to store the same nonce again (replay attack)
        result2 = store.check_and_store(nonce, expires_at)
        assert result2 is False
        
        # Size should still be 1
        assert store.size() == 1
    
    def test_check_and_store_multiple_unique_nonces(self):
        """Test that multiple unique nonces can be stored."""
        store = NonceStore()
        expires_at = get_current_timestamp() + 10
        
        nonces = [generate_nonce() for _ in range(10)]
        
        for nonce in nonces:
            result = store.check_and_store(nonce, expires_at)
            assert result is True
        
        assert store.size() == 10
        
        # Verify all nonces are in the store
        for nonce in nonces:
            assert store.contains(nonce)
    
    def test_check_and_store_invalid_nonce_type(self):
        """Test that non-bytes nonce raises ValueError."""
        store = NonceStore()
        expires_at = get_current_timestamp() + 10
        
        with pytest.raises(ValueError, match="nonce must be bytes"):
            store.check_and_store("not_bytes", expires_at)
    
    def test_check_and_store_invalid_nonce_length(self):
        """Test that nonce with wrong length raises ValueError."""
        store = NonceStore()
        expires_at = get_current_timestamp() + 10
        
        # Too short
        with pytest.raises(ValueError, match="nonce must be exactly 32 bytes"):
            store.check_and_store(b"short", expires_at)
        
        # Too long
        with pytest.raises(ValueError, match="nonce must be exactly 32 bytes"):
            store.check_and_store(b"x" * 64, expires_at)
    
    def test_check_and_store_invalid_expires_at(self):
        """Test that invalid expires_at raises ValueError."""
        store = NonceStore()
        nonce = generate_nonce()
        
        # Negative timestamp
        with pytest.raises(ValueError, match="expires_at must be a non-negative integer"):
            store.check_and_store(nonce, -1)
        
        # Non-integer
        with pytest.raises(ValueError, match="expires_at must be a non-negative integer"):
            store.check_and_store(nonce, "not_int")
    
    def test_cleanup_expired_removes_old_nonces(self):
        """Test that cleanup_expired removes expired nonces."""
        store = NonceStore()
        current_time = get_current_timestamp()
        
        # Add some expired nonces
        expired_nonce1 = generate_nonce()
        expired_nonce2 = generate_nonce()
        store.check_and_store(expired_nonce1, current_time - 10)
        store.check_and_store(expired_nonce2, current_time - 5)
        
        # Add some valid nonces
        valid_nonce1 = generate_nonce()
        valid_nonce2 = generate_nonce()
        store.check_and_store(valid_nonce1, current_time + 10)
        store.check_and_store(valid_nonce2, current_time + 20)
        
        assert store.size() == 4
        
        # Cleanup expired nonces
        removed_count = store.cleanup_expired()
        
        assert removed_count == 2
        assert store.size() == 2
        
        # Verify expired nonces are gone
        assert not store.contains(expired_nonce1)
        assert not store.contains(expired_nonce2)
        
        # Verify valid nonces remain
        assert store.contains(valid_nonce1)
        assert store.contains(valid_nonce2)
    
    def test_cleanup_expired_no_expired_nonces(self):
        """Test that cleanup_expired works when no nonces are expired."""
        store = NonceStore()
        current_time = get_current_timestamp()
        
        # Add only valid nonces
        nonce1 = generate_nonce()
        nonce2 = generate_nonce()
        store.check_and_store(nonce1, current_time + 10)
        store.check_and_store(nonce2, current_time + 20)
        
        assert store.size() == 2
        
        # Cleanup should remove nothing
        removed_count = store.cleanup_expired()
        
        assert removed_count == 0
        assert store.size() == 2
    
    def test_cleanup_expired_empty_store(self):
        """Test that cleanup_expired works on empty store."""
        store = NonceStore()
        
        removed_count = store.cleanup_expired()
        
        assert removed_count == 0
        assert store.size() == 0
    
    def test_contains_existing_nonce(self):
        """Test that contains returns True for existing nonce."""
        store = NonceStore()
        nonce = generate_nonce()
        expires_at = get_current_timestamp() + 10
        
        store.check_and_store(nonce, expires_at)
        
        assert store.contains(nonce) is True
    
    def test_contains_nonexistent_nonce(self):
        """Test that contains returns False for nonexistent nonce."""
        store = NonceStore()
        nonce = generate_nonce()
        
        assert store.contains(nonce) is False
    
    def test_size_empty_store(self):
        """Test that size returns 0 for empty store."""
        store = NonceStore()
        
        assert store.size() == 0
    
    def test_size_after_operations(self):
        """Test that size correctly tracks nonce count."""
        store = NonceStore()
        expires_at = get_current_timestamp() + 10
        
        assert store.size() == 0
        
        # Add nonces
        nonce1 = generate_nonce()
        store.check_and_store(nonce1, expires_at)
        assert store.size() == 1
        
        nonce2 = generate_nonce()
        store.check_and_store(nonce2, expires_at)
        assert store.size() == 2
        
        # Try to add duplicate (should not increase size)
        store.check_and_store(nonce1, expires_at)
        assert store.size() == 2
    
    def test_clear_removes_all_nonces(self):
        """Test that clear removes all nonces from the store."""
        store = NonceStore()
        expires_at = get_current_timestamp() + 10
        
        # Add multiple nonces
        nonces = [generate_nonce() for _ in range(5)]
        for nonce in nonces:
            store.check_and_store(nonce, expires_at)
        
        assert store.size() == 5
        
        # Clear the store
        store.clear()
        
        assert store.size() == 0
        for nonce in nonces:
            assert not store.contains(nonce)
    
    def test_thread_safety_concurrent_operations(self):
        """Test that NonceStore is thread-safe with concurrent operations."""
        import threading
        
        store = NonceStore()
        expires_at = get_current_timestamp() + 10
        results = []
        
        def add_nonces(count):
            local_results = []
            for _ in range(count):
                nonce = generate_nonce()
                result = store.check_and_store(nonce, expires_at)
                local_results.append(result)
            results.extend(local_results)
        
        # Create multiple threads adding nonces concurrently
        threads = []
        for _ in range(5):
            thread = threading.Thread(target=add_nonces, args=(10,))
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # All operations should succeed (all nonces are unique)
        assert all(results)
        assert store.size() == 50
    
    def test_replay_attack_scenario(self):
        """Test realistic replay attack scenario."""
        store = NonceStore()
        current_time = get_current_timestamp()
        
        # Simulate a legitimate command
        legitimate_nonce = generate_nonce()
        expires_at = current_time + 5
        
        # First use - should succeed
        result1 = store.check_and_store(legitimate_nonce, expires_at)
        assert result1 is True
        
        # Attacker captures and replays the command (same nonce)
        result2 = store.check_and_store(legitimate_nonce, expires_at)
        assert result2 is False  # Replay detected!
        
        # Multiple replay attempts should all fail
        for _ in range(5):
            result = store.check_and_store(legitimate_nonce, expires_at)
            assert result is False
