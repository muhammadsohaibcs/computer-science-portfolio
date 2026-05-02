from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
import binascii

# --- Helper functions ---
def caesar_cipher(text, shift=3):
    result = ""
    for ch in text:
        if 'A' <= ch <= 'Z':
            result += chr((ord(ch) - 65 + shift) % 26 + 65)
        elif 'a' <= ch <= 'z':
            result += chr((ord(ch) - 97 + shift) % 26 + 97)
        else:
            result += ch
    return result

def pkcs7_pad(data, block_size=16):
    pad_len = block_size - (len(data) % block_size)
    return data + bytes([pad_len]) * pad_len

def pkcs7_unpad(data):
    pad_len = data[-1]
    return data[:-pad_len]

# --- Step 1 to 4 ---
plaintext = input("Enter text to encrypt: ")

# Step 2: Caesar cipher
caesar_text = caesar_cipher(plaintext, 3)
print("After Caesar Shift (+3):", caesar_text)

# Step 3: AES CBC encryption
key = get_random_bytes(16)
iv = get_random_bytes(16)
cipher = AES.new(key, AES.MODE_CBC, iv)
ciphertext = cipher.encrypt(pkcs7_pad(caesar_text.encode()))

print("\nAES Key (hex):", binascii.hexlify(key).decode())
print("IV (hex):", binascii.hexlify(iv).decode())
print("Ciphertext (hex):", binascii.hexlify(ciphertext).decode())

# Step 4: Decrypt & verify
decipher = AES.new(key, AES.MODE_CBC, iv)
decrypted = pkcs7_unpad(decipher.decrypt(ciphertext)).decode()

# Reverse Caesar (-3)
def reverse_caesar(text, shift=3):
    return caesar_cipher(text, -shift)

recovered = reverse_caesar(decrypted)
print("\nDecrypted Caesar Output:", decrypted)
print("Recovered Original Text:", recovered)
