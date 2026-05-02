"""
Secure storage module for drone agents.
Implements secure key storage with encryption at rest and nonce storage for replay protection.

Requirements: 1.5, 7.4
"""

import os
import json
import threading
from pathlib import Path
from typing import Optional, Set

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend

from core.authentication import serialize_private_key, deserialize_private_key
from core.time_utils import get_current_timestamp
from core.constants import NONCE_SIZE


class SecureKeyStorage:
    """
    Secure storage for drone private keys with encryption at rest.
    
    Uses password-based encryption to protect private keys stored on disk.
    """
    
    def __init__(self, storage_path: str = "data/drones"):
        """
        Initialize secure key storage.
        
        Args:
            storage_path: Directory path for storing encrypted keys
        """
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)
    
    def store_private_key(
        self,
        drone_id: str,
        private_key: Ed25519PrivateKey,
        password: str
    ) -> None:
        """
        Store a private key with encryption at rest.
        
        The private key is encrypted using the provided password before being
        written to disk. This ensures that even if the storage is compromised,
        the key cannot be extracted without the password.
        
        Args:
            drone_id: Unique identifier for the drone
            private_key: Ed25519 private key to store
            password: Password for encrypting the key
            
        Raises:
            ValueError: If drone_id or password is empty
            TypeError: If private_key is not an Ed25519PrivateKey
            
        Requirements: 1.5
        """
        if not drone_id:
            raise ValueError("drone_id cannot be empty")
        
        if not password:
            raise ValueError("password cannot be empty")
        
        if not isinstance(private_key, Ed25519PrivateKey):
            raise TypeError("private_key must be an Ed25519PrivateKey")
        
        # Convert password to bytes
        password_bytes = password.encode('utf-8')
        
        # Serialize private key with encryption
        encrypted_pem = serialize_private_key(private_key, password_bytes)
        
        # Store to file in drone-specific directory
        drone_dir = self.storage_path / drone_id
        drone_dir.mkdir(parents=True, exist_ok=True)
        key_file = drone_dir / "private_key.pem"
        with open(key_file, 'wb') as f:
            f.write(encrypted_pem)
        
        # Set restrictive file permissions (owner read/write only)
        os.chmod(key_file, 0o600)
    
    def load_private_key(
        self,
        drone_id: str,
        password: str
    ) -> Ed25519PrivateKey:
        """
        Load a private key from secure storage.
        
        Decrypts the stored private key using the provided password.
        
        Args:
            drone_id: Unique identifier for the drone
            password: Password for decrypting the key
            
        Returns:
            Ed25519 private key
            
        Raises:
            ValueError: If drone_id or password is empty, or key file not found
            Exception: If password is incorrect or key is corrupted
            
        Requirements: 1.5
        """
        if not drone_id:
            raise ValueError("drone_id cannot be empty")
        
        if not password:
            raise ValueError("password cannot be empty")
        
        # Load encrypted key from file in drone-specific directory
        key_file = self.storage_path / drone_id / "private_key.pem"
        
        if not key_file.exists():
            raise ValueError(f"Private key file not found for drone {drone_id}")
        
        with open(key_file, 'rb') as f:
            encrypted_pem = f.read()
        
        # Convert password to bytes
        password_bytes = password.encode('utf-8')
        
        # Deserialize and decrypt private key
        try:
            private_key = deserialize_private_key(encrypted_pem, password_bytes)
            return private_key
        except Exception as e:
            raise Exception(f"Failed to load private key: incorrect password or corrupted key") from e
    
    def key_exists(self, drone_id: str) -> bool:
        """
        Check if a private key exists for the given drone.
        
        Args:
            drone_id: Unique identifier for the drone
            
        Returns:
            True if key file exists, False otherwise
        """
        key_file = self.storage_path / drone_id / "private_key.pem"
        return key_file.exists()
    
    def delete_private_key(self, drone_id: str) -> bool:
        """
        Delete a stored private key.
        
        Args:
            drone_id: Unique identifier for the drone
            
        Returns:
            True if key was deleted, False if key didn't exist
        """
        key_file = self.storage_path / drone_id / "private_key.pem"
        
        if key_file.exists():
            os.remove(key_file)
            return True
        
        return False


class NonceStorage:
    """
    Persistent nonce storage for replay attack prevention on drones.
    
    Stores nonces with expiration tracking in a file-based database.
    Provides thread-safe operations for checking and storing nonces.
    """
    
    def __init__(self, storage_path: str = "data/drone_nonces"):
        """
        Initialize nonce storage.
        
        Args:
            storage_path: Directory path for storing nonce data
        """
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)
        self._lock = threading.Lock()
    
    def _get_nonce_file(self, drone_id: str) -> Path:
        """Get the nonce storage file path for a specific drone."""
        return self.storage_path / f"{drone_id}_nonces.json"
    
    def _load_nonces(self, drone_id: str) -> dict:
        """
        Load nonces from file.
        
        Returns:
            Dictionary mapping nonce (hex string) to expiration timestamp
        """
        nonce_file = self._get_nonce_file(drone_id)
        
        if not nonce_file.exists():
            return {}
        
        try:
            with open(nonce_file, 'r') as f:
                data = json.load(f)
                return data.get('nonces', {})
        except (json.JSONDecodeError, IOError):
            # If file is corrupted, start fresh
            return {}
    
    def _save_nonces(self, drone_id: str, nonces: dict) -> None:
        """
        Save nonces to file.
        
        Args:
            drone_id: Unique identifier for the drone
            nonces: Dictionary mapping nonce (hex string) to expiration timestamp
        """
        nonce_file = self._get_nonce_file(drone_id)
        
        data = {
            'drone_id': drone_id,
            'nonces': nonces
        }
        
        # Write atomically by writing to temp file then renaming
        temp_file = nonce_file.with_suffix('.tmp')
        with open(temp_file, 'w') as f:
            json.dump(data, f, indent=2)
        
        # Atomic rename
        temp_file.replace(nonce_file)
        
        # Set restrictive file permissions
        os.chmod(nonce_file, 0o600)
    
    def store_nonce(
        self,
        drone_id: str,
        nonce: bytes,
        expires_at: int
    ) -> None:
        """
        Store a nonce with its expiration time.
        
        Args:
            drone_id: Unique identifier for the drone
            nonce: The nonce to store (32 bytes)
            expires_at: Unix timestamp when this nonce expires
            
        Raises:
            ValueError: If nonce is not 32 bytes or expires_at is invalid
            
        Requirements: 7.4
        """
        if not isinstance(nonce, bytes):
            raise ValueError("nonce must be bytes")
        
        if len(nonce) != NONCE_SIZE:
            raise ValueError(f"nonce must be exactly {NONCE_SIZE} bytes")
        
        if not isinstance(expires_at, int) or expires_at < 0:
            raise ValueError("expires_at must be a non-negative integer")
        
        with self._lock:
            # Load existing nonces
            nonces = self._load_nonces(drone_id)
            
            # Convert nonce to hex string for JSON storage
            nonce_hex = nonce.hex()
            
            # Store nonce with expiration
            nonces[nonce_hex] = expires_at
            
            # Save back to file
            self._save_nonces(drone_id, nonces)
    
    def check_nonce_exists(self, drone_id: str, nonce: bytes) -> bool:
        """
        Check if a nonce has been used before.
        
        This checks if the nonce exists in storage, indicating a potential
        replay attack if the nonce is found.
        
        Args:
            drone_id: Unique identifier for the drone
            nonce: The nonce to check (32 bytes)
            
        Returns:
            True if the nonce exists (replay detected), False if nonce is new
            
        Raises:
            ValueError: If nonce is not 32 bytes
            
        Requirements: 7.4
        """
        if not isinstance(nonce, bytes):
            raise ValueError("nonce must be bytes")
        
        if len(nonce) != NONCE_SIZE:
            raise ValueError(f"nonce must be exactly {NONCE_SIZE} bytes")
        
        with self._lock:
            # Load existing nonces
            nonces = self._load_nonces(drone_id)
            
            # Convert nonce to hex string
            nonce_hex = nonce.hex()
            
            # Check if nonce exists
            return nonce_hex in nonces
    
    def cleanup_expired(self, drone_id: str) -> int:
        """
        Remove all expired nonces for a specific drone.
        
        This should be called periodically to prevent unbounded storage growth.
        
        Args:
            drone_id: Unique identifier for the drone
            
        Returns:
            Number of expired nonces removed
            
        Requirements: 7.4
        """
        current_time = get_current_timestamp()
        
        with self._lock:
            # Load existing nonces
            nonces = self._load_nonces(drone_id)
            
            # Find expired nonces
            expired_nonces = [
                nonce_hex for nonce_hex, expires_at in nonces.items()
                if expires_at <= current_time
            ]
            
            # Remove expired nonces
            for nonce_hex in expired_nonces:
                del nonces[nonce_hex]
            
            # Save updated nonces
            if expired_nonces:
                self._save_nonces(drone_id, nonces)
            
            return len(expired_nonces)
    
    def count_nonces(self, drone_id: str) -> int:
        """
        Get the number of stored nonces for a drone.
        
        Args:
            drone_id: Unique identifier for the drone
            
        Returns:
            Number of nonces currently stored
        """
        with self._lock:
            nonces = self._load_nonces(drone_id)
            return len(nonces)
    
    def clear_all_nonces(self, drone_id: str) -> None:
        """
        Remove all nonces for a specific drone.
        
        This is primarily useful for testing or emergency reset.
        
        Args:
            drone_id: Unique identifier for the drone
        """
        with self._lock:
            nonce_file = self._get_nonce_file(drone_id)
            if nonce_file.exists():
                os.remove(nonce_file)
