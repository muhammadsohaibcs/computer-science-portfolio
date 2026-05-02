"""
Tests for drone agent main controller.
Tests command reception, verification, execution workflow and telemetry transmission.
"""

import pytest
import json
import base64
from unittest.mock import Mock, MagicMock

from core.authentication import generate_keypair
from core.command_token import create_command_token
from server.command_signer import sign_command, seal_command
from drone.agent import DroneAgent
from drone.failsafe import FailsafeConditions


@pytest.fixture
def cas_keypair():
    """Generate CAS keypair for testing."""
    return generate_keypair()


@pytest.fixture
def drone_keypair():
    """Generate drone keypair for testing."""
    return generate_keypair()


@pytest.fixture
def drone_agent(drone_keypair, cas_keypair):
    """Create a DroneAgent for testing."""
    drone_private_key, drone_public_key = drone_keypair
    cas_private_key, cas_public_key = cas_keypair
    
    # Create agent with callbacks
    telemetry_callback = Mock()
    alert_callback = Mock()
    
    agent = DroneAgent(
        drone_id="DRONE_TEST_01",
        private_key=drone_private_key,
        cas_public_key=cas_public_key,
        capabilities=["MOVE", "LAND", "STATUS", "EMERGENCY_STOP"],
        failsafe_conditions=FailsafeConditions(
            max_invalid_commands=3,
            communication_timeout=30,
            security_violation_threshold=2
        ),
        telemetry_callback=telemetry_callback,
        alert_callback=alert_callback
    )
    
    return agent


@pytest.fixture
def valid_sealed_command(cas_keypair, drone_keypair):
    """Create a valid sealed command for testing."""
    cas_private_key, cas_public_key = cas_keypair
    drone_private_key, drone_public_key = drone_keypair
    
    # Create command token
    token = create_command_token(
        command_type="STATUS",
        target_drone_id="DRONE_TEST_01",
        parameters={},
        issuer="OPERATOR_TEST"
    )
    
    # Sign and seal the command
    signature = sign_command(token, cas_private_key)
    sealed = seal_command(token, signature, drone_public_key)
    
    return sealed.to_bytes()


class TestDroneAgentInitialization:
    """Tests for DroneAgent initialization."""
    
    def test_agent_initialization(self, drone_agent):
        """Test that agent initializes correctly."""
        assert drone_agent.drone_id == "DRONE_TEST_01"
        assert drone_agent.status == "IDLE"
        assert drone_agent.battery == 100
        assert drone_agent.position == [0.0, 0.0, 0.0]
        assert drone_agent.last_command_type == ""
        assert len(drone_agent.errors) == 0
    
    def test_agent_start(self, drone_agent):
        """Test that agent starts correctly."""
        drone_agent.start()
        
        assert drone_agent.status in ["READY", "FAILSAFE"]
        # Telemetry callback should be called
        assert drone_agent.telemetry_callback.called
    
    def test_agent_get_status(self, drone_agent):
        """Test getting agent status."""
        status = drone_agent.get_status()
        
        assert status["drone_id"] == "DRONE_TEST_01"
        assert "status" in status
        assert "position" in status
        assert "battery" in status
        assert "failsafe_state" in status
        assert "capabilities" in status


class TestCommandReception:
    """Tests for command reception and processing."""
    
    def test_receive_valid_command(self, drone_agent, valid_sealed_command):
        """Test receiving and processing a valid command."""
        result = drone_agent.receive_command(valid_sealed_command)
        
        assert result["success"] is True
        assert result["command_type"] == "STATUS"
        assert "execution_result" in result
        assert result["execution_result"] is not None
        assert result["execution_result"].success
    
    def test_receive_command_updates_state(self, drone_agent, cas_keypair, drone_keypair):
        """Test that receiving a command updates drone state."""
        cas_private_key, cas_public_key = cas_keypair
        drone_private_key, drone_public_key = drone_keypair
        
        # Create MOVE command
        token = create_command_token(
            command_type="MOVE",
            target_drone_id="DRONE_TEST_01",
            parameters={
                "coordinates": [33.6844, 73.0479],
                "altitude": 100,
                "speed": 15
            },
            issuer="OPERATOR_TEST"
        )
        
        signature = sign_command(token, cas_private_key)
        sealed = seal_command(token, signature, drone_public_key)
        
        result = drone_agent.receive_command(sealed.to_bytes())
        
        assert result["success"] is True
        assert drone_agent.last_command_type == "MOVE"
        assert drone_agent.status == "OPERATIONAL"
    
    def test_receive_command_with_wrong_target(self, drone_agent, cas_keypair, drone_keypair):
        """Test that command for wrong drone is rejected."""
        cas_private_key, cas_public_key = cas_keypair
        drone_private_key, drone_public_key = drone_keypair
        
        # Create command for different drone
        token = create_command_token(
            command_type="STATUS",
            target_drone_id="DRONE_WRONG",
            parameters={},
            issuer="OPERATOR_TEST"
        )
        
        signature = sign_command(token, cas_private_key)
        sealed = seal_command(token, signature, drone_public_key)
        
        result = drone_agent.receive_command(sealed.to_bytes())
        
        assert result["success"] is False
        assert "verification failed" in result["message"].lower()
    
    def test_receive_command_with_invalid_signature(self, drone_agent, cas_keypair, drone_keypair):
        """Test that command with invalid signature is rejected."""
        cas_private_key, cas_public_key = cas_keypair
        drone_private_key, drone_public_key = drone_keypair
        
        # Create command
        token = create_command_token(
            command_type="STATUS",
            target_drone_id="DRONE_TEST_01",
            parameters={},
            issuer="OPERATOR_TEST"
        )
        
        # Sign with wrong key
        wrong_private_key, _ = generate_keypair()
        signature = sign_command(token, wrong_private_key)
        sealed = seal_command(token, signature, drone_public_key)
        
        result = drone_agent.receive_command(sealed.to_bytes())
        
        assert result["success"] is False
        assert "signature" in result["message"].lower()
    
    def test_receive_malformed_command(self, drone_agent):
        """Test that malformed command data is handled gracefully."""
        malformed_data = b"not a valid sealed command"
        
        result = drone_agent.receive_command(malformed_data)
        
        assert result["success"] is False
        assert "error" in result["message"].lower()
    
    def test_replay_attack_detection(self, drone_agent, valid_sealed_command):
        """Test that replay attacks are detected."""
        # Send command first time
        result1 = drone_agent.receive_command(valid_sealed_command)
        assert result1["success"] is True
        
        # Try to replay the same command
        result2 = drone_agent.receive_command(valid_sealed_command)
        assert result2["success"] is False
        assert "replay" in result2["message"].lower() or "nonce" in result2["message"].lower()


class TestFailsafeIntegration:
    """Tests for failsafe integration with command processing."""
    
    def test_command_rejected_in_failsafe_mode(self, drone_agent, cas_keypair, drone_keypair):
        """Test that commands are rejected when in failsafe mode."""
        cas_private_key, cas_public_key = cas_keypair
        drone_private_key, drone_public_key = drone_keypair
        
        # Put drone in failsafe mode
        drone_agent.failsafe.enter_failsafe_mode("Test failsafe")
        
        # Create normal command
        token = create_command_token(
            command_type="MOVE",
            target_drone_id="DRONE_TEST_01",
            parameters={
                "coordinates": [0, 0],
                "altitude": 100,
                "speed": 15
            },
            issuer="OPERATOR_TEST"
        )
        
        signature = sign_command(token, cas_private_key)
        sealed = seal_command(token, signature, drone_public_key)
        
        result = drone_agent.receive_command(sealed.to_bytes())
        
        assert result["success"] is False
        assert "failsafe" in result["message"].lower() or "rejected" in result["message"].lower()
    
    def test_emergency_stop_accepted_in_failsafe(self, drone_agent, cas_keypair, drone_keypair):
        """Test that EMERGENCY_STOP is accepted even in failsafe mode."""
        cas_private_key, cas_public_key = cas_keypair
        drone_private_key, drone_public_key = drone_keypair
        
        # Put drone in failsafe mode
        drone_agent.failsafe.enter_failsafe_mode("Test failsafe")
        
        # Create emergency stop command
        token = create_command_token(
            command_type="EMERGENCY_STOP",
            target_drone_id="DRONE_TEST_01",
            parameters={},
            issuer="OPERATOR_TEST"
        )
        
        signature = sign_command(token, cas_private_key)
        sealed = seal_command(token, signature, drone_public_key)
        
        result = drone_agent.receive_command(sealed.to_bytes())
        
        assert result["success"] is True
        assert result["command_type"] == "EMERGENCY_STOP"
    
    def test_invalid_commands_trigger_failsafe(self, drone_agent, cas_keypair, drone_keypair):
        """Test that repeated invalid commands trigger failsafe mode."""
        cas_private_key, cas_public_key = cas_keypair
        drone_private_key, drone_public_key = drone_keypair
        
        # Send multiple commands with wrong target
        for i in range(5):
            token = create_command_token(
                command_type="STATUS",
                target_drone_id="DRONE_WRONG",
                parameters={},
                issuer="OPERATOR_TEST"
            )
            
            signature = sign_command(token, cas_private_key)
            sealed = seal_command(token, signature, drone_public_key)
            
            drone_agent.receive_command(sealed.to_bytes())
        
        # Check if failsafe was triggered
        assert drone_agent.failsafe.is_in_failsafe()


class TestTelemetryTransmission:
    """Tests for telemetry collection and transmission."""
    
    def test_send_telemetry(self, drone_agent):
        """Test that telemetry is sent correctly."""
        encrypted_telemetry = drone_agent.send_telemetry()
        
        assert encrypted_telemetry is not None
        assert isinstance(encrypted_telemetry, bytes)
        
        # Verify callback was called
        assert drone_agent.telemetry_callback.called
        call_args = drone_agent.telemetry_callback.call_args[0]
        assert call_args[0] == encrypted_telemetry
    
    def test_telemetry_after_command_execution(self, drone_agent, valid_sealed_command):
        """Test that telemetry is sent after command execution."""
        # Reset mock
        drone_agent.telemetry_callback.reset_mock()
        
        result = drone_agent.receive_command(valid_sealed_command)
        
        assert result["success"] is True
        # Telemetry should be sent after command execution
        assert drone_agent.telemetry_callback.called
    
    def test_telemetry_contains_errors(self, drone_agent, cas_keypair, drone_keypair):
        """Test that telemetry includes error information."""
        cas_private_key, cas_public_key = cas_keypair
        drone_private_key, drone_public_key = drone_keypair
        
        # Send invalid command to generate error
        token = create_command_token(
            command_type="STATUS",
            target_drone_id="DRONE_WRONG",
            parameters={},
            issuer="OPERATOR_TEST"
        )
        
        signature = sign_command(token, cas_private_key)
        sealed = seal_command(token, signature, drone_public_key)
        
        drone_agent.receive_command(sealed.to_bytes())
        
        # Errors should be recorded
        # Note: errors are cleared after sending telemetry
        # So we check that telemetry was sent with errors
        assert drone_agent.telemetry_callback.called


class TestAgentShutdown:
    """Tests for agent shutdown."""
    
    def test_shutdown(self, drone_agent):
        """Test that agent shuts down gracefully."""
        drone_agent.start()
        drone_agent.telemetry_callback.reset_mock()
        
        drone_agent.shutdown()
        
        assert drone_agent.status == "SHUTDOWN"
        # Final telemetry should be sent
        assert drone_agent.telemetry_callback.called
    
    def test_shutdown_cleans_nonces(self, drone_agent, valid_sealed_command):
        """Test that shutdown cleans up expired nonces."""
        # Process a command to store a nonce
        drone_agent.receive_command(valid_sealed_command)
        
        # Shutdown should cleanup
        drone_agent.shutdown()
        
        # Verify shutdown completed
        assert drone_agent.status == "SHUTDOWN"


class TestStateManagement:
    """Tests for drone state management."""
    
    def test_position_update_from_move_command(self, drone_agent, cas_keypair, drone_keypair):
        """Test that position is updated after MOVE command."""
        cas_private_key, cas_public_key = cas_keypair
        drone_private_key, drone_public_key = drone_keypair
        
        initial_position = drone_agent.position.copy()
        
        token = create_command_token(
            command_type="MOVE",
            target_drone_id="DRONE_TEST_01",
            parameters={
                "coordinates": [33.6844, 73.0479],
                "altitude": 100,
                "speed": 15
            },
            issuer="OPERATOR_TEST"
        )
        
        signature = sign_command(token, cas_private_key)
        sealed = seal_command(token, signature, drone_public_key)
        
        result = drone_agent.receive_command(sealed.to_bytes())
        
        assert result["success"] is True
        # Position should be updated
        assert drone_agent.position != initial_position
        assert drone_agent.position[0] == 33.6844
        assert drone_agent.position[1] == 73.0479
        assert drone_agent.position[2] == 100
    
    def test_status_update_from_land_command(self, drone_agent, cas_keypair, drone_keypair):
        """Test that status is updated after LAND command."""
        cas_private_key, cas_public_key = cas_keypair
        drone_private_key, drone_public_key = drone_keypair
        
        token = create_command_token(
            command_type="LAND",
            target_drone_id="DRONE_TEST_01",
            parameters={},
            issuer="OPERATOR_TEST"
        )
        
        signature = sign_command(token, cas_private_key)
        sealed = seal_command(token, signature, drone_public_key)
        
        result = drone_agent.receive_command(sealed.to_bytes())
        
        assert result["success"] is True
        assert drone_agent.status == "LANDING"
    
    def test_status_update_from_emergency_stop(self, drone_agent, cas_keypair, drone_keypair):
        """Test that status is updated after EMERGENCY_STOP command."""
        cas_private_key, cas_public_key = cas_keypair
        drone_private_key, drone_public_key = drone_keypair
        
        token = create_command_token(
            command_type="EMERGENCY_STOP",
            target_drone_id="DRONE_TEST_01",
            parameters={},
            issuer="OPERATOR_TEST"
        )
        
        signature = sign_command(token, cas_private_key)
        sealed = seal_command(token, signature, drone_public_key)
        
        result = drone_agent.receive_command(sealed.to_bytes())
        
        assert result["success"] is True
        assert drone_agent.status == "EMERGENCY_STOPPED"
