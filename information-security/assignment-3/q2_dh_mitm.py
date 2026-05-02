import secrets
from q1_diffie_hellman import modexp  

def mitm_attack(p, g):
    a = secrets.randbelow(p-3) + 2
    b = secrets.randbelow(p-3) + 2
    A_real = modexp(g, a, p)
    B_real = modexp(g, b, p)
    e1 = secrets.randbelow(p-3) + 2
    e2 = secrets.randbelow(p-3) + 2
    E1 = modexp(g, e1, p)
    E2 = modexp(g, e2, p)
    K_A = modexp(E1, a, p)
    K_B = modexp(E2, b, p)
    K_EA = modexp(A_real, e1, p)
    K_EB = modexp(B_real, e2, p)
    return K_A, K_B, K_EA, K_EB

if __name__ == "__main__":
    p, g = 467, 2
    KA, KB, KEA, KEB = mitm_attack(p, g)
    print("--- Man-in-the-Middle Attack ---")
    print("Alice's computed key :", KA)
    print("Bob's computed key   :", KB)
    print("Eve's key with Alice :", KEA)
    print("Eve's key with Bob   :", KEB)
    print("Attack successful :", KA != KB)
