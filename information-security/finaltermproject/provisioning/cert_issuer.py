"""
Certificate issuer module for SDRCAS.
Implements certificate issuance and verification for provisioning.
Creates and validates certificates binding identities to public keys.

Requirements: 1.2
"""

from dataclasses import dataclass
from typing import Optional, List
import json

from cryptography.hazmat.primitives.asymmetric.ed25519 import (
    Ed25519PrivateKey,
    Ed25519PublicKey
)

from core.authentication import sign, verify_signature, serialize_public_key, deserialize_public_key
from core.time_utils import get_current_timestamp, is_expired
from core.hashing import hash_data


@dataclass
class Certificate:
    """
    Certificate binding an identity to a public key.
    
    Attributes:
        subject: The identity being certified (e.g., "DRONE_07", "OPERATOR_123")
        public_key_pem: PEM-encoded public key bytes
        issuer: The identity of the certificate issuer (e.g., "CAS")
        valid_from: Unix timestamp when certificate becomes valid
        valid_until: Unix timestamp when certificate expires
        attributes: Optional additional attributes (e.g., roles, capabilities)
        signature: Digital signature over the certificate data
    """
    subject: str
    public_key_pem: bytes
    issuer: str
    valid_from: int
    valid_until: int
    attributes: Optional[dict] = None
    signature: Optional[bytes] = None
    
    def to_dict(self) -> dict:
        """Convert certificate to dictionary for serialization."""
        return {
            'subject': self.subject,
            'public_key_pem': self.public_key_pem.decode('utf-8'),
            'issuer': self.issuer,
            'valid_from': self.valid_from,
            'valid_until': self.valid_until,
            'attributes': self.attributes or {},
            'signature': self.signature.hex() if self.signature else None
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Certificate':
        """Create certificate from dictionary."""
        return cls(
            subject=data['subject'],
            public_key_pem=data['public_key_pem'].encode('utf-8'),
            issuer=data['issuer'],
            valid_from=data['valid_from'],
            valid_until=data['valid_until'],
            attributes=data.get('attributes'),
            signature=bytes.fromhex(data['signature']) if data.get('signature') else None
        )
    
    def get_signable_data(self) -> bytes:
        """
        Get the canonical representation of certificate data for signing.
        Excludes the signature field itself.
        """
        data = {
            'subject': self.subject,
            'public_key_pem': self.public_key_pem.decode('utf-8'),
            'issuer': self.issuer,
            'valid_from': self.valid_from,
            'valid_until': self.valid_until,
            'attributes': self.attributes or {}
        }
        # Use sorted keys for deterministic serialization
        json_str = json.dumps(data, sort_keys=True)
        return json_str.encode('utf-8')


def issue_certificate(
    subject: str,
    public_key: Ed25519PublicKey,
    issuer_name: str,
    issuer_private_key: Ed25519PrivateKey,
    validity_duration: int = 31536000,  # 1 year default
    attributes: Optional[dict] = None
) -> Certificate:
    """
    Issue a certificate binding a subject identity to a public key.
    
    Args:
        subject: The identity being certified
        public_key: The public key to bind to the identity
        issuer_name: The name of the issuing authority
        issuer_private_key: The private key of the issuer for signing
        validity_duration: How long the certificate is valid (seconds)
        attributes: Optional additional attributes (roles, capabilities, etc.)
        
    Returns:
        Signed Certificate
        
    Requirements: 1.2
    """
    current_time = get_current_timestamp()
    
    # Serialize the public key to PEM format
    public_key_pem = serialize_public_key(public_key)
    
    # Create the certificate
    cert = Certificate(
        subject=subject,
        public_key_pem=public_key_pem,
        issuer=issuer_name,
        valid_from=current_time,
        valid_until=current_time + validity_duration,
        attributes=attributes
    )
    
    # Sign the certificate
    signable_data = cert.get_signable_data()
    signature = sign(issuer_private_key, signable_data)
    cert.signature = signature
    
    return cert


def verify_certificate(
    cert: Certificate,
    issuer_public_key: Ed25519PublicKey
) -> bool:
    """
    Verify a certificate's signature and validity.
    
    Args:
        cert: The certificate to verify
        issuer_public_key: The public key of the claimed issuer
        
    Returns:
        True if certificate is valid and signature verifies, False otherwise
        
    Requirements: 1.2
    """
    # Check if certificate has a signature
    if cert.signature is None:
        return False
    
    # Check if certificate has expired
    if is_expired(cert.valid_until):
        return False
    
    # Check if certificate is not yet valid
    current_time = get_current_timestamp()
    if current_time < cert.valid_from:
        return False
    
    # Verify the signature
    signable_data = cert.get_signable_data()
    return verify_signature(issuer_public_key, signable_data, cert.signature)


def get_certificate_public_key(cert: Certificate) -> Ed25519PublicKey:
    """
    Extract the public key from a certificate.
    
    Args:
        cert: The certificate containing the public key
        
    Returns:
        The Ed25519 public key
    """
    return deserialize_public_key(cert.public_key_pem)


def save_certificate(cert: Certificate, filepath: str) -> None:
    """
    Save a certificate to a JSON file.
    
    Args:
        cert: The certificate to save
        filepath: Path to save the certificate
    """
    with open(filepath, 'w') as f:
        json.dump(cert.to_dict(), f, indent=2)


def load_certificate(filepath: str) -> Certificate:
    """
    Load a certificate from a JSON file.
    
    Args:
        filepath: Path to the certificate file
        
    Returns:
        The loaded Certificate
    """
    with open(filepath, 'r') as f:
        data = json.load(f)
    return Certificate.from_dict(data)
