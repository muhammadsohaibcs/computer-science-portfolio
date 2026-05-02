"""
Operator console module for SDRCAS.
Main operator console interface for command submission and status tracking.
Provides interface for connecting to CAS, submitting commands, and viewing telemetry.

Requirements: 3.4, 3.5, 14.3
"""

import json
import sys
import os
from typing import Dict, Any, Optional, List
from dataclasses import dataclass

# Add parent directory to path for imports
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

# Import using importlib to avoid conflicts with built-in operator module
import importlib.util

# Import auth_client
spec = importlib.util.spec_from_file_location(
    "auth_client_module",
    os.path.join(parent_dir, "operator_console", "auth_client.py")
)
auth_client_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(auth_client_module)
AuthClient = auth_client_module.AuthClient
AuthResponse = auth_client_module.AuthResponse

# Import command_builder
spec = importlib.util.spec_from_file_location(
    "command_builder_module",
    os.path.join(parent_dir, "operator_console", "command_builder.py")
)
command_builder_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(command_builder_module)
CommandBuilder = command_builder_module.CommandBuilder
ValidationResult = command_builder_module.ValidationResult

# Import session
spec = importlib.util.spec_from_file_location(
    "session_module",
    os.path.join(parent_dir, "operator_console", "session.py")
)
session_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(session_module)
Session = session_module.Session

# Import server modules
from server.gateway import CommandGateway
from server.telemetry_handler import TelemetryHandler


@dataclass
class CommandSubmissionResult:
    """
    Result of a command submission.
    
    Attributes:
        success: Whether the submission was successful
        request_id: Unique identifier for tracking the request (if successful)
        error_message: Error message if submission failed
    """
    success: bool
    request_id: Optional[str] = None
    error_message: Optional[str] = None


class OperatorConsole:
    """
    Main operator console for interacting with the drone command system.
    
    Provides a high-level interface for operators to:
    - Authenticate with the CAS
    - Submit command requests
    - Track command status
    - View drone telemetry
    
    Requirements: 3.4, 14.3
    """
    
    def __init__(self, cas_address: str = "localhost:8443"):
        """
        Initialize the OperatorConsole.
        
        Args:
            cas_address: Address of the Command Authorization Server
        """
        self.cas_address = cas_address
        self.auth_client = AuthClient(cas_address)
        self.command_builder = CommandBuilder()
        self.current_session: Optional[Session] = None
        
        # Gateway and telemetry handler (simulated connection to CAS)
        # In production, these would be remote API clients
        self._gateway: Optional[CommandGateway] = None
        self._telemetry_handler: Optional[TelemetryHandler] = None
        
        # Connection status
        self._connected = False
    
    def connect_to_cas(self, cas_address: Optional[str] = None) -> bool:
        """
        Establish connection to the Command Authorization Server.
        
        This method initializes the connection to the CAS and prepares
        the console for command submission. In a production system, this
        would establish network connections and verify CAS availability.
        
        Args:
            cas_address: Optional CAS address (overrides initialization address)
            
        Returns:
            True if connection successful, False otherwise
            
        Requirements: 3.4
        """
        if cas_address:
            self.cas_address = cas_address
            self.auth_client = AuthClient(cas_address)
        
        try:
            # In production, this would:
            # 1. Establish network connection to CAS
            # 2. Verify CAS certificate
            # 3. Perform initial handshake
            
            # For now, we initialize local gateway and telemetry handler
            # In production, these would be API clients
            self._gateway = CommandGateway()
            self._telemetry_handler = TelemetryHandler()
            
            self._connected = True
            return True
            
        except Exception as e:
            self._connected = False
            return False
    
    def disconnect_from_cas(self) -> bool:
        """
        Disconnect from the Command Authorization Server.
        
        Returns:
            True if disconnection successful, False otherwise
        """
        if not self._connected:
            return False
        
        # Logout if there's an active session
        if self.current_session and self.current_session.is_valid():
            self.auth_client.logout()
            self.current_session = None
        
        # Clear connection
        self._gateway = None
        self._telemetry_handler = None
        self._connected = False
        
        return True
    
    def login(self, username: str, password: str, mfa_token: str) -> AuthResponse:
        """
        Authenticate with the CAS.
        
        Args:
            username: Operator username
            password: Operator password
            mfa_token: Multi-factor authentication token
            
        Returns:
            AuthResponse with session information if successful
        """
        if not self._connected:
            return AuthResponse(
                success=False,
                error_message="Not connected to CAS. Call connect_to_cas() first."
            )
        
        # Authenticate using auth client
        auth_response = self.auth_client.login(username, password, mfa_token)
        
        if auth_response.success:
            # Create session object
            self.current_session = Session(
                session_token=auth_response.session_token,
                operator_id=auth_response.operator_id,
                expires_at=auth_response.expires_at
            )
        
        return auth_response
    
    def logout(self) -> bool:
        """
        Logout from the CAS.
        
        Returns:
            True if logout successful, False otherwise
        """
        if not self.current_session:
            return False
        
        success = self.auth_client.logout()
        
        if success:
            self.current_session = None
        
        return success
    
    def submit_command(self, command: Dict[str, Any]) -> CommandSubmissionResult:
        """
        Submit a command request to the CAS.
        
        This method:
        1. Validates the session is active
        2. Validates the command format
        3. Submits the command to the CAS
        4. Returns a request ID for tracking
        
        Args:
            command: Command request dictionary containing:
                - command_type: Type of command
                - target_drone_id: Target drone ID
                - parameters: Command parameters
                - validity_duration: Command validity in seconds (optional)
                - justification: Reason for command (optional)
        
        Returns:
            CommandSubmissionResult with request_id if successful
            
        Requirements: 3.4, 3.5
        
        Property 10: Valid requests are forwarded
        For any command request that passes schema validation, the request
        should be forwarded to the CAS authorization system.
        """
        # Check connection
        if not self._connected or not self._gateway:
            return CommandSubmissionResult(
                success=False,
                error_message="Not connected to CAS"
            )
        
        # Check session validity
        if not self.current_session or not self.current_session.is_valid():
            return CommandSubmissionResult(
                success=False,
                error_message="Session expired or invalid. Please login again."
            )
        
        # Validate command format
        validation_result = self.command_builder.validate_command(command)
        if not validation_result.valid:
            error_msg = "Command validation failed: " + "; ".join(validation_result.errors)
            return CommandSubmissionResult(
                success=False,
                error_message=error_msg
            )
        
        # Submit command to CAS
        try:
            request_id = self._gateway.receive_command_request(
                operator_id=self.current_session.operator_id,
                request=command
            )
            
            # Automatically process authorization
            # In production, this might be asynchronous
            self._gateway.process_authorization(request_id)
            
            return CommandSubmissionResult(
                success=True,
                request_id=request_id
            )
            
        except Exception as e:
            return CommandSubmissionResult(
                success=False,
                error_message=f"Command submission failed: {str(e)}"
            )
    
    def get_command_status(self, request_id: str) -> Optional[Dict[str, Any]]:
        """
        Get the status of a submitted command request.
        
        Args:
            request_id: Unique identifier of the command request
            
        Returns:
            Dictionary with status information, or None if request not found
            
        Requirements: 3.5
        """
        if not self._connected or not self._gateway:
            return None
        
        return self._gateway.get_request_status(request_id)
    
    def view_telemetry(self, drone_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        View recent telemetry data for a drone.
        
        This method retrieves and displays telemetry data including:
        - Position (latitude, longitude, altitude)
        - Battery level
        - Status
        - Last command executed
        - Any errors
        
        Args:
            drone_id: ID of the drone to view telemetry for
            limit: Maximum number of telemetry entries to retrieve (default: 10)
            
        Returns:
            List of telemetry dictionaries (most recent first)
            
        Raises:
            PermissionError: If operator not authorized to view telemetry
            ValueError: If not connected or no active session
            
        Requirements: 14.3
        
        Property 42: Telemetry access control
        For any processed telemetry, only operators with appropriate authorization
        should be able to access the telemetry data.
        """
        # Check connection
        if not self._connected or not self._telemetry_handler:
            raise ValueError("Not connected to CAS")
        
        # Check session validity
        if not self.current_session or not self.current_session.is_valid():
            raise ValueError("Session expired or invalid. Please login again.")
        
        # Get telemetry (with access control check)
        try:
            telemetry_list = self._telemetry_handler.get_telemetry(
                drone_id=drone_id,
                operator_id=self.current_session.operator_id,
                limit=limit
            )
            return telemetry_list
            
        except PermissionError as e:
            # Re-raise permission errors
            raise
        except Exception as e:
            raise ValueError(f"Failed to retrieve telemetry: {str(e)}")
    
    def authorize_telemetry_access(self, drone_id: str) -> None:
        """
        Authorize the current operator to view telemetry for a drone.
        
        This is a helper method for testing/demo purposes.
        In production, authorization would be managed by the CAS.
        
        Args:
            drone_id: ID of the drone to authorize access for
        """
        if not self._telemetry_handler or not self.current_session:
            return
        
        self._telemetry_handler.authorize_viewer(
            operator_id=self.current_session.operator_id,
            drone_id=drone_id
        )
    
    def is_connected(self) -> bool:
        """
        Check if console is connected to CAS.
        
        Returns:
            True if connected, False otherwise
        """
        return self._connected
    
    def is_authenticated(self) -> bool:
        """
        Check if operator is authenticated with a valid session.
        
        Returns:
            True if authenticated with valid session, False otherwise
        """
        return (
            self.current_session is not None
            and self.current_session.is_valid()
        )
    
    def get_session_info(self) -> Optional[Dict[str, Any]]:
        """
        Get information about the current session.
        
        Returns:
            Dictionary with session information, or None if no active session
        """
        if not self.current_session:
            return None
        
        return {
            "operator_id": self.current_session.operator_id,
            "session_token": self.current_session.session_token,
            "expires_at": self.current_session.expires_at,
            "time_remaining": self.current_session.time_remaining(),
            "is_valid": self.current_session.is_valid()
        }
