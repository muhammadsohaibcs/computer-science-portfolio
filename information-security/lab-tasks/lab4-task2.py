from Crypto.Cipher import DES
from Crypto.Random import get_random_bytes
import binascii

def pad(data):
    pad_len = 8 - (len(data) % 8)
    return data + bytes([pad_len]) * pad_len

def unpad(data):
    return data[:-data[-1]]

def des_encrypt(key, data):
    cipher = DES.new(key, DES.MODE_ECB)
    return cipher.encrypt(pad(data))

def des_decrypt(key, data):
    cipher = DES.new(key, DES.MODE_ECB)
    return unpad(cipher.decrypt(data))

def double_des_encrypt(k1, k2, data):
    return des_encrypt(k2, des_encrypt(k1, data))

def double_des_decrypt(k1, k2, data):
    return des_decrypt(k1, des_decrypt(k2, data))

# Test
plaintext = b"Double DES Example!"
k1 = get_random_bytes(8)
k2 = get_random_bytes(8)

print("Plaintext:", plaintext)
ct = double_des_encrypt(k1, k2, plaintext)
print("Ciphertext (hex):", binascii.hexlify(ct).decode())

pt = double_des_decrypt(k1, k2, ct)
print("Decrypted:", pt)

# Test with K1 = K2
print("\n--- When K1 = K2 ---")
k = get_random_bytes(8)
ct_same = double_des_encrypt(k, k, plaintext)
ct_single = des_encrypt(k, plaintext)

print("Double DES (K1=K2):", binascii.hexlify(ct_same).decode())
print("Single DES:", binascii.hexlify(ct_single).decode())
print("Behaves like single DES:", ct_same == ct_single)
