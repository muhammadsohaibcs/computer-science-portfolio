"""
Session management module for SDRCAS operator console.
Handles session validation and renewal for authenticated operators.

Requirements: 2.2, 2.3
"""

from dataclasses import dataclass
from typing import Optional

from core.time_utils import get_current_timestamp, is_expired, calculate_expiration
from core.constants import SESSION_DURATION


@dataclass
class Session:
    """
    Represents an authenticated operator session.
    
    A session is created after successful authentication and provides
    time-limited access to the system. Sessions must be validated before
    accepting command requests and can be renewed to extend validity.
    
    Attributes:
        session_token: Unique cryptographic token identifying the session
        operator_id: Identifier of the authenticated operator
        expires_at: Unix timestamp when the session expires
        device_id: Device identifier for session binding (security requirement)
        created_at: Unix timestamp when the session was created
    
    Requirements: 2.2, 2.3
    """
    session_token: str
    operator_id: str
    expires_at: int
    device_id: Optional[str] = None
    created_at: Optional[int] = None
    
    def __post_init__(self):
        """Initialize created_at if not provided."""
        if self.created_at is None:
            self.created_at = get_current_timestamp()
    
    def is_valid(self) -> bool:
        """
        Check if the session is currently valid.
        
        A session is valid if:
        1. It has not expired (current time < expires_at)
        2. It has all required fields (session_token, operator_id, expires_at)
        
        This method should be called before accepting any command requests
        to ensure the operator's session is still active.
        
        Returns:
            True if the session is valid and not expired, False otherwise
            
        Requirements: 2.2, 2.3
        
        Property 6: Expired sessions reject commands
        For any session with an expiration time in the past, command requests
        should be rejected.
        """
        # Check required fields are present
        if not self.session_token or not self.operator_id or not self.expires_at:
            return False
        
        # Check if session has expired
        if is_expired(self.expires_at):
            return False
        
        return True
    
    def renew(self, duration: Optional[int] = None) -> None:
        """
        Renew the session by extending its expiration time.
        
        This allows operators to maintain continuous access without
        re-authenticating. The session token remains the same, but the
        expiration time is extended from the current time.
        
        Note: This method should only be called on valid sessions.
        Expired sessions should require full re-authentication.
        
        Args:
            duration: Duration in seconds to extend the session
                     (default: SESSION_DURATION from constants)
                     
        Requirements: 2.2, 2.3
        
        Property 5: Session tokens are time-limited
        For any successful authentication, the created session token should
        have an expiration time in the future.
        """
        if duration is None:
            duration = SESSION_DURATION
        
        # Calculate new expiration time from current time
        self.expires_at = calculate_expiration(duration)
    
    def time_remaining(self) -> int:
        """
        Get the time remaining until session expiration.
        
        Returns:
            Seconds remaining until expiration (negative if already expired)
        """
        current_time = get_current_timestamp()
        return self.expires_at - current_time
    
    def is_bound_to_device(self, device_id: str) -> bool:
        """
        Check if the session is bound to a specific device.
        
        This implements the security requirement that sessions should be
        bound to the device they were created on, preventing session hijacking.
        
        Args:
            device_id: Device identifier to check
            
        Returns:
            True if session is bound to the specified device, False otherwise
            
        Requirements: 2.5
        
        Property 7: Session device binding
        For any active session, the session should be bound to exactly one
        device identifier.
        """
        if self.device_id is None:
            # Session not bound to any device
            return False
        
        return self.device_id == device_id
