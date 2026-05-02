"""
IoT Device Client
=================

This module represents an IoT device that:
- Registers/authenticates itself
- Uses digital certificates (PKI)
- Establishes a secure session (DH + AES-GCM)
- Prevents replay attacks
- Sends encrypted sensor data to the server

This file is intentionally long and verbose,
similar to the SMS GitHub client implementation.
"""

import secrets
import json
from datetime import datetime

from src.iot.sensor import Sensor
from src.pki.device_certificate import DeviceCertificate
from src.crypto.replay_protection import ReplayProtection
from src.core.secure_protocol import SecureProtocol


class IoTDevice:
    """
    Represents a secure IoT device.
    """

    def __init__(self, device_id, device_secret, sensor_type="temperature"):
        self.device_id = device_id
        self.device_secret = device_secret

        self.sensor = Sensor(f"{device_id}-sensor", sensor_type)

        self.protocol = SecureProtocol(is_server=False)
        self.session_id = None

        self.certificate = None
        self.replay = ReplayProtection()

        print(f"[DEVICE] IoT Device initialized: {self.device_id}")

    # --------------------------------------------------
    # CERTIFICATE HANDLING
    # --------------------------------------------------

    def generate_certificate(self, public_key):
        """
        Generate a digital certificate for this device.
        """
        self.certificate = DeviceCertificate(
            device_id=self.device_id,
            public_key=public_key
        )
        return self.certificate.serialize()

    # --------------------------------------------------
    # SECURE SESSION ESTABLISHMENT
    # --------------------------------------------------

    def initiate_secure_session(self):
        """
        Initiate secure session with the server.
        """
        self.session_id = f"iot-{secrets.token_hex(8)}"
        session = self.protocol.create_session(self.session_id)

        cert_data = self.generate_certificate(session.public_key)

        handshake = self.protocol.initiate_handshake(self.session_id)
        handshake["certificate"] = cert_data

        print("[DEVICE] Secure session initiated")
        return handshake

    def complete_secure_session(self, response):
        """
        Complete DH handshake.
        """
        self.protocol.complete_handshake(self.session_id, response)
        print("[DEVICE] Secure session established")

    # --------------------------------------------------
    # DATA TRANSMISSION
    # --------------------------------------------------

    def prepare_secure_payload(self):
        """
        Capture sensor data and encrypt it.
        """
        sensor_data = self.sensor.capture()

        payload = {
            "device_id": self.device_id,
            "data": sensor_data,
            "timestamp": datetime.now().isoformat()
        }

        nonce = self.replay.generate_nonce()
        payload["nonce"] = nonce

        encrypted = self.protocol.send_secure_message(
            self.session_id,
            json.dumps(payload),
            aad={"device_id": self.device_id}
        )

        print("[DEVICE] Sensor data encrypted and ready")
        return encrypted

    # --------------------------------------------------
    # SESSION TERMINATION
    # --------------------------------------------------

    def terminate_session(self):
        """
        Destroy session keys (forward secrecy).
        """
        self.protocol.destroy_session(self.session_id)
        print("[DEVICE] Session terminated (forward secrecy)")
