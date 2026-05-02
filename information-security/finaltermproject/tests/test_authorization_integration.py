"""
Integration tests for authorization module with real identity data.
Tests authorization flow with actual provisioned operators and drones.

Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
"""

import pytest

from server.authorization import check_authorization, load_policies
from server.identity import load_identity
from core.command_token import create_command_token


class TestAuthorizationIntegration:
    """Integration tests using real provisioned identities."""
    
    def test_pilot_can_move_drone(self):
        """Test that a real pilot can issue MOVE command to a real drone."""
        # Load real identities
        operator = load_identity("OPERATOR_PILOT_01")
        drone = load_identity("DRONE_01")
        
        assert operator is not None, "OPERATOR_PILOT_01 should exist"
        assert drone is not None, "DRONE_01 should exist"
        
        # Create a valid MOVE command
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
        
        # Check authorization
        authorized, reason = check_authorization(operator, command, drone)
        
        assert authorized, f"Authorization should succeed: {reason}"
        assert "all authorization checks passed" in reason.lower()
    
    def test_admin_can_emergency_stop(self):
        """Test that admin can issue EMERGENCY_STOP command."""
        # Load real identities
        operator = load_identity("OPERATOR_ADMIN")
        drone = load_identity("DRONE_01")
        
        assert operator is not None, "OPERATOR_ADMIN should exist"
        assert drone is not None, "DRONE_01 should exist"
        
        # Create EMERGENCY_STOP command with justification
        command = create_command_token(
            command_type="EMERGENCY_STOP",
            target_drone_id="DRONE_01",
            parameters={"justification": "Security threat detected"},
            issuer="OPERATOR_ADMIN"
        )
        
        # Check authorization
        authorized, reason = check_authorization(operator, command, drone)
        
        assert authorized, f"Authorization should succeed: {reason}"
    
    def test_observer_cannot_move_drone(self):
        """Test that observer cannot issue MOVE command."""
        # Load real identities
        operator = load_identity("OPERATOR_OBSERVER")
        drone = load_identity("DRONE_01")
        
        assert operator is not None, "OPERATOR_OBSERVER should exist"
        assert drone is not None, "DRONE_01 should exist"
        
        # Create a MOVE command
        command = create_command_token(
            command_type="MOVE",
            target_drone_id="DRONE_01",
            parameters={
                "coordinates": [33.6844, 73.0479],
                "altitude": 500
            },
            issuer="OPERATOR_OBSERVER"
        )
        
        # Check authorization
        authorized, reason = check_authorization(operator, command, drone)
        
        assert not authorized, "Observer should not be able to issue MOVE command"
        assert "role" in reason.lower()
    
    def test_observer_can_check_status(self):
        """Test that observer can issue STATUS command."""
        # Load real identities
        operator = load_identity("OPERATOR_OBSERVER")
        drone = load_identity("DRONE_01")
        
        assert operator is not None, "OPERATOR_OBSERVER should exist"
        assert drone is not None, "DRONE_01 should exist"
        
        # Create a STATUS command
        command = create_command_token(
            command_type="STATUS",
            target_drone_id="DRONE_01",
            parameters={},
            issuer="OPERATOR_OBSERVER"
        )
        
        # Check authorization
        authorized, reason = check_authorization(operator, command, drone)
        
        assert authorized, f"Observer should be able to check status: {reason}"
    
    def test_excessive_altitude_rejected(self):
        """Test that command with excessive altitude is rejected."""
        # Load real identities
        operator = load_identity("OPERATOR_PILOT_01")
        drone = load_identity("DRONE_01")
        
        # Create command with excessive altitude
        command = create_command_token(
            command_type="MOVE",
            target_drone_id="DRONE_01",
            parameters={
                "coordinates": [33.6844, 73.0479],
                "altitude": 2000,  # Exceeds max_altitude of 1000
                "speed": 30
            },
            issuer="OPERATOR_PILOT_01"
        )
        
        # Check authorization
        authorized, reason = check_authorization(operator, command, drone)
        
        assert not authorized, "Excessive altitude should be rejected"
        assert "altitude" in reason.lower()
    
    def test_restricted_zone_rejected(self):
        """Test that command targeting restricted zone is rejected."""
        # Load real identities
        operator = load_identity("OPERATOR_PILOT_01")
        drone = load_identity("DRONE_01")
        
        # Create command targeting restricted zone (from config)
        command = create_command_token(
            command_type="MOVE",
            target_drone_id="DRONE_01",
            parameters={
                "coordinates": [33.75, 73.15],  # Inside No-Fly Zone Alpha
                "altitude": 300,
                "speed": 30
            },
            issuer="OPERATOR_PILOT_01"
        )
        
        # Check authorization
        authorized, reason = check_authorization(operator, command, drone)
        
        assert not authorized, "Restricted zone should be rejected"
        assert "restricted zone" in reason.lower()
    
    def test_multiple_drones(self):
        """Test authorization with multiple different drones."""
        operator = load_identity("OPERATOR_PILOT_01")
        
        for drone_id in ["DRONE_01", "DRONE_02", "DRONE_03"]:
            drone = load_identity(drone_id)
            
            if drone is None:
                continue
            
            command = create_command_token(
                command_type="STATUS",
                target_drone_id=drone_id,
                parameters={},
                issuer="OPERATOR_PILOT_01"
            )
            
            authorized, reason = check_authorization(operator, command, drone)
            
            assert authorized, f"STATUS command should be authorized for {drone_id}: {reason}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
