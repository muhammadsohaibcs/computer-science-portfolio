"""
Drone agent main controller for SDRCAS.
Coordinates all drone operations including command reception, verification, execution,
failsafe monitoring, and telemetry transmission.

Requirements: 7.1, 7.5, 8.1, 8.4
"""

import json
import logging
from typing import Optional, Callable, Dict, Any
from pathlib import Path

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey, Ed25519PublicKey

from core.authentication import deserialize_public_key
from server.command_signer import SealedCommand, unseal_command
from drone.verifier import verify_command_complete
from drone.executor import CommandExecutor, ExecutionResult
from drone.failsafe import FailsafeMonitor, FailsafeConditions
from drone.telemetry import TelemetryCollector
from drone.secure_storage import SecureKeyStorage, NonceStorage


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DroneAgent:
    """
    Main drone agent that coordinates all drone operations.
    
    Orchestrates the complete command workflow:
    1. Receive sealed command from CAS
    2. Unseal and verify command authenticity
    3. Check failsafe conditions
    4. Execute verified command
    5. Collect and transmit telemetry
    
    Attributes:
        drone_id: Unique identifier for this drone
        private_key: Drone's Ed25519 private key for decryption and signing
        cas_public_key: CAS's Ed25519 public key for signature verification
        verifier: Command verification component
        executor: Command execution component
        failsafe: Failsafe monitoring component
        telemetry: Telemetry collection component
        nonce_storage: Persistent nonce storage for replay protection
    """
    
    def __init__(
        self,
        drone_id: str,
        private_key: Ed25519PrivateKey,
        cas_public_key: Ed25519PublicKey,
        capabilities: Optional[list] = None,
        failsafe_conditions: Optional[FailsafeConditions] = None,
        telemetry_callback: Optional[Callable[[bytes], None]] = None,
        alert_callback: Optional[Callable[[str, Dict[str, Any]], None]] = None
    ):
        """
        Initialize the DroneAgent.
        
        Args:
            drone_id: Unique identifier for this drone
            private_key: Drone's Ed25519 private key
            cas_public_key: CAS's Ed25519 public key for verification
            capabilities: List of supported command types (default: all)
            failsafe_conditions: Failsafe trigger conditions (default: standard)
            telemetry_callback: Optional callback for sending telemetry to CAS
            alert_callback: Optional callback for sending alerts to CAS
        """
        self.drone_id = drone_id
        self.private_key = private_key
        self.cas_public_key = cas_public_key
        
        # Initialize components
        self.executor = CommandExecutor(drone_id, capabilities)
        self.failsafe = FailsafeMonitor(
            drone_id,
            failsafe_conditions,
            alert_callback
        )
        self.telemetry = TelemetryCollector(
            drone_id,
            private_key,
            cas_public_key
        )
        
        # Initialize nonce storage for replay protection
        self.nonce_storage = NonceStorage()
        
        # Callbacks
        self.telemetry_callback = telemetry_callback
        self.alert_callback = alert_callback
        
        # State tracking
        self.last_command_type = ""
        self.last_execution_result: Optional[ExecutionResult] = None
        self.position = [0.0, 0.0, 0.0]  # Default position [lat, lon, alt]
        self.battery = 100  # Default battery level
        self.status = "IDLE"
        self.errors = []
        
        logger.info(f"DroneAgent initialized for {drone_id}")
    
    @classmethod
    def from_storage(
        cls,
        drone_id: str,
        password: str,
        cas_public_key_path: str,
        capabilities: Optional[list] = None,
        failsafe_conditions: Optional[FailsafeConditions] = None,
        telemetry_callback: Optional[Callable[[bytes], None]] = None,
        alert_callback: Optional[Callable[[str, Dict[str, Any]], None]] = None
    ) -> 'DroneAgent':
        """
        Create a DroneAgent by loading keys from secure storage.
        
        Args:
            drone_id: Unique identifier for this drone
            password: Password to decrypt the private key
            cas_public_key_path: Path to CAS public key file
            capabilities: List of supported command types
            failsafe_conditions: Failsafe trigger conditions
            telemetry_callback: Optional callback for sending telemetry
            alert_callback: Optional callback for sending alerts
            
        Returns:
            DroneAgent instance
            
        Raises:
            ValueError: If keys cannot be loaded
        """
        # Load drone private key from secure storage
        key_storage = SecureKeyStorage()
        private_key = key_storage.load_private_key(drone_id, password)
        
        # Load CAS public key
        cas_public_key_file = Path(cas_public_key_path)
        if not cas_public_key_file.exists():
            raise ValueError(f"CAS public key file not found: {cas_public_key_path}")
        
        with open(cas_public_key_file, 'rb') as f:
            cas_public_key_pem = f.read()
        
        cas_public_key = deserialize_public_key(cas_public_key_pem)
        
        return cls(
            drone_id,
            private_key,
            cas_public_key,
            capabilities,
            failsafe_conditions,
            telemetry_callback,
            alert_callback
        )
    
    def start(self) -> None:
        """
        Start the drone agent.
        
        Initializes the agent and prepares it to receive commands.
        Performs initial failsafe check and sends initial telemetry.
        
        Requirements: 7.1, 8.1
        """
        logger.info(f"Starting DroneAgent {self.drone_id}")
        
        # Perform initial failsafe check
        self.failsafe.check_conditions()
        
        # Update status
        if self.failsafe.is_in_failsafe():
            self.status = "FAILSAFE"
        else:
            self.status = "READY"
        
        # Send initial telemetry
        self.send_telemetry()
        
        logger.info(f"DroneAgent {self.drone_id} started - Status: {self.status}")
    
    def receive_command(self, sealed_command_data: bytes) -> Dict[str, Any]:
        """
        Receive and process a sealed command from CAS.
        
        This is the main command processing workflow:
        1. Parse the sealed command
        2. Unseal and decrypt the command
        3. Verify command authenticity and validity
        4. Check failsafe conditions
        5. Execute the command if all checks pass
        6. Generate and send telemetry
        
        Args:
            sealed_command_data: JSON bytes containing the sealed command
            
        Returns:
            Dictionary containing processing result with keys:
            - success: bool indicating if command was executed
            - message: str describing the result
            - command_type: str type of command (if successfully parsed)
            - execution_result: ExecutionResult if command was executed
            
        Requirements: 7.1, 7.5, 8.1, 8.4
        """
        result = {
            "success": False,
            "message": "",
            "command_type": None,
            "execution_result": None
        }
        
        try:
            # Step 1: Parse the sealed command
            logger.info(f"Receiving command for {self.drone_id}")
            sealed_command = SealedCommand.from_bytes(sealed_command_data)
            
            # Step 2: Unseal the command
            logger.debug("Unsealing command")
            try:
                token, signature_valid = unseal_command(
                    sealed_command,
                    self.drone_id,
                    self.cas_public_key
                )
            except Exception as unseal_error:
                # Decryption failure - likely wrong target or tampered command
                error_msg = f"Failed to unseal command: {type(unseal_error).__name__}"
                logger.warning(error_msg)
                self.failsafe.record_invalid_command(error_msg)
                result["message"] = "Command verification failed: Unable to decrypt command"
                self.status = "ERROR"
                self.errors.append(error_msg)
                self.send_telemetry()
                return result
            
            result["command_type"] = token.command_type
            
            if not signature_valid:
                error_msg = "Command signature verification failed"
                logger.warning(error_msg)
                self.failsafe.record_security_violation(
                    "invalid_signature",
                    {"command_type": token.command_type, "reason": error_msg}
                )
                result["message"] = error_msg
                self.status = "ERROR"
                self.errors.append(error_msg)
                self.send_telemetry()
                return result
            
            # Step 3: Verify command completely
            # Decode the signature from base64
            import base64
            signature_bytes = base64.b64decode(sealed_command.signature)
            
            logger.debug("Verifying command")
            is_valid, reason = verify_command_complete(
                token,
                signature_bytes,
                self.drone_id,
                self.cas_public_key
            )
            
            # Record CAS communication
            self.failsafe.record_cas_communication()
            
            if not is_valid:
                logger.warning(f"Command verification failed: {reason}")
                self.failsafe.record_invalid_command(reason)
                result["message"] = f"Command verification failed: {reason}"
                self.status = "ERROR"
                self.errors.append(reason)
                self.send_telemetry()
                return result
            
            # Check and store nonce for replay protection
            if self.nonce_storage.check_nonce_exists(self.drone_id, token.nonce):
                error_msg = "Nonce already used (replay attack detected)"
                logger.warning(error_msg)
                self.failsafe.record_security_violation(
                    "replay_attack",
                    {"command_type": token.command_type, "nonce": token.nonce.hex()}
                )
                result["message"] = error_msg
                self.status = "ERROR"
                self.errors.append(error_msg)
                self.send_telemetry()
                return result
            
            # Store the nonce
            self.nonce_storage.store_nonce(self.drone_id, token.nonce, token.expires_at)
            
            # Step 4: Check failsafe conditions
            logger.debug("Checking failsafe conditions")
            is_emergency_override = (token.command_type == "EMERGENCY_STOP")
            should_reject, reject_reason = self.failsafe.should_reject_command(
                token.command_type,
                is_emergency_override
            )
            
            if should_reject:
                logger.warning(f"Command rejected by failsafe: {reject_reason}")
                result["message"] = f"Command rejected: {reject_reason}"
                self.status = "FAILSAFE"
                self.send_telemetry()
                return result
            
            # Step 5: Execute the command
            logger.info(f"Executing command: {token.command_type}")
            self.status = "EXECUTING"
            execution_result = self.executor.execute(token)
            
            self.last_command_type = token.command_type
            self.last_execution_result = execution_result
            
            if execution_result.success:
                logger.info(f"Command executed successfully: {execution_result.message}")
                result["success"] = True
                result["message"] = execution_result.message
                result["execution_result"] = execution_result
                self.status = "OPERATIONAL"
                
                # Update drone state based on execution
                self._update_state_from_execution(execution_result)
            else:
                logger.error(f"Command execution failed: {execution_result.message}")
                result["message"] = f"Execution failed: {execution_result.message}"
                self.status = "ERROR"
                self.errors.append(execution_result.message)
            
            # Step 6: Send telemetry
            self.send_telemetry()
            
        except Exception as e:
            error_msg = f"Error processing command: {str(e)}"
            logger.error(error_msg, exc_info=True)
            result["message"] = error_msg
            self.status = "ERROR"
            self.errors.append(error_msg)
            self.send_telemetry()
        
        return result
    
    def _update_state_from_execution(self, execution_result: ExecutionResult) -> None:
        """
        Update drone state based on command execution results.
        
        Args:
            execution_result: Result of command execution
        """
        details = execution_result.details
        
        # Update position if available
        if "target_coordinates" in details:
            coords = details["target_coordinates"]
            if len(coords) >= 2:
                self.position[0] = coords[0]  # latitude
                self.position[1] = coords[1]  # longitude
            if len(coords) >= 3:
                self.position[2] = coords[2]  # altitude
        
        if "target_altitude" in details:
            self.position[2] = details["target_altitude"]
        
        # Update status based on command type
        if execution_result.command_type == "LAND":
            self.status = "LANDING"
        elif execution_result.command_type == "EMERGENCY_STOP":
            self.status = "EMERGENCY_STOPPED"
        elif execution_result.command_type == "STATUS":
            # Status command doesn't change state
            pass
    
    def send_telemetry(self) -> Optional[bytes]:
        """
        Collect and send telemetry data to CAS.
        
        Generates telemetry with current drone state, signs it, encrypts it,
        and sends it via the telemetry callback if configured.
        
        Returns:
            Encrypted telemetry bytes if successful, None otherwise
            
        Requirements: 8.4, 8.5, 14.1
        """
        try:
            logger.debug(f"Collecting telemetry for {self.drone_id}")
            
            # Collect and secure telemetry
            encrypted_telemetry = self.telemetry.collect_and_secure(
                position=self.position,
                battery=self.battery,
                status=self.status,
                last_command=self.last_command_type,
                errors=self.errors.copy()
            )
            
            # Send via callback if configured
            if self.telemetry_callback:
                logger.debug("Sending telemetry via callback")
                self.telemetry_callback(encrypted_telemetry)
            
            # Clear errors after sending
            self.errors.clear()
            
            return encrypted_telemetry
            
        except Exception as e:
            logger.error(f"Error sending telemetry: {e}", exc_info=True)
            return None
    
    def shutdown(self) -> None:
        """
        Gracefully shutdown the drone agent.
        
        Sends final telemetry and cleans up resources.
        """
        logger.info(f"Shutting down DroneAgent {self.drone_id}")
        
        self.status = "SHUTDOWN"
        self.send_telemetry()
        
        # Cleanup expired nonces
        cleaned = self.nonce_storage.cleanup_expired(self.drone_id)
        logger.info(f"Cleaned up {cleaned} expired nonces")
        
        logger.info(f"DroneAgent {self.drone_id} shutdown complete")
    
    def get_status(self) -> Dict[str, Any]:
        """
        Get current drone agent status.
        
        Returns:
            Dictionary containing current status information
        """
        return {
            "drone_id": self.drone_id,
            "status": self.status,
            "position": self.position,
            "battery": self.battery,
            "last_command": self.last_command_type,
            "failsafe_state": self.failsafe.get_state_summary(),
            "capabilities": self.executor.capabilities,
            "nonce_count": self.nonce_storage.count_nonces(self.drone_id)
        }
