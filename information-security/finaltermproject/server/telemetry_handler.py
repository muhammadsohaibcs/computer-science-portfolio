"""
Telemetry handler module for SDRCAS.
Receives, verifies, and processes telemetry data from drones.
Implements decryption and signature verification for secure telemetry.

Requirements: 14.2, 14.3
"""

import json
import base64
from typing import Dict, Any, Optional, List
from dataclasses import dataclass

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey

from core.authentication import verify_signature
from core.aead import decrypt_aead
from core.key_exchange import derive_session_key
from core.constants import SYMMETRIC_KEY_SIZE
from core.time_utils import get_current_timestamp, is_timestamp_fresh
from server.key_manager import KeyManager, get_key_manager
from server.audit import log_event


@dataclass
class TelemetryData:
    """
    Represents telemetry data from a drone.
    
    Attributes:
        drone_id: ID of the drone sending telemetry
        timestamp: Unix timestamp when telemetry was generated
        position: [latitude, longitude, altitude] coordinates
        battery: Battery level percentage (0-100)
        status: Current drone status (e.g., "EXECUTING", "IDLE", "ERROR")
        last_command: Last command executed
        errors: List of error messages
        additional_data: Any additional telemetry fields
    """
    drone_id: str
    timestamp: int
    position: List[float]
    battery: int
    status: str
    last_command: str
    errors: List[str]
    additional_data: Dict[str, Any]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert TelemetryData to dictionary."""
        return {
            "drone_id": self.drone_id,
            "timestamp": self.timestamp,
            "position": self.position,
            "battery": self.battery,
            "status": self.status,
            "last_command": self.last_command,
            "errors": self.errors,
            **self.additional_data
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'TelemetryData':
        """Create TelemetryData from dictionary."""
        # Extract known fields
        drone_id = data.get("drone_id", "")
        timestamp = data.get("timestamp", 0)
        position = data.get("position", [0.0, 0.0, 0.0])
        battery = data.get("battery", 0)
        status = data.get("status", "UNKNOWN")
        last_command = data.get("last_command", "")
        errors = data.get("errors", [])
        
        # Collect additional fields
        known_fields = {
            "drone_id", "timestamp", "position", "battery",
            "status", "last_command", "errors"
        }
        additional_data = {
            k: v for k, v in data.items()
            if k not in known_fields
        }
        
        return cls(
            drone_id=drone_id,
            timestamp=timestamp,
            position=position,
            battery=battery,
            status=status,
            last_command=last_command,
            errors=errors,
            additional_data=additional_data
        )
    
    def has_anomalies(self) -> bool:
        """
        Check if telemetry indicates anomalies.
        
        Returns:
            True if anomalies detected, False otherwise
        """
        # Check for errors
        if self.errors:
            return True
        
        # Check for low battery
        if self.battery < 20:
            return True
        
        # Check for error status
        if self.status in ["ERROR", "FAILSAFE", "CRITICAL"]:
            return True
        
        return False


@dataclass
class EncryptedTelemetry:
    """
    Represents encrypted telemetry data.
    
    Attributes:
        encrypted_data: Base64-encoded encrypted telemetry
        signature: Base64-encoded signature of the telemetry
        encryption_nonce: Base64-encoded nonce used for encryption
        encryption_seed: Base64-encoded random seed for key derivation
        drone_id: ID of the drone (not encrypted)
    """
    encrypted_data: str
    signature: str
    encryption_nonce: str
    encryption_seed: str
    drone_id: str
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "encrypted_data": self.encrypted_data,
            "signature": self.signature,
            "encryption_nonce": self.encryption_nonce,
            "encryption_seed": self.encryption_seed,
            "drone_id": self.drone_id
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'EncryptedTelemetry':
        """Create from dictionary."""
        return cls(
            encrypted_data=data["encrypted_data"],
            signature=data["signature"],
            encryption_nonce=data["encryption_nonce"],
            encryption_seed=data["encryption_seed"],
            drone_id=data["drone_id"]
        )
    
    def to_bytes(self) -> bytes:
        """Convert to JSON bytes."""
        return json.dumps(self.to_dict()).encode('utf-8')
    
    @classmethod
    def from_bytes(cls, data: bytes) -> 'EncryptedTelemetry':
        """Create from JSON bytes."""
        return cls.from_dict(json.loads(data.decode('utf-8')))


class TelemetryHandler:
    """
    Handles telemetry reception, verification, and processing.
    
    Provides secure telemetry handling with decryption, signature verification,
    and anomaly detection.
    """
    
    def __init__(
        self,
        key_manager: Optional[KeyManager] = None,
        audit_log_path: Optional[str] = None
    ):
        """
        Initialize the TelemetryHandler.
        
        Args:
            key_manager: KeyManager instance for cryptographic operations
            audit_log_path: Path to audit log file
        """
        self.key_manager = key_manager or get_key_manager()
        self.audit_log_path = audit_log_path
        
        # In-memory storage for recent telemetry
        # In production, this would be a time-series database
        self._telemetry_cache: Dict[str, List[TelemetryData]] = {}
        
        # Authorized operators who can view telemetry
        # In production, this would be loaded from a database
        self._authorized_viewers: Dict[str, List[str]] = {}
    
    def receive_telemetry(self, drone_id: str, encrypted_data: bytes) -> Dict[str, Any]:
        """
        Receive and decrypt telemetry from a drone.
        
        This function:
        1. Parses the encrypted telemetry structure
        2. Decrypts the telemetry data
        3. Verifies the signature
        4. Processes the telemetry
        
        Args:
            drone_id: ID of the drone sending telemetry
            encrypted_data: Encrypted telemetry bytes
            
        Returns:
            Dictionary containing the decrypted telemetry data
            
        Raises:
            ValueError: If decryption or verification fails
            
        Requirements: 14.2
        """
        try:
            # Parse encrypted telemetry structure
            encrypted_telemetry = EncryptedTelemetry.from_bytes(encrypted_data)
            
            # Verify drone_id matches
            if encrypted_telemetry.drone_id != drone_id:
                raise ValueError(
                    f"Drone ID mismatch: expected {drone_id}, "
                    f"got {encrypted_telemetry.drone_id}"
                )
            
            # Decode base64 fields
            ciphertext = base64.b64decode(encrypted_telemetry.encrypted_data)
            signature = base64.b64decode(encrypted_telemetry.signature)
            nonce = base64.b64decode(encrypted_telemetry.encryption_nonce)
            encryption_seed = base64.b64decode(encrypted_telemetry.encryption_seed)
            
            # Derive decryption key using the same context as encryption
            context = f"telemetry-encryption-{drone_id}".encode('utf-8')
            decryption_key = derive_session_key(encryption_seed, context, SYMMETRIC_KEY_SIZE)
            
            # Prepare associated data (must match encryption)
            associated_data = json.dumps({
                "signature": encrypted_telemetry.signature,
                "drone_id": drone_id
            }).encode('utf-8')
            
            # Decrypt the telemetry data
            telemetry_bytes = decrypt_aead(decryption_key, ciphertext, nonce, associated_data)
            
            # Parse telemetry JSON
            telemetry_dict = json.loads(telemetry_bytes.decode('utf-8'))
            
            # Verify the signature
            if not self.verify_telemetry(drone_id, telemetry_bytes, signature):
                raise ValueError(f"Telemetry signature verification failed for drone {drone_id}")
            
            # Process the telemetry
            telemetry_data = TelemetryData.from_dict(telemetry_dict)
            self.process_telemetry(drone_id, telemetry_data)
            
            return telemetry_dict
            
        except Exception as e:
            # Log the error
            log_event(
                event_type="TELEMETRY_RECEIVE_FAILED",
                actor=drone_id,
                target="CAS",
                details={"error": str(e)},
                log_path=self.audit_log_path
            )
            raise ValueError(f"Failed to receive telemetry from {drone_id}: {str(e)}")
    
    def verify_telemetry(self, drone_id: str, data: bytes, signature: bytes) -> bool:
        """
        Verify the authenticity of telemetry data using the drone's public key.
        
        Args:
            drone_id: ID of the drone
            data: Raw telemetry data bytes
            signature: Signature bytes to verify
            
        Returns:
            True if signature is valid, False otherwise
            
        Requirements: 14.2
        """
        # Get drone's public key
        drone_public_key = self.key_manager.get_drone_public_key(drone_id)
        if drone_public_key is None:
            return False
        
        # Verify the signature
        return verify_signature(drone_public_key, data, signature)
    
    def process_telemetry(self, drone_id: str, telemetry: TelemetryData) -> None:
        """
        Process verified telemetry data.
        
        This function:
        1. Validates telemetry timestamp
        2. Stores telemetry in cache
        3. Checks for anomalies
        4. Logs telemetry to audit log
        
        Args:
            drone_id: ID of the drone
            telemetry: Verified telemetry data
            
        Requirements: 14.3
        """
        # Validate timestamp freshness
        if not is_timestamp_fresh(telemetry.timestamp, tolerance=60):
            # Log warning but don't reject (drone might have clock skew)
            log_event(
                event_type="TELEMETRY_TIMESTAMP_WARNING",
                actor=drone_id,
                target="CAS",
                details={
                    "telemetry_timestamp": telemetry.timestamp,
                    "current_timestamp": get_current_timestamp(),
                    "warning": "Telemetry timestamp outside normal range"
                },
                log_path=self.audit_log_path
            )
        
        # Store telemetry in cache
        if drone_id not in self._telemetry_cache:
            self._telemetry_cache[drone_id] = []
        
        self._telemetry_cache[drone_id].append(telemetry)
        
        # Keep only recent telemetry (last 100 entries per drone)
        if len(self._telemetry_cache[drone_id]) > 100:
            self._telemetry_cache[drone_id] = self._telemetry_cache[drone_id][-100:]
        
        # Check for anomalies
        if telemetry.has_anomalies():
            self._handle_telemetry_anomaly(drone_id, telemetry)
        
        # Log telemetry receipt
        log_event(
            event_type="TELEMETRY_RECEIVED",
            actor=drone_id,
            target="CAS",
            details={
                "timestamp": telemetry.timestamp,
                "status": telemetry.status,
                "battery": telemetry.battery,
                "position": telemetry.position,
                "errors": telemetry.errors
            },
            log_path=self.audit_log_path
        )
    
    def get_telemetry(
        self,
        drone_id: str,
        operator_id: Optional[str] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get recent telemetry for a drone.
        
        Args:
            drone_id: ID of the drone
            operator_id: ID of the operator requesting telemetry (for access control)
            limit: Maximum number of telemetry entries to return
            
        Returns:
            List of telemetry dictionaries (most recent first)
            
        Raises:
            PermissionError: If operator is not authorized to view telemetry
            
        Requirements: 14.3
        """
        # Check authorization if operator_id provided
        if operator_id is not None:
            if not self._is_authorized_viewer(operator_id, drone_id):
                raise PermissionError(
                    f"Operator {operator_id} not authorized to view telemetry for {drone_id}"
                )
        
        # Get telemetry from cache
        if drone_id not in self._telemetry_cache:
            return []
        
        telemetry_list = self._telemetry_cache[drone_id]
        
        # Return most recent entries (up to limit)
        recent_telemetry = telemetry_list[-limit:]
        recent_telemetry.reverse()  # Most recent first
        
        return [t.to_dict() for t in recent_telemetry]
    
    def authorize_viewer(self, operator_id: str, drone_id: str) -> None:
        """
        Authorize an operator to view telemetry for a drone.
        
        Args:
            operator_id: ID of the operator
            drone_id: ID of the drone
        """
        if operator_id not in self._authorized_viewers:
            self._authorized_viewers[operator_id] = []
        
        if drone_id not in self._authorized_viewers[operator_id]:
            self._authorized_viewers[operator_id].append(drone_id)
    
    def _is_authorized_viewer(self, operator_id: str, drone_id: str) -> bool:
        """
        Check if an operator is authorized to view telemetry for a drone.
        
        Args:
            operator_id: ID of the operator
            drone_id: ID of the drone
            
        Returns:
            True if authorized, False otherwise
        """
        if operator_id not in self._authorized_viewers:
            return False
        
        return drone_id in self._authorized_viewers[operator_id]
    
    def _handle_telemetry_anomaly(self, drone_id: str, telemetry: TelemetryData) -> None:
        """
        Handle telemetry anomalies by alerting and logging.
        
        Args:
            drone_id: ID of the drone
            telemetry: Telemetry data with anomalies
            
        Requirements: 14.5 (from design document Property 43)
        """
        anomaly_details = {
            "drone_id": drone_id,
            "timestamp": telemetry.timestamp,
            "status": telemetry.status,
            "battery": telemetry.battery,
            "errors": telemetry.errors,
            "anomaly_reasons": []
        }
        
        # Identify specific anomalies
        if telemetry.errors:
            anomaly_details["anomaly_reasons"].append(f"Errors reported: {telemetry.errors}")
        
        if telemetry.battery < 20:
            anomaly_details["anomaly_reasons"].append(f"Low battery: {telemetry.battery}%")
        
        if telemetry.status in ["ERROR", "FAILSAFE", "CRITICAL"]:
            anomaly_details["anomaly_reasons"].append(f"Critical status: {telemetry.status}")
        
        # Log the anomaly
        log_event(
            event_type="TELEMETRY_ANOMALY_DETECTED",
            actor=drone_id,
            target="CAS",
            details=anomaly_details,
            log_path=self.audit_log_path
        )
        
        # In production, this would also:
        # - Send alerts to operators
        # - Trigger automated responses
        # - Update monitoring dashboards


# Convenience functions for module-level access

def receive_telemetry(drone_id: str, encrypted_data: bytes) -> Dict[str, Any]:
    """
    Receive and decrypt telemetry from a drone.
    
    Args:
        drone_id: ID of the drone
        encrypted_data: Encrypted telemetry bytes
        
    Returns:
        Dictionary containing the decrypted telemetry data
        
    Requirements: 14.2
    """
    handler = TelemetryHandler()
    return handler.receive_telemetry(drone_id, encrypted_data)


def verify_telemetry(drone_id: str, data: bytes, signature: bytes) -> bool:
    """
    Verify the authenticity of telemetry data.
    
    Args:
        drone_id: ID of the drone
        data: Raw telemetry data bytes
        signature: Signature bytes to verify
        
    Returns:
        True if signature is valid, False otherwise
        
    Requirements: 14.2
    """
    handler = TelemetryHandler()
    return handler.verify_telemetry(drone_id, data, signature)


def process_telemetry(drone_id: str, telemetry: Dict[str, Any]) -> None:
    """
    Process verified telemetry data.
    
    Args:
        drone_id: ID of the drone
        telemetry: Verified telemetry data dictionary
        
    Requirements: 14.3
    """
    handler = TelemetryHandler()
    telemetry_data = TelemetryData.from_dict(telemetry)
    handler.process_telemetry(drone_id, telemetry_data)
