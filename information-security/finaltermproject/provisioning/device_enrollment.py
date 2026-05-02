"""
Device enrollment module for SDRCAS.
Implements drone provisioning with key generation and certificate issuance.
Registers drones with the Command Authorization Server.

Requirements: 1.1, 1.4
"""

from typing import Tuple, List, Optional
import json
import os
from pathlib import Path

from cryptography.hazmat.primitives.asymmetric.ed25519 import (
    Ed25519PrivateKey,
    Ed25519PublicKey
)

from core.authentication import generate_keypair, serialize_private_key, serialize_public_key
from provisioning.cert_issuer import Certificate, issue_certificate


def enroll_drone(
    drone_id: str,
    issuer_name: str,
    issuer_private_key: Ed25519PrivateKey,
    capabilities: Optional[List[str]] = None,
    validity_duration: int = 31536000  # 1 year default
) -> Tuple[Ed25519PrivateKey, Ed25519PublicKey, Certificate]:
    """
    Enroll a drone by generating keys and issuing a certificate.
    
    This function:
    1. Generates a unique Ed25519 keypair for the drone
    2. Issues a certificate binding the drone ID to its public key
    3. Includes drone capabilities in the certificate attributes
    
    Args:
        drone_id: Unique identifier for the drone (e.g., "DRONE_07")
        issuer_name: Name of the certificate issuer (typically "CAS")
        issuer_private_key: Private key of the issuer for signing certificates
        capabilities: List of drone capabilities (e.g., ["MOVE", "LAND", "STATUS"])
        validity_duration: Certificate validity period in seconds
        
    Returns:
        Tuple of (private_key, public_key, certificate)
        
    Requirements: 1.1, 1.4
    """
    # Generate unique device private key
    private_key, public_key = generate_keypair()
    
    # Prepare certificate attributes with capabilities
    attributes = {
        'device_type': 'drone',
        'capabilities': capabilities or ["MOVE", "LAND", "STATUS", "EMERGENCY_STOP"]
    }
    
    # Issue certificate binding drone identity to public key
    certificate = issue_certificate(
        subject=drone_id,
        public_key=public_key,
        issuer_name=issuer_name,
        issuer_private_key=issuer_private_key,
        validity_duration=validity_duration,
        attributes=attributes
    )
    
    return private_key, public_key, certificate


def register_drone_with_cas(
    drone_id: str,
    public_key: Ed25519PublicKey,
    capabilities: List[str],
    allowed_commands: Optional[List[str]] = None,
    storage_path: str = "data/cas/drones"
) -> None:
    """
    Register a drone with the Command Authorization Server.
    
    Stores the drone's public key, capabilities, and allowed command types
    in the CAS database for later authorization decisions.
    
    Args:
        drone_id: Unique identifier for the drone
        public_key: The drone's public key
        capabilities: List of drone capabilities
        allowed_commands: List of allowed command types (defaults to capabilities)
        storage_path: Directory path for storing drone registrations
        
    Requirements: 1.4
    """
    # Create storage directory if it doesn't exist
    Path(storage_path).mkdir(parents=True, exist_ok=True)
    
    # Serialize public key
    public_key_pem = serialize_public_key(public_key)
    
    # Prepare drone registration data
    drone_data = {
        'drone_id': drone_id,
        'public_key_pem': public_key_pem.decode('utf-8'),
        'capabilities': capabilities,
        'allowed_commands': allowed_commands or capabilities,
        'status': 'active'
    }
    
    # Save to file
    filepath = os.path.join(storage_path, f"{drone_id}.json")
    with open(filepath, 'w') as f:
        json.dump(drone_data, f, indent=2)


def save_drone_credentials(
    drone_id: str,
    private_key: Ed25519PrivateKey,
    certificate: Certificate,
    storage_path: str = "data/drones",
    password: Optional[bytes] = None
) -> None:
    """
    Save drone credentials (private key and certificate) to secure storage.
    
    Args:
        drone_id: Unique identifier for the drone
        private_key: The drone's private key
        certificate: The drone's certificate
        storage_path: Directory path for storing credentials
        password: Optional password for encrypting the private key
    """
    # Create storage directory if it doesn't exist
    drone_dir = Path(storage_path) / drone_id
    drone_dir.mkdir(parents=True, exist_ok=True)
    
    # Save private key (encrypted if password provided)
    private_key_pem = serialize_private_key(private_key, password)
    with open(drone_dir / "private_key.pem", 'wb') as f:
        f.write(private_key_pem)
    
    # Save certificate
    cert_path = drone_dir / "certificate.json"
    with open(cert_path, 'w') as f:
        json.dump(certificate.to_dict(), f, indent=2)


def get_drone_info(
    drone_id: str,
    storage_path: str = "data/cas/drones"
) -> Optional[dict]:
    """
    Retrieve drone information from CAS storage.
    
    Args:
        drone_id: Unique identifier for the drone
        storage_path: Directory path where drone registrations are stored
        
    Returns:
        Dictionary containing drone information, or None if not found
    """
    filepath = os.path.join(storage_path, f"{drone_id}.json")
    
    if not os.path.exists(filepath):
        return None
    
    with open(filepath, 'r') as f:
        return json.load(f)


def list_registered_drones(storage_path: str = "data/cas/drones") -> List[str]:
    """
    List all registered drone IDs.
    
    Args:
        storage_path: Directory path where drone registrations are stored
        
    Returns:
        List of drone IDs
    """
    if not os.path.exists(storage_path):
        return []
    
    drone_ids = []
    for filename in os.listdir(storage_path):
        if filename.endswith('.json'):
            drone_ids.append(filename[:-5])  # Remove .json extension
    
    return sorted(drone_ids)
