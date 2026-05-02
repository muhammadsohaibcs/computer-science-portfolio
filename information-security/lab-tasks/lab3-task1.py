import string
from math import gcd
dictionary = list(string.ascii_letters +string.digits)
m = len(dictionary)
def encryption(plainText , a , b ):
    if a == 0 or gcd(a, m) != 1:
        raise ValueError(f"Invalid 'a'={a}. Must be coprime with {m} and non-zero.")
    return "".join(dictionary[ (dictionary.index(c)  * a +b)% m ] if c.isalnum() else c for c in plainText)
def mod_inverse(a, m):
    for x in range(1, m):
        if (a * x) % m == 1:
            return x
    return None
def decryption(cipherText, a, b):
    if a == 0 or gcd(a, m) != 1:
        print("Check your keys.These cannot be keys")
    a_inv = mod_inverse(a, m)
    return "".join(
        dictionary[(a_inv * (dictionary.index(c) - b)) % m] if c.isalnum() else c
        for c in cipherText
    )

a = encryption("ASDtyui23" , 5,5)
print(decryption(a,5,5))
