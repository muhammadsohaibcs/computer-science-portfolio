"""
Unit tests for server gateway module.
Tests command request processing, authorization workflow, and command sealing.

Requirements: 3.4, 4.1, 4.5, 5.1, 6.5
"""

import pytest
import tempfile
import os

from server.gateway import CommandGateway, CommandRequestStatus
from server.key_manager import KeyManager
from server.replay_protection import NonceStore
from server.identity import Identity, save_identity
from core.authentication import generate_keypair
from core.command_token import create_command_token


class TestCommandGateway:
    """Test cases for CommandGateway."""
    
    def setup_method(self):
        """Set up test fixtures."""
        # Create temporary directories for test data
        self.test_dir = tempfile.mkdtemp()
        self.cas_key_path = os.path.join(self.test_dir, "cas")
        self.identity_path = os.path.join(self.test_dir, "cas")
        self.audit_log_path = os.path.join(self.test_dir, "audit.jsonl")
        
        os.makedirs(self.cas_key_path, exist_ok=True)
        os.makedirs(os.path.join(self.identity_path, "drones"), exist_ok=True)
        os.makedirs(os.path.join(self.identity_path, "operators"), exist_ok=True)
        
        # Create key manager and generate CAS keys
        self.key_manager = KeyManager(self.cas_key_path, self.identity_path)
        self.key_manager.generate_cas_keypair()
        
        # Create test identities
        operator_private_key, operator_public_key = generate_keypair()
        drone_private_key, drone_public_key = generate_keypair()
        
        self.operator = Identity(
            id="OPERATOR_PILOT_01",
            public_key=operator_public_key,
            roles=["pilot"],
            capabilities=[],
            allowed_commands=["MOVE", "LAND", "STATUS"],
            status="active",
            entity_type="operator"
        )
        
        self.drone = Identity(
            id="DRONE_01",
            public_key=drone_public_key,
            roles=[],
            capabilities=["navigation", "flight"],
            allowed_commands=["MOVE", "LAND", "STATUS"],
            status="active",
            entity_type="drone"
        )
        
        # Save identities
        save_identity(self.operator, self.identity_path)
        save_identity(self.drone, self.identity_path)
        
        # Create gateway
        self.nonce_store = NonceStore()
        self.gateway = CommandGateway(
            key_manager=self.key_manager,
            nonce_store=self.nonce_store,
            audit_log_path=self.audit_log_path
        )
    
    def teardown_method(self):
        """Clean up test fixtures."""
        import shutil
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)
    
    def test_receive_valid_command_request(self):
        """Test receiving a valid command request."""
        request = {
            "command_type": "MOVE",
            "target_drone_id": "DRONE_01",
            "parameters": {
                "coordinates": [33.6844, 73.0479],
                "altitude": 100,
                "speed": 30
            },
            "validity_duration": 5,
            "justification": "Test flight"
        }
        
        request_id = self.gateway.receive_command_request("OPERATOR_PILOT_01", request)
        
        assert request_id is not None
        assert len(request_id) > 0
        
        # Check request status
        status = self.gateway.get_request_status(request_id)
        assert status is not None
        assert status["status"] == CommandRequestStatus.PENDING.value
        assert status["operator_id"] == "OPERATOR_PILOT_01"
        assert status["command_type"] == "MOVE"
        assert status["target_drone_id"] == "DRONE_01"
    
    def test_receive_request_missing_required_field(self):
        """Test that request missing required field is rejected."""
        request = {
            "command_type": "MOVE",
            # Missing target_drone_id
            "parameters": {"coordinates": [33.6844, 73.0479]}
        }
        
        with pytest.raises(ValueError) as exc_info:
            self.gateway.receive_command_request("OPERATOR_PILOT_01", request)
        
        assert "missing required field" in str(exc_info.value).lower()
    
    def test_receive_request_invalid_command_type(self):
        """Test that request with invalid command type is rejected."""
        request = {
            "command_type": "INVALID_COMMAND",
            "target_drone_id": "DRONE_01",
            "parameters": {}
        }
        
        with pytest.raises(ValueError) as exc_info:
            self.gateway.receive_command_request("OPERATOR_PILOT_01", request)
        
        assert "invalid command_type" in str(exc_info.value).lower()
    
    def test_receive_request_invalid_parameters(self):
        """Test that request with invalid parameters is rejected."""
        request = {
            "command_type": "MOVE",
            "target_drone_id": "DRONE_01",
            "parameters": "not a dict"  # Should be a dictionary
        }
        
        with pytest.raises(ValueError) as exc_info:
            self.gateway.receive_command_request("OPERATOR_PILOT_01", request)
        
        assert "parameters must be a dictionary" in str(exc_info.value).lower()
    
    def test_process_authorization_valid_request(self):
        """Test processing authorization for a valid request."""
        # Create request
        request = {
            "command_type": "MOVE",
            "target_drone_id": "DRONE_01",
            "parameters": {
                "coordinates": [33.6844, 73.0479],
                "altitude": 100,
                "speed": 30
            },
            "validity_duration": 5
        }
        
        request_id = self.gateway.receive_command_request("OPERATOR_PILOT_01", request)
        
        # Process authorization
        authorized = self.gateway.process_authorization(request_id)
        
        assert authorized
        
        # Check request status
        status = self.gateway.get_request_status(request_id)
        assert status["status"] == CommandRequestStatus.APPROVED.value
        assert status["sealed_command_available"]
        
        # Check sealed command is available
        sealed_command = self.gateway.get_sealed_command(request_id)
        assert sealed_command is not None
        assert sealed_command.encrypted_token
        assert sealed_command.signature
        assert sealed_command.encryption_nonce
    
    def test_process_authorization_operator_not_found(self):
        """Test that authorization fails if operator not found."""
        # Create request with non-existent operator
        request = {
            "command_type": "MOVE",
            "target_drone_id": "DRONE_01",
            "parameters": {"coordinates": [33.6844, 73.0479]}
        }
        
        request_id = self.gateway.receive_command_request("NONEXISTENT_OPERATOR", request)
        
        # Process authorization
        authorized = self.gateway.process_authorization(request_id)
        
        assert not authorized
        
        # Check request status
        status = self.gateway.get_request_status(request_id)
        assert status["status"] == CommandRequestStatus.REJECTED.value
        assert "operator not found" in status["rejection_reason"].lower()
    
    def test_process_authorization_drone_not_found(self):
        """Test that authorization fails if drone not found."""
        # Create request with non-existent drone
        request = {
            "command_type": "MOVE",
            "target_drone_id": "NONEXISTENT_DRONE",
            "parameters": {"coordinates": [33.6844, 73.0479]}
        }
        
        request_id = self.gateway.receive_command_request("OPERATOR_PILOT_01", request)
        
        # Process authorization
        authorized = self.gateway.process_authorization(request_id)
        
        assert not authorized
        
        # Check request status
        status = self.gateway.get_request_status(request_id)
        assert status["status"] == CommandRequestStatus.REJECTED.value
        assert "drone not found" in status["rejection_reason"].lower()
    
    def test_process_authorization_invalid_request_id(self):
        """Test that processing with invalid request_id raises error."""
        with pytest.raises(ValueError) as exc_info:
            self.gateway.process_authorization("invalid_request_id")
        
        assert "invalid request_id" in str(exc_info.value).lower()
    
    def test_get_request_status_not_found(self):
        """Test getting status for non-existent request."""
        status = self.gateway.get_request_status("nonexistent_request_id")
        assert status is None
    
    def test_get_sealed_command_not_found(self):
        """Test getting sealed command for non-existent request."""
        sealed_command = self.gateway.get_sealed_command("nonexistent_request_id")
        assert sealed_command is None
    
    def test_send_command_to_drone(self):
        """Test sending command to drone (placeholder implementation)."""
        sealed_command_bytes = b"test_sealed_command_data"
        
        result = self.gateway.send_command_to_drone("DRONE_01", sealed_command_bytes)
        
        # Placeholder implementation always returns True
        assert result
    
    def test_nonce_stored_after_authorization(self):
        """Test that nonce is stored in nonce store after authorization."""
        # Create and authorize request
        request = {
            "command_type": "MOVE",
            "target_drone_id": "DRONE_01",
            "parameters": {"coordinates": [33.6844, 73.0479]}
        }
        
        request_id = self.gateway.receive_command_request("OPERATOR_PILOT_01", request)
        authorized = self.gateway.process_authorization(request_id)
        
        assert authorized
        
        # Get the sealed command to extract nonce
        sealed_command = self.gateway.get_sealed_command(request_id)
        assert sealed_command is not None
        
        # Nonce should be in the store (we can't easily extract it to verify,
        # but we can check the store size increased)
        assert self.nonce_store.size() > 0


class TestCommandGatewayIntegration:
    """Integration tests for complete command flow."""
    
    def setup_method(self):
        """Set up test fixtures."""
        # Create temporary directories
        self.test_dir = tempfile.mkdtemp()
        self.cas_key_path = os.path.join(self.test_dir, "cas")
        self.identity_path = os.path.join(self.test_dir, "cas")
        self.audit_log_path = os.path.join(self.test_dir, "audit.jsonl")
        
        os.makedirs(self.cas_key_path, exist_ok=True)
        os.makedirs(os.path.join(self.identity_path, "drones"), exist_ok=True)
        os.makedirs(os.path.join(self.identity_path, "operators"), exist_ok=True)
        
        # Create key manager and generate CAS keys
        self.key_manager = KeyManager(self.cas_key_path, self.identity_path)
        self.key_manager.generate_cas_keypair()
        
        # Create test identities
        _, operator_public_key = generate_keypair()
        _, drone_public_key = generate_keypair()
        
        self.operator = Identity(
            id="OPERATOR_PILOT_01",
            public_key=operator_public_key,
            roles=["pilot"],
            capabilities=[],
            allowed_commands=["MOVE", "LAND", "STATUS"],
            status="active",
            entity_type="operator"
        )
        
        self.drone = Identity(
            id="DRONE_01",
            public_key=drone_public_key,
            roles=[],
            capabilities=["navigation", "flight"],
            allowed_commands=["MOVE", "LAND", "STATUS"],
            status="active",
            entity_type="drone"
        )
        
        # Save identities
        save_identity(self.operator, self.identity_path)
        save_identity(self.drone, self.identity_path)
        
        # Create gateway
        self.gateway = CommandGateway(
            key_manager=self.key_manager,
            nonce_store=NonceStore(),
            audit_log_path=self.audit_log_path
        )
    
    def teardown_method(self):
        """Clean up test fixtures."""
        import shutil
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)
    
    def test_complete_command_flow(self):
        """Test complete command flow from request to sealed command."""
        # Step 1: Receive command request
        request = {
            "command_type": "MOVE",
            "target_drone_id": "DRONE_01",
            "parameters": {
                "coordinates": [33.6844, 73.0479],
                "altitude": 100,
                "speed": 30
            },
            "validity_duration": 5,
            "justification": "Test flight"
        }
        
        request_id = self.gateway.receive_command_request("OPERATOR_PILOT_01", request)
        assert request_id is not None
        
        # Step 2: Process authorization
        authorized = self.gateway.process_authorization(request_id)
        assert authorized
        
        # Step 3: Get sealed command
        sealed_command = self.gateway.get_sealed_command(request_id)
        assert sealed_command is not None
        assert sealed_command.encrypted_token
        assert sealed_command.signature
        
        # Step 4: Send to drone (placeholder)
        result = self.gateway.send_command_to_drone(
            "DRONE_01",
            sealed_command.to_bytes()
        )
        assert result
        
        # Verify audit log was created
        assert os.path.exists(self.audit_log_path)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
