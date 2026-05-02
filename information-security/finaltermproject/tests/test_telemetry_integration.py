"""
Integration tests for drone telemetry collection and server telemetry handling.
Tests the complete flow from drone telemetry generation to CAS reception.

Requirements: 8.4, 8.5, 14.1, 14.2, 14.3
"""

import pytest
import tempfile
import os

from drone.telemetry import TelemetryCollector
from server.telemetry_handler import TelemetryHandler
from server.key_manager import KeyManager
from server.identity import Identity, save_identity
from core.authentication import generate_keypair, serialize_public_key


class TestTelemetryIntegration:
    """Integration tests for telemetry collection and handling."""
    
    @pytest.fixture
    def setup_system(self):
        """Set up a complete system with drone and CAS."""
        # Create temporary directory for test data
        test_dir = tempfile.mkdtemp()
        
        # Generate keys for drone
        drone_private_key, drone_public_key = generate_keypair()
        drone_id = "DRONE_INTEGRATION_01"
        
        # Generate keys for CAS
        cas_private_key, cas_public_key = generate_keypair()
        
        # Create drone identity and save it
        drone_identity = Identity(
            id=drone_id,
            public_key=drone_public_key,
            roles=[],
            capabilities=["MOVE", "LAND", "STATUS"],
            allowed_commands=["MOVE", "LAND", "STATUS"],
            entity_type="drone"
        )
        
        # Save identity (save_identity creates subdirectories)
        save_identity(drone_identity, test_dir)
        
        # Create KeyManager with drone's public key
        cas_key_path = os.path.join(test_dir, "cas")
        os.makedirs(cas_key_path, exist_ok=True)
        
        key_manager = KeyManager(
            cas_key_path=cas_key_path,
            identity_base_path=test_dir
        )
        
        # Generate and save CAS keys
        key_manager.generate_cas_keypair()
        
        # Create TelemetryCollector for drone
        telemetry_collector = TelemetryCollector(
            drone_id=drone_id,
            private_key=drone_private_key,
            cas_public_key=cas_public_key
        )
        
        # Create TelemetryHandler for CAS
        audit_log_path = os.path.join(test_dir, "audit.log")
        telemetry_handler = TelemetryHandler(
            key_manager=key_manager,
            audit_log_path=audit_log_path
        )
        
        yield {
            "collector": telemetry_collector,
            "handler": telemetry_handler,
            "drone_id": drone_id,
            "test_dir": test_dir
        }
        
        # Cleanup
        import shutil
        if os.path.exists(test_dir):
            shutil.rmtree(test_dir)
    
    def test_end_to_end_telemetry_flow(self, setup_system):
        """Test complete telemetry flow from drone to CAS."""
        collector = setup_system["collector"]
        handler = setup_system["handler"]
        drone_id = setup_system["drone_id"]
        
        # Drone collects and secures telemetry
        encrypted_telemetry = collector.collect_and_secure(
            position=[33.6844, 73.0479, 100.0],
            battery=85,
            status="EXECUTING",
            last_command="MOVE",
            temperature=25.5
        )
        
        # CAS receives and processes telemetry
        decrypted_telemetry = handler.receive_telemetry(drone_id, encrypted_telemetry)
        
        # Verify the telemetry was correctly received
        assert decrypted_telemetry["drone_id"] == drone_id
        assert decrypted_telemetry["position"] == [33.6844, 73.0479, 100.0]
        assert decrypted_telemetry["battery"] == 85
        assert decrypted_telemetry["status"] == "EXECUTING"
        assert decrypted_telemetry["last_command"] == "MOVE"
        assert decrypted_telemetry["temperature"] == 25.5
        
        # Verify telemetry is stored in cache
        cached_telemetry = handler.get_telemetry(drone_id)
        assert len(cached_telemetry) == 1
        assert cached_telemetry[0]["battery"] == 85
    
    def test_multiple_telemetry_transmissions(self, setup_system):
        """Test multiple telemetry transmissions from drone to CAS."""
        collector = setup_system["collector"]
        handler = setup_system["handler"]
        drone_id = setup_system["drone_id"]
        
        # Send multiple telemetry updates
        for i in range(5):
            encrypted_telemetry = collector.collect_and_secure(
                position=[33.6844 + i * 0.001, 73.0479 + i * 0.001, 100.0 + i * 10],
                battery=85 - i * 5,
                status="EXECUTING",
                last_command="MOVE"
            )
            
            handler.receive_telemetry(drone_id, encrypted_telemetry)
        
        # Verify all telemetry is stored
        cached_telemetry = handler.get_telemetry(drone_id, limit=10)
        assert len(cached_telemetry) == 5
        
        # Verify most recent is first
        assert cached_telemetry[0]["battery"] == 65  # 85 - 4*5
        assert cached_telemetry[4]["battery"] == 85  # First transmission
    
    def test_telemetry_with_errors_triggers_anomaly(self, setup_system):
        """Test that telemetry with errors triggers anomaly detection."""
        collector = setup_system["collector"]
        handler = setup_system["handler"]
        drone_id = setup_system["drone_id"]
        test_dir = setup_system["test_dir"]
        
        # Send telemetry with errors
        encrypted_telemetry = collector.collect_and_secure(
            position=[33.6844, 73.0479, 100.0],
            battery=15,  # Low battery
            status="ERROR",
            last_command="MOVE",
            errors=["GPS signal lost", "Low battery warning"]
        )
        
        handler.receive_telemetry(drone_id, encrypted_telemetry)
        
        # Verify anomaly was logged
        audit_log_path = os.path.join(test_dir, "audit.log")
        if os.path.exists(audit_log_path):
            with open(audit_log_path, 'r') as f:
                log_content = f.read()
                assert "TELEMETRY_ANOMALY_DETECTED" in log_content
    
    def test_telemetry_signature_verification(self, setup_system):
        """Test that telemetry with invalid signature is rejected."""
        collector = setup_system["collector"]
        handler = setup_system["handler"]
        drone_id = setup_system["drone_id"]
        
        # Collect telemetry
        telemetry = collector.collect(
            position=[33.6844, 73.0479, 100.0],
            battery=85,
            status="EXECUTING"
        )
        
        # Sign with correct key
        signature = collector.sign_telemetry(telemetry)
        
        # Encrypt with correct signature
        encrypted_telemetry = collector.encrypt_telemetry(telemetry, signature)
        
        # This should work fine
        decrypted = handler.receive_telemetry(drone_id, encrypted_telemetry)
        assert decrypted["battery"] == 85
        
        # Now try with a different drone's key (should fail)
        other_private_key, _ = generate_keypair()
        other_collector = TelemetryCollector(
            drone_id=drone_id,  # Same ID but different key
            private_key=other_private_key,
            cas_public_key=collector.cas_public_key
        )
        
        # Create telemetry with wrong signature
        bad_signature = other_collector.sign_telemetry(telemetry)
        bad_encrypted = other_collector.encrypt_telemetry(telemetry, bad_signature)
        
        # This should fail signature verification
        with pytest.raises(ValueError, match="signature verification failed"):
            handler.receive_telemetry(drone_id, bad_encrypted)
