"""
Provisioning components for SDRCAS.
Provides certificate issuance, device enrollment, and operator enrollment.
"""

from .cert_issuer import (
    Certificate,
    issue_certificate,
    verify_certificate,
    get_certificate_public_key,
    save_certificate,
    load_certificate
)

from .device_enrollment import (
    enroll_drone,
    register_drone_with_cas,
    save_drone_credentials,
    get_drone_info,
    list_registered_drones
)

from .operator_enrollment import (
    enroll_operator,
    issue_operator_certificate,
    register_operator_with_cas,
    save_operator_credentials,
    get_operator_info,
    list_registered_operators,
    validate_roles,
    ROLE_ADMIN,
    ROLE_PILOT,
    ROLE_OBSERVER,
    ROLE_EMERGENCY,
    ROLE_PERMISSIONS
)

__all__ = [
    # Certificate issuer
    'Certificate',
    'issue_certificate',
    'verify_certificate',
    'get_certificate_public_key',
    'save_certificate',
    'load_certificate',
    
    # Device enrollment
    'enroll_drone',
    'register_drone_with_cas',
    'save_drone_credentials',
    'get_drone_info',
    'list_registered_drones',
    
    # Operator enrollment
    'enroll_operator',
    'issue_operator_certificate',
    'register_operator_with_cas',
    'save_operator_credentials',
    'get_operator_info',
    'list_registered_operators',
    'validate_roles',
    'ROLE_ADMIN',
    'ROLE_PILOT',
    'ROLE_OBSERVER',
    'ROLE_EMERGENCY',
    'ROLE_PERMISSIONS'
]
