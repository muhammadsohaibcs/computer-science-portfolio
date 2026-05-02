
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

def diffie_hellman(p, g):
    a = secrets.randbelow(p-3) + 2
    b = secrets.randbelow(p-3) + 2
    A = modexp(g, a, p)
    B = modexp(g, b, p)
    Ka = modexp(B, a, p)
    Kb = modexp(A, b, p)
    return a, A, b, B, Ka, Kb


if __name__ == "__main__":
    p, g = 467, 2
    a, A, b, B, Ka, Kb = diffie_hellman(p, g)
    print("Alice's private key :", a)
    print("Alice's public key  :", A)
    print("Bob's private key   :", b)
    print("Bob's public key    :", B)
    print("Alice's computed shared key :", Ka)
    print("Bob's computed shared key   :", Kb)
    print("Keys match :", Ka == Kb)
