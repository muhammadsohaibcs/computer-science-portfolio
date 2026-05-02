import secrets
from q3_elgamal import modexp, elgamal_encrypt_integer, elgamal_decrypt_integer, elgamal_keygen, modinv

def reused_k_attack(p, g, x, known_msg, unknown_msg):
    def int_from_bytes(b): return int.from_bytes(b, 'big')
    m1_int = int_from_bytes(known_msg.encode())
    m2_int = int_from_bytes(unknown_msg.encode())
    k = secrets.randbelow(p-3) + 2
    h = modexp(g, x, p)
    c1, c2, _ = elgamal_encrypt_integer(m1_int % p, p, g, h, k=k)
    c1b, c2b, _ = elgamal_encrypt_integer(m2_int % p, p, g, h, k=k)
    ratio = (c2 * modinv(c2b, p)) % p
    # attacker knowing m1 can recover m2 (mod p)
    recovered = (m1_int % p) * modinv(ratio, p) % p
    return (c1, c2, c1b, c2b, ratio, recovered, m2_int % p, k)

if __name__ == "__main__":
    p, g = 31847, 5
    x, h = elgamal_keygen(p, g)
    c1, c2, c1b, c2b, ratio, recovered, orig_m2_modp, k = reused_k_attack(p, g, x, "ATTACK", "DEFEND")
    print("--- ElGamal Reused k Attack ---")
    print("Detected : C1 values are identical !", c1 == c1b)
    print("Ciphertext 1:", (c1, c2))
    print("Ciphertext 2:", (c1b, c2b))
    print("Ratio C2/C2' :", ratio)
    print("Recovered message 2 (int mod p):", recovered)
    print("Original message2 int mod p     :", orig_m2_modp)
    print("k used :", k)
