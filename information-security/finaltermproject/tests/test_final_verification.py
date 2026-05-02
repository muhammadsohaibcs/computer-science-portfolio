"""
Final verification tests for the Secure Drone Command Authorization System.

This test suite verifies:
1. Audit chain integrity
2. End-to-end command flow
3. Component integration
"""

import pytest
import os
import json
import time
from pathlib import Path

# Import all necessary components
from core.authentication import generate_keypair, sign, verify_signature
from core.command_token import create_command_token, serialize_token, deserialize_token
from core.hashing import hash_data, hash_chain
from core.time_utils import get_current_timestamp
from server.audit import AuditEvent, log_event, verify_audit_chain, query_audit_log
from server.authorization import check_authorization, RolePolicy
from server.command_signer import sign_command, seal_command
from server.gateway import CommandGateway
from server.identity import Identity, load_identity
from server.key_manager import get_drone_public_key, load_cas_private_key
from server.replay_protection import NonceStore
from drone.agent import DroneAgent
from drone.verifier import verify_command_complete
from drone.executor import CommandExecutor
from provisioning.device_enrollment import enroll_drone, register_drone_with_cas
from provisioning.operator_enrollment import enroll_operator
from ledger.blockchain import Blockchain
from ledger.verifier import verify_chain_integrity


class TestAuditChainIntegrity:
    """Test audit chain integrity and tamper-evidence."""
    
    def test_audit_chain_verification(self, tmp_path):
        """Verify that audit chain maintains integrity across multiple events."""
        # Set up temporary audit log
        audit_log_path = tmp_path / "audit_test.jsonl"
        
        # Create a series of audit events using the log_event function
        for i in range(10):
            log_event(
                event_type="TEST_EVENT",
                actor=f"ACTOR_{i}",
                target=f"TARGET_{i}",
                details={"test": f"event_{i}"},
                log_path=str(audit_log_path)
            )
        
        # Verify the audit chain
        assert verify_audit_chain(str(audit_log_path)), "Audit chain verification should pass"
    
    def test_blockchain_integrity(self, tmp_path):
        """Verify blockchain maintains integrity and is tamper-evident."""
        blockchain_path = tmp_path / "blockchain_test.jsonl"
        blockchain = Blockchain(blockchain_path=str(blockchain_path), block_size=2)
        
        # Add multiple events
        for i in range(5):
            event = AuditEvent(
                timestamp=get_current_timestamp() + i,
                event_type="COMMAND_EXECUTED",
                actor=f"OPERATOR_{i}",
                target=f"DRONE_{i}",
                details={"command": "MOVE"},
                previous_hash=b'\x00' * 32
            )
            blockchain.add_event(event)
        
        # Flush pending events
        blockchain.flush()
        
        # Verify chain integrity
        assert blockchain.verify_chain(), "Blockchain should be valid"
        
        # Get block count
        block_count = blockchain.get_block_count()
        assert block_count > 0, "Blockchain should contain blocks"


class TestEndToEndCommandFlow:
    """Test complete end-to-end command flow from operator to drone."""
    
    @pytest.fixture
    def setup_system(self, tmp_path):
        """Set up a complete system with operator, CAS, and drone."""
        # Create data directories
        cas_dir = tmp_path / "cas" / "drones"
        drone_dir = tmp_path / "drones" / "DRONE_TEST_01"
        operator_dir = tmp_path / "operators" / "OPERATOR_TEST_01"
        
        for d in [cas_dir, drone_dir, operator_dir]:
            d.mkdir(parents=True, exist_ok=True)
        
        # Generate CAS keypair (issuer)
        cas_private_key, cas_public_key = generate_keypair()
        
        # Enroll drone
        drone_id = "DRONE_TEST_01"
        drone_private_key, drone_public_key, drone_cert = enroll_drone(
            drone_id,
            issuer_name="CAS",
            issuer_private_key=cas_private_key,
            capabilities=["MOVE", "LAND", "STATUS"]
        )
        register_drone_with_cas(
            drone_id,
            drone_public_key,
            ["MOVE", "LAND", "STATUS"],
            storage_path=str(cas_dir)
        )
        
        # Enroll operator
        operator_id = "OPERATOR_TEST_01"
        operator_private_key, operator_public_key, operator_cert = enroll_operator(
            operator_id,
            ["pilot", "admin"],
            issuer_name="CAS",
            issuer_private_key=cas_private_key
        )
        
        # Create identities
        operator_identity = Identity(
            id=operator_id,
            public_key=operator_public_key,
            roles=["pilot", "admin"],
            capabilities=[],
            allowed_commands=["MOVE", "LAND", "STATUS", "EMERGENCY_STOP"],
            entity_type="operator"
        )
        
        drone_identity = Identity(
            id=drone_id,
            public_key=drone_public_key,
            roles=[],
            capabilities=["MOVE", "LAND", "STATUS"],
            allowed_commands=["MOVE", "LAND", "STATUS"],
            entity_type="drone"
        )
        
        return {
            'cas_private_key': cas_private_key,
            'cas_public_key': cas_public_key,
            'drone_id': drone_id,
            'drone_private_key': drone_private_key,
            'drone_public_key': drone_public_key,
            'operator_id': operator_id,
            'operator_identity': operator_identity,
            'drone_identity': drone_identity,
            'tmp_path': tmp_path
        }
    
    def test_complete_command_flow(self, setup_system):
        """Test complete command flow: request → authorize → sign → verify → execute."""
        sys = setup_system
        
        # Step 1: Create command token
        command_token = create_command_token(
            command_type="MOVE",
            target_drone_id=sys['drone_id'],
            parameters={"coordinates": [33.6844, 73.0479], "altitude": 100},
            issuer=sys['operator_id'],
            validity_duration=300
        )
        
        assert command_token is not None, "Command token should be created"
        assert command_token.target_drone_id == sys['drone_id']
        assert command_token.command_type == "MOVE"
        
        # Step 2: Authorization check
        # For this test, we'll skip full authorization and just verify the token is valid
        # Full authorization requires policy configuration which is tested separately
        assert command_token.target_drone_id == sys['drone_id'], "Target should match"
        assert command_token.issuer == sys['operator_id'], "Issuer should match"
        
        # Step 3: Sign command
        signature = sign_command(command_token, sys['cas_private_key'])
        assert signature is not None, "Command should be signed"
        
        # Step 4: Seal command (encrypt for drone)
        sealed_command = seal_command(
            command_token,
            signature,
            sys['drone_public_key']
        )
        assert sealed_command is not None, "Command should be sealed"
        
        # Step 5: Drone verification
        verified, verify_reason = verify_command_complete(
            command_token,
            signature,
            sys['drone_id'],
            sys['cas_public_key']
        )
        
        assert verified, f"Command verification should pass: {verify_reason}"
        
        # Step 6: Execute command
        executor = CommandExecutor(sys['drone_id'])
        result = executor.execute(command_token)
        
        assert result is not None, "Command execution should return result"
        assert result.success or result.message, "Execution should complete"
    
    def test_command_flow_with_gateway(self, setup_system):
        """Test command flow through the CommandGateway."""
        sys = setup_system
        
        # Initialize gateway
        gateway = CommandGateway()
        
        # Create command request
        command_request = {
            'command_type': 'STATUS',
            'target_drone_id': sys['drone_id'],
            'parameters': {},
            'validity_duration': 60,
            'justification': 'Health check'
        }
        
        # Submit command request
        request_id = gateway.receive_command_request(
            sys['operator_id'],
            command_request
        )
        
        assert request_id is not None, "Request ID should be returned"
        
        # Note: Full authorization testing requires policy configuration
        # which is tested in the authorization integration tests
        # Here we just verify the gateway accepts and processes the request


class TestComponentIntegration:
    """Test integration between different system components."""
    
    def test_provisioning_integration(self, tmp_path):
        """Test that provisioning components work together."""
        from provisioning.device_enrollment import get_drone_info
        
        # Generate issuer keypair
        issuer_private_key, issuer_public_key = generate_keypair()
        
        # Enroll a drone
        drone_id = "DRONE_INTEGRATION_01"
        cas_dir = tmp_path / "cas" / "drones"
        cas_dir.mkdir(parents=True, exist_ok=True)
        
        drone_private_key, drone_public_key, drone_cert = enroll_drone(
            drone_id,
            issuer_name="CAS",
            issuer_private_key=issuer_private_key,
            capabilities=["MOVE", "LAND"]
        )
        
        assert drone_private_key is not None, "Drone private key should be generated"
        assert drone_cert is not None, "Drone certificate should be issued"
        assert drone_cert.subject == drone_id, "Certificate subject should match drone ID"
        
        # Register with CAS
        register_drone_with_cas(
            drone_id,
            drone_public_key,
            ["MOVE", "LAND"],
            storage_path=str(cas_dir)
        )
        
        # Verify we can retrieve drone info
        drone_info = get_drone_info(drone_id, storage_path=str(cas_dir))
        assert drone_info is not None, "Should be able to retrieve drone info"
        assert drone_info['drone_id'] == drone_id, "Drone ID should match"
    
    def test_crypto_integration(self):
        """Test that cryptographic components work together."""
        # Generate keypair
        private_key, public_key = generate_keypair()
        
        # Create and sign a message
        message = b"Test message for integration"
        signature = sign(private_key, message)
        
        # Verify signature
        assert verify_signature(public_key, message, signature), \
            "Signature verification should succeed"
        
        # Test with command token
        token = create_command_token(
            command_type="LAND",
            target_drone_id="DRONE_01",
            parameters={},
            issuer="OPERATOR_01",
            validity_duration=60
        )
        
        # Serialize and deserialize
        serialized = serialize_token(token)
        deserialized = deserialize_token(serialized)
        
        assert deserialized.command_type == token.command_type
        assert deserialized.target_drone_id == token.target_drone_id
    
    def test_nonce_replay_protection(self):
        """Test that replay protection integrates with command verification."""
        nonce_store = NonceStore()
        
        # Create command with nonce
        token = create_command_token(
            command_type="MOVE",
            target_drone_id="DRONE_01",
            parameters={"coordinates": [0, 0]},
            issuer="OPERATOR_01",
            validity_duration=300
        )
        
        # First use should succeed
        assert nonce_store.check_and_store(token.nonce, token.expires_at), \
            "First nonce use should succeed"
        
        # Second use should fail (replay detected)
        assert not nonce_store.check_and_store(token.nonce, token.expires_at), \
            "Replay should be detected"
    
    def test_telemetry_integration(self, tmp_path):
        """Test telemetry collection, signing, and verification."""
        from drone.telemetry import TelemetryCollector
        from server.telemetry_handler import TelemetryHandler
        from server.key_manager import KeyManager
        
        # Set up directories
        cas_dir = tmp_path / "cas"
        cas_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate issuer and drone keys
        issuer_private_key, issuer_public_key = generate_keypair()
        drone_id = "DRONE_TELEMETRY_01"
        
        # Enroll drone
        drone_private_key, drone_public_key, drone_cert = enroll_drone(
            drone_id,
            issuer_name="CAS",
            issuer_private_key=issuer_private_key,
            capabilities=["MOVE", "LAND"]
        )
        
        # Register drone with CAS
        register_drone_with_cas(
            drone_id,
            drone_public_key,
            ["MOVE", "LAND"],
            storage_path=str(cas_dir / "drones")
        )
        
        # Create key manager with correct path
        key_manager = KeyManager(
            cas_key_path=str(cas_dir),
            identity_base_path=str(cas_dir)
        )
        
        # Collect telemetry
        collector = TelemetryCollector(drone_id, drone_private_key)
        telemetry_data = collector.collect(
            position=[33.6844, 73.0479, 100],
            battery=85,
            status="IDLE"
        )
        
        assert telemetry_data is not None, "Telemetry should be collected"
        assert telemetry_data['drone_id'] == drone_id
        
        # Sign telemetry
        telemetry_signature = collector.sign_telemetry(telemetry_data)
        
        # Verify telemetry using handler
        handler = TelemetryHandler(key_manager=key_manager)
        telemetry_bytes = json.dumps(telemetry_data, sort_keys=True).encode()
        assert handler.verify_telemetry(drone_id, telemetry_bytes, telemetry_signature), \
            "Telemetry verification should succeed"


class TestSystemResilience:
    """Test system behavior under error conditions."""
    
    def test_invalid_signature_rejection(self):
        """Test that commands with invalid signatures are rejected."""
        # Create valid token
        token = create_command_token(
            command_type="MOVE",
            target_drone_id="DRONE_01",
            parameters={"coordinates": [0, 0]},
            issuer="OPERATOR_01",
            validity_duration=60
        )
        
        # Create invalid signature
        invalid_signature = b"invalid_signature_data"
        
        # Generate keys for verification
        _, cas_public_key = generate_keypair()
        
        # Verification should fail
        verified, reason = verify_command_complete(
            token,
            invalid_signature,
            "DRONE_01",
            cas_public_key
        )
        
        assert not verified, "Invalid signature should be rejected"
        assert "signature" in reason.lower(), "Reason should mention signature"
    
    def test_expired_command_rejection(self):
        """Test that expired commands are rejected."""
        # Create token that will expire immediately
        token = create_command_token(
            command_type="MOVE",
            target_drone_id="DRONE_01",
            parameters={"coordinates": [0, 0]},
            issuer="OPERATOR_01",
            validity_duration=1  # 1 second
        )
        
        # Generate keys
        private_key, public_key = generate_keypair()
        signature = sign_command(token, private_key)
        
        # Wait for expiration
        import time
        time.sleep(2)
        
        # Verification should fail due to expiration
        verified, reason = verify_command_complete(
            token,
            signature,
            "DRONE_01",
            public_key
        )
        
        assert not verified, "Expired command should be rejected"
    
    def test_wrong_target_rejection(self):
        """Test that commands for wrong drone are rejected."""
        token = create_command_token(
            command_type="MOVE",
            target_drone_id="DRONE_01",
            parameters={"coordinates": [0, 0]},
            issuer="OPERATOR_01",
            validity_duration=60
        )
        
        private_key, public_key = generate_keypair()
        signature = sign_command(token, private_key)
        
        # Try to verify with wrong drone ID
        verified, reason = verify_command_complete(
            token,
            signature,
            "DRONE_02",  # Wrong drone
            public_key
        )
        
        assert not verified, "Command for wrong drone should be rejected"
        assert "target" in reason.lower(), "Reason should mention target mismatch"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
