from Crypto.Cipher import AES, DES
from Crypto.Random import get_random_bytes
import binascii

def pad(data, block):
    pad_len = block - (len(data) % block)
    return data + bytes([pad_len]) * pad_len

plaintext = b"This message is to compare AES and DES block sizes."

# AES ECB
aes_key = get_random_bytes(16)
aes_cipher = AES.new(aes_key, AES.MODE_ECB)
aes_ct = aes_cipher.encrypt(pad(plaintext, 16))

# DES ECB
des_key = get_random_bytes(8)
des_cipher = DES.new(des_key, DES.MODE_ECB)
des_ct = des_cipher.encrypt(pad(plaintext, 8))

print("AES Ciphertext (hex):", binascii.hexlify(aes_ct).decode())
print("AES Block Size: 128 bits")

print("\nDES Ciphertext (hex):", binascii.hexlify(des_ct).decode())
print("DES Block Size: 64 bits")

print("\n--- AES is More Secure Because ---")
print("1) AES uses 128-bit blocks, reducing repetition attacks.")
print("2) AES has stronger diffusion and substitution layers.")
print("3) AES resists modern cryptanalysis (differential/linear attacks).")
print("4) AES supports larger keys and faster secure hardware execution.")
