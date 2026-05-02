from Crypto.PublicKey import RSA
from Crypto.Signature import pkcs1_15
from Crypto.Hash import SHA256
from datetime import datetime, timedelta
import json

class SimpleCertificate:
    """
    Simplified X.509-style certificate:
    - issuer
    - subject
    - subject_public_key_pem
    - valid_from / valid_to
    - serial_number
    - signature (by CA)
    """
    def __init__(self, issuer, subject, subject_public_key_pem, valid_from, valid_to, serial_number, signature=None):
        self.issuer = issuer
        self.subject = subject
        self.subject_public_key_pem = subject_public_key_pem
        self.valid_from = valid_from
        self.valid_to = valid_to
        self.serial_number = serial_number
        self.signature = signature  # hex string

    def to_dict_unsigned(self):
        return {
            "issuer": self.issuer,
            "subject": self.subject,
            "subject_public_key_pem": self.subject_public_key_pem,
            "valid_from": self.valid_from,
            "valid_to": self.valid_to,
            "serial_number": self.serial_number
        }

    def to_dict(self):
        d = self.to_dict_unsigned()
        d["signature"] = self.signature
        return d

    def to_json_unsigned(self):
        return json.dumps(self.to_dict_unsigned(), sort_keys=True)

    def to_json(self):
        return json.dumps(self.to_dict(), sort_keys=True, indent=2)

class MockCA:
    def __init__(self, name="MockCA"):
        self.name = name
        self.ca_key = RSA.generate(2048)
        self.ca_pub = self.ca_key.publickey()
        self.crl = set()       # set of revoked serial numbers
        self.serial_counter = 1

    def issue_certificate(self, subject_name, subject_public_key_pem, valid_days=365):
        valid_from = datetime.utcnow()
        valid_to = valid_from + timedelta(days=valid_days)

        cert = SimpleCertificate(
            issuer=self.name,
            subject=subject_name,
            subject_public_key_pem=subject_public_key_pem,
            valid_from=valid_from.isoformat(),
            valid_to=valid_to.isoformat(),
            serial_number=self.serial_counter
        )
        self.serial_counter += 1

        # Sign the unsigned certificate using CA private key + SHA-256
        data = cert.to_json_unsigned().encode()
        h = SHA256.new(data)
        signature = pkcs1_15.new(self.ca_key).sign(h)
        cert.signature = signature.hex()
        return cert

    def revoke_certificate(self, cert: SimpleCertificate):
        self.crl.add(cert.serial_number)

    def is_revoked(self, cert: SimpleCertificate):
        return cert.serial_number in self.crl

    def verify_certificate(self, cert: SimpleCertificate) -> bool:
        # 1. Check revocation
        if self.is_revoked(cert):
            print("[CA] Certificate is revoked.")
            return False

        # 2. Check validity period
        now = datetime.utcnow()
        start = datetime.fromisoformat(cert.valid_from)
        end = datetime.fromisoformat(cert.valid_to)
        if not (start <= now <= end):
            print("[CA] Certificate is not in its validity period.")
            return False

        # 3. Verify signature
        try:
            data = cert.to_json_unsigned().encode()
            h = SHA256.new(data)
            sig = bytes.fromhex(cert.signature)
            pkcs1_15.new(self.ca_pub).verify(h, sig)
            return True
        except Exception as e:
            print("[CA] Signature verification failed:", e)
            return False


def task2_pki_demo():
    print("=== Task 2: PKI Certificate Management ===")

    # Create CA
    ca = MockCA()

    # Generate a subject RSA key (e.g., Alice)
    alice_key = RSA.generate(1024)
    alice_pub_pem = alice_key.publickey().export_key().decode()

    # Issue certificate for Alice
    cert_alice = ca.issue_certificate("Alice", alice_pub_pem, valid_days=365)
    print("Issued certificate for Alice:")
    print(cert_alice.to_json())

    # Verify certificate
    print("\nVerifying certificate...")
    print("Is certificate valid?", ca.verify_certificate(cert_alice))

    # Revoke and verify again
    print("\nRevoking Alice's certificate...")
    ca.revoke_certificate(cert_alice)
    print("Is certificate valid after revocation?",ca.verify_certificate(cert_alice))


if __name__ == "__main__":
    task2_pki_demo()
