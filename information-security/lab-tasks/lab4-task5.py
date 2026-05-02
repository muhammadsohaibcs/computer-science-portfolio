from Crypto.Cipher import AES, DES
from Crypto.Random import get_random_bytes
import binascii

def pad(data, block):
    pad_len = block - (len(data) % block)
    return data + bytes([pad_len]) * pad_len

def unpad(data):
    return data[:-data[-1]]

def flip_bit(data, index=0, bit=0):
    b = bytearray(data)
    b[index] ^= (1 << bit)
    return bytes(b)

plaintext = b"Bit flipping experiment example text!"

# AES-CBC
aes_key = get_random_bytes(16)
aes_iv = get_random_bytes(16)
aes_ct = AES.new(aes_key, AES.MODE_CBC, aes_iv).encrypt(pad(plaintext, 16))

# Flip 1 bit
aes_ct_flip = flip_bit(aes_ct, 0, 0)

# Decrypt
aes_dec = AES.new(aes_key, AES.MODE_CBC, aes_iv).decrypt(aes_ct)
aes_dec_flip = AES.new(aes_key, AES.MODE_CBC, aes_iv).decrypt(aes_ct_flip)

print("AES Original Decrypt:", unpad(aes_dec))
print("AES Flipped Decrypt :", aes_dec_flip[:48], "...")
print()

# DES-CBC
des_key = get_random_bytes(8)
des_iv = get_random_bytes(8)
des_ct = DES.new(des_key, DES.MODE_CBC, des_iv).encrypt(pad(plaintext, 8))
des_ct_flip = flip_bit(des_ct, 0, 0)

des_dec = DES.new(des_key, DES.MODE_CBC, des_iv).decrypt(des_ct)
des_dec_flip = DES.new(des_key, DES.MODE_CBC, des_iv).decrypt(des_ct_flip)

print("DES Original Decrypt:", unpad(des_dec))
print("DES Flipped Decrypt :", des_dec_flip[:48], "...")
print()

print("--- Explanation ---")
print("1) In CBC mode, flipping 1 bit corrupts the current plaintext block completely and flips 1 bit in the next block.")
print("2) AES uses 128-bit blocks, so corruption affects a larger portion than DES's 64-bit blocks.")
print("3) This shows CBC’s error propagation effect — errors spread to the next block as well.")
print("4) Thus, AES and DES behave differently mainly due to block size and mode structure.")
