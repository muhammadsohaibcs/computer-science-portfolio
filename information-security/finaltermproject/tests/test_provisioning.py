"""
Unit tests for provisioning modules.
Tests certificate issuance, device enrollment, and operator enrollment.
"""

import pytest
import tempfile
import shutil
from pathlib import Path

from core.authentication import generate_keypair
from provisioning.cert_issuer import (
    Certificate,
    issue_certificate,
    verify_certificate,
    get_certificate_public_key,
    save_certificate,
    load_certificate
)
from provisioning.device_enrollment import (
    enroll_drone,
    register_drone_with_cas,
    save_drone_credentials,
    get_drone_info,
    list_registered_drones
)
from provisioning.operator_enrollment import (
    enroll_operator,
    issue_operator_certificate,
    register_operator_with_cas,
    save_operator_credentials,
    get_operator_info,
    list_registered_operators,
    validate_roles,
    ROLE_ADMIN,
    ROLE_PILOT,
    ROLE_OBSERVER
)


class TestCertificateIssuer:
    """Tests for certificate issuer module."""
    
    def test_issue_certificate(self):
        """Test certificate issuance."""
        # Generate issuer and subject keys
        issuer_private, issuer_public = generate_keypair()
        subject_private, subject_public = generate_keypair()
        
        # Issue certificate
        cert = issue_certificate(
            subject="DRONE_01",
            public_key=subject_public,
            issuer_name="CAS",
            issuer_private_key=issuer_private,
            validity_duration=3600,
            attributes={'capabilities': ['MOVE', 'LAND']}
        )
        
        assert cert.subject == "DRONE_01"
        assert cert.issuer == "CAS"
        assert cert.signature is not None
        assert cert.attributes['capabilities'] == ['MOVE', 'LAND']
    
    def test_verify_certificate(self):
        """Test certificate verification."""
        issuer_private, issuer_public = generate_keypair()
        subject_private, subject_public = generate_keypair()
        
        cert = issue_certificate(
            subject="DRONE_01",
            public_key=subject_public,
            issuer_name="CAS",
            issuer_private_key=issuer_private
        )
        
        # Verify with correct issuer key
        assert verify_certificate(cert, issuer_public) is True
    
    def test_verify_certificate_wrong_issuer(self):
        """Test that certificate verification fails with wrong issuer key."""
        issuer_private, issuer_public = generate_keypair()
        wrong_private, wrong_public = generate_keypair()
        subject_private, subject_public = generate_keypair()
        
        cert = issue_certificate(
            subject="DRONE_01",
            public_key=subject_public,
            issuer_name="CAS",
            issuer_private_key=issuer_private
        )
        
        # Verify with wrong issuer key
        assert verify_certificate(cert, wrong_public) is False
    
    def test_get_certificate_public_key(self):
        """Test extracting public key from certificate."""
        issuer_private, issuer_public = generate_keypair()
        subject_private, subject_public = generate_keypair()
        
        cert = issue_certificate(
            subject="DRONE_01",
            public_key=subject_public,
            issuer_name="CAS",
            issuer_private_key=issuer_private
        )
        
        extracted_key = get_certificate_public_key(cert)
        assert extracted_key is not None
    
    def test_save_and_load_certificate(self):
        """Test certificate serialization to file."""
        issuer_private, issuer_public = generate_keypair()
        subject_private, subject_public = generate_keypair()
        
        cert = issue_certificate(
            subject="DRONE_01",
            public_key=subject_public,
            issuer_name="CAS",
            issuer_private_key=issuer_private
        )
        
        with tempfile.TemporaryDirectory() as tmpdir:
            filepath = Path(tmpdir) / "cert.json"
            save_certificate(cert, str(filepath))
            
            loaded_cert = load_certificate(str(filepath))
            assert loaded_cert.subject == cert.subject
            assert loaded_cert.issuer == cert.issuer
            assert loaded_cert.signature == cert.signature


class TestDeviceEnrollment:
    """Tests for device enrollment module."""
    
    def test_enroll_drone(self):
        """Test drone enrollment."""
        issuer_private, issuer_public = generate_keypair()
        
        private_key, public_key, certificate = enroll_drone(
            drone_id="DRONE_07",
            issuer_name="CAS",
            issuer_private_key=issuer_private,
            capabilities=["MOVE", "LAND", "STATUS"]
        )
        
        assert private_key is not None
        assert public_key is not None
        assert certificate.subject == "DRONE_07"
        assert certificate.attributes['device_type'] == 'drone'
        assert 'MOVE' in certificate.attributes['capabilities']
    
    def test_register_drone_with_cas(self):
        """Test drone registration with CAS."""
        _, public_key = generate_keypair()
        
        with tempfile.TemporaryDirectory() as tmpdir:
            register_drone_with_cas(
                drone_id="DRONE_07",
                public_key=public_key,
                capabilities=["MOVE", "LAND"],
                storage_path=tmpdir
            )
            
            # Verify registration file exists
            filepath = Path(tmpdir) / "DRONE_07.json"
            assert filepath.exists()
            
            # Verify can retrieve info
            info = get_drone_info("DRONE_07", storage_path=tmpdir)
            assert info is not None
            assert info['drone_id'] == "DRONE_07"
            assert info['capabilities'] == ["MOVE", "LAND"]
    
    def test_save_drone_credentials(self):
        """Test saving drone credentials."""
        issuer_private, issuer_public = generate_keypair()
        private_key, public_key, certificate = enroll_drone(
            drone_id="DRONE_07",
            issuer_name="CAS",
            issuer_private_key=issuer_private
        )
        
        with tempfile.TemporaryDirectory() as tmpdir:
            save_drone_credentials(
                drone_id="DRONE_07",
                private_key=private_key,
                certificate=certificate,
                storage_path=tmpdir
            )
            
            # Verify files exist
            drone_dir = Path(tmpdir) / "DRONE_07"
            assert (drone_dir / "private_key.pem").exists()
            assert (drone_dir / "certificate.json").exists()
    
    def test_list_registered_drones(self):
        """Test listing registered drones."""
        _, public_key1 = generate_keypair()
        _, public_key2 = generate_keypair()
        
        with tempfile.TemporaryDirectory() as tmpdir:
            register_drone_with_cas("DRONE_01", public_key1, ["MOVE"], storage_path=tmpdir)
            register_drone_with_cas("DRONE_02", public_key2, ["LAND"], storage_path=tmpdir)
            
            drones = list_registered_drones(storage_path=tmpdir)
            assert len(drones) == 2
            assert "DRONE_01" in drones
            assert "DRONE_02" in drones


class TestOperatorEnrollment:
    """Tests for operator enrollment module."""
    
    def test_enroll_operator(self):
        """Test operator enrollment."""
        issuer_private, issuer_public = generate_keypair()
        
        private_key, public_key, certificate = enroll_operator(
            operator_id="OPERATOR_123",
            roles=[ROLE_PILOT],
            issuer_name="CAS",
            issuer_private_key=issuer_private
        )
        
        assert private_key is not None
        assert public_key is not None
        assert certificate.subject == "OPERATOR_123"
        assert certificate.attributes['entity_type'] == 'operator'
        assert ROLE_PILOT in certificate.attributes['roles']
    
    def test_issue_operator_certificate_with_roles(self):
        """Test operator certificate includes role-based permissions."""
        issuer_private, issuer_public = generate_keypair()
        operator_private, operator_public = generate_keypair()
        
        certificate = issue_operator_certificate(
            operator_id="OPERATOR_123",
            public_key=operator_public,
            roles=[ROLE_PILOT, ROLE_OBSERVER],
            issuer_name="CAS",
            issuer_private_key=issuer_private
        )
        
        assert ROLE_PILOT in certificate.attributes['roles']
        assert ROLE_OBSERVER in certificate.attributes['roles']
        # Pilot can do MOVE, LAND, STATUS, EMERGENCY_STOP
        # Observer can do STATUS
        # Combined should have all pilot commands
        assert 'MOVE' in certificate.attributes['allowed_commands']
        assert 'STATUS' in certificate.attributes['allowed_commands']
    
    def test_register_operator_with_cas(self):
        """Test operator registration with CAS."""
        _, public_key = generate_keypair()
        
        with tempfile.TemporaryDirectory() as tmpdir:
            register_operator_with_cas(
                operator_id="OPERATOR_123",
                public_key=public_key,
                roles=[ROLE_ADMIN],
                storage_path=tmpdir
            )
            
            # Verify registration file exists
            filepath = Path(tmpdir) / "OPERATOR_123.json"
            assert filepath.exists()
            
            # Verify can retrieve info
            info = get_operator_info("OPERATOR_123", storage_path=tmpdir)
            assert info is not None
            assert info['operator_id'] == "OPERATOR_123"
            assert ROLE_ADMIN in info['roles']
    
    def test_save_operator_credentials(self):
        """Test saving operator credentials."""
        issuer_private, issuer_public = generate_keypair()
        private_key, public_key, certificate = enroll_operator(
            operator_id="OPERATOR_123",
            roles=[ROLE_PILOT],
            issuer_name="CAS",
            issuer_private_key=issuer_private
        )
        
        with tempfile.TemporaryDirectory() as tmpdir:
            save_operator_credentials(
                operator_id="OPERATOR_123",
                private_key=private_key,
                certificate=certificate,
                storage_path=tmpdir
            )
            
            # Verify files exist
            operator_dir = Path(tmpdir) / "OPERATOR_123"
            assert (operator_dir / "private_key.pem").exists()
            assert (operator_dir / "certificate.json").exists()
    
    def test_list_registered_operators(self):
        """Test listing registered operators."""
        _, public_key1 = generate_keypair()
        _, public_key2 = generate_keypair()
        
        with tempfile.TemporaryDirectory() as tmpdir:
            register_operator_with_cas("OPERATOR_01", public_key1, [ROLE_PILOT], storage_path=tmpdir)
            register_operator_with_cas("OPERATOR_02", public_key2, [ROLE_ADMIN], storage_path=tmpdir)
            
            operators = list_registered_operators(storage_path=tmpdir)
            assert len(operators) == 2
            assert "OPERATOR_01" in operators
            assert "OPERATOR_02" in operators
    
    def test_validate_roles(self):
        """Test role validation."""
        assert validate_roles([ROLE_PILOT, ROLE_ADMIN]) is True
        assert validate_roles([ROLE_OBSERVER]) is True
        assert validate_roles(["invalid_role"]) is False
        assert validate_roles([ROLE_PILOT, "invalid_role"]) is False
