from math import gcd
def encryption(plainText , a):
    if a == 0 or gcd(a, 26) != 1:
        raise ValueError(f"Invalid key 'a'={a}. It must be coprime with 26 and non-zero.")
    return "".join(chr(( (ord(c)-65 ) * a)% 26 +65) if c.isalpha() else c for c in plainText.upper())
def decryption(ciphertext , key):
    key_inv = mod_inverse(key, 26)
    plaintext = ""
    for char in ciphertext.upper():
        if char.isalpha():
            C = ord(char) - 65
            P = (C * key_inv) % 26
            plaintext += chr(P + 65)
        else:
            plaintext += char
    return plaintext
def hack_multiplicative(ciphertext):
    print("Trying all possible keys...\n")
    for key in range(1, 26):
        if gcd(key, 26) == 1: 
            try:
                decrypted = decryption(ciphertext, key)
                print(f"Key={key}: {decrypted}")
            except:
                pass
def mod_inverse(a, m):
    for x in range(1, m):
        if (a * x) % m == 1:
            return x
    return None
plaintext = "HELLO"
key = 3

ciphertext = encryption(plaintext, key)
print("Ciphertext:", ciphertext)
decrypted = decryption(ciphertext, key)
print("Decrypted:", decrypted)
hack_multiplicative(ciphertext)
