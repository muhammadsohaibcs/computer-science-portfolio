"""
Unit tests for drone telemetry module.
Tests telemetry collection, signing, and encryption.

Requirements: 8.4, 8.5, 14.1
"""

import pytest
import json
import base64

from drone.telemetry import TelemetryCollector
from core.authentication import generate_keypair, verify_signature
from core.aead import decrypt_aead
from core.key_exchange import derive_session_key
from core.constants import SYMMETRIC_KEY_SIZE
from core.time_utils import get_current_timestamp


class TestTelemetryCollector:
    """Test cases for TelemetryCollector."""
    
    @pytest.fixture
    def collector(self):
        """Create a TelemetryCollector for testing."""
        private_key, public_key = generate_keypair()
        cas_private_key, cas_public_key = generate_keypair()
        
        return TelemetryCollector(
            drone_id="DRONE_TEST_01",
            private_key=private_key,
            cas_public_key=cas_public_key
        ), public_key
    
    def test_collect_basic_telemetry(self, collector):
        """Test collecting basic telemetry data."""
        telemetry_collector, _ = collector
        
        telemetry = telemetry_collector.collect(
            position=[33.6844, 73.0479, 100.0],
            battery=85,
            status="EXECUTING",
            last_command="MOVE"
        )
        
        assert telemetry["drone_id"] == "DRONE_TEST_01"
        assert telemetry["position"] == [33.6844, 73.0479, 100.0]
        assert telemetry["battery"] == 85
        assert telemetry["status"] == "EXECUTING"
        assert telemetry["last_command"] == "MOVE"
        assert telemetry["errors"] == []
        assert "timestamp" in telemetry
    
    def test_collect_with_errors(self, collector):
        """Test collecting telemetry with errors."""
        telemetry_collector, _ = collector
        
        errors = ["GPS signal lost", "Low battery warning"]
        telemetry = telemetry_collector.collect(
            position=[33.6844, 73.0479, 100.0],
            battery=15,
            status="ERROR",
            errors=errors
        )
        
        assert telemetry["errors"] == errors
        assert telemetry["battery"] == 15
        assert telemetry["status"] == "ERROR"
    
    def test_collect_with_additional_data(self, collector):
        """Test collecting telemetry with additional fields."""
        telemetry_collector, _ = collector
        
        telemetry = telemetry_collector.collect(
            position=[33.6844, 73.0479, 100.0],
            battery=85,
            status="EXECUTING",
            temperature=25.5,
            speed=15.0,
            heading=90
        )
        
        assert telemetry["temperature"] == 25.5
        assert telemetry["speed"] == 15.0
        assert telemetry["heading"] == 90
    
    def test_collect_invalid_position(self, collector):
        """Test that invalid position raises ValueError."""
        telemetry_collector, _ = collector
        
        with pytest.raises(ValueError, match="position must be a list of 3 floats"):
            telemetry_collector.collect(
                position=[33.6844, 73.0479],  # Only 2 elements
                battery=85,
                status="EXECUTING"
            )
    
    def test_collect_invalid_battery(self, collector):
        """Test that invalid battery raises ValueError."""
        telemetry_collector, _ = collector
        
        with pytest.raises(ValueError, match="battery must be an integer between 0 and 100"):
            telemetry_collector.collect(
                position=[33.6844, 73.0479, 100.0],
                battery=150,  # Out of range
                status="EXECUTING"
            )
    
    def test_collect_invalid_status(self, collector):
        """Test that invalid status raises ValueError."""
        telemetry_collector, _ = collector
        
        with pytest.raises(ValueError, match="status must be a non-empty string"):
            telemetry_collector.collect(
                position=[33.6844, 73.0479, 100.0],
                battery=85,
                status=""  # Empty string
            )
    
    def test_sign_telemetry(self, collector):
        """Test signing telemetry data."""
        telemetry_collector, public_key = collector
        
        telemetry = telemetry_collector.collect(
            position=[33.6844, 73.0479, 100.0],
            battery=85,
            status="EXECUTING"
        )
        
        signature = telemetry_collector.sign_telemetry(telemetry)
        
        # Verify the signature
        telemetry_bytes = json.dumps(telemetry, sort_keys=True).encode('utf-8')
        assert verify_signature(public_key, telemetry_bytes, signature)
    
    def test_encrypt_telemetry(self, collector):
        """Test encrypting telemetry data."""
        telemetry_collector, public_key = collector
        
        telemetry = telemetry_collector.collect(
            position=[33.6844, 73.0479, 100.0],
            battery=85,
            status="EXECUTING"
        )
        
        signature = telemetry_collector.sign_telemetry(telemetry)
        encrypted_bytes = telemetry_collector.encrypt_telemetry(telemetry, signature)
        
        # Parse encrypted package
        encrypted_package = json.loads(encrypted_bytes.decode('utf-8'))
        
        assert "encrypted_data" in encrypted_package
        assert "signature" in encrypted_package
        assert "encryption_nonce" in encrypted_package
        assert "encryption_seed" in encrypted_package
        assert encrypted_package["drone_id"] == "DRONE_TEST_01"
    
    def test_encrypt_decrypt_round_trip(self, collector):
        """Test that encrypted telemetry can be decrypted."""
        telemetry_collector, public_key = collector
        
        original_telemetry = telemetry_collector.collect(
            position=[33.6844, 73.0479, 100.0],
            battery=85,
            status="EXECUTING",
            last_command="MOVE"
        )
        
        signature = telemetry_collector.sign_telemetry(original_telemetry)
        encrypted_bytes = telemetry_collector.encrypt_telemetry(original_telemetry, signature)
        
        # Parse encrypted package
        encrypted_package = json.loads(encrypted_bytes.decode('utf-8'))
        
        # Decode base64 fields
        ciphertext = base64.b64decode(encrypted_package["encrypted_data"])
        nonce = base64.b64decode(encrypted_package["encryption_nonce"])
        encryption_seed = base64.b64decode(encrypted_package["encryption_seed"])
        signature_b64 = encrypted_package["signature"]
        
        # Derive decryption key
        context = f"telemetry-encryption-{telemetry_collector.drone_id}".encode('utf-8')
        decryption_key = derive_session_key(encryption_seed, context, SYMMETRIC_KEY_SIZE)
        
        # Prepare associated data
        associated_data = json.dumps({
            "signature": signature_b64,
            "drone_id": telemetry_collector.drone_id
        }).encode('utf-8')
        
        # Decrypt
        decrypted_bytes = decrypt_aead(decryption_key, ciphertext, nonce, associated_data)
        decrypted_telemetry = json.loads(decrypted_bytes.decode('utf-8'))
        
        # Verify decrypted data matches original
        assert decrypted_telemetry["drone_id"] == original_telemetry["drone_id"]
        assert decrypted_telemetry["position"] == original_telemetry["position"]
        assert decrypted_telemetry["battery"] == original_telemetry["battery"]
        assert decrypted_telemetry["status"] == original_telemetry["status"]
    
    def test_collect_and_secure(self, collector):
        """Test the convenience method for collecting and securing telemetry."""
        telemetry_collector, public_key = collector
        
        encrypted_bytes = telemetry_collector.collect_and_secure(
            position=[33.6844, 73.0479, 100.0],
            battery=85,
            status="EXECUTING",
            last_command="MOVE",
            temperature=25.5
        )
        
        # Parse encrypted package
        encrypted_package = json.loads(encrypted_bytes.decode('utf-8'))
        
        assert encrypted_package["drone_id"] == "DRONE_TEST_01"
        assert "encrypted_data" in encrypted_package
        assert "signature" in encrypted_package
        
        # Verify we can decrypt and verify signature
        ciphertext = base64.b64decode(encrypted_package["encrypted_data"])
        nonce = base64.b64decode(encrypted_package["encryption_nonce"])
        encryption_seed = base64.b64decode(encrypted_package["encryption_seed"])
        signature = base64.b64decode(encrypted_package["signature"])
        
        # Derive decryption key
        context = f"telemetry-encryption-{telemetry_collector.drone_id}".encode('utf-8')
        decryption_key = derive_session_key(encryption_seed, context, SYMMETRIC_KEY_SIZE)
        
        # Prepare associated data
        associated_data = json.dumps({
            "signature": encrypted_package["signature"],
            "drone_id": telemetry_collector.drone_id
        }).encode('utf-8')
        
        # Decrypt
        decrypted_bytes = decrypt_aead(decryption_key, ciphertext, nonce, associated_data)
        decrypted_telemetry = json.loads(decrypted_bytes.decode('utf-8'))
        
        # Verify signature
        telemetry_bytes = json.dumps(decrypted_telemetry, sort_keys=True).encode('utf-8')
        assert verify_signature(public_key, telemetry_bytes, signature)
        
        # Verify content
        assert decrypted_telemetry["battery"] == 85
        assert decrypted_telemetry["temperature"] == 25.5
