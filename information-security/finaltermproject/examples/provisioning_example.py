"""
Example script demonstrating the provisioning workflow.
Shows how to enroll drones and operators with the CAS.
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.authentication import generate_keypair
from provisioning import (
    enroll_drone,
    register_drone_with_cas,
    save_drone_credentials,
    enroll_operator,
    register_operator_with_cas,
    save_operator_credentials,
    verify_certificate,
    ROLE_ADMIN,
    ROLE_PILOT,
    ROLE_OBSERVER
)


def main():
    print("=" * 60)
    print("SDRCAS Provisioning Example")
    print("=" * 60)
    
    # Step 1: Generate CAS keypair (issuer)
    print("\n1. Generating CAS (issuer) keypair...")
    cas_private_key, cas_public_key = generate_keypair()
    print("   ✓ CAS keypair generated")
    
    # Step 2: Enroll drones
    print("\n2. Enrolling drones...")
    
    drone_ids = ["DRONE_01", "DRONE_02", "DRONE_03"]
    drones = {}
    
    for drone_id in drone_ids:
        print(f"   Enrolling {drone_id}...")
        
        # Enroll drone (generates keys and certificate)
        private_key, public_key, certificate = enroll_drone(
            drone_id=drone_id,
            issuer_name="CAS",
            issuer_private_key=cas_private_key,
            capabilities=["MOVE", "LAND", "STATUS", "EMERGENCY_STOP"]
        )
        
        # Verify certificate
        is_valid = verify_certificate(certificate, cas_public_key)
        print(f"   ✓ {drone_id} enrolled, certificate valid: {is_valid}")
        
        # Register with CAS
        register_drone_with_cas(
            drone_id=drone_id,
            public_key=public_key,
            capabilities=["MOVE", "LAND", "STATUS", "EMERGENCY_STOP"],
            storage_path="data/cas/drones"
        )
        print(f"   ✓ {drone_id} registered with CAS")
        
        # Save credentials (in production, would use password)
        save_drone_credentials(
            drone_id=drone_id,
            private_key=private_key,
            certificate=certificate,
            storage_path="data/drones"
        )
        print(f"   ✓ {drone_id} credentials saved")
        
        drones[drone_id] = {
            'private_key': private_key,
            'public_key': public_key,
            'certificate': certificate
        }
    
    # Step 3: Enroll operators
    print("\n3. Enrolling operators...")
    
    operators_config = [
        ("OPERATOR_ADMIN", [ROLE_ADMIN]),
        ("OPERATOR_PILOT_01", [ROLE_PILOT]),
        ("OPERATOR_PILOT_02", [ROLE_PILOT]),
        ("OPERATOR_OBSERVER", [ROLE_OBSERVER])
    ]
    
    operators = {}
    
    for operator_id, roles in operators_config:
        print(f"   Enrolling {operator_id} with roles: {roles}...")
        
        # Enroll operator (generates keys and certificate)
        private_key, public_key, certificate = enroll_operator(
            operator_id=operator_id,
            roles=roles,
            issuer_name="CAS",
            issuer_private_key=cas_private_key
        )
        
        # Verify certificate
        is_valid = verify_certificate(certificate, cas_public_key)
        print(f"   ✓ {operator_id} enrolled, certificate valid: {is_valid}")
        print(f"     Allowed commands: {certificate.attributes['allowed_commands']}")
        
        # Register with CAS
        register_operator_with_cas(
            operator_id=operator_id,
            public_key=public_key,
            roles=roles,
            storage_path="data/cas/operators"
        )
        print(f"   ✓ {operator_id} registered with CAS")
        
        # Save credentials (in production, would use password)
        save_operator_credentials(
            operator_id=operator_id,
            private_key=private_key,
            certificate=certificate,
            storage_path="data/operators"
        )
        print(f"   ✓ {operator_id} credentials saved")
        
        operators[operator_id] = {
            'private_key': private_key,
            'public_key': public_key,
            'certificate': certificate
        }
    
    # Summary
    print("\n" + "=" * 60)
    print("Provisioning Complete!")
    print("=" * 60)
    print(f"Drones enrolled: {len(drones)}")
    print(f"Operators enrolled: {len(operators)}")
    print("\nNext steps:")
    print("  - Drones can now verify commands from CAS")
    print("  - Operators can authenticate and request commands")
    print("  - CAS can authorize commands based on roles and policies")


if __name__ == "__main__":
    main()
