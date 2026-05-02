import secrets

def modexp(base, exponent, modulus):
    result = 1 % modulus
    base = base % modulus
    e = exponent
    while e > 0:
        if e & 1:
            result = (result * base) % modulus
        base = (base * base) % modulus
        e >>= 1
    return result

def egcd(a, b):
    if b == 0:
        return (a, 1, 0)
    g, x1, y1 = egcd(b, a % b)
    return (g, y1, x1 - (a // b) * y1)

def modinv(a, m):
    g, x, y = egcd(a % m, m)
    if g != 1:
        raise ValueError("No modular inverse")
    return x % m

def elgamal_keygen(p, g):
    x = secrets.randbelow(p-3) + 2
    h = modexp(g, x, p)
    return x, h

def elgamal_encrypt_integer(m_int, p, g, h, k=None):
    if k is None:
        k = secrets.randbelow(p-3) + 2
    c1 = modexp(g, k, p)
    s = modexp(h, k, p)
    c2 = (m_int * s) % p
    return c1, c2, k

def elgamal_decrypt_integer(c1, c2, x, p):
    s = modexp(c1, x, p)
    s_inv = modinv(s, p)
    m = (c2 * s_inv) % p
    return m

# Per-character encrypt/decrypt helpers
def elgamal_encrypt_string(msg, p, g, h):
    ciphertexts = []
    for ch in msg:
        m = ord(ch)
        c1, c2, _ = elgamal_encrypt_integer(m, p, g, h)
        ciphertexts.append((c1, c2))
    return ciphertexts

def elgamal_decrypt_string(ciphertexts, x, p):
    chars = []
    for c1, c2 in ciphertexts:
        m = elgamal_decrypt_integer(c1, c2, x, p)
        chars.append(chr(m))
    return ''.join(chars)

if __name__ == "__main__":
    p, g = 31847, 5
    x, h = elgamal_keygen(p, g)
    msg = "RETREAT AT 0900"
    cts = elgamal_encrypt_string(msg, p, g, h)
    dec = elgamal_decrypt_string(cts, x, p)
    print("ElGamal public h:", h)
    print("Ciphertext (first 8 shown):", cts[:8])
    print("Decrypted message:", dec)
