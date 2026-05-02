"""
Operator enrollment module for SDRCAS.
Implements operator provisioning with role assignment and certificate issuance.
Creates operator credentials with role-based attributes for authorization.

Requirements: 1.3
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


# Standard operator roles
ROLE_ADMIN = "admin"
ROLE_PILOT = "pilot"
ROLE_OBSERVER = "observer"
ROLE_EMERGENCY = "emergency_operator"

# Role-based command permissions
ROLE_PERMISSIONS = {
    ROLE_ADMIN: ["MOVE", "LAND", "STATUS", "EMERGENCY_STOP", "CONFIGURE"],
    ROLE_PILOT: ["MOVE", "LAND", "STATUS", "EMERGENCY_STOP"],
    ROLE_OBSERVER: ["STATUS"],
    ROLE_EMERGENCY: ["EMERGENCY_STOP", "LAND", "STATUS"]
}


def enroll_operator(
    operator_id: str,
    roles: List[str],
    issuer_name: str,
    issuer_private_key: Ed25519PrivateKey,
    validity_duration: int = 31536000  # 1 year default
) -> Tuple[Ed25519PrivateKey, Ed25519PublicKey, Certificate]:
    """
    Enroll an operator by generating keys and issuing a certificate with roles.
    
    This function:
    1. Generates a unique Ed25519 keypair for the operator
    2. Issues a certificate binding the operator ID to their public key
    3. Includes role-based attributes in the certificate
    
    Args:
        operator_id: Unique identifier for the operator (e.g., "OPERATOR_123")
        roles: List of roles assigned to the operator (e.g., ["pilot", "admin"])
        issuer_name: Name of the certificate issuer (typically "CAS")
        issuer_private_key: Private key of the issuer for signing certificates
        validity_duration: Certificate validity period in seconds
        
    Returns:
        Tuple of (private_key, public_key, certificate)
        
    Requirements: 1.3
    """
    # Generate unique operator keypair
    private_key, public_key = generate_keypair()
    
    # Issue certificate with role attributes
    certificate = issue_operator_certificate(
        operator_id=operator_id,
        public_key=public_key,
        roles=roles,
        issuer_name=issuer_name,
        issuer_private_key=issuer_private_key,
        validity_duration=validity_duration
    )
    
    return private_key, public_key, certificate


def issue_operator_certificate(
    operator_id: str,
    public_key: Ed25519PublicKey,
    roles: List[str],
    issuer_name: str,
    issuer_private_key: Ed25519PrivateKey,
    validity_duration: int = 31536000
) -> Certificate:
    """
    Issue a certificate for an operator with role-based attributes.
    
    Args:
        operator_id: Unique identifier for the operator
        public_key: The operator's public key
        roles: List of roles assigned to the operator
        issuer_name: Name of the certificate issuer
        issuer_private_key: Private key of the issuer for signing
        validity_duration: Certificate validity period in seconds
        
    Returns:
        Signed Certificate with role attributes
        
    Requirements: 1.3
    """
    # Calculate allowed commands based on roles
    allowed_commands = set()
    for role in roles:
        if role in ROLE_PERMISSIONS:
            allowed_commands.update(ROLE_PERMISSIONS[role])
    
    # Prepare certificate attributes with roles
    attributes = {
        'entity_type': 'operator',
        'roles': roles,
        'allowed_commands': sorted(list(allowed_commands))
    }
    
    # Issue certificate
    certificate = issue_certificate(
        subject=operator_id,
        public_key=public_key,
        issuer_name=issuer_name,
        issuer_private_key=issuer_private_key,
        validity_duration=validity_duration,
        attributes=attributes
    )
    
    return certificate


def register_operator_with_cas(
    operator_id: str,
    public_key: Ed25519PublicKey,
    roles: List[str],
    storage_path: str = "data/cas/operators"
) -> None:
    """
    Register an operator with the Command Authorization Server.
    
    Stores the operator's public key and role information in the CAS
    database for authentication and authorization decisions.
    
    Args:
        operator_id: Unique identifier for the operator
        public_key: The operator's public key
        roles: List of roles assigned to the operator
        storage_path: Directory path for storing operator registrations
        
    Requirements: 1.3
    """
    # Create storage directory if it doesn't exist
    Path(storage_path).mkdir(parents=True, exist_ok=True)
    
    # Serialize public key
    public_key_pem = serialize_public_key(public_key)
    
    # Calculate allowed commands based on roles
    allowed_commands = set()
    for role in roles:
        if role in ROLE_PERMISSIONS:
            allowed_commands.update(ROLE_PERMISSIONS[role])
    
    # Prepare operator registration data
    operator_data = {
        'operator_id': operator_id,
        'public_key_pem': public_key_pem.decode('utf-8'),
        'roles': roles,
        'allowed_commands': sorted(list(allowed_commands)),
        'status': 'active'
    }
    
    # Save to file
    filepath = os.path.join(storage_path, f"{operator_id}.json")
    with open(filepath, 'w') as f:
        json.dump(operator_data, f, indent=2)


def save_operator_credentials(
    operator_id: str,
    private_key: Ed25519PrivateKey,
    certificate: Certificate,
    storage_path: str = "data/operators",
    password: Optional[bytes] = None
) -> None:
    """
    Save operator credentials (private key and certificate) to secure storage.
    
    Args:
        operator_id: Unique identifier for the operator
        private_key: The operator's private key
        certificate: The operator's certificate
        storage_path: Directory path for storing credentials
        password: Optional password for encrypting the private key
    """
    # Create storage directory if it doesn't exist
    operator_dir = Path(storage_path) / operator_id
    operator_dir.mkdir(parents=True, exist_ok=True)
    
    # Save private key (encrypted if password provided)
    private_key_pem = serialize_private_key(private_key, password)
    with open(operator_dir / "private_key.pem", 'wb') as f:
        f.write(private_key_pem)
    
    # Save certificate
    cert_path = operator_dir / "certificate.json"
    with open(cert_path, 'w') as f:
        json.dump(certificate.to_dict(), f, indent=2)


def get_operator_info(
    operator_id: str,
    storage_path: str = "data/cas/operators"
) -> Optional[dict]:
    """
    Retrieve operator information from CAS storage.
    
    Args:
        operator_id: Unique identifier for the operator
        storage_path: Directory path where operator registrations are stored
        
    Returns:
        Dictionary containing operator information, or None if not found
    """
    filepath = os.path.join(storage_path, f"{operator_id}.json")
    
    if not os.path.exists(filepath):
        return None
    
    with open(filepath, 'r') as f:
        return json.load(f)


def list_registered_operators(storage_path: str = "data/cas/operators") -> List[str]:
    """
    List all registered operator IDs.
    
    Args:
        storage_path: Directory path where operator registrations are stored
        
    Returns:
        List of operator IDs
    """
    if not os.path.exists(storage_path):
        return []
    
    operator_ids = []
    for filename in os.listdir(storage_path):
        if filename.endswith('.json'):
            operator_ids.append(filename[:-5])  # Remove .json extension
    
    return sorted(operator_ids)


def validate_roles(roles: List[str]) -> bool:
    """
    Validate that all provided roles are recognized.
    
    Args:
        roles: List of role names to validate
        
    Returns:
        True if all roles are valid, False otherwise
    """
    valid_roles = set(ROLE_PERMISSIONS.keys())
    return all(role in valid_roles for role in roles)
