"""
Device Digital Certificate Module
=================================

This module implements a simplified Digital Certificate system
for IoT devices.

Purpose:
- Demonstrate PKI concepts
- Authenticate device identity
- Prevent device impersonation

This is a simplified academic implementation (not full X.509),
suitable for CSC232 and viva explanation.
"""

import hashlib
from datetime import datetime, timedelta


class DeviceCertificate:
    """
    Represents a digital certificate issued to an IoT device.
    """

    def __init__(self, device_id, public_key, issuer="IoT-CA", validity_days=365):
        self.device_id = device_id
        self.public_key = public_key
        self.issuer = issuer

        self.issued_at = datetime.now()
        self.expires_at = self.issued_at + timedelta(days=validity_days)

        # Simulated CA signature
        self.signature = self._generate_signature()

        print(f"[CERT] Certificate issued for device '{self.device_id}'")

    # --------------------------------------------------
    # CERTIFICATE INTERNAL LOGIC
    # --------------------------------------------------

    def _generate_signature(self):
        """
        Simulate Certificate Authority signature using SHA-256.
        """
        content = f"{self.device_id}{self.public_key}{self.issuer}{self.expires_at}"
        return hashlib.sha256(content.encode()).hexdigest()

    # --------------------------------------------------
    # VERIFICATION METHODS
    # --------------------------------------------------

    def verify_signature(self):
        """
        Verify that certificate signature is valid.
        """
        expected = self._generate_signature()
        valid = expected == self.signature

        print(f"[CERT] Signature verification: {valid}")
        return valid

    def is_valid(self):
        """
        Check certificate expiration.
        """
        valid = datetime.now() < self.expires_at
        print(f"[CERT] Validity check: {valid}")
        return valid

    # --------------------------------------------------
    # SERIALIZATION
    # --------------------------------------------------

    def serialize(self):
        """
        Convert certificate to dictionary for transmission.
        """
        return {
            "device_id": self.device_id,
            "public_key": self.public_key,
            "issuer": self.issuer,
            "issued_at": self.issued_at.isoformat(),
            "expires_at": self.expires_at.isoformat(),
            "signature": self.signature
        }

    @staticmethod
    def deserialize(data):
        """
        Reconstruct certificate object from dictionary.
        """
        cert = DeviceCertificate(
            data["device_id"],
            data["public_key"],
            data["issuer"]
        )
        cert.signature = data["signature"]
        cert.issued_at = datetime.fromisoformat(data["issued_at"])
        cert.expires_at = datetime.fromisoformat(data["expires_at"])
        return cert
