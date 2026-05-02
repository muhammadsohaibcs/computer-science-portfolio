"""
Unit tests for server authorization module.
Tests policy evaluation, role-based authorization, drone state checks, and airspace policies.

Requirements: 4.1, 4.2, 4.3, 4.4
"""

import pytest
import tempfile
import json
import os

from server.authorization import (
    Policy,
    RolePolicy,
    DroneStatePolicy,
    AirspacePolicy,
    AuthorizationResult,
    load_policies,
    check_authorization
)
from server.identity import Identity
from core.command_token import create_command_token
from core.authentication import generate_keypair


class TestRolePolicy:
    """Test cases for RolePolicy."""
    
    def setup_method(self):
        """Set up test fixtures."""
        # Create test identities
        _, operator_pubkey = generate_keypair()
        _, drone_pubkey = generate_keypair()
        
        self.pilot_operator = Identity(
            id="OPERATOR_PILOT_01",
            public_key=operator_pubkey,
            roles=["pilot"],
            capabilities=[],
            allowed_commands=["MOVE", "LAND", "STATUS"],
            status="active",
            entity_type="operator"
        )
        
        self.admin_operator = Identity(
            id="OPERATOR_ADMIN",
            public_key=operator_pubkey,
            roles=["admin"],
            capabilities=[],
            allowed_commands=["MOVE", "LAND", "STATUS", "EMERGENCY_STOP"],
            status="active",
            entity_type="operator"
        )
        
        self.observer_operator = Identity(
            id="OPERATOR_OBSERVER",
            public_key=operator_pubkey,
            roles=["observer"],
            capabilities=[],
            allowed_commands=["STATUS"],
            status="active",
            entity_type="operator"
        )
        
        self.test_drone = Identity(
            id="DRONE_01",
            public_key=drone_pubkey,
            roles=[],
            capabilities=["navigation", "flight"],
            allowed_commands=["MOVE", "LAND", "STATUS", "EMERGENCY_STOP"],
            status="active",
            entity_type="drone"
        )
        
        # Create policy with test configuration
        self.policy = RolePolicy({
            "command_role_requirements": {
                "MOVE": ["pilot", "admin"],
                "LAND": ["pilot", "admin"],
                "STATUS": ["pilot", "admin", "observer"],
                "EMERGENCY_STOP": ["admin"]
            }
        })
    
    def test_pilot_can_issue_move_command(self):
        """Test that pilot can issue MOVE command."""
        command = create_command_token(
            command_type="MOVE",
            target_drone_id="DRONE_01",
            parameters={"coordinates": [33.6844, 73.0479], "altitude": 100},
            issuer="OPERATOR_PILOT_01"
        )
        
        result = self.policy.evaluate(self.pilot_operator, command, self.test_drone)
        
        assert result.authorized
        assert "pilot" in result.reason.lower()
    
    def test_admin_can_issue_emergency_stop(self):
        """Test that admin can issue EMERGENCY_STOP command."""
        command = create_command_token(
            command_type="EMERGENCY_STOP",
            target_drone_id="DRONE_01",
            parameters={},
            issuer="OPERATOR_ADMIN"
        )
        
        result = self.policy.evaluate(self.admin_operator, command, self.test_drone)
        
        assert result.authorized
        assert "admin" in result.reason.lower()
    
    def test_pilot_cannot_issue_emergency_stop(self):
        """Test that pilot cannot issue EMERGENCY_STOP command."""
        command = create_command_token(
            command_type="EMERGENCY_STOP",
            target_drone_id="DRONE_01",
            parameters={},
            issuer="OPERATOR_PILOT_01"
        )
        
        result = self.policy.evaluate(self.pilot_operator, command, self.test_drone)
        
        assert not result.authorized
        assert "lacks required role" in result.reason.lower()
    
    def test_observer_can_issue_status_command(self):
        """Test that observer can issue STATUS command."""
        command = create_command_token(
            command_type="STATUS",
            target_drone_id="DRONE_01",
            parameters={},
            issuer="OPERATOR_OBSERVER"
        )
        
        result = self.policy.evaluate(self.observer_operator, command, self.test_drone)
        
        assert result.authorized
        assert "observer" in result.reason.lower()
    
    def test_observer_cannot_issue_move_command(self):
        """Test that observer cannot issue MOVE command."""
        command = create_command_token(
            command_type="MOVE",
            target_drone_id="DRONE_01",
            parameters={"coordinates": [33.6844, 73.0479]},
            issuer="OPERATOR_OBSERVER"
        )
        
        result = self.policy.evaluate(self.observer_operator, command, self.test_drone)
        
        assert not result.authorized
        assert "lacks required role" in result.reason.lower()


class TestDroneStatePolicy:
    """Test cases for DroneStatePolicy."""
    
    def setup_method(self):
        """Set up test fixtures."""
        _, operator_pubkey = generate_keypair()
        _, drone_pubkey = generate_keypair()
        
        self.operator = Identity(
            id="OPERATOR_PILOT_01",
            public_key=operator_pubkey,
            roles=["pilot"],
            capabilities=[],
            allowed_commands=["MOVE", "LAND", "STATUS"],
            status="active",
            entity_type="operator"
        )
        
        self.active_drone = Identity(
            id="DRONE_01",
            public_key=drone_pubkey,
            roles=[],
            capabilities=["navigation", "flight"],
            allowed_commands=["MOVE", "LAND", "STATUS"],
            status="active",
            entity_type="drone"
        )
        
        self.suspended_drone = Identity(
            id="DRONE_02",
            public_key=drone_pubkey,
            roles=[],
            capabilities=["navigation", "flight"],
            allowed_commands=["MOVE", "LAND", "STATUS"],
            status="suspended",
            entity_type="drone"
        )
        
        self.limited_drone = Identity(
            id="DRONE_03",
            public_key=drone_pubkey,
            roles=[],
            capabilities=["flight"],  # Missing navigation capability
            allowed_commands=["LAND", "STATUS"],
            status="active",
            entity_type="drone"
        )
        
        # Create policy with test configuration
        self.policy = DroneStatePolicy({
            "allowed_statuses": ["active"],
            "capability_requirements": {
                "MOVE": ["navigation", "flight"],
                "LAND": ["flight"],
                "STATUS": [],
                "EMERGENCY_STOP": []
            }
        })
    
    def test_active_drone_with_capabilities_allowed(self):
        """Test that active drone with required capabilities is allowed."""
        command = create_command_token(
            command_type="MOVE",
            target_drone_id="DRONE_01",
            parameters={"coordinates": [33.6844, 73.0479]},
            issuer="OPERATOR_PILOT_01"
        )
        
        result = self.policy.evaluate(self.operator, command, self.active_drone)
        
        assert result.authorized
        assert "valid" in result.reason.lower()
    
    def test_suspended_drone_rejected(self):
        """Test that suspended drone is rejected."""
        command = create_command_token(
            command_type="MOVE",
            target_drone_id="DRONE_02",
            parameters={"coordinates": [33.6844, 73.0479]},
            issuer="OPERATOR_PILOT_01"
        )
        
        result = self.policy.evaluate(self.operator, command, self.suspended_drone)
        
        assert not result.authorized
        assert "suspended" in result.reason.lower()
    
    def test_drone_missing_capability_rejected(self):
        """Test that drone missing required capability is rejected."""
        command = create_command_token(
            command_type="MOVE",
            target_drone_id="DRONE_03",
            parameters={"coordinates": [33.6844, 73.0479]},
            issuer="OPERATOR_PILOT_01"
        )
        
        result = self.policy.evaluate(self.operator, command, self.limited_drone)
        
        assert not result.authorized
        assert "lacks required capabilities" in result.reason.lower()
        assert "navigation" in result.reason.lower()
    
    def test_drone_not_allowed_command_type(self):
        """Test that drone not allowed to execute command type is rejected."""
        command = create_command_token(
            command_type="MOVE",
            target_drone_id="DRONE_03",
            parameters={"coordinates": [33.6844, 73.0479]},
            issuer="OPERATOR_PILOT_01"
        )
        
        result = self.policy.evaluate(self.operator, command, self.limited_drone)
        
        assert not result.authorized
    
    def test_status_command_no_capability_required(self):
        """Test that STATUS command requires no special capabilities."""
        command = create_command_token(
            command_type="STATUS",
            target_drone_id="DRONE_03",
            parameters={},
            issuer="OPERATOR_PILOT_01"
        )
        
        # Even limited drone should be able to handle STATUS
        limited_drone_with_status = Identity(
            id="DRONE_03",
            public_key=self.limited_drone.public_key,
            roles=[],
            capabilities=["flight"],
            allowed_commands=["STATUS"],
            status="active",
            entity_type="drone"
        )
        
        result = self.policy.evaluate(self.operator, command, limited_drone_with_status)
        
        assert result.authorized


class TestAirspacePolicy:
    """Test cases for AirspacePolicy."""
    
    def setup_method(self):
        """Set up test fixtures."""
        _, operator_pubkey = generate_keypair()
        _, drone_pubkey = generate_keypair()
        
        self.operator = Identity(
            id="OPERATOR_PILOT_01",
            public_key=operator_pubkey,
            roles=["pilot"],
            capabilities=[],
            allowed_commands=["MOVE", "LAND", "STATUS", "EMERGENCY_STOP"],
            status="active",
            entity_type="operator"
        )
        
        self.drone = Identity(
            id="DRONE_01",
            public_key=drone_pubkey,
            roles=[],
            capabilities=["navigation", "flight"],
            allowed_commands=["MOVE", "LAND", "STATUS", "EMERGENCY_STOP"],
            status="active",
            entity_type="drone"
        )
        
        # Create policy with test configuration
        self.policy = AirspacePolicy({
            "restricted_zones": [
                {
                    "name": "No-Fly Zone Alpha",
                    "coordinates": [[33.7, 73.1], [33.8, 73.1], [33.8, 73.2], [33.7, 73.2]],
                    "altitude_max": 500
                }
            ],
            "max_altitude": 1000,
            "max_speed": 50,
            "require_justification": ["EMERGENCY_STOP"]
        })
    
    def test_valid_move_command_allowed(self):
        """Test that valid MOVE command within limits is allowed."""
        command = create_command_token(
            command_type="MOVE",
            target_drone_id="DRONE_01",
            parameters={
                "coordinates": [33.6844, 73.0479],
                "altitude": 500,
                "speed": 30
            },
            issuer="OPERATOR_PILOT_01"
        )
        
        result = self.policy.evaluate(self.operator, command, self.drone)
        
        assert result.authorized
        assert "complies" in result.reason.lower()
    
    def test_excessive_altitude_rejected(self):
        """Test that command with excessive altitude is rejected."""
        command = create_command_token(
            command_type="MOVE",
            target_drone_id="DRONE_01",
            parameters={
                "coordinates": [33.6844, 73.0479],
                "altitude": 1500,  # Exceeds max_altitude of 1000
                "speed": 30
            },
            issuer="OPERATOR_PILOT_01"
        )
        
        result = self.policy.evaluate(self.operator, command, self.drone)
        
        assert not result.authorized
        assert "altitude" in result.reason.lower()
        assert "exceeds" in result.reason.lower()
    
    def test_excessive_speed_rejected(self):
        """Test that command with excessive speed is rejected."""
        command = create_command_token(
            command_type="MOVE",
            target_drone_id="DRONE_01",
            parameters={
                "coordinates": [33.6844, 73.0479],
                "altitude": 500,
                "speed": 100  # Exceeds max_speed of 50
            },
            issuer="OPERATOR_PILOT_01"
        )
        
        result = self.policy.evaluate(self.operator, command, self.drone)
        
        assert not result.authorized
        assert "speed" in result.reason.lower()
        assert "exceeds" in result.reason.lower()
    
    def test_restricted_zone_rejected(self):
        """Test that command targeting restricted zone is rejected."""
        command = create_command_token(
            command_type="MOVE",
            target_drone_id="DRONE_01",
            parameters={
                "coordinates": [33.75, 73.15],  # Inside restricted zone
                "altitude": 300,
                "speed": 30
            },
            issuer="OPERATOR_PILOT_01"
        )
        
        result = self.policy.evaluate(self.operator, command, self.drone)
        
        assert not result.authorized
        assert "restricted zone" in result.reason.lower()
    
    def test_emergency_stop_without_justification_rejected(self):
        """Test that EMERGENCY_STOP without justification is rejected."""
        command = create_command_token(
            command_type="EMERGENCY_STOP",
            target_drone_id="DRONE_01",
            parameters={},
            issuer="OPERATOR_PILOT_01"
        )
        
        result = self.policy.evaluate(self.operator, command, self.drone)
        
        assert not result.authorized
        assert "justification" in result.reason.lower()
    
    def test_emergency_stop_with_justification_allowed(self):
        """Test that EMERGENCY_STOP with justification is allowed."""
        command = create_command_token(
            command_type="EMERGENCY_STOP",
            target_drone_id="DRONE_01",
            parameters={"justification": "Drone malfunction detected"},
            issuer="OPERATOR_PILOT_01"
        )
        
        result = self.policy.evaluate(self.operator, command, self.drone)
        
        assert result.authorized
    
    def test_status_command_always_allowed(self):
        """Test that STATUS command is always allowed by airspace policy."""
        command = create_command_token(
            command_type="STATUS",
            target_drone_id="DRONE_01",
            parameters={},
            issuer="OPERATOR_PILOT_01"
        )
        
        result = self.policy.evaluate(self.operator, command, self.drone)
        
        assert result.authorized


class TestCheckAuthorization:
    """Test cases for the check_authorization function."""
    
    def setup_method(self):
        """Set up test fixtures."""
        _, operator_pubkey = generate_keypair()
        _, drone_pubkey = generate_keypair()
        
        self.pilot_operator = Identity(
            id="OPERATOR_PILOT_01",
            public_key=operator_pubkey,
            roles=["pilot"],
            capabilities=[],
            allowed_commands=["MOVE", "LAND", "STATUS"],
            status="active",
            entity_type="operator"
        )
        
        self.inactive_operator = Identity(
            id="OPERATOR_INACTIVE",
            public_key=operator_pubkey,
            roles=["pilot"],
            capabilities=[],
            allowed_commands=["MOVE", "LAND", "STATUS"],
            status="suspended",
            entity_type="operator"
        )
        
        self.active_drone = Identity(
            id="DRONE_01",
            public_key=drone_pubkey,
            roles=[],
            capabilities=["navigation", "flight"],
            allowed_commands=["MOVE", "LAND", "STATUS"],
            status="active",
            entity_type="drone"
        )
        
        self.inactive_drone = Identity(
            id="DRONE_INACTIVE",
            public_key=drone_pubkey,
            roles=[],
            capabilities=["navigation", "flight"],
            allowed_commands=["MOVE", "LAND", "STATUS"],
            status="revoked",
            entity_type="drone"
        )
        
        # Create test policies
        self.policies = [
            RolePolicy({
                "command_role_requirements": {
                    "MOVE": ["pilot", "admin"],
                    "LAND": ["pilot", "admin"],
                    "STATUS": ["pilot", "admin", "observer"]
                }
            }),
            DroneStatePolicy({
                "allowed_statuses": ["active"],
                "capability_requirements": {
                    "MOVE": ["navigation", "flight"],
                    "LAND": ["flight"],
                    "STATUS": []
                }
            }),
            AirspacePolicy({
                "max_altitude": 1000,
                "max_speed": 50,
                "restricted_zones": []
            })
        ]
    
    def test_valid_command_authorized(self):
        """Test that valid command passing all policies is authorized."""
        command = create_command_token(
            command_type="MOVE",
            target_drone_id="DRONE_01",
            parameters={
                "coordinates": [33.6844, 73.0479],
                "altitude": 500,
                "speed": 30
            },
            issuer="OPERATOR_PILOT_01"
        )
        
        authorized, reason = check_authorization(
            self.pilot_operator,
            command,
            self.active_drone,
            self.policies
        )
        
        assert authorized
        assert "all authorization checks passed" in reason.lower()
    
    def test_inactive_operator_rejected(self):
        """Test that inactive operator is rejected."""
        command = create_command_token(
            command_type="MOVE",
            target_drone_id="DRONE_01",
            parameters={"coordinates": [33.6844, 73.0479]},
            issuer="OPERATOR_INACTIVE"
        )
        
        authorized, reason = check_authorization(
            self.inactive_operator,
            command,
            self.active_drone,
            self.policies
        )
        
        assert not authorized
        assert "not active" in reason.lower()
    
    def test_inactive_drone_rejected(self):
        """Test that inactive drone is rejected."""
        command = create_command_token(
            command_type="MOVE",
            target_drone_id="DRONE_INACTIVE",
            parameters={"coordinates": [33.6844, 73.0479]},
            issuer="OPERATOR_PILOT_01"
        )
        
        authorized, reason = check_authorization(
            self.pilot_operator,
            command,
            self.inactive_drone,
            self.policies
        )
        
        assert not authorized
        assert "not active" in reason.lower()
    
    def test_policy_failure_returns_reason(self):
        """Test that policy failure returns specific reason."""
        # Command with excessive altitude
        command = create_command_token(
            command_type="MOVE",
            target_drone_id="DRONE_01",
            parameters={
                "coordinates": [33.6844, 73.0479],
                "altitude": 2000,  # Exceeds limit
                "speed": 30
            },
            issuer="OPERATOR_PILOT_01"
        )
        
        authorized, reason = check_authorization(
            self.pilot_operator,
            command,
            self.active_drone,
            self.policies
        )
        
        assert not authorized
        assert "airspacepolicy" in reason.lower()
        assert "altitude" in reason.lower()


class TestLoadPolicies:
    """Test cases for loading policies from configuration."""
    
    def test_load_policies_from_config(self):
        """Test loading policies from a configuration file."""
        # Use the default config file
        policies = load_policies("config/policy_config.json")
        
        assert len(policies) > 0
        assert any(isinstance(p, RolePolicy) for p in policies)
        assert any(isinstance(p, DroneStatePolicy) for p in policies)
        assert any(isinstance(p, AirspacePolicy) for p in policies)
    
    def test_load_policies_with_missing_config(self):
        """Test loading policies when config file doesn't exist."""
        policies = load_policies("nonexistent_config.json")
        
        # Should return default policies
        assert len(policies) == 3
        assert any(isinstance(p, RolePolicy) for p in policies)
        assert any(isinstance(p, DroneStatePolicy) for p in policies)
        assert any(isinstance(p, AirspacePolicy) for p in policies)
    
    def test_load_policies_with_custom_config(self):
        """Test loading policies from a custom configuration."""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            config = {
                "role_policy": {
                    "command_role_requirements": {
                        "MOVE": ["admin"]
                    }
                },
                "drone_state_policy": {
                    "allowed_statuses": ["active", "testing"]
                },
                "airspace_policy": {
                    "max_altitude": 500
                }
            }
            json.dump(config, f)
            config_path = f.name
        
        try:
            policies = load_policies(config_path)
            
            assert len(policies) == 3
            
            # Verify RolePolicy loaded custom config
            role_policy = next(p for p in policies if isinstance(p, RolePolicy))
            assert "MOVE" in role_policy.command_role_requirements
            assert role_policy.command_role_requirements["MOVE"] == ["admin"]
            
            # Verify DroneStatePolicy loaded custom config
            drone_policy = next(p for p in policies if isinstance(p, DroneStatePolicy))
            assert "testing" in drone_policy.allowed_statuses
            
            # Verify AirspacePolicy loaded custom config
            airspace_policy = next(p for p in policies if isinstance(p, AirspacePolicy))
            assert airspace_policy.max_altitude == 500
        finally:
            os.unlink(config_path)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
