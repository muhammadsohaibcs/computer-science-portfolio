"""
Authentication Module
=====================

Handles registration and authentication of IoT devices.

Security Features:
- Device identity management
- Secure password/secret hashing
- Persistent storage integration

This module ensures that only registered devices
are allowed to participate in the IoT network.
"""

import hashlib
from datetime import datetime


class UserAuthentication:
    """
    Manages device registration and authentication.
    """

    def __init__(self, storage=None):
        self.storage = storage
        self.devices = storage.load_devices() if storage else {}

        print("[AUTH] Authentication system initialized")

    # --------------------------------------------------
    # REGISTRATION
    # --------------------------------------------------

    def register_device(self, device_id, device_secret):
        """
        Register a new IoT device.
        """
        if device_id in self.devices:
            print("[AUTH] Registration failed: device exists")
            return False, "Device already registered"

        self.devices[device_id] = {
            "secret_hash": self._hash_secret(device_secret),
            "registered_at": datetime.now().isoformat()
        }

        if self.storage:
            self.storage.save_devices(self.devices)

        print(f"[AUTH] Device registered: {device_id}")
        return True, "Device registered successfully"

    # --------------------------------------------------
    # AUTHENTICATION
    # --------------------------------------------------

    def authenticate_device(self, device_id, device_secret):
        """
        Authenticate device credentials.
        """
        if device_id not in self.devices:
            print("[AUTH] Authentication failed: unknown device")
            return False

        valid = self.devices[device_id]["secret_hash"] == self._hash_secret(device_secret)

        print(f"[AUTH] Authentication result for {device_id}: {valid}")
        return valid

    # --------------------------------------------------
    # INTERNAL UTILITIES
    # --------------------------------------------------

    def _hash_secret(self, secret):
        """
        Hash device secret using SHA-256.
        """
        return hashlib.sha256(secret.encode()).hexdigest()
