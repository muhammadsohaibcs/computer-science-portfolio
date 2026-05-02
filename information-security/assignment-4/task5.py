# ===== Task 5: Integrated Secure Communication System =====
from Crypto.PublicKey import RSA, DSA
from Crypto.Cipher import PKCS1_OAEP
from Crypto.Signature import DSS, pkcs1_15
from Crypto.Hash import SHA256
from datetime import datetime, timedelta
import secrets, hashlib, json

# --- Helpers ---

def sha256_bytes(data: bytes) -> bytes:
    return hashlib.sha256(data).digest()

# --- RSA wrapper ---

class RSAKeyPair:
    def __init__(self, bits=1024):
        self.key = RSA.generate(bits)
        self.public_key = self.key.publickey()

    def encrypt_with(self, pub_key, plaintext: bytes) -> bytes:
        cipher = PKCS1_OAEP.new(pub_key, hashAlgo=SHA256)
        return cipher.encrypt(plaintext)

    def decrypt(self, ciphertext: bytes) -> bytes:
        cipher = PKCS1_OAEP.new(self.key, hashAlgo=SHA256)
        return cipher.decrypt(ciphertext)

# --- DSA wrapper ---

class DSAKeyPair:
    def __init__(self, bits=2048):
        self.key = DSA.generate(bits)
        self.public_key = self.key.publickey()

    def sign(self, message: bytes) -> bytes:
        h = SHA256.new(message)
        signer = DSS.new(self.key, 'fips-186-3')
        return signer.sign(h)

    def verify(self, message: bytes, signature: bytes) -> bool:
        h = SHA256.new(message)
        verifier = DSS.new(self.public_key, 'fips-186-3')
        try:
            verifier.verify(h, signature)
            return True
        except ValueError:
            return False

# --- Lamport OTS ---

class LamportOTSKeyPair:
    def __init__(self):
        self.private = [
            (secrets.token_bytes(32), secrets.token_bytes(32))
            for _ in range(256)
        ]
        self.public = [
            (sha256_bytes(x0), sha256_bytes(x1))
            for (x0, x1) in self.private
        ]
        self.used = False

    def sign(self, message: bytes):
        if self.used:
            raise Exception("OTS key already used.")
        h = sha256_bytes(message)
        bits = ''.join(f"{b:08b}" for b in h)
        sig = []
        for i, bit in enumerate(bits):
            sig.append(self.private[i][0] if bit == '0' else self.private[i][1])
        self.used = True
        return sig

    @staticmethod
    def verify(message: bytes, signature, public_key) -> bool:
        if len(signature) != 256 or len(public_key) != 256:
            return False
        h = sha256_bytes(message)
        bits = ''.join(f"{b:08b}" for b in h)
        for i, bit in enumerate(bits):
            hashed = sha256_bytes(signature[i])
            if bit == '0':
                if hashed != public_key[i][0]:
                    return False
            else:
                if hashed != public_key[i][1]:
                    return False
        return True

# --- Simple certificate & CA for integrated demo ---

class SimpleCertificate:
    def __init__(self, issuer, subject, rsa_pub_pem, dsa_pub_pem,
                 valid_from, valid_to, serial, signature=None):
        self.issuer = issuer
        self.subject = subject
        self.rsa_pub_pem = rsa_pub_pem
        self.dsa_pub_pem = dsa_pub_pem
        self.valid_from = valid_from
        self.valid_to = valid_to
        self.serial = serial
        self.signature = signature

    def to_unsigned_dict(self):
        return {
            "issuer": self.issuer,
            "subject": self.subject,
            "rsa_pub_pem": self.rsa_pub_pem,
            "dsa_pub_pem": self.dsa_pub_pem,
            "valid_from": self.valid_from,
            "valid_to": self.valid_to,
            "serial": self.serial,
        }

    def to_dict(self):
        d = self.to_unsigned_dict()
        d["signature"] = self.signature
        return d

class MockCA:
    def __init__(self, name="MockCA"):
        self.name = name
        self.key = RSA.generate(2048)
        self.pub = self.key.publickey()
        self.serial_counter = 1
        self.crl = set()

    def issue_certificate(self, subject_name, rsa_pub_pem, dsa_pub_pem,
                          days=365):
        vf = datetime.utcnow()
        vt = vf + timedelta(days=days)
        cert = SimpleCertificate(
            issuer=self.name,
            subject=subject_name,
            rsa_pub_pem=rsa_pub_pem,
            dsa_pub_pem=dsa_pub_pem,
            valid_from=vf.isoformat(),
            valid_to=vt.isoformat(),
            serial=self.serial_counter
        )
        self.serial_counter += 1

        data = json.dumps(cert.to_unsigned_dict(), sort_keys=True).encode()
        h = SHA256.new(data)
        sig = pkcs1_15.new(self.key).sign(h)
        cert.signature = sig.hex()
        return cert

    def revoke(self, cert: SimpleCertificate):
        self.crl.add(cert.serial)

    def verify_cert(self, cert: SimpleCertificate) -> bool:
        if cert.serial in self.crl:
            print("[CA] Certificate is revoked.")
            return False

        now = datetime.utcnow()
        if not (datetime.fromisoformat(cert.valid_from) <= now <=
                datetime.fromisoformat(cert.valid_to)):
            print("[CA] Certificate not in validity period.")
            return False

        data = json.dumps(cert.to_unsigned_dict(), sort_keys=True).encode()
        h = SHA256.new(data)
        try:
            pkcs1_15.new(self.pub).verify(h, bytes.fromhex(cert.signature))
            return True
        except Exception as e:
            print("[CA] Signature invalid:", e)
            return False

# --- Party ---

class Party:
    def __init__(self, name):
        self.name = name
        self.rsa = RSAKeyPair(1024)
        self.dsa = DSAKeyPair()
        self.ots = LamportOTSKeyPair()
        self.cert = None   # filled by CA

# --- Integrated demo ---

def task5_demo():
    print("=== Task 5: Integrated Secure Communication System ===")

    ca = MockCA()
    alice = Party("Alice")
    bob = Party("Bob")

    # CA issues certificates
    alice.cert = ca.issue_certificate(
        "Alice",
        alice.rsa.public_key.export_key().decode(),
        alice.dsa.public_key.export_key().decode()
    )
    bob.cert = ca.issue_certificate(
        "Bob",
        bob.rsa.public_key.export_key().decode(),
        bob.dsa.public_key.export_key().decode()
    )

    # ----- helper: Alice sends -----
    def alice_send(message: bytes):
        print("\n[Alice] Sending message:", message)

        # Encrypt using Bob's RSA public key
        bob_rsa_pub = RSA.import_key(bob.cert.rsa_pub_pem)
        ciphertext = alice.rsa.encrypt_with(bob_rsa_pub, message)

        # Sign with DSA
        dsa_sig = alice.dsa.sign(message)

        # Sign with Lamport OTS
        ots_sig = alice.ots.sign(message)

        packet = {
            "ciphertext": ciphertext.hex(),
            "dsa_sig": dsa_sig.hex(),
            "ots_sig": [x.hex() for x in ots_sig],
            "alice_cert": alice.cert.to_dict()
        }
        return packet

    # ----- helper: Bob receives -----
    def bob_receive(packet, tamper=False):
        print("\n[Bob] Packet received.")

        # Rebuild cert
        c = packet["alice_cert"]
        cert_recv = SimpleCertificate(
            issuer=c["issuer"],
            subject=c["subject"],
            rsa_pub_pem=c["rsa_pub_pem"],
            dsa_pub_pem=c["dsa_pub_pem"],
            valid_from=c["valid_from"],
            valid_to=c["valid_to"],
            serial=c["serial"],
            signature=c["signature"]
        )

        # Step 1: verify certificate with CA
        if not ca.verify_cert(cert_recv):
            print("[Bob] Certificate verification failed. Abort.")
            return

        print("[Bob] Certificate is valid.")

        # Load Alice's public keys
        alice_rsa_pub = RSA.import_key(cert_recv.rsa_pub_pem)
        alice_dsa_pub = DSA.import_key(cert_recv.dsa_pub_pem)

        # Step 2: decrypt ciphertext
        ciphertext = bytes.fromhex(packet["ciphertext"])
        try:
            message = bob.rsa.decrypt(ciphertext)
            if tamper:
                message = b"TAMPERED: " + message
            print("[Bob] Decrypted message:", message)
        except Exception as e:
            print("[Bob] Decryption failed:", e)
            return

        # Step 3: verify DSA signature
        dsa_sig = bytes.fromhex(packet["dsa_sig"])
        h = SHA256.new(message)
        try:
            DSS.new(alice_dsa_pub, 'fips-186-3').verify(h, dsa_sig)
            print("[Bob] DSA signature is valid.")
        except ValueError:
            print("[Bob] DSA signature INVALID – message may be tampered.")
            return

        # Step 4: verify OTS
        ots_sig_vals = [bytes.fromhex(x) for x in packet["ots_sig"]]
        if LamportOTSKeyPair.verify(message, ots_sig_vals, alice.ots.public):
            print("[Bob] OTS signature is valid.")
        else:
            print("[Bob] OTS signature INVALID – message or OTS misuse.")
            return

        print("[Bob] Communication is Private, Authenticated, and Integral.")

    # ---------- Scenario 1: Successful communication ----------
    print("\n--- Scenario 1: Successful communication ---")
    pkt1 = alice_send(b"Meet me at 10 AM tomorrow.")
    bob_receive(pkt1, tamper=False)

    # ---------- Scenario 2: Message tampering detection ----------
    print("\n--- Scenario 2: Message tampering detection ---")
    # Use a fresh OTS for second message
    alice.ots = LamportOTSKeyPair()
    pkt2 = alice_send(b"Transfer Rs. 1000 to account XYZ.")
    # Attacker flips one byte in ciphertext (tampering)
    tampered = pkt2.copy()
    ct_bytes = bytearray.fromhex(tampered["ciphertext"])
    ct_bytes[0] ^= 0xFF
    tampered["ciphertext"] = ct_bytes.hex()
    bob_receive(tampered, tamper=False)

    # ---------- Scenario 3: Certificate revocation ----------
    print("\n--- Scenario 3: Certificate revocation ---")
    alice.ots = LamportOTSKeyPair()
    pkt3 = alice_send(b"Message sent after revocation.")
    ca.revoke(alice.cert)  # CA revokes Alice's certificate
    bob_receive(pkt3, tamper=False)


if __name__ == "__main__":
    task5_demo()
