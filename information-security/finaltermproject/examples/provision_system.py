#!/usr/bin/env python3
"""
Example Provisioning Script for SDRCAS
Demonstrates enrolling drones and operators, generating and distributing keys.

This script shows the complete provisioning workflow:
1. Generate CAS master keypair
2. Enroll drones with certificates
3. Enroll operators with role-based credentials
4. Register all entities with the CAS

Requirements: 1.1, 1.2, 1.3
"""

import sys
import os
from pathlib import Path

# Add parent directory to path for imports
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from core.authentication import generate_keypair, serialize_private_key, serialize_public_key
from provisioning.device_enrollment import (
    enroll_drone,
    register_drone_with_cas,
    save_drone_credentials
)
from provisioning.operator_enrollment import (
    enroll_operator,
    register_operator_with_cas,
    save_operator_credentials,
    ROLE_ADMIN,
    ROLE_PILOT,
    ROLE_OBSERVER
)
from drone.secure_storage import SecureKeyStorage


def print_header(text: str) -> None:
    """Print a formatted header."""
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}\n")


def provision_cas() -> tuple:
    """
    Provision the Command Authorization Server with a master keypair.
    
    Returns:
        Tuple of (private_key, public_key)
    """
    print_header("Step 1: Provisioning CAS Master Keys")
    
    # Generate CAS master keypair
    print("Generating CAS master keypair...")
    cas_private_key, cas_public_key = generate_keypair()
    
    # Create CAS data directory
    cas_dir = Path("data/cas")
    cas_dir.mkdir(parents=True, exist_ok=True)
    
    # Save CAS keys
    print("Saving CAS keys...")
    
    # Save private key (encrypted with password)
    cas_password = b"cas_master_password_change_in_production"
    cas_private_pem = serialize_private_key(cas_private_key, cas_password)
    with open(cas_dir / "cas_private_key.pem", 'wb') as f:
        f.write(cas_private_pem)
    
    # Save public key
    cas_public_pem = serialize_public_key(cas_public_key)
    with open(cas_dir / "cas_public_key.pem", 'wb') as f:
        f.write(cas_public_pem)
    
    print(f"✓ CAS keys saved to {cas_dir}")
    print(f"  - Private key: cas_private_key.pem (encrypted)")
    print(f"  - Public key: cas_public_key.pem")
    
    return cas_private_key, cas_public_key


def provision_drones(cas_private_key, cas_public_key) -> list:
    """
    Provision multiple drones with keys and certificates.
    
    Args:
        cas_private_key: CAS private key for signing certificates
        cas_public_key: CAS public key
        
    Returns:
        List of provisioned drone IDs
    """
    print_header("Step 2: Provisioning Drones")
    
    # Define drones to provision
    drones = [
        {
            'id': 'DRONE_01',
            'capabilities': ['MOVE', 'LAND', 'STATUS', 'EMERGENCY_STOP'],
            'password': 'drone01_password'
        },
        {
            'id': 'DRONE_02',
            'capabilities': ['MOVE', 'LAND', 'STATUS', 'EMERGENCY_STOP'],
            'password': 'drone02_password'
        },
        {
            'id': 'DRONE_03',
            'capabilities': ['MOVE', 'LAND', 'STATUS', 'EMERGENCY_STOP'],
            'password': 'drone03_password'
        }
    ]
    
    provisioned_drones = []
    key_storage = SecureKeyStorage()
    
    for drone_config in drones:
        drone_id = drone_config['id']
        capabilities = drone_config['capabilities']
        password = drone_config['password']
        
        print(f"\nProvisioning {drone_id}...")
        
        # Enroll drone (generate keys and certificate)
        private_key, public_key, certificate = enroll_drone(
            drone_id=drone_id,
            issuer_name="CAS",
            issuer_private_key=cas_private_key,
            capabilities=capabilities
        )
        
        # Save drone credentials
        save_drone_credentials(
            drone_id=drone_id,
            private_key=private_key,
            certificate=certificate,
            password=password.encode('utf-8')
        )
        
        # Also save to secure storage for drone agent
        key_storage.store_private_key(
            drone_id=drone_id,
            private_key=private_key,
            password=password
        )
        
        # Register with CAS
        register_drone_with_cas(
            drone_id=drone_id,
            public_key=public_key,
            capabilities=capabilities
        )
        
        print(f"✓ {drone_id} provisioned successfully")
        print(f"  - Capabilities: {', '.join(capabilities)}")
        print(f"  - Certificate issued by: {certificate.issuer}")
        print(f"  - Valid until: {certificate.valid_until}")
        
        provisioned_drones.append(drone_id)
    
    print(f"\n✓ Total drones provisioned: {len(provisioned_drones)}")
    
    return provisioned_drones


def provision_operators(cas_private_key, cas_public_key) -> list:
    """
    Provision multiple operators with keys and role-based certificates.
    
    Args:
        cas_private_key: CAS private key for signing certificates
        cas_public_key: CAS public key
        
    Returns:
        List of provisioned operator IDs
    """
    print_header("Step 3: Provisioning Operators")
    
    # Define operators to provision
    operators = [
        {
            'id': 'OPERATOR_ADMIN',
            'roles': [ROLE_ADMIN],
            'password': 'admin_password'
        },
        {
            'id': 'OPERATOR_PILOT_01',
            'roles': [ROLE_PILOT],
            'password': 'pilot01_password'
        },
        {
            'id': 'OPERATOR_PILOT_02',
            'roles': [ROLE_PILOT],
            'password': 'pilot02_password'
        },
        {
            'id': 'OPERATOR_OBSERVER',
            'roles': [ROLE_OBSERVER],
            'password': 'observer_password'
        }
    ]
    
    provisioned_operators = []
    
    for operator_config in operators:
        operator_id = operator_config['id']
        roles = operator_config['roles']
        password = operator_config['password']
        
        print(f"\nProvisioning {operator_id}...")
        
        # Enroll operator (generate keys and certificate)
        private_key, public_key, certificate = enroll_operator(
            operator_id=operator_id,
            roles=roles,
            issuer_name="CAS",
            issuer_private_key=cas_private_key
        )
        
        # Save operator credentials
        save_operator_credentials(
            operator_id=operator_id,
            private_key=private_key,
            certificate=certificate,
            password=password.encode('utf-8')
        )
        
        # Register with CAS
        register_operator_with_cas(
            operator_id=operator_id,
            public_key=public_key,
            roles=roles
        )
        
        print(f"✓ {operator_id} provisioned successfully")
        print(f"  - Roles: {', '.join(roles)}")
        print(f"  - Allowed commands: {', '.join(certificate.attributes['allowed_commands'])}")
        print(f"  - Certificate issued by: {certificate.issuer}")
        
        provisioned_operators.append(operator_id)
    
    print(f"\n✓ Total operators provisioned: {len(provisioned_operators)}")
    
    return provisioned_operators


def print_summary(drones: list, operators: list) -> None:
    """
    Print a summary of the provisioning process.
    
    Args:
        drones: List of provisioned drone IDs
        operators: List of provisioned operator IDs
    """
    print_header("Provisioning Summary")
    
    print("✓ CAS Master Keys Generated")
    print(f"  Location: data/cas/")
    
    print(f"\n✓ {len(drones)} Drones Provisioned:")
    for drone_id in drones:
        print(f"  - {drone_id}")
        print(f"    Keys: data/drones/{drone_id}/")
        print(f"    CAS Registration: data/cas/drones/{drone_id}.json")
    
    print(f"\n✓ {len(operators)} Operators Provisioned:")
    for operator_id in operators:
        print(f"  - {operator_id}")
        print(f"    Keys: data/operators/{operator_id}/")
        print(f"    CAS Registration: data/cas/operators/{operator_id}.json")
    
    print("\n" + "="*60)
    print("  Provisioning Complete!")
    print("="*60)
    
    print("\nNext Steps:")
    print("1. Start the CAS server:")
    print("   python cas_main.py")
    print("\n2. Start a drone agent:")
    print("   python drone_main.py DRONE_01 drone01_password")
    print("\n3. Start the operator console:")
    print("   python operator_main.py")
    print("   Then login with: login OPERATOR_PILOT_01 pilot01_password 123456")
    print()


def main():
    """
    Main provisioning workflow.
    """
    print("""
╔═══════════════════════════════════════════════════════════╗
║   SDRCAS System Provisioning Script                      ║
║   Secure Drone Command Authorization System              ║
╚═══════════════════════════════════════════════════════════╝
    """)
    
    try:
        # Step 1: Provision CAS
        cas_private_key, cas_public_key = provision_cas()
        
        # Step 2: Provision Drones
        drones = provision_drones(cas_private_key, cas_public_key)
        
        # Step 3: Provision Operators
        operators = provision_operators(cas_private_key, cas_public_key)
        
        # Print summary
        print_summary(drones, operators)
        
        return 0
        
    except Exception as e:
        print(f"\n✗ Provisioning failed: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
