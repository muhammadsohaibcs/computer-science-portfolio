"""
Drone command executor module for SDRCAS.
Implements command execution logic with parameter validation against capabilities.

Requirements: 8.2, 8.4
"""

from typing import Dict, Any, Optional, List
from dataclasses import dataclass
import json
from pathlib import Path

from core.command_token import CommandToken


@dataclass
class ExecutionResult:
    """
    Result of command execution.
    
    Attributes:
        success: Whether the command executed successfully
        command_type: Type of command that was executed
        message: Human-readable message about execution
        details: Additional execution details
    """
    success: bool
    command_type: str
    message: str
    details: Dict[str, Any]


class CommandExecutor:
    """
    Executes verified commands on the drone.
    Validates parameters against drone capabilities before execution.
    """
    
    def __init__(self, drone_id: str, capabilities: Optional[List[str]] = None):
        """
        Initialize the CommandExecutor.
        
        Args:
            drone_id: Identifier of this drone
            capabilities: List of capabilities this drone supports
                         If None, loads from drone data file
        """
        self.drone_id = drone_id
        
        # Load capabilities if not provided
        if capabilities is None:
            self.capabilities = self._load_capabilities()
        else:
            self.capabilities = capabilities
        
        # Define parameter constraints for each command type
        self._parameter_constraints = {
            "MOVE": {
                "required": ["coordinates", "altitude", "speed"],
                "optional": [],
                "validators": {
                    "coordinates": self._validate_coordinates,
                    "altitude": self._validate_altitude,
                    "speed": self._validate_speed
                }
            },
            "LAND": {
                "required": [],
                "optional": ["coordinates"],
                "validators": {
                    "coordinates": self._validate_coordinates
                }
            },
            "STATUS": {
                "required": [],
                "optional": [],
                "validators": {}
            },
            "EMERGENCY_STOP": {
                "required": [],
                "optional": [],
                "validators": {}
            }
        }
    
    def _load_capabilities(self) -> List[str]:
        """
        Load drone capabilities from data file.
        
        Returns:
            List of capability strings
        """
        drone_file = Path(f"data/cas/drones/{self.drone_id}.json")
        
        if not drone_file.exists():
            # Return default capabilities if file doesn't exist
            return ["MOVE", "LAND", "STATUS", "EMERGENCY_STOP"]
        
        try:
            with open(drone_file, 'r') as f:
                drone_data = json.load(f)
                return drone_data.get("capabilities", [])
        except Exception:
            # Return default capabilities on error
            return ["MOVE", "LAND", "STATUS", "EMERGENCY_STOP"]
    
    def validate_parameters(
        self,
        command_type: str,
        parameters: Dict[str, Any]
    ) -> tuple[bool, str]:
        """
        Validate command parameters against drone capabilities and constraints.
        
        Args:
            command_type: Type of command to validate
            parameters: Command parameters to validate
            
        Returns:
            Tuple of (is_valid, reason) where:
            - is_valid: True if parameters are valid, False otherwise
            - reason: Description of validation result or failure reason
            
        Requirements: 8.2
        """
        # Check if command type is supported by this drone
        if command_type not in self.capabilities:
            return False, f"Command type {command_type} not supported by this drone"
        
        # Get parameter constraints for this command type
        if command_type not in self._parameter_constraints:
            return False, f"Unknown command type: {command_type}"
        
        constraints = self._parameter_constraints[command_type]
        
        # Check required parameters are present
        for required_param in constraints["required"]:
            if required_param not in parameters:
                return False, f"Missing required parameter: {required_param}"
        
        # Validate each parameter using its validator
        for param_name, param_value in parameters.items():
            # Check if parameter is allowed
            if param_name not in constraints["required"] and \
               param_name not in constraints["optional"]:
                return False, f"Unknown parameter: {param_name}"
            
            # Run validator if one exists
            if param_name in constraints["validators"]:
                validator = constraints["validators"][param_name]
                is_valid, reason = validator(param_value)
                if not is_valid:
                    return False, f"Invalid {param_name}: {reason}"
        
        return True, "Parameters valid"
    
    def _validate_coordinates(self, coordinates: Any) -> tuple[bool, str]:
        """
        Validate coordinates parameter.
        
        Args:
            coordinates: Coordinates to validate (should be [lat, lon] or [lat, lon, alt])
            
        Returns:
            Tuple of (is_valid, reason)
        """
        if not isinstance(coordinates, (list, tuple)):
            return False, "coordinates must be a list or tuple"
        
        if len(coordinates) < 2 or len(coordinates) > 3:
            return False, "coordinates must have 2 or 3 elements [lat, lon] or [lat, lon, alt]"
        
        # Validate latitude
        lat = coordinates[0]
        if not isinstance(lat, (int, float)):
            return False, "latitude must be a number"
        if lat < -90 or lat > 90:
            return False, "latitude must be between -90 and 90"
        
        # Validate longitude
        lon = coordinates[1]
        if not isinstance(lon, (int, float)):
            return False, "longitude must be a number"
        if lon < -180 or lon > 180:
            return False, "longitude must be between -180 and 180"
        
        # Validate altitude if present
        if len(coordinates) == 3:
            alt = coordinates[2]
            if not isinstance(alt, (int, float)):
                return False, "altitude in coordinates must be a number"
            if alt < 0 or alt > 10000:
                return False, "altitude in coordinates must be between 0 and 10000 meters"
        
        return True, "Valid coordinates"
    
    def _validate_altitude(self, altitude: Any) -> tuple[bool, str]:
        """
        Validate altitude parameter.
        
        Args:
            altitude: Altitude to validate (in meters)
            
        Returns:
            Tuple of (is_valid, reason)
        """
        if not isinstance(altitude, (int, float)):
            return False, "altitude must be a number"
        
        if altitude < 0:
            return False, "altitude must be non-negative"
        
        if altitude > 10000:
            return False, "altitude exceeds maximum allowed (10000 meters)"
        
        return True, "Valid altitude"
    
    def _validate_speed(self, speed: Any) -> tuple[bool, str]:
        """
        Validate speed parameter.
        
        Args:
            speed: Speed to validate (in m/s)
            
        Returns:
            Tuple of (is_valid, reason)
        """
        if not isinstance(speed, (int, float)):
            return False, "speed must be a number"
        
        if speed < 0:
            return False, "speed must be non-negative"
        
        if speed > 50:
            return False, "speed exceeds maximum allowed (50 m/s)"
        
        return True, "Valid speed"
    
    def execute(self, token: CommandToken) -> ExecutionResult:
        """
        Execute a verified command token.
        
        Args:
            token: The verified CommandToken to execute
            
        Returns:
            ExecutionResult containing execution status and details
            
        Requirements: 8.2, 8.4
        """
        # Validate parameters first
        is_valid, reason = self.validate_parameters(
            token.command_type,
            token.parameters
        )
        
        if not is_valid:
            return ExecutionResult(
                success=False,
                command_type=token.command_type,
                message=f"Parameter validation failed: {reason}",
                details={"error": reason}
            )
        
        # Execute the appropriate command handler
        if token.command_type == "MOVE":
            return self._execute_move(token)
        elif token.command_type == "LAND":
            return self._execute_land(token)
        elif token.command_type == "STATUS":
            return self._execute_status(token)
        elif token.command_type == "EMERGENCY_STOP":
            return self._execute_emergency_stop(token)
        else:
            return ExecutionResult(
                success=False,
                command_type=token.command_type,
                message=f"Unknown command type: {token.command_type}",
                details={"error": "Unknown command type"}
            )
    
    def _execute_move(self, token: CommandToken) -> ExecutionResult:
        """
        Execute a MOVE command.
        
        Args:
            token: CommandToken with MOVE command
            
        Returns:
            ExecutionResult
        """
        params = token.parameters
        coordinates = params["coordinates"]
        altitude = params["altitude"]
        speed = params["speed"]
        
        # In a real implementation, this would interface with the drone's
        # flight controller to execute the movement
        # For now, we simulate successful execution
        
        return ExecutionResult(
            success=True,
            command_type="MOVE",
            message=f"Moving to coordinates {coordinates} at altitude {altitude}m with speed {speed}m/s",
            details={
                "target_coordinates": coordinates,
                "target_altitude": altitude,
                "target_speed": speed,
                "status": "executing"
            }
        )
    
    def _execute_land(self, token: CommandToken) -> ExecutionResult:
        """
        Execute a LAND command.
        
        Args:
            token: CommandToken with LAND command
            
        Returns:
            ExecutionResult
        """
        params = token.parameters
        coordinates = params.get("coordinates")
        
        # In a real implementation, this would interface with the drone's
        # flight controller to execute landing
        
        if coordinates:
            message = f"Landing at coordinates {coordinates}"
            details = {"landing_coordinates": coordinates, "status": "landing"}
        else:
            message = "Landing at current position"
            details = {"status": "landing"}
        
        return ExecutionResult(
            success=True,
            command_type="LAND",
            message=message,
            details=details
        )
    
    def _execute_status(self, token: CommandToken) -> ExecutionResult:
        """
        Execute a STATUS command.
        
        Args:
            token: CommandToken with STATUS command
            
        Returns:
            ExecutionResult with current drone status
        """
        # In a real implementation, this would query the drone's
        # actual status from various subsystems
        
        return ExecutionResult(
            success=True,
            command_type="STATUS",
            message="Status report generated",
            details={
                "drone_id": self.drone_id,
                "status": "operational",
                "battery": 85,
                "position": [0.0, 0.0, 0.0],
                "capabilities": self.capabilities
            }
        )
    
    def _execute_emergency_stop(self, token: CommandToken) -> ExecutionResult:
        """
        Execute an EMERGENCY_STOP command.
        
        Args:
            token: CommandToken with EMERGENCY_STOP command
            
        Returns:
            ExecutionResult
        """
        # In a real implementation, this would immediately halt all
        # drone operations and enter a safe hover or landing mode
        
        return ExecutionResult(
            success=True,
            command_type="EMERGENCY_STOP",
            message="Emergency stop executed - all operations halted",
            details={
                "status": "emergency_stopped",
                "timestamp": token.issued_at
            }
        )
