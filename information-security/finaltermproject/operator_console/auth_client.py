"""
Authentication client module for SDRCAS operator console.
Handles operator login, logout, and session management with the CAS.
Supports multi-factor authentication (MFA) token validation.

Requirements: 2.1, 2.2
"""

import json
import hashlib
from typing import Optional, Dict, Any
from dataclasses import dataclass, asdict

from core.time_utils import get_current_timestamp, calculate_expiration
from core.crypto_math import secure_random_bytes
from core.authentication import generate_keypair, sign, verify_signature, serialize_public_key
from core.constants import SESSION_DURATION


@dataclass
class AuthResponse:
    """
    Response from authentication request.
    
    Attributes:
        success: Whether authentication was successful
        session_token: Session token if successful
        operator_id: Operator identifier
        expires_at: Session expiration timestamp
        error_message: Error message if authentication failed
    """
    success: bool
    session_token: Optional[str] = None
    operator_id: Optional[str] = None
    expires_at: Optional[int] = None
    error_message: Optional[str] = None


class AuthClient:
    """
    Authentication client for operator console.
    
    Manages authentication with the CAS, including login, logout,
    and session token refresh. Supports MFA token validation.
    
    Requirements: 2.1, 2.2
    """
    
    def __init__(self, cas_address: str = "localhost:8443"):
        """
        Initialize the authentication client.
        
        Args:
            cas_address: Address of the Command Authorization Server
        """
        self.cas_address = cas_address
        self.current_session_token: Optional[str] = None
        self.operator_id: Optional[str] = None
        self.session_expires_at: Optional[int] = None
        self.failed_attempts: int = 0
        self.max_failed_attempts: int = 3
        self.is_locked: bool = False
    
    def login(self, username: str, password: str, mfa_token: str) -> AuthResponse:
        """
        Authenticate an operator with username, password, and MFA token.
        
        This method performs multi-factor authentication by validating:
        1. Username and password credentials
        2. MFA token (time-based or hardware token)
        
        On successful authentication, creates a time-limited session token.
        After 3 failed attempts, locks the account.
        
        Args:
            username: Operator username/identifier
            password: Operator password
            mfa_token: Multi-factor authentication token
            
        Returns:
            AuthResponse containing session token if successful, error otherwise
            
        Requirements: 2.1, 2.2
        """
        # Check if account is locked
        if self.is_locked:
            return AuthResponse(
                success=False,
                error_message="Account is locked due to multiple failed authentication attempts. Contact administrator."
            )
        
        # Validate inputs
        if not username or not password or not mfa_token:
            self.failed_attempts += 1
            self._check_lock_account()
            return AuthResponse(
                success=False,
                error_message="Username, password, and MFA token are required"
            )
        
        # In a real implementation, this would communicate with the CAS
        # For now, we simulate the authentication process
        
        # Hash the password (in real implementation, this would be sent securely to CAS)
        password_hash = self._hash_password(password)
        
        # Validate MFA token (in real implementation, CAS would validate this)
        if not self._validate_mfa_token(mfa_token):
            self.failed_attempts += 1
            self._check_lock_account()
            return AuthResponse(
                success=False,
                error_message="Invalid MFA token"
            )
        
        # Simulate CAS authentication check
        # In real implementation, this would be an API call to CAS
        auth_result = self._authenticate_with_cas(username, password_hash, mfa_token)
        
        if not auth_result['success']:
            self.failed_attempts += 1
            self._check_lock_account()
            return AuthResponse(
                success=False,
                error_message=auth_result.get('error', 'Authentication failed')
            )
        
        # Reset failed attempts on successful login
        self.failed_attempts = 0
        
        # Create session token
        session_token = self._generate_session_token(username)
        expires_at = calculate_expiration(SESSION_DURATION)
        
        # Store session information
        self.current_session_token = session_token
        self.operator_id = username
        self.session_expires_at = expires_at
        
        return AuthResponse(
            success=True,
            session_token=session_token,
            operator_id=username,
            expires_at=expires_at
        )
    
    def logout(self) -> bool:
        """
        Log out the current operator and invalidate the session token.
        
        Clears all session information and notifies the CAS to invalidate
        the session token.
        
        Returns:
            True if logout successful, False otherwise
            
        Requirements: 2.2
        """
        if not self.current_session_token:
            return False
        
        # In real implementation, notify CAS to invalidate the session
        self._invalidate_session_with_cas(self.current_session_token)
        
        # Clear local session information
        self.current_session_token = None
        self.operator_id = None
        self.session_expires_at = None
        
        return True
    
    def refresh_session(self) -> AuthResponse:
        """
        Refresh the current session token to extend its validity.
        
        Requests a new session token from the CAS before the current one expires.
        This allows operators to maintain continuous access without re-authenticating.
        
        Returns:
            AuthResponse with new session token if successful, error otherwise
            
        Requirements: 2.2
        """
        # Check if there's an active session
        if not self.current_session_token or not self.operator_id:
            return AuthResponse(
                success=False,
                error_message="No active session to refresh"
            )
        
        # Check if session has already expired
        current_time = get_current_timestamp()
        if self.session_expires_at and current_time >= self.session_expires_at:
            # Session expired, clear it
            self.current_session_token = None
            self.operator_id = None
            self.session_expires_at = None
            return AuthResponse(
                success=False,
                error_message="Session has expired. Please log in again."
            )
        
        # In real implementation, this would communicate with CAS to refresh token
        refresh_result = self._refresh_session_with_cas(
            self.current_session_token,
            self.operator_id
        )
        
        if not refresh_result['success']:
            return AuthResponse(
                success=False,
                error_message=refresh_result.get('error', 'Session refresh failed')
            )
        
        # Generate new session token
        new_session_token = self._generate_session_token(self.operator_id)
        new_expires_at = calculate_expiration(SESSION_DURATION)
        
        # Update session information
        self.current_session_token = new_session_token
        self.session_expires_at = new_expires_at
        
        return AuthResponse(
            success=True,
            session_token=new_session_token,
            operator_id=self.operator_id,
            expires_at=new_expires_at
        )
    
    def get_current_session(self) -> Optional[Dict[str, Any]]:
        """
        Get information about the current session.
        
        Returns:
            Dictionary with session information, or None if no active session
        """
        if not self.current_session_token:
            return None
        
        return {
            'session_token': self.current_session_token,
            'operator_id': self.operator_id,
            'expires_at': self.session_expires_at
        }
    
    def is_session_valid(self) -> bool:
        """
        Check if the current session is valid (exists and not expired).
        
        Returns:
            True if session is valid, False otherwise
        """
        if not self.current_session_token or not self.session_expires_at:
            return False
        
        current_time = get_current_timestamp()
        return current_time < self.session_expires_at
    
    # Private helper methods
    
    def _hash_password(self, password: str) -> str:
        """
        Hash a password using SHA-256.
        
        In production, use a proper password hashing algorithm like bcrypt or Argon2.
        
        Args:
            password: Plain text password
            
        Returns:
            Hexadecimal hash string
        """
        return hashlib.sha256(password.encode('utf-8')).hexdigest()
    
    def _validate_mfa_token(self, mfa_token: str) -> bool:
        """
        Validate an MFA token.
        
        In real implementation, this would validate against a TOTP algorithm
        or hardware token service.
        
        Args:
            mfa_token: MFA token to validate
            
        Returns:
            True if token is valid, False otherwise
        """
        # Simplified validation - in production, use proper TOTP validation
        # For now, accept tokens that are 6 digits
        return len(mfa_token) == 6 and mfa_token.isdigit()
    
    def _generate_session_token(self, operator_id: str) -> str:
        """
        Generate a cryptographically secure session token.
        
        Args:
            operator_id: Operator identifier
            
        Returns:
            Session token string
        """
        # Generate random bytes and combine with operator ID and timestamp
        random_bytes = secure_random_bytes(32)
        timestamp = str(get_current_timestamp())
        token_data = f"{operator_id}:{timestamp}:{random_bytes.hex()}"
        
        # Hash to create final token
        token_hash = hashlib.sha256(token_data.encode('utf-8')).hexdigest()
        return token_hash
    
    def _check_lock_account(self) -> None:
        """
        Check if account should be locked due to failed attempts.
        
        Requirements: 2.4
        """
        if self.failed_attempts >= self.max_failed_attempts:
            self.is_locked = True
    
    def _authenticate_with_cas(self, username: str, password_hash: str, mfa_token: str) -> Dict[str, Any]:
        """
        Authenticate with the Command Authorization Server.
        
        In real implementation, this would make an API call to the CAS.
        For now, we simulate the authentication.
        
        Args:
            username: Operator username
            password_hash: Hashed password
            mfa_token: MFA token
            
        Returns:
            Dictionary with authentication result
        """
        # Simulated authentication - in production, this would be an API call
        # For demonstration, accept any username that starts with "OPERATOR_"
        if username.startswith("OPERATOR_") and len(password_hash) > 0:
            return {'success': True}
        else:
            return {'success': False, 'error': 'Invalid credentials'}
    
    def _invalidate_session_with_cas(self, session_token: str) -> bool:
        """
        Notify CAS to invalidate a session token.
        
        In real implementation, this would make an API call to the CAS.
        
        Args:
            session_token: Session token to invalidate
            
        Returns:
            True if successful, False otherwise
        """
        # Simulated - in production, this would be an API call
        return True
    
    def _refresh_session_with_cas(self, session_token: str, operator_id: str) -> Dict[str, Any]:
        """
        Request session refresh from CAS.
        
        In real implementation, this would make an API call to the CAS.
        
        Args:
            session_token: Current session token
            operator_id: Operator identifier
            
        Returns:
            Dictionary with refresh result
        """
        # Simulated - in production, this would be an API call
        return {'success': True}
