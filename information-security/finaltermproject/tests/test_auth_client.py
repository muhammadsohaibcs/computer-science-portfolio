"""
Unit tests for operator authentication client.
Tests login, logout, and session management functionality.

Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
"""

import sys
import os

# Add parent directory to path
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

# Import from our local operator_console package (not the built-in operator module)
import importlib.util
spec = importlib.util.spec_from_file_location("operator_console.auth_client", 
                                               os.path.join(parent_dir, "operator_console", "auth_client.py"))
auth_client_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(auth_client_module)
AuthClient = auth_client_module.AuthClient
AuthResponse = auth_client_module.AuthResponse

import pytest
from core.time_utils import get_current_timestamp


class TestAuthClient:
    """Test suite for AuthClient class."""
    
    def test_login_success(self):
        """Test successful login with valid credentials and MFA token."""
        client = AuthClient()
        
        # Valid credentials
        response = client.login("OPERATOR_PILOT_01", "password123", "123456")
        
        assert response.success is True
        assert response.session_token is not None
        assert response.operator_id == "OPERATOR_PILOT_01"
        assert response.expires_at is not None
        assert response.expires_at > get_current_timestamp()
        assert response.error_message is None
    
    def test_login_invalid_mfa(self):
        """Test login failure with invalid MFA token."""
        client = AuthClient()
        
        # Invalid MFA token (not 6 digits)
        response = client.login("OPERATOR_PILOT_01", "password123", "12345")
        
        assert response.success is False
        assert response.session_token is None
        assert response.error_message == "Invalid MFA token"
    
    def test_login_missing_credentials(self):
        """Test login failure with missing credentials."""
        client = AuthClient()
        
        # Missing password
        response = client.login("OPERATOR_PILOT_01", "", "123456")
        
        assert response.success is False
        assert response.error_message == "Username, password, and MFA token are required"
    
    def test_login_invalid_username(self):
        """Test login failure with invalid username format."""
        client = AuthClient()
        
        # Username doesn't start with OPERATOR_
        response = client.login("invalid_user", "password123", "123456")
        
        assert response.success is False
        assert "Invalid credentials" in response.error_message
    
    def test_account_lockout_after_failed_attempts(self):
        """Test account lockout after 3 failed login attempts (Requirement 2.4)."""
        client = AuthClient()
        
        # First failed attempt
        response1 = client.login("invalid_user", "password123", "123456")
        assert response1.success is False
        assert client.failed_attempts == 1
        
        # Second failed attempt
        response2 = client.login("invalid_user", "password123", "123456")
        assert response2.success is False
        assert client.failed_attempts == 2
        
        # Third failed attempt - should lock account
        response3 = client.login("invalid_user", "password123", "123456")
        assert response3.success is False
        assert client.failed_attempts == 3
        assert client.is_locked is True
        
        # Fourth attempt should be rejected due to lock
        response4 = client.login("OPERATOR_PILOT_01", "password123", "123456")
        assert response4.success is False
        assert "Account is locked" in response4.error_message
    
    def test_logout_success(self):
        """Test successful logout."""
        client = AuthClient()
        
        # Login first
        login_response = client.login("OPERATOR_PILOT_01", "password123", "123456")
        assert login_response.success is True
        
        # Logout
        result = client.logout()
        assert result is True
        assert client.current_session_token is None
        assert client.operator_id is None
        assert client.session_expires_at is None
    
    def test_logout_without_session(self):
        """Test logout without active session."""
        client = AuthClient()
        
        # Logout without login
        result = client.logout()
        assert result is False
    
    def test_refresh_session_success(self):
        """Test successful session refresh (Requirement 2.2)."""
        client = AuthClient()
        
        # Login first
        login_response = client.login("OPERATOR_PILOT_01", "password123", "123456")
        assert login_response.success is True
        original_token = login_response.session_token
        
        # Refresh session
        refresh_response = client.refresh_session()
        assert refresh_response.success is True
        assert refresh_response.session_token is not None
        assert refresh_response.session_token != original_token  # New token
        assert refresh_response.operator_id == "OPERATOR_PILOT_01"
        assert refresh_response.expires_at > get_current_timestamp()
    
    def test_refresh_session_without_active_session(self):
        """Test session refresh failure without active session."""
        client = AuthClient()
        
        # Try to refresh without login
        refresh_response = client.refresh_session()
        assert refresh_response.success is False
        assert "No active session" in refresh_response.error_message
    
    def test_get_current_session(self):
        """Test retrieving current session information."""
        client = AuthClient()
        
        # No session initially
        session = client.get_current_session()
        assert session is None
        
        # Login
        login_response = client.login("OPERATOR_PILOT_01", "password123", "123456")
        assert login_response.success is True
        
        # Get session
        session = client.get_current_session()
        assert session is not None
        assert session['session_token'] == login_response.session_token
        assert session['operator_id'] == "OPERATOR_PILOT_01"
        assert session['expires_at'] == login_response.expires_at
    
    def test_is_session_valid(self):
        """Test session validity check."""
        client = AuthClient()
        
        # No session initially
        assert client.is_session_valid() is False
        
        # Login
        login_response = client.login("OPERATOR_PILOT_01", "password123", "123456")
        assert login_response.success is True
        
        # Session should be valid
        assert client.is_session_valid() is True
        
        # Logout
        client.logout()
        
        # Session should be invalid
        assert client.is_session_valid() is False
    
    def test_session_token_uniqueness(self):
        """Test that each login generates a unique session token."""
        client1 = AuthClient()
        client2 = AuthClient()
        
        response1 = client1.login("OPERATOR_PILOT_01", "password123", "123456")
        response2 = client2.login("OPERATOR_PILOT_01", "password123", "123456")
        
        assert response1.success is True
        assert response2.success is True
        assert response1.session_token != response2.session_token
    
    def test_failed_attempts_reset_on_success(self):
        """Test that failed attempts counter resets on successful login."""
        client = AuthClient()
        
        # Failed attempt
        response1 = client.login("invalid_user", "password123", "123456")
        assert response1.success is False
        assert client.failed_attempts == 1
        
        # Successful login should reset counter
        response2 = client.login("OPERATOR_PILOT_01", "password123", "123456")
        assert response2.success is True
        assert client.failed_attempts == 0
