"""
Tests for drone command executor module.
Tests command execution logic and parameter validation against capabilities.
"""

import pytest
from core.command_token import create_command_token
from drone.executor import CommandExecutor, ExecutionResult


@pytest.fixture
def executor():
    """Create a CommandExecutor with default capabilities."""
    return CommandExecutor(
        drone_id="DRONE_01",
        capabilities=["MOVE", "LAND", "STATUS", "EMERGENCY_STOP"]
    )


@pytest.fixture
def limited_executor():
    """Create a CommandExecutor with limited capabilities."""
    return CommandExecutor(
        drone_id="DRONE_02",
        capabilities=["STATUS", "LAND"]  # No MOVE or EMERGENCY_STOP
    )


class TestParameterValidation:
    """Tests for parameter validation."""
    
    def test_valid_move_parameters(self, executor):
        """Test that valid MOVE parameters are accepted."""
        is_valid, reason = executor.validate_parameters(
            "MOVE",
            {
                "coordinates": [33.6844, 73.0479],
                "altitude": 100,
                "speed": 15
            }
        )
        assert is_valid
        assert "valid" in reason.lower()
    
    def test_missing_required_parameter(self, executor):
        """Test that missing required parameters are rejected."""
        is_valid, reason = executor.validate_parameters(
            "MOVE",
            {
                "coordinates": [33.6844, 73.0479],
                "altitude": 100
                # Missing 'speed'
            }
        )
        assert not is_valid
        assert "missing" in reason.lower()
        assert "speed" in reason.lower()
    
    def test_unknown_parameter(self, executor):
        """Test that unknown parameters are rejected."""
        is_valid, reason = executor.validate_parameters(
            "MOVE",
            {
                "coordinates": [33.6844, 73.0479],
                "altitude": 100,
                "speed": 15,
                "unknown_param": "value"
            }
        )
        assert not is_valid
        assert "unknown" in reason.lower()
    
    def test_unsupported_command_type(self, limited_executor):
        """Test that unsupported command types are rejected."""
        is_valid, reason = limited_executor.validate_parameters(
            "MOVE",
            {"coordinates": [0, 0], "altitude": 100, "speed": 10}
        )
        assert not is_valid
        assert "not supported" in reason.lower()
    
    def test_invalid_coordinates_format(self, executor):
        """Test that invalid coordinate format is rejected."""
        is_valid, reason = executor.validate_parameters(
            "MOVE",
            {
                "coordinates": "invalid",  # Should be a list
                "altitude": 100,
                "speed": 15
            }
        )
        assert not is_valid
        assert "coordinates" in reason.lower()
    
    def test_invalid_latitude(self, executor):
        """Test that invalid latitude is rejected."""
        is_valid, reason = executor.validate_parameters(
            "MOVE",
            {
                "coordinates": [91, 0],  # Latitude > 90
                "altitude": 100,
                "speed": 15
            }
        )
        assert not is_valid
        assert "latitude" in reason.lower()
    
    def test_invalid_longitude(self, executor):
        """Test that invalid longitude is rejected."""
        is_valid, reason = executor.validate_parameters(
            "MOVE",
            {
                "coordinates": [0, 181],  # Longitude > 180
                "altitude": 100,
                "speed": 15
            }
        )
        assert not is_valid
        assert "longitude" in reason.lower()
    
    def test_negative_altitude(self, executor):
        """Test that negative altitude is rejected."""
        is_valid, reason = executor.validate_parameters(
            "MOVE",
            {
                "coordinates": [0, 0],
                "altitude": -10,  # Negative altitude
                "speed": 15
            }
        )
        assert not is_valid
        assert "altitude" in reason.lower()
    
    def test_excessive_altitude(self, executor):
        """Test that excessive altitude is rejected."""
        is_valid, reason = executor.validate_parameters(
            "MOVE",
            {
                "coordinates": [0, 0],
                "altitude": 15000,  # Too high
                "speed": 15
            }
        )
        assert not is_valid
        assert "altitude" in reason.lower()
    
    def test_negative_speed(self, executor):
        """Test that negative speed is rejected."""
        is_valid, reason = executor.validate_parameters(
            "MOVE",
            {
                "coordinates": [0, 0],
                "altitude": 100,
                "speed": -5  # Negative speed
            }
        )
        assert not is_valid
        assert "speed" in reason.lower()
    
    def test_excessive_speed(self, executor):
        """Test that excessive speed is rejected."""
        is_valid, reason = executor.validate_parameters(
            "MOVE",
            {
                "coordinates": [0, 0],
                "altitude": 100,
                "speed": 100  # Too fast
            }
        )
        assert not is_valid
        assert "speed" in reason.lower()
    
    def test_land_with_coordinates(self, executor):
        """Test that LAND with optional coordinates is valid."""
        is_valid, reason = executor.validate_parameters(
            "LAND",
            {"coordinates": [33.6844, 73.0479]}
        )
        assert is_valid
    
    def test_land_without_coordinates(self, executor):
        """Test that LAND without coordinates is valid."""
        is_valid, reason = executor.validate_parameters(
            "LAND",
            {}
        )
        assert is_valid
    
    def test_status_no_parameters(self, executor):
        """Test that STATUS with no parameters is valid."""
        is_valid, reason = executor.validate_parameters(
            "STATUS",
            {}
        )
        assert is_valid
    
    def test_emergency_stop_no_parameters(self, executor):
        """Test that EMERGENCY_STOP with no parameters is valid."""
        is_valid, reason = executor.validate_parameters(
            "EMERGENCY_STOP",
            {}
        )
        assert is_valid


class TestCommandExecution:
    """Tests for command execution."""
    
    def test_execute_move_command(self, executor):
        """Test executing a MOVE command."""
        token = create_command_token(
            command_type="MOVE",
            target_drone_id="DRONE_01",
            parameters={
                "coordinates": [33.6844, 73.0479],
                "altitude": 100,
                "speed": 15
            },
            issuer="OPERATOR_123"
        )
        
        result = executor.execute(token)
        
        assert isinstance(result, ExecutionResult)
        assert result.success
        assert result.command_type == "MOVE"
        assert "coordinates" in result.message.lower() or "moving" in result.message.lower()
        assert "target_coordinates" in result.details
        assert result.details["target_altitude"] == 100
        assert result.details["target_speed"] == 15
    
    def test_execute_land_command_with_coordinates(self, executor):
        """Test executing a LAND command with coordinates."""
        token = create_command_token(
            command_type="LAND",
            target_drone_id="DRONE_01",
            parameters={"coordinates": [33.6844, 73.0479]},
            issuer="OPERATOR_123"
        )
        
        result = executor.execute(token)
        
        assert result.success
        assert result.command_type == "LAND"
        assert "landing" in result.message.lower()
        assert "landing_coordinates" in result.details
    
    def test_execute_land_command_without_coordinates(self, executor):
        """Test executing a LAND command without coordinates."""
        token = create_command_token(
            command_type="LAND",
            target_drone_id="DRONE_01",
            parameters={},
            issuer="OPERATOR_123"
        )
        
        result = executor.execute(token)
        
        assert result.success
        assert result.command_type == "LAND"
        assert "landing" in result.message.lower()
    
    def test_execute_status_command(self, executor):
        """Test executing a STATUS command."""
        token = create_command_token(
            command_type="STATUS",
            target_drone_id="DRONE_01",
            parameters={},
            issuer="OPERATOR_123"
        )
        
        result = executor.execute(token)
        
        assert result.success
        assert result.command_type == "STATUS"
        assert "drone_id" in result.details
        assert result.details["drone_id"] == "DRONE_01"
        assert "status" in result.details
        assert "capabilities" in result.details
    
    def test_execute_emergency_stop_command(self, executor):
        """Test executing an EMERGENCY_STOP command."""
        token = create_command_token(
            command_type="EMERGENCY_STOP",
            target_drone_id="DRONE_01",
            parameters={},
            issuer="OPERATOR_123"
        )
        
        result = executor.execute(token)
        
        assert result.success
        assert result.command_type == "EMERGENCY_STOP"
        assert "emergency" in result.message.lower() or "stop" in result.message.lower()
        assert result.details["status"] == "emergency_stopped"
    
    def test_execute_with_invalid_parameters(self, executor):
        """Test that execution fails with invalid parameters."""
        token = create_command_token(
            command_type="MOVE",
            target_drone_id="DRONE_01",
            parameters={
                "coordinates": [0, 0],
                "altitude": -100,  # Invalid
                "speed": 15
            },
            issuer="OPERATOR_123"
        )
        
        result = executor.execute(token)
        
        assert not result.success
        assert "validation failed" in result.message.lower()
        assert "altitude" in result.details["error"].lower()
    
    def test_execute_unsupported_command(self, limited_executor):
        """Test that execution fails for unsupported command types."""
        token = create_command_token(
            command_type="MOVE",
            target_drone_id="DRONE_02",
            parameters={
                "coordinates": [0, 0],
                "altitude": 100,
                "speed": 15
            },
            issuer="OPERATOR_123"
        )
        
        result = limited_executor.execute(token)
        
        assert not result.success
        assert "not supported" in result.message.lower()


class TestCoordinateValidation:
    """Tests for coordinate validation edge cases."""
    
    def test_coordinates_with_three_elements(self, executor):
        """Test that coordinates with altitude are valid."""
        is_valid, reason = executor.validate_parameters(
            "MOVE",
            {
                "coordinates": [33.6844, 73.0479, 100],
                "altitude": 100,
                "speed": 15
            }
        )
        assert is_valid
    
    def test_coordinates_boundary_latitude(self, executor):
        """Test boundary values for latitude."""
        # Test -90 (valid)
        is_valid, _ = executor.validate_parameters(
            "MOVE",
            {"coordinates": [-90, 0], "altitude": 100, "speed": 15}
        )
        assert is_valid
        
        # Test 90 (valid)
        is_valid, _ = executor.validate_parameters(
            "MOVE",
            {"coordinates": [90, 0], "altitude": 100, "speed": 15}
        )
        assert is_valid
    
    def test_coordinates_boundary_longitude(self, executor):
        """Test boundary values for longitude."""
        # Test -180 (valid)
        is_valid, _ = executor.validate_parameters(
            "MOVE",
            {"coordinates": [0, -180], "altitude": 100, "speed": 15}
        )
        assert is_valid
        
        # Test 180 (valid)
        is_valid, _ = executor.validate_parameters(
            "MOVE",
            {"coordinates": [0, 180], "altitude": 100, "speed": 15}
        )
        assert is_valid
    
    def test_coordinates_zero_altitude(self, executor):
        """Test that zero altitude is valid."""
        is_valid, _ = executor.validate_parameters(
            "MOVE",
            {"coordinates": [0, 0], "altitude": 0, "speed": 15}
        )
        assert is_valid
    
    def test_coordinates_max_altitude(self, executor):
        """Test that maximum altitude is valid."""
        is_valid, _ = executor.validate_parameters(
            "MOVE",
            {"coordinates": [0, 0], "altitude": 10000, "speed": 15}
        )
        assert is_valid
