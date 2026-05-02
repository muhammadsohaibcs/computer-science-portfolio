"""
Drone failsafe module for SDRCAS.
Implements failsafe monitoring and mode switching to ensure the drone enters
a safe state if security violations or anomalies are detected.

Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
"""

from typing import Optional, Callable, Dict, Any
from dataclasses import dataclass
from enum import Enum

from core.time_utils import get_current_timestamp


class FailsafeMode(Enum):
    """Failsafe operating modes."""
    NORMAL = "NORMAL"
    DEFENSIVE = "DEFENSIVE"
    FAILSAFE = "FAILSAFE"


@dataclass
class FailsafeConditions:
    """
    Configuration for failsafe trigger conditions.
    
    Attributes:
        max_invalid_commands: Maximum number of invalid commands before entering defensive mode
        communication_timeout: Seconds without CAS communication before entering failsafe
        security_violation_threshold: Number of security violations before entering failsafe
    """
    max_invalid_commands: int = 5
    communication_timeout: int = 30  # seconds
    security_violation_threshold: int = 3


@dataclass
class FailsafeState:
    """
    Current state of the failsafe monitor.
    
    Attributes:
        mode: Current failsafe mode
        invalid_command_count: Count of invalid commands received
        last_cas_communication: Timestamp of last successful CAS communication
        security_violation_count: Count of security violations detected
        entered_failsafe_at: Timestamp when failsafe mode was entered (None if not in failsafe)
        forensic_log: List of forensic information about security violations
    """
    mode: FailsafeMode = FailsafeMode.NORMAL
    invalid_command_count: int = 0
    last_cas_communication: int = 0
    security_violation_count: int = 0
    entered_failsafe_at: Optional[int] = None
    forensic_log: list = None
    
    def __post_init__(self):
        if self.forensic_log is None:
            self.forensic_log = []


class FailsafeMonitor:
    """
    Monitors drone conditions and manages failsafe mode transitions.
    Tracks invalid commands, communication loss, and security violations.
    """
    
    def __init__(
        self,
        drone_id: str,
        conditions: Optional[FailsafeConditions] = None,
        alert_callback: Optional[Callable[[str, Dict[str, Any]], None]] = None
    ):
        """
        Initialize the FailsafeMonitor.
        
        Args:
            drone_id: Identifier of this drone
            conditions: Failsafe trigger conditions (uses defaults if None)
            alert_callback: Optional callback function to alert CAS
                           Called with (alert_type, details) when failsafe events occur
        """
        self.drone_id = drone_id
        self.conditions = conditions or FailsafeConditions()
        self.alert_callback = alert_callback
        self.state = FailsafeState()
        
        # Initialize last communication timestamp
        self.state.last_cas_communication = get_current_timestamp()
    
    def record_invalid_command(self, reason: str) -> None:
        """
        Record an invalid command attempt.
        
        Args:
            reason: Reason why the command was invalid
            
        Requirements: 10.1
        """
        self.state.invalid_command_count += 1
        
        # Log forensic information
        forensic_info = {
            "timestamp": get_current_timestamp(),
            "type": "invalid_command",
            "reason": reason,
            "count": self.state.invalid_command_count
        }
        self.state.forensic_log.append(forensic_info)
        
        # Check if we should enter defensive mode
        if self.state.invalid_command_count >= self.conditions.max_invalid_commands:
            if self.state.mode == FailsafeMode.NORMAL:
                self.enter_failsafe_mode(
                    reason=f"Repeated invalid commands detected ({self.state.invalid_command_count})",
                    mode=FailsafeMode.DEFENSIVE
                )
    
    def record_security_violation(self, violation_type: str, details: Dict[str, Any]) -> None:
        """
        Record a security violation.
        
        Args:
            violation_type: Type of security violation
            details: Additional details about the violation
            
        Requirements: 10.1, 10.4
        """
        self.state.security_violation_count += 1
        
        # Log detailed forensic information
        forensic_info = {
            "timestamp": get_current_timestamp(),
            "type": "security_violation",
            "violation_type": violation_type,
            "details": details,
            "count": self.state.security_violation_count
        }
        self.state.forensic_log.append(forensic_info)
        
        # Check if we should enter failsafe mode
        if self.state.security_violation_count >= self.conditions.security_violation_threshold:
            self.enter_failsafe_mode(
                reason=f"Security violation threshold exceeded ({self.state.security_violation_count})",
                mode=FailsafeMode.FAILSAFE
            )
    
    def record_cas_communication(self) -> None:
        """
        Record successful communication with CAS.
        Updates the last communication timestamp.
        
        Requirements: 10.2
        """
        self.state.last_cas_communication = get_current_timestamp()
    
    def check_conditions(self) -> bool:
        """
        Check all failsafe conditions and trigger failsafe mode if necessary.
        Should be called periodically to monitor communication loss.
        
        Returns:
            True if all conditions are normal, False if failsafe triggered
            
        Requirements: 10.1, 10.2
        """
        current_time = get_current_timestamp()
        
        # Check for communication loss
        time_since_last_comm = current_time - self.state.last_cas_communication
        if time_since_last_comm > self.conditions.communication_timeout:
            if self.state.mode != FailsafeMode.FAILSAFE:
                self.enter_failsafe_mode(
                    reason=f"Communication loss detected ({time_since_last_comm}s since last contact)",
                    mode=FailsafeMode.FAILSAFE
                )
                return False
        
        # Return True if in normal mode, False otherwise
        return self.state.mode == FailsafeMode.NORMAL
    
    def enter_failsafe_mode(self, reason: str, mode: FailsafeMode = FailsafeMode.FAILSAFE) -> None:
        """
        Enter failsafe or defensive mode.
        
        Args:
            reason: Reason for entering failsafe mode
            mode: The failsafe mode to enter (DEFENSIVE or FAILSAFE)
            
        Requirements: 10.1, 10.2, 10.3, 10.4
        """
        if mode == FailsafeMode.NORMAL:
            raise ValueError("Cannot enter NORMAL mode using enter_failsafe_mode")
        
        previous_mode = self.state.mode
        self.state.mode = mode
        self.state.entered_failsafe_at = get_current_timestamp()
        
        # Log forensic information
        forensic_info = {
            "timestamp": self.state.entered_failsafe_at,
            "type": "failsafe_mode_entered",
            "mode": mode.value,
            "previous_mode": previous_mode.value,
            "reason": reason,
            "invalid_command_count": self.state.invalid_command_count,
            "security_violation_count": self.state.security_violation_count,
            "time_since_last_comm": get_current_timestamp() - self.state.last_cas_communication
        }
        self.state.forensic_log.append(forensic_info)
        
        # Alert CAS if callback is provided
        if self.alert_callback:
            alert_details = {
                "drone_id": self.drone_id,
                "mode": mode.value,
                "reason": reason,
                "timestamp": self.state.entered_failsafe_at,
                "forensic_info": forensic_info
            }
            self.alert_callback("FAILSAFE_MODE_ENTERED", alert_details)
    
    def exit_failsafe_mode(self, authorized_by: str) -> bool:
        """
        Exit failsafe mode and return to normal operations.
        Requires explicit authorization.
        
        Args:
            authorized_by: Identifier of the entity authorizing the exit
                          (e.g., operator ID or CAS identifier)
            
        Returns:
            True if successfully exited failsafe mode, False otherwise
            
        Requirements: 10.5
        """
        if self.state.mode == FailsafeMode.NORMAL:
            # Already in normal mode
            return True
        
        previous_mode = self.state.mode
        self.state.mode = FailsafeMode.NORMAL
        self.state.entered_failsafe_at = None
        
        # Reset counters
        self.state.invalid_command_count = 0
        self.state.security_violation_count = 0
        
        # Log forensic information
        forensic_info = {
            "timestamp": get_current_timestamp(),
            "type": "failsafe_mode_exited",
            "previous_mode": previous_mode.value,
            "authorized_by": authorized_by
        }
        self.state.forensic_log.append(forensic_info)
        
        # Alert CAS if callback is provided
        if self.alert_callback:
            alert_details = {
                "drone_id": self.drone_id,
                "previous_mode": previous_mode.value,
                "authorized_by": authorized_by,
                "timestamp": get_current_timestamp()
            }
            self.alert_callback("FAILSAFE_MODE_EXITED", alert_details)
        
        return True
    
    def is_in_failsafe(self) -> bool:
        """
        Check if the drone is currently in failsafe mode.
        
        Returns:
            True if in DEFENSIVE or FAILSAFE mode, False if NORMAL
            
        Requirements: 10.3
        """
        return self.state.mode != FailsafeMode.NORMAL
    
    def should_reject_command(self, command_type: str, is_emergency_override: bool = False) -> tuple[bool, str]:
        """
        Determine if a command should be rejected based on current failsafe mode.
        
        Args:
            command_type: Type of command being evaluated
            is_emergency_override: Whether this is an emergency override command
                                  from authorized personnel
            
        Returns:
            Tuple of (should_reject, reason) where:
            - should_reject: True if command should be rejected, False otherwise
            - reason: Explanation for the decision
            
        Requirements: 10.3
        """
        if self.state.mode == FailsafeMode.NORMAL:
            return False, "Normal mode - command accepted"
        
        # In failsafe modes, only accept emergency override commands
        if is_emergency_override:
            return False, "Emergency override accepted in failsafe mode"
        
        if self.state.mode == FailsafeMode.DEFENSIVE:
            return True, f"Drone in defensive mode - rejecting non-emergency command"
        
        if self.state.mode == FailsafeMode.FAILSAFE:
            return True, f"Drone in failsafe mode - rejecting non-emergency command"
        
        return True, "Unknown failsafe state"
    
    def get_forensic_log(self) -> list:
        """
        Get the forensic log of all security-related events.
        
        Returns:
            List of forensic information dictionaries
            
        Requirements: 10.4
        """
        return self.state.forensic_log.copy()
    
    def get_state_summary(self) -> Dict[str, Any]:
        """
        Get a summary of the current failsafe state.
        
        Returns:
            Dictionary containing current state information
        """
        return {
            "drone_id": self.drone_id,
            "mode": self.state.mode.value,
            "invalid_command_count": self.state.invalid_command_count,
            "security_violation_count": self.state.security_violation_count,
            "last_cas_communication": self.state.last_cas_communication,
            "time_since_last_comm": get_current_timestamp() - self.state.last_cas_communication,
            "entered_failsafe_at": self.state.entered_failsafe_at,
            "is_in_failsafe": self.is_in_failsafe(),
            "forensic_events_count": len(self.state.forensic_log)
        }
