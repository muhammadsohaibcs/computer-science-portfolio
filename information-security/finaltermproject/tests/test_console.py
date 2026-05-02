"""
Unit tests for operator console module.
Tests console connection, command submission, and telemetry viewing.

Requirements: 3.4, 3.5, 14.3
"""

import sys
import os

# Add parent directory to path
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

import pytest

# Import from our local operator_console package
import importlib.util
spec = importlib.util.spec_from_file_location("operator_console.console", 
                                               os.path.join(parent_dir, "operator_console", "console.py"))
console_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(console_module)

OperatorConsole = console_module.OperatorConsole
CommandSubmissionResult = console_module.CommandSubmissionResult

from core.constants import DEFAULT_COMMAND_VALIDITY


class TestOperatorConsole:
    """Test suite for OperatorConsole class."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.console = OperatorConsole()
    
    def test_console_initialization(self):
        """Test console initialization with default address."""
        console = OperatorConsole()
        
        assert console.cas_address == "localhost:8443"
        assert console.auth_client is not None
        assert console.command_builder is not None
        assert console.current_session is None
        assert console.is_connected() is False
    
    def test_console_initialization_with_custom_address(self):
        """Test console initialization with custom CAS address."""
        console = OperatorConsole(cas_address="192.168.1.100:9000")
        
        assert console.cas_address == "192.168.1.100:9000"
    
    def test_connect_to_cas_success(self):
        """Test successful connection to CAS (Requirement 3.4)."""
        result = self.console.connect_to_cas()
        
        assert result is True
        assert self.console.is_connected() is True
    
    def test_connect_to_cas_with_custom_address(self):
        """Test connection with custom address override."""
        result = self.console.connect_to_cas(cas_address="192.168.1.100:9000")
        
        assert result is True
        assert self.console.cas_address == "192.168.1.100:9000"
        assert self.console.is_connected() is True
    
    def test_disconnect_from_cas(self):
        """Test disconnection from CAS."""
        # Connect first
        self.console.connect_to_cas()
        assert self.console.is_connected() is True
        
        # Disconnect
        result = self.console.disconnect_from_cas()
        
        assert result is True
        assert self.console.is_connected() is False
    
    def test_disconnect_without_connection(self):
        """Test disconnect when not connected."""
        result = self.console.disconnect_from_cas()
        
        assert result is False
    
    def test_login_success(self):
        """Test successful login."""
        # Connect first
        self.console.connect_to_cas()
        
        # Login
        response = self.console.login("OPERATOR_PILOT_01", "password123", "123456")
        
        assert response.success is True
        assert self.console.current_session is not None
        assert self.console.current_session.operator_id == "OPERATOR_PILOT_01"
        assert self.console.is_authenticated() is True
    
    def test_login_without_connection(self):
        """Test login fails when not connected."""
        response = self.console.login("OPERATOR_PILOT_01", "password123", "123456")
        
        assert response.success is False
        assert "Not connected to CAS" in response.error_message
    
    def test_logout_success(self):
        """Test successful logout."""
        # Connect and login
        self.console.connect_to_cas()
        self.console.login("OPERATOR_PILOT_01", "password123", "123456")
        assert self.console.is_authenticated() is True
        
        # Logout
        result = self.console.logout()
        
        assert result is True
        assert self.console.current_session is None
        assert self.console.is_authenticated() is False
    
    def test_logout_without_session(self):
        """Test logout without active session."""
        result = self.console.logout()
        
        assert result is False
    
    def test_submit_command_success(self):
        """
        Test successful command submission (Requirements 3.4, 3.5).
        
        Property 10: Valid requests are forwarded
        For any command request that passes schema validation, the request
        should be forwarded to the CAS authorization system.
        """
        # Connect and login
        self.console.connect_to_cas()
        self.console.login("OPERATOR_PILOT_01", "password123", "123456")
        
        # Create valid command
        command = {
            "command_type": "MOVE",
            "target_drone_id": "DRONE_01",
            "parameters": {
                "coordinates": [33.6844, 73.0479],
                "altitude": 100,
                "speed": 15
            },
            "validity_duration": 10,
            "justification": "Test flight"
        }
        
        # Submit command
        result = self.console.submit_command(command)
        
        assert result.success is True
        assert result.request_id is not None
        assert result.error_message is None
    
    def test_submit_command_without_connection(self):
        """Test command submission fails when not connected."""
        command = {
            "command_type": "LAND",
            "target_drone_id": "DRONE_01",
            "parameters": {},
            "validity_duration": 5
        }
        
        result = self.console.submit_command(command)
        
        assert result.success is False
        assert "Not connected to CAS" in result.error_message
    
    def test_submit_command_without_session(self):
        """Test command submission fails without valid session."""
        # Connect but don't login
        self.console.connect_to_cas()
        
        command = {
            "command_type": "LAND",
            "target_drone_id": "DRONE_01",
            "parameters": {},
            "validity_duration": 5
        }
        
        result = self.console.submit_command(command)
        
        assert result.success is False
        assert "Session expired or invalid" in result.error_message
    
    def test_submit_command_with_invalid_command(self):
        """Test command submission fails for invalid command format."""
        # Connect and login
        self.console.connect_to_cas()
        self.console.login("OPERATOR_PILOT_01", "password123", "123456")
        
        # Invalid command (missing required parameters)
        command = {
            "command_type": "MOVE",
            "target_drone_id": "DRONE_01",
            "parameters": {
                "coordinates": [33.6844, 73.0479]
                # Missing altitude and speed
            },
            "validity_duration": 10
        }
        
        result = self.console.submit_command(command)
        
        assert result.success is False
        assert "Command validation failed" in result.error_message
    
    def test_get_command_status_success(self):
        """Test retrieving command status (Requirement 3.5)."""
        # Connect, login, and submit command
        self.console.connect_to_cas()
        self.console.login("OPERATOR_PILOT_01", "password123", "123456")
        
        command = {
            "command_type": "STATUS",
            "target_drone_id": "DRONE_01",
            "parameters": {},
            "validity_duration": 5
        }
        
        submit_result = self.console.submit_command(command)
        assert submit_result.success is True
        
        # Get status
        status = self.console.get_command_status(submit_result.request_id)
        
        assert status is not None
        assert status["request_id"] == submit_result.request_id
        assert status["operator_id"] == "OPERATOR_PILOT_01"
        assert status["command_type"] == "STATUS"
        assert status["target_drone_id"] == "DRONE_01"
        assert "status" in status
    
    def test_get_command_status_without_connection(self):
        """Test get_command_status returns None when not connected."""
        status = self.console.get_command_status("fake_request_id")
        
        assert status is None
    
    def test_get_command_status_invalid_request_id(self):
        """Test get_command_status returns None for invalid request ID."""
        self.console.connect_to_cas()
        
        status = self.console.get_command_status("invalid_request_id")
        
        assert status is None
    
    def test_view_telemetry_success(self):
        """
        Test viewing telemetry data (Requirement 14.3).
        
        Property 42: Telemetry access control
        For any processed telemetry, only operators with appropriate authorization
        should be able to access the telemetry data.
        """
        # Connect and login
        self.console.connect_to_cas()
        self.console.login("OPERATOR_PILOT_01", "password123", "123456")
        
        # Authorize telemetry access (in production, this would be managed by CAS)
        self.console.authorize_telemetry_access("DRONE_01")
        
        # View telemetry
        telemetry_list = self.console.view_telemetry("DRONE_01", limit=5)
        
        assert isinstance(telemetry_list, list)
        # May be empty if no telemetry has been sent yet
    
    def test_view_telemetry_without_connection(self):
        """Test view_telemetry fails when not connected."""
        with pytest.raises(ValueError, match="Not connected to CAS"):
            self.console.view_telemetry("DRONE_01")
    
    def test_view_telemetry_without_session(self):
        """Test view_telemetry fails without valid session."""
        self.console.connect_to_cas()
        
        with pytest.raises(ValueError, match="Session expired or invalid"):
            self.console.view_telemetry("DRONE_01")
    
    def test_view_telemetry_without_authorization(self):
        """Test view_telemetry fails without authorization."""
        # Connect and login
        self.console.connect_to_cas()
        self.console.login("OPERATOR_PILOT_01", "password123", "123456")
        
        # Try to view telemetry without authorization
        with pytest.raises(PermissionError):
            self.console.view_telemetry("DRONE_01")
    
    def test_is_connected(self):
        """Test is_connected status check."""
        assert self.console.is_connected() is False
        
        self.console.connect_to_cas()
        assert self.console.is_connected() is True
        
        self.console.disconnect_from_cas()
        assert self.console.is_connected() is False
    
    def test_is_authenticated(self):
        """Test is_authenticated status check."""
        assert self.console.is_authenticated() is False
        
        self.console.connect_to_cas()
        assert self.console.is_authenticated() is False
        
        self.console.login("OPERATOR_PILOT_01", "password123", "123456")
        assert self.console.is_authenticated() is True
        
        self.console.logout()
        assert self.console.is_authenticated() is False
    
    def test_get_session_info(self):
        """Test retrieving session information."""
        # No session initially
        info = self.console.get_session_info()
        assert info is None
        
        # Connect and login
        self.console.connect_to_cas()
        self.console.login("OPERATOR_PILOT_01", "password123", "123456")
        
        # Get session info
        info = self.console.get_session_info()
        assert info is not None
        assert info["operator_id"] == "OPERATOR_PILOT_01"
        assert "session_token" in info
        assert "expires_at" in info
        assert "time_remaining" in info
        assert info["is_valid"] is True
    
    def test_disconnect_with_active_session(self):
        """Test disconnect logs out active session."""
        # Connect and login
        self.console.connect_to_cas()
        self.console.login("OPERATOR_PILOT_01", "password123", "123456")
        assert self.console.is_authenticated() is True
        
        # Disconnect
        self.console.disconnect_from_cas()
        
        # Session should be cleared
        assert self.console.current_session is None
        assert self.console.is_connected() is False


class TestCommandSubmissionResult:
    """Test suite for CommandSubmissionResult dataclass."""
    
    def test_successful_result(self):
        """Test creating a successful submission result."""
        result = CommandSubmissionResult(
            success=True,
            request_id="req_123",
            error_message=None
        )
        
        assert result.success is True
        assert result.request_id == "req_123"
        assert result.error_message is None
    
    def test_failed_result(self):
        """Test creating a failed submission result."""
        result = CommandSubmissionResult(
            success=False,
            request_id=None,
            error_message="Validation failed"
        )
        
        assert result.success is False
        assert result.request_id is None
        assert result.error_message == "Validation failed"


class TestConsoleIntegration:
    """Integration tests for console workflow."""
    
    def test_complete_command_workflow(self):
        """Test complete workflow: connect, login, submit, check status."""
        console = OperatorConsole()
        
        # Step 1: Connect
        assert console.connect_to_cas() is True
        
        # Step 2: Login
        login_response = console.login("OPERATOR_PILOT_01", "password123", "123456")
        assert login_response.success is True
        
        # Step 3: Submit command
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
        
        submit_result = console.submit_command(command)
        assert submit_result.success is True
        
        # Step 4: Check status
        status = console.get_command_status(submit_result.request_id)
        assert status is not None
        assert status["request_id"] == submit_result.request_id
        
        # Step 5: Logout
        assert console.logout() is True
        
        # Step 6: Disconnect
        assert console.disconnect_from_cas() is True
    
    def test_multiple_command_submissions(self):
        """Test submitting multiple commands in one session."""
        console = OperatorConsole()
        console.connect_to_cas()
        console.login("OPERATOR_PILOT_01", "password123", "123456")
        
        # Submit multiple commands
        commands = [
            {
                "command_type": "STATUS",
                "target_drone_id": "DRONE_01",
                "parameters": {},
                "validity_duration": 5
            },
            {
                "command_type": "MOVE",
                "target_drone_id": "DRONE_01",
                "parameters": {
                    "coordinates": [33.6844, 73.0479],
                    "altitude": 100,
                    "speed": 15
                },
                "validity_duration": 10
            },
            {
                "command_type": "LAND",
                "target_drone_id": "DRONE_01",
                "parameters": {},
                "validity_duration": 5
            }
        ]
        
        request_ids = []
        for command in commands:
            result = console.submit_command(command)
            assert result.success is True
            request_ids.append(result.request_id)
        
        # Verify all commands have unique request IDs
        assert len(request_ids) == len(set(request_ids))
        
        # Verify all commands can be queried
        for request_id in request_ids:
            status = console.get_command_status(request_id)
            assert status is not None
