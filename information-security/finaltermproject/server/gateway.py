"""
Command Authorization Server Gateway module for SDRCAS.
Main CAS gateway coordinating all command authorization operations.
Implements the complete command request processing workflow.

Requirements: 3.4, 4.1, 4.5, 5.1, 6.5
"""

import uuid
import json
from typing import Dict, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

from core.command_token import CommandToken, create_command_token
from core.time_utils import get_current_timestamp
from server.identity import load_identity, Identity
from server.authorization import check_authorization, load_policies
from server.command_signer import sign_command, seal_command, SealedCommand
from server.key_manager import KeyManager, get_key_manager
from server.replay_protection import NonceStore
from server.audit import log_event


class CommandRequestStatus(Enum):
    """Status of a command request in the processing pipeline."""
    PENDING = "pending"
    VALIDATING = "validating"
    AUTHORIZING = "authorizing"
    SIGNING = "signing"
    SEALING = "sealing"
    APPROVED = "approved"
    REJECTED = "rejected"
    TRANSMITTED = "transmitted"
    FAILED = "failed"


@dataclass
class CommandRequest:
    """
    Represents a command request from an operator.
    
    Attributes:
        request_id: Unique identifier for this request
        operator_id: ID of the operator making the request
        command_type: Type of command requested
        target_drone_id: ID of the target drone
        parameters: Command parameters
        validity_duration: How long the command should be valid (seconds)
        justification: Reason for the command
        status: Current status of the request
        created_at: Timestamp when request was created
        sealed_command: The sealed command (if approved)
        rejection_reason: Reason for rejection (if rejected)
    """
    request_id: str
    operator_id: str
    command_type: str
    target_drone_id: str
    parameters: Dict[str, Any]
    validity_duration: int
    justification: str
    status: CommandRequestStatus
    created_at: int
    sealed_command: Optional[SealedCommand] = None
    rejection_reason: Optional[str] = None


class CommandGateway:
    """
    Main Command Authorization Server gateway.
    
    Coordinates all operations for command authorization including:
    - Receiving command requests from operators
    - Validating request format
    - Performing authorization checks
    - Signing and sealing approved commands
    - Transmitting commands to drones
    - Audit logging of all operations
    """
    
    def __init__(
        self,
        key_manager: Optional[KeyManager] = None,
        nonce_store: Optional[NonceStore] = None,
        audit_log_path: Optional[str] = None
    ):
        """
        Initialize the CommandGateway.
        
        Args:
            key_manager: KeyManager instance for cryptographic operations
            nonce_store: NonceStore for replay protection
            audit_log_path: Path to audit log file
        """
        self.key_manager = key_manager or get_key_manager()
        self.nonce_store = nonce_store or NonceStore()
        self.audit_log_path = audit_log_path
        self.policies = load_policies()
        
        # In-memory storage for command requests
        # In production, this would be a persistent database
        self._requests: Dict[str, CommandRequest] = {}
    
    def receive_command_request(
        self,
        operator_id: str,
        request: Dict[str, Any]
    ) -> str:
        """
        Receive and validate a command request from an operator.
        
        This is the entry point for all command requests. It validates
        the request format and creates a CommandRequest object.
        
        Args:
            operator_id: ID of the operator making the request
            request: Dictionary containing:
                - command_type: Type of command
                - target_drone_id: Target drone ID
                - parameters: Command parameters
                - validity_duration: Command validity in seconds (optional)
                - justification: Reason for command (optional)
        
        Returns:
            request_id: Unique identifier for tracking this request
            
        Raises:
            ValueError: If request format is invalid
            
        Requirements: 3.4, 5.1
        """
        # Generate unique request ID
        request_id = str(uuid.uuid4())
        
        # Validate required fields
        required_fields = ["command_type", "target_drone_id", "parameters"]
        for field in required_fields:
            if field not in request:
                error_msg = f"Missing required field: {field}"
                self._log_request_event(
                    request_id,
                    operator_id,
                    request.get("target_drone_id", "unknown"),
                    "COMMAND_REQUEST_REJECTED",
                    {"reason": error_msg, "request": request}
                )
                raise ValueError(error_msg)
        
        # Extract and validate fields
        command_type = request["command_type"]
        target_drone_id = request["target_drone_id"]
        parameters = request["parameters"]
        validity_duration = request.get("validity_duration", 5)  # Default 5 seconds
        justification = request.get("justification", "")
        
        # Validate command_type
        valid_command_types = {"MOVE", "LAND", "STATUS", "EMERGENCY_STOP"}
        if command_type not in valid_command_types:
            error_msg = f"Invalid command_type: {command_type}. Must be one of {valid_command_types}"
            self._log_request_event(
                request_id,
                operator_id,
                target_drone_id,
                "COMMAND_REQUEST_REJECTED",
                {"reason": error_msg, "request": request}
            )
            raise ValueError(error_msg)
        
        # Validate parameters is a dict
        if not isinstance(parameters, dict):
            error_msg = "parameters must be a dictionary"
            self._log_request_event(
                request_id,
                operator_id,
                target_drone_id,
                "COMMAND_REQUEST_REJECTED",
                {"reason": error_msg, "request": request}
            )
            raise ValueError(error_msg)
        
        # Create CommandRequest object
        command_request = CommandRequest(
            request_id=request_id,
            operator_id=operator_id,
            command_type=command_type,
            target_drone_id=target_drone_id,
            parameters=parameters,
            validity_duration=validity_duration,
            justification=justification,
            status=CommandRequestStatus.PENDING,
            created_at=get_current_timestamp()
        )
        
        # Store the request
        self._requests[request_id] = command_request
        
        # Log the request
        self._log_request_event(
            request_id,
            operator_id,
            target_drone_id,
            "COMMAND_REQUESTED",
            {
                "command_type": command_type,
                "parameters": parameters,
                "validity_duration": validity_duration,
                "justification": justification
            }
        )
        
        return request_id

    def process_authorization(self, request_id: str) -> bool:
        """
        Process authorization for a command request.
        
        This implements the complete authorization workflow:
        1. Validate - Check request format and load identities
        2. Authorize - Evaluate policies
        3. Sign - Create digital signature
        4. Seal - Encrypt command for target drone
        
        Args:
            request_id: ID of the request to process
            
        Returns:
            True if command was authorized and sealed, False if rejected
            
        Raises:
            ValueError: If request_id is invalid
            
        Requirements: 3.4, 4.1, 4.5, 5.1
        """
        # Get the request
        if request_id not in self._requests:
            raise ValueError(f"Invalid request_id: {request_id}")
        
        command_request = self._requests[request_id]
        
        # Step 1: Validate - Load operator and drone identities
        command_request.status = CommandRequestStatus.VALIDATING
        
        operator = load_identity(command_request.operator_id)
        if operator is None:
            command_request.status = CommandRequestStatus.REJECTED
            command_request.rejection_reason = f"Operator not found: {command_request.operator_id}"
            self._log_authorization_event(
                request_id,
                command_request.operator_id,
                command_request.target_drone_id,
                False,
                command_request.rejection_reason
            )
            return False
        
        drone = load_identity(command_request.target_drone_id)
        if drone is None:
            command_request.status = CommandRequestStatus.REJECTED
            command_request.rejection_reason = f"Drone not found: {command_request.target_drone_id}"
            self._log_authorization_event(
                request_id,
                command_request.operator_id,
                command_request.target_drone_id,
                False,
                command_request.rejection_reason
            )
            return False
        
        # Step 2: Authorize - Create command token and check authorization
        command_request.status = CommandRequestStatus.AUTHORIZING
        
        # Create command token for authorization check
        command_token = create_command_token(
            command_type=command_request.command_type,
            target_drone_id=command_request.target_drone_id,
            parameters=command_request.parameters,
            issuer=command_request.operator_id,
            validity_duration=command_request.validity_duration
        )
        
        # Check authorization against all policies
        authorized, reason = check_authorization(
            operator=operator,
            command=command_token,
            drone=drone,
            policies=self.policies
        )
        
        if not authorized:
            command_request.status = CommandRequestStatus.REJECTED
            command_request.rejection_reason = reason
            self._log_authorization_event(
                request_id,
                command_request.operator_id,
                command_request.target_drone_id,
                False,
                reason
            )
            return False
        
        # Authorization successful
        self._log_authorization_event(
            request_id,
            command_request.operator_id,
            command_request.target_drone_id,
            True,
            reason
        )
        
        # Step 3: Sign - Create digital signature
        command_request.status = CommandRequestStatus.SIGNING
        
        try:
            # Load CAS private key with password (set during provisioning)
            cas_password = b"cas_master_password_change_in_production"
            cas_private_key = self.key_manager.load_cas_private_key(cas_password)
            signature = sign_command(command_token, cas_private_key)
        except Exception as e:
            command_request.status = CommandRequestStatus.FAILED
            command_request.rejection_reason = f"Signing failed: {str(e)}"
            self._log_request_event(
                request_id,
                command_request.operator_id,
                command_request.target_drone_id,
                "COMMAND_SIGNING_FAILED",
                {"error": str(e)}
            )
            return False
        
        # Step 4: Seal - Encrypt command for target drone
        command_request.status = CommandRequestStatus.SEALING
        
        try:
            drone_public_key = self.key_manager.get_drone_public_key(command_request.target_drone_id)
            if drone_public_key is None:
                raise ValueError(f"Drone public key not found: {command_request.target_drone_id}")
            
            sealed_command = seal_command(command_token, signature, drone_public_key)
            command_request.sealed_command = sealed_command
            command_request.status = CommandRequestStatus.APPROVED
            
            # Store nonce for replay protection
            self.nonce_store.check_and_store(command_token.nonce, command_token.expires_at)
            
        except Exception as e:
            command_request.status = CommandRequestStatus.FAILED
            command_request.rejection_reason = f"Sealing failed: {str(e)}"
            self._log_request_event(
                request_id,
                command_request.operator_id,
                command_request.target_drone_id,
                "COMMAND_SEALING_FAILED",
                {"error": str(e)}
            )
            return False
        
        # Log successful authorization and sealing
        self._log_request_event(
            request_id,
            command_request.operator_id,
            command_request.target_drone_id,
            "COMMAND_APPROVED",
            {
                "command_type": command_request.command_type,
                "authorization_reason": reason
            }
        )
        
        return True
    
    def send_command_to_drone(self, drone_id: str, sealed_command: bytes) -> bool:
        """
        Send a sealed command to a target drone.
        
        This is a placeholder for the actual transmission logic.
        In a production system, this would use the communication layer
        to transmit the sealed command over a secure channel.
        
        Args:
            drone_id: ID of the target drone
            sealed_command: Sealed command bytes to transmit
            
        Returns:
            True if transmission successful, False otherwise
            
        Requirements: 6.5
        """
        # In production, this would:
        # 1. Establish secure channel to drone
        # 2. Transmit sealed command
        # 3. Wait for acknowledgment
        # 4. Handle retries with exponential backoff
        
        # For now, we just log the transmission
        self._log_transmission_event(
            drone_id,
            "COMMAND_TRANSMITTED",
            {
                "sealed_command_size": len(sealed_command),
                "transmission_method": "placeholder"
            }
        )
        
        return True
    
    def get_request_status(self, request_id: str) -> Optional[Dict[str, Any]]:
        """
        Get the status of a command request.
        
        Args:
            request_id: ID of the request
            
        Returns:
            Dictionary with request status information, or None if not found
        """
        if request_id not in self._requests:
            return None
        
        request = self._requests[request_id]
        
        status_info = {
            "request_id": request.request_id,
            "operator_id": request.operator_id,
            "command_type": request.command_type,
            "target_drone_id": request.target_drone_id,
            "status": request.status.value,
            "created_at": request.created_at
        }
        
        if request.rejection_reason:
            status_info["rejection_reason"] = request.rejection_reason
        
        if request.sealed_command:
            status_info["sealed_command_available"] = True
        
        return status_info
    
    def get_sealed_command(self, request_id: str) -> Optional[SealedCommand]:
        """
        Get the sealed command for an approved request.
        
        Args:
            request_id: ID of the request
            
        Returns:
            SealedCommand if available, None otherwise
        """
        if request_id not in self._requests:
            return None
        
        request = self._requests[request_id]
        return request.sealed_command
    
    def _log_request_event(
        self,
        request_id: str,
        operator_id: str,
        target_drone_id: str,
        event_type: str,
        details: Dict[str, Any]
    ) -> None:
        """
        Log a command request event to the audit log.
        
        Args:
            request_id: ID of the request
            operator_id: ID of the operator
            target_drone_id: ID of the target drone
            event_type: Type of event
            details: Additional event details
        """
        details_with_request_id = {
            "request_id": request_id,
            **details
        }
        
        log_event(
            event_type=event_type,
            actor=operator_id,
            target=target_drone_id,
            details=details_with_request_id,
            log_path=self.audit_log_path
        )
    
    def _log_authorization_event(
        self,
        request_id: str,
        operator_id: str,
        target_drone_id: str,
        authorized: bool,
        reason: str
    ) -> None:
        """
        Log an authorization decision to the audit log.
        
        Args:
            request_id: ID of the request
            operator_id: ID of the operator
            target_drone_id: ID of the target drone
            authorized: Whether the command was authorized
            reason: Reason for the decision
        """
        event_type = "COMMAND_AUTHORIZED" if authorized else "COMMAND_DENIED"
        
        log_event(
            event_type=event_type,
            actor=operator_id,
            target=target_drone_id,
            details={
                "request_id": request_id,
                "authorized": authorized,
                "reason": reason
            },
            log_path=self.audit_log_path
        )
    
    def _log_transmission_event(
        self,
        drone_id: str,
        event_type: str,
        details: Dict[str, Any]
    ) -> None:
        """
        Log a command transmission event to the audit log.
        
        Args:
            drone_id: ID of the target drone
            event_type: Type of event
            details: Additional event details
        """
        log_event(
            event_type=event_type,
            actor="CAS",
            target=drone_id,
            details=details,
            log_path=self.audit_log_path
        )
