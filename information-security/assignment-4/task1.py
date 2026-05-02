from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP
from Crypto.Hash import SHA256

def task1_rsa_demo():
    # 1. Generate 1024-bit RSA key pair
    key = RSA.generate(1024)
    public_key = key.publickey()

    print("=== Task 1: RSA Implementation ===")
    print("Public key (PEM):")
    print(public_key.export_key().decode())
    print("-" * 40)

    # 2. Define at least 3 test messages
    messages = [
        b"Hello, this is message 1.",
        b"Information Security Lab RSA test.",
        b"PKI, DSA, and OTS will be used later."
    ]

    # 3 & 4. Encrypt and decrypt each message
    encryptor = PKCS1_OAEP.new(public_key, hashAlgo=SHA256)
    decryptor = PKCS1_OAEP.new(key, hashAlgo=SHA256)

    for i, m in enumerate(messages, start=1):
        ciphertext = encryptor.encrypt(m)
        plaintext = decryptor.decrypt(ciphertext)

        print(f"Message {i} original : {m}")
        print(f"Message {i} decrypted: {plaintext}")
        print(f"Match: {m == plaintext}")
        print("-" * 40)


if __name__ == "__main__":
    task1_rsa_demo()