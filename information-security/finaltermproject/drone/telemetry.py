"""
Telemetry collection module for SDRCAS drone agent.
Collects telemetry data, signs it, and encrypts it for secure transmission to CAS.

Requirements: 8.4, 8.5, 14.1
"""

import json
import base64
from typing import Dict, Any, List, Optional
from dataclasses import dataclass

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey, Ed25519PublicKey

from core.authentication import sign
from core.aead import encrypt_aead
from core.key_exchange import derive_session_key
from core.crypto_math import secure_random_bytes
from core.constants import SYMMETRIC_KEY_SIZE
from core.time_utils import get_current_timestamp


@dataclass
class TelemetryCollector:
    """
    Collects and secures telemetry data from a drone.
    
    Attributes:
        drone_id: Unique identifier for the drone
        private_key: Drone's Ed25519 private key for signing
        cas_public_key: CAS's Ed25519 public key (for future use)
    """
    drone_id: str
    private_key: Ed25519PrivateKey
    cas_public_key: Optional[Ed25519PublicKey] = None
    
    def collect(
        self,
        position: List[float],
        battery: int,
        status: str,
        last_command: str = "",
        errors: Optional[List[str]] = None,
        **additional_data
    ) -> Dict[str, Any]:
        """
        Collect telemetry data from the drone.
        
        Generates a telemetry dictionary with current drone state including
        position, battery level, status, and any errors.
        
        Args:
            position: [latitude, longitude, altitude] coordinates
            battery: Battery level percentage (0-100)
            status: Current drone status (e.g., "EXECUTING", "IDLE", "ERROR")
            last_command: Last command executed (default: "")
            errors: List of error messages (default: empty list)
            **additional_data: Any additional telemetry fields (e.g., temperature, speed)
            
        Returns:
            Dictionary containing telemetry data
            
        Requirements: 8.4, 14.1
        """
        if errors is None:
            errors = []
        
        # Validate inputs
        if not isinstance(position, list) or len(position) != 3:
            raise ValueError("position must be a list of 3 floats [lat, lon, alt]")
        
        if not isinstance(battery, int) or battery < 0 or battery > 100:
            raise ValueError("battery must be an integer between 0 and 100")
        
        if not isinstance(status, str) or not status:
            raise ValueError("status must be a non-empty string")
        
        # Create telemetry data structure
        telemetry = {
            "drone_id": self.drone_id,
            "timestamp": get_current_timestamp(),
            "position": position,
            "battery": battery,
            "status": status,
            "last_command": last_command,
            "errors": errors,
            **additional_data
        }
        
        return telemetry
    
    def sign_telemetry(self, telemetry: Dict[str, Any]) -> bytes:
        """
        Sign telemetry data using the drone's private key.
        
        Creates a digital signature over the JSON-serialized telemetry data
        to ensure authenticity and integrity.
        
        Args:
            telemetry: Telemetry data dictionary to sign
            
        Returns:
            Signature bytes
            
        Requirements: 8.5, 14.1
        """
        # Serialize telemetry to JSON bytes (deterministic ordering)
        telemetry_bytes = json.dumps(telemetry, sort_keys=True).encode('utf-8')
        
        # Sign the telemetry data
        signature = sign(self.private_key, telemetry_bytes)
        
        return signature
    
    def encrypt_telemetry(
        self,
        telemetry: Dict[str, Any],
        signature: bytes
    ) -> bytes:
        """
        Encrypt telemetry data for secure transmission to CAS.
        
        Encrypts the telemetry using AEAD (AES-256-GCM) with a derived key.
        The encryption includes the signature as associated data for additional
        integrity protection.
        
        Args:
            telemetry: Telemetry data dictionary to encrypt
            signature: Signature of the telemetry data
            
        Returns:
            Encrypted telemetry package as JSON bytes
            
        Requirements: 8.5, 14.1
        """
        # Serialize telemetry to JSON bytes
        telemetry_bytes = json.dumps(telemetry, sort_keys=True).encode('utf-8')
        
        # Generate a random seed for key derivation
        # This allows the CAS to derive the same key using the seed
        encryption_seed = secure_random_bytes(SYMMETRIC_KEY_SIZE)
        
        # Derive encryption key using the seed and a context
        context = f"telemetry-encryption-{self.drone_id}".encode('utf-8')
        encryption_key = derive_session_key(encryption_seed, context, SYMMETRIC_KEY_SIZE)
        
        # Prepare associated data (signature and drone_id)
        # This data is authenticated but not encrypted
        signature_b64 = base64.b64encode(signature).decode('utf-8')
        associated_data = json.dumps({
            "signature": signature_b64,
            "drone_id": self.drone_id
        }).encode('utf-8')
        
        # Encrypt the telemetry data
        ciphertext, nonce = encrypt_aead(encryption_key, telemetry_bytes, associated_data)
        
        # Create encrypted telemetry package
        encrypted_package = {
            "encrypted_data": base64.b64encode(ciphertext).decode('utf-8'),
            "signature": signature_b64,
            "encryption_nonce": base64.b64encode(nonce).decode('utf-8'),
            "encryption_seed": base64.b64encode(encryption_seed).decode('utf-8'),
            "drone_id": self.drone_id
        }
        
        # Serialize to JSON bytes
        return json.dumps(encrypted_package).encode('utf-8')
    
    def collect_and_secure(
        self,
        position: List[float],
        battery: int,
        status: str,
        last_command: str = "",
        errors: Optional[List[str]] = None,
        **additional_data
    ) -> bytes:
        """
        Convenience method to collect, sign, and encrypt telemetry in one call.
        
        This is the primary method for generating secure telemetry ready for
        transmission to the CAS.
        
        Args:
            position: [latitude, longitude, altitude] coordinates
            battery: Battery level percentage (0-100)
            status: Current drone status
            last_command: Last command executed (default: "")
            errors: List of error messages (default: empty list)
            **additional_data: Any additional telemetry fields
            
        Returns:
            Encrypted and signed telemetry package as JSON bytes
            
        Requirements: 8.4, 8.5, 14.1
        """
        # Collect telemetry data
        telemetry = self.collect(
            position=position,
            battery=battery,
            status=status,
            last_command=last_command,
            errors=errors,
            **additional_data
        )
        
        # Sign the telemetry
        signature = self.sign_telemetry(telemetry)
        
        # Encrypt the telemetry
        encrypted_telemetry = self.encrypt_telemetry(telemetry, signature)
        
        return encrypted_telemetry
