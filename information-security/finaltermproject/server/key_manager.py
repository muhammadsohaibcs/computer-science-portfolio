"""
Key manager module for SDRCAS.
Manages CAS keypair and provides access to drone/operator public keys.
Implements key rotation, revocation, and secure storage.

Requirements: 11.1, 11.3, 11.4, 11.5
"""

import os
import json
from typing import Optional, Dict, Tuple
from datetime import datetime

from cryptography.hazmat.primitives.asymmetric.ed25519 import (
    Ed25519PrivateKey,
    Ed25519PublicKey
)

from core.authentication import (
    generate_keypair,
    serialize_private_key,
    deserialize_private_key,
    serialize_public_key,
    deserialize_public_key
)
from core.crypto_math import secure_random_bytes
from server.identity import load_identity


class KeyManager:
    """
    Manages cryptographic keys for the Command Authorization Server.
    
    Provides secure storage, caching, rotation, and revocation of keys.
    """
    
    def __init__(self, cas_key_path: str = "data/cas", identity_base_path: str = "data/cas"):
        """
        Initialize the key manager.
        
        Args:
            cas_key_path: Directory path for CAS key storage
            identity_base_path: Base path for identity storage
        """
        self.cas_key_path = cas_key_path
        self.identity_base_path = identity_base_path
        self._public_key_cache: Dict[str, Ed25519PublicKey] = {}
        self._revoked_keys: set = set()
        self._load_revocation_list()
    
    def generate_cas_keypair(self, password: Optional[bytes] = None) -> Tuple[Ed25519PrivateKey, Ed25519PublicKey]:
        """
        Generate a new CAS keypair and store it securely.
        
        Uses cryptographically secure random number generation.
        
        Args:
            password: Optional password for encrypting the private key at rest
            
        Returns:
            Tuple of (private_key, public_key)
            
        Requirements: 11.1
        """
        # Generate keypair using secure random
        private_key, public_key = generate_keypair()
        
        # Ensure CAS key directory exists
        os.makedirs(self.cas_key_path, exist_ok=True)
        
        # Serialize and save private key (encrypted if password provided)
        private_key_pem = serialize_private_key(private_key, password)
        private_key_file = os.path.join(self.cas_key_path, "cas_private_key.pem")
        
        # Write with restricted permissions (owner read/write only)
        with open(private_key_file, 'wb') as f:
            f.write(private_key_pem)
        os.chmod(private_key_file, 0o600)
        
        # Save public key
        public_key_pem = serialize_public_key(public_key)
        public_key_file = os.path.join(self.cas_key_path, "cas_public_key.pem")
        with open(public_key_file, 'wb') as f:
            f.write(public_key_pem)
        
        # Save key metadata
        self._save_key_metadata(private_key_file, "current")
        
        return private_key, public_key
    
    def load_cas_private_key(self, password: Optional[bytes] = None) -> Ed25519PrivateKey:
        """
        Load the CAS private key from secure storage.
        
        Args:
            password: Optional password for decrypting the private key
            
        Returns:
            Ed25519 private key
            
        Raises:
            FileNotFoundError: If CAS private key file doesn't exist
            ValueError: If key cannot be decrypted or is invalid
            
        Requirements: 11.1
        """
        private_key_file = os.path.join(self.cas_key_path, "cas_private_key.pem")
        
        if not os.path.exists(private_key_file):
            raise FileNotFoundError(f"CAS private key not found at {private_key_file}")
        
        with open(private_key_file, 'rb') as f:
            private_key_pem = f.read()
        
        return deserialize_private_key(private_key_pem, password)
    
    def load_cas_public_key(self) -> Ed25519PublicKey:
        """
        Load the CAS public key from storage.
        
        Returns:
            Ed25519 public key
            
        Raises:
            FileNotFoundError: If CAS public key file doesn't exist
            
        Requirements: 11.1
        """
        public_key_file = os.path.join(self.cas_key_path, "cas_public_key.pem")
        
        if not os.path.exists(public_key_file):
            raise FileNotFoundError(f"CAS public key not found at {public_key_file}")
        
        with open(public_key_file, 'rb') as f:
            public_key_pem = f.read()
        
        return deserialize_public_key(public_key_pem)
    
    def get_drone_public_key(self, drone_id: str) -> Optional[Ed25519PublicKey]:
        """
        Get a drone's public key with caching.
        
        Args:
            drone_id: Unique identifier of the drone
            
        Returns:
            Ed25519 public key if found, None otherwise
            
        Requirements: 11.1
        """
        # Check if key is revoked
        if drone_id in self._revoked_keys:
            return None
        
        # Check cache first
        if drone_id in self._public_key_cache:
            return self._public_key_cache[drone_id]
        
        # Load from identity storage
        identity = load_identity(drone_id, self.identity_base_path)
        if identity is None:
            return None
        
        # Cache the public key
        self._public_key_cache[drone_id] = identity.public_key
        
        return identity.public_key
    
    def get_operator_public_key(self, operator_id: str) -> Optional[Ed25519PublicKey]:
        """
        Get an operator's public key with caching.
        
        Args:
            operator_id: Unique identifier of the operator
            
        Returns:
            Ed25519 public key if found, None otherwise
            
        Requirements: 11.1
        """
        # Check if key is revoked
        if operator_id in self._revoked_keys:
            return None
        
        # Check cache first
        if operator_id in self._public_key_cache:
            return self._public_key_cache[operator_id]
        
        # Load from identity storage
        identity = load_identity(operator_id, self.identity_base_path)
        if identity is None:
            return None
        
        # Cache the public key
        self._public_key_cache[operator_id] = identity.public_key
        
        return identity.public_key
    
    def rotate_keys(self, password: Optional[bytes] = None) -> Tuple[Ed25519PrivateKey, Ed25519PublicKey]:
        """
        Rotate the CAS keypair while maintaining backward compatibility.
        
        Archives the old key and generates a new one. The old key is kept
        for a grace period to allow verification of commands signed with it.
        
        Args:
            password: Optional password for encrypting the new private key
            
        Returns:
            Tuple of (new_private_key, new_public_key)
            
        Requirements: 11.3, 11.5
        """
        # Archive the current key if it exists
        current_private_key_file = os.path.join(self.cas_key_path, "cas_private_key.pem")
        if os.path.exists(current_private_key_file):
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            archive_file = os.path.join(
                self.cas_key_path,
                f"cas_private_key_archived_{timestamp}.pem"
            )
            
            # Copy current key to archive
            with open(current_private_key_file, 'rb') as f:
                key_data = f.read()
            with open(archive_file, 'wb') as f:
                f.write(key_data)
            os.chmod(archive_file, 0o600)
            
            # Update metadata for archived key
            self._save_key_metadata(archive_file, "archived")
            
            # Archive public key too
            current_public_key_file = os.path.join(self.cas_key_path, "cas_public_key.pem")
            if os.path.exists(current_public_key_file):
                archive_public_file = os.path.join(
                    self.cas_key_path,
                    f"cas_public_key_archived_{timestamp}.pem"
                )
                with open(current_public_key_file, 'rb') as f:
                    pub_key_data = f.read()
                with open(archive_public_file, 'wb') as f:
                    f.write(pub_key_data)
        
        # Generate new keypair
        new_private_key, new_public_key = self.generate_cas_keypair(password)
        
        return new_private_key, new_public_key
    
    def revoke_key(self, key_id: str) -> None:
        """
        Revoke a key (drone or operator) to prevent its use.
        
        Args:
            key_id: Identifier of the key to revoke (drone_id or operator_id)
            
        Requirements: 11.4
        """
        # Add to revoked keys set
        self._revoked_keys.add(key_id)
        
        # Remove from cache if present
        if key_id in self._public_key_cache:
            del self._public_key_cache[key_id]
        
        # Persist revocation list
        self._save_revocation_list()
    
    def is_key_revoked(self, key_id: str) -> bool:
        """
        Check if a key has been revoked.
        
        Args:
            key_id: Identifier of the key to check
            
        Returns:
            True if key is revoked, False otherwise
            
        Requirements: 11.4
        """
        return key_id in self._revoked_keys
    
    def clear_cache(self) -> None:
        """
        Clear the public key cache.
        
        Useful after key updates or for memory management.
        """
        self._public_key_cache.clear()
    
    def _save_key_metadata(self, key_file: str, status: str) -> None:
        """
        Save metadata about a key file.
        
        Args:
            key_file: Path to the key file
            status: Status of the key ("current", "archived", "revoked")
        """
        metadata_file = key_file + ".metadata.json"
        metadata = {
            "key_file": os.path.basename(key_file),
            "status": status,
            "created_at": datetime.now().isoformat(),
            "algorithm": "Ed25519"
        }
        
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
    
    def _save_revocation_list(self) -> None:
        """
        Save the revocation list to persistent storage.
        """
        revocation_file = os.path.join(self.cas_key_path, "revoked_keys.json")
        revocation_data = {
            "revoked_keys": list(self._revoked_keys),
            "last_updated": datetime.now().isoformat()
        }
        
        with open(revocation_file, 'w') as f:
            json.dump(revocation_data, f, indent=2)
    
    def _load_revocation_list(self) -> None:
        """
        Load the revocation list from persistent storage.
        """
        revocation_file = os.path.join(self.cas_key_path, "revoked_keys.json")
        
        if os.path.exists(revocation_file):
            with open(revocation_file, 'r') as f:
                revocation_data = json.load(f)
            self._revoked_keys = set(revocation_data.get("revoked_keys", []))
        else:
            self._revoked_keys = set()


# Convenience functions for module-level access

_default_key_manager: Optional[KeyManager] = None


def get_key_manager(cas_key_path: str = "data/cas", identity_base_path: str = "data/cas") -> KeyManager:
    """
    Get or create the default key manager instance.
    
    Args:
        cas_key_path: Directory path for CAS key storage
        identity_base_path: Base path for identity storage
        
    Returns:
        KeyManager instance
    """
    global _default_key_manager
    if _default_key_manager is None:
        _default_key_manager = KeyManager(cas_key_path, identity_base_path)
    return _default_key_manager


def generate_cas_keypair(password: Optional[bytes] = None) -> Tuple[Ed25519PrivateKey, Ed25519PublicKey]:
    """
    Generate a new CAS keypair using the default key manager.
    
    Args:
        password: Optional password for encrypting the private key
        
    Returns:
        Tuple of (private_key, public_key)
        
    Requirements: 11.1
    """
    km = get_key_manager()
    return km.generate_cas_keypair(password)


def load_cas_private_key(password: Optional[bytes] = None) -> Ed25519PrivateKey:
    """
    Load the CAS private key using the default key manager.
    
    Args:
        password: Optional password for decrypting the private key
        
    Returns:
        Ed25519 private key
        
    Requirements: 11.1
    """
    km = get_key_manager()
    return km.load_cas_private_key(password)


def get_drone_public_key(drone_id: str) -> Optional[Ed25519PublicKey]:
    """
    Get a drone's public key using the default key manager.
    
    Args:
        drone_id: Unique identifier of the drone
        
    Returns:
        Ed25519 public key if found, None otherwise
        
    Requirements: 11.1
    """
    km = get_key_manager()
    return km.get_drone_public_key(drone_id)


def rotate_keys(password: Optional[bytes] = None) -> Tuple[Ed25519PrivateKey, Ed25519PublicKey]:
    """
    Rotate the CAS keypair using the default key manager.
    
    Args:
        password: Optional password for encrypting the new private key
        
    Returns:
        Tuple of (new_private_key, new_public_key)
        
    Requirements: 11.3, 11.5
    """
    km = get_key_manager()
    return km.rotate_keys(password)


def revoke_key(key_id: str) -> None:
    """
    Revoke a key using the default key manager.
    
    Args:
        key_id: Identifier of the key to revoke
        
    Requirements: 11.4
    """
    km = get_key_manager()
    km.revoke_key(key_id)
