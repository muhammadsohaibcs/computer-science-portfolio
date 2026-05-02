"""
IoT Server / Gateway
===================

This server acts as a secure gateway between IoT devices
and the backend system.

Responsibilities:
- Verify digital certificates (PKI)
- Establish secure sessions (Diffie–Hellman)
- Prevent replay attacks
- Decrypt secure messages
- Log data in blockchain
- Enforce forward secrecy

This file is intentionally long and explicit,
similar to the SMS GitHub server implementation.
"""

import json
from datetime import datetime

from src.core.secure_protocol import SecureProtocol
from src.crypto.replay_protection import ReplayProtection
from src.core.blockchain import MessageBlockchain
from src.pki.device_certificate import DeviceCertificate


class IoTServer:
    """
    Secure IoT Gateway Server
    """

    def __init__(self):
        self.protocol = SecureProtocol(is_server=True)
        self.blockchain = MessageBlockchain()
        self.replay = ReplayProtection()

        print("[SERVER] IoT Server initialized")

    # --------------------------------------------------
    # HANDSHAKE & CERTIFICATE VERIFICATION
    # --------------------------------------------------

    def handle_handshake(self, request):
        """
        Handle secure handshake from IoT device.
        """
        print("[SERVER] Handshake request received")

        cert_data = request.get("certificate")
        if not cert_data:
            return {"status": "error", "message": "Certificate missing"}

        certificate = DeviceCertificate.deserialize(cert_data)

        if not certificate.verify_signature():
            return {"status": "error", "message": "Invalid certificate signature"}

        if not certificate.is_valid():
            return {"status": "error", "message": "Certificate expired"}

        response, _ = self.protocol.respond_to_handshake(request)

        print(f"[SERVER] Certificate verified for device {certificate.device_id}")
        print("[SERVER] Secure session established")

        return response

    # --------------------------------------------------
    # SECURE DATA HANDLING
    # --------------------------------------------------

    def handle_secure_message(self, session_id, encrypted_packet):
        """
        Handle encrypted sensor data.
        """
        print("[SERVER] Secure message received")

        decrypted = self.protocol.receive_secure_message(session_id, encrypted_packet)
        payload = json.loads(decrypted)

        nonce = payload.get("nonce")
        if self.replay.is_replay(nonce):
            return {"status": "error", "message": "Replay attack detected"}

        block = self.blockchain.add_data({
            "device_id": payload["device_id"],
            "sensor_data": payload["data"],
            "timestamp": datetime.now().isoformat()
        })

        print(f"[SERVER] Data logged in blockchain (Block #{block.index})")

        return {
            "status": "success",
            "block_index": block.index,
            "block_hash": block.hash
        }

    # --------------------------------------------------
    # BLOCKCHAIN VERIFICATION
    # --------------------------------------------------

    def verify_blockchain(self):
        """
        Verify blockchain integrity.
        """
        return self.blockchain.is_chain_valid()
