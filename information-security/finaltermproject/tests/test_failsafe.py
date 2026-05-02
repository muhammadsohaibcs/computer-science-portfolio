"""
Tests for drone failsafe module.
Tests failsafe monitoring, mode switching, and security violation detection.

Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
"""

import pytest
import time

from drone.failsafe import (
    FailsafeMonitor,
    FailsafeMode,
    FailsafeConditions,
    FailsafeState
)
from core.time_utils import get_current_timestamp


class TestFailsafeMonitor:
    """Unit tests for FailsafeMonitor class."""
    
    def test_initialization(self):
        """Test FailsafeMonitor initialization."""
        monitor = FailsafeMonitor("DRONE_01")
        
        assert monitor.drone_id == "DRONE_01"
        assert monitor.state.mode == FailsafeMode.NORMAL
        assert monitor.state.invalid_command_count == 0
        assert monitor.state.security_violation_count == 0
        assert monitor.state.last_cas_communication > 0
        assert not monitor.is_in_failsafe()
    
    def test_initialization_with_custom_conditions(self):
        """Test FailsafeMonitor initialization with custom conditions."""
        conditions = FailsafeConditions(
            max_invalid_commands=3,
            communication_timeout=60,
            security_violation_threshold=2
        )
        monitor = FailsafeMonitor("DRONE_02", conditions=conditions)
        
        assert monitor.conditions.max_invalid_commands == 3
        assert monitor.conditions.communication_timeout == 60
        assert monitor.conditions.security_violation_threshold == 2
    
    def test_record_invalid_command(self):
        """Test recording invalid commands."""
        monitor = FailsafeMonitor("DRONE_01")
        
        monitor.record_invalid_command("Invalid signature")
        assert monitor.state.invalid_command_count == 1
        assert len(monitor.state.forensic_log) == 1
        assert monitor.state.forensic_log[0]["type"] == "invalid_command"
        assert monitor.state.forensic_log[0]["reason"] == "Invalid signature"
    
    def test_repeated_invalid_commands_trigger_defensive_mode(self):
        """Test that repeated invalid commands trigger defensive mode.
        
        Requirements: 10.1
        """
        conditions = FailsafeConditions(max_invalid_commands=3)
        monitor = FailsafeMonitor("DRONE_01", conditions=conditions)
        
        # Record invalid commands below threshold
        monitor.record_invalid_command("Invalid signature")
        monitor.record_invalid_command("Invalid nonce")
        assert monitor.state.mode == FailsafeMode.NORMAL
        
        # Third invalid command should trigger defensive mode
        monitor.record_invalid_command("Invalid target")
        assert monitor.state.mode == FailsafeMode.DEFENSIVE
        assert monitor.state.entered_failsafe_at is not None
    
    def test_record_security_violation(self):
        """Test recording security violations."""
        monitor = FailsafeMonitor("DRONE_01")
        
        details = {"attack_type": "replay", "source": "unknown"}
        monitor.record_security_violation("replay_attack", details)
        
        assert monitor.state.security_violation_count == 1
        assert len(monitor.state.forensic_log) == 1
        assert monitor.state.forensic_log[0]["type"] == "security_violation"
        assert monitor.state.forensic_log[0]["violation_type"] == "replay_attack"
    
    def test_security_violations_trigger_failsafe_mode(self):
        """Test that security violations trigger failsafe mode.
        
        Requirements: 10.1, 10.4
        """
        conditions = FailsafeConditions(security_violation_threshold=2)
        monitor = FailsafeMonitor("DRONE_01", conditions=conditions)
        
        # Record violations below threshold
        monitor.record_security_violation("replay_attack", {})
        assert monitor.state.mode == FailsafeMode.NORMAL
        
        # Second violation should trigger failsafe mode
        monitor.record_security_violation("signature_forgery", {})
        assert monitor.state.mode == FailsafeMode.FAILSAFE
        assert monitor.state.entered_failsafe_at is not None
    
    def test_record_cas_communication(self):
        """Test recording CAS communication updates timestamp.
        
        Requirements: 10.2
        """
        monitor = FailsafeMonitor("DRONE_01")
        
        initial_time = monitor.state.last_cas_communication
        time.sleep(1.1)  # Wait for timestamp to change (timestamps are in seconds)
        monitor.record_cas_communication()
        
        assert monitor.state.last_cas_communication > initial_time
    
    def test_check_conditions_communication_loss(self):
        """Test that communication loss triggers failsafe mode.
        
        Requirements: 10.2
        """
        conditions = FailsafeConditions(communication_timeout=1)
        monitor = FailsafeMonitor("DRONE_01", conditions=conditions)
        
        # Manually set last communication to past
        monitor.state.last_cas_communication = get_current_timestamp() - 2
        
        result = monitor.check_conditions()
        
        assert result is False
        assert monitor.state.mode == FailsafeMode.FAILSAFE
    
    def test_check_conditions_normal(self):
        """Test check_conditions returns True when all is normal."""
        monitor = FailsafeMonitor("DRONE_01")
        monitor.record_cas_communication()
        
        result = monitor.check_conditions()
        
        assert result is True
        assert monitor.state.mode == FailsafeMode.NORMAL
    
    def test_enter_failsafe_mode(self):
        """Test entering failsafe mode.
        
        Requirements: 10.1, 10.2, 10.3, 10.4
        """
        monitor = FailsafeMonitor("DRONE_01")
        
        monitor.enter_failsafe_mode("Test reason", FailsafeMode.FAILSAFE)
        
        assert monitor.state.mode == FailsafeMode.FAILSAFE
        assert monitor.state.entered_failsafe_at is not None
        assert any(log["type"] == "failsafe_mode_entered" for log in monitor.state.forensic_log)
    
    def test_enter_failsafe_mode_with_callback(self):
        """Test that entering failsafe mode triggers alert callback."""
        alerts = []
        
        def alert_callback(alert_type, details):
            alerts.append((alert_type, details))
        
        monitor = FailsafeMonitor("DRONE_01", alert_callback=alert_callback)
        monitor.enter_failsafe_mode("Test reason", FailsafeMode.DEFENSIVE)
        
        assert len(alerts) == 1
        assert alerts[0][0] == "FAILSAFE_MODE_ENTERED"
        assert alerts[0][1]["drone_id"] == "DRONE_01"
        assert alerts[0][1]["mode"] == "DEFENSIVE"
    
    def test_enter_failsafe_mode_rejects_normal(self):
        """Test that entering NORMAL mode via enter_failsafe_mode raises error."""
        monitor = FailsafeMonitor("DRONE_01")
        
        with pytest.raises(ValueError, match="Cannot enter NORMAL mode"):
            monitor.enter_failsafe_mode("Test", FailsafeMode.NORMAL)
    
    def test_exit_failsafe_mode(self):
        """Test exiting failsafe mode requires authorization.
        
        Requirements: 10.5
        """
        monitor = FailsafeMonitor("DRONE_01")
        monitor.enter_failsafe_mode("Test", FailsafeMode.FAILSAFE)
        
        result = monitor.exit_failsafe_mode("OPERATOR_ADMIN")
        
        assert result is True
        assert monitor.state.mode == FailsafeMode.NORMAL
        assert monitor.state.entered_failsafe_at is None
        assert monitor.state.invalid_command_count == 0
        assert monitor.state.security_violation_count == 0
    
    def test_exit_failsafe_mode_logs_authorization(self):
        """Test that exiting failsafe mode logs who authorized it."""
        monitor = FailsafeMonitor("DRONE_01")
        monitor.enter_failsafe_mode("Test", FailsafeMode.DEFENSIVE)
        
        monitor.exit_failsafe_mode("OPERATOR_123")
        
        exit_log = [log for log in monitor.state.forensic_log if log["type"] == "failsafe_mode_exited"]
        assert len(exit_log) == 1
        assert exit_log[0]["authorized_by"] == "OPERATOR_123"
    
    def test_exit_failsafe_mode_with_callback(self):
        """Test that exiting failsafe mode triggers alert callback."""
        alerts = []
        
        def alert_callback(alert_type, details):
            alerts.append((alert_type, details))
        
        monitor = FailsafeMonitor("DRONE_01", alert_callback=alert_callback)
        monitor.enter_failsafe_mode("Test", FailsafeMode.FAILSAFE)
        alerts.clear()  # Clear the enter alert
        
        monitor.exit_failsafe_mode("OPERATOR_ADMIN")
        
        assert len(alerts) == 1
        assert alerts[0][0] == "FAILSAFE_MODE_EXITED"
        assert alerts[0][1]["authorized_by"] == "OPERATOR_ADMIN"
    
    def test_exit_failsafe_mode_when_already_normal(self):
        """Test exiting failsafe mode when already in normal mode."""
        monitor = FailsafeMonitor("DRONE_01")
        
        result = monitor.exit_failsafe_mode("OPERATOR_ADMIN")
        
        assert result is True
        assert monitor.state.mode == FailsafeMode.NORMAL
    
    def test_is_in_failsafe(self):
        """Test is_in_failsafe detection.
        
        Requirements: 10.3
        """
        monitor = FailsafeMonitor("DRONE_01")
        
        assert not monitor.is_in_failsafe()
        
        monitor.enter_failsafe_mode("Test", FailsafeMode.DEFENSIVE)
        assert monitor.is_in_failsafe()
        
        monitor.exit_failsafe_mode("OPERATOR_ADMIN")
        assert not monitor.is_in_failsafe()
    
    def test_should_reject_command_normal_mode(self):
        """Test command rejection in normal mode.
        
        Requirements: 10.3
        """
        monitor = FailsafeMonitor("DRONE_01")
        
        should_reject, reason = monitor.should_reject_command("MOVE")
        
        assert should_reject is False
        assert "Normal mode" in reason
    
    def test_should_reject_command_defensive_mode(self):
        """Test command rejection in defensive mode.
        
        Requirements: 10.3
        """
        monitor = FailsafeMonitor("DRONE_01")
        monitor.enter_failsafe_mode("Test", FailsafeMode.DEFENSIVE)
        
        should_reject, reason = monitor.should_reject_command("MOVE")
        
        assert should_reject is True
        assert "defensive mode" in reason
    
    def test_should_reject_command_failsafe_mode(self):
        """Test command rejection in failsafe mode.
        
        Requirements: 10.3
        """
        monitor = FailsafeMonitor("DRONE_01")
        monitor.enter_failsafe_mode("Test", FailsafeMode.FAILSAFE)
        
        should_reject, reason = monitor.should_reject_command("MOVE")
        
        assert should_reject is True
        assert "failsafe mode" in reason
    
    def test_should_accept_emergency_override_in_failsafe(self):
        """Test that emergency override commands are accepted in failsafe mode.
        
        Requirements: 10.3
        """
        monitor = FailsafeMonitor("DRONE_01")
        monitor.enter_failsafe_mode("Test", FailsafeMode.FAILSAFE)
        
        should_reject, reason = monitor.should_reject_command(
            "EMERGENCY_LAND",
            is_emergency_override=True
        )
        
        assert should_reject is False
        assert "Emergency override accepted" in reason
    
    def test_get_forensic_log(self):
        """Test retrieving forensic log.
        
        Requirements: 10.4
        """
        monitor = FailsafeMonitor("DRONE_01")
        
        monitor.record_invalid_command("Test 1")
        monitor.record_security_violation("test_violation", {"detail": "test"})
        
        log = monitor.get_forensic_log()
        
        assert len(log) == 2
        assert log[0]["type"] == "invalid_command"
        assert log[1]["type"] == "security_violation"
        
        # Verify it's a copy
        log.append({"test": "data"})
        assert len(monitor.state.forensic_log) == 2
    
    def test_get_state_summary(self):
        """Test getting state summary."""
        monitor = FailsafeMonitor("DRONE_01")
        monitor.record_invalid_command("Test")
        
        summary = monitor.get_state_summary()
        
        assert summary["drone_id"] == "DRONE_01"
        assert summary["mode"] == "NORMAL"
        assert summary["invalid_command_count"] == 1
        assert summary["security_violation_count"] == 0
        assert summary["is_in_failsafe"] is False
        assert "time_since_last_comm" in summary
        assert "forensic_events_count" in summary


class TestFailsafeIntegration:
    """Integration tests for failsafe scenarios."""
    
    def test_full_failsafe_cycle(self):
        """Test complete failsafe cycle: normal -> failsafe -> normal.
        
        Requirements: 10.1, 10.2, 10.3, 10.5
        """
        alerts = []
        
        def alert_callback(alert_type, details):
            alerts.append((alert_type, details))
        
        conditions = FailsafeConditions(
            max_invalid_commands=2,
            communication_timeout=1,
            security_violation_threshold=2
        )
        monitor = FailsafeMonitor("DRONE_01", conditions=conditions, alert_callback=alert_callback)
        
        # Start in normal mode
        assert monitor.state.mode == FailsafeMode.NORMAL
        should_reject, _ = monitor.should_reject_command("MOVE")
        assert not should_reject
        
        # Trigger failsafe via invalid commands
        monitor.record_invalid_command("Invalid 1")
        monitor.record_invalid_command("Invalid 2")
        
        # Should now be in defensive mode
        assert monitor.state.mode == FailsafeMode.DEFENSIVE
        should_reject, _ = monitor.should_reject_command("MOVE")
        assert should_reject
        
        # Emergency override should still work
        should_reject, _ = monitor.should_reject_command("EMERGENCY_LAND", is_emergency_override=True)
        assert not should_reject
        
        # Exit failsafe with authorization
        monitor.exit_failsafe_mode("OPERATOR_ADMIN")
        assert monitor.state.mode == FailsafeMode.NORMAL
        
        # Verify alerts were sent
        assert len(alerts) == 2  # Enter and exit
        assert alerts[0][0] == "FAILSAFE_MODE_ENTERED"
        assert alerts[1][0] == "FAILSAFE_MODE_EXITED"
    
    def test_forensic_logging_throughout_lifecycle(self):
        """Test that forensic information is logged throughout failsafe lifecycle.
        
        Requirements: 10.4
        """
        monitor = FailsafeMonitor("DRONE_01")
        
        # Record various events
        monitor.record_invalid_command("Invalid signature")
        monitor.record_security_violation("replay_attack", {"source": "unknown"})
        monitor.enter_failsafe_mode("Manual trigger", FailsafeMode.FAILSAFE)
        monitor.exit_failsafe_mode("OPERATOR_ADMIN")
        
        log = monitor.get_forensic_log()
        
        # Verify all events are logged
        assert len(log) == 4
        assert log[0]["type"] == "invalid_command"
        assert log[1]["type"] == "security_violation"
        assert log[2]["type"] == "failsafe_mode_entered"
        assert log[3]["type"] == "failsafe_mode_exited"
        
        # Verify timestamps are present
        for entry in log:
            assert "timestamp" in entry
            assert entry["timestamp"] > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
