"""
ElGamal Cryptography & Key Distribution Center (KDC)
===================================================

This module implements:
- ElGamal public key cryptosystem
- Key Distribution Center (KDC)

Purpose:
- Demonstrate asymmetric cryptography
- Securely distribute session keys
- Centralized trust model (CSC232 requirement)
"""

import secrets
from math import gcd


class ElGamalKeyPair:
    """
    Represents an ElGamal public-private key pair.
    """

    def __init__(self, p=467, g=2):
        self.p = p
        self.g = g
        self.private_key = secrets.randbelow(p - 2) + 2
        self.public_key = pow(g, self.private_key, p)

        print("[ELGAMAL] Key pair generated")

    def serialize(self):
        return {
            "p": self.p,
            "g": self.g,
            "private_key": self.private_key,
            "public_key": self.public_key
        }


class ElGamal:
    """
    Static ElGamal encryption and decryption.
    """

    @staticmethod
    def encrypt(message_int, public_key, p):
        k = secrets.randbelow(p - 2) + 1
        while gcd(k, p - 1) != 1:
            k = secrets.randbelow(p - 2) + 1

        c1 = pow(2, k, p)
        c2 = (message_int * pow(public_key, k, p)) % p

        print("[ELGAMAL] Message encrypted")
        return c1, c2

    @staticmethod
    def decrypt(ciphertext, private_key, p):
        c1, c2 = ciphertext
        s = pow(c1, private_key, p)
        s_inv = pow(s, -1, p)

        print("[ELGAMAL] Message decrypted")
        return (c2 * s_inv) % p


class KeyDistributionCenter:
    """
    Trusted Key Distribution Center (KDC).
    """

    def __init__(self):
        self.devices = {}
        print("[KDC] Key Distribution Center initialized")

    def register_device(self, device_id, key_pair):
        self.devices[device_id] = key_pair
        print(f"[KDC] Device registered: {device_id}")

    def is_registered(self, device_id):
        return device_id in self.devices

    def distribute_session_key(self, sender_id, receiver_id):
        """
        Distribute a symmetric session key securely.
        """
        if sender_id not in self.devices or receiver_id not in self.devices:
            raise ValueError("Device not registered with KDC")

        session_key = secrets.token_bytes(16)
        key_int = int.from_bytes(session_key, "big")

        sender_key = self.devices[sender_id]
        receiver_key = self.devices[receiver_id]

        encrypted_keys = {
            "sender": ElGamal.encrypt(key_int, sender_key.public_key, sender_key.p),
            "receiver": ElGamal.encrypt(key_int, receiver_key.public_key, receiver_key.p)
        }

        print("[KDC] Session key distributed")
        return encrypted_keys
