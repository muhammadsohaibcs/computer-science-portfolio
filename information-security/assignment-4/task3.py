
from Crypto.PublicKey import DSA
from Crypto.Signature import DSS
from Crypto.Hash import SHA256

def task3_dsa_demo():
    print("=== Task 3: Digital Signature Algorithm ===")

    # 1. Generate DSA keys
    dsa_key = DSA.generate(2048)
    dsa_pub = dsa_key.publickey()

    message_valid = b"DSA provides integrity and non-repudiation."
    message_invalid = b"This is a tampered message."

    # 2. Sign message with private key
    h_valid = SHA256.new(message_valid)
    signer = DSS.new(dsa_key, 'fips-186-3')
    signature = signer.sign(h_valid)

    print("Signature (hex):", signature.hex())

    # 3 & 4. Verify with valid and invalid messages
    verifier = DSS.new(dsa_pub, 'fips-186-3')

    # Valid case
    try:
        h = SHA256.new(message_valid)
        verifier.verify(h, signature)
        print("Valid message: signature is CORRECT.")
        valid_case = True
    except ValueError:
        print("Valid message: signature is INCORRECT.")
        valid_case = False

    # Invalid / tampered case
    try:
        h = SHA256.new(message_invalid)
        verifier.verify(h, signature)
        print("Tampered message: signature is (incorrectly) accepted!")
        invalid_case = False
    except ValueError:
        print("Tampered message: signature is REJECTED (as expected).")
        invalid_case = True

    # 5. Non-repudiation explanation
    print("\nNon-repudiation:")
    print("Only the holder of the DSA private key could have produced the")
    print("valid signature on the message. Because others only know the")
    print("public key, they cannot forge this signature.")
    print(f"Valid verify result:   {valid_case}")
    print(f"Tampered verify result:{invalid_case}")


if __name__ == "__main__":
    task3_dsa_demo()
