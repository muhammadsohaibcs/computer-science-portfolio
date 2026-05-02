import secrets
from q1_diffie_hellman import modexp
from q3_elgamal import elgamal_keygen, elgamal_encrypt_integer, elgamal_decrypt_integer

def int_to_bytes(i):
    length = max(1, (i.bit_length() + 7) // 8)
    return i.to_bytes(length, 'big')

def hybrid_encrypt_per_char(message, KDH, p_elg, g_elg, h_elg):
    k_bytes = int_to_bytes(KDH)
    ciphertexts = []
    for i, ch in enumerate(message):
        m_byte = ord(ch)
        masked = m_byte ^ k_bytes[i % len(k_bytes)]
        c1, c2, k = elgamal_encrypt_integer(masked, p_elg, g_elg, h_elg)
        ciphertexts.append((c1, c2))
    return ciphertexts

def hybrid_decrypt_per_char(ciphertexts, x_elg, KDH, p_elg):
    k_bytes = int_to_bytes(KDH)
    chars = []
    for i, (c1, c2) in enumerate(ciphertexts):
        m_masked = elgamal_decrypt_integer(c1, c2, x_elg, p_elg)
        unmasked = m_masked ^ k_bytes[i % len(k_bytes)]
        chars.append(chr(unmasked))
    return ''.join(chars)

if __name__ == "__main__":
    # simulate DH
    p_dh, g_dh = 467, 2
    a_priv = secrets.randbelow(p_dh-3) + 2
    b_priv = secrets.randbelow(p_dh-3) + 2
    A_pub = modexp(g_dh, a_priv, p_dh)
    B_pub = modexp(g_dh, b_priv, p_dh)
    KDH_alice = modexp(B_pub, a_priv, p_dh)
    KDH_bob   = modexp(A_pub, b_priv, p_dh)
    # ElGamal keypair (use p=31847, g=5)
    p_elg, g_elg = 31847, 5
    x_elg, h_elg = elgamal_keygen(p_elg, g_elg)
    message = "HYBRID CRYPTO SYSTEM"
    cts = hybrid_encrypt_per_char(message, KDH_alice, p_elg, g_elg, h_elg)
    dec = hybrid_decrypt_per_char(cts, x_elg, KDH_bob, p_elg)
    print("Original message:", message)
    print("Decrypted message:", dec)
    print("Hybrid successful :", dec == message)
