"""
Replay Attack Protection Module
===============================

This module prevents replay attacks in IoT communication.

A replay attack occurs when an attacker captures a valid packet
and resends it later to perform unauthorized actions.

Defense Strategy:
- Each packet contains a cryptographic nonce
- Server keeps track of used nonces
- Duplicate nonces are rejected

Lab Mapping:
- Network Security
- Secure Communication
"""

import secrets


class ReplayProtection:
    """
    Maintains a record of used nonces to prevent replay attacks.
    """

    def __init__(self):
        self.used_nonces = set()
        print("[REPLAY] Replay protection initialized")

    def generate_nonce(self):
        """
        Generate a cryptographically secure nonce.
        """
        nonce = secrets.token_hex(16)
        print(f"[REPLAY] Generated nonce: {nonce}")
        return nonce

    def is_replay(self, nonce):
        """
        Check whether the nonce has already been used.
        """
        if nonce in self.used_nonces:
            print("[REPLAY] Replay detected!")
            return True

        self.used_nonces.add(nonce)
        print("[REPLAY] Nonce accepted")
        return False

    def reset(self):
        """
        Clear stored nonces (for demo/testing).
        """
        self.used_nonces.clear()
        print("[REPLAY] Nonce cache cleared")
