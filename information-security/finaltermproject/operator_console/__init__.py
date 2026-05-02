"""
Operator Console Package
Provides operator authentication, command building, and console interface.

Requirements: 3.4, 3.5, 14.3
"""

from operator_console.console import OperatorConsole, CommandSubmissionResult
from operator_console.command_builder import CommandBuilder, ValidationResult
from operator_console.auth_client import AuthClient, AuthResponse
from operator_console.session import Session

__all__ = [
    'OperatorConsole',
    'CommandSubmissionResult',
    'CommandBuilder',
    'ValidationResult',
    'AuthClient',
    'AuthResponse',
    'Session'
]
