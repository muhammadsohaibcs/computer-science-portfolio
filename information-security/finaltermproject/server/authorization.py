"""
Authorization module for SDRCAS.
Implements policy-based authorization with role-based, drone state, and airspace policies.

Requirements: 4.1, 4.2, 4.3, 4.4
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Tuple, Dict, Any, Optional
import json
import os

from core.command_token import CommandToken
from server.identity import Identity


@dataclass
class AuthorizationResult:
    """
    Result of an authorization check.
    
    Attributes:
        authorized: Whether the command is authorized
        reason: Human-readable reason for the decision
        policy_name: Name of the policy that made the decision
    """
    authorized: bool
    reason: str
    policy_name: str


class Policy(ABC):
    """
    Abstract base class for authorization policies.
    
    All concrete policy classes must implement the evaluate method.
    """
    
    def __init__(self, name: str, config: Optional[Dict[str, Any]] = None):
        """
        Initialize a policy.
        
        Args:
            name: Name of the policy
            config: Optional configuration dictionary
        """
        self.name = name
        self.config = config or {}
    
    @abstractmethod
    def evaluate(
        self,
        operator: Identity,
        command: CommandToken,
        drone: Identity
    ) -> AuthorizationResult:
        """
        Evaluate whether a command should be authorized.
        
        Args:
            operator: Identity of the operator requesting the command
            command: CommandToken containing the command details
            drone: Identity of the target drone
            
        Returns:
            AuthorizationResult indicating whether the command is authorized
        """
        pass


class RolePolicy(Policy):
    """
    Role-based authorization policy.
    
    Checks if the operator has the required role to issue the command type.
    
    Requirements: 4.1
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize RolePolicy.
        
        Config format:
        {
            "command_role_requirements": {
                "MOVE": ["pilot", "admin"],
                "LAND": ["pilot", "admin"],
                "STATUS": ["pilot", "admin", "observer"],
                "EMERGENCY_STOP": ["admin"]
            }
        }
        """
        super().__init__("RolePolicy", config)
        self.command_role_requirements = self.config.get("command_role_requirements", {})
    
    def evaluate(
        self,
        operator: Identity,
        command: CommandToken,
        drone: Identity
    ) -> AuthorizationResult:
        """
        Check if operator has required role for the command type.
        
        Requirements: 4.1
        """
        command_type = command.command_type
        
        # Get required roles for this command type
        required_roles = self.command_role_requirements.get(command_type, [])
        
        # If no roles are specified, deny by default (fail-secure)
        if not required_roles:
            return AuthorizationResult(
                authorized=False,
                reason=f"No role requirements defined for command type: {command_type}",
                policy_name=self.name
            )
        
        # Check if operator has any of the required roles
        operator_roles = set(operator.roles)
        required_roles_set = set(required_roles)
        
        if operator_roles & required_roles_set:
            # Operator has at least one required role
            matching_roles = operator_roles & required_roles_set
            return AuthorizationResult(
                authorized=True,
                reason=f"Operator has required role(s): {', '.join(matching_roles)}",
                policy_name=self.name
            )
        else:
            return AuthorizationResult(
                authorized=False,
                reason=f"Operator lacks required role. Required: {required_roles}, Has: {operator.roles}",
                policy_name=self.name
            )


class DroneStatePolicy(Policy):
    """
    Drone state and capability-based authorization policy.
    
    Checks if the drone is in a valid state and has the capability to execute the command.
    
    Requirements: 4.2
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize DroneStatePolicy.
        
        Config format:
        {
            "allowed_statuses": ["active"],
            "capability_requirements": {
                "MOVE": ["navigation", "flight"],
                "LAND": ["flight"],
                "STATUS": [],
                "EMERGENCY_STOP": []
            }
        }
        """
        super().__init__("DroneStatePolicy", config)
        self.allowed_statuses = self.config.get("allowed_statuses", ["active"])
        self.capability_requirements = self.config.get("capability_requirements", {})
    
    def evaluate(
        self,
        operator: Identity,
        command: CommandToken,
        drone: Identity
    ) -> AuthorizationResult:
        """
        Check if drone state and capabilities allow command execution.
        
        Requirements: 4.2
        """
        # Check if drone status is allowed
        if drone.status not in self.allowed_statuses:
            return AuthorizationResult(
                authorized=False,
                reason=f"Drone status '{drone.status}' not allowed. Allowed: {self.allowed_statuses}",
                policy_name=self.name
            )
        
        # Check if drone has required capabilities
        command_type = command.command_type
        required_capabilities = self.capability_requirements.get(command_type, [])
        
        drone_capabilities = set(drone.capabilities)
        required_capabilities_set = set(required_capabilities)
        
        missing_capabilities = required_capabilities_set - drone_capabilities
        
        if missing_capabilities:
            return AuthorizationResult(
                authorized=False,
                reason=f"Drone lacks required capabilities: {', '.join(missing_capabilities)}",
                policy_name=self.name
            )
        
        # Check if drone is allowed to execute this command type
        if not drone.can_execute_command(command_type):
            return AuthorizationResult(
                authorized=False,
                reason=f"Drone not allowed to execute command type: {command_type}",
                policy_name=self.name
            )
        
        return AuthorizationResult(
            authorized=True,
            reason="Drone state and capabilities are valid",
            policy_name=self.name
        )


class AirspacePolicy(Policy):
    """
    Airspace and mission context-based authorization policy.
    
    Validates commands against airspace restrictions and mission parameters.
    
    Requirements: 4.3
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize AirspacePolicy.
        
        Config format:
        {
            "restricted_zones": [
                {
                    "name": "No-Fly Zone Alpha",
                    "coordinates": [[lat1, lon1], [lat2, lon2], ...],
                    "altitude_max": 500
                }
            ],
            "max_altitude": 1000,
            "max_speed": 50,
            "require_justification": ["MOVE", "EMERGENCY_STOP"]
        }
        """
        super().__init__("AirspacePolicy", config)
        self.restricted_zones = self.config.get("restricted_zones", [])
        self.max_altitude = self.config.get("max_altitude", 1000)
        self.max_speed = self.config.get("max_speed", 50)
        self.require_justification = self.config.get("require_justification", [])
    
    def evaluate(
        self,
        operator: Identity,
        command: CommandToken,
        drone: Identity
    ) -> AuthorizationResult:
        """
        Check if command complies with airspace policies.
        
        Requirements: 4.3
        """
        command_type = command.command_type
        parameters = command.parameters
        
        # Check altitude restrictions for MOVE commands
        if command_type == "MOVE":
            altitude = parameters.get("altitude")
            if altitude is not None and altitude > self.max_altitude:
                return AuthorizationResult(
                    authorized=False,
                    reason=f"Altitude {altitude}m exceeds maximum allowed {self.max_altitude}m",
                    policy_name=self.name
                )
            
            # Check speed restrictions
            speed = parameters.get("speed")
            if speed is not None and speed > self.max_speed:
                return AuthorizationResult(
                    authorized=False,
                    reason=f"Speed {speed}m/s exceeds maximum allowed {self.max_speed}m/s",
                    policy_name=self.name
                )
            
            # Check if coordinates are in restricted zones
            coordinates = parameters.get("coordinates")
            if coordinates:
                for zone in self.restricted_zones:
                    if self._is_in_restricted_zone(coordinates, zone):
                        return AuthorizationResult(
                            authorized=False,
                            reason=f"Target coordinates in restricted zone: {zone['name']}",
                            policy_name=self.name
                        )
        
        # Check if justification is required and provided
        if command_type in self.require_justification:
            justification = parameters.get("justification")
            if not justification or not isinstance(justification, str) or len(justification.strip()) == 0:
                return AuthorizationResult(
                    authorized=False,
                    reason=f"Command type {command_type} requires justification",
                    policy_name=self.name
                )
        
        return AuthorizationResult(
            authorized=True,
            reason="Command complies with airspace policies",
            policy_name=self.name
        )
    
    def _is_in_restricted_zone(
        self,
        coordinates: List[float],
        zone: Dict[str, Any]
    ) -> bool:
        """
        Check if coordinates are within a restricted zone.
        
        Simplified implementation - in production would use proper geospatial calculations.
        
        Args:
            coordinates: [latitude, longitude] to check
            zone: Restricted zone definition
            
        Returns:
            True if coordinates are in the restricted zone
        """
        # Simplified bounding box check
        # In production, use proper polygon containment algorithms
        zone_coords = zone.get("coordinates", [])
        if not zone_coords or len(coordinates) < 2:
            return False
        
        # Get bounding box
        lats = [coord[0] for coord in zone_coords]
        lons = [coord[1] for coord in zone_coords]
        
        min_lat, max_lat = min(lats), max(lats)
        min_lon, max_lon = min(lons), max(lons)
        
        lat, lon = coordinates[0], coordinates[1]
        
        return min_lat <= lat <= max_lat and min_lon <= lon <= max_lon


def load_policies(config_path: str = "config/policy_config.json") -> List[Policy]:
    """
    Load policies from a JSON configuration file.
    
    Args:
        config_path: Path to the policy configuration file
        
    Returns:
        List of Policy instances
        
    Requirements: 4.3
    """
    # Default policies if config doesn't exist
    if not os.path.exists(config_path):
        return [
            RolePolicy(),
            DroneStatePolicy(),
            AirspacePolicy()
        ]
    
    with open(config_path, 'r') as f:
        config = json.load(f)
    
    policies = []
    
    # Load RolePolicy
    if "role_policy" in config:
        policies.append(RolePolicy(config["role_policy"]))
    
    # Load DroneStatePolicy
    if "drone_state_policy" in config:
        policies.append(DroneStatePolicy(config["drone_state_policy"]))
    
    # Load AirspacePolicy
    if "airspace_policy" in config:
        policies.append(AirspacePolicy(config["airspace_policy"]))
    
    return policies


def check_authorization(
    operator: Identity,
    command: CommandToken,
    drone: Identity,
    policies: Optional[List[Policy]] = None
) -> Tuple[bool, str]:
    """
    Check if a command should be authorized based on all policies.
    
    All policies must approve for the command to be authorized.
    
    Args:
        operator: Identity of the operator requesting the command
        command: CommandToken containing the command details
        drone: Identity of the target drone
        policies: Optional list of policies to evaluate (default: load from config)
        
    Returns:
        Tuple of (authorized: bool, reason: str)
        
    Requirements: 4.1, 4.2, 4.3, 4.4
    """
    # Load policies if not provided
    if policies is None:
        policies = load_policies()
    
    # Check if operator is active
    if not operator.is_active():
        return False, f"Operator {operator.id} is not active (status: {operator.status})"
    
    # Check if drone is active
    if not drone.is_active():
        return False, f"Drone {drone.id} is not active (status: {drone.status})"
    
    # Evaluate all policies
    results = []
    for policy in policies:
        result = policy.evaluate(operator, command, drone)
        results.append(result)
        
        # If any policy denies, return immediately (fail-fast)
        if not result.authorized:
            return False, f"[{result.policy_name}] {result.reason}"
    
    # All policies approved
    approval_reasons = [f"[{r.policy_name}] {r.reason}" for r in results]
    return True, "All authorization checks passed: " + "; ".join(approval_reasons)
