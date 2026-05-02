"""
Unit tests for operator command_builder module.
Tests command creation and validation for different command types.

Requirements: 3.1, 3.2, 3.3
"""

import os
import sys
import pytest

# Add parent directory to path to import from local modules
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)

# Import from our local operator_console package (not the built-in operator module)
import importlib.util
spec = importlib.util.spec_from_file_location("operator_console.command_builder", 
                                               os.path.join(parent_dir, "operator_console", "command_builder.py"))
command_builder_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(command_builder_module)

CommandBuilder = command_builder_module.CommandBuilder
ValidationResult = command_builder_module.ValidationResult
COMMAND_SCHEMAS = command_builder_module.COMMAND_SCHEMAS

from core.constants import DEFAULT_COMMAND_VALIDITY


class TestCommandBuilder:
    """Test cases for CommandBuilder."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.builder = CommandBuilder()
    
    def test_create_move_command(self):
        """Test creating a MOVE command request.
        
        Requirements: 3.1
        Property 8: Command request completeness
        """
        command = self.builder.create_move_command(
            drone_id="DRONE_01",
            coordinates=(33.6844, 73.0479),
            altitude=100,
            speed=15,
            duration=10,
            heading=90,
            justification="Test flight"
        )
        
        assert command["command_type"] == "MOVE"
        assert command["target_drone_id"] == "DRONE_01"
        assert command["parameters"]["coordinates"] == [33.6844, 73.0479]
        assert command["parameters"]["altitude"] == 100
        assert command["parameters"]["speed"] == 15
        assert command["parameters"]["heading"] == 90
        assert command["validity_duration"] == 10
        assert command["justification"] == "Test flight"
    
    def test_create_move_command_with_defaults(self):
        """Test creating a MOVE command with default values."""
        command = self.builder.create_move_command(
            drone_id="DRONE_02",
            coordinates=(40.7128, -74.0060),
            altitude=50,
            speed=10
        )
        
        assert command["command_type"] == "MOVE"
        assert command["target_drone_id"] == "DRONE_02"
        assert command["validity_duration"] == DEFAULT_COMMAND_VALIDITY
        assert "justification" not in command
        assert "heading" not in command["parameters"]
    
    def test_create_move_command_with_waypoints(self):
        """Test creating a MOVE command with waypoints."""
        waypoints = [(33.7, 73.1), (33.8, 73.2)]
        command = self.builder.create_move_command(
            drone_id="DRONE_01",
            coordinates=(33.6844, 73.0479),
            altitude=100,
            speed=15,
            waypoints=waypoints
        )
        
        assert command["parameters"]["waypoints"] == waypoints
    
    def test_create_land_command(self):
        """Test creating a LAND command request.
        
        Requirements: 3.1
        """
        command = self.builder.create_land_command(
            drone_id="DRONE_01",
            duration=5,
            coordinates=(33.6844, 73.0479),
            emergency=True,
            justification="Emergency landing"
        )
        
        assert command["command_type"] == "LAND"
        assert command["target_drone_id"] == "DRONE_01"
        assert command["parameters"]["coordinates"] == [33.6844, 73.0479]
        assert command["parameters"]["emergency"] is True
        assert command["validity_duration"] == 5
        assert command["justification"] == "Emergency landing"
    
    def test_create_land_command_minimal(self):
        """Test creating a minimal LAND command."""
        command = self.builder.create_land_command(drone_id="DRONE_02")
        
        assert command["command_type"] == "LAND"
        assert command["target_drone_id"] == "DRONE_02"
        assert command["parameters"] == {}
        assert command["validity_duration"] == DEFAULT_COMMAND_VALIDITY
    
    def test_create_status_command(self):
        """Test creating a STATUS command request.
        
        Requirements: 3.1
        """
        command = self.builder.create_status_command(
            drone_id="DRONE_01",
            duration=3,
            detailed=True,
            justification="Health check"
        )
        
        assert command["command_type"] == "STATUS"
        assert command["target_drone_id"] == "DRONE_01"
        assert command["parameters"]["detailed"] is True
        assert command["validity_duration"] == 3
        assert command["justification"] == "Health check"
    
    def test_create_status_command_minimal(self):
        """Test creating a minimal STATUS command."""
        command = self.builder.create_status_command(drone_id="DRONE_03")
        
        assert command["command_type"] == "STATUS"
        assert command["target_drone_id"] == "DRONE_03"
        assert command["parameters"] == {}
    
    def test_create_emergency_stop_command(self):
        """Test creating an EMERGENCY_STOP command request.
        
        Requirements: 3.1
        """
        command = self.builder.create_emergency_stop_command(
            drone_id="DRONE_01",
            reason="Security threat detected",
            duration=2,
            justification="Immediate halt required"
        )
        
        assert command["command_type"] == "EMERGENCY_STOP"
        assert command["target_drone_id"] == "DRONE_01"
        assert command["parameters"]["reason"] == "Security threat detected"
        assert command["validity_duration"] == 2
        assert command["justification"] == "Immediate halt required"


class TestCommandValidation:
    """Test cases for command validation.
    
    Requirements: 3.2, 3.3
    Property 9: Command schema validation
    """
    
    def setup_method(self):
        """Set up test fixtures."""
        self.builder = CommandBuilder()
    
    def test_validate_valid_move_command(self):
        """Test validation of a valid MOVE command."""
        command = {
            "command_type": "MOVE",
            "target_drone_id": "DRONE_01",
            "parameters": {
                "coordinates": [33.6844, 73.0479],
                "altitude": 100,
                "speed": 15
            },
            "validity_duration": 10
        }
        
        result = self.builder.validate_command(command)
        assert result.valid is True
        assert len(result.errors) == 0
    
    def test_validate_valid_land_command(self):
        """Test validation of a valid LAND command."""
        command = {
            "command_type": "LAND",
            "target_drone_id": "DRONE_01",
            "parameters": {},
            "validity_duration": 5
        }
        
        result = self.builder.validate_command(command)
        assert result.valid is True
        assert len(result.errors) == 0
    
    def test_validate_valid_status_command(self):
        """Test validation of a valid STATUS command."""
        command = {
            "command_type": "STATUS",
            "target_drone_id": "DRONE_01",
            "parameters": {"detailed": True},
            "validity_duration": 3
        }
        
        result = self.builder.validate_command(command)
        assert result.valid is True
        assert len(result.errors) == 0
    
    def test_validate_valid_emergency_stop_command(self):
        """Test validation of a valid EMERGENCY_STOP command."""
        command = {
            "command_type": "EMERGENCY_STOP",
            "target_drone_id": "DRONE_01",
            "parameters": {"reason": "Security threat"},
            "validity_duration": 2
        }
        
        result = self.builder.validate_command(command)
        assert result.valid is True
        assert len(result.errors) == 0
    
    def test_validate_missing_command_type(self):
        """Test validation fails when command_type is missing.
        
        Requirements: 3.3
        Property 9: Malformed requests should be rejected with specific error messages
        """
        command = {
            "target_drone_id": "DRONE_01",
            "parameters": {},
            "validity_duration": 5
        }
        
        result = self.builder.validate_command(command)
        assert result.valid is False
        assert any("command_type" in error for error in result.errors)
    
    def test_validate_missing_target_drone_id(self):
        """Test validation fails when target_drone_id is missing."""
        command = {
            "command_type": "LAND",
            "parameters": {},
            "validity_duration": 5
        }
        
        result = self.builder.validate_command(command)
        assert result.valid is False
        assert any("target_drone_id" in error for error in result.errors)
    
    def test_validate_missing_parameters(self):
        """Test validation fails when parameters is missing."""
        command = {
            "command_type": "LAND",
            "target_drone_id": "DRONE_01",
            "validity_duration": 5
        }
        
        result = self.builder.validate_command(command)
        assert result.valid is False
        assert any("parameters" in error for error in result.errors)
    
    def test_validate_missing_validity_duration(self):
        """Test validation fails when validity_duration is missing."""
        command = {
            "command_type": "LAND",
            "target_drone_id": "DRONE_01",
            "parameters": {}
        }
        
        result = self.builder.validate_command(command)
        assert result.valid is False
        assert any("validity_duration" in error for error in result.errors)
    
    def test_validate_invalid_command_type(self):
        """Test validation fails for invalid command type."""
        command = {
            "command_type": "INVALID_COMMAND",
            "target_drone_id": "DRONE_01",
            "parameters": {},
            "validity_duration": 5
        }
        
        result = self.builder.validate_command(command)
        assert result.valid is False
        assert any("Invalid command_type" in error for error in result.errors)
    
    def test_validate_empty_target_drone_id(self):
        """Test validation fails for empty target_drone_id."""
        command = {
            "command_type": "LAND",
            "target_drone_id": "",
            "parameters": {},
            "validity_duration": 5
        }
        
        result = self.builder.validate_command(command)
        assert result.valid is False
        assert any("target_drone_id" in error for error in result.errors)
    
    def test_validate_invalid_validity_duration(self):
        """Test validation fails for invalid validity_duration."""
        command = {
            "command_type": "LAND",
            "target_drone_id": "DRONE_01",
            "parameters": {},
            "validity_duration": -5
        }
        
        result = self.builder.validate_command(command)
        assert result.valid is False
        assert any("validity_duration" in error for error in result.errors)
    
    def test_validate_missing_required_parameter(self):
        """Test validation fails when required parameter is missing."""
        command = {
            "command_type": "MOVE",
            "target_drone_id": "DRONE_01",
            "parameters": {
                "coordinates": [33.6844, 73.0479],
                "altitude": 100
                # Missing required "speed" parameter
            },
            "validity_duration": 10
        }
        
        result = self.builder.validate_command(command)
        assert result.valid is False
        assert any("speed" in error for error in result.errors)
    
    def test_validate_invalid_parameter_value(self):
        """Test validation fails for invalid parameter value."""
        command = {
            "command_type": "MOVE",
            "target_drone_id": "DRONE_01",
            "parameters": {
                "coordinates": [33.6844, 73.0479],
                "altitude": 2000,  # Exceeds max altitude of 1000
                "speed": 15
            },
            "validity_duration": 10
        }
        
        result = self.builder.validate_command(command)
        assert result.valid is False
        assert any("altitude" in error for error in result.errors)
    
    def test_validate_unknown_parameter(self):
        """Test validation fails for unknown parameter."""
        command = {
            "command_type": "LAND",
            "target_drone_id": "DRONE_01",
            "parameters": {
                "unknown_param": "value"
            },
            "validity_duration": 5
        }
        
        result = self.builder.validate_command(command)
        assert result.valid is False
        assert any("Unknown parameter" in error for error in result.errors)
    
    def test_validate_invalid_coordinates(self):
        """Test validation fails for invalid coordinates."""
        # Test invalid latitude
        command = {
            "command_type": "MOVE",
            "target_drone_id": "DRONE_01",
            "parameters": {
                "coordinates": [100, 73.0479],  # Invalid latitude > 90
                "altitude": 100,
                "speed": 15
            },
            "validity_duration": 10
        }
        
        result = self.builder.validate_command(command)
        assert result.valid is False
        assert any("coordinates" in error for error in result.errors)
    
    def test_validate_invalid_speed(self):
        """Test validation fails for invalid speed."""
        command = {
            "command_type": "MOVE",
            "target_drone_id": "DRONE_01",
            "parameters": {
                "coordinates": [33.6844, 73.0479],
                "altitude": 100,
                "speed": 100  # Exceeds max speed of 50
            },
            "validity_duration": 10
        }
        
        result = self.builder.validate_command(command)
        assert result.valid is False
        assert any("speed" in error for error in result.errors)
    
    def test_validate_emergency_stop_missing_reason(self):
        """Test validation fails for EMERGENCY_STOP without reason."""
        command = {
            "command_type": "EMERGENCY_STOP",
            "target_drone_id": "DRONE_01",
            "parameters": {},
            "validity_duration": 2
        }
        
        result = self.builder.validate_command(command)
        assert result.valid is False
        assert any("reason" in error for error in result.errors)
    
    def test_validation_result_boolean_context(self):
        """Test that ValidationResult can be used in boolean context."""
        valid_result = ValidationResult(valid=True, errors=[])
        invalid_result = ValidationResult(valid=False, errors=["error"])
        
        assert bool(valid_result) is True
        assert bool(invalid_result) is False
    
    def test_validate_command_with_justification(self):
        """Test validation accepts valid justification."""
        command = {
            "command_type": "LAND",
            "target_drone_id": "DRONE_01",
            "parameters": {},
            "validity_duration": 5,
            "justification": "Routine maintenance"
        }
        
        result = self.builder.validate_command(command)
        assert result.valid is True
    
    def test_validate_command_with_invalid_justification(self):
        """Test validation fails for invalid justification type."""
        command = {
            "command_type": "LAND",
            "target_drone_id": "DRONE_01",
            "parameters": {},
            "validity_duration": 5,
            "justification": 123  # Should be string
        }
        
        result = self.builder.validate_command(command)
        assert result.valid is False
        assert any("justification" in error for error in result.errors)


class TestCommandSchemas:
    """Test cases for command schemas."""
    
    def test_all_command_types_have_schemas(self):
        """Test that all command types have defined schemas."""
        expected_types = ["MOVE", "LAND", "STATUS", "EMERGENCY_STOP"]
        
        for cmd_type in expected_types:
            assert cmd_type in COMMAND_SCHEMAS
            assert "required" in COMMAND_SCHEMAS[cmd_type]
            assert "optional" in COMMAND_SCHEMAS[cmd_type]
            assert "validation" in COMMAND_SCHEMAS[cmd_type]
    
    def test_move_schema_structure(self):
        """Test MOVE command schema structure."""
        schema = COMMAND_SCHEMAS["MOVE"]
        
        assert "coordinates" in schema["required"]
        assert "altitude" in schema["required"]
        assert "speed" in schema["required"]
        assert "heading" in schema["optional"]
        assert "waypoints" in schema["optional"]
    
    def test_land_schema_structure(self):
        """Test LAND command schema structure."""
        schema = COMMAND_SCHEMAS["LAND"]
        
        assert len(schema["required"]) == 0
        assert "coordinates" in schema["optional"]
        assert "emergency" in schema["optional"]
    
    def test_status_schema_structure(self):
        """Test STATUS command schema structure."""
        schema = COMMAND_SCHEMAS["STATUS"]
        
        assert len(schema["required"]) == 0
        assert "detailed" in schema["optional"]
    
    def test_emergency_stop_schema_structure(self):
        """Test EMERGENCY_STOP command schema structure."""
        schema = COMMAND_SCHEMAS["EMERGENCY_STOP"]
        
        assert "reason" in schema["required"]
        assert len(schema["optional"]) == 0
