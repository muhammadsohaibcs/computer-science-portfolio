"""
Core constants and configuration for SDRCAS.
Defines cryptographic algorithm identifiers, key sizes, and time tolerances.
"""

import yaml
from pathlib import Path
from typing import Dict, Any

# Cryptographic Algorithm Identifiers
HASH_ALGORITHM = "SHA256"
SIGNATURE_ALGORITHM = "Ed25519"
ENCRYPTION_ALGORITHM = "AES-256-GCM"
KEY_EXCHANGE_ALGORITHM = "X25519"
PQ_KEM_ALGORITHM = "Kyber"
PQ_SIGNATURE_ALGORITHM = "Dilithium"

# Key Sizes (in bytes)
SYMMETRIC_KEY_SIZE = 32  # 256 bits
NONCE_SIZE = 32  # 256 bits for uniqueness
HASH_SIZE = 32  # SHA-256 output
GCM_NONCE_SIZE = 12  # Standard GCM nonce size
GCM_TAG_SIZE = 16  # GCM authentication tag size

# Time Tolerances (in seconds)
DEFAULT_COMMAND_VALIDITY = 5  # Commands valid for 5 seconds
TIMESTAMP_TOLERANCE = 30  # Allow 30 seconds clock skew
SESSION_DURATION = 3600  # 1 hour session duration
KEY_ROTATION_GRACE_PERIOD = 86400  # 24 hours for key rotation overlap

# Security Parameters
MAX_INVALID_COMMANDS = 5  # Failsafe threshold
RATE_LIMIT_WINDOW = 60  # Rate limit window in seconds
RATE_LIMIT_MAX_REQUESTS = 100  # Max requests per window

# Configuration
_config: Dict[str, Any] = {}


def load_config(config_path: str = "config/system_config.yaml") -> Dict[str, Any]:
    """
    Load configuration from YAML file.
    
    Args:
        config_path: Path to the YAML configuration file
        
    Returns:
        Dictionary containing configuration values
    """
    global _config
    
    config_file = Path(config_path)
    if config_file.exists():
        with open(config_file, 'r') as f:
            _config = yaml.safe_load(f) or {}
    else:
        # Return default configuration if file doesn't exist
        _config = {
            'crypto': {
                'hash_algorithm': HASH_ALGORITHM,
                'signature_algorithm': SIGNATURE_ALGORITHM,
                'encryption_algorithm': ENCRYPTION_ALGORITHM,
                'key_exchange_algorithm': KEY_EXCHANGE_ALGORITHM,
                'enable_post_quantum': False
            },
            'timing': {
                'command_validity': DEFAULT_COMMAND_VALIDITY,
                'timestamp_tolerance': TIMESTAMP_TOLERANCE,
                'session_duration': SESSION_DURATION,
                'key_rotation_grace_period': KEY_ROTATION_GRACE_PERIOD
            },
            'security': {
                'max_invalid_commands': MAX_INVALID_COMMANDS,
                'rate_limit_window': RATE_LIMIT_WINDOW,
                'rate_limit_max_requests': RATE_LIMIT_MAX_REQUESTS
            }
        }
    
    return _config


def get_config() -> Dict[str, Any]:
    """
    Get the current configuration.
    
    Returns:
        Dictionary containing configuration values
    """
    global _config
    if not _config:
        load_config()
    return _config


def get_crypto_config() -> Dict[str, Any]:
    """Get cryptographic configuration."""
    return get_config().get('crypto', {})


def get_timing_config() -> Dict[str, Any]:
    """Get timing configuration."""
    return get_config().get('timing', {})


def get_security_config() -> Dict[str, Any]:
    """Get security configuration."""
    return get_config().get('security', {})
