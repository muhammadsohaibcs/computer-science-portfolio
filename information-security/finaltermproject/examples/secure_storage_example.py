"""
Example demonstrating secure storage usage for drone agents.
Shows how to securely store private keys and manage nonces for replay protection.
"""

import os
from drone.secure_storage import SecureKeyStorage, NonceStorage
from core.authentication import generate_keypair, sign, verify_signature
from core.time_utils import get_current_timestamp
from core.constants import NONCE_SIZE


def demonstrate_key_storage():
    """Demonstrate secure key storage with encryption."""
    print("=== Secure Key Storage Demo ===\n")
    
    # Initialize secure storage
    key_storage = SecureKeyStorage(storage_path="data/demo_keys")
    
    # Generate a keypair for a drone
    drone_id = "DRONE_DEMO_01"
    password = "secure_drone_password_123"
    
    print(f"Generating keypair for {drone_id}...")
    private_key, public_key = generate_keypair()
    
    # Store the private key securely
    print(f"Storing private key with encryption...")
    key_storage.store_private_key(drone_id, private_key, password)
    print(f"✓ Private key stored securely at: data/demo_keys/{drone_id}_private_key.pem\n")
    
    # Load the private key back
    print(f"Loading private key from secure storage...")
    loaded_key = key_storage.load_private_key(drone_id, password)
    print(f"✓ Private key loaded successfully\n")
    
    # Verify the loaded key works correctly
    print("Verifying loaded key functionality...")
    message = b"Test command for drone"
    signature = sign(loaded_key, message)
    is_valid = verify_signature(public_key, message, signature)
    print(f"✓ Signature verification: {is_valid}\n")
    
    # Check key exists
    exists = key_storage.key_exists(drone_id)
    print(f"Key exists for {drone_id}: {exists}\n")


def demonstrate_nonce_storage():
    """Demonstrate nonce storage for replay protection."""
    print("=== Nonce Storage Demo ===\n")
    
    # Initialize nonce storage
    nonce_storage = NonceStorage(storage_path="data/demo_nonces")
    
    drone_id = "DRONE_DEMO_01"
    current_time = get_current_timestamp()
    
    # Generate and store some nonces
    print("Storing nonces for replay protection...")
    nonces = []
    for i in range(3):
        nonce = os.urandom(NONCE_SIZE)
        expires_at = current_time + 300  # 5 minutes from now
        nonce_storage.store_nonce(drone_id, nonce, expires_at)
        nonces.append(nonce)
        print(f"✓ Stored nonce {i+1}: {nonce.hex()[:16]}...")
    
    print(f"\nTotal nonces stored: {nonce_storage.count_nonces(drone_id)}\n")
    
    # Check for replay attacks
    print("Checking for replay attacks...")
    for i, nonce in enumerate(nonces):
        is_replay = nonce_storage.check_nonce_exists(drone_id, nonce)
        print(f"Nonce {i+1} exists (replay detected): {is_replay}")
    
    # Try a new nonce
    new_nonce = os.urandom(NONCE_SIZE)
    is_new = not nonce_storage.check_nonce_exists(drone_id, new_nonce)
    print(f"New nonce is unique: {is_new}\n")
    
    # Store an expired nonce
    print("Storing an expired nonce...")
    expired_nonce = os.urandom(NONCE_SIZE)
    nonce_storage.store_nonce(drone_id, expired_nonce, current_time - 100)
    print(f"✓ Stored expired nonce\n")
    
    # Cleanup expired nonces
    print("Cleaning up expired nonces...")
    removed = nonce_storage.cleanup_expired(drone_id)
    print(f"✓ Removed {removed} expired nonce(s)")
    print(f"Remaining nonces: {nonce_storage.count_nonces(drone_id)}\n")


def demonstrate_multi_drone_isolation():
    """Demonstrate that different drones have isolated storage."""
    print("=== Multi-Drone Isolation Demo ===\n")
    
    nonce_storage = NonceStorage(storage_path="data/demo_nonces")
    
    # Create nonces for two different drones
    drone1 = "DRONE_DEMO_01"
    drone2 = "DRONE_DEMO_02"
    
    shared_nonce = os.urandom(NONCE_SIZE)
    expires_at = get_current_timestamp() + 300
    
    print(f"Storing same nonce for {drone1}...")
    nonce_storage.store_nonce(drone1, shared_nonce, expires_at)
    print(f"✓ Nonce stored for {drone1}\n")
    
    # Check isolation
    print(f"Checking if nonce exists for {drone2}...")
    exists_for_drone2 = nonce_storage.check_nonce_exists(drone2, shared_nonce)
    print(f"Nonce exists for {drone2}: {exists_for_drone2}")
    print(f"✓ Drones have isolated nonce storage\n")
    
    # Store for drone2 as well
    print(f"Storing same nonce for {drone2}...")
    nonce_storage.store_nonce(drone2, shared_nonce, expires_at)
    print(f"✓ Nonce stored for {drone2}\n")
    
    # Now both should have it
    print("Verifying both drones have the nonce...")
    print(f"{drone1} has nonce: {nonce_storage.check_nonce_exists(drone1, shared_nonce)}")
    print(f"{drone2} has nonce: {nonce_storage.check_nonce_exists(drone2, shared_nonce)}")


if __name__ == "__main__":
    print("\n" + "="*60)
    print("Secure Storage Module Demonstration")
    print("="*60 + "\n")
    
    try:
        demonstrate_key_storage()
        print("\n" + "-"*60 + "\n")
        
        demonstrate_nonce_storage()
        print("\n" + "-"*60 + "\n")
        
        demonstrate_multi_drone_isolation()
        
        print("\n" + "="*60)
        print("Demo completed successfully!")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error during demo: {e}")
        import traceback
        traceback.print_exc()
