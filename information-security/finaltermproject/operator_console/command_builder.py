"""
Command builder module for SDRCAS operator console.
Provides command request builders for different command types and validation.

Requirements: 3.1, 3.2, 3.3
"""

from typing import Dict, Any, Optional, Tuple
from dataclasses import dataclass

from core.constants import DEFAULT_COMMAND_VALIDITY


# Command schemas defining required and optional parameters for each command type
COMMAND_SCHEMAS = {
    "MOVE": {
        "required": ["coordinates", "altitude", "speed"],
        "optional": ["heading", "waypoints"],
        "validation": {
            "coordinates": lambda v: isinstance(v, (list, tuple)) and len(v) == 2 
                          and all(isinstance(x, (int, float)) for x in v)
                          and -90 <= v[0] <= 90 and -180 <= v[1] <= 180,
            "altitude": lambda v: isinstance(v, (int, float)) and 0 <= v <= 1000,
            "speed": lambda v: isinstance(v, (int, float)) and 0 < v <= 50,
            "heading": lambda v: isinstance(v, (int, float)) and 0 <= v < 360,
            "waypoints": lambda v: isinstance(v, list) and all(
                isinstance(wp, (list, tuple)) and len(wp) == 2 
                and all(isinstance(x, (int, float)) for x in wp)
                for wp in v
            )
        }
    },
    "LAND": {
        "required": [],
        "optional": ["coordinates", "emergency"],
        "validation": {
            "coordinates": lambda v: isinstance(v, (list, tuple)) and len(v) == 2 
                          and all(isinstance(x, (int, float)) for x in v)
                          and -90 <= v[0] <= 90 and -180 <= v[1] <= 180,
            "emergency": lambda v: isinstance(v, bool)
        }
    },
    "STATUS": {
        "required": [],
        "optional": ["detailed"],
        "validation": {
            "detailed": lambda v: isinstance(v, bool)
        }
    },
    "EMERGENCY_STOP": {
        "required": ["reason"],
        "optional": [],
        "validation": {
            "reason": lambda v: isinstance(v, str) and len(v) > 0
        }
    }
}


@dataclass
class ValidationResult:
    """
    Result of command validation.
    
    Attributes:
        valid: Whether the command is valid
        errors: List of validation error messages
    """
    valid: bool
    errors: list[str]
    
    def __bool__(self) -> bool:
        """Allow ValidationResult to be used in boolean context."""
        return self.valid


class CommandBuilder:
    """
    Builder for creating and validating command requests.
    
    Provides methods to create command requests for different command types
    (MOVE, LAND, STATUS, EMERGENCY_STOP) and validates them against schemas.
    
    Requirements: 3.1, 3.2
    """
    
    def __init__(self):
        """Initialize the CommandBuilder."""
        self.schemas = COMMAND_SCHEMAS
    
    def create_move_command(
        self,
        drone_id: str,
        coordinates: Tuple[float, float],
        altitude: float,
        speed: float,
        duration: Optional[int] = None,
        heading: Optional[float] = None,
        waypoints: Optional[list] = None,
        justification: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a MOVE command request.
        
        A MOVE command instructs the drone to navigate to specified coordinates
        at a given altitude and speed.
        
        Args:
            drone_id: Target drone identifier
            coordinates: (latitude, longitude) tuple in decimal degrees
            altitude: Target altitude in meters (0-1000)
            speed: Movement speed in m/s (0-50)
            duration: Command validity duration in seconds (default: DEFAULT_COMMAND_VALIDITY)
            heading: Optional heading in degrees (0-360)
            waypoints: Optional list of waypoint coordinates
            justification: Optional justification for the command
            
        Returns:
            Dictionary containing the command request
            
        Requirements: 3.1
        
        Property 8: Command request completeness
        For any submitted command request, the captured data should include
        command type, target drone, parameters, validity duration, and justification.
        """
        parameters = {
            "coordinates": list(coordinates),
            "altitude": altitude,
            "speed": speed
        }
        
        if heading is not None:
            parameters["heading"] = heading
        
        if waypoints is not None:
            parameters["waypoints"] = waypoints
        
        return self._build_command_request(
            command_type="MOVE",
            target_drone_id=drone_id,
            parameters=parameters,
            validity_duration=duration,
            justification=justification
        )
    
    def create_land_command(
        self,
        drone_id: str,
        duration: Optional[int] = None,
        coordinates: Optional[Tuple[float, float]] = None,
        emergency: bool = False,
        justification: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a LAND command request.
        
        A LAND command instructs the drone to land at its current location
        or at specified coordinates.
        
        Args:
            drone_id: Target drone identifier
            duration: Command validity duration in seconds (default: DEFAULT_COMMAND_VALIDITY)
            coordinates: Optional landing coordinates (latitude, longitude)
            emergency: Whether this is an emergency landing
            justification: Optional justification for the command
            
        Returns:
            Dictionary containing the command request
            
        Requirements: 3.1
        """
        parameters = {}
        
        if coordinates is not None:
            parameters["coordinates"] = list(coordinates)
        
        if emergency:
            parameters["emergency"] = emergency
        
        return self._build_command_request(
            command_type="LAND",
            target_drone_id=drone_id,
            parameters=parameters,
            validity_duration=duration,
            justification=justification
        )
    
    def create_status_command(
        self,
        drone_id: str,
        duration: Optional[int] = None,
        detailed: bool = False,
        justification: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a STATUS command request.
        
        A STATUS command requests the drone to report its current status,
        including position, battery, and operational state.
        
        Args:
            drone_id: Target drone identifier
            duration: Command validity duration in seconds (default: DEFAULT_COMMAND_VALIDITY)
            detailed: Whether to request detailed status information
            justification: Optional justification for the command
            
        Returns:
            Dictionary containing the command request
            
        Requirements: 3.1
        """
        parameters = {}
        
        if detailed:
            parameters["detailed"] = detailed
        
        return self._build_command_request(
            command_type="STATUS",
            target_drone_id=drone_id,
            parameters=parameters,
            validity_duration=duration,
            justification=justification
        )
    
    def create_emergency_stop_command(
        self,
        drone_id: str,
        reason: str,
        duration: Optional[int] = None,
        justification: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create an EMERGENCY_STOP command request.
        
        An EMERGENCY_STOP command immediately halts all drone operations
        and requires administrator privileges.
        
        Args:
            drone_id: Target drone identifier
            reason: Reason for the emergency stop (required)
            duration: Command validity duration in seconds (default: DEFAULT_COMMAND_VALIDITY)
            justification: Optional justification for the command
            
        Returns:
            Dictionary containing the command request
            
        Requirements: 3.1
        """
        parameters = {
            "reason": reason
        }
        
        return self._build_command_request(
            command_type="EMERGENCY_STOP",
            target_drone_id=drone_id,
            parameters=parameters,
            validity_duration=duration,
            justification=justification
        )
    
    def validate_command(self, command: Dict[str, Any]) -> ValidationResult:
        """
        Validate a command request against its schema.
        
        Validates that:
        1. All required fields are present (command_type, target_drone_id, parameters, validity_duration)
        2. Command type is valid
        3. All required parameters for the command type are present
        4. All parameters pass their validation rules
        5. No unknown parameters are present
        
        Args:
            command: Command request dictionary to validate
            
        Returns:
            ValidationResult with validation status and any error messages
            
        Requirements: 3.2, 3.3
        
        Property 9: Command schema validation
        For any command request, validation against the command schema should occur
        and malformed requests should be rejected with specific error messages.
        """
        errors = []
        
        # Validate required top-level fields
        required_fields = ["command_type", "target_drone_id", "parameters", "validity_duration"]
        for field in required_fields:
            if field not in command:
                errors.append(f"Missing required field: {field}")
        
        if errors:
            return ValidationResult(valid=False, errors=errors)
        
        # Validate command type
        command_type = command["command_type"]
        if command_type not in self.schemas:
            errors.append(
                f"Invalid command_type: {command_type}. "
                f"Must be one of {list(self.schemas.keys())}"
            )
            return ValidationResult(valid=False, errors=errors)
        
        # Validate target_drone_id
        target_drone_id = command["target_drone_id"]
        if not isinstance(target_drone_id, str) or not target_drone_id:
            errors.append("target_drone_id must be a non-empty string")
        
        # Validate validity_duration
        validity_duration = command["validity_duration"]
        if not isinstance(validity_duration, int) or validity_duration <= 0:
            errors.append("validity_duration must be a positive integer")
        
        # Validate parameters
        parameters = command["parameters"]
        if not isinstance(parameters, dict):
            errors.append("parameters must be a dictionary")
            return ValidationResult(valid=False, errors=errors)
        
        # Get schema for this command type
        schema = self.schemas[command_type]
        
        # Check required parameters
        for required_param in schema["required"]:
            if required_param not in parameters:
                errors.append(
                    f"Missing required parameter for {command_type}: {required_param}"
                )
        
        # Validate each parameter
        for param_name, param_value in parameters.items():
            # Check if parameter is known
            if param_name not in schema["validation"]:
                errors.append(
                    f"Unknown parameter for {command_type}: {param_name}"
                )
                continue
            
            # Validate parameter value
            validator = schema["validation"][param_name]
            if not validator(param_value):
                errors.append(
                    f"Invalid value for parameter {param_name}: {param_value}"
                )
        
        # Validate justification if present
        if "justification" in command:
            justification = command["justification"]
            if justification is not None and not isinstance(justification, str):
                errors.append("justification must be a string or None")
        
        return ValidationResult(valid=len(errors) == 0, errors=errors)
    
    def _build_command_request(
        self,
        command_type: str,
        target_drone_id: str,
        parameters: Dict[str, Any],
        validity_duration: Optional[int],
        justification: Optional[str]
    ) -> Dict[str, Any]:
        """
        Build a command request dictionary with all required fields.
        
        Args:
            command_type: Type of command
            target_drone_id: Target drone identifier
            parameters: Command parameters
            validity_duration: Command validity duration in seconds
            justification: Optional justification
            
        Returns:
            Complete command request dictionary
        """
        if validity_duration is None:
            validity_duration = DEFAULT_COMMAND_VALIDITY
        
        command_request = {
            "command_type": command_type,
            "target_drone_id": target_drone_id,
            "parameters": parameters,
            "validity_duration": validity_duration
        }
        
        if justification is not None:
            command_request["justification"] = justification
        
        return command_request
