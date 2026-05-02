"""
Secure Storage Module
=====================

Provides persistent storage for IoT system data.

Stored Data:
- Registered devices
- Device credentials
- Cryptographic material

Security Features:
- JSON-based storage
- Integrity verification using SHA-256
- Tamper detection
"""

import json
import hashlib
from pathlib import Path


class SecureStorage:
    """
    Handles secure read/write operations for persistent data.
    """

    def __init__(self, data_dir="data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)

        self.devices_file = self.data_dir / "devices.json"

        print("[STORAGE] Secure storage initialized")

    # --------------------------------------------------
    # DEVICE STORAGE
    # --------------------------------------------------

    def save_devices(self, devices):
        """
        Save registered devices with integrity hash.
        """
        payload = {
            "devices": devices,
            "hash": self._compute_hash(devices)
        }

        with open(self.devices_file, "w") as f:
            json.dump(payload, f, indent=2)

        print("[STORAGE] Devices saved")

    def load_devices(self):
        """
        Load registered devices and verify integrity.
        """
        if not self.devices_file.exists():
            print("[STORAGE] No device file found")
            return {}

        with open(self.devices_file) as f:
            payload = json.load(f)

        expected_hash = self._compute_hash(payload["devices"])

        if payload["hash"] != expected_hash:
            raise ValueError("[STORAGE] Integrity violation detected!")

        print("[STORAGE] Devices loaded successfully")
        return payload["devices"]

    # --------------------------------------------------
    # HASHING
    # --------------------------------------------------

    def _compute_hash(self, data):
        """
        Compute SHA-256 hash for integrity checking.
        """
        serialized = json.dumps(data, sort_keys=True).encode()
        return hashlib.sha256(serialized).hexdigest()
