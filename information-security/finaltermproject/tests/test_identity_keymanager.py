"""
Unit tests for server identity and key management modules.
Tests identity loading, verification, key management, caching, rotation, and revocation.

Requirements: 1.4, 11.1, 11.3, 11.4, 11.5
"""

import pytest
import os
import tempfile
import shutil
from pathlib import Path

from server.identity import (
    Identity,
    load_identity,
    verify_identity,
    save_identity,
    list_identities,
    update_identity_status
)
from server.key_manager import KeyManager
from core.authentication import generate_keypair, sign


class TestIdentityModule:
    """Test cases for the identity module."""
    
    def test_load_drone_identity(self):
        """Test loading a drone identity from storage."""
        identity = load_identity("DRONE_01")
        
        assert identity is not None
        assert identity.id == "DRONE_01"
        assert identity.entity_type == "drone"
        assert "MOVE" in identity.capabilities
        assert identity.is_active()
    
    def test_load_operator_identity(self):
        """Test loading an operator identity from storage."""
        identity = load_identity("OPERATOR_PILOT_01")
        
        assert identity is not None
        assert identity.id == "OPERATOR_PILOT_01"
        assert identity.entity_type == "operator"
        assert "pilot" in identity.roles
        assert identity.is_active()
    
    def test_load_nonexistent_identity(self):
        """Test loading a non-existent identity returns None."""
        identity = load_identity("NONEXISTENT_ID")
        assert identity is None
    
    def test_identity_has_role(self):
        """Test checking if identity has a specific role."""
        identity = load_identity("OPERATOR_PILOT_01")
        
        assert identity.has_role("pilot")
        assert not identity.has_role("admin")
    
    def test_identity_has_capability(self):
        """Test checking if identity has a specific capability."""
        identity = load_identity("DRONE_01")
        
        assert identity.has_capability("MOVE")
        assert identity.has_capability("LAND")
        assert not identity.has_capability("NONEXISTENT_CAPABILITY")
    
    def test_identity_can_execute_command(self):
        """Test checking if identity can execute a command type."""
        identity = load_identity("DRONE_01")
        
        assert identity.can_execute_command("MOVE")
        assert identity.can_execute_command("LAND")
        assert not identity.can_execute_command("UNAUTHORIZED_COMMAND")
    
    def test_verify_identity_with_valid_signature(self):
        """Test verifying identity with a valid cryptographic proof."""
        identity = load_identity("DRONE_01")
        
        # Load the drone's private key to create a signature
        private_key_path = "data/drones/DRONE_01/private_key.pem"
        with open(private_key_path, 'rb') as f:
            from core.authentication import deserialize_private_key
            private_key = deserialize_private_key(f.read())
        
        # Create a message and sign it
        message = b"test message"
        signature = sign(private_key, message)
        
        # Verify the identity
        assert verify_identity("DRONE_01", signature, message)
    
    def test_verify_identity_with_invalid_signature(self):
        """Test verifying identity with an invalid signature."""
        message = b"test message"
        invalid_signature = b"invalid_signature_bytes"
        
        assert not verify_identity("DRONE_01", invalid_signature, message)
    
    def test_list_drone_identities(self):
        """Test listing all drone identities."""
        identities = list_identities(entity_type="drone")
        
        assert len(identities) > 0
        assert all(i.entity_type == "drone" for i in identities)
        drone_ids = [i.id for i in identities]
        assert "DRONE_01" in drone_ids
    
    def test_list_operator_identities(self):
        """Test listing all operator identities."""
        identities = list_identities(entity_type="operator")
        
        assert len(identities) > 0
        assert all(i.entity_type == "operator" for i in identities)
        operator_ids = [i.id for i in identities]
        assert "OPERATOR_PILOT_01" in operator_ids
    
    def test_save_and_load_identity(self):
        """Test saving and loading a custom identity."""
        # Create a temporary directory for testing
        with tempfile.TemporaryDirectory() as tmpdir:
            # Generate a keypair
            private_key, public_key = generate_keypair()
            
            # Create a test identity
            test_identity = Identity(
                id="TEST_DRONE_99",
                public_key=public_key,
                roles=[],
                capabilities=["MOVE", "LAND"],
                allowed_commands=["MOVE", "LAND"],
                status="active",
                entity_type="drone"
            )
            
            # Save the identity
            save_identity(test_identity, tmpdir)
            
            # Load it back
            loaded_identity = load_identity("TEST_DRONE_99", tmpdir)
            
            assert loaded_identity is not None
            assert loaded_identity.id == "TEST_DRONE_99"
            assert loaded_identity.entity_type == "drone"
            assert "MOVE" in loaded_identity.capabilities


class TestKeyManager:
    """Test cases for the key manager module."""
    
    def test_get_drone_public_key(self):
        """Test retrieving a drone's public key."""
        km = KeyManager()
        public_key = km.get_drone_public_key("DRONE_01")
        
        assert public_key is not None
    
    def test_get_operator_public_key(self):
        """Test retrieving an operator's public key."""
        km = KeyManager()
        public_key = km.get_operator_public_key("OPERATOR_PILOT_01")
        
        assert public_key is not None
    
    def test_get_nonexistent_key(self):
        """Test retrieving a non-existent key returns None."""
        km = KeyManager()
        public_key = km.get_drone_public_key("NONEXISTENT_DRONE")
        
        assert public_key is None
    
    def test_public_key_caching(self):
        """Test that public keys are cached after first retrieval."""
        km = KeyManager()
        
        # First retrieval
        key1 = km.get_drone_public_key("DRONE_01")
        
        # Second retrieval should use cache
        key2 = km.get_drone_public_key("DRONE_01")
        
        # Should be the same object
        assert key1 == key2
        assert "DRONE_01" in km._public_key_cache
    
    def test_key_revocation(self):
        """Test revoking a key."""
        km = KeyManager()
        
        # First, ensure key can be retrieved
        key = km.get_drone_public_key("DRONE_02")
        assert key is not None
        
        # Revoke the key
        km.revoke_key("DRONE_02")
        
        # Check revocation status
        assert km.is_key_revoked("DRONE_02")
        
        # Try to retrieve revoked key
        revoked_key = km.get_drone_public_key("DRONE_02")
        assert revoked_key is None
    
    def test_cache_clearing(self):
        """Test clearing the public key cache."""
        km = KeyManager()
        
        # Load a key to populate cache
        km.get_drone_public_key("DRONE_01")
        assert len(km._public_key_cache) > 0
        
        # Clear cache
        km.clear_cache()
        assert len(km._public_key_cache) == 0
    
    def test_generate_and_load_cas_keypair(self):
        """Test generating and loading CAS keypair."""
        with tempfile.TemporaryDirectory() as tmpdir:
            km = KeyManager(cas_key_path=tmpdir)
            
            # Generate keypair
            private_key, public_key = km.generate_cas_keypair()
            
            assert private_key is not None
            assert public_key is not None
            
            # Verify files were created
            assert os.path.exists(os.path.join(tmpdir, "cas_private_key.pem"))
            assert os.path.exists(os.path.join(tmpdir, "cas_public_key.pem"))
            
            # Load the private key
            loaded_private_key = km.load_cas_private_key()
            assert loaded_private_key is not None
            
            # Load the public key
            loaded_public_key = km.load_cas_public_key()
            assert loaded_public_key is not None
    
    def test_generate_cas_keypair_with_password(self):
        """Test generating CAS keypair with password encryption."""
        with tempfile.TemporaryDirectory() as tmpdir:
            km = KeyManager(cas_key_path=tmpdir)
            password = b"test_password_123"
            
            # Generate keypair with password
            private_key, public_key = km.generate_cas_keypair(password)
            
            assert private_key is not None
            assert public_key is not None
            
            # Load with correct password
            loaded_key = km.load_cas_private_key(password)
            assert loaded_key is not None
            
            # Try loading with wrong password should fail
            with pytest.raises(ValueError):
                km.load_cas_private_key(b"wrong_password")
    
    def test_key_rotation(self):
        """Test rotating CAS keys."""
        with tempfile.TemporaryDirectory() as tmpdir:
            km = KeyManager(cas_key_path=tmpdir)
            
            # Generate initial keypair
            old_private, old_public = km.generate_cas_keypair()
            
            # Rotate keys
            new_private, new_public = km.rotate_keys()
            
            assert new_private is not None
            assert new_public is not None
            
            # Verify old key was archived
            archived_files = [f for f in os.listdir(tmpdir) if "archived" in f]
            assert len(archived_files) > 0
            
            # Verify new key is current
            current_key = km.load_cas_private_key()
            assert current_key is not None
    
    def test_revocation_persistence(self):
        """Test that revocation list persists across instances."""
        with tempfile.TemporaryDirectory() as tmpdir:
            # Create first key manager and revoke a key
            km1 = KeyManager(cas_key_path=tmpdir)
            km1.revoke_key("TEST_DRONE_01")
            
            # Create second key manager instance
            km2 = KeyManager(cas_key_path=tmpdir)
            
            # Check that revocation persisted
            assert km2.is_key_revoked("TEST_DRONE_01")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
