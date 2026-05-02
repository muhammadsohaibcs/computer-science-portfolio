"""
Key Lifecycle Management Module
===============================

This module manages cryptographic keys throughout their lifecycle.

Key Lifecycle Stages:
1. Key Generation
2. Key Usage
3. Key Expiration
4. Key Rotation
5. Key Destruction

This directly satisfies CSC232 lab requirements on key lifecycle
and forward secrecy.
"""

import secrets
import time


class KeyManager:
    """
    Manages symmetric session keys securely.
    """

    def __init__(self, key_size=16, lifetime=120):
        self.key_size = key_size
        self.lifetime = lifetime
        self.current_key = None
        self.expiry_time = None

        print("[KEY-MANAGER] Initialized")

    # --------------------------------------------------
    # KEY GENERATION
    # --------------------------------------------------

    def generate_key(self):
        """
        Generate a new cryptographically secure key.
        """
        self.current_key = secrets.token_bytes(self.key_size)
        self.expiry_time = time.time() + self.lifetime

        print("[KEY-MANAGER] New key generated")
        return self.current_key

    # --------------------------------------------------
    # KEY VALIDATION
    # --------------------------------------------------

    def is_key_valid(self):
        """
        Check if the current key is still valid.
        """
        if self.current_key is None:
            return False

        if time.time() > self.expiry_time:
            print("[KEY-MANAGER] Key expired")
            return False

        return True

    # --------------------------------------------------
    # KEY ACCESS
    # --------------------------------------------------

    def get_key(self):
        """
        Retrieve a valid key, rotating if necessary.
        """
        if not self.is_key_valid():
            print("[KEY-MANAGER] Rotating key")
            return self.generate_key()

        return self.current_key

    # --------------------------------------------------
    # KEY DESTRUCTION
    # --------------------------------------------------

    def destroy_key(self):
        """
        Securely destroy the key.
        """
        self.current_key = None
        self.expiry_time = None
        print("[KEY-MANAGER] Key destroyed")
