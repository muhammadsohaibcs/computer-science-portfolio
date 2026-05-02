"""
Secure IoT Device Communication System - CLIENT
===============================================

Network-based IoT client that connects to the IoT server.
Run this in a separate terminal for each IoT device.

Features:
- Socket-based communication
- Digital Certificates (PKI)
- Diffie–Hellman secure handshake
- AES-GCM (AEAD)
- Replay attack prevention
- Forward secrecy
- Blockchain logging support
"""

import socket
import json
import secrets
import threading
from datetime import datetime

from src.iot.sensor import Sensor
from src.pki.device_certificate import DeviceCertificate
from src.crypto.replay_protection import ReplayProtection
from src.core.secure_protocol import SecureProtocol


class IoTClient:
    """
    Network IoT Device Client
    """

    def __init__(self, device_id, device_secret, host="127.0.0.1", port=6000):
        self.device_id = device_id
        self.device_secret = device_secret
        self.host = host
        self.port = port

        self.socket = None
        self.connected = False
        self.running = False

        self.sensor = Sensor(f"{device_id}-sensor", "temperature")
        self.protocol = SecureProtocol(is_server=False)
        self.replay = ReplayProtection()

        self.session_id = None
        self.secure_mode = False
        self.certificate = None

    # ==================================================
    # CONNECTION HANDLING
    # ==================================================

    def connect(self):
        try:
            self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.socket.connect((self.host, self.port))
            self.connected = True
            self.running = True

            print(f"\n[CLIENT] Connected to server at {self.host}:{self.port}")
            print("[SECURITY] Establishing secure session...")

            return self._establish_secure_session()

        except Exception as e:
            print(f"[ERROR] Connection failed: {e}")
            return False

    def disconnect(self):
        self.running = False

        if self.secure_mode:
            self._send_secure({
                "command": "DISCONNECT",
                "device_id": self.device_id
            })

        if self.session_id:
            self.protocol.destroy_session(self.session_id)
            print("[SECURITY] Session destroyed (forward secrecy)")

        if self.socket:
            self.socket.close()

        self.connected = False
        print("[CLIENT] Disconnected")

    # ==================================================
    # SECURE HANDSHAKE (CERT + DH)
    # ==================================================

    def _establish_secure_session(self):
        try:
            self.session_id = f"iot-{secrets.token_hex(8)}"
            session = self.protocol.create_session(self.session_id)

            self.certificate = DeviceCertificate(
                self.device_id,
                session.public_key
            )

            handshake = self.protocol.initiate_handshake(self.session_id)
            handshake["certificate"] = self.certificate.serialize()

            self._send_raw(handshake)

            response = self._receive_raw()

            if response.get("type") == "HANDSHAKE_RESPONSE":
                self.protocol.complete_handshake(self.session_id, response)
                self.secure_mode = True

                print("[SECURITY] Secure session established")
                print(f"[SECURITY] Session ID: {self.session_id}")
                print("[SECURITY] Transport: AES-GCM + DH")

                return True

            print("[ERROR] Handshake failed")
            return False

        except Exception as e:
            print(f"[ERROR] Secure session failed: {e}")
            return False

    # ==================================================
    # SOCKET COMMUNICATION
    # ==================================================

    def _send_raw(self, data):
        payload = json.dumps(data).encode()
        self.socket.send(payload)

    def _receive_raw(self):
        data = self.socket.recv(32768)
        return json.loads(data.decode())

    def _send_secure(self, data):
        encrypted = self.protocol.send_secure_message(
            self.session_id,
            json.dumps(data),
            {"device_id": self.device_id}
        )
        self._send_raw(encrypted)

    def _receive_secure(self):
        encrypted = self._receive_raw()
        decrypted = self.protocol.receive_secure_message(
            self.session_id,
            encrypted
        )
        return json.loads(decrypted)

    # ==================================================
    # DEVICE OPERATIONS
    # ==================================================

    def send_sensor_data(self):
        reading = self.sensor.capture()
        nonce = self.replay.generate_nonce()

        payload = {
            "command": "SEND_DATA",
            "device_id": self.device_id,
            "nonce": nonce,
            "timestamp": datetime.now().isoformat(),
            "data": reading
        }

        self._send_secure(payload)
        response = self._receive_secure()

        if response.get("status") == "success":
            print(f"[SUCCESS] Data stored in block #{response['block_index']}")
        else:
            print("[ERROR]", response.get("message"))

    # ==================================================
    # CLIENT MENU (LIKE SMS)
    # ==================================================

    def display_menu(self):
        print("\n" + "=" * 60)
        print(f" Secure IoT Client [{self.device_id}] ")
        print("=" * 60)
        print("1. Send Sensor Data")
        print("2. Exit")

    def run(self):
        if not self.connect():
            return

        while self.running:
            try:
                self.display_menu()
                choice = input("\nChoice > ").strip()

                if choice == "1":
                    self.send_sensor_data()
                elif choice == "2":
                    self.disconnect()
                    break
                else:
                    print("Invalid option")

            except KeyboardInterrupt:
                self.disconnect()
                break


# ==================================================
# ENTRY POINT
# ==================================================

def main():
    device_id = input("Enter Device ID: ").strip()
    device_secret = input("Enter Device Secret: ").strip()

    client = IoTClient(device_id, device_secret)

    try:
        client.run()
    except Exception as e:
        print("[CLIENT ERROR]", e)
    finally:
        if client.connected:
            client.disconnect()


if __name__ == "__main__":
    main()
