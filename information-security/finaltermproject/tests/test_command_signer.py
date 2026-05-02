"""
Tests for command signing and sealing functionality.
"""

import pytest
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

from core.command_token import create_command_token
from core.authentication import generate_keypair
from server.command_signer import sign_command, seal_command, unseal_command, SealedCommand


def test_sign_command():
    """Test that signing a command produces a valid signature."""
    # Generate CAS keypair
    cas_private_key, cas_public_key = generate_keypair()
    
    # Create a command token
    token = create_command_token(
        command_type="MOVE",
        target_drone_id="DRONE_01",
        parameters={"coordinates": [33.6844, 73.0479], "altitude": 100},
        issuer="OPERATOR_PILOT_01",
        validity_duration=300
    )
    
    # Sign the command
    signature = sign_command(token, cas_private_key)
    
    # Verify signature is bytes and non-empty
    assert isinstance(signature, bytes)
    assert len(signature) > 0
    
    # Verify the signature using the public key
    from core.command_token import serialize_token
    from core.authentication import verify_signature
    
    token_bytes = serialize_token(token)
    assert verify_signature(cas_public_key, token_bytes, signature)


def test_seal_command():
    """Test that sealing a command produces a SealedCommand."""
    # Generate CAS keypair
    cas_private_key, cas_public_key = generate_keypair()
    
    # Generate drone keypair
    drone_private_key, drone_public_key = generate_keypair()
    
    # Create a command token
    token = create_command_token(
        command_type="LAND",
        target_drone_id="DRONE_02",
        parameters={},
        issuer="OPERATOR_ADMIN",
        validity_duration=60
    )
    
    # Sign the command
    signature = sign_command(token, cas_private_key)
    
    # Seal the command
    sealed = seal_command(token, signature, drone_public_key)
    
    # Verify sealed command structure
    assert isinstance(sealed, SealedCommand)
    assert sealed.encrypted_token
    assert sealed.signature
    assert sealed.encryption_nonce
    assert sealed.ephemeral_public_key


def test_seal_and_unseal_command():
    """Test that a sealed command can be unsealed and verified."""
    # Generate CAS keypair
    cas_private_key, cas_public_key = generate_keypair()
    
    # Generate drone keypair
    drone_private_key, drone_public_key = generate_keypair()
    
    # Create a command token
    token = create_command_token(
        command_type="STATUS",
        target_drone_id="DRONE_03",
        parameters={"request_full_status": True},
        issuer="OPERATOR_OBSERVER",
        validity_duration=120
    )
    
    # Sign and seal the command
    signature = sign_command(token, cas_private_key)
    sealed = seal_command(token, signature, drone_public_key)
    
    # Unseal the command
    unsealed_token, signature_valid = unseal_command(sealed, "DRONE_03", cas_public_key)
    
    # Verify the unsealed token matches the original
    assert unsealed_token.command_type == token.command_type
    assert unsealed_token.target_drone_id == token.target_drone_id
    assert unsealed_token.parameters == token.parameters
    assert unsealed_token.issuer == token.issuer
    assert unsealed_token.nonce == token.nonce
    assert signature_valid


def test_sealed_command_serialization():
    """Test that SealedCommand can be serialized and deserialized."""
    # Generate keys and create a sealed command
    cas_private_key, cas_public_key = generate_keypair()
    drone_private_key, drone_public_key = generate_keypair()
    
    token = create_command_token(
        command_type="EMERGENCY_STOP",
        target_drone_id="DRONE_01",
        parameters={},
        issuer="OPERATOR_ADMIN",
        validity_duration=30
    )
    
    signature = sign_command(token, cas_private_key)
    sealed = seal_command(token, signature, drone_public_key)
    
    # Test to_dict and from_dict
    sealed_dict = sealed.to_dict()
    sealed_from_dict = SealedCommand.from_dict(sealed_dict)
    
    assert sealed_from_dict.encrypted_token == sealed.encrypted_token
    assert sealed_from_dict.signature == sealed.signature
    assert sealed_from_dict.encryption_nonce == sealed.encryption_nonce
    assert sealed_from_dict.ephemeral_public_key == sealed.ephemeral_public_key
    
    # Test to_json and from_json
    sealed_json = sealed.to_json()
    sealed_from_json = SealedCommand.from_json(sealed_json)
    
    assert sealed_from_json.encrypted_token == sealed.encrypted_token
    
    # Test to_bytes and from_bytes
    sealed_bytes = sealed.to_bytes()
    sealed_from_bytes = SealedCommand.from_bytes(sealed_bytes)
    
    assert sealed_from_bytes.encrypted_token == sealed.encrypted_token


def test_unseal_with_wrong_drone_id_fails():
    """Test that unsealing with wrong drone ID fails authentication."""
    # Generate keys
    cas_private_key, cas_public_key = generate_keypair()
    drone_private_key, drone_public_key = generate_keypair()
    
    # Create and seal command for DRONE_01
    token = create_command_token(
        command_type="MOVE",
        target_drone_id="DRONE_01",
        parameters={"coordinates": [0, 0]},
        issuer="OPERATOR_PILOT_01",
        validity_duration=60
    )
    
    signature = sign_command(token, cas_private_key)
    sealed = seal_command(token, signature, drone_public_key)
    
    # Try to unseal with wrong drone ID - should fail AEAD authentication
    with pytest.raises(Exception):  # Will raise InvalidTag or similar
        unseal_command(sealed, "DRONE_02", cas_public_key)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
