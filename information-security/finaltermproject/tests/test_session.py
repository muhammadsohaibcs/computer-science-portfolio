"""
Unit tests for operator session management.
Tests session validation, renewal, and device binding functionality.

Requirements: 2.2, 2.3, 2.5
"""

import sys
import os
import time

# Add parent directory to path
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

import pytest

# Import from our local operator_console package (not the built-in operator module)
import importlib.util
spec = importlib.util.spec_from_file_location("operator_console.session", 
                                               os.path.join(parent_dir, "operator_console", "session.py"))
session_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(session_module)
Session = session_module.Session

from core.time_utils import get_current_timestamp, calculate_expiration
from core.constants import SESSION_DURATION


class TestSession:
    """Test suite for Session class."""
    
    def test_session_creation(self):
        """Test creating a new session with required fields."""
        current_time = get_current_timestamp()
        expires_at = calculate_expiration(SESSION_DURATION)
        
        session = Session(
            session_token="test_token_123",
            operator_id="OPERATOR_PILOT_01",
            expires_at=expires_at
        )
        
        assert session.session_token == "test_token_123"
        assert session.operator_id == "OPERATOR_PILOT_01"
        assert session.expires_at == expires_at
        assert session.created_at is not None
        assert session.created_at >= current_time
    
    def test_session_creation_with_device_id(self):
        """Test creating a session with device binding (Requirement 2.5)."""
        expires_at = calculate_expiration(SESSION_DURATION)
        
        session = Session(
            session_token="test_token_123",
            operator_id="OPERATOR_PILOT_01",
            expires_at=expires_at,
            device_id="DEVICE_001"
        )
        
        assert session.device_id == "DEVICE_001"
    
    def test_is_valid_with_valid_session(self):
        """Test is_valid returns True for non-expired session (Requirement 2.2)."""
        expires_at = calculate_expiration(SESSION_DURATION)
        
        session = Session(
            session_token="test_token_123",
            operator_id="OPERATOR_PILOT_01",
            expires_at=expires_at
        )
        
        assert session.is_valid() is True
    
    def test_is_valid_with_expired_session(self):
        """
        Test is_valid returns False for expired session (Requirement 2.3).
        
        Property 6: Expired sessions reject commands
        For any session with an expiration time in the past, command requests
        should be rejected.
        """
        # Create session that expired 10 seconds ago
        current_time = get_current_timestamp()
        expired_time = current_time - 10
        
        session = Session(
            session_token="test_token_123",
            operator_id="OPERATOR_PILOT_01",
            expires_at=expired_time
        )
        
        assert session.is_valid() is False
    
    def test_is_valid_with_missing_token(self):
        """Test is_valid returns False when session_token is missing."""
        expires_at = calculate_expiration(SESSION_DURATION)
        
        session = Session(
            session_token="",
            operator_id="OPERATOR_PILOT_01",
            expires_at=expires_at
        )
        
        assert session.is_valid() is False
    
    def test_is_valid_with_missing_operator_id(self):
        """Test is_valid returns False when operator_id is missing."""
        expires_at = calculate_expiration(SESSION_DURATION)
        
        session = Session(
            session_token="test_token_123",
            operator_id="",
            expires_at=expires_at
        )
        
        assert session.is_valid() is False
    
    def test_renew_extends_expiration(self):
        """
        Test renew extends session expiration time (Requirement 2.2).
        
        Property 5: Session tokens are time-limited
        For any successful authentication, the created session token should
        have an expiration time in the future.
        """
        # Create session expiring in 10 seconds
        current_time = get_current_timestamp()
        short_expiration = current_time + 10
        
        session = Session(
            session_token="test_token_123",
            operator_id="OPERATOR_PILOT_01",
            expires_at=short_expiration
        )
        
        original_expiration = session.expires_at
        
        # Renew session
        session.renew()
        
        # Expiration should be extended
        assert session.expires_at > original_expiration
        assert session.expires_at > get_current_timestamp()
        # Should be approximately SESSION_DURATION seconds from now
        assert session.expires_at >= get_current_timestamp() + SESSION_DURATION - 2
    
    def test_renew_with_custom_duration(self):
        """Test renew with custom duration."""
        expires_at = calculate_expiration(SESSION_DURATION)
        
        session = Session(
            session_token="test_token_123",
            operator_id="OPERATOR_PILOT_01",
            expires_at=expires_at
        )
        
        # Renew with custom duration of 7200 seconds (2 hours)
        custom_duration = 7200
        session.renew(duration=custom_duration)
        
        # Expiration should be approximately custom_duration seconds from now
        expected_expiration = get_current_timestamp() + custom_duration
        assert abs(session.expires_at - expected_expiration) <= 2
    
    def test_renew_keeps_same_token(self):
        """Test that renew keeps the same session token."""
        expires_at = calculate_expiration(SESSION_DURATION)
        
        session = Session(
            session_token="test_token_123",
            operator_id="OPERATOR_PILOT_01",
            expires_at=expires_at
        )
        
        original_token = session.session_token
        
        # Renew session
        session.renew()
        
        # Token should remain the same
        assert session.session_token == original_token
    
    def test_time_remaining_positive(self):
        """Test time_remaining returns positive value for valid session."""
        expires_at = calculate_expiration(3600)  # 1 hour from now
        
        session = Session(
            session_token="test_token_123",
            operator_id="OPERATOR_PILOT_01",
            expires_at=expires_at
        )
        
        remaining = session.time_remaining()
        assert remaining > 0
        assert remaining <= 3600
    
    def test_time_remaining_negative(self):
        """Test time_remaining returns negative value for expired session."""
        current_time = get_current_timestamp()
        expired_time = current_time - 100  # Expired 100 seconds ago
        
        session = Session(
            session_token="test_token_123",
            operator_id="OPERATOR_PILOT_01",
            expires_at=expired_time
        )
        
        remaining = session.time_remaining()
        assert remaining < 0
        assert remaining >= -102  # Allow small timing variance
    
    def test_is_bound_to_device_with_matching_device(self):
        """
        Test is_bound_to_device returns True for matching device (Requirement 2.5).
        
        Property 7: Session device binding
        For any active session, the session should be bound to exactly one
        device identifier.
        """
        expires_at = calculate_expiration(SESSION_DURATION)
        
        session = Session(
            session_token="test_token_123",
            operator_id="OPERATOR_PILOT_01",
            expires_at=expires_at,
            device_id="DEVICE_001"
        )
        
        assert session.is_bound_to_device("DEVICE_001") is True
    
    def test_is_bound_to_device_with_different_device(self):
        """Test is_bound_to_device returns False for different device."""
        expires_at = calculate_expiration(SESSION_DURATION)
        
        session = Session(
            session_token="test_token_123",
            operator_id="OPERATOR_PILOT_01",
            expires_at=expires_at,
            device_id="DEVICE_001"
        )
        
        assert session.is_bound_to_device("DEVICE_002") is False
    
    def test_is_bound_to_device_without_binding(self):
        """Test is_bound_to_device returns False when session has no device binding."""
        expires_at = calculate_expiration(SESSION_DURATION)
        
        session = Session(
            session_token="test_token_123",
            operator_id="OPERATOR_PILOT_01",
            expires_at=expires_at,
            device_id=None
        )
        
        assert session.is_bound_to_device("DEVICE_001") is False
    
    def test_session_expiration_boundary(self):
        """Test session validity at exact expiration boundary."""
        # Create session that expires in 1 second
        current_time = get_current_timestamp()
        expires_at = current_time + 1
        
        session = Session(
            session_token="test_token_123",
            operator_id="OPERATOR_PILOT_01",
            expires_at=expires_at
        )
        
        # Should be valid now
        assert session.is_valid() is True
        
        # Wait for expiration
        time.sleep(1.1)
        
        # Should be invalid after expiration
        assert session.is_valid() is False
    
    def test_multiple_renewals(self):
        """Test that a session can be renewed multiple times."""
        expires_at = calculate_expiration(10)  # Short initial duration
        
        session = Session(
            session_token="test_token_123",
            operator_id="OPERATOR_PILOT_01",
            expires_at=expires_at
        )
        
        # First renewal
        session.renew(duration=100)
        first_expiration = session.expires_at
        
        # Second renewal
        session.renew(duration=200)
        second_expiration = session.expires_at
        
        # Each renewal should extend the expiration
        assert second_expiration > first_expiration
        assert session.is_valid() is True
