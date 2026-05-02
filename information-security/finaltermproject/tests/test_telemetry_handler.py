"""
Unit tests for server telemetry_handler module.
Tests telemetry reception, verification, and processing.

Requirements: 14.2, 14.3
"""

import pytest
import tempfile
import os
import json
import base64

from server.telemetry_handler import (
    TelemetryHandler,
    TelemetryData,
    EncryptedTelemetry,
    receive_telemetry,
    verify_telemetry,
    process_telemetry
)
from server.key_manager import KeyManager
from server.identity import Identity, save_identity
from core.authentication import generate_keypair, sign
from core.aead import encrypt_aead
from core.key_exchange import derive_session_key
from core.constants import SYMMETRIC_KEY_SIZE
from core.crypto_math import secure_random_bytes
from core.time_utils import get_current_timestamp


class TestTelemetryData:
    """Test cases for TelemetryData."""
    
    def test_telemetry_data_creation(self):
        """Test creating TelemetryData."""
        telemetry = TelemetryData(
            drone_id="DRONE_01",
            timestamp=get_current_timestamp(),
            position=[33.6844, 73.0479, 100],
            battery=85,
            status="EXECUTING",
            last_command="MOVE",
            errors=[],
            additional_data={"temperature": 25}
        )
        
        assert telemetry.drone_id == "DRONE_01"
        assert telemetry.battery == 85
        assert telemetry.status == "EXECUTING"
        assert telemetry.additional_data["temperature"] == 25
    
    def test_telemetry_to_dict(self):
        """Test converting TelemetryData to dictionary."""
        telemetry = TelemetryData(
            drone_id="DRONE_01",
            timestamp=1234567890,
            position=[33.6844, 73.0479, 100],
            battery=85,
            status="EXECUTING",
            last_command="MOVE",
            errors=[],
            additional_data={"temperature": 25}
        )
        
        data = telemetry.to_dict()
        
        assert data["drone_id"] == "DRONE_01"
        assert data["timestamp"] == 1234567890
        assert data["battery"] == 85
        assert data["temperature"] == 25
    
    def test_telemetry_from_dict(self):
        """Test creating TelemetryData from dictionary."""
        data = {
            "drone_id": "DRONE_01",
            "timestamp": 1234567890,
            "position": [33.6844, 73.0479, 100],
            "battery": 85,
            "status": "EXECUTING",
            "last_command": "MOVE",
            "errors": [],
            "temperature": 25
        }
        
        telemetry = TelemetryData.from_dict(data)
        
        assert telemetry.drone_id == "DRONE_01"
        assert telemetry.battery == 85
        assert telemetry.additional_data["temperature"] == 25
    
    def test_has_anomalies_with_errors(self):
        """Test anomaly detection with errors."""
        telemetry = TelemetryData(
            drone_id="DRONE_01",
            timestamp=get_current_timestamp(),
            position=[33.6844, 73.0479, 100],
            battery=85,
            status="EXECUTING",
            last_command="MOVE",
            errors=["Motor malfunction"],
            additional_data={}
        )
        
        assert telemetry.has_anomalies()
    
    def test_has_anomalies_with_low_battery(self):
        """Test anomaly detection with low battery."""
        telemetry = TelemetryData(
            drone_id="DRONE_01",
            timestamp=get_current_timestamp(),
            position=[33.6844, 73.0479, 100],
            battery=15,  # Low battery
            status="EXECUTING",
            last_command="MOVE",
            errors=[],
            additional_data={}
        )
        
        assert telemetry.has_anomalies()
    
    def test_has_anomalies_with_error_status(self):
        """Test anomaly detection with error status."""
        telemetry = TelemetryData(
            drone_id="DRONE_01",
            timestamp=get_current_timestamp(),
            position=[33.6844, 73.0479, 100],
            battery=85,
            status="ERROR",
            last_command="MOVE",
            errors=[],
            additional_data={}
        )
        
        assert telemetry.has_anomalies()
    
    def test_no_anomalies(self):
        """Test that normal telemetry has no anomalies."""
        telemetry = TelemetryData(
            drone_id="DRONE_01",
            timestamp=get_current_timestamp(),
            position=[33.6844, 73.0479, 100],
            battery=85,
            status="EXECUTING",
            last_command="MOVE",
            errors=[],
            additional_data={}
        )
        
        assert not telemetry.has_anomalies()


class TestEncryptedTelemetry:
    """Test cases for EncryptedTelemetry."""
    
    def test_encrypted_telemetry_creation(self):
        """Test creating EncryptedTelemetry."""
        encrypted = EncryptedTelemetry(
            encrypted_data="base64_data",
            signature="base64_sig",
            encryption_nonce="base64_nonce",
            encryption_seed="base64_seed",
            drone_id="DRONE_01"
        )
        
        assert encrypted.drone_id == "DRONE_01"
        assert encrypted.encrypted_data == "base64_data"
    
    def test_encrypted_telemetry_to_dict(self):
        """Test converting EncryptedTelemetry to dictionary."""
        encrypted = EncryptedTelemetry(
            encrypted_data="base64_data",
            signature="base64_sig",
            encryption_nonce="base64_nonce",
            encryption_seed="base64_seed",
            drone_id="DRONE_01"
        )
        
        data = encrypted.to_dict()
        
        assert data["drone_id"] == "DRONE_01"
        assert data["encrypted_data"] == "base64_data"
    
    def test_encrypted_telemetry_from_dict(self):
        """Test creating EncryptedTelemetry from dictionary."""
        data = {
            "encrypted_data": "base64_data",
            "signature": "base64_sig",
            "encryption_nonce": "base64_nonce",
            "encryption_seed": "base64_seed",
            "drone_id": "DRONE_01"
        }
        
        encrypted = EncryptedTelemetry.from_dict(data)
        
        assert encrypted.drone_id == "DRONE_01"
        assert encrypted.encrypted_data == "base64_data"
    
    def test_encrypted_telemetry_serialization(self):
        """Test serializing and deserializing EncryptedTelemetry."""
        encrypted = EncryptedTelemetry(
            encrypted_data="base64_data",
            signature="base64_sig",
            encryption_nonce="base64_nonce",
            encryption_seed="base64_seed",
            drone_id="DRONE_01"
        )
        
        # Serialize to bytes
        data_bytes = encrypted.to_bytes()
        
        # Deserialize from bytes
        encrypted2 = EncryptedTelemetry.from_bytes(data_bytes)
        
        assert encrypted2.drone_id == encrypted.drone_id
        assert encrypted2.encrypted_data == encrypted.encrypted_data


class TestTelemetryHandler:
    """Test cases for TelemetryHandler."""
    
    def setup_method(self):
        """Set up test fixtures."""
        # Create temporary directories
        self.test_dir = tempfile.mkdtemp()
        self.cas_key_path = os.path.join(self.test_dir, "cas")
        self.identity_path = os.path.join(self.test_dir, "cas")
        self.audit_log_path = os.path.join(self.test_dir, "audit.jsonl")
        
        os.makedirs(self.cas_key_path, exist_ok=True)
        os.makedirs(os.path.join(self.identity_path, "drones"), exist_ok=True)
        
        # Create key manager
        self.key_manager = KeyManager(self.cas_key_path, self.identity_path)
        
        # Create test drone identity
        self.drone_private_key, self.drone_public_key = generate_keypair()
        
        self.drone = Identity(
            id="DRONE_01",
            public_key=self.drone_public_key,
            roles=[],
            capabilities=["navigation", "flight"],
            allowed_commands=["MOVE", "LAND", "STATUS"],
            status="active",
            entity_type="drone"
        )
        
        save_identity(self.drone, self.identity_path)
        
        # Create telemetry handler
        self.handler = TelemetryHandler(
            key_manager=self.key_manager,
            audit_log_path=self.audit_log_path
        )
    
    def teardown_method(self):
        """Clean up test fixtures."""
        import shutil
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)
    
    def _create_encrypted_telemetry(self, telemetry_data: dict, drone_id: str) -> bytes:
        """Helper to create encrypted telemetry."""
        # Serialize telemetry
        telemetry_bytes = json.dumps(telemetry_data).encode('utf-8')
        
        # Sign telemetry
        signature = sign(self.drone_private_key, telemetry_bytes)
        
        # Generate encryption seed
        encryption_seed = secure_random_bytes(32)
        
        # Derive encryption key
        context = f"telemetry-encryption-{drone_id}".encode('utf-8')
        encryption_key = derive_session_key(encryption_seed, context, SYMMETRIC_KEY_SIZE)
        
        # Prepare associated data
        signature_b64 = base64.b64encode(signature).decode('utf-8')
        associated_data = json.dumps({
            "signature": signature_b64,
            "drone_id": drone_id
        }).encode('utf-8')
        
        # Encrypt telemetry
        ciphertext, nonce = encrypt_aead(encryption_key, telemetry_bytes, associated_data)
        
        # Create encrypted telemetry structure
        encrypted = EncryptedTelemetry(
            encrypted_data=base64.b64encode(ciphertext).decode('utf-8'),
            signature=signature_b64,
            encryption_nonce=base64.b64encode(nonce).decode('utf-8'),
            encryption_seed=base64.b64encode(encryption_seed).decode('utf-8'),
            drone_id=drone_id
        )
        
        return encrypted.to_bytes()
    
    def test_receive_valid_telemetry(self):
        """Test receiving valid encrypted telemetry."""
        telemetry_data = {
            "drone_id": "DRONE_01",
            "timestamp": get_current_timestamp(),
            "position": [33.6844, 73.0479, 100],
            "battery": 85,
            "status": "EXECUTING",
            "last_command": "MOVE",
            "errors": []
        }
        
        encrypted_data = self._create_encrypted_telemetry(telemetry_data, "DRONE_01")
        
        result = self.handler.receive_telemetry("DRONE_01", encrypted_data)
        
        assert result["drone_id"] == "DRONE_01"
        assert result["battery"] == 85
        assert result["status"] == "EXECUTING"
    
    def test_receive_telemetry_drone_id_mismatch(self):
        """Test that telemetry with mismatched drone ID is rejected."""
        telemetry_data = {
            "drone_id": "DRONE_01",
            "timestamp": get_current_timestamp(),
            "position": [33.6844, 73.0479, 100],
            "battery": 85,
            "status": "EXECUTING",
            "last_command": "MOVE",
            "errors": []
        }
        
        encrypted_data = self._create_encrypted_telemetry(telemetry_data, "DRONE_01")
        
        with pytest.raises(ValueError) as exc_info:
            self.handler.receive_telemetry("DRONE_02", encrypted_data)
        
        assert "mismatch" in str(exc_info.value).lower()
    
    def test_verify_telemetry_valid_signature(self):
        """Test verifying telemetry with valid signature."""
        telemetry_data = {
            "drone_id": "DRONE_01",
            "timestamp": get_current_timestamp(),
            "battery": 85
        }
        
        telemetry_bytes = json.dumps(telemetry_data).encode('utf-8')
        signature = sign(self.drone_private_key, telemetry_bytes)
        
        result = self.handler.verify_telemetry("DRONE_01", telemetry_bytes, signature)
        
        assert result
    
    def test_verify_telemetry_invalid_signature(self):
        """Test verifying telemetry with invalid signature."""
        telemetry_data = {
            "drone_id": "DRONE_01",
            "timestamp": get_current_timestamp(),
            "battery": 85
        }
        
        telemetry_bytes = json.dumps(telemetry_data).encode('utf-8')
        invalid_signature = b"invalid_signature_bytes" * 3  # 64 bytes
        
        result = self.handler.verify_telemetry("DRONE_01", telemetry_bytes, invalid_signature)
        
        assert not result
    
    def test_process_telemetry_stores_in_cache(self):
        """Test that processed telemetry is stored in cache."""
        telemetry = TelemetryData(
            drone_id="DRONE_01",
            timestamp=get_current_timestamp(),
            position=[33.6844, 73.0479, 100],
            battery=85,
            status="EXECUTING",
            last_command="MOVE",
            errors=[],
            additional_data={}
        )
        
        self.handler.process_telemetry("DRONE_01", telemetry)
        
        # Get telemetry from cache
        cached = self.handler.get_telemetry("DRONE_01", limit=10)
        
        assert len(cached) == 1
        assert cached[0]["drone_id"] == "DRONE_01"
        assert cached[0]["battery"] == 85
    
    def test_process_telemetry_with_anomaly(self):
        """Test that telemetry with anomalies is logged."""
        telemetry = TelemetryData(
            drone_id="DRONE_01",
            timestamp=get_current_timestamp(),
            position=[33.6844, 73.0479, 100],
            battery=15,  # Low battery - anomaly
            status="EXECUTING",
            last_command="MOVE",
            errors=[],
            additional_data={}
        )
        
        self.handler.process_telemetry("DRONE_01", telemetry)
        
        # Verify audit log was created
        assert os.path.exists(self.audit_log_path)
        
        # Check audit log contains anomaly event
        with open(self.audit_log_path, 'r') as f:
            log_content = f.read()
            assert "TELEMETRY_ANOMALY_DETECTED" in log_content
    
    def test_get_telemetry_with_limit(self):
        """Test getting telemetry with limit."""
        # Add multiple telemetry entries
        for i in range(20):
            telemetry = TelemetryData(
                drone_id="DRONE_01",
                timestamp=get_current_timestamp() + i,
                position=[33.6844, 73.0479, 100],
                battery=85 - i,
                status="EXECUTING",
                last_command="MOVE",
                errors=[],
                additional_data={}
            )
            self.handler.process_telemetry("DRONE_01", telemetry)
        
        # Get limited telemetry
        cached = self.handler.get_telemetry("DRONE_01", limit=5)
        
        assert len(cached) == 5
        # Should be most recent first
        assert cached[0]["battery"] == 85 - 19
    
    def test_get_telemetry_authorization(self):
        """Test telemetry access control."""
        telemetry = TelemetryData(
            drone_id="DRONE_01",
            timestamp=get_current_timestamp(),
            position=[33.6844, 73.0479, 100],
            battery=85,
            status="EXECUTING",
            last_command="MOVE",
            errors=[],
            additional_data={}
        )
        
        self.handler.process_telemetry("DRONE_01", telemetry)
        
        # Unauthorized operator should be rejected
        with pytest.raises(PermissionError):
            self.handler.get_telemetry("DRONE_01", operator_id="OPERATOR_01")
        
        # Authorize operator
        self.handler.authorize_viewer("OPERATOR_01", "DRONE_01")
        
        # Now should work
        cached = self.handler.get_telemetry("DRONE_01", operator_id="OPERATOR_01")
        assert len(cached) == 1


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
