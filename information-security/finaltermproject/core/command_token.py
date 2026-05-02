"""
Command Token data model and serialization for SDRCAS.
Provides CommandToken dataclass with validation and JSON-based serialization.
"""

import json
import base64
from dataclasses import dataclass, asdict
from typing import Dict, Any, Optional

from .crypto_math import generate_nonce
from .time_utils import get_current_timestamp, calculate_expiration
from .constants import DEFAULT_COMMAND_VALIDITY


@dataclass
class CommandToken:
    """
    Represents a cryptographically sealed command with metadata.
    
    Attributes:
        command_type: Type of command (MOVE, LAND, STATUS, EMERGENCY_STOP)
        target_drone_id: Identifier of the target drone
        parameters: Command-specific parameters as a dictionary
        issued_at: Unix timestamp when the command was issued
        expires_at: Unix timestamp when the command expires
        nonce: Unique nonce to prevent replay attacks (32 bytes)
        issuer: Identifier of the operator who issued the command
    """
    command_type: str
    target_drone_id: str
    parameters: Dict[str, Any]
    issued_at: int
    expires_at: int
    nonce: bytes
    issuer: str
    
    def __post_init__(self):
        """Validate the CommandToken fields after initialization."""
        # Validate command_type
        valid_command_types = {"MOVE", "LAND", "STATUS", "EMERGENCY_STOP"}
        if self.command_type not in valid_command_types:
            raise ValueError(
                f"Invalid command_type: {self.command_type}. "
                f"Must be one of {valid_command_types}"
            )
        
        # Validate target_drone_id
        if not self.target_drone_id or not isinstance(self.target_drone_id, str):
            raise ValueError("target_drone_id must be a non-empty string")
        
        # Validate parameters
        if not isinstance(self.parameters, dict):
            raise ValueError("parameters must be a dictionary")
        
        # Validate timestamps
        if not isinstance(self.issued_at, int) or self.issued_at < 0:
            raise ValueError("issued_at must be a non-negative integer")
        
        if not isinstance(self.expires_at, int) or self.expires_at < 0:
            raise ValueError("expires_at must be a non-negative integer")
        
        if self.expires_at <= self.issued_at:
            raise ValueError("expires_at must be greater than issued_at")
        
        # Validate nonce
        if not isinstance(self.nonce, bytes):
            raise ValueError("nonce must be bytes")
        
        if len(self.nonce) != 32:
            raise ValueError("nonce must be exactly 32 bytes")
        
        # Validate issuer
        if not self.issuer or not isinstance(self.issuer, str):
            raise ValueError("issuer must be a non-empty string")
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert CommandToken to a dictionary with base64-encoded nonce.
        
        Returns:
            Dictionary representation of the CommandToken
        """
        return {
            "command_type": self.command_type,
            "target_drone_id": self.target_drone_id,
            "parameters": self.parameters,
            "issued_at": self.issued_at,
            "expires_at": self.expires_at,
            "nonce": base64.b64encode(self.nonce).decode('utf-8'),
            "issuer": self.issuer
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'CommandToken':
        """
        Create a CommandToken from a dictionary with base64-encoded nonce.
        
        Args:
            data: Dictionary containing CommandToken fields
            
        Returns:
            CommandToken instance
            
        Raises:
            ValueError: If required fields are missing or invalid
            KeyError: If required fields are missing
        """
        # Decode the nonce from base64
        nonce_str = data.get("nonce")
        if not nonce_str:
            raise ValueError("nonce field is required")
        
        try:
            nonce = base64.b64decode(nonce_str)
        except Exception as e:
            raise ValueError(f"Invalid base64 encoding for nonce: {e}")
        
        return cls(
            command_type=data["command_type"],
            target_drone_id=data["target_drone_id"],
            parameters=data["parameters"],
            issued_at=data["issued_at"],
            expires_at=data["expires_at"],
            nonce=nonce,
            issuer=data["issuer"]
        )


def create_command_token(
    command_type: str,
    target_drone_id: str,
    parameters: Dict[str, Any],
    issuer: str,
    validity_duration: Optional[int] = None,
    nonce: Optional[bytes] = None,
    issued_at: Optional[int] = None
) -> CommandToken:
    """
    Create a new CommandToken with automatic timestamp and nonce generation.
    
    Args:
        command_type: Type of command (MOVE, LAND, STATUS, EMERGENCY_STOP)
        target_drone_id: Identifier of the target drone
        parameters: Command-specific parameters
        issuer: Identifier of the operator issuing the command
        validity_duration: How long the command is valid (seconds, default: DEFAULT_COMMAND_VALIDITY)
        nonce: Optional pre-generated nonce (default: auto-generated)
        issued_at: Optional issued timestamp (default: current time)
        
    Returns:
        A new CommandToken instance
        
    Raises:
        ValueError: If any validation fails
    """
    # Generate timestamp if not provided
    if issued_at is None:
        issued_at = get_current_timestamp()
    
    # Calculate expiration
    if validity_duration is None:
        validity_duration = DEFAULT_COMMAND_VALIDITY
    
    expires_at = issued_at + validity_duration
    
    # Generate nonce if not provided
    if nonce is None:
        nonce = generate_nonce()
    
    return CommandToken(
        command_type=command_type,
        target_drone_id=target_drone_id,
        parameters=parameters,
        issued_at=issued_at,
        expires_at=expires_at,
        nonce=nonce,
        issuer=issuer
    )


def serialize_token(token: CommandToken) -> bytes:
    """
    Serialize a CommandToken to JSON bytes.
    
    Args:
        token: The CommandToken to serialize
        
    Returns:
        JSON-encoded bytes representation of the token
    """
    token_dict = token.to_dict()
    json_str = json.dumps(token_dict, sort_keys=True)
    return json_str.encode('utf-8')


def deserialize_token(data: bytes) -> CommandToken:
    """
    Deserialize a CommandToken from JSON bytes.
    
    Args:
        data: JSON-encoded bytes containing the token
        
    Returns:
        CommandToken instance
        
    Raises:
        ValueError: If the data is invalid or cannot be parsed
        json.JSONDecodeError: If the JSON is malformed
    """
    try:
        json_str = data.decode('utf-8')
        token_dict = json.loads(json_str)
        return CommandToken.from_dict(token_dict)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON data: {e}")
    except UnicodeDecodeError as e:
        raise ValueError(f"Invalid UTF-8 encoding: {e}")
