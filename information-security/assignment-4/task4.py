import secrets
import hashlib

def sha256_bytes(data: bytes) -> bytes:
    return hashlib.sha256(data).digest()

class LamportOTSKeyPair:
    def __init__(self):
        # 256 pairs of random 256-bit values
        self.private = [
            (secrets.token_bytes(32), secrets.token_bytes(32))
            for _ in range(256)
        ]
        self.public = [
            (sha256_bytes(p0), sha256_bytes(p1))
            for (p0, p1) in self.private
        ]
        self.used = False

    def sign(self, message: bytes):
        if self.used:
            raise Exception("Lamport OTS key already used (one-time only).")

        # Hash the message to 256 bits
        h = sha256_bytes(message)
        bits = ''.join(f"{b:08b}" for b in h)
        assert len(bits) == 256

        signature = []
        for i, bit in enumerate(bits):
            if bit == '0':
                signature.append(self.private[i][0])
            else:
                signature.append(self.private[i][1])

        self.used = True
        return signature

    @staticmethod
    def verify(message: bytes, signature, public_key) -> bool:
        # Check lengths
        if len(signature) != 256 or len(public_key) != 256:
            return False

        h = sha256_bytes(message)
        bits = ''.join(f"{b:08b}" for b in h)

        for i, bit in enumerate(bits):
            sig_val = signature[i]
            hashed = sha256_bytes(sig_val)
            if bit == '0':
                if hashed != public_key[i][0]:
                    return False
            else:
                if hashed != public_key[i][1]:
                    return False
        return True


def task4_ots_demo():
    print("=== Task 4: Lamport One-Time Signature ===")

    ots = LamportOTSKeyPair()
    msg = b"Lamport OTS is hash-based and quantum-resistant in principle."

    # 2. Sign
    signature = ots.sign(msg)
    print("Signature length (elements):", len(signature))

    # 3. Verify
    ok = LamportOTSKeyPair.verify(msg, signature, ots.public)
    print("Verification on correct message:", ok)

    # Tamper message
    tampered = b"Lamport OTS tampered message."
    ok_tampered = LamportOTSKeyPair.verify(tampered, signature, ots.public)
    print("Verification on tampered message:", ok_tampered)

    # 4. Show one-time nature
    try:
        ots.sign(b"Second message")
    except Exception as e:
        print("Re-use attempt failed as expected:", e)

    # 5. Compare security with DSA (textual)
    print("\nComparison with DSA:")
    print(" - Lamport OTS: large keys and signatures, hash-based, considered")
    print("   more suitable against quantum attacks. But key is ONE-TIME.")
    print(" - DSA: smaller keys/signatures, widely used, but based on")
    print("   discrete log assumptions (not quantum-safe).")


if __name__ == "__main__":
    task4_ots_demo()
