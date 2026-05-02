"""
Secure Protocol Module
======================

Implements a secure communication protocol using:
- Ephemeral Diffie–Hellman key exchange
- AES-GCM (Authenticated Encryption with Associated Data)

Security Properties:
- Confidentiality
- Integrity
- Authentication
- Forward Secrecy

This module is the backbone of secure communication
between IoT devices and the server.
"""

import secrets
from Crypto.Cipher import AES


class SecureSession:
    """
    Represents a single secure session.
    Uses ephemeral Diffie–Hellman keys.
    """

    def __init__(self):
        # Diffie–Hellman parameters (educational size)
        self.p = 23
        self.g = 5

        self.private_key = secrets.randbelow(self.p - 2) + 2
        self.public_key = pow(self.g, self.private_key, self.p)

        self.session_key = None

        print("[SECURE-SESSION] Ephemeral DH keys generated")

    def compute_shared_secret(self, peer_public_key):
        """
        Compute shared secret using DH.
        """
        shared = pow(peer_public_key, self.private_key, self.p)
        return shared.to_bytes(16, "big")


class SecureProtocol:
    """
    Manages secure sessions and encrypted communication.
    """

    def __init__(self, is_server=False):
        self.sessions = {}
        self.is_server = is_server

        role = "SERVER" if is_server else "CLIENT"
        print(f"[SECURE-PROTOCOL] Initialized for {role}")

    # --------------------------------------------------
    # SESSION MANAGEMENT
    # --------------------------------------------------

    def create_session(self, session_id):
        """
        Create a new secure session.
        """
        session = SecureSession()
        self.sessions[session_id] = session

        print(f"[SECURE-PROTOCOL] Session created: {session_id}")
        return session

    def destroy_session(self, session_id):
        """
        Destroy session to ensure forward secrecy.
        """
        if session_id in self.sessions:
            del self.sessions[session_id]
            print(f"[SECURE-PROTOCOL] Session destroyed: {session_id}")

    # --------------------------------------------------
    # HANDSHAKE (DIFFIE–HELLMAN)
    # --------------------------------------------------

    def initiate_handshake(self, session_id):
        """
        Client initiates handshake.
        """
        session = self.sessions[session_id]
        print("[SECURE-PROTOCOL] Handshake initiated")

        return {
            "type": "HANDSHAKE_INIT",
            "session_id": session_id,
            "public_key": session.public_key,
            "p": session.p,
            "g": session.g
        }

    def respond_to_handshake(self, request):
        """
        Server responds to handshake.
        """
        session_id = request["session_id"]
        peer_key = request["public_key"]

        session = self.create_session(session_id)
        session.session_key = session.compute_shared_secret(peer_key)[:16]

        print("[SECURE-PROTOCOL] Handshake response sent")

        return {
            "type": "HANDSHAKE_RESPONSE",
            "public_key": session.public_key
        }, session

    def complete_handshake(self, session_id, response):
        """
        Client completes handshake.
        """
        session = self.sessions[session_id]
        peer_key = response["public_key"]

        session.session_key = session.compute_shared_secret(peer_key)[:16]
        print("[SECURE-PROTOCOL] Secure session established")

    # --------------------------------------------------
    # SECURE COMMUNICATION (AES-GCM)
    # --------------------------------------------------

    def send_secure_message(self, session_id, plaintext, aad=None):
        """
        Encrypt message using AES-GCM.
        """
        session = self.sessions[session_id]

        cipher = AES.new(session.session_key, AES.MODE_GCM)
        ciphertext, tag = cipher.encrypt_and_digest(plaintext.encode())

        print("[SECURE-PROTOCOL] Message encrypted")

        return {
            "type": "SECURE_MESSAGE",
            "nonce": cipher.nonce.hex(),
            "ciphertext": ciphertext.hex(),
            "tag": tag.hex(),
            "aad": aad
        }

    def receive_secure_message(self, session_id, message):
        """
        Decrypt and authenticate AES-GCM message.
        """
        session = self.sessions[session_id]

        nonce = bytes.fromhex(message["nonce"])
        ciphertext = bytes.fromhex(message["ciphertext"])
        tag = bytes.fromhex(message["tag"])

        cipher = AES.new(session.session_key, AES.MODE_GCM, nonce=nonce)
        plaintext = cipher.decrypt_and_verify(ciphertext, tag)

        print("[SECURE-PROTOCOL] Message decrypted and verified")
        return plaintext.decode()
