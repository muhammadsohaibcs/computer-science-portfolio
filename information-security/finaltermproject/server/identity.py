"""
Identity module for SDRCAS.
Manages identity storage and retrieval for operators and drones.
Provides identity verification and role/capability management.

Requirements: 1.4, 4.1
"""

from dataclasses import dataclass
from typing import List, Optional
import json
import os

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
from core.authentication import deserialize_public_key, verify_signature


@dataclass
class Identity:
    """
    Represents an identity in the system (operator or drone).
    
    Attributes:
        id: Unique identifier (e.g., "DRONE_01", "OPERATOR_PILOT_01")
        public_key: Ed25519 public key for cryptographic operations
        roles: List of roles (for operators, e.g., ["pilot", "admin"])
        capabilities: List of capabilities (for drones, e.g., ["MOVE", "LAND"])
        allowed_commands: List of command types this identity can execute/request
        status: Current status ("active", "suspended", "revoked")
        entity_type: Type of entity ("drone" or "operator")
    """
    id: str
    public_key: Ed25519PublicKey
    roles: List[str]
    capabilities: List[str]
    allowed_commands: List[str]
    status: str = "active"
    entity_type: str = "unknown"
    
    def has_role(self, role: str) -> bool:
        """Check if identity has a specific role."""
        return role in self.roles
    
    def has_capability(self, capability: str) -> bool:
        """Check if identity has a specific capability."""
        return capability in self.capabilities
    
    def can_execute_command(self, command_type: str) -> bool:
        """Check if identity is allowed to execute/request a command type."""
        return command_type in self.allowed_commands
    
    def is_active(self) -> bool:
        """Check if identity is currently active."""
        return self.status == "active"


def load_identity(identity_id: str, base_path: str = "data/cas") -> Optional[Identity]:
    """
    Load an identity from storage.
    
    Searches for the identity in both drone and operator directories.
    
    Args:
        identity_id: The unique identifier of the identity
        base_path: Base path for identity storage
        
    Returns:
        Identity object if found, None otherwise
        
    Requirements: 1.4, 4.1
    """
    # Try loading as drone first
    drone_path = os.path.join(base_path, "drones", f"{identity_id}.json")
    if os.path.exists(drone_path):
        return _load_identity_from_file(drone_path, "drone")
    
    # Try loading as operator
    operator_path = os.path.join(base_path, "operators", f"{identity_id}.json")
    if os.path.exists(operator_path):
        return _load_identity_from_file(operator_path, "operator")
    
    return None


def _load_identity_from_file(filepath: str, entity_type: str) -> Identity:
    """
    Load identity from a JSON file.
    
    Args:
        filepath: Path to the identity JSON file
        entity_type: Type of entity ("drone" or "operator")
        
    Returns:
        Identity object
    """
    with open(filepath, 'r') as f:
        data = json.load(f)
    
    # Deserialize public key
    public_key_pem = data['public_key_pem'].encode('utf-8')
    public_key = deserialize_public_key(public_key_pem)
    
    # Extract identity ID based on entity type
    if entity_type == "drone":
        identity_id = data['drone_id']
        roles = []
        capabilities = data.get('capabilities', [])
    else:  # operator
        identity_id = data['operator_id']
        roles = data.get('roles', [])
        capabilities = []
    
    return Identity(
        id=identity_id,
        public_key=public_key,
        roles=roles,
        capabilities=capabilities,
        allowed_commands=data.get('allowed_commands', []),
        status=data.get('status', 'active'),
        entity_type=entity_type
    )


def verify_identity(identity_id: str, proof: bytes, message: bytes, base_path: str = "data/cas") -> bool:
    """
    Verify an identity by checking a cryptographic proof (signature).
    
    Args:
        identity_id: The unique identifier of the identity
        proof: Signature bytes to verify
        message: Original message that was signed
        base_path: Base path for identity storage
        
    Returns:
        True if identity exists and proof is valid, False otherwise
        
    Requirements: 1.4, 4.1
    """
    # Load the identity
    identity = load_identity(identity_id, base_path)
    if identity is None:
        return False
    
    # Check if identity is active
    if not identity.is_active():
        return False
    
    # Verify the signature
    return verify_signature(identity.public_key, message, proof)


def save_identity(identity: Identity, base_path: str = "data/cas") -> None:
    """
    Save an identity to storage.
    
    Args:
        identity: The identity to save
        base_path: Base path for identity storage
        
    Requirements: 1.4
    """
    from core.authentication import serialize_public_key
    
    # Determine the directory based on entity type
    if identity.entity_type == "drone":
        directory = os.path.join(base_path, "drones")
        id_key = "drone_id"
    else:  # operator
        directory = os.path.join(base_path, "operators")
        id_key = "operator_id"
    
    # Ensure directory exists
    os.makedirs(directory, exist_ok=True)
    
    # Prepare data for serialization
    data = {
        id_key: identity.id,
        'public_key_pem': serialize_public_key(identity.public_key).decode('utf-8'),
        'allowed_commands': identity.allowed_commands,
        'status': identity.status
    }
    
    # Add entity-specific fields
    if identity.entity_type == "drone":
        data['capabilities'] = identity.capabilities
    else:  # operator
        data['roles'] = identity.roles
    
    # Save to file
    filepath = os.path.join(directory, f"{identity.id}.json")
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)


def list_identities(entity_type: Optional[str] = None, base_path: str = "data/cas") -> List[Identity]:
    """
    List all identities of a given type.
    
    Args:
        entity_type: Type of entities to list ("drone", "operator", or None for all)
        base_path: Base path for identity storage
        
    Returns:
        List of Identity objects
        
    Requirements: 1.4
    """
    identities = []
    
    # Load drones if requested
    if entity_type is None or entity_type == "drone":
        drone_dir = os.path.join(base_path, "drones")
        if os.path.exists(drone_dir):
            for filename in os.listdir(drone_dir):
                if filename.endswith('.json'):
                    filepath = os.path.join(drone_dir, filename)
                    identities.append(_load_identity_from_file(filepath, "drone"))
    
    # Load operators if requested
    if entity_type is None or entity_type == "operator":
        operator_dir = os.path.join(base_path, "operators")
        if os.path.exists(operator_dir):
            for filename in os.listdir(operator_dir):
                if filename.endswith('.json'):
                    filepath = os.path.join(operator_dir, filename)
                    identities.append(_load_identity_from_file(filepath, "operator"))
    
    return identities


def update_identity_status(identity_id: str, new_status: str, base_path: str = "data/cas") -> bool:
    """
    Update the status of an identity.
    
    Args:
        identity_id: The unique identifier of the identity
        new_status: New status value ("active", "suspended", "revoked")
        base_path: Base path for identity storage
        
    Returns:
        True if update successful, False if identity not found
        
    Requirements: 1.4
    """
    identity = load_identity(identity_id, base_path)
    if identity is None:
        return False
    
    identity.status = new_status
    save_identity(identity, base_path)
    return True
